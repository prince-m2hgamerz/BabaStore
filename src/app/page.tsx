import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    .slice(0, 8);
  const newReleaseApps = apps
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);
  const featuredApp = publishedLocalApps[0] ?? apps[0];
  const featuredMetrics = featuredApp ? appMetrics(featuredApp) : null;

  return (
    <div className="min-h-screen">
      <TopNav searchQuery={filters.query} />
      <main>
        <section className="relative overflow-hidden border-b border-neutral-200 bg-white">
          <div className="mesh-hero absolute inset-x-0 top-0 h-56 opacity-80 sm:h-72" />
          <div className="page-shell relative grid min-w-0 gap-5 pb-8 pt-5 sm:gap-10 sm:pb-16 sm:pt-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:pt-20">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="font-mono">
                <Sparkles className="mr-1 size-3" />
                ANDROID APP MARKETPLACE
              </Badge>
              <h1 className="mt-3 max-w-3xl text-2xl font-semibold leading-[1.15] tracking-normal text-neutral-950 sm:mt-8 sm:text-6xl">
                Discover Android apps, directly.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-5 text-neutral-600 sm:mt-5 sm:text-lg sm:leading-7">
                Browse published Android apps, filter by category, inspect APK
                metadata, and install releases served through the store download
                endpoint.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
                <Button size="default" className="rounded-[100px] sm:h-12 sm:px-6" asChild>
                  <Link href="#catalog">
                    Browse apps
                    <ArrowRight />
                  </Link>
                </Button>
                <Button size="default" className="rounded-[100px] sm:h-12 sm:px-6" variant="secondary" asChild>
                  <Link href="/developer">Developer console</Link>
                </Button>
              </div>
            </div>

            {featuredApp && featuredMetrics ? (
              <Card className="overflow-hidden rounded-xl shadow-float">
                <div
                  className="h-28 border-b border-neutral-200 sm:h-40"
                  style={{ background: featuredApp.accent }}
                />
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <AppIcon
                      name={featuredApp.name}
                      accent={featuredApp.accent}
                      src={featuredApp.iconUrl}
                      className="-mt-10 size-16 text-xl sm:-mt-14 sm:size-20 sm:text-2xl"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="mono-label">FEATURED APP</p>
                      <h2 className="mt-1 truncate text-lg font-semibold tracking-normal text-neutral-950 sm:text-2xl">
                        {featuredApp.name}
                      </h2>
                      <p className="mt-0.5 text-sm text-neutral-500 sm:mt-1">
                        BabaStore
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-5 text-neutral-600 sm:mt-5 sm:line-clamp-none sm:leading-6">
                    {featuredApp.summary ?? featuredApp.description}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-1.5 text-center sm:mt-5 sm:gap-2">
                    {[
                      [featuredMetrics.rating, "Rating"],
                      [featuredMetrics.downloads, "Downloads"],
                      [featuredMetrics.size, "Size"]
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1.5 sm:px-3 sm:py-2">
                        <div className="text-xs font-semibold text-neutral-950 sm:text-sm">{value}</div>
                        <div className="text-[10px] text-neutral-500 sm:text-xs">{label}</div>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-4 w-full sm:mt-5" asChild>
                    <Link href={`/apps/${featuredApp.slug}`}>
                      View app
                      <ArrowRight />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden rounded-xl shadow-float">
                <CardContent className="grid min-h-56 place-items-center p-6 text-center sm:min-h-80 sm:p-8">
                  <div>
                    <Grid2X2 className="mx-auto size-8 text-neutral-400 sm:size-9" />
                    <h2 className="mt-3 text-xl font-semibold tracking-normal text-neutral-950 sm:mt-4 sm:text-2xl">
                      No published apps yet.
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-neutral-500 sm:mt-2">
                      Published developer apps will appear here after upload.
                    </p>
                    <Button className="mt-4 sm:mt-5" asChild>
                      <Link href="/developer/upload">
                        Upload APK
                        <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="page-shell py-6 sm:py-10" id="catalog">
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
            {tabs.map((tab) => (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? "default" : "secondary"}
                size="sm"
                asChild
                className="shrink-0 rounded-[64px]"
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

          <div className="mt-4 sm:mt-6">
            <CategoryStrip categories={categories} />
          </div>

          <div className="mt-5 flex flex-col gap-1 sm:mt-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mono-label">PUBLIC CATALOG</p>
              <h2 className="mt-0.5 text-base font-semibold tracking-normal text-neutral-950 sm:mt-1 sm:text-3xl">
                {catalogResult.total} apps ready to install.
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
                  <h3 className="mt-3 text-base font-semibold tracking-normal text-neutral-950 sm:mt-4 sm:text-xl">
                    No apps found.
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500 sm:mt-2">
                    {apps.length
                      ? "Clear one or two filters and try again."
                      : "Published apps will appear here after developers upload APKs."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {publishedLocalApps.length ? (
          <section className="page-shell pb-8 sm:pb-4">
            <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mono-label">BABASTORE APPS</p>
                <h2 className="mt-1 text-lg font-semibold tracking-normal text-neutral-950 sm:text-2xl">
                  Published by BabaStore developers.
                </h2>
              </div>
              <Button variant="secondary" size="sm" asChild className="w-full sm:w-auto">
                <Link href="/?source=local">Show all</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {publishedLocalApps.map((app) => (
                <AppCard key={app.id} app={app} compact />
              ))}
            </div>
          </section>
        ) : null}

        {topChartApps.length ? (
          <section className="bg-neutral-950 py-10 text-white sm:py-14">
            <div className="page-shell grid gap-5 sm:gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="font-mono text-xs text-white/55">TOP CHARTS</p>
                <h2 className="mt-1 text-xl font-semibold tracking-normal sm:mt-2 sm:text-3xl">
                  Popular APKs ranked by installs.
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/60 sm:mt-4">
                  Rankings are based on download events captured by the store endpoint.
                </p>
              </div>
              <div className="grid gap-2 sm:gap-3">
                {topChartApps.map((app, index) => (
                  <Link
                    key={app.id}
                    href={`/apps/${app.slug}`}
                    className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] p-2.5 transition hover:bg-white/[0.08] sm:gap-4 sm:p-3"
                  >
                    <span className="w-6 text-center font-mono text-xs text-white/45 sm:w-7 sm:text-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <AppIcon name={app.name} accent={app.accent} src={app.iconUrl} className="size-10 sm:size-12" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-white">{app.name}</h3>
                      <p className="truncate text-xs text-white/50">{app.category}</p>
                    </div>
                    <div className="hidden items-center gap-4 text-xs text-white/55 sm:flex">
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3 fill-amber-300 text-amber-300" />
                        {app.rating === null ? "No ratings" : app.rating.toFixed(1)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Download className="size-3" />
                        {appMetrics(app).downloads}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="page-shell py-10 sm:py-14">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
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
              <Card key={item.title} className="glass-hover">
                <CardHeader className="p-4 sm:p-6">
                  <item.icon className="size-5 text-neutral-950" />
                  <CardTitle className="text-sm sm:text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                  <p className="text-sm leading-6 text-neutral-600">{item.copy}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {newReleaseApps.length ? (
            <div className="mt-8 sm:mt-10">
              <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4 sm:gap-4">
                <div>
                  <p className="mono-label">NEW RELEASES</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-normal text-neutral-950 sm:text-2xl">
                    Recently updated.
                  </h2>
                </div>
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/?sort=newest">View all</Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {newReleaseApps.map((app) => (
                  <AppCard key={app.id} app={app} compact />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
