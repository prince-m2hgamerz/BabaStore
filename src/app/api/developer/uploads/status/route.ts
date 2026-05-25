import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  isVirusTotalReady,
  lookupVirusTotalAnalysis,
  scanResultFromVirusTotalPayload
} from "@/lib/security/virustotal";

export async function GET(request: NextRequest) {
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

    const jobId = request.nextUrl.searchParams.get("jobId");
    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: row, error } = await supabase
      .from("upload_scans")
      .select("*")
      .eq("id", jobId)
      .maybeSingle();

    if (error || !row) {
      return NextResponse.json({ error: "Upload job not found." }, { status: 404 });
    }
    if (row.developer_id && row.developer_id !== profile.id && profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Terminal states — return cached row.
    if (row.virus_total_status === "clean") {
      return NextResponse.json({
        jobId: row.id,
        status: "clean",
        publicUrl: row.r2_url,
        sha256: row.sha256,
        size: row.file_size,
        scan: {
          status: "clean",
          source: row.virus_total_source ?? "hash",
          message: "VirusTotal analysis is clean.",
          stats: {
            harmless: row.harmless_count,
            malicious: row.malicious_count,
            suspicious: row.suspicious_count,
            undetected: row.undetected_count,
            timeout: row.timeout_count
          }
        }
      });
    }

    if (row.virus_total_status === "blocked") {
      // Non-blocking: file stays in R2, the form can still submit. The app will
      // land in admin review as "flagged" with the full VT report attached.
      return NextResponse.json({
        jobId: row.id,
        status: "flagged",
        publicUrl: row.r2_url,
        sha256: row.sha256,
        size: row.file_size,
        scan: {
          status: "blocked",
          source: row.virus_total_source ?? "upload",
          message:
            "VirusTotal flagged this APK. You can still submit — an admin will review the full report.",
          stats: {
            harmless: row.harmless_count,
            malicious: row.malicious_count,
            suspicious: row.suspicious_count,
            undetected: row.undetected_count,
            timeout: row.timeout_count
          }
        }
      });
    }

    // Still processing — poll VirusTotal.
    if (!isVirusTotalReady() || !row.virus_total_analysis_id) {
      return NextResponse.json({
        jobId: row.id,
        status: "processing",
        sha256: row.sha256,
        scan: {
          status: "processing",
          source: row.virus_total_source ?? "upload",
          message: "VirusTotal analysis pending.",
          retryAfterSeconds: 15,
          stats: {
            harmless: row.harmless_count,
            malicious: row.malicious_count,
            suspicious: row.suspicious_count,
            undetected: row.undetected_count,
            timeout: row.timeout_count
          }
        }
      });
    }

    const analysis = await lookupVirusTotalAnalysis(row.virus_total_analysis_id);
    const result = scanResultFromVirusTotalPayload({
      payload: analysis,
      sha256: row.sha256,
      source: "upload",
      analysisId: row.virus_total_analysis_id
    });

    if (result.status !== row.virus_total_status) {
      await supabase
        .from("upload_scans")
        .update({
          virus_total_status: result.status,
          malicious_count: result.stats.malicious,
          suspicious_count: result.stats.suspicious,
          harmless_count: result.stats.harmless,
          undetected_count: result.stats.undetected,
          timeout_count: result.stats.timeout
        })
        .eq("id", row.id);
    }

    return NextResponse.json({
      jobId: row.id,
      status: result.status,
      publicUrl: result.status === "clean" ? row.r2_url : undefined,
      sha256: row.sha256,
      size: row.file_size,
      scan: {
        status: result.status,
        source: row.virus_total_source ?? "upload",
        message: result.message,
        retryAfterSeconds: result.retryAfterSeconds ?? 12,
        stats: result.stats
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to read scan status."
      },
      { status: 500 }
    );
  }
}
