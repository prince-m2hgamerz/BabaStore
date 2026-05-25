import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  isR2ApiReady,
  uploadR2ObjectViaCloudflareApi
} from "@/lib/storage/r2";
import { androidPackageSchema } from "@/lib/validators/developer";
import {
  isVirusTotalReady,
  scanFileWithVirusTotal,
  sha256Hex,
  type VirusTotalScanResult
} from "@/lib/security/virustotal";

export const maxDuration = 300;

const allowedFolders = new Set(["apks", "icons", "screenshots"] as const);
type UploadFolder = "apks" | "icons" | "screenshots";

function normalizeContentType(contentType: string | null, folder: UploadFolder) {
  const normalized = contentType?.split(";")[0]?.trim();
  if (normalized) return normalized;
  return folder === "apks"
    ? "application/vnd.android.package-archive"
    : "application/octet-stream";
}

function safeDecode(value: string | null, fallback: string) {
  if (!value) return fallback;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function statsFromScan(scan: VirusTotalScanResult) {
  return {
    harmless: scan.stats.harmless,
    malicious: scan.stats.malicious,
    suspicious: scan.stats.suspicious,
    timeout: scan.stats.timeout,
    undetected: scan.stats.undetected
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
    if (!profile || !["developer", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!isR2ApiReady()) {
      return NextResponse.json(
        { error: "Cloudflare R2 API environment variables are missing." },
        { status: 503 }
      );
    }

    const headerFolder = request.headers.get("x-upload-folder");
    if (!headerFolder || !allowedFolders.has(headerFolder as UploadFolder)) {
      return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 });
    }
    const folder = headerFolder as UploadFolder;
    const fileName = safeDecode(request.headers.get("x-file-name"), "upload");
    const contentType = normalizeContentType(
      request.headers.get("content-type"),
      folder
    );
    const parsedPackage = androidPackageSchema.safeParse(
      request.headers.get("x-package-name") ?? ""
    );
    if (!parsedPackage.success) {
      return NextResponse.json(
        {
          error:
            parsedPackage.error.issues[0]?.message ?? "Invalid package name."
        },
        { status: 400 }
      );
    }
    const packageName = parsedPackage.data;

    const body = Buffer.from(await request.arrayBuffer());
    if (!body.byteLength) {
      return NextResponse.json({ error: "Upload a non-empty file." }, { status: 400 });
    }

    const sha256 = sha256Hex(body);
    const supabase = await createClient();

    // Cache lookup — reuse a previous scan for the same hash
    const { data: cached } = await supabase
      .from("upload_scans")
      .select("*")
      .eq("developer_id", profile.id)
      .eq("folder", folder)
      .eq("sha256", sha256)
      .order("created_at", { ascending: false })
      .limit(1);
    const cachedRow = cached?.[0] ?? null;

    if (
      cachedRow?.virus_total_status === "clean" &&
      cachedRow.r2_url
    ) {
      return NextResponse.json({
        jobId: cachedRow.id,
        sha256,
        status: "clean",
        publicUrl: cachedRow.r2_url,
        size: cachedRow.file_size ?? body.byteLength,
        scan: {
          status: "clean",
          source: cachedRow.virus_total_source ?? "hash",
          message: "Cached clean scan reused.",
          stats: {
            harmless: cachedRow.harmless_count,
            malicious: cachedRow.malicious_count,
            suspicious: cachedRow.suspicious_count,
            undetected: cachedRow.undetected_count,
            timeout: cachedRow.timeout_count
          }
        }
      });
    }

    if (cachedRow?.virus_total_status === "blocked" && cachedRow.r2_url) {
      // VT previously flagged this hash. We DON'T block submission — the developer
      // can still attach the file and submit. The app will land in admin review
      // as "flagged" with the full VirusTotal report attached.
      return NextResponse.json({
        jobId: cachedRow.id,
        sha256,
        status: "flagged",
        publicUrl: cachedRow.r2_url,
        size: cachedRow.file_size ?? body.byteLength,
        scan: {
          status: "blocked",
          source: cachedRow.virus_total_source ?? "hash",
          message:
            "VirusTotal flagged this APK. You can still submit — an admin will review the full report.",
          stats: {
            harmless: cachedRow.harmless_count,
            malicious: cachedRow.malicious_count,
            suspicious: cachedRow.suspicious_count,
            undetected: cachedRow.undetected_count,
            timeout: cachedRow.timeout_count
          }
        }
      });
    }

    // Upload to R2 first so the file is durable even if scanning takes a while.
    const r2Upload = await uploadR2ObjectViaCloudflareApi({
      developerId: profile.id,
      fileName,
      contentType,
      folder,
      body
    });

    // Only scan APKs with VirusTotal (per spec — only APKs need malware checks).
    if (folder !== "apks") {
      const cleanScan: VirusTotalScanResult = {
        sha256,
        status: "clean",
        source: "hash",
        analysisId: null,
        stats: { harmless: 0, malicious: 0, suspicious: 0, timeout: 0, undetected: 0 },
        message: "Image asset — no malware scan required."
      };
      const insertPayload = {
        developer_id: profile.id,
        package_name: packageName,
        folder,
        file_name: fileName,
        file_type: contentType,
        file_size: body.byteLength,
        sha256,
        virus_total_status: cleanScan.status,
        virus_total_source: cleanScan.source,
        virus_total_analysis_id: cleanScan.analysisId,
        malicious_count: 0,
        suspicious_count: 0,
        harmless_count: 0,
        undetected_count: 0,
        timeout_count: 0,
        r2_bucket: r2Upload.bucket,
        r2_key: r2Upload.key,
        r2_url: r2Upload.publicUrl
      };

      const jobId = cachedRow?.id ?? null;
      let savedId = jobId;
      if (jobId) {
        await supabase.from("upload_scans").update(insertPayload).eq("id", jobId);
      } else {
        const { data: inserted } = await supabase
          .from("upload_scans")
          .insert(insertPayload)
          .select("id")
          .single();
        savedId = inserted?.id ?? null;
      }

      return NextResponse.json({
        jobId: savedId,
        sha256,
        status: "clean",
        publicUrl: r2Upload.publicUrl,
        size: r2Upload.size,
        scan: {
          status: "clean",
          source: "hash",
          message: cleanScan.message,
          stats: cleanScan.stats
        }
      });
    }

    if (!isVirusTotalReady()) {
      return NextResponse.json(
        { error: "VirusTotal API key is missing." },
        { status: 503 }
      );
    }

    const scan = await scanFileWithVirusTotal({ body, fileName, contentType });
    const insertPayload = {
      developer_id: profile.id,
      package_name: packageName,
      folder,
      file_name: fileName,
      file_type: contentType,
      file_size: body.byteLength,
      sha256,
      virus_total_status: scan.status,
      virus_total_source: scan.source,
      virus_total_analysis_id: scan.analysisId,
      malicious_count: scan.stats.malicious,
      suspicious_count: scan.stats.suspicious,
      harmless_count: scan.stats.harmless,
      undetected_count: scan.stats.undetected,
      timeout_count: scan.stats.timeout,
      r2_bucket: r2Upload.bucket,
      r2_key: r2Upload.key,
      r2_url: r2Upload.publicUrl
    };

    let jobId = cachedRow?.id ?? null;
    if (jobId) {
      await supabase.from("upload_scans").update(insertPayload).eq("id", jobId);
    } else {
      const { data: inserted } = await supabase
        .from("upload_scans")
        .insert(insertPayload)
        .select("id")
        .single();
      jobId = inserted?.id ?? null;
    }

    return NextResponse.json({
      jobId,
      sha256,
      // The dialog and form treat "flagged" as a non-blocking warning state —
      // the file IS attached and the listing CAN be submitted. Admin reviews it.
      status: scan.status === "blocked" ? "flagged" : scan.status,
      publicUrl:
        scan.status === "clean" || scan.status === "blocked"
          ? r2Upload.publicUrl
          : undefined,
      size: r2Upload.size,
      scan: {
        status: scan.status,
        source: scan.source,
        message:
          scan.status === "blocked"
            ? "VirusTotal flagged this APK. You can still submit — an admin will review the full report."
            : scan.message,
        analysisId: scan.analysisId,
        stats: statsFromScan(scan),
        retryAfterSeconds: scan.retryAfterSeconds ?? 12
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start upload and scan."
      },
      { status: 500 }
    );
  }
}
