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
  filterCatalogApps,
  getCatalogApps,
  getCategories
} from "@/lib/catalog/catalog";
import type { CatalogFilters } from "@/lib/catalog/types";
import { AppCard } from "@/components/marketing/app-card";
import { CategoryStrip } from "@/components/catalog/category-strip";
import { AppIcon } from "@/components/catalog/app-icon";
import { StoreFilters } from "@/components/catalog/store-filters";
import { TopNav } from "@/components/layout/top-nav";
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
  const apps = await getCatalogApps();
  const categories = await getCategories();
  const filters: CatalogFilters = {
    query: getSearchValue(params.q),
    category: getSearchValue(params.category, "all"),
    minRating: Number(getSearchValue(params.rating, "0")) || undefined,
    size: getSearchValue(params.size, "all") as CatalogFilters["size"],
    updated: getSearchValue(params.updated, "all") as CatalogFilters["updated"],
    sort: getSearchValue(params.sort, "featured") as CatalogFilters["sort"]
  };
  const activeTab = getSearchValue(params.tab, "for-you");
  const filteredApps = filterCatalogApps(apps, filters);
  const topChartApps = [...apps].sort((a, b) => b.downloads - a.downloads).slice(0, 5);
  const newReleaseApps = [...apps]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);
  const featuredApp = filteredApps[0] ?? apps[0];
  const featuredMetrics = featuredApp ? appMetrics(featuredApp) : null;

  return (
    <div className="min-h-screen">
      <TopNav />
      <main>
        <section className="relative overflow-hidden border-b border-neutral-200 bg-white">
          <div className="mesh-hero absolute inset-x-0 top-0 h-72 opacity-80" />
          <div className="page-shell relative grid gap-10 pb-16 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="font-mono">
                <Sparkles className="mr-1 size-3" />
                ANDROID APP MARKETPLACE
              </Badge>
              <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-[1] tracking-normal text-neutral-950 sm:text-6xl">
                Discover Android apps, directly.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-7 text-neutral-600">
                Browse published Android apps, filter by category, inspect APK
                metadata, and install releases served through the store download
                endpoint.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="#catalog">
                    Browse apps
                    <ArrowRight />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/developer">Developer console</Link>
                </Button>
              </div>
            </div>

            {featuredApp && featuredMetrics ? (
              <Card className="overflow-hidden rounded-xl shadow-float">
                <div
                  className="h-40 border-b border-neutral-200"
                  style={{ background: featuredApp.accent }}
                />
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AppIcon
                      name={featuredApp.name}
                      accent={featuredApp.accent}
                      src={featuredApp.iconUrl}
                      className="-mt-14 size-20 text-2xl"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="mono-label">FEATURED APP</p>
                      <h2 className="mt-1 truncate text-2xl font-semibold tracking-normal text-neutral-950">
                        {featuredApp.name}
                      </h2>
                      <p className="mt-1 text-sm text-neutral-500">
                        {featuredApp.developer}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-neutral-600">
                    {featuredApp.summary ?? featuredApp.description}
                  </p>
                  <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                    {[
                      [featuredMetrics.rating, "Rating"],
                      [featuredMetrics.downloads, "Downloads"],
                      [featuredMetrics.size, "Size"]
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
                        <div className="text-sm font-semibold text-neutral-950">{value}</div>
                        <div className="text-xs text-neutral-500">{label}</div>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-5 w-full" asChild>
                    <Link href={`/apps/${featuredApp.slug}`}>
                      View app
                      <ArrowRight />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden rounded-xl shadow-float">
                <CardContent className="grid min-h-80 place-items-center p-8 text-center">
                  <div>
                    <Grid2X2 className="mx-auto size-9 text-neutral-400" />
                    <h2 className="mt-4 text-2xl font-semibold tracking-normal text-neutral-950">
                      No published apps yet.
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      Published developer apps will appear here after upload.
                    </p>
                    <Button className="mt-5" asChild>
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

        <section className="page-shell py-10" id="catalog">
          <div className="flex gap-2 overflow-x-auto pb-3">
            {tabs.map((tab) => (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? "default" : "secondary"}
                size="sm"
                asChild
                className="shrink-0"
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
          />

          <div className="mt-6">
            <CategoryStrip categories={categories} />
          </div>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mono-label">PUBLIC CATALOG</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-normal text-neutral-950">
                {filteredApps.length} apps ready to install.
              </h2>
            </div>
            <p className="text-sm text-neutral-500">
              Search, category, rating, size, and update filters use live catalog data.
            </p>
          </div>

          {filteredApps.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          ) : (
            <Card className="mt-5">
              <CardContent className="grid min-h-56 place-items-center p-10 text-center">
                <div>
                  <Grid2X2 className="mx-auto size-8 text-neutral-400" />
                  <h3 className="mt-4 text-xl font-semibold tracking-normal text-neutral-950">
                    No apps found.
                  </h3>
                  <p className="mt-2 text-sm text-neutral-500">
                    {apps.length
                      ? "Clear one or two filters and try again."
                      : "Published apps will appear here after developers upload APKs."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {topChartApps.length ? (
          <section className="bg-neutral-950 py-14 text-white">
            <div className="page-shell grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="font-mono text-xs text-white/55">TOP CHARTS</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                  Popular APKs ranked by installs.
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/60">
                  Rankings are based on download events captured by the store endpoint.
                </p>
              </div>
              <div className="grid gap-3">
                {topChartApps.map((app, index) => (
                  <Link
                    key={app.id}
                    href={`/apps/${app.slug}`}
                    className="flex items-center gap-4 rounded-md border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[0.08]"
                  >
                    <span className="w-7 text-center font-mono text-sm text-white/45">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <AppIcon name={app.name} accent={app.accent} src={app.iconUrl} className="size-12" />
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

        <section className="page-shell py-14">
          <div className="grid gap-4 md:grid-cols-3">
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
                <CardHeader>
                  <item.icon className="size-5 text-neutral-950" />
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-neutral-600">{item.copy}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {newReleaseApps.length ? (
            <div className="mt-10">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="mono-label">NEW RELEASES</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-normal text-neutral-950">
                    Recently updated.
                  </h2>
                </div>
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/?sort=newest">View all</Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {newReleaseApps.map((app) => (
                  <AppCard key={app.id} app={app} compact />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
