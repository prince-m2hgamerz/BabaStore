import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/constants";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Download,
  FileArchive,
  Globe,
  PackageCheck,
  Share2,
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
import { AppTile } from "@/components/catalog/app-tile";
import { AppIcon } from "@/components/catalog/app-icon";
import { InstallButton } from "@/components/catalog/install-button";
import { WishlistButton } from "@/components/catalog/wishlist-button";
import { RatingForm } from "@/components/catalog/rating-form";
import { RatingHistogram } from "@/components/catalog/rating-histogram";
import { AboutApp } from "@/components/catalog/about-app";
import { ScreenshotCarousel } from "@/components/catalog/screenshot-carousel";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const siteUrl = siteConfig.url.replace(/\/$/, "");
  const appUrl = `${siteUrl}/apps/${app.slug}`;

  return {
    title: `${app.name} — ${app.developer}`,
    description: app.summary ?? app.description?.slice(0, 160),
    keywords: [app.category, app.developer, ...app.tags, "Android APK", "free download"],
    alternates: { canonical: appUrl },
    openGraph: {
      type: "website",
      title: `${app.name} — ${app.developer}`,
      description: app.summary ?? app.description?.slice(0, 160),
      url: appUrl
    },
    twitter: {
      card: "summary_large_image",
      title: `${app.name} — ${app.developer}`,
      description: app.summary ?? app.description?.slice(0, 160)
    }
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
  const similarApps = await getRelatedApps(app, 8);
  const metrics = appMetrics(app);
  const hasRating = app.rating !== null;
  const similarFallback = apps.filter((item) => item.id !== app.id).slice(0, 8);
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
  const screenshots = app.screenshots.map(
    (screenshot, index) =>
      getCatalogAssetProxy({ source: app.source, slug: app.slug, asset: "screenshot", index }) ??
      screenshot
  );

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.name,
    description: app.summary ?? app.description,
    url: `${siteConfig.url.replace(/\/$/, "")}/apps/${app.slug}`,
    applicationCategory: app.category,
    operatingSystem: "Android",
    author: {
      "@type": "Organization",
      name: app.developer
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    ...(app.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: app.rating,
            ratingCount: app.reviews
          }
        }
      : {}),
    ...(app.iconUrl ? { image: app.iconUrl } : {}),
    ...(app.apkUrl ? { fileSize: app.sizeBytes?.toString() } : {})
  };

  return (
    <div className="has-install-bar md:has-bottom-nav min-h-screen bg-canvas-soft">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <TopNav />
      <main>
        {/* Header — compact mobile layout, full desktop layout */}
        <section className="border-b border-neutral-200 bg-white">
          <div className="page-shell pb-4 pt-2 sm:pb-10 sm:pt-6">
            <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 h-8 sm:mb-5 sm:h-9">
              <Link href="/">
                <ArrowLeft />
                Back
              </Link>
            </Button>

            {/* Mobile: icon + title in a tight row, then meta line */}
            <div className="flex items-center gap-3 sm:hidden">
              <AppIcon
                name={app.name}
                accent={app.accent}
                src={app.iconUrl}
                fallbackSrc={iconFallback}
                lazy={false}
                className="size-[68px] text-2xl"
              />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[19px] font-semibold leading-tight tracking-[-0.4px] text-neutral-950">
                  {app.name}
                </h1>
                <p className="mt-0.5 truncate text-[13px] text-blue-600">
                  {app.developer}
                </p>
                <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-400">
                  {app.category}
                </p>
              </div>
            </div>

            {/* Mobile key stats row */}
            <div className="mt-4 grid grid-cols-3 divide-x divide-neutral-200 rounded-xl border border-neutral-200 bg-canvas-soft sm:hidden">
              <div className="flex flex-col items-center justify-center px-1 py-2.5">
                <div className="flex items-center gap-1 text-[13px] font-semibold text-neutral-950">
                  {hasRating ? metrics.rating : "—"}
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                </div>
                <p className="mt-0.5 text-[10px] text-neutral-500">
                  {hasRating ? `${metrics.reviews} reviews` : "No ratings"}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center px-1 py-2.5">
                <div className="text-[13px] font-semibold text-neutral-950">
                  {metrics.downloads}
                </div>
                <p className="mt-0.5 text-[10px] text-neutral-500">Downloads</p>
              </div>
              <div className="flex flex-col items-center justify-center px-1 py-2.5">
                <div className="text-[13px] font-semibold text-neutral-950">
                  {metrics.size}
                </div>
                <p className="mt-0.5 text-[10px] text-neutral-500">Size</p>
              </div>
            </div>

            {/* Desktop: roomy layout */}
            <div className="hidden flex-col gap-7 sm:flex sm:flex-row sm:items-start">
              <AppIcon
                name={app.name}
                accent={app.accent}
                src={app.iconUrl}
                fallbackSrc={iconFallback}
                lazy={false}
                className="size-[120px] text-4xl lg:size-[140px]"
              />
              <div className="min-w-0 flex-1">
                <h1 className="display-tight text-[36px] font-semibold leading-tight text-neutral-950 lg:text-[44px]">
                  {app.name}
                </h1>
                <p className="mt-1 text-[15px] text-blue-600 hover:underline">
                  {app.developer}
                </p>

                <div className="mt-5 grid max-w-2xl grid-cols-4 divide-x divide-neutral-200 rounded-xl border border-neutral-200 bg-canvas-soft">
                  <div className="flex flex-col items-center justify-center px-3 py-4">
                    <div className="flex items-center gap-1 text-[15px] font-semibold text-neutral-950">
                      {hasRating ? metrics.rating : "—"}
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    </div>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      {hasRating ? `${metrics.reviews} reviews` : "No ratings"}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center px-3 py-4">
                    <div className="text-[15px] font-semibold text-neutral-950">
                      {metrics.downloads}
                    </div>
                    <p className="mt-0.5 text-[11px] text-neutral-500">Downloads</p>
                  </div>
                  <div className="flex flex-col items-center justify-center px-3 py-4">
                    <div className="text-[15px] font-semibold text-neutral-950">
                      {metrics.size}
                    </div>
                    <p className="mt-0.5 text-[11px] text-neutral-500">Size</p>
                  </div>
                  <div className="flex flex-col items-center justify-center px-3 py-4">
                    <div className="text-[15px] font-semibold text-neutral-950">
                      {app.version}
                    </div>
                    <p className="mt-0.5 text-[11px] text-neutral-500">Version</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <InstallButton slug={app.slug} />
                  <WishlistButton appId={app.id} slug={app.slug} />
                  <Button variant="ghost" size="lg" className="rounded-full">
                    <Share2 />
                    Share
                  </Button>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {app.category.toUpperCase()}
                  </Badge>
                  <Badge variant="success" className="text-[10px]">
                    <ShieldCheck className="mr-1 size-3" />
                    Verified
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    <BadgeCheck className="mr-1 size-3" />
                    Editor reviewed
                  </Badge>
                  {app.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      <Tags className="mr-1 size-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile: trust badges row only — install button lives in the sticky bar */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:hidden">
              <Badge variant="success" className="text-[10px]">
                <ShieldCheck className="mr-1 size-3" />
                Verified
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                <BadgeCheck className="mr-1 size-3" />
                Editor reviewed
              </Badge>
              {app.tags.slice(0, 1).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  <Tags className="mr-1 size-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Screenshots */}
        <section className="page-shell pt-5 sm:pt-10">
          <ScreenshotCarousel appName={app.name} screenshots={screenshots} />
        </section>

        {/* About this app */}
        <section className="page-shell pt-6 sm:pt-12">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[16px] font-semibold tracking-[-0.4px] text-neutral-950 sm:text-[20px]">
                About this app
              </h2>
              <ChevronRight className="size-4 text-neutral-300 sm:size-5" aria-hidden />
            </div>
            {app.summary ? (
              <p className="mt-2 text-[13px] leading-6 text-neutral-600 sm:text-[15px]">
                {app.summary}
              </p>
            ) : null}
            <div className="mt-3 sm:mt-4">
              <AboutApp description={app.description ?? ""} />
            </div>
            {app.tags.length ? (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-3 sm:mt-5 sm:pt-4">
                {app.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/?q=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-neutral-200 bg-canvas-soft px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition hover:bg-white hover:text-neutral-950 sm:px-3 sm:text-[12px]"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {/* Data safety / app info */}
        <section className="page-shell pt-4 sm:pt-8">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
              <h3 className="text-[14px] font-semibold text-neutral-950 sm:text-[16px]">
                Data safety
              </h3>
              <p className="mt-1.5 text-[12px] leading-5 text-neutral-600 sm:mt-2 sm:text-[13px] sm:leading-6">
                BabaStore checks every published listing before it goes live.
              </p>
              <ul className="mt-3 grid gap-2 text-[12px] text-neutral-700 sm:mt-4 sm:gap-3 sm:text-[13px]">
                {[
                  "Approved before public release.",
                  "Downloads via signed URLs.",
                  "Wishlist and ratings tied to accounts."
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 sm:size-4" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
              <h3 className="text-[14px] font-semibold text-neutral-950 sm:text-[16px]">
                App info
              </h3>
              <dl className="mt-3 grid gap-2.5 text-[12px] sm:mt-4 sm:gap-3 sm:text-[13px]">
                {[
                  { icon: PackageCheck, label: "Version", value: app.version },
                  { icon: CalendarDays, label: "Updated", value: formatDate(app.updatedAt) },
                  { icon: FileArchive, label: "Size", value: metrics.size },
                  { icon: Globe, label: "Package", value: app.packageName },
                  { icon: Download, label: "Downloads", value: metrics.downloads }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-2.5 last:border-0 last:pb-0 sm:pb-3"
                  >
                    <span className="flex items-center gap-1.5 text-neutral-500 sm:gap-2">
                      <item.icon className="size-3 sm:size-3.5" />
                      {item.label}
                    </span>
                    <span className="min-w-0 max-w-[60%] truncate text-right font-medium text-neutral-950">
                      {item.value}
                    </span>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Ratings & reviews */}
        <section className="page-shell pt-6 sm:pt-12">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[16px] font-semibold tracking-[-0.4px] text-neutral-950 sm:text-[20px]">
                Ratings and reviews
              </h2>
              <ChevronRight className="size-4 text-neutral-300 sm:size-5" aria-hidden />
            </div>

            <div className="mt-4 sm:mt-5">
              <RatingHistogram rating={app.rating} total={app.reviews ?? 0} />
            </div>

            {reviewItems.length ? (
              <div className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-4">
                {reviewItems.slice(0, 4).map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-neutral-200 bg-canvas-soft p-3 sm:p-4"
                  >
                    <header className="flex items-center gap-2.5 sm:gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-white text-[13px] font-semibold text-neutral-700 sm:size-9 sm:text-sm">
                        {(item.author ?? "?").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium text-neutral-950 sm:text-[13px]">
                          {item.author ?? "Anonymous"}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-neutral-500 sm:text-[12px]">
                          <span className="stars">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={
                                  i < (item.rating ?? 0)
                                    ? "size-3 fill-current"
                                    : "size-3 text-neutral-300"
                                }
                              />
                            ))}
                          </span>
                          {item.createdAt ? <span>· {formatDate(item.createdAt)}</span> : null}
                        </div>
                      </div>
                    </header>
                    {item.title ? (
                      <p className="mt-2.5 text-[12px] font-medium text-neutral-950 sm:text-[13px]">
                        {item.title}
                      </p>
                    ) : null}
                    {item.body ? (
                      <p className="mt-1 line-clamp-4 text-[12px] leading-5 text-neutral-600 sm:line-clamp-5 sm:text-[13px] sm:leading-6">
                        {item.body}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-[12px] text-neutral-500 sm:text-[13px]">
                No reviews yet. Be the first to share what you think.
              </p>
            )}

            <div className="mt-6 border-t border-neutral-100 pt-4 sm:mt-7 sm:pt-5">
              <h3 className="text-[13px] font-semibold text-neutral-950 sm:text-[14px]">
                Rate this app
              </h3>
              <div className="mt-3 max-w-xl">
                <RatingForm appId={app.id} slug={app.slug} disabled={!isLocalListing} />
              </div>
            </div>
          </div>
        </section>

        {/* What's new */}
        <section className="page-shell pt-6 sm:pt-12">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-[16px] font-semibold tracking-[-0.4px] text-neutral-950 sm:text-[20px]">
                What&apos;s new
              </h2>
              <p className="text-[11px] text-neutral-500 sm:text-[12px]">
                v<span className="font-medium text-neutral-700">{app.version}</span> · {formatDate(app.updatedAt)}
              </p>
            </div>

            {app.changelog.length ? (
              <ul className="mt-3 grid gap-1.5 text-[12px] leading-6 text-neutral-700 sm:mt-4 sm:gap-2 sm:text-[13px]">
                {app.changelog.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-neutral-400" />
                    <span className="break-words [overflow-wrap:anywhere]">{line}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[12px] text-neutral-500 sm:text-[13px]">
                No release notes for this version.
              </p>
            )}

            {versionItems.length > 1 ? (
              <details className="group mt-4 sm:mt-5">
                <summary className="inline-flex cursor-pointer items-center gap-1 text-[12px] font-medium text-neutral-700 underline-offset-4 hover:underline sm:text-[13px]">
                  Older versions
                  <ChevronRight className="size-3 transition-transform group-open:rotate-90 sm:size-3.5" />
                </summary>
                <div className="mt-3 grid gap-2">
                  {versionItems.slice(1).map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-canvas-soft px-3 py-2 text-[12px] sm:text-[13px]"
                    >
                      <div>
                        <p className="font-medium text-neutral-950">v{item.version}</p>
                        <p className="text-[10px] text-neutral-500 sm:text-[11px]">
                          {formatDate(item.updatedAt)}
                        </p>
                      </div>
                      {item.apkUrl ? (
                        <Button variant="secondary" size="sm" asChild className="h-8 rounded-full">
                          <Link href={item.apkUrl} target="_blank" rel="noreferrer">
                            <Download />
                            Download
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        </section>

        {/* More like this */}
        {relatedApps.length ? (
          <section className="page-shell pb-8 pt-8 sm:pb-16 sm:pt-14">
            <div className="mb-2.5 flex items-end justify-between gap-3 sm:mb-4">
              <div>
                <p className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500 sm:block">
                  Similar
                </p>
                <h2 className="text-[15px] font-semibold tracking-[-0.3px] text-neutral-950 sm:mt-1 sm:text-[22px] sm:tracking-[-0.6px]">
                  More like this
                </h2>
              </div>
              <Link
                href={`/?category=${app.categorySlug}`}
                className="text-[12px] font-medium text-neutral-600 transition hover:text-neutral-950 sm:text-[13px]"
              >
                View all
              </Link>
            </div>
            <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 scrollbar-none sm:mx-0 sm:gap-4 sm:px-0">
              {relatedApps.map((item) => (
                <div key={item.id} className="snap-start">
                  <AppTile app={item} size="md" />
                </div>
              ))}
              <div className="w-2 shrink-0 sm:hidden" aria-hidden />
            </div>
          </section>
        ) : null}
      </main>

      {/* Sticky install bar — mobile only, sits ABOVE the bottom nav */}
      <div className="install-bar bottom-[64px]" style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }}>
        <div className="flex items-center gap-2.5">
          <AppIcon
            name={app.name}
            accent={app.accent}
            src={app.iconUrl}
            className="size-9"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-neutral-950">{app.name}</p>
            <p className="truncate text-[10px] text-neutral-500">
              {hasRating ? `${metrics.rating} ★ · ${metrics.size}` : metrics.size}
            </p>
          </div>
          <InstallButton slug={app.slug} size="default" className="h-9 px-4 text-[13px]" />
        </div>
      </div>

      <SiteFooter />
      <BottomNav />
    </div>
  );
}
