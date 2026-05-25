"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  X
} from "lucide-react";

export type UploadFolder = "apks" | "icons" | "screenshots";

export type UploadJobScan = {
  status: "clean" | "blocked" | "processing";
  source: string;
  message: string;
  analysisId?: string | null;
  retryAfterSeconds?: number;
  stats: {
    harmless: number;
    malicious: number;
    suspicious: number;
    undetected: number;
    timeout: number;
  };
};

export type UploadJob = {
  id: string;
  jobId?: string | null;
  folder: UploadFolder;
  fileName: string;
  fileSize: number;
  fileType: string;
  packageName: string;
  bytesUploaded: number;
  uploadDone: boolean;
  status: "queued" | "uploading" | "scanning" | "clean" | "flagged" | "blocked" | "error";
  publicUrl?: string;
  scan?: UploadJobScan;
  error?: string;
  startedAt: number;
  finishedAt?: number;
};

type Props = {
  open: boolean;
  jobs: UploadJob[];
  onClose: () => void;
  onRetry?: (jobId: string) => void;
};

function formatBytes(b?: number) {
  if (!b && b !== 0) return "0 B";
  const i = Math.floor(Math.log(Math.max(b, 1)) / Math.log(1024));
  const v = b / Math.pow(1024, i);
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${["B", "KB", "MB", "GB"][i] ?? "B"}`;
}

function StatusBadge({ status }: { status: UploadJob["status"] }) {
  const map = {
    queued: { color: "text-neutral-500 bg-neutral-100", label: "Queued" },
    uploading: { color: "text-blue-700 bg-blue-50", label: "Uploading" },
    scanning: { color: "text-amber-700 bg-amber-50", label: "Scanning" },
    clean: { color: "text-emerald-700 bg-emerald-50", label: "Clean" },
    flagged: { color: "text-amber-800 bg-amber-100", label: "Needs review" },
    blocked: { color: "text-red-700 bg-red-50", label: "Blocked" },
    error: { color: "text-red-700 bg-red-50", label: "Failed" }
  } as const;
  const c = map[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${c.color}`}
    >
      {c.label}
    </span>
  );
}

function StatusIcon({ status }: { status: UploadJob["status"] }) {
  if (status === "clean") return <ShieldCheck className="size-4 text-emerald-600" />;
  if (status === "flagged") return <ShieldAlert className="size-4 text-amber-600" />;
  if (status === "blocked") return <ShieldAlert className="size-4 text-red-600" />;
  if (status === "error") return <ShieldAlert className="size-4 text-red-600" />;
  if (status === "scanning") return <Clock className="size-4 text-amber-600" />;
  if (status === "uploading") return <Loader2 className="size-4 animate-spin text-blue-600" />;
  return <UploadCloud className="size-4 text-neutral-500" />;
}

export function UploadProgressDialog({ open, jobs, onClose, onRetry }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const summary = useMemo(() => {
    const total = jobs.length;
    const done = jobs.filter((j) => j.status === "clean").length;
    const failed = jobs.filter((j) => j.status === "blocked" || j.status === "error").length;
    const inFlight = jobs.filter(
      (j) => j.status === "uploading" || j.status === "scanning" || j.status === "queued"
    ).length;
    return { total, done, failed, inFlight };
  }, [jobs]);

  if (!open || jobs.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Upload progress"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 sm:inset-auto sm:bottom-4 sm:right-4 sm:left-auto sm:px-0 sm:pb-0"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-level-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-neutral-100 bg-canvas-soft px-4 py-3">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="min-w-0 flex-1 text-left transition hover:opacity-80"
          >
            <p className="text-[13px] font-semibold text-neutral-950">
              {summary.inFlight > 0
                ? `Uploading ${summary.inFlight} file${summary.inFlight === 1 ? "" : "s"}…`
                : summary.failed > 0
                  ? `${summary.failed} file${summary.failed === 1 ? "" : "s"} failed`
                  : `${summary.done} file${summary.done === 1 ? "" : "s"} ready`}
            </p>
            <p className="text-[11px] text-neutral-500">
              You can keep filling the form. Progress continues if you refresh.
            </p>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
            aria-label="Close upload panel"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        {!collapsed ? (
          <div className="max-h-[60vh] overflow-y-auto">
            {jobs.map((job) => {
              const pct =
                job.fileSize > 0
                  ? Math.min(100, Math.round((job.bytesUploaded / job.fileSize) * 100))
                  : job.uploadDone
                    ? 100
                    : 0;
              const stats = job.scan?.stats;
              const totalEngines = stats
                ? stats.harmless + stats.malicious + stats.suspicious + stats.undetected + stats.timeout
                : 0;

              return (
                <div key={job.id} className="border-b border-neutral-100 px-4 py-3 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <StatusIcon status={job.status} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-[13px] font-medium text-neutral-950">
                          {job.fileName}
                        </p>
                        <StatusBadge status={job.status} />
                      </div>
                      <p className="mt-0.5 text-[11px] text-neutral-500">
                        {formatBytes(job.fileSize)} ·{" "}
                        <span className="capitalize">{job.folder}</span>
                      </p>
                    </div>
                  </div>

                  {(job.status === "uploading" || job.status === "queued") && (
                    <div className="mt-2.5">
                      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-[width] duration-200"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
                        <span>{pct}%</span>
                        <span>
                          {formatBytes(job.bytesUploaded)} / {formatBytes(job.fileSize)}
                        </span>
                      </div>
                    </div>
                  )}

                  {job.status === "scanning" && job.folder === "apks" && (
                    <div className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[12px] text-amber-900">
                      <div className="flex items-center gap-2">
                        <Loader2 className="size-3.5 animate-spin" />
                        <span className="font-medium">VirusTotal scanning…</span>
                      </div>
                      <p className="mt-1 text-[11px]">
                        {totalEngines > 0
                          ? `${totalEngines} engines reported so far`
                          : "Waiting for first engine reports."}
                      </p>
                    </div>
                  )}

                  {job.status === "clean" && job.folder === "apks" && stats && totalEngines > 0 && (
                    <div className="mt-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                      <div className="flex items-center gap-2 text-[12px] text-emerald-900">
                        <CheckCircle2 className="size-3.5" />
                        <span className="font-medium">No threats detected</span>
                      </div>
                      <div className="mt-2 grid grid-cols-5 gap-1 text-center text-[10px]">
                        <Stat color="emerald" value={stats.harmless} label="clean" />
                        <Stat color="red" value={stats.malicious} label="malicious" />
                        <Stat color="amber" value={stats.suspicious} label="suspicious" />
                        <Stat color="neutral" value={stats.undetected} label="undetected" />
                        <Stat color="neutral" value={stats.timeout} label="timeout" />
                      </div>
                    </div>
                  )}

                  {job.status === "clean" && job.folder !== "apks" && (
                    <p className="mt-2 text-[12px] text-emerald-700">Stored in Cloudflare R2.</p>
                  )}

                  {job.status === "flagged" && stats && (
                    <div className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
                      <div className="flex items-center gap-2 text-[12px] text-amber-900">
                        <ShieldAlert className="size-3.5" />
                        <span className="font-medium">
                          {stats.malicious + stats.suspicious} engine
                          {stats.malicious + stats.suspicious === 1 ? "" : "s"} flagged this APK
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-5 text-amber-800">
                        The file is attached. You can still submit — an admin will
                        review the full report before approving.
                      </p>
                      <div className="mt-2 grid grid-cols-5 gap-1 text-center text-[10px]">
                        <Stat color="emerald" value={stats.harmless} label="clean" />
                        <Stat color="red" value={stats.malicious} label="malicious" />
                        <Stat color="amber" value={stats.suspicious} label="suspicious" />
                        <Stat color="neutral" value={stats.undetected} label="undetected" />
                        <Stat color="neutral" value={stats.timeout} label="timeout" />
                      </div>
                    </div>
                  )}

                  {job.status === "blocked" && stats && (
                    <div className="mt-2.5 rounded-lg border border-red-200 bg-red-50 p-2.5">
                      <div className="flex items-center gap-2 text-[12px] text-red-900">
                        <ShieldAlert className="size-3.5" />
                        <span className="font-medium">
                          {stats.malicious + stats.suspicious} engine
                          {stats.malicious + stats.suspicious === 1 ? "" : "s"} flagged this APK
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-red-700">
                        {job.scan?.message ?? "VirusTotal detected harmful behaviour."}
                      </p>
                      <div className="mt-2 grid grid-cols-5 gap-1 text-center text-[10px]">
                        <Stat color="emerald" value={stats.harmless} label="clean" />
                        <Stat color="red" value={stats.malicious} label="malicious" />
                        <Stat color="amber" value={stats.suspicious} label="suspicious" />
                        <Stat color="neutral" value={stats.undetected} label="undetected" />
                        <Stat color="neutral" value={stats.timeout} label="timeout" />
                      </div>
                    </div>
                  )}

                  {job.status === "error" && (
                    <div className="mt-2.5 rounded-lg border border-red-200 bg-red-50 p-2.5 text-[12px] text-red-800">
                      <p className="font-medium">Upload failed</p>
                      <p className="mt-0.5 text-[11px]">{job.error ?? "Unknown error."}</p>
                      {onRetry ? (
                        <button
                          type="button"
                          onClick={() => onRetry(job.id)}
                          className="mt-2 rounded-full border border-red-300 bg-white px-2.5 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
                        >
                          Retry
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Stat({
  color,
  value,
  label
}: {
  color: "emerald" | "red" | "amber" | "neutral";
  value: number;
  label: string;
}) {
  const ring =
    color === "emerald"
      ? "bg-emerald-100 text-emerald-800"
      : color === "red"
        ? "bg-red-100 text-red-800"
        : color === "amber"
          ? "bg-amber-100 text-amber-800"
          : "bg-neutral-100 text-neutral-700";
  return (
    <div className={`rounded p-1 ${ring}`}>
      <p className="text-[11px] font-semibold tabular-nums">{value}</p>
      <p className="text-[9px] uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}
