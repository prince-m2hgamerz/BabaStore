"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

type ScanResult = {
  status: "clean" | "blocked" | "processing";
  source: string | null;
  analysisId: string | null;
  sha256: string;
  fileName: string;
  fileSize: number | null;
  createdAt: string;
  stats: {
    malicious: number;
    suspicious: number;
    harmless: number;
    undetected: number;
    timeout: number;
    total: number;
    harmful: number;
  };
};

type Props = {
  appId: string;
  appName: string;
  initialScan?: {
    status: string;
    malicious: number;
    suspicious: number;
    total: number;
    createdAt: string;
  } | null;
  size?: "sm" | "default";
  variant?: "default" | "secondary" | "ghost";
};

function formatScanLabel(scan: { status: string; harmful: number; total: number }) {
  if (scan.status === "clean") return "Clean";
  if (scan.status === "blocked") return `${scan.harmful} flagged`;
  if (scan.status === "processing") return "Scanning…";
  return "Unknown";
}

export function ScanButton({
  appId,
  appName,
  initialScan,
  size = "sm",
  variant = "secondary"
}: Props) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [latest, setLatest] = useState<ScanResult | null>(null);

  const cachedHarmful = initialScan
    ? initialScan.malicious + initialScan.suspicious
    : 0;
  const display = latest
    ? {
        status: latest.status,
        harmful: latest.stats.harmful,
        total: latest.stats.total,
        createdAt: latest.createdAt
      }
    : initialScan
      ? {
          status: initialScan.status,
          harmful: cachedHarmful,
          total: initialScan.total,
          createdAt: initialScan.createdAt
        }
      : null;

  async function runScan(refresh: boolean) {
    setScanning(true);
    try {
      const response = await fetch("/api/admin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId, refresh })
      });
      const payload = (await response.json()) as
        | { scan: ScanResult; cached: boolean }
        | { error: string };
      if (!response.ok || "error" in payload) {
        const message = "error" in payload ? payload.error : "Scan failed.";
        toast({
          title: "VirusTotal scan failed",
          description: message,
          variant: "destructive"
        });
        return;
      }
      setLatest(payload.scan);
      const harmful = payload.scan.stats.harmful;
      toast({
        title:
          payload.scan.status === "clean"
            ? `${appName}: clean`
            : payload.scan.status === "blocked"
              ? `${appName}: ${harmful} engine${harmful === 1 ? "" : "s"} flagged`
              : `${appName}: scanning`,
        description: payload.cached
          ? "Returned the previous scan result."
          : payload.scan.status === "processing"
            ? "VirusTotal is still analysing this APK. Refresh in a minute."
            : `${payload.scan.stats.total} engines reported.`
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "VirusTotal scan failed",
        description:
          error instanceof Error ? error.message : "Network error.",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      {display ? (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            display.status === "clean"
              ? "bg-emerald-50 text-emerald-700"
              : display.status === "blocked"
                ? "bg-amber-50 text-amber-800"
                : display.status === "processing"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {display.status === "clean" ? (
            <ShieldCheck className="size-3" />
          ) : display.status === "blocked" ? (
            <ShieldAlert className="size-3" />
          ) : display.status === "processing" ? (
            <Clock3 className="size-3" />
          ) : (
            <ShieldQuestion className="size-3" />
          )}
          {formatScanLabel(display)}
        </span>
      ) : null}

      <Button
        size={size}
        variant={variant}
        onClick={() => runScan(!!display)}
        disabled={scanning}
        className="rounded-full"
      >
        {scanning ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : display ? (
          <RefreshCw className="size-3.5" />
        ) : (
          <CheckCircle2 className="size-3.5" />
        )}
        {scanning
          ? "Scanning…"
          : display
            ? "Re-scan"
            : "Scan with VirusTotal"}
      </Button>
    </div>
  );
}
