import { ArrowRight, Download, Users, CalendarDays, TrendingUp } from "lucide-react";
import Link from "next/link";
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
    <div className="grid gap-4">
      <header>
        <p className="mono-label">BabaStore</p>
        <h1 className="mt-0.5 text-xl font-semibold tracking-normal text-neutral-950 sm:text-3xl">
          Download analytics
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-600">
          Track install events, unique users, and trending apps across the platform.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <Download className="size-4" />
              Total downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-neutral-950">{formatDownloads(analytics.totalDownloads)}</div>
            <p className="mt-1 text-xs text-neutral-500">All time logged installs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <Users className="size-4" />
              Unique users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-neutral-950">{formatDownloads(analytics.uniqueDownloads)}</div>
            <p className="mt-1 text-xs text-neutral-500">Distinct user IDs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <CalendarDays className="size-4" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-neutral-950">{formatDownloads(analytics.todayDownloads)}</div>
            <p className="mt-1 text-xs text-neutral-500">Downloads since midnight</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <TrendingUp className="size-4" />
              This week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-neutral-950">{formatDownloads(analytics.weekDownloads)}</div>
            <p className="mt-1 text-xs text-neutral-500">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <p className="mono-label">TREND</p>
            <CardTitle className="mt-1">Daily downloads (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.dailyData.length ? (
              <div className="grid gap-1.5">
                {analytics.dailyData.map((day) => {
                  const maxDownloads = Math.max(...analytics.dailyData.map((d) => d.downloads), 1);
                  const pct = (day.downloads / maxDownloads) * 100;
                  return (
                    <div key={day.date} className="flex items-center gap-3 text-sm">
                      <span className="w-20 shrink-0 text-right text-xs text-neutral-500">{day.date}</span>
                      <div className="flex h-5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${Math.max(pct, 1)}%` }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right text-xs font-medium text-neutral-700">
                        {formatDownloads(day.downloads)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid min-h-40 place-items-center rounded-md border border-dashed border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
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
                    className="flex items-center gap-3 rounded-md border border-neutral-200 bg-white p-2.5 transition hover:bg-neutral-50"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-950">{app.appName}</p>
                      <p className="truncate text-xs text-neutral-500">{app.packageName}</p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-700">
                      {formatDownloads(app.downloads)}
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-neutral-300" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid min-h-40 place-items-center rounded-md border border-dashed border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
                No download data yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
