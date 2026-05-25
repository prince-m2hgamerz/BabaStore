import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Download,
  Flag,
  Gauge,
  ShieldCheck,
  Users
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const { missingEnv } = await requireRole(["admin"]);
  const overview = await getAdminOverview();
  const queue = overview.apps.filter((app) => app.status === "draft" || app.status === "flagged");

  return (
    <DashboardShell
      section="admin"
      title="Dashboard"
      description="Review submitted apps, moderate publishing state, monitor users, and track platform usage."
    >
      <div className="grid gap-4 sm:gap-6">
        {missingEnv ? <EnvWarning /> : null}

        <div className="overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 p-4 text-white sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
                BabaStore Admin
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                Welcome back
              </h2>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-neutral-300">
                You have {queue.length} app{queue.length !== 1 ? "s" : ""} pending review.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  asChild
                  size="default"
                  className="rounded-full bg-white text-neutral-950 shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:bg-neutral-100"
                >
                  <Link href="/admin/queue">
                    <ClipboardCheck className="size-4" />
                    Open review queue
                    {queue.length > 0 ? (
                      <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1.5 text-[11px] font-semibold tabular-nums text-white">
                        {queue.length}
                      </span>
                    ) : null}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="default"
                  variant="ghost"
                  className="rounded-full border border-white/20 px-5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/admin/apps">All apps</Link>
                </Button>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start rounded-lg bg-white/10 px-4 py-2.5 text-sm backdrop-blur-sm">
              <Gauge className="size-4 text-emerald-400" />
              <span className="font-medium text-white">All systems nominal</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/admin/queue"
            className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30"
            aria-label="Open review queue"
          >
            <StatCard
              title="Review queue"
              value={formatDownloads(overview.stats.reviewQueue)}
              helper={`${overview.stats.flaggedApps} flagged · click to review`}
              icon={ShieldCheck}
            />
          </Link>
          <StatCard
            title="Published apps"
            value={formatDownloads(overview.stats.publishedApps)}
            helper={`${overview.stats.totalApps} total listings`}
            icon={CheckCircle2}
          />
          <StatCard
            title="Users"
            value={formatDownloads(overview.stats.totalUsers)}
            helper={`${overview.stats.developers} developers`}
            icon={Users}
          />
          <StatCard
            title="R2 storage"
            value={overview.stats.storageLabel}
            helper={`${formatDownloads(overview.stats.downloads)} downloads logged`}
            icon={Database}
          />
        </div>

        <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="mono-label">ANALYTICS</p>
                  <CardTitle className="mt-1 flex items-center gap-2">
                    <BarChart3 className="size-4" />
                    Last 7 days
                  </CardTitle>
                </div>
                <Link
                  href="/admin/reports"
                  className="hidden text-xs font-medium text-blue-600 hover:text-blue-700 sm:inline-flex sm:items-center sm:gap-1"
                >
                  Full report <ArrowRight className="size-3" />
                </Link>
              </div>
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
            <CardContent className="grid gap-2 text-sm">
              {[
                { label: "Rejected apps", value: overview.stats.rejectedApps, color: "text-red-600" },
                { label: "Reviews", value: overview.stats.reviews, color: "text-blue-600" },
                { label: "Admins", value: overview.stats.admins, color: "text-purple-600" }
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 bg-neutral-50/80 px-4 py-3"
                >
                  <span className="text-neutral-500">{item.label}</span>
                  <strong className={cn("text-lg font-semibold", item.color)}>
                    {item.value}
                  </strong>
                </div>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" className="w-full" asChild>
                  <Link href="/admin/settings">
                    <Database className="size-3.5" />
                    System health
                  </Link>
                </Button>
                <Button variant="secondary" size="sm" className="w-full" asChild>
                  <Link href="/admin/email">
                    <Users className="size-3.5" />
                    Email users
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mono-label">MODERATION</p>
              <CardTitle className="mt-1 flex items-center gap-2">
                Review queue
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {queue.length}
                </Badge>
              </CardTitle>
            </div>
            {queue.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-neutral-400 sm:inline">
                  {queue.length} app{queue.length !== 1 ? "s" : ""} pending
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {queue.length ? (
              <form action={moderateAppsAction} className="grid gap-4">
                <div className="hidden overflow-x-auto rounded-lg border border-neutral-200 lg:block">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
                      <tr>
                        <th className="p-3 pl-4">Select</th>
                        <th className="p-3">App</th>
                        <th className="p-3">Developer</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Updated</th>
                        <th className="p-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queue.map((app) => (
                        <tr key={app.id} className="border-t border-neutral-100 transition hover:bg-neutral-50/50">
                          <td className="p-3 pl-4">
                            <input
                              name="appIds"
                              type="checkbox"
                              value={app.id}
                              className="size-4 rounded border-neutral-300 text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-neutral-950">{app.name}</div>
                            <div className="mt-0.5 font-mono text-xs text-neutral-400">{app.package_name}</div>
                          </td>
                          <td className="p-3 text-neutral-600">
                            {app.developer?.username || app.developer?.email || "Developer"}
                          </td>
                          <td className="p-3">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="p-3 text-neutral-400">{formatDate(app.updated_at)}</td>
                          <td className="p-3 pr-4">
                            <div className="flex flex-wrap gap-1.5">
                              <Button
                                size="sm"
                                type="submit"
                                formAction={moderateSingleAppAction.bind(null, app.id, "published")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                type="submit"
                                formAction={moderateSingleAppAction.bind(null, app.id, "rejected")}
                              >
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
                    <div key={app.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                      <label className="flex items-start gap-3">
                        <input
                          name="appIds"
                          type="checkbox"
                          value={app.id}
                          className="mt-1 size-4 shrink-0 rounded border-neutral-300 text-primary focus:ring-primary"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="block truncate font-semibold text-neutral-950">
                              {app.name}
                            </span>
                            <StatusBadge status={app.status} />
                          </div>
                          <span className="mt-0.5 block truncate font-mono text-xs text-neutral-400">
                            {app.package_name}
                          </span>
                          <span className="mt-1 block truncate text-xs text-neutral-500">
                            {app.developer?.username || app.developer?.email || "Developer"}
                          </span>
                        </div>
                      </label>
                      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
                        <span className="text-xs text-neutral-400">
                          Updated {formatDate(app.updated_at)}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            type="submit"
                            formAction={moderateSingleAppAction.bind(null, app.id, "published")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            type="submit"
                            formAction={moderateSingleAppAction.bind(null, app.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button name="status" value="published" type="submit">
                    <CheckCircle2 className="size-4" />
                    Bulk approve
                  </Button>
                  <Button name="status" value="rejected" variant="secondary" type="submit">
                    <Flag className="size-4" />
                    Bulk reject
                  </Button>
                  <Button name="status" value="flagged" variant="secondary" type="submit">
                    Flag selected
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 p-6 text-center">
                <div className="max-w-sm">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-neutral-100">
                    <Download className="size-6 text-neutral-400" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-neutral-950">
                    All caught up
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                    Submitted and flagged apps appear here for review.
                  </p>
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
  const config: Record<string, { bg: string; text: string; label: string }> = {
    published: { bg: "bg-blue-50", text: "text-blue-700", label: "Published" },
    rejected: { bg: "bg-red-50", text: "text-red-700", label: "Rejected" },
    flagged: { bg: "bg-amber-50", text: "text-amber-700", label: "Flagged" }
  };
  const c = config[status] ?? { bg: "bg-neutral-50", text: "text-neutral-600", label: status };
  return (
    <span className={`inline-flex items-center rounded-full border border-current/10 px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
