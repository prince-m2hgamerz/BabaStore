import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Download,
  FileArchive,
  Globe,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Star,
  Tags
} from "lucide-react";
import {
  appMetrics,
  formatDate,
  getCatalogApp,
  getCatalogApps,
  getRelatedApps,
  getCatalogAssetProxy
} from "@/lib/catalog/catalog";
import { AppCard } from "@/components/marketing/app-card";
import { AppIcon } from "@/components/catalog/app-icon";
import { InstallButton } from "@/components/catalog/install-button";
import { WishlistButton } from "@/components/catalog/wishlist-button";
import { RatingForm } from "@/components/catalog/rating-form";
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
import { SiteFooter } from "@/components/layout/site-footer";

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
  const similarApps = await getRelatedApps(app, 4);
  const metrics = appMetrics(app);
  const hasRating = app.rating !== null;
  const similarFallback = apps.filter((item) => item.id !== app.id).slice(0, 4);
  const relatedApps = similarApps.length ? similarApps : similarFallback;
  const isLocalListing = app.source === "local";
  const versionItems = app.versions?.length
    ? app.versions
    : [
        {
          id: `${app.id}:${app.version}`,
          version: app.version,
          versionCode: null,
          sizeBytes: app.sizeBytes,
          updatedAt: app.updatedAt,
          apkUrl: app.apkUrl,
          malwareRank: app.malwareRank ?? null
        }
      ];
  const reviewItems = app.reviewItems ?? [];
  const iconFallback = getCatalogAssetProxy({ source: app.source, slug: app.slug, asset: "icon" });
  const screenshots = app.screenshots.map((screenshot, index) =>
    getCatalogAssetProxy({ source: app.source, slug: app.slug, asset: "screenshot", index }) ?? screenshot
  );

  return (
    <div className="min-h-screen">
      <TopNav />
      <main>
        <section className="relative overflow-hidden border-b border-neutral-200 bg-white">
          <div className="mesh-hero absolute inset-x-0 top-0 h-72 opacity-70" />
          <div className="page-shell relative pb-8 pt-3 sm:pb-10 sm:pt-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft />
                Store
              </Link>
            </Button>
            <div className="mt-4 grid min-w-0 gap-4 sm:mt-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <Card className="overflow-hidden shadow-float">
                <div className="relative h-24 border-b border-neutral-200 sm:h-36 lg:h-44" style={{ background: app.accent }}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.55),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.08))]" />
                </div>
                <CardContent className="grid gap-4 p-4 sm:p-6">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-5">
                    <AppIcon
                      name={app.name}
                      accent={app.accent}
                      src={app.iconUrl}
                      fallbackSrc={iconFallback}
                      className="size-16 text-2xl sm:size-24 lg:size-28"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <Badge variant="secondary" className="font-mono text-[10px] sm:text-xs">
                          {app.category.toUpperCase()}
                        </Badge>
                        <Badge variant={isLocalListing ? "success" : "secondary"} className="text-[10px] sm:text-xs">
                          <ShieldCheck className="mr-1 size-3" />
                          BabaStore verified
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          <BadgeCheck className="mr-1 size-3" />
                          Verified listing
                        </Badge>
                      </div>
                      <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-normal text-neutral-950 sm:mt-3 sm:text-4xl lg:text-5xl">
                        {app.name}
                      </h1>
                      <p className="mt-1 break-words text-sm text-neutral-600 sm:mt-2 sm:text-base">{app.developer}</p>
                      <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-neutral-600 [overflow-wrap:anywhere] sm:mt-4 sm:text-base sm:leading-7">
                        {app.summary ?? app.description}
                      </p>
                      <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row">
                        <InstallButton slug={app.slug} />
                        <WishlistButton appId={app.id} slug={app.slug} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
                    {[
                      { icon: Download, label: "Downloads", value: metrics.downloads },
                      { icon: Star, label: "Rating", value: hasRating ? metrics.rating : "No ratings" },
                      { icon: FileArchive, label: "Size", value: metrics.size },
                      { icon: PackageCheck, label: "Version", value: app.version }
                    ].map((item) => (
                      <div key={item.label} className="min-w-0 rounded-md border border-neutral-200 bg-neutral-50 p-2 sm:p-3">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-neutral-500 sm:gap-2 sm:text-xs">
                          <item.icon className="size-3 sm:size-4" />
                          {item.label}
                        </div>
                        <div className="mt-1 break-words text-sm font-semibold text-neutral-950 sm:mt-2 sm:text-lg">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid min-w-0 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>App details</CardTitle>
                    <CardDescription>Metadata and store trust signals.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {[
                      { icon: CalendarDays, label: "Updated", value: formatDate(app.updatedAt) },
                      { icon: Globe, label: "Package", value: app.packageName },
                      { icon: LockKeyhole, label: "APK", value: app.apkUrl ? "Ready" : "Missing" },
                      { icon: ShieldCheck, label: "Review state", value: "BabaStore verified" }
                    ].map((item) => (
                      <div key={item.label} className="flex min-w-0 items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <item.icon className="size-4" />
                          {item.label}
                        </div>
                        <div className="min-w-0 max-w-[60%] break-words text-right text-sm font-medium text-neutral-950 [overflow-wrap:anywhere]">{item.value}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trust cues</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm text-neutral-600">
                    {[
                      "Approved before appearing in the public store.",
                      "Downloads are routed through the BabaStore install endpoint.",
                      "Wishlist and rating actions stay tied to signed-in accounts."
                    ].map((item) => (
                      <div key={item} className="flex min-w-0 items-start gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-600" />
                        <span className="min-w-0 break-words">{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell grid min-w-0 gap-4 py-6 sm:gap-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
          <div className="grid min-w-0 gap-4 sm:gap-8">
            <ScreenshotCarousel appName={app.name} screenshots={screenshots} />

            <Card>
              <CardHeader>
                <CardTitle>About this app</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-neutral-600 [overflow-wrap:anywhere] sm:text-base sm:leading-8">
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
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium text-neutral-950 [overflow-wrap:anywhere]">
                        Version {app.version}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Updated {formatDate(app.updatedAt)}
                      </p>
                    </div>
                    <Badge variant="success">Latest</Badge>
                  </div>
                  {versionItems.length ? (
                    <div className="grid gap-3 p-4">
                      {versionItems.map((item) => (
                        <div key={item.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="break-words text-sm font-medium text-neutral-950 [overflow-wrap:anywhere]">
                                Version {item.version}
                              </p>
                              <p className="text-xs text-neutral-500">
                                Updated {formatDate(item.updatedAt)}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary">
                                {item.malwareRank ?? "Release"}
                              </Badge>
                              {item.apkUrl ? (
                                <Button variant="secondary" size="sm" asChild>
                                  <Link href={item.apkUrl} target="_blank" rel="noreferrer">
                                    Download
                                  </Link>
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : app.changelog.length ? (
                    <div className="grid gap-3 p-4">
                      {app.changelog.map((item) => (
                        <div key={item} className="flex min-w-0 gap-3 text-sm text-neutral-600">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-neutral-950" />
                          <span className="min-w-0 break-words [overflow-wrap:anywhere]">{item}</span>
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
                  Downloads are routed through the BabaStore endpoint.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-neutral-600">
                  The install button sends users through the BabaStore install route and streams the APK from the store endpoint.
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
                      {app.apkUrl ? "BabaStore" : "Missing"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ratings and reviews</CardTitle>
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
                {reviewItems.length ? (
                  <div className="mt-5 grid gap-3">
                    {reviewItems.slice(0, 4).map((item) => (
                      <div key={item.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
                        <div className="flex items-center justify-between gap-3">
                          <strong className="text-neutral-950">{item.author}</strong>
                          <span>{item.rating ?? "?"}/5</span>
                        </div>
                        {item.title ? <p className="mt-1 break-words font-medium text-neutral-950">{item.title}</p> : null}
                        {item.body ? <p className="mt-1 break-words leading-6">{item.body}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="mt-5 border-t border-neutral-200 pt-5">
                  <RatingForm appId={app.id} slug={app.slug} disabled={!isLocalListing} />
                </div>
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
      <SiteFooter />
    </div>
  );
}
