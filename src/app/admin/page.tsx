import { BarChart3, CheckCircle2, Database, Download, Flag, ShieldCheck, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/guards";
import { getAdminOverview } from "@/lib/admin/admin";
import { formatDate, formatDownloads } from "@/lib/catalog/catalog";
import { moderateAppsAction, moderateSingleAppAction } from "@/app/admin/actions";
import { AdminActivityChart } from "@/components/admin/admin-activity-chart";

export default async function AdminDashboardPage() {
  const { missingEnv } = await requireRole(["admin"]);
  const overview = await getAdminOverview();
  const queue = overview.apps.filter((app) => app.status === "draft" || app.status === "flagged");

  return (
    <DashboardShell
      section="admin"
      title="Admin Dashboard"
      description="Review submitted apps, moderate publishing state, monitor users, and track platform usage."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Review queue" value={formatDownloads(overview.stats.reviewQueue)} helper={`${overview.stats.flaggedApps} flagged apps`} icon={ShieldCheck} />
          <StatCard title="Published apps" value={formatDownloads(overview.stats.publishedApps)} helper={`${overview.stats.totalApps} total listings`} icon={CheckCircle2} />
          <StatCard title="Users" value={formatDownloads(overview.stats.totalUsers)} helper={`${overview.stats.developers} developers`} icon={Users} />
          <StatCard title="R2 storage" value={overview.stats.storageLabel} helper={`${formatDownloads(overview.stats.downloads)} downloads logged`} icon={Database} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <p className="mono-label">ANALYTICS</p>
              <CardTitle className="mt-1 flex items-center gap-2">
                <BarChart3 className="size-5" />
                Last 7 days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminActivityChart data={overview.chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="mono-label">SYSTEM</p>
              <CardTitle className="mt-1">Platform state</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <span className="text-neutral-500">Rejected apps</span>
                <strong>{overview.stats.rejectedApps}</strong>
              </div>
              <div className="flex justify-between gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <span className="text-neutral-500">Reviews</span>
                <strong>{overview.stats.reviews}</strong>
              </div>
              <div className="flex justify-between gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <span className="text-neutral-500">Admins</span>
                <strong>{overview.stats.admins}</strong>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <p className="mono-label">MODERATION</p>
              <CardTitle className="mt-1">Review queue</CardTitle>
            </div>
            <Badge variant="secondary">{queue.length} pending</Badge>
          </CardHeader>
          <CardContent>
            {queue.length ? (
              <form action={moderateAppsAction} className="grid gap-4">
                <div className="hidden overflow-x-auto rounded-md border border-neutral-200 lg:block">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
                      <tr>
                        <th className="p-3">Select</th>
                        <th className="p-3">App</th>
                        <th className="p-3">Developer</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Updated</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queue.map((app) => (
                        <tr key={app.id} className="border-t border-neutral-200">
                          <td className="p-3">
                            <input name="appIds" type="checkbox" value={app.id} />
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-neutral-950">{app.name}</div>
                            <div className="font-mono text-xs text-neutral-500">{app.package_name}</div>
                          </td>
                          <td className="p-3 text-neutral-600">{app.developer?.username || app.developer?.email || "Developer"}</td>
                          <td className="p-3"><StatusBadge status={app.status} /></td>
                          <td className="p-3 text-neutral-500">{formatDate(app.updated_at)}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" type="submit" formAction={moderateSingleAppAction.bind(null, app.id, "published")}>
                                Approve
                              </Button>
                              <Button size="sm" variant="secondary" type="submit" formAction={moderateSingleAppAction.bind(null, app.id, "rejected")}>
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid gap-3 lg:hidden">
                  {queue.map((app) => (
                    <div key={app.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                      <label className="flex min-w-0 items-start gap-3">
                        <input name="appIds" type="checkbox" value={app.id} className="mt-1" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-neutral-950">{app.name}</span>
                          <span className="block truncate font-mono text-xs text-neutral-500">{app.package_name}</span>
                          <span className="mt-1 block truncate text-xs text-neutral-500">
                            {app.developer?.username || app.developer?.email || "Developer"}
                          </span>
                        </span>
                        <StatusBadge status={app.status} />
                      </label>
                      <div className="mt-3 text-xs text-neutral-500">Updated {formatDate(app.updated_at)}</div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button size="sm" type="submit" formAction={moderateSingleAppAction.bind(null, app.id, "published")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="secondary" type="submit" formAction={moderateSingleAppAction.bind(null, app.id, "rejected")}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button name="status" value="published" type="submit">
                    <CheckCircle2 />
                    Bulk approve
                  </Button>
                  <Button name="status" value="rejected" variant="secondary" type="submit">
                    <Flag />
                    Bulk reject
                  </Button>
                  <Button name="status" value="flagged" variant="secondary" type="submit">
                    Flag selected
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid min-h-44 place-items-center rounded-md border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center">
                <div>
                  <Download className="mx-auto size-8 text-neutral-400" />
                  <h3 className="mt-4 text-base font-semibold text-neutral-950">No apps waiting</h3>
                  <p className="mt-2 text-sm text-neutral-500">Submitted and flagged apps appear here for review.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "published"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : status === "rejected"
        ? "border-red-200 bg-red-50 text-red-700"
        : status === "flagged"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-neutral-200 bg-neutral-50 text-neutral-600";

  return <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>{status}</span>;
}
