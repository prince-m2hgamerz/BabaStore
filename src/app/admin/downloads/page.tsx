import { ArrowRight, Download, Users, CalendarDays, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getDownloadAnalytics } from "@/lib/admin/admin";
import { formatDownloads } from "@/lib/catalog/catalog";

export const metadata = {
  title: "Admin Downloads"
};

export default async function AdminDownloadsPage() {
  await requireRole(["admin"]);
  const analytics = await getDownloadAnalytics();

  return (
    <DashboardShell
      section="admin"
      title="Download Analytics"
      description="Track install events, unique users, and trending apps across the platform."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Total downloads", value: analytics.totalDownloads, helper: "All time logged installs", icon: Download },
          { title: "Unique users", value: analytics.uniqueDownloads, helper: "Distinct user IDs", icon: Users },
          { title: "Today", value: analytics.todayDownloads, helper: "Downloads since midnight", icon: CalendarDays },
          { title: "This week", value: analytics.weekDownloads, helper: "Last 7 days", icon: TrendingUp }
        ].map((m) => (
          <Card key={m.title} className="min-w-0 overflow-hidden transition-shadow hover:shadow-md">
            <div className="h-1 w-full bg-gradient-to-r from-primary/60 to-primary/30" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="min-w-0 truncate text-sm font-medium text-neutral-500">{m.title}</CardTitle>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <m.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="break-words text-2xl font-bold tracking-tight text-neutral-950">
                {formatDownloads(m.value)}
              </div>
              <p className="mt-1 text-xs leading-5 text-neutral-400">{m.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <p className="mono-label">TREND</p>
            <CardTitle className="mt-1 flex items-center gap-2">
              <BarChart3 className="size-4" />
              Daily downloads (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.dailyData.length ? (
              <div className="grid gap-1.5">
                {analytics.dailyData.map((day) => {
                  const maxDownloads = Math.max(...analytics.dailyData.map((d) => d.downloads), 1);
                  const pct = (day.downloads / maxDownloads) * 100;
                  return (
                    <div key={day.date} className="flex items-center gap-3 text-sm">
                      <span className="w-16 shrink-0 text-right text-xs text-neutral-400 sm:w-20">
                        {day.date}
                      </span>
                      <div className="flex h-5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${Math.max(pct, 1)}%` }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right text-xs font-medium text-neutral-600">
                        {formatDownloads(day.downloads)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 text-sm text-neutral-500">
                No download data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="mono-label">RANKINGS</p>
            <CardTitle className="mt-1">Top downloaded apps</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topApps.length ? (
              <div className="grid gap-2">
                {analytics.topApps.map((app, index) => (
                  <Link
                    key={app.appId}
                    href={`/admin/apps/${app.appId}`}
                    className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-2.5 transition hover:bg-neutral-50 hover:shadow-sm"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-950">{app.appName}</p>
                      <p className="truncate text-xs text-neutral-400">{app.packageName}</p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-700">
                      {formatDownloads(app.downloads)}
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-neutral-300" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 text-sm text-neutral-500">
                No download data yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
