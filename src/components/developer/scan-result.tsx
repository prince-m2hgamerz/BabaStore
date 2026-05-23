import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type UploadScan = Database["public"]["Tables"]["upload_scans"]["Row"];

export function ScanResultBadge({ scan }: { scan: UploadScan }) {
  const isBlocked = scan.virus_total_status === "blocked";
  const isProcessing = scan.virus_total_status === "processing";

  if (isProcessing) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        <Clock className="size-3" />
        Scanning...
      </span>
    );
  }

  if (isBlocked) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        <ShieldAlert className="size-3" />
        {scan.malicious_count} threat{scan.malicious_count !== 1 ? "s" : ""} found
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
      <CheckCircle2 className="size-3" />
      Clean
    </span>
  );
}

export function ScanResultCard({ scan }: { scan: UploadScan }) {
  const isClean = scan.virus_total_status === "clean";
  const isBlocked = scan.virus_total_status === "blocked";
  const isProcessing = scan.virus_total_status === "processing";
  const total =
    (scan.harmless_count ?? 0) +
    (scan.malicious_count ?? 0) +
    (scan.suspicious_count ?? 0) +
    (scan.undetected_count ?? 0) +
    (scan.timeout_count ?? 0);

  return (
    <div className={`rounded-lg border p-4 ${isBlocked ? "border-red-200 bg-red-50" : isProcessing ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {isClean ? (
            <CheckCircle2 className="size-5 text-green-600" />
          ) : isBlocked ? (
            <AlertTriangle className="size-5 text-red-600" />
          ) : (
            <Clock className="size-5 text-amber-600" />
          )}
          <div>
            <p className="text-sm font-medium">
              {isClean
                ? "VirusTotal — Clean"
                : isBlocked
                  ? "VirusTotal — Threats detected"
                  : "VirusTotal — Scanning"}
            </p>
            <p className="text-xs text-neutral-500">
              {scan.file_name} &middot; {(scan.file_size ?? 0) > 0 ? `${(scan.file_size! / 1024 / 1024).toFixed(1)} MB` : "Unknown size"}
            </p>
          </div>
        </div>
        <ScanResultBadge scan={scan} />
      </div>

      {total > 0 ? (
        <div className="mt-3 grid grid-cols-5 gap-1 text-center text-xs">
          <div className="rounded bg-green-100 p-1.5">
            <p className="font-semibold text-green-700">{scan.harmless_count ?? 0}</p>
            <p className="text-green-600">Clean</p>
          </div>
          <div className="rounded bg-red-100 p-1.5">
            <p className="font-semibold text-red-700">{scan.malicious_count ?? 0}</p>
            <p className="text-red-600">Malicious</p>
          </div>
          <div className="rounded bg-amber-100 p-1.5">
            <p className="font-semibold text-amber-700">{scan.suspicious_count ?? 0}</p>
            <p className="text-amber-600">Suspicious</p>
          </div>
          <div className="rounded bg-neutral-100 p-1.5">
            <p className="font-semibold text-neutral-700">{scan.undetected_count ?? 0}</p>
            <p className="text-neutral-600">Undetected</p>
          </div>
          <div className="rounded bg-neutral-50 p-1.5">
            <p className="font-semibold text-neutral-500">{scan.timeout_count ?? 0}</p>
            <p className="text-neutral-400">Timeout</p>
          </div>
        </div>
      ) : null}

      {isProcessing ? (
        <p className="mt-2 text-xs text-amber-600">
          VirusTotal analysis in progress. Results will update automatically when complete.
        </p>
      ) : null}

      {scan.virus_total_source ? (
        <p className="mt-2 text-[10px] text-neutral-400">
          Source: {scan.virus_total_source === "hash" ? "Cached (same hash)" : "Fresh upload scan"}
          {scan.virus_total_analysis_id ? ` · ID: ${scan.virus_total_analysis_id.slice(0, 16)}...` : ""}
        </p>
      ) : null}
    </div>
  );
}
