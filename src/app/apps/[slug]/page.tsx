import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  FileArchive,
  PackageCheck,
  ShieldCheck,
  Star,
  Tags
} from "lucide-react";
import {
  appMetrics,
  filterCatalogApps,
  formatDate,
  getCatalogApp,
  getCatalogApps
} from "@/lib/catalog/catalog";
import { AppCard } from "@/components/marketing/app-card";
import { AppIcon } from "@/components/catalog/app-icon";
import { InstallButton } from "@/components/catalog/install-button";
import { ScreenshotCarousel } from "@/components/catalog/screenshot-carousel";
import { TopNav } from "@/components/layout/top-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = await getCatalogApp(slug);

  if (!app) {
    return {
      title: "App not found"
    };
  }

  return {
    title: app.name,
    description: app.summary ?? app.description
  };
}

export default async function AppDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = await getCatalogApp(slug);

  if (!app) {
    notFound();
  }

  const apps = await getCatalogApps();
  const similarApps = filterCatalogApps(apps, {
    category: app.categorySlug,
    sort: "rating"
  })
    .filter((item) => item.id !== app.id)
    .slice(0, 4);
  const metrics = appMetrics(app);
  const hasRating = app.rating !== null;
  const similarFallback = apps.filter((item) => item.id !== app.id).slice(0, 4);
  const relatedApps = similarApps.length ? similarApps : similarFallback;

  return (
    <div className="min-h-screen">
      <TopNav />
      <main>
        <section className="relative overflow-hidden border-b border-neutral-200 bg-white">
          <div className="mesh-hero absolute inset-x-0 top-0 h-64 opacity-75" />
          <div className="page-shell relative py-10">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft />
                Store
              </Link>
            </Button>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="flex flex-col gap-6 sm:flex-row">
                <AppIcon
                  name={app.name}
                  accent={app.accent}
                  src={app.iconUrl}
                  className="size-28 text-4xl"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {app.category.toUpperCase()}
                    </Badge>
                    <Badge variant="success">
                      <ShieldCheck className="mr-1 size-3" />
                      Published
                    </Badge>
                  </div>
                  <h1 className="mt-4 text-4xl font-semibold leading-none tracking-normal text-neutral-950 sm:text-5xl">
                    {app.name}
                  </h1>
                  <p className="mt-3 text-base text-neutral-600">
                    {app.developer}
                  </p>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
                    {app.summary ?? app.description}
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <InstallButton slug={app.slug} />
                    <Button variant="secondary" size="lg" asChild>
                      <Link href="/login">Add to wishlist</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>App info</CardTitle>
                  <CardDescription>
                    APK metadata for this release.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {[
                    { icon: Star, label: "Rating", value: hasRating ? `${metrics.rating} (${metrics.reviews})` : "No ratings" },
                    { icon: Download, label: "Downloads", value: metrics.downloads },
                    { icon: FileArchive, label: "Size", value: metrics.size },
                    { icon: CalendarDays, label: "Updated", value: formatDate(app.updatedAt) },
                    { icon: PackageCheck, label: "Version", value: app.version }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <item.icon className="size-4" />
                        {item.label}
                      </div>
                      <div className="text-sm font-medium text-neutral-950">{item.value}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="page-shell grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-8">
            <ScreenshotCarousel appName={app.name} screenshots={app.screenshots} />

            <Card>
              <CardHeader>
                <CardTitle>About this app</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="whitespace-pre-wrap text-base leading-8 text-neutral-600">
                  {app.description}
                </p>
                {app.tags.length ? (
                  <div className="flex flex-wrap gap-2">
                    {app.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        <Tags className="mr-1 size-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Version history</CardTitle>
                <CardDescription>
                  Current APK release notes and recent changes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-neutral-200">
                  <div className="flex items-center justify-between gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-950">
                        Version {app.version}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Updated {formatDate(app.updatedAt)}
                      </p>
                    </div>
                    <Badge variant="success">Latest</Badge>
                  </div>
                  {app.changelog.length ? (
                    <div className="grid gap-3 p-4">
                      {app.changelog.map((item) => (
                        <div key={item} className="flex gap-3 text-sm text-neutral-600">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-neutral-950" />
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="p-4 text-sm leading-6 text-neutral-600">
                      No release notes have been published for this version.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="grid h-fit gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Install flow</CardTitle>
                <CardDescription>
                  Downloads are routed through the store endpoint.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-neutral-600">
                  The install button logs a download event, then redirects to
                  the APK URL saved by the developer.
                </p>
                <Separator />
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Package</span>
                    <span className="break-all font-mono text-xs text-neutral-950">
                      {app.packageName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Source</span>
                    <span className="text-neutral-950">
                      {app.apkUrl ? "Configured" : "Missing"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                {hasRating ? (
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-semibold tracking-normal text-neutral-950">
                      {metrics.rating}
                    </span>
                    <div className="pb-2">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={
                              index < Math.round(app.rating ?? 0)
                                ? "size-4 fill-current"
                                : "size-4 text-neutral-300"
                            }
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        {metrics.reviews} reviews
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-neutral-600">
                    No users have rated this app yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>
        </section>

        {relatedApps.length ? (
          <section className="page-shell pb-16">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="mono-label">SIMILAR APPS</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-normal text-neutral-950">
                  More in {app.category}.
                </h2>
              </div>
              <Button variant="secondary" size="sm" asChild>
                <Link href={`/?category=${app.categorySlug}`}>
                  View category
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedApps.map((item) => (
                <AppCard key={item.id} app={item} compact />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
