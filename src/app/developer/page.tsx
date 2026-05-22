import Link from "next/link";
import { ArrowRight, BarChart3, Box, Download, PackageCheck, Star, UploadCloud } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { appMetrics, formatDate, formatDownloads } from "@/lib/catalog/catalog";
import { getDeveloperOverview } from "@/lib/developer/developer";
import { StatusBadge } from "@/components/developer/status-badge";

export default async function DeveloperDashboardPage() {
  const { missingEnv, profile } = await requireRole(["developer", "admin"]);
  const overview = profile
    ? await getDeveloperOverview(profile.id, profile.role)
    : {
        apps: [],
        recentVersions: [],
        totalApps: 0,
        totalDownloads: 0,
        publishedApps: 0,
        draftApps: 0,
        totalRatings: 0,
        averageRating: null
      };
  const latestApps = overview.apps.slice(0, 4);

  return (
    <DashboardShell
      section="developer"
      title="Developer Console"
      description="Manage Android app listings, APK versions, screenshots, and publishing state."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Apps"
            value={formatDownloads(overview.totalApps)}
            helper={`${overview.publishedApps} published, ${overview.draftApps} draft`}
            icon={PackageCheck}
          />
          <StatCard
            title="Downloads"
            value={formatDownloads(overview.totalDownloads)}
            helper="Logged from public APK installs"
            icon={Download}
          />
          <StatCard
            title="Average rating"
            value={overview.averageRating === null ? "No ratings" : overview.averageRating.toFixed(1)}
            helper={`${formatDownloads(overview.totalRatings)} ratings received`}
            icon={Star}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <p className="mono-label">MY APPS</p>
                <CardTitle className="mt-1">Latest listings</CardTitle>
              </div>
              <Button size="sm" asChild>
                <Link href="/developer/upload">
                  <UploadCloud />
                  Upload APK
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {latestApps.length ? (
                <div className="grid gap-3">
                  {latestApps.map((app) => (
                    <Link
                      key={app.id}
                      href={`/developer/apps/${app.id}`}
                      className="grid gap-3 rounded-md border border-neutral-200 bg-white p-3 transition hover:bg-neutral-50 sm:grid-cols-[1fr_auto] sm:items-center"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-neutral-950">{app.name}</h3>
                          <StatusBadge status={app.status} />
                        </div>
                        <p className="mt-1 truncate font-mono text-xs text-neutral-500">
                          {app.packageName}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-xs text-neutral-500 sm:justify-end">
                        <span>{formatDownloads(app.downloads)} downloads</span>
                        <ArrowRight className="size-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid min-h-48 place-items-center rounded-md border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center">
                  <div>
                    <Box className="mx-auto size-8 text-neutral-400" />
                    <h3 className="mt-4 text-base font-semibold text-neutral-950">No apps uploaded</h3>
                    <p className="mt-2 text-sm text-neutral-500">
                      Upload your first APK to create a real store listing.
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/developer/upload">Upload APK</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="mono-label">RELEASE ACTIVITY</p>
              <CardTitle className="mt-1">Recent versions</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.recentVersions.length ? (
                <div className="grid gap-3">
                  {overview.recentVersions.map((version) => (
                    <Link
                      key={version.id}
                      href={`/developer/apps/${version.app_id}`}
                      className="rounded-md border border-neutral-200 bg-white p-3 transition hover:bg-neutral-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="truncate text-sm font-semibold text-neutral-950">
                          {version.appName}
                        </h3>
                        <span className="font-mono text-xs text-neutral-500">
                          {version.version_name}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        {formatDate(version.created_at)}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid min-h-48 place-items-center rounded-md border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center">
                  <div>
                    <BarChart3 className="mx-auto size-8 text-neutral-400" />
                    <h3 className="mt-4 text-base font-semibold text-neutral-950">No versions yet</h3>
                    <p className="mt-2 text-sm text-neutral-500">
                      Version activity appears after APK uploads are saved.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <p className="mono-label">PUBLISH READINESS</p>
              <CardTitle className="mt-1">App readiness checklist</CardTitle>
            </div>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/developer/apps">
                Manage apps
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {overview.apps.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {overview.apps.slice(0, 8).map((app) => {
                  const metrics = appMetrics({
                    id: app.id,
                    slug: app.slug,
                    name: app.name,
                    developer: profile?.username ?? profile?.email ?? "Developer",
                    developerId: profile?.id ?? "",
                    packageName: app.packageName,
                    version: app.version,
                    category: app.category,
                    categorySlug: app.categorySlug,
                    summary: app.description,
                    description: app.description ?? "",
                    privacyPolicyUrl: app.privacyPolicyUrl,
                    rating: null,
                    reviews: 0,
                    downloads: app.downloads,
                    sizeBytes: app.sizeBytes,
                    updatedAt: app.updatedAt,
                    apkUrl: app.apkUrl,
                    iconUrl: app.iconUrl,
                    accent: "linear-gradient(135deg, #171717, #4d4d4d)",
                    tags: app.tags,
                    screenshots: [],
                    changelog: [],
                    status: app.status
                  });

                  return (
                    <Link
                      key={app.id}
                      href={`/developer/apps/${app.id}`}
                      className="rounded-md border border-neutral-200 bg-neutral-50 p-3 transition hover:bg-white"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold text-neutral-950">{app.name}</h3>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-neutral-500">
                        <div className="flex justify-between gap-2">
                          <span>APK</span>
                          <span className="text-neutral-950">{app.apkUrl ? "Ready" : "Missing"}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span>Screenshots</span>
                          <span className="text-neutral-950">{app.screenshots}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span>Size</span>
                          <span className="text-neutral-950">{metrics.size}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm leading-6 text-neutral-600">
                No developer apps exist for this account yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
