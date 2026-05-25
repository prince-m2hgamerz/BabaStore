import Link from "next/link";
import {
  BadgeCheck,
  ChevronRight,
  Grid2X2,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from "lucide-react";
import {
  getCatalogApps,
  getCatalogResult,
  getCategories
} from "@/lib/catalog/catalog";
import type { CatalogFilters } from "@/lib/catalog/types";
import { CategoryStrip } from "@/components/catalog/category-strip";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { SearchSuggestions } from "@/components/catalog/search-suggestions";
import { AppRail } from "@/components/catalog/app-rail";
import { RankRow } from "@/components/catalog/rank-row";
import { StoreFilters } from "@/components/catalog/store-filters";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { FeaturedCarousel } from "@/components/marketing/featured-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tabs = [
  { label: "For you", value: "for-you" },
  { label: "Top charts", value: "top-charts" },
  { label: "Categories", value: "categories" },
  { label: "New", value: "new-releases" }
];

function getSearchValue(
  value: string | string[] | undefined,
  fallback?: string
) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  return value ?? fallback;
}

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters: CatalogFilters = {
    query: getSearchValue(params.q),
    category: getSearchValue(params.category, "all"),
    source: getSearchValue(params.source, "all") as CatalogFilters["source"],
    minRating: Number(getSearchValue(params.rating, "0")) || undefined,
    size: getSearchValue(params.size, "all") as CatalogFilters["size"],
    updated: getSearchValue(params.updated, "all") as CatalogFilters["updated"],
    sort: getSearchValue(params.sort, "featured") as CatalogFilters["sort"]
  };
  const [catalogResult, categories, publishedLocalApps] = await Promise.all([
    getCatalogResult({
      ...filters,
      limit: 48,
      offset: 0
    }),
    getCategories(),
    getCatalogApps({
      source: "local",
      sort: "newest",
      limit: 8
    })
  ]);
  const apps = catalogResult.apps;
  const activeTab = getSearchValue(params.tab, "for-you");

  const topChartApps = apps
    .slice()
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 10);
  const newReleaseApps = apps
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 10);
  const editorsPick = apps
    .filter((a) => a.rating && a.rating >= 4)
    .slice(0, 10);
  const trendingApps = apps
    .slice()
    .sort((a, b) => (b.rating ?? 0) * (b.reviews ?? 1) - (a.rating ?? 0) * (a.reviews ?? 1))
    .slice(0, 10);
  const featuredApps = publishedLocalApps.length
    ? publishedLocalApps
    : apps.slice(0, Math.min(5, apps.length));

  return (
    <div className="has-bottom-nav min-h-screen bg-canvas-soft">
      <TopNav searchQuery={filters.query} tabs={tabs} activeTab={activeTab} />
      <main>
        {/* Hero band */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[300px] mesh-soft opacity-80 sm:h-[460px] sm:opacity-90"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[260px] -z-0 h-24 bg-gradient-to-b from-transparent to-canvas-soft sm:top-[400px] sm:h-32"
          />
          <div className="page-shell relative pb-2 pt-3 sm:pb-6 sm:pt-10">
            {featuredApps.length ? (
              <div className="grid gap-4 sm:gap-8">
                <div className="hidden flex-col gap-3 sm:flex">
                  <p className="section-eyebrow">Android marketplace</p>
                  <h1 className="display-tight max-w-3xl text-[36px] font-semibold leading-[1.05] text-neutral-950 sm:text-[48px] sm:leading-[1.02]">
                    Discover Android apps,
                    <br />
                    <span className="text-neutral-500">directly.</span>
                  </h1>
                  <p className="max-w-xl text-[15px] leading-7 text-neutral-600 sm:text-[17px]">
                    Browse thousands of free APKs. Publish your own. No
                    gatekeepers, just apps.
                  </p>
                </div>
                <FeaturedCarousel apps={featuredApps} />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-12 text-center sm:py-20">
                <Badge variant="secondary" className="w-fit font-mono text-[11px] tracking-[0.18em]">
                  <Sparkles className="mr-1.5 size-3" />
                  ANDROID APP MARKETPLACE
                </Badge>
                <h1 className="display-tight max-w-3xl text-[26px] font-semibold leading-[1.05] text-neutral-950 sm:text-6xl sm:leading-[1.02]">
                  Discover Android apps, directly.
                </h1>
                <p className="max-w-xl text-[14px] leading-6 text-neutral-600 sm:text-lg">
                  Browse thousands of free APKs. Publish your own. No gatekeepers, just apps.
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:mt-4 sm:gap-3">
                  <Button size="default" className="rounded-full px-5 sm:size-lg sm:px-6" asChild>
                    <Link href="#catalog">
                      Browse apps
                      <ChevronRight />
                    </Link>
                  </Button>
                  <Button size="default" variant="secondary" className="rounded-full px-5 sm:size-lg sm:px-6" asChild>
                    <Link href="/developer">Developer console</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Trending rail */}
        {trendingApps.length ? (
          <AppRail
            apps={trendingApps}
            eyebrow="Trending"
            title="What people are downloading"
            subtitle="Popular this week across the catalog"
            href="/?sort=popularity#catalog"
            size="md"
          />
        ) : null}

        {/* Top Charts — two-column ranked list */}
        {topChartApps.length ? (
          <section className="page-shell pt-8 sm:pt-14">
            <div className="mb-2.5 flex items-end justify-between gap-3 sm:mb-4">
              <div>
                <p className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500 sm:block">
                  Top charts
                </p>
                <h2 className="text-[17px] font-semibold tracking-[-0.4px] text-neutral-950 sm:mt-1 sm:text-[22px] sm:tracking-[-0.6px]">
                  Most downloaded
                </h2>
              </div>
              <Link
                href="/?tab=top-charts&sort=downloads#catalog"
                className="group text-[12px] font-medium text-neutral-600 transition hover:text-neutral-950 sm:text-[13px]"
              >
                View all
                <ChevronRight className="ml-0.5 inline size-3 transition-transform group-hover:translate-x-0.5 sm:size-3.5" />
              </Link>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-1.5 shadow-level-2 sm:p-3">
              <div className="grid sm:grid-cols-2 sm:gap-2">
                {topChartApps.slice(0, 10).map((app, index) => (
                  <RankRow key={app.id} app={app} rank={index + 1} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Editor's choice rail (large tiles) */}
        {editorsPick.length ? (
          <AppRail
            apps={editorsPick}
            eyebrow="Editor's choice"
            title="Hand-picked by the team"
            href="/?sort=rating#catalog"
            size="lg"
          />
        ) : null}

        {/* Popular categories */}
        {categories.length ? (
          <section className="page-shell pt-8 sm:pt-14">
            <div className="mb-2.5 flex items-end justify-between gap-3 sm:mb-4">
              <div>
                <p className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500 sm:block">
                  Categories
                </p>
                <h2 className="text-[17px] font-semibold tracking-[-0.4px] text-neutral-950 sm:mt-1 sm:text-[22px] sm:tracking-[-0.6px]">
                  Browse by category
                </h2>
              </div>
              <Link
                href="/?tab=categories"
                className="group text-[12px] font-medium text-neutral-600 transition hover:text-neutral-950 sm:text-[13px]"
              >
                View all
                <ChevronRight className="ml-0.5 inline size-3 transition-transform group-hover:translate-x-0.5 sm:size-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {categories.slice(0, 12).map((cat, idx) => {
                const accents = [
                  "from-blue-500/10 to-cyan-500/10 text-blue-600",
                  "from-purple-500/10 to-pink-500/10 text-purple-600",
                  "from-amber-500/10 to-orange-500/10 text-amber-600",
                  "from-emerald-500/10 to-teal-500/10 text-emerald-600",
                  "from-rose-500/10 to-red-500/10 text-rose-600",
                  "from-indigo-500/10 to-blue-500/10 text-indigo-600"
                ];
                const accent = accents[idx % accents.length];
                return (
                  <Link
                    key={cat.slug}
                    href={`/?category=${cat.slug}`}
                    className={`group flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white p-2.5 transition hover:-translate-y-0.5 hover:shadow-level-2 sm:gap-3 sm:p-4`}
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${accent} sm:size-10`}
                      aria-hidden
                    >
                      <Grid2X2 className="size-3.5 sm:size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-neutral-950 sm:text-[14px]">
                        {cat.name}
                      </span>
                      <span className="block text-[10px] text-neutral-500 tabular-nums sm:text-[12px]">
                        {cat.count} apps
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* New releases rail */}
        {newReleaseApps.length ? (
          <AppRail
            apps={newReleaseApps}
            eyebrow="New releases"
            title="Fresh on BabaStore"
            href="/?sort=newest#catalog"
            size="md"
          />
        ) : null}

        {/* Suggested for you (smaller tiles) */}
        {apps.length > 6 ? (
          <AppRail
            apps={apps.slice(6, 16)}
            eyebrow="Suggested for you"
            title="More apps to explore"
            href="#catalog"
            size="sm"
          />
        ) : null}

        {/* Full catalog */}
        <section className="page-shell pb-10 pt-10 sm:pb-16 sm:pt-16" id="catalog">
          <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
            <div>
              <p className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500 sm:block">
                Catalog
              </p>
              <h2 className="text-[19px] font-semibold tracking-[-0.5px] text-neutral-950 sm:mt-1 sm:text-[28px] sm:tracking-[-1px]">
                Everything in store
              </h2>
            </div>
          </div>

          <StoreFilters
            categories={categories}
            query={filters.query}
            category={filters.category}
            minRating={getSearchValue(params.rating, "0")}
            size={filters.size}
            updated={filters.updated}
            sort={filters.sort}
            source={filters.source}
          />
          <SearchSuggestions query={filters.query} />

          <div className="mt-3 sm:mt-4">
            <CategoryStrip categories={categories} />
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-3 sm:mt-8">
            <p className="text-[12px] text-neutral-500 sm:text-[13px]">
              <span className="font-medium text-neutral-950 tabular-nums">
                {catalogResult.total}
              </span>{" "}
              apps ready to install
            </p>
          </div>

          {apps.length ? (
            <div className="mt-3 sm:mt-5">
              <CatalogGrid
                initialApps={apps}
                initialNextOffset={catalogResult.nextOffset}
                filters={filters}
              />
            </div>
          ) : (
            <Card className="mt-3 sm:mt-5">
              <CardContent className="grid min-h-36 place-items-center p-5 text-center sm:min-h-56 sm:p-10">
                <div>
                  <Grid2X2 className="mx-auto size-7 text-neutral-400 sm:size-8" />
                  <h3 className="mt-3 text-base font-semibold text-neutral-950 sm:mt-4 sm:text-xl">
                    No apps found.
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500 sm:mt-2">
                    Clear one or two filters and try again.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Trust band */}
        <section className="border-t border-neutral-200 bg-white">
          <div className="page-shell py-10 sm:py-20">
            <div className="grid gap-7 lg:grid-cols-[1fr_2fr] lg:gap-20">
              <div>
                <p className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500 sm:block">
                  Why BabaStore
                </p>
                <h2 className="display-tight text-[20px] font-semibold leading-[1.15] text-neutral-950 sm:mt-2 sm:text-[36px] sm:leading-[1.1]">
                  Built like a developer platform.
                </h2>
                <p className="mt-2 max-w-md text-[13px] leading-6 text-neutral-600 sm:mt-3 sm:text-[15px] sm:leading-7">
                  No gatekeepers. No ads. Just direct APK delivery and the
                  primitives you&apos;d expect from a modern store.
                </p>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-4">
                {[
                  {
                    icon: BadgeCheck,
                    title: "Direct APK delivery",
                    copy:
                      "Install routes through a download endpoint backed by saved APK URLs."
                  },
                  {
                    icon: ShieldCheck,
                    title: "Download logging",
                    copy:
                      "Published apps write download events without blocking the install flow."
                  },
                  {
                    icon: TrendingUp,
                    title: "New releases",
                    copy:
                      "Latest updates sorted from real version and listing timestamps."
                  }
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-lg border border-neutral-200 bg-canvas-soft p-4 transition hover:bg-white hover:shadow-level-2 sm:p-5"
                  >
                    <div className="flex size-7 items-center justify-center rounded-md bg-white shadow-level-1 sm:size-8">
                      <item.icon className="size-3.5 text-neutral-950 sm:size-4" />
                    </div>
                    <h3 className="mt-3 text-[13px] font-semibold text-neutral-950 sm:mt-4 sm:text-[14px]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[12px] leading-5 text-neutral-600 sm:text-[13px]">
                      {item.copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA — for developers */}
        <section className="relative overflow-hidden bg-neutral-950 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 30%, rgba(0, 124, 240, 0.45), transparent 32%), radial-gradient(circle at 82% 80%, rgba(255, 0, 128, 0.35), transparent 32%), radial-gradient(circle at 60% 20%, rgba(121, 40, 202, 0.35), transparent 32%)"
            }}
          />
          <div className="page-shell relative py-10 sm:py-20">
            <div className="flex flex-col items-start gap-3 sm:max-w-2xl sm:gap-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60 sm:text-[11px]">
                For developers
              </p>
              <h2 className="display-tight text-[22px] font-semibold leading-[1.1] sm:text-[44px]">
                Ship your APK in minutes.
              </h2>
              <p className="text-[13px] leading-6 text-white/70 sm:text-[17px] sm:leading-7">
                Upload a build, fill in the metadata, and publish. Versioning,
                screenshots, and signed download URLs are handled for you.
              </p>
              <div className="mt-1 flex flex-wrap gap-2 sm:mt-2 sm:gap-3">
                <Button
                  size="default"
                  asChild
                  className="rounded-full bg-white px-5 text-neutral-950 shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:bg-neutral-100 sm:size-lg sm:px-6"
                >
                  <Link href="/developer">
                    Open developer console
                    <ChevronRight />
                  </Link>
                </Button>
                <Button
                  size="default"
                  variant="ghost"
                  asChild
                  className="rounded-full border border-white/20 px-5 text-white hover:bg-white/10 hover:text-white sm:size-lg sm:px-6"
                >
                  <Link href="/docs/setup">Read setup guide</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <BottomNav />
    </div>
  );
}
