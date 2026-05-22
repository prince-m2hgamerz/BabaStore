import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { isR2ApiReady, uploadR2ObjectViaCloudflareApi } from "@/lib/storage/r2";
import { androidPackageSchema } from "@/lib/validators/developer";
import {
  isVirusTotalReady,
  lookupVirusTotalAnalysis,
  scanFileWithVirusTotal,
  scanResultFromVirusTotalPayload,
  sha256Hex,
  type VirusTotalScanResult
} from "@/lib/security/virustotal";
import type { Database } from "@/lib/supabase/types";

const allowedFolders = new Set(["apks", "icons", "screenshots"] as const);

type UploadFolder = "apks" | "icons" | "screenshots";
type UploadScanRow = Database["public"]["Tables"]["upload_scans"]["Row"];

type UploadInput = {
  body: Buffer;
  contentType: string;
  fileName: string;
  fileSize: number;
  folder: UploadFolder;
  packageName: string;
};

function normalizeContentType(contentType: string | null, folder: UploadFolder) {
  const normalized = contentType?.split(";")[0]?.trim();

  if (normalized) {
    return normalized;
  }

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

async function readUploadInput(request: NextRequest): Promise<UploadInput> {
  const headerFolder = request.headers.get("x-upload-folder");

  if (headerFolder) {
    if (!allowedFolders.has(headerFolder as UploadFolder)) {
      throw new Error("Invalid upload folder.");
    }

    const folder = headerFolder as UploadFolder;
    const body = Buffer.from(await request.arrayBuffer());

    return {
      body,
      contentType: normalizeContentType(request.headers.get("content-type"), folder),
      fileName: safeDecode(request.headers.get("x-file-name"), "upload"),
      fileSize: body.byteLength,
      folder,
      packageName: request.headers.get("x-package-name") ?? ""
    };
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "");

  if (!(file instanceof File)) {
    throw new Error("Upload a valid file.");
  }

  if (!allowedFolders.has(folder as UploadFolder)) {
    throw new Error("Invalid upload folder.");
  }

  const uploadFolder = folder as UploadFolder;
  const body = Buffer.from(await file.arrayBuffer());

  return {
    body,
    contentType: normalizeContentType(file.type, uploadFolder),
    fileName: file.name,
    fileSize: file.size,
    folder: uploadFolder,
    packageName: String(formData.get("packageName") ?? "")
  };
}

async function getLatestUploadScan({
  developerId,
  folder,
  sha256
}: {
  developerId: string;
  folder: UploadFolder;
  sha256: string;
}) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("upload_scans")
      .select("*")
      .eq("developer_id", developerId)
      .eq("folder", folder)
      .eq("sha256", sha256)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) return null;
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

function storedScanToResult(scan: UploadScanRow): VirusTotalScanResult {
  const status =
    scan.virus_total_status === "clean" || scan.virus_total_status === "blocked"
      ? scan.virus_total_status
      : "processing";

  return {
    sha256: scan.sha256,
    status,
    source: scan.virus_total_source === "hash" ? "hash" : "upload",
    analysisId: scan.virus_total_analysis_id,
    stats: {
      harmless: scan.harmless_count,
      malicious: scan.malicious_count,
      suspicious: scan.suspicious_count,
      timeout: scan.timeout_count,
      undetected: scan.undetected_count
    },
    message:
      status === "clean"
        ? "VirusTotal analysis is clean."
        : status === "blocked"
          ? "VirusTotal detected malicious or suspicious engines."
          : "VirusTotal is still processing this file.",
    retryAfterSeconds: status === "processing" ? 15 : undefined
  };
}

async function saveUploadScan(input: {
  existingId?: string | null;
  developerId: string;
  upload: UploadInput;
  scan: VirusTotalScanResult;
  r2Key?: string | null;
  r2Bucket?: string | null;
  r2Url?: string | null;
}) {
  try {
    const supabase = await createClient();
    const payload = {
      developer_id: input.developerId,
      package_name: input.upload.packageName,
      folder: input.upload.folder,
      file_name: input.upload.fileName,
      file_type: input.upload.contentType,
      file_size: input.upload.fileSize,
      sha256: input.scan.sha256,
      virus_total_status: input.scan.status,
      virus_total_source: input.scan.source,
      virus_total_analysis_id: input.scan.analysisId,
      malicious_count: input.scan.stats.malicious,
      suspicious_count: input.scan.stats.suspicious,
      harmless_count: input.scan.stats.harmless,
      undetected_count: input.scan.stats.undetected,
      timeout_count: input.scan.stats.timeout,
      r2_bucket: input.r2Bucket ?? null,
      r2_key: input.r2Key ?? null,
      r2_url: input.r2Url ?? null
    };

    if (input.existingId) {
      await supabase.from("upload_scans").update(payload).eq("id", input.existingId);
      return;
    }

    await supabase.from("upload_scans").insert(payload);
  } catch {
    // Scan logging should not block clean uploads while migrations are being applied.
  }
}

function processingResponse(scan: VirusTotalScanResult) {
  return NextResponse.json(
    {
      error: scan.message,
      scan,
      retryAfterSeconds: scan.retryAfterSeconds ?? 15
    },
    { status: 202 }
  );
}

function blockedResponse(scan: VirusTotalScanResult) {
  return NextResponse.json(
    {
      error: scan.message,
      scan
    },
    { status: 422 }
  );
}

async function uploadCleanFile({
  developerId,
  existingScanId,
  scan,
  upload
}: {
  developerId: string;
  existingScanId?: string | null;
  scan: VirusTotalScanResult;
  upload: UploadInput;
}) {
  const r2Upload = await uploadR2ObjectViaCloudflareApi({
    developerId,
    fileName: upload.fileName,
    contentType: upload.contentType,
    folder: upload.folder,
    body: upload.body
  });

  await saveUploadScan({
    existingId: existingScanId,
    developerId,
    upload,
    scan,
    r2Key: r2Upload.key,
    r2Bucket: r2Upload.bucket,
    r2Url: r2Upload.publicUrl
  });

  return NextResponse.json({
    publicUrl: r2Upload.publicUrl,
    key: r2Upload.key,
    bucket: r2Upload.bucket,
    size: r2Upload.size,
    scan
  });
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

    if (!isVirusTotalReady()) {
      return NextResponse.json(
        { error: "VirusTotal API key is missing." },
        { status: 503 }
      );
    }

    const upload = await readUploadInput(request);
    const parsedPackage = androidPackageSchema.safeParse(upload.packageName);

    if (!parsedPackage.success) {
      return NextResponse.json(
        { error: parsedPackage.error.issues[0]?.message ?? "Invalid package name." },
        { status: 400 }
      );
    }

    if (!upload.body.byteLength) {
      return NextResponse.json({ error: "Upload a non-empty file." }, { status: 400 });
    }

    upload.packageName = parsedPackage.data;
    const fileHash = sha256Hex(upload.body);
    const existingScan = await getLatestUploadScan({
      developerId: profile.id,
      folder: upload.folder,
      sha256: fileHash
    });

    if (existingScan?.virus_total_status === "clean" && existingScan.r2_url) {
      return NextResponse.json({
        publicUrl: existingScan.r2_url,
        key: existingScan.r2_key,
        bucket: existingScan.r2_bucket,
        size: existingScan.file_size ?? upload.fileSize,
        scan: storedScanToResult(existingScan)
      });
    }

    if (existingScan?.virus_total_status === "blocked") {
      return blockedResponse(storedScanToResult(existingScan));
    }

    if (existingScan?.virus_total_status === "processing" && existingScan.virus_total_analysis_id) {
      const analysis = await lookupVirusTotalAnalysis(existingScan.virus_total_analysis_id);
      const scan = scanResultFromVirusTotalPayload({
        payload: analysis,
        sha256: fileHash,
        source: "upload",
        analysisId: existingScan.virus_total_analysis_id,
        processingMessage: "VirusTotal is still processing this file."
      });

      if (scan.status === "processing") {
        return processingResponse(scan);
      }

      if (scan.status === "blocked") {
        await saveUploadScan({
          existingId: existingScan.id,
          developerId: profile.id,
          upload,
          scan
        });
        return blockedResponse(scan);
      }

      return uploadCleanFile({
        developerId: profile.id,
        existingScanId: existingScan.id,
        scan,
        upload
      });
    }

    const scan = await scanFileWithVirusTotal({
      body: upload.body,
      fileName: upload.fileName,
      contentType: upload.contentType
    });

    if (scan.status === "processing") {
      await saveUploadScan({
        developerId: profile.id,
        upload,
        scan
      });
      return processingResponse(scan);
    }

    if (scan.status === "blocked") {
      await saveUploadScan({
        developerId: profile.id,
        upload,
        scan
      });
      return blockedResponse(scan);
    }

    return uploadCleanFile({
      developerId: profile.id,
      scan,
      upload
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to scan and upload file." },
      { status: 500 }
    );
  }
}
