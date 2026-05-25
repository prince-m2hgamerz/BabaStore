import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  Search,
  ShieldCheck,
  ShieldAlert,
  XCircle
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { requireRole } from "@/lib/auth/guards";
import { getAdminOverview } from "@/lib/admin/admin";
import { formatDate, formatDownloads } from "@/lib/catalog/catalog";
import { moderateAppsAction, moderateSingleAppAction } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type UploadScan = Database["public"]["Tables"]["upload_scans"]["Row"];

async function getAppScanMap(): Promise<Map<string, UploadScan[]>> {
  // upload_scans is typically RLS-restricted to the owning developer. Use the
  // service-role client so admins see scans across every developer.
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminClient()
    : await createClient();
  const { data } = await supabase
    .from("upload_scans")
    .select("*")
    .order("created_at", { ascending: false });

  const map = new Map<string, UploadScan[]>();
  (data ?? []).forEach((scan) => {
    if (!scan.package_name) return;
    if (!map.has(scan.package_name)) map.set(scan.package_name, []);
    map.get(scan.package_name)!.push(scan);
  });
  return map;
}

export const metadata = {
  title: "Admin Apps"
};

export default async function AdminAppsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { missingEnv } = await requireRole(["admin"]);
  const params = await searchParams;
  const overview = await getAdminOverview();
  const scanMap = await getAppScanMap();
  const query = String(Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "").toLowerCase();
  const status = String(Array.isArray(params.status) ? params.status[0] ?? "all" : params.status ?? "all");
  const filteredApps = overview.apps.filter((app) => {
    const matchesQuery =
      !query ||
      [app.name, app.package_name, app.developer?.email ?? "", app.developer?.username ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesStatus = status === "all" || app.status === status;
    return matchesQuery && matchesStatus;
  });
  const reviewQueue = overview.apps.filter((app) => app.status === "draft" || app.status === "flagged");
  const publishedApps = overview.apps.filter((app) => app.status === "published");
  const rejectedApps = overview.apps.filter((app) => app.status === "rejected");

  return (
    <DashboardShell
      section="admin"
      title="Apps"
      description="Review developer submissions, approve releases, and manage public visibility."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Queued" value={formatDownloads(reviewQueue.length)} helper="Waiting for review" icon={Clock3} />
          <StatCard title="Published" value={formatDownloads(publishedApps.length)} helper="Visible in the store" icon={CheckCircle2} />
          <StatCard title="Rejected" value={formatDownloads(rejectedApps.length)} helper="Blocked from public catalog" icon={XCircle} />
          <StatCard title="Downloads" value={formatDownloads(overview.stats.downloads)} helper="Logged install events" icon={Download} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <p className="mono-label">PUBLISH WORKFLOW</p>
              <CardTitle className="mt-1">Review pipeline</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-4">
              {[
                ["Submitted", overview.stats.reviewQueue, "Developer uploads and edits"],
                ["Approved", publishedApps.length, "Visible to users"],
                ["Flagged", overview.stats.flaggedApps, "Needs changes"],
                ["Rejected", rejectedApps.length, "Blocked from store"]
              ].map(([label, value, helper]) => (
                <div key={label} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-2xl font-semibold tracking-normal text-neutral-950">
                    {formatDownloads(Number(value))}
                  </div>
                  <div className="mt-1 text-sm font-medium text-neutral-700">{label}</div>
                  <div className="mt-1 text-xs leading-5 text-neutral-500">{helper}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <p className="mono-label">ADMIN CONTROL</p>
              <CardTitle className="mt-1">Release rules</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-neutral-600">
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                Developer uploads and version updates stay in review.
              </div>
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                Only approved apps are returned by the public catalog.
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mono-label">REVIEW TOOL</p>
              <CardTitle className="mt-1">App moderation</CardTitle>
            </div>
            <form action="/admin/apps" method="get" className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <Input name="q" defaultValue={query} className="pl-9" placeholder="Search apps" enterKeyHint="search" />
              </div>
              <Select name="status" defaultValue={status}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">In review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">Filter</Button>
            </form>
          </CardHeader>
          <CardContent>
            {filteredApps.length ? (
              <form action={moderateAppsAction} className="grid gap-4">
                <div className="hidden overflow-x-auto rounded-md border border-neutral-200 lg:block">
                  <table className="w-full min-w-[1080px] text-sm">
                    <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
                      <tr>
                        <th className="p-3">Select</th>
                        <th className="p-3">App</th>
                        <th className="p-3">Developer</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Security</th>
                        <th className="p-3">Version</th>
                        <th className="p-3">Updated</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApps.map((app) => {
                        const appScans = scanMap.get(app.package_name) ?? [];
                        const latestScan = appScans[0];
                        const scanClean = latestScan?.virus_total_status === "clean";
                        const scanBlocked = latestScan?.virus_total_status === "blocked";
                        const total = latestScan
                          ? latestScan.malicious_count + latestScan.suspicious_count + latestScan.harmless_count + latestScan.undetected_count + latestScan.timeout_count
                          : 0;
                        return (
                        <tr key={app.id} className="border-t border-neutral-200">
                          <td className="p-3">
                            <input name="appIds" type="checkbox" value={app.id} />
                          </td>
                          <td className="p-3">
                            <Link href={`/admin/apps/${app.id}`} className="font-medium text-neutral-950 hover:underline">
                              {app.name}
                            </Link>
                            <div className="font-mono text-xs text-neutral-500">{app.package_name}</div>
                            <div className="mt-1 text-xs text-neutral-500">{app.category?.name ?? "Uncategorized"}</div>
                          </td>
                          <td className="p-3 text-neutral-600">{app.developer?.username || app.developer?.email || "Developer"}</td>
                          <td className="p-3"><Badge variant={app.status === "published" ? "success" : app.status === "rejected" ? "destructive" : "warning"} className="capitalize">{app.status}</Badge></td>
                          <td className="p-3">
                            {latestScan ? (
                              <div className="flex items-center gap-1.5">
                                {scanClean ? <ShieldCheck className="size-3.5 text-green-600" /> : scanBlocked ? <ShieldAlert className="size-3.5 text-red-600" /> : <Clock3 className="size-3.5 text-amber-600" />}
                                <span className={`text-xs ${scanClean ? "text-green-700" : scanBlocked ? "text-red-700" : "text-amber-700"}`}>
                                  {scanClean ? "Clean" : scanBlocked ? `${latestScan.malicious_count}/${total}` : "Scanning"}
                                </span>
                                {scanClean && total ? <span className="text-[10px] text-neutral-400">{total} engines</span> : null}
                              </div>
                            ) : <span className="text-xs text-neutral-400">Not scanned</span>}
                          </td>
                          <td className="p-3 font-mono text-xs text-neutral-600">{app.version}</td>
                          <td className="p-3 text-neutral-500">{formatDate(app.updated_at)}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1.5">
                              <Button size="sm" type="submit" formAction={moderateSingleAppAction.bind(null, app.id, "published")}>
                                Approve
                              </Button>
                              <Button size="sm" variant="secondary" type="submit" formAction={moderateSingleAppAction.bind(null, app.id, "flagged")}>
                                Flag
                              </Button>
                              <Button size="sm" variant="secondary" type="submit" formAction={moderateSingleAppAction.bind(null, app.id, "draft")}>
                                Return
                              </Button>
                              <Button size="sm" variant="destructive" type="submit" formAction={moderateSingleAppAction.bind(null, app.id, "rejected")}>
                                Reject
                              </Button>
                              <Button size="sm" variant="ghost" asChild>
                                <Link href={`/admin/apps/${app.id}`}>
                                  Details
                                  <ArrowRight className="size-4" />
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                      </tbody>
                  </table>
                </div>
                <div className="grid gap-3 lg:hidden">
                  {filteredApps.map((app) => {
                    const appScans = scanMap.get(app.package_name) ?? [];
                    const latestScan = appScans[0];
                    const scanClean = latestScan?.virus_total_status === "clean";
                    const scanBlocked = latestScan?.virus_total_status === "blocked";
                    return (
                    <Card key={app.id}>
                      <CardContent className="grid gap-3 p-4">
                        <label className="flex items-start gap-3">
                          <input name="appIds" type="checkbox" value={app.id} className="mt-1" />
                          <span className="min-w-0">
                            <Link href={`/admin/apps/${app.id}`} className="block truncate font-medium text-neutral-950 hover:underline">
                              {app.name}
                            </Link>
                            <span className="block truncate font-mono text-xs text-neutral-500">{app.package_name}</span>
                            <span className="mt-1 block text-xs text-neutral-500">{app.category?.name ?? "Uncategorized"}</span>
                          </span>
                        </label>
                        <div className="grid grid-cols-3 gap-2 text-xs text-neutral-500">
                          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2">
                            <div>Status</div>
                            <Badge variant={app.status === "published" ? "success" : app.status === "rejected" ? "destructive" : "warning"} className="mt-1 capitalize">{app.status}</Badge>
                          </div>
                          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2">
                            <div>Security</div>
                            <div className="mt-1 font-medium text-neutral-950">
                              {latestScan ? (
                                scanClean ? "Clean" : scanBlocked ? `${latestScan.malicious_count} threats` : "Scanning"
                              ) : "Not scanned"}
                            </div>
                          </div>
                          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2">
                            <div>Updated</div>
                            <div className="mt-1 font-medium text-neutral-950">{formatDate(app.updated_at)}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" type="submit" formAction={moderateSingleAppAction.bind(null, app.id, "published")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="secondary" type="submit" formAction={moderateSingleAppAction.bind(null, app.id, "flagged")}>
                            Flag
                          </Button>
                          <Button size="sm" variant="secondary" type="submit" formAction={moderateSingleAppAction.bind(null, app.id, "draft")}>
                            Review
                          </Button>
                          <Button size="sm" variant="destructive" type="submit" formAction={moderateSingleAppAction.bind(null, app.id, "rejected")}>
                            Reject
                          </Button>
                        </div>
                        <Link
                          href={`/admin/apps/${app.id}`}
                          className="text-center text-sm text-blue-600 hover:underline"
                        >
                          View full details & scan report →
                        </Link>
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button name="status" value="published" type="submit">
                    <CheckCircle2 />
                    Bulk approve
                  </Button>
                  <Button name="status" value="flagged" variant="secondary" type="submit">
                    <AlertTriangle />
                    Bulk flag
                  </Button>
                  <Button name="status" value="draft" variant="secondary" type="submit">
                    Return to review
                  </Button>
                  <Button name="status" value="rejected" variant="destructive" type="submit">
                    Reject selected
                  </Button>
                </div>
              </form>
            ) : (
              <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
                No apps match the current filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
