import Link from "next/link";
import { ArrowRight, Box, Download, PackagePlus, Search } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { StatusBadge } from "@/components/developer/status-badge";
import { AppIcon } from "@/components/catalog/app-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireRole } from "@/lib/auth/guards";
import { appMetrics, formatDate, formatDownloads } from "@/lib/catalog/catalog";
import { getDeveloperOverview } from "@/lib/developer/developer";

export const metadata = {
  title: "Developer Apps"
};

export default async function DeveloperAppsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { missingEnv, profile } = await requireRole(["developer", "admin"]);
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] : params.q;
  const overview = profile ? await getDeveloperOverview(profile.id, profile.role) : null;
  const apps = overview?.apps ?? [];
  const filteredApps = query
    ? apps.filter((app) =>
        [app.name, app.packageName, app.category, app.status]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : apps;

  return (
    <DashboardShell
      section="developer"
      title={profile?.role === "admin" ? "All Apps" : "My Apps"}
      description="Review listings, APK readiness, publishing state, and release metadata."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mono-label">APP INVENTORY</p>
              <CardTitle className="mt-1">{formatDownloads(filteredApps.length)} apps</CardTitle>
            </div>
            <Button asChild>
              <Link href="/developer/upload">
                <PackagePlus />
                Upload APK
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <form className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <Input
                name="q"
                defaultValue={query}
                className="pl-9"
                placeholder="Search by app, package, category, or status"
              />
            </form>
          </CardContent>
        </Card>

        {filteredApps.length ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredApps.map((app) => {
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
                <Link key={app.id} href={`/developer/apps/${app.id}`} className="block h-full">
                  <Card className="glass-hover h-full">
                    <CardContent className="grid h-full gap-4 p-4">
                      <div className="flex items-start gap-3">
                        <AppIcon
                          name={app.name}
                          accent="linear-gradient(135deg, #171717, #4d4d4d)"
                          src={app.iconUrl}
                          className="size-14 text-lg"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-neutral-950">
                              {app.name}
                            </h3>
                            <StatusBadge status={app.status} />
                          </div>
                          <p className="mt-1 truncate font-mono text-xs text-neutral-500">
                            {app.packageName}
                          </p>
                        </div>
                        <ArrowRight className="size-4 text-neutral-400" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-2">
                          <div className="text-sm font-semibold text-neutral-950">
                            {formatDownloads(app.downloads)}
                          </div>
                          <div className="text-xs text-neutral-500">Downloads</div>
                        </div>
                        <div className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-2">
                          <div className="text-sm font-semibold text-neutral-950">
                            {app.versionCount}
                          </div>
                          <div className="text-xs text-neutral-500">Versions</div>
                        </div>
                        <div className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-2">
                          <div className="text-sm font-semibold text-neutral-950">
                            {app.screenshots}
                          </div>
                          <div className="text-xs text-neutral-500">Shots</div>
                        </div>
                      </div>

                      <div className="grid gap-2 text-xs text-neutral-500">
                        <div className="flex justify-between gap-3">
                          <span>Category</span>
                          <span className="truncate text-neutral-950">{app.category}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span>Updated</span>
                          <span className="text-neutral-950">{formatDate(app.updatedAt)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span>APK size</span>
                          <span className="text-neutral-950">{metrics.size}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="grid min-h-72 place-items-center p-8 text-center">
              <div>
                <Box className="mx-auto size-9 text-neutral-400" />
                <h2 className="mt-4 text-xl font-semibold tracking-normal text-neutral-950">
                  No apps found
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
                  {apps.length
                    ? "No developer apps match the current search."
                    : "Upload an APK to create your first real app listing."}
                </p>
                <Button className="mt-5" asChild>
                  <Link href="/developer/upload">
                    <Download />
                    Upload APK
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
