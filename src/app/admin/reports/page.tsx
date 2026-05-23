import React from "react";
import { AlertTriangle, Database, Download, FileWarning, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getAdminOverview, getUploadScans } from "@/lib/admin/admin";
import { formatBytes, formatDate, formatDownloads } from "@/lib/catalog/catalog";

export const metadata = {
  title: "Admin Reports"
};

export default async function AdminReportsPage() {
  const { missingEnv } = await requireRole(["admin"]);
  const [overview, scans] = await Promise.all([getAdminOverview(), getUploadScans()]);
  const blockedScans = scans.filter((scan) => scan.virus_total_status !== "clean");
  const cleanScans = scans.filter((scan) => scan.virus_total_status === "clean");
  const apkScans = scans.filter((scan) => scan.folder === "apks");

  return (
    <DashboardShell
      section="admin"
      title="Reports"
      description="Review upload safety, storage usage, moderation state, and platform activity."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Clean scans" value={formatDownloads(cleanScans.length)} helper="Passed VirusTotal" icon={ShieldCheck} />
          <StatCard title="Blocked scans" value={formatDownloads(blockedScans.length)} helper="Malicious, suspicious, or processing" icon={AlertTriangle} />
          <StatCard title="APK scans" value={formatDownloads(apkScans.length)} helper="Release files scanned" icon={FileWarning} />
          <StatCard title="R2 storage" value={overview.stats.storageLabel} helper="APK bytes in versions" icon={Database} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader>
              <p className="mono-label">UPLOAD SECURITY</p>
              <CardTitle className="mt-1">Latest VirusTotal scans</CardTitle>
            </CardHeader>
            <CardContent>
              {scans.length ? (
                <div className="grid gap-3">
                  <div className="hidden overflow-x-auto rounded-md border border-neutral-200 lg:block">
                    <table className="w-full min-w-[860px] text-sm">
                      <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
                        <tr>
                          <th className="p-3">File</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Detections</th>
                          <th className="p-3">Size</th>
                          <th className="p-3">R2 key</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scans.map((scan) => (
                          <tr key={scan.id} className="border-t border-neutral-200">
                            <td className="p-3">
                              <div className="font-medium text-neutral-950">{scan.file_name}</div>
                              <div className="font-mono text-xs text-neutral-500">{scan.package_name ?? scan.folder}</div>
                            </td>
                            <td className="p-3">
                              <Badge variant={scan.virus_total_status === "clean" ? "success" : "destructive"}>
                                {scan.virus_total_status}
                              </Badge>
                            </td>
                            <td className="p-3 text-neutral-600">
                              {scan.malicious_count} malicious, {scan.suspicious_count} suspicious
                            </td>
                            <td className="p-3 text-neutral-500">{formatBytes(scan.file_size)}</td>
                            <td className="max-w-64 truncate p-3 font-mono text-xs text-neutral-500">
                              {scan.r2_key ?? "Not uploaded"}
                            </td>
                            <td className="p-3 text-neutral-500">{formatDate(scan.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="grid gap-3 lg:hidden">
                    {scans.map((scan) => (
                      <div key={scan.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                        <div className="flex min-w-0 items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-medium text-neutral-950">{scan.file_name}</div>
                            <div className="truncate font-mono text-xs text-neutral-500">{scan.package_name ?? scan.folder}</div>
                          </div>
                          <Badge variant={scan.virus_total_status === "clean" ? "success" : "destructive"} className="shrink-0">
                            {scan.virus_total_status}
                          </Badge>
                        </div>
                        <div className="mt-3 grid gap-2 text-xs text-neutral-500">
                          <div>{scan.malicious_count} malicious, {scan.suspicious_count} suspicious</div>
                          <div>Size: {formatBytes(scan.file_size)}</div>
                          <div className="break-all font-mono">R2: {scan.r2_key ?? "Not uploaded"}</div>
                          <div>Date: {formatDate(scan.created_at)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
                  No upload scan records yet. Records appear after the scan-and-upload API is used.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="mono-label">OPERATIONS</p>
              <CardTitle className="mt-1">Platform report</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              {[
                ["Downloads", formatDownloads(overview.stats.downloads), Download],
                ["Review queue", formatDownloads(overview.stats.reviewQueue), AlertTriangle],
                ["Flagged apps", formatDownloads(overview.stats.flaggedApps), FileWarning],
                ["Rejected apps", formatDownloads(overview.stats.rejectedApps), FileWarning]
              ].map((entry) => {
                const label = entry[0] as string;
                const value = entry[1] as string;
                const Icon = entry[2] as React.ElementType;
                return (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                    <span className="flex items-center gap-2 text-neutral-500">
                      <Icon className="size-4" />
                      {label}
                    </span>
                    <strong>{value}</strong>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
