import Link from "next/link";
import {
  BadgeCheck,
  ChevronRight,
  Download,
  Grid2X2,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp
} from "lucide-react";
import {
  appMetrics,
  getCatalogApps,
  getCatalogResult,
  getCategories
} from "@/lib/catalog/catalog";
import type { CatalogFilters } from "@/lib/catalog/types";
import { AppCard } from "@/components/marketing/app-card";
import { CategoryStrip } from "@/components/catalog/category-strip";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { SearchSuggestions } from "@/components/catalog/search-suggestions";
import { AppIcon } from "@/components/catalog/app-icon";
import { StoreFilters } from "@/components/catalog/store-filters";
import { TopNav } from "@/components/layout/top-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { FeaturedCarousel } from "@/components/marketing/featured-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tabs = [
  { label: "For You", value: "for-you" },
  { label: "Top Charts", value: "top-charts" },
  { label: "Categories", value: "categories" },
  { label: "New Releases", value: "new-releases" }
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
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);
  const editorsPick = apps.filter((a) => a.rating && a.rating >= 4).slice(0, 10);
  const featuredApps = publishedLocalApps.length
    ? publishedLocalApps
    : apps.slice(0, Math.min(5, apps.length));

  return (
    <div className="min-h-screen bg-white">
      <TopNav searchQuery={filters.query} />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f7ff] via-white to-white">
          <div className="absolute -right-32 -top-32 size-96 rounded-full bg-gradient-to-br from-[#f0f7ff] to-transparent blur-3xl" />
          <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-[#faf0ff] to-transparent blur-3xl" />
          <div className="page-shell relative pb-4 pt-3 sm:pb-8 sm:pt-6">
            {featuredApps.length ? (
              <FeaturedCarousel apps={featuredApps} />
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-center sm:gap-4 sm:py-16">
                <Badge variant="secondary" className="w-fit font-mono text-[11px] tracking-wider">
                  <Sparkles className="mr-1.5 size-3" />
                  ANDROID APP MARKETPLACE
                </Badge>
                <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-neutral-950 sm:text-6xl">
                  Discover Android apps, directly.
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-neutral-500 sm:text-lg">
                  Browse thousands of free APKs. Publish your own. No gatekeepers, just apps.
                </p>
                <div className="mt-2 flex gap-3 sm:mt-6">
                  <Button size="default" className="rounded-full sm:h-12 sm:px-8 sm:text-base" asChild>
                    <Link href="#catalog">
                      Browse apps
                      <ChevronRight />
                    </Link>
                  </Button>
                  <Button size="default" variant="secondary" className="rounded-full sm:h-12 sm:px-8 sm:text-base" asChild>
                    <Link href="/developer">Developer console</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Category pills */}
        <section className="page-shell pt-3 sm:pt-5">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent sm:hidden" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent sm:hidden" />
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/?category=${cat.slug}`}
                  className="shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 active:scale-95"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Top Charts */}
        {topChartApps.length ? (
          <section className="page-shell pt-5 sm:pt-8">
            <div className="mb-2 flex items-center justify-between sm:mb-3">
              <h2 className="text-base font-bold text-neutral-950 sm:text-xl">
                Top Charts
              </h2>
              <Link href="/?tab=top-charts&sort=downloads#catalog" className="group text-xs sm:text-sm font-medium text-neutral-600 transition hover:text-neutral-950">
                More <ChevronRight className="ml-0.5 inline size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-level-2">
              {topChartApps.slice(0, 10).map((app, index) => {
                const medal = index === 0 ? "\u{1F947}" : index === 1 ? "\u{1F948}" : index === 2 ? "\u{1F949}" : null;
                return (
                <Link
                  key={app.id}
                  href={`/apps/${app.slug}`}
                  className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-neutral-50 active:scale-[0.99] sm:gap-4 sm:px-4 sm:py-3"
                >
                  <span className="flex w-6 shrink-0 items-center justify-center text-sm font-bold text-neutral-400 sm:w-7 sm:text-base">
                    {medal ?? (
                      <span className="text-neutral-300">{index + 1}</span>
                    )}
                  </span>
                  <AppIcon
                    name={app.name}
                    accent={app.accent}
                    src={app.iconUrl}
                    className="size-10 sm:size-12"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-950 sm:text-[15px]">
                      {app.name}
                    </p>
                    <p className="truncate text-xs text-neutral-500">{app.developer}</p>
                  </div>
                  <div className="hidden items-center gap-3 text-xs text-neutral-400 sm:flex">
                    {app.rating !== null ? (
                      <span className="flex items-center gap-0.5">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {app.rating.toFixed(1)}
                      </span>
                    ) : null}
                    <span className="flex items-center gap-1">
                      <Download className="size-3" />
                      {appMetrics(app).downloads}
                    </span>
                  </div>
                  <span className="inline-flex h-7 items-center rounded-full bg-[#28feaf]/15 px-3 text-xs font-medium text-[#1dbf8d] sm:hidden">
                    <Download className="mr-1 size-3" />
                    Install
                  </span>
                  <ChevronRight className="hidden size-5 shrink-0 text-neutral-300 sm:block" />
                </Link>
              );})}
            </div>
          </section>
        ) : null}

        {/* Editors' Choice */}
        {editorsPick.length ? (
          <section className="page-shell pt-6 sm:pt-10">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <h2 className="text-base font-bold text-neutral-950 sm:text-xl">
                Editor&apos;s Choice
              </h2>
              <Link href="/?tab=for-you&sort=rating#catalog" className="group text-xs sm:text-sm font-medium text-neutral-600 transition hover:text-neutral-950">
                More <ChevronRight className="ml-0.5 inline size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
              {editorsPick.slice(0, 8).map((app) => (
                <div key={app.id} className="w-44 shrink-0 sm:w-auto">
                  <AppCard app={app} compact />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* New Releases */}
        {newReleaseApps.length ? (
          <section className="page-shell pt-6 sm:pt-10">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <h2 className="text-base font-bold text-neutral-950 sm:text-xl">
                New Releases
              </h2>
              <Link href="/?tab=new-releases&sort=newest#catalog" className="group text-xs sm:text-sm font-medium text-neutral-600 transition hover:text-neutral-950">
                More <ChevronRight className="ml-0.5 inline size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
              {newReleaseApps.map((app) => (
                <div key={app.id} className="w-44 shrink-0 sm:w-auto">
                  <AppCard app={app} compact />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Full catalog */}
        <section className="page-shell pb-6 pt-6 sm:pb-10 sm:pt-10" id="catalog">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {tabs.map((tab) => (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? "default" : "secondary"}
                size="sm"
                asChild
                className="shrink-0 rounded-full"
              >
                <Link href={`/?tab=${tab.value}`}>{tab.label}</Link>
              </Button>
            ))}
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

          <div className="mt-4">
            <CategoryStrip categories={categories} />
          </div>

          <div className="mt-5 flex flex-col gap-1 sm:mt-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mono-label">ALL APPS</p>
              <h2 className="mt-0.5 text-base font-semibold text-neutral-950 sm:mt-1 sm:text-2xl">
                {catalogResult.total} apps ready to install
              </h2>
            </div>
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

        {/* Features */}
        <section className="border-t border-neutral-100">
          <div className="page-shell py-8 sm:py-12">
            <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
              {[
                {
                  icon: BadgeCheck,
                  title: "Direct APK delivery",
                  copy: "Install buttons route through a download endpoint backed by saved APK URLs."
                },
                {
                  icon: ShieldCheck,
                  title: "Download logging",
                  copy: "Published apps write download events without blocking the install flow."
                },
                {
                  icon: TrendingUp,
                  title: "New releases",
                  copy: "Latest updates are sorted from real app version and listing timestamps."
                }
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 sm:p-6">
                  <item.icon className="size-5 text-neutral-950" />
                  <h3 className="mt-2 text-sm font-semibold text-neutral-950 sm:text-base">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
