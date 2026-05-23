import { ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type UploadScan = Database["public"]["Tables"]["upload_scans"]["Row"];

export function ScanInfo({ scans }: { scans: UploadScan[] }) {
  const latestScan = scans[0];
  if (!latestScan) return <span className="text-xs text-neutral-400">No scan</span>;

  const isClean = latestScan.virus_total_status === "clean";
  const isBlocked = latestScan.virus_total_status === "blocked";

  return (
    <div className="flex items-center gap-1.5">
      {isClean ? (
        <ShieldCheck className="size-3.5 text-green-600" />
      ) : isBlocked ? (
        <ShieldAlert className="size-3.5 text-red-600" />
      ) : (
        <Clock className="size-3.5 text-amber-600" />
      )}
      <span className={`text-xs ${isClean ? "text-green-700" : isBlocked ? "text-red-700" : "text-amber-700"}`}>
        {isClean
          ? "Clean"
          : isBlocked
            ? `${latestScan.malicious_count} threat${latestScan.malicious_count !== 1 ? "s" : ""}`
            : "Scanning"}
      </span>
      {latestScan.malicious_count ? (
        <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
          {latestScan.malicious_count}
        </span>
      ) : null}
      {isClean && latestScan.harmless_count ? (
        <span className="text-[10px] text-neutral-400">
          {latestScan.harmless_count} engines
        </span>
      ) : null}
    </div>
  );
}
