import { externalProviders } from "@/lib/catalog/providers";
import { unstable_cache } from "next/cache";
import { appAccent, lineItems, normalizeSlug } from "@/lib/catalog/utils";
import {
  appMetrics,
  formatBytes,
  formatDate,
  formatDownloads
} from "@/lib/catalog/format";
import type {
  CatalogApp,
  CatalogAppVersion,
  CatalogFilters,
  CatalogLookup,
  CatalogQuery,
  CatalogResult,
  CatalogStore,
  CategorySummary
} from "@/lib/catalog/types";

function isSupabaseReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function categoryNameFromRelation(value: unknown) {
  if (!value) {
    return "Uncategorized";
  }

  if (Array.isArray(value)) {
    const first = value[0] as { name?: string } | undefined;
    return first?.name ?? "Uncategorized";
  }

  return (value as { name?: string }).name ?? "Uncategorized";
}

function developerNameFromRelation(value: unknown) {
  if (!value) {
    return "Developer";
  }

  if (Array.isArray(value)) {
    const first = value[0] as { username?: string | null; email?: string | null } | undefined;
    return first?.username || first?.email || "Developer";
  }

  const profile = value as { username?: string | null; email?: string | null };
  return profile.username || profile.email || "Developer";
}

async function getSupabaseApps(status: "published" | "all" = "published"): Promise<CatalogApp[]> {
  if (!isSupabaseReady()) {
    return [];
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    let query = supabase
      .from("apps")
      .select(
        "id, developer_id, name, package_name, version, description, tags, privacy_policy_url, apk_url, icon_url, status, updated_at, categories(name), profiles(username,email)"
      )
      .order("updated_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: apps, error } = await query;

    if (error || !apps?.length) {
      return [];
    }

    const appIds = apps.map((app) => app.id);
    const [{ data: downloads }, { data: reviews }, { data: versions }, { data: screenshots }] =
      await Promise.all([
        supabase.from("downloads").select("app_id").in("app_id", appIds),
        supabase.from("reviews").select("app_id,rating,body,developer_response,created_at,id").in("app_id", appIds),
        supabase
          .from("app_versions")
          .select("id,app_id,version_name,version_code,apk_url,apk_size,changelog,created_at")
          .in("app_id", appIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("app_screenshots")
          .select("app_id,image_url,sort_order")
          .in("app_id", appIds)
          .order("sort_order", { ascending: true })
      ]);

    const downloadsByApp = new Map<string, number>();
    downloads?.forEach((item) => {
      downloadsByApp.set(item.app_id, (downloadsByApp.get(item.app_id) ?? 0) + 1);
    });

    const ratingsByApp = new Map<string, number[]>();
    const reviewItemsByApp = new Map<string, NonNullable<CatalogApp["reviewItems"]>>();
    reviews?.forEach((item) => {
      ratingsByApp.set(item.app_id, [...(ratingsByApp.get(item.app_id) ?? []), item.rating]);
      reviewItemsByApp.set(item.app_id, [
        ...(reviewItemsByApp.get(item.app_id) ?? []),
        {
          id: item.id,
          author: "BabaStore user",
          rating: item.rating,
          title: null,
          body: item.body,
          createdAt: item.created_at
        }
      ]);
    });

    const versionsByApp = new Map<string, NonNullable<typeof versions>>();
    versions?.forEach((item) => {
      versionsByApp.set(item.app_id, [...(versionsByApp.get(item.app_id) ?? []), item]);
    });

    const screenshotsByApp = new Map<string, string[]>();
    screenshots?.forEach((item) => {
      screenshotsByApp.set(item.app_id, [...(screenshotsByApp.get(item.app_id) ?? []), item.image_url]);
    });

    return apps.map((app) => {
      const category = categoryNameFromRelation(app.categories);
      const appRatings = ratingsByApp.get(app.id) ?? [];
      const appVersions = versionsByApp.get(app.id) ?? [];
      const latestVersion = appVersions[0];
      const description = app.description ?? "";
      const mappedVersions: CatalogAppVersion[] = appVersions.map((version) => ({
        id: version.id,
        version: version.version_name,
        versionCode: version.version_code ?? null,
        sizeBytes: version.apk_size ?? null,
        updatedAt: version.created_at,
        apkUrl: version.apk_url,
        malwareRank: "Verified upload"
      }));

      return {
        id: app.id,
        slug: normalizeSlug(`${app.name}-${app.package_name}`),
        name: app.name,
        developer: developerNameFromRelation(app.profiles),
        developerId: app.developer_id,
        packageName: app.package_name,
        version: app.version,
        category,
        categorySlug: normalizeSlug(category),
        summary: description ? description.slice(0, 132) : null,
        description,
        privacyPolicyUrl: app.privacy_policy_url,
        rating: appRatings.length
          ? appRatings.reduce((sum, rating) => sum + rating, 0) / appRatings.length
          : null,
        reviews: appRatings.length,
        downloads: downloadsByApp.get(app.id) ?? 0,
        sizeBytes: latestVersion?.apk_size ?? null,
        updatedAt: app.updated_at,
        apkUrl: latestVersion?.apk_url ?? app.apk_url,
        iconUrl: app.icon_url,
        bannerUrl: null,
        accent: appAccent(app.package_name),
        tags: app.tags ?? [],
        screenshots: screenshotsByApp.get(app.id) ?? [],
        changelog: lineItems(latestVersion?.changelog),
        status: app.status,
        source: "local",
        sourceLabel: "BabaStore",
        externalUrl: null,
        storeName: "BabaStore",
        malwareRank: "Verified upload",
        versions: mappedVersions,
        reviewItems: reviewItemsByApp.get(app.id) ?? []
      };
    });
  } catch {
    return [];
  }
}

function mergeApps(primary: CatalogApp[], secondary: CatalogApp[]) {
  const seenPackages = new Set<string>();
  const seenIds = new Set<string>();
  const result: CatalogApp[] = [];

  [...primary, ...secondary].forEach((app) => {
    const packageKey = app.packageName.toLowerCase();
    const idKey = app.id.toLowerCase();

    if (seenPackages.has(packageKey) || seenIds.has(idKey)) {
      return;
    }

    seenPackages.add(packageKey);
    seenIds.add(idKey);
    result.push(app);
  });

  return result;
}

function isPublishedLocalApp(app: CatalogApp) {
  return app.source === "local" && app.status === "published";
}

function searchBlob(app: CatalogApp) {
  return [
    app.id,
    app.slug,
    app.name,
    app.developer,
    app.developerId,
    app.packageName,
    app.version,
    app.category,
    app.categorySlug,
    app.summary ?? "",
    app.description,
    app.privacyPolicyUrl ?? "",
    app.storeName ?? "",
    app.sourceLabel ?? "",
    app.externalUrl ?? "",
    app.ageRating ?? "",
    app.malwareRank ?? "",
    app.tags.join(" "),
    app.changelog.join(" "),
    app.versions?.map((version) => version.version).join(" ") ?? "",
    app.reviewItems
      ?.map((review) => [review.title ?? "", review.body ?? ""].join(" "))
      .join(" ") ?? ""
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function matchesSearchQuery(app: CatalogApp, query: string | undefined) {
  const cleanQuery = query?.trim().toLowerCase();

  if (!cleanQuery) {
    return true;
  }

  const blob = searchBlob(app);
  if (blob.includes(cleanQuery)) {
    return true;
  }

  const terms = cleanQuery
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);

  return terms.length > 1 && terms.every((term) => blob.includes(term));
}

async function getExternalApps(query: CatalogQuery) {
  const results = await Promise.allSettled(
    externalProviders.map((provider) => provider.listApps(query))
  );

  return results.flatMap((result) =>
    result.status === "fulfilled" ? result.value.apps : []
  );
}

async function getSearchFallbackApps(query: CatalogQuery) {
  const cleanQuery = query.query?.trim();
  if (!cleanQuery) {
    return [];
  }

  const fallbackQueries = Array.from(
    new Set(
      [
        cleanQuery,
        cleanQuery.replace(/\s+/g, " "),
        cleanQuery.split(/\s+/)[0] ?? ""
      ].filter((value) => value.length >= 2)
    )
  );

  const results = await Promise.allSettled(
    fallbackQueries.map((value) =>
      getExternalApps({
        ...query,
        query: value,
        limit: Math.max(query.limit ?? 24, 24),
        offset: 0
      })
    )
  );

  return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

async function buildCatalogResult(query: CatalogQuery = {}): Promise<CatalogResult> {
  const limit = Math.min(Math.max(query.limit ?? 48, 1), 100);
  const offset = Math.max(query.offset ?? 0, 0);
  const [localApps, externalApps] = await Promise.all([
    getSupabaseApps("published"),
    getExternalApps({
      ...query,
      limit: Math.max(offset + limit + 1, 24),
      offset: 0
    })
  ]);
  const searchFallbackApps = query.query ? await getSearchFallbackApps(query) : [];
  const merged = mergeApps(localApps, mergeApps(externalApps, searchFallbackApps));
  const filtered = filterCatalogApps(merged, query);
  const page = filtered.slice(offset, offset + limit);
  const remaining = filtered.length - (offset + limit);

  return {
    apps: page,
    total: filtered.length,
    nextOffset: remaining > 0 ? offset + limit : null,
    sources: Array.from(new Set(page.map((app) => app.source ?? "local")))
  };
}

const getCachedCatalogResult = unstable_cache(
  async (queryKey: string) => buildCatalogResult(JSON.parse(queryKey) as CatalogQuery),
  ["catalog-result-v5"],
  {
    revalidate: 30,
    tags: ["catalog"]
  }
);

export async function getCatalogResult(query: CatalogQuery = {}): Promise<CatalogResult> {
  if (query.query?.trim() || query.source === "local") {
    return buildCatalogResult(query);
  }

  return getCachedCatalogResult(JSON.stringify(query));
}

export async function getCatalogApps(query: CatalogQuery = {}) {
  const result = await getCatalogResult({
    limit: query.limit ?? 60,
    offset: query.offset ?? 0,
    ...query
  });

  return result.apps;
}

export async function getCatalogApp(slug: string) {
  const localApps = await getSupabaseApps("published");
  const localApp = localApps.find((app) => app.slug === slug || app.id === slug);

  if (localApp) {
    return localApp;
  }

  for (const provider of externalProviders) {
    try {
      const app = await provider.getApp(slug);
      if (app) return app;
    } catch {
      // Other providers or local data can still satisfy the request.
    }
  }

  const apps = await getCatalogApps({ query: slug.replace(/^app-/, ""), limit: 40 });
  return apps.find((app) => app.slug === slug || app.id === slug || app.packageName === slug) ?? null;
}

export async function lookupCatalogApp(lookup: CatalogLookup) {
  if (lookup.slug) {
    const app = await getCatalogApp(lookup.slug);
    if (app) return app;
  }

  if (lookup.packageName) {
    const localApps = await getSupabaseApps("published");
    const localApp = localApps.find((app) => app.packageName === lookup.packageName);
    if (localApp) return localApp;
  }

  for (const provider of externalProviders) {
    try {
      const app = await provider.getApp(lookup);
      if (app) return app;
    } catch {
      // Continue through fallback providers.
    }
  }

  return null;
}

export async function getCatalogDownloadUrl(app: CatalogApp) {
  if (app.source && app.source !== "local") {
    const provider = externalProviders.find((item) => item.source === app.source);
    const downloadUrl = provider?.getDownloadUrl
      ? await provider.getDownloadUrl({
          slug: app.slug,
          packageName: app.packageName,
          appId: app.id.startsWith("babastore:") ? app.id.replace("babastore:", "") : undefined
        }).catch(() => null)
      : null;

    return downloadUrl;
  }

  return app.apkUrl;
}

export async function getCatalogAssetUrl({
  source,
  slug,
  packageName,
  asset,
  index = 0
}: {
  source?: CatalogApp["source"];
  slug: string;
  packageName?: string;
  asset: "icon" | "banner" | "screenshot";
  index?: number;
}) {
  const provider = externalProviders.find((item) => item.source === (source ?? "catalog"));

  if (!provider?.getAssetUrl) {
    return null;
  }

  return provider
    .getAssetUrl(`${asset}:${index}`, {
      slug,
      packageName,
      appId: slug.replace(/^app-/, "").match(/^(\d+)/)?.[1]
    })
    .catch(() => null);
}

export function getCatalogAssetProxy({
  source,
  slug,
  asset,
  index = 0
}: {
  source?: CatalogApp["source"];
  slug: string;
  asset: "icon" | "banner" | "screenshot";
  index?: number;
}) {
  if (source !== "catalog") return null;
  return asset === "screenshot"
    ? `/api/catalog/assets/screenshot/${slug}?index=${index}`
    : `/api/catalog/assets/${asset}/${slug}`;
}

export async function getCatalogStore(storeName: string): Promise<CatalogStore | null> {
  const normalizedStore = storeName.trim();

  if (!normalizedStore) {
    return null;
  }

  for (const provider of externalProviders) {
    try {
      const store = provider.getStore ? await provider.getStore(normalizedStore) : null;
      if (store) return store;
    } catch {
      // Store metadata is optional and should not break catalog browsing.
    }
  }

  return null;
}

export async function getRelatedApps(app: CatalogApp, limit = 8) {
  const provider = externalProviders.find((item) => item.source === app.source);
  const recommended = provider?.getRecommended
    ? await provider.getRecommended(app.packageName, limit).catch(() => [])
    : [];
  const fallback = await getCatalogApps({
    category: app.categorySlug,
    sort: "rating",
    limit: limit + 1
  });

  return mergeApps(recommended, fallback)
    .filter((item) => item.packageName !== app.packageName)
    .slice(0, limit);
}

async function buildCategories(): Promise<CategorySummary[]> {
  const apps = await getCatalogApps({ limit: 80 });
  const dynamicCategories = getCategorySummaries(apps);

  if (!isSupabaseReady()) {
    return dynamicCategories;
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("name, slug")
      .order("name", { ascending: true });

    if (error || !data) {
      return dynamicCategories;
    }

    const counts = new Map(dynamicCategories.map((category) => [category.slug, category.count]));
    const localCategories = data.map((category) => ({
      name: category.name,
      slug: category.slug,
      count: counts.get(category.slug) ?? 0
    }));
    const localSlugs = new Set(localCategories.map((category) => category.slug));
    const externalOnly = dynamicCategories.filter((category) => !localSlugs.has(category.slug));

    return [...localCategories, ...externalOnly].sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return dynamicCategories;
  }
}

export const getCategories = unstable_cache(buildCategories, ["catalog-categories-v3"], {
  revalidate: 300,
  tags: ["catalog"]
});

export function getCategorySummaries(apps: CatalogApp[]): CategorySummary[] {
  const counts = new Map<string, { name: string; count: number }>();
  apps.forEach((app) => {
    const current = counts.get(app.categorySlug);
    counts.set(app.categorySlug, {
      name: current?.name ?? app.category,
      count: (current?.count ?? 0) + 1
    });
  });

  return Array.from(counts.entries()).map(([slug, value]) => ({
    name: value.name,
    slug,
    count: value.count
  }));
}

export function filterCatalogApps(apps: CatalogApp[], filters: CatalogFilters) {
  const now = new Date();

  let result = apps.filter((app) => {
    const matchesQuery = matchesSearchQuery(app, filters.query);

    const matchesCategory =
      !filters.category ||
      filters.category === "all" ||
      app.categorySlug === filters.category;

    const matchesSource =
      !filters.source ||
      filters.source === "all" ||
      (app.source ?? "local") === filters.source;

    const matchesStore =
      !filters.store ||
      app.storeName?.toLowerCase() === filters.store.toLowerCase();

    const matchesRating =
      !filters.minRating || (app.rating !== null && app.rating >= filters.minRating);

    const sizeMb = app.sizeBytes === null ? null : app.sizeBytes / 1024 / 1024;
    const matchesSize =
      !filters.size ||
      filters.size === "all" ||
      sizeMb === null ||
      (filters.size === "small" && sizeMb <= 30) ||
      (filters.size === "medium" && sizeMb > 30 && sizeMb <= 80) ||
      (filters.size === "large" && sizeMb > 80);

    const updatedDate = new Date(app.updatedAt);
    const diffDays =
      (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
    const matchesUpdated =
      !filters.updated ||
      filters.updated === "all" ||
      (filters.updated === "week" && diffDays <= 7) ||
      (filters.updated === "month" && diffDays <= 31) ||
      (filters.updated === "quarter" && diffDays <= 93);

    return (
      matchesQuery &&
      matchesCategory &&
      matchesSource &&
      matchesStore &&
      matchesRating &&
      matchesSize &&
      matchesUpdated
    );
  });

  switch (filters.sort) {
    case "rating":
      result = result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case "downloads":
    case "popularity":
      result = result.sort((a, b) => b.downloads - a.downloads);
      break;
    case "newest":
      result = result.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      break;
    case "size":
      result = result.sort((a, b) => (a.sizeBytes ?? Number.MAX_SAFE_INTEGER) - (b.sizeBytes ?? Number.MAX_SAFE_INTEGER));
      break;
    default:
      result = result.sort((a, b) => {
        const aIsLocal = isPublishedLocalApp(a);
        const bIsLocal = isPublishedLocalApp(b);
        if (aIsLocal !== bIsLocal) {
          return aIsLocal ? -1 : 1;
        }
        const sourceBoostA = isPublishedLocalApp(a) ? 2000 : a.source === "local" ? 1000 : 0;
        const sourceBoostB = isPublishedLocalApp(b) ? 2000 : b.source === "local" ? 1000 : 0;
        const aScore = sourceBoostA + a.downloads + (a.rating ?? 0) * 100 + a.reviews * 5;
        const bScore = sourceBoostB + b.downloads + (b.rating ?? 0) * 100 + b.reviews * 5;
        return bScore - aScore;
      });
  }

  return result;
}

export { appAccent, normalizeSlug };
export { appMetrics, formatBytes, formatDate, formatDownloads };
