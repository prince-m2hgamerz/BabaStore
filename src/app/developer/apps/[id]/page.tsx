import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  ExternalLink,
  FileArchive,
  PackageCheck,
  ShieldCheck,
  Star
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { StatusBadge } from "@/components/developer/status-badge";
import { AppEditor } from "@/components/developer/app-editor";
import { DeleteAppCard } from "@/components/developer/delete-app-card";
import { VersionForm } from "@/components/developer/version-form";
import { AppIcon } from "@/components/catalog/app-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireRole } from "@/lib/auth/guards";
import { appMetrics, formatBytes, formatDate, formatDownloads } from "@/lib/catalog/catalog";
import { getDeveloperApp, getDeveloperOverview } from "@/lib/developer/developer";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { ScanResultCard } from "@/components/developer/scan-result";

type UploadScan = Database["public"]["Tables"]["upload_scans"]["Row"];

async function getAppScans(packageName: string): Promise<UploadScan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("upload_scans")
    .select("*")
    .eq("package_name", packageName)
    .eq("folder", "apks")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export const metadata = {
  title: "Manage App"
};

export default async function DeveloperAppPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { missingEnv, profile } = await requireRole(["developer", "admin"]);
  const app = profile ? await getDeveloperApp(profile.id, id, profile.role) : null;
  const overview = profile ? await getDeveloperOverview(profile.id, profile.role) : null;
  const appScans = app ? await getAppScans(app.packageName) : [];

  if (!app) {
    notFound();
  }

  const metrics = appMetrics({
    id: app.id,
    slug: app.slug,
    name: app.name,
    developer: app.developerName,
    developerId: profile?.id ?? "",
    packageName: app.packageName,
    version: app.version,
    category: app.category,
    categorySlug: app.categorySlug,
    summary: app.description,
    description: app.description ?? "",
    privacyPolicyUrl: app.privacyPolicyUrl,
    rating: app.averageRating,
    reviews: app.reviewCount,
    downloads: app.downloads,
    sizeBytes: app.latestVersion?.apk_size ?? null,
    updatedAt: app.updatedAt,
    apkUrl: app.apkUrl,
    iconUrl: app.iconUrl,
    accent: "linear-gradient(135deg, #171717, #4d4d4d)",
    tags: app.tags,
    screenshots: app.screenshotsUrls,
    changelog: [],
    status: app.status
  });

  return (
    <DashboardShell
      section="developer"
      title={app.name}
      description="Manage metadata, APK versions, public status, and preview readiness."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" size="sm" asChild className="w-fit">
            <Link href="/developer/apps">
              <ArrowLeft />
              Back to apps
            </Link>
          </Button>
          {app.status === "published" ? (
            <Button variant="secondary" size="sm" asChild className="w-fit">
              <Link href={`/apps/${app.slug}`} target="_blank">
                <ExternalLink />
                Public listing
              </Link>
            </Button>
          ) : null}
        </div>

        <Card>
          <CardContent className="grid gap-6 p-5 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col gap-4 sm:flex-row">
              <AppIcon
                name={app.name}
                accent="linear-gradient(135deg, #171717, #4d4d4d)"
                src={app.iconUrl}
                className="size-24 text-3xl"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={app.status} />
                  <Badge variant="secondary">{app.category}</Badge>
                </div>
                <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-normal text-neutral-950">
                  {app.name}
                </h2>
                <p className="mt-2 break-all font-mono text-xs text-neutral-500">
                  {app.packageName}
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
                  {app.description || "No description saved for this app."}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                { icon: Download, label: "Downloads", value: formatDownloads(app.downloads) },
                { icon: Star, label: "Rating", value: metrics.rating },
                { icon: FileArchive, label: "APK size", value: metrics.size },
                { icon: CalendarDays, label: "Updated", value: formatDate(app.updatedAt) },
                { icon: PackageCheck, label: "Version", value: app.version },
                { icon: ShieldCheck, label: "Screenshots", value: String(app.screenshots) }
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2"
                >
                  <span className="flex items-center gap-2 text-sm text-neutral-500">
                    <item.icon className="size-4" />
                    {item.label}
                  </span>
                  <span className="text-sm font-medium text-neutral-950">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="grid gap-4">
            <AppEditor app={app} categories={overview?.categories ?? []} />
            <VersionForm appId={app.id} packageName={app.packageName} />
          </div>

          <aside className="grid h-fit gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Version history</CardTitle>
                <CardDescription>APK files and release notes saved for this app.</CardDescription>
              </CardHeader>
              <CardContent>
                {app.versions.length ? (
                  <div className="grid gap-3">
                    {app.versions.map((version, index) => (
                      <div
                        key={version.id}
                        className="rounded-md border border-neutral-200 bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-neutral-950">
                                {version.version_name}
                              </h3>
                              {index === 0 ? <Badge variant="success">Latest</Badge> : null}
                            </div>
                            <p className="mt-1 text-xs text-neutral-500">
                              {formatDate(version.created_at)}
                            </p>
                          </div>
                          <span className="text-xs text-neutral-500">
                            {formatBytes(version.apk_size)}
                          </span>
                        </div>
                        {version.changelog ? (
                          <>
                            <Separator className="my-3" />
                            <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                              {version.changelog}
                            </p>
                          </>
                        ) : null}
                        {(() => {
                          const versionScan = appScans.find(
                            (s) => s.file_name?.includes(version.version_name) || s.file_name === `${app!.packageName}.apk`
                          );
                          return versionScan ? (
                            <div className="mt-3">
                              <ScanResultCard scan={versionScan} />
                            </div>
                          ) : null;
                        })()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-neutral-600">
                    No versions have been saved for this app.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview checklist</CardTitle>
                <CardDescription>Required public listing assets.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                {[
                  ["APK URL", Boolean(app.apkUrl)],
                  ["Description", Boolean(app.description)],
                  ["Icon", Boolean(app.iconUrl)],
                  ["Screenshots", app.screenshotsUrls.length > 0],
                  ["Privacy policy", Boolean(app.privacyPolicyUrl)]
                ].map(([label, ready]) => (
                  <div key={label as string} className="flex justify-between gap-3">
                    <span className="text-neutral-500">{label}</span>
                    <span className={ready ? "text-blue-700" : "text-neutral-950"}>
                      {ready ? "Ready" : "Missing"}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <DeleteAppCard appId={app.id} appName={app.name} />
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}
