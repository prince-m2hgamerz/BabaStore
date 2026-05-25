import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isVirusTotalReady,
  lookupVirusTotalAnalysis,
  scanFileWithVirusTotal,
  scanResultFromVirusTotalPayload,
  sha256Hex
} from "@/lib/security/virustotal";

export const maxDuration = 300;

const MAX_DOWNLOAD_BYTES = 650 * 1024 * 1024;

type ScanRequestBody = {
  appId: string;
  // when true, ignore any cached scan and run a fresh upload to VT
  refresh?: boolean;
};

function readableScanRow(row: {
  virus_total_status: string;
  virus_total_source: string | null;
  virus_total_analysis_id: string | null;
  malicious_count: number;
  suspicious_count: number;
  harmless_count: number;
  undetected_count: number;
  timeout_count: number;
  sha256: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
}) {
  const total =
    row.malicious_count +
    row.suspicious_count +
    row.harmless_count +
    row.undetected_count +
    row.timeout_count;
  const harmful = row.malicious_count + row.suspicious_count;
  return {
    status: row.virus_total_status,
    source: row.virus_total_source,
    analysisId: row.virus_total_analysis_id,
    sha256: row.sha256,
    fileName: row.file_name,
    fileSize: row.file_size,
    createdAt: row.created_at,
    stats: {
      malicious: row.malicious_count,
      suspicious: row.suspicious_count,
      harmless: row.harmless_count,
      undetected: row.undetected_count,
      timeout: row.timeout_count,
      total,
      harmful
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const { profile, missingEnv } = await getCurrentProfile();

    if (missingEnv) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 503 }
      );
    }
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!isVirusTotalReady()) {
      return NextResponse.json(
        { error: "VirusTotal API key is missing." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as ScanRequestBody;
    if (!body.appId) {
      return NextResponse.json({ error: "Missing appId." }, { status: 400 });
    }

    const supabase = await createClient();
    const adminSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : supabase;

    const { data: app } = await supabase
      .from("apps")
      .select("id, name, package_name, apk_url, developer_id")
      .eq("id", body.appId)
      .maybeSingle();

    if (!app) {
      return NextResponse.json({ error: "App not found." }, { status: 404 });
    }
    if (!app.apk_url) {
      return NextResponse.json(
        { error: "This app has no APK URL on file. Ask the developer to re-upload." },
        { status: 400 }
      );
    }

    // Reuse existing scan unless refresh=true
    if (!body.refresh) {
      const { data: existing } = await adminSupabase
        .from("upload_scans")
        .select("*")
        .eq("r2_url", app.apk_url)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing && existing.virus_total_status !== "processing") {
        return NextResponse.json({
          scanId: existing.id,
          appId: app.id,
          cached: true,
          scan: readableScanRow(existing)
        });
      }

      // If processing, poll VT once and update
      if (existing?.virus_total_status === "processing" && existing.virus_total_analysis_id) {
        try {
          const analysis = await lookupVirusTotalAnalysis(
            existing.virus_total_analysis_id
          );
          const result = scanResultFromVirusTotalPayload({
            payload: analysis,
            sha256: existing.sha256,
            source: "upload",
            analysisId: existing.virus_total_analysis_id
          });
          if (result.status !== "processing") {
            await adminSupabase
              .from("upload_scans")
              .update({
                virus_total_status: result.status,
                malicious_count: result.stats.malicious,
                suspicious_count: result.stats.suspicious,
                harmless_count: result.stats.harmless,
                undetected_count: result.stats.undetected,
                timeout_count: result.stats.timeout
              })
              .eq("id", existing.id);
          }
          return NextResponse.json({
            scanId: existing.id,
            appId: app.id,
            cached: false,
            scan: {
              ...readableScanRow(existing),
              status: result.status,
              stats: {
                ...readableScanRow(existing).stats,
                ...result.stats,
                total:
                  result.stats.malicious +
                  result.stats.suspicious +
                  result.stats.harmless +
                  result.stats.undetected +
                  result.stats.timeout,
                harmful: result.stats.malicious + result.stats.suspicious
              }
            }
          });
        } catch {
          // fall through to a fresh download+scan
        }
      }
    }

    // Download the APK from R2 and ship to VirusTotal
    const apkResponse = await fetch(app.apk_url);
    if (!apkResponse.ok) {
      return NextResponse.json(
        {
          error: `Could not download APK from R2 (HTTP ${apkResponse.status}).`
        },
        { status: 502 }
      );
    }
    const contentLength = Number(apkResponse.headers.get("content-length") ?? "0");
    if (contentLength && contentLength > MAX_DOWNLOAD_BYTES) {
      return NextResponse.json(
        { error: "APK is too large to scan via VirusTotal." },
        { status: 413 }
      );
    }
    const arrayBuffer = await apkResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.byteLength > MAX_DOWNLOAD_BYTES) {
      return NextResponse.json(
        { error: "APK is too large to scan via VirusTotal." },
        { status: 413 }
      );
    }

    const sha256 = sha256Hex(buffer);
    const fileName = `${app.package_name}.apk`;
    const contentType =
      apkResponse.headers.get("content-type") ??
      "application/vnd.android.package-archive";

    const scan = await scanFileWithVirusTotal({
      body: buffer,
      fileName,
      contentType
    });

    const insertPayload = {
      developer_id: app.developer_id,
      package_name: app.package_name,
      folder: "apks",
      file_name: fileName,
      file_type: contentType,
      file_size: buffer.byteLength,
      sha256,
      virus_total_status: scan.status,
      virus_total_source: scan.source,
      virus_total_analysis_id: scan.analysisId,
      malicious_count: scan.stats.malicious,
      suspicious_count: scan.stats.suspicious,
      harmless_count: scan.stats.harmless,
      undetected_count: scan.stats.undetected,
      timeout_count: scan.stats.timeout,
      r2_url: app.apk_url
    };

    let scanId: string | null = null;
    const { data: existingByHash } = await adminSupabase
      .from("upload_scans")
      .select("id")
      .eq("r2_url", app.apk_url)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingByHash?.id) {
      scanId = existingByHash.id;
      await adminSupabase
        .from("upload_scans")
        .update(insertPayload)
        .eq("id", scanId);
    } else {
      const { data: inserted } = await adminSupabase
        .from("upload_scans")
        .insert(insertPayload)
        .select("id")
        .single();
      scanId = inserted?.id ?? null;
    }

    revalidatePath(`/admin/apps/${app.id}`);
    revalidatePath(`/admin/queue`);
    revalidatePath(`/admin/apps`);

    const total =
      scan.stats.malicious +
      scan.stats.suspicious +
      scan.stats.harmless +
      scan.stats.undetected +
      scan.stats.timeout;
    return NextResponse.json({
      scanId,
      appId: app.id,
      cached: false,
      scan: {
        status: scan.status,
        source: scan.source,
        analysisId: scan.analysisId,
        sha256,
        fileName,
        fileSize: buffer.byteLength,
        createdAt: new Date().toISOString(),
        stats: {
          ...scan.stats,
          total,
          harmful: scan.stats.malicious + scan.stats.suspicious
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to run VirusTotal scan."
      },
      { status: 500 }
    );
  }
}
