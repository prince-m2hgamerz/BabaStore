import {
  cached,
  safeDate,
  safeNumber
} from "@/lib/catalog/cache";
import { normalizeSlug } from "@/lib/catalog/utils";
import type {
  CatalogApp,
  CatalogLookup,
  CatalogAppVersion,
  CatalogStore,
  CatalogQuery
} from "@/lib/catalog/types";
import type { CatalogProvider, ProviderListResult } from "@/lib/catalog/providers/types";

const DEFAULT_FEED_BASE = "https://babastore.m2hgamerz.workers.dev/api/7";
const SEARCH_BASE = process.env.BABASTORE_FEED_SEARCH_URL || DEFAULT_FEED_BASE;
const META_BASE = process.env.BABASTORE_FEED_META_URL || SEARCH_BASE;
const DEFAULT_LIMIT = 24;
const CACHE_TTL = 1000 * 60 * 10;

type FeedApp = {
  id?: number;
  name?: string;
  package?: string;
  size?: number;
  icon?: string | null;
  graphic?: string | null;
  added?: string;
  modified?: string;
  updated?: string;
  developer?: {
    id?: number;
    name?: string;
    privacy?: string | null;
  } | null;
  store?: {
    name?: string;
    appearance?: {
      description?: string | null;
    } | null;
  } | null;
  file?: {
    vername?: string;
    vercode?: number;
    md5sum?: string;
    filesize?: number;
    added?: string;
    path?: string | null;
    path_alt?: string | null;
    malware?: {
      rank?: string;
    } | null;
    tags?: string[];
  } | null;
  stats?: {
    downloads?: number;
    pdownloads?: number;
    rating?: {
      avg?: number;
      total?: number;
    };
    prating?: {
      avg?: number;
      total?: number;
    };
  } | null;
  age?: {
    title?: string;
    name?: string;
  } | null;
  media?: {
    keywords?: string[];
    description?: string | null;
    summary?: string | null;
    news?: string | null;
    screenshots?: Array<{ url?: string | null }>;
  } | null;
  urls?: {
    w?: string | null;
    m?: string | null;
  } | null;
};

type FeedStore = {
  id?: number;
  name?: string;
  avatar?: string | null;
  added?: string;
  modified?: string;
  appearance?: {
    description?: string | null;
  } | null;
  stats?: {
    apps?: number;
    subscribers?: number;
    downloads?: number;
    reviews?: number;
  } | null;
  badge?: {
    name?: string | null;
  } | null;
  urls?: {
    mobile?: string | null;
  } | null;
  user?: {
    name?: string | null;
  } | null;
};

type FeedListResponse = {
  datalist?: {
    total?: number;
    next?: number | null;
    list?: FeedApp[];
  };
  list?: FeedApp[];
};

type FeedMetaResponse = {
  data?: FeedApp;
};

type FeedStoreResponse = {
  data?: FeedStore;
};

type FeedReviewsResponse = {
  datalist?: {
    list?: Array<{
      id?: number;
      title?: string | null;
      body?: string | null;
      added?: string;
      user?: {
        name?: string | null;
        avatar?: string | null;
      } | null;
      stats?: {
        rating?: number;
      } | null;
    }>;
  };
};

function endpoint(base: string, path: string) {
  return `${base}${path}`;
}

async function feedFetch<T>(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    },
    next: {
      revalidate: 600
    }
  });

  if (!response.ok) {
    throw new Error(`Catalog request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

function shortText(value: string, limit = 160) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit - 1).trim()}...`;
}

function categoryFromApp(app: FeedApp) {
  const keywords = app.media?.keywords ?? app.file?.tags ?? [];
  const text = [app.name, app.store?.appearance?.description, ...keywords]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("game")) return "Games";
  if (text.includes("vpn")) return "VPN";
  if (text.includes("ai") || text.includes("chatbot")) return "AI";
  if (text.includes("social") || text.includes("chat") || text.includes("message")) return "Social";
  if (text.includes("photo") || text.includes("video")) return "Entertainment";
  if (text.includes("learn") || text.includes("education")) return "Education";
  return "Apps";
}

function appAccent(seed: string) {
  const accents = [
    "linear-gradient(135deg, #007cf0, #00dfd8)",
    "linear-gradient(135deg, #111827, #4f46e5)",
    "linear-gradient(135deg, #16a34a, #84cc16)",
    "linear-gradient(135deg, #f97316, #ef4444)"
  ];
  const index = seed
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0) % accents.length;

  return accents[index];
}

function lineItems(value: string | null | undefined) {
  return (value ?? "")
    .split(/\r?\n|•/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function publicDownloadPath(app: FeedApp) {
  return app.id && app.name ? `/api/download/app-${app.id}-${normalizeSlug(app.name)}` : null;
}

function privateDownloadUrl(app: FeedApp) {
  return app.file?.path ?? app.file?.path_alt ?? null;
}

function assetPath(app: FeedApp, asset: "icon" | "banner" | "screenshot", index = 0) {
  return app.id && app.name
    ? `/api/catalog/assets/${asset}/app-${app.id}-${normalizeSlug(app.name)}${asset === "screenshot" ? `?index=${index}` : ""}`
    : null;
}

function privateAssetUrl(app: FeedApp, asset: string, index = 0) {
  if (asset === "icon") return app.icon ?? null;
  if (asset === "banner") return app.graphic ?? null;
  if (asset === "screenshot") return app.media?.screenshots?.[index]?.url ?? null;
  return null;
}

function mapFeedVersion(app: FeedApp, downloadPath?: string | null): CatalogAppVersion | null {
  const packageName = app.package;

  if (!packageName) {
    return null;
  }

  const version = app.file?.vername ?? "Latest";

  return {
    id: `babastore:${app.file?.md5sum ?? app.id ?? packageName}`,
    version,
    versionCode: app.file?.vercode ?? null,
    sizeBytes: app.file?.filesize ?? app.size ?? null,
    updatedAt: safeDate(app.updated ?? app.modified ?? app.file?.added ?? app.added),
    apkUrl: downloadPath ?? publicDownloadPath(app),
    malwareRank: app.file?.malware?.rank ?? null
  };
}

function mapFeedApp(app: FeedApp, categoryOverride?: string): CatalogApp | null {
  const packageName = app.package;
  const name = app.name;

  if (!packageName || !name) {
    return null;
  }

  const category = categoryOverride ?? categoryFromApp(app);
  const description =
    app.media?.description?.trim() ||
    app.store?.appearance?.description?.trim() ||
    `${name} Android APK listing from BabaStore.`;
  const rating = app.stats?.prating?.avg ?? app.stats?.rating?.avg ?? null;
  const reviews = app.stats?.prating?.total ?? app.stats?.rating?.total ?? 0;
  const updatedAt = safeDate(app.updated ?? app.modified ?? app.file?.added ?? app.added);
  const version = app.file?.vername ?? "Latest";
  const slug = `app-${app.id ?? normalizeSlug(packageName)}-${normalizeSlug(name)}`;
  const downloadPath = publicDownloadPath(app) ?? `/api/download/${slug}`;
  const screenshots = (app.media?.screenshots ?? [])
    .map((_, index) => assetPath(app, "screenshot", index))
    .filter((url): url is string => Boolean(url))
    .slice(0, 10);
  const tags = Array.from(
    new Set([...(app.media?.keywords ?? []), ...(app.file?.tags ?? []), category])
  ).slice(0, 10);

  return {
    id: `babastore:${app.id ?? packageName}`,
    slug,
    name,
    developer: app.developer?.name ?? app.store?.name ?? "BabaStore",
    developerId: app.developer?.id ? `babastore:${app.developer.id}` : "babastore",
    packageName,
    version,
    category,
    categorySlug: normalizeSlug(category),
    summary: shortText(app.media?.summary || description),
    description,
    privacyPolicyUrl: null,
    rating: rating === null ? null : safeNumber(rating, 0),
    reviews: safeNumber(reviews),
    downloads: safeNumber(app.stats?.pdownloads ?? app.stats?.downloads),
    sizeBytes: app.file?.filesize ?? app.size ?? null,
    updatedAt,
    apkUrl: downloadPath,
    iconUrl: assetPath(app, "icon"),
    bannerUrl: assetPath(app, "banner"),
    accent: appAccent(packageName),
    tags,
    screenshots,
    changelog: lineItems(app.media?.news),
    status: "published",
    source: "catalog",
    sourceLabel: "BabaStore",
    externalUrl: null,
    storeName: "BabaStore",
    ageRating: app.age?.title ?? app.age?.name ?? null,
    malwareRank: app.file?.malware?.rank ?? null,
    versions: [mapFeedVersion(app, downloadPath)].filter((item): item is CatalogAppVersion => Boolean(item))
  };
}

function mapFeedStore(store: FeedStore): CatalogStore | null {
  const name = store.name;

  if (!name) {
    return null;
  }

  return {
    source: "catalog",
    id: `babastore-store:${store.id ?? name}`,
    name: "BabaStore",
    title: "BabaStore",
    description: store.appearance?.description?.trim() || null,
    avatarUrl: null,
    url: null,
    appCount: safeNumber(store.stats?.apps),
    subscribers: safeNumber(store.stats?.subscribers),
    downloads: safeNumber(store.stats?.downloads),
    reviews: safeNumber(store.stats?.reviews),
    badge: store.badge?.name ? "Verified" : null,
    updatedAt: safeDate(store.modified ?? store.added)
  };
}

function mergeMappedApps(apps: CatalogApp[]) {
  const seenPackages = new Set<string>();
  const seenIds = new Set<string>();
  const result: CatalogApp[] = [];

  apps.forEach((app) => {
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

async function loadFeedVersions(packageName: string) {
  if (!SEARCH_BASE) return [];
  const payload = await feedFetch<FeedListResponse>(
    endpoint(SEARCH_BASE, `/app/getVersions/package_name=${encodeURIComponent(packageName)}`)
  );

  return (payload.datalist?.list ?? payload.list ?? [])
    .map((item) => mapFeedVersion(item))
    .filter((item): item is CatalogAppVersion => Boolean(item))
    .slice(0, 8);
}

async function loadFeedReviews(packageName: string) {
  if (!SEARCH_BASE) return [];
  const payload = await feedFetch<FeedReviewsResponse>(
    endpoint(SEARCH_BASE, `/reviews/get/package_name=${encodeURIComponent(packageName)}/limit=10`)
  );

  return (payload.datalist?.list ?? []).map((review) => ({
    id: `babastore:${review.id ?? crypto.randomUUID()}`,
    author: review.user?.name || "BabaStore user",
    rating: review.stats?.rating ?? null,
    title: review.title ?? null,
    body: review.body ?? null,
    createdAt: safeDate(review.added),
    avatarUrl: null
  }));
}

async function loadFeedRecommended(packageName: string, limit = 8) {
  if (!SEARCH_BASE) return [];
  const payload = await feedFetch<FeedListResponse>(
    endpoint(
      SEARCH_BASE,
      `/apps/getRecommended/package_name=${encodeURIComponent(packageName)}/limit=${limit}`
    )
  );

  return (payload.datalist?.list ?? payload.list ?? [])
    .map((item) => mapFeedApp(item))
    .filter((item): item is CatalogApp => Boolean(item))
    .slice(0, limit);
}

function listAppsEndpoint(storeName: string, limit: number, offset: number) {
  return endpoint(
    SEARCH_BASE,
    `/listApps/store_name=${encodeURIComponent(storeName)}/limit=${limit}/offset=${offset}`
  );
}

function storeAppsEndpoint(storeName: string, limit: number, offset: number) {
  return endpoint(
    SEARCH_BASE,
    `/apps/get/store_name=${encodeURIComponent(storeName)}/limit=${limit}/offset=${offset}`
  );
}

function queryEndpoints(query: CatalogQuery) {
  const limit = Math.min(Math.max(query.limit ?? DEFAULT_LIMIT, 1), 100);
  const offset = Math.max(query.offset ?? 0, 0);
  const search = query.query?.trim();
  const category = query.category && query.category !== "all" ? query.category : "";
  const language = query.language?.trim() || "en";
  const mature = query.mature ? "/mature=true" : "";
  const store = query.store?.trim();

  if (store) {
    return [
      storeAppsEndpoint(store, limit, offset),
      listAppsEndpoint(store, limit, offset)
    ];
  }

  if (search) {
    return [
      endpoint(
        SEARCH_BASE,
        `/apps/search/query=${encodeURIComponent(search)}/lang=${encodeURIComponent(language)}/limit=${limit}/offset=${offset}${mature}`
      ),
      listAppsEndpoint("apps", limit, offset),
      listAppsEndpoint("babastore", limit, offset),
      storeAppsEndpoint("babastore", limit, offset)
    ];
  }

  if (category) {
    return [
      endpoint(
        SEARCH_BASE,
        `/apps/search/query=${encodeURIComponent(category)}/lang=${encodeURIComponent(language)}/limit=${limit}/offset=${offset}${mature}`
      ),
      listAppsEndpoint("apps", limit, offset),
      listAppsEndpoint("babastore", limit, offset),
      storeAppsEndpoint("babastore", limit, offset)
    ];
  }

  return [
    listAppsEndpoint("apps", limit, offset),
    listAppsEndpoint("babastore", limit, offset),
    storeAppsEndpoint("babastore", limit, offset)
  ];
}

function lookupFromInput(input: string | CatalogLookup): CatalogLookup {
  if (typeof input !== "string") {
    return input;
  }

  const normalized = input.replace(/^app-/, "");
  const idMatch = normalized.match(/^(\d+)/);
  const packageMatch = input.match(/([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+)/);

  return {
    slug: input,
    appId: idMatch?.[1],
    packageName: packageMatch?.[1] ?? input
  };
}

function lookupPath(lookup: CatalogLookup) {
  if (lookup.appId) {
    return `/app/getMeta/app_id=${encodeURIComponent(lookup.appId)}`;
  }

  if (lookup.apkId) {
    return `/app/getMeta/apk_id=${encodeURIComponent(lookup.apkId)}`;
  }

  if (lookup.md5) {
    return `/app/getMeta/apk_md5sum=${encodeURIComponent(lookup.md5)}`;
  }

  const packageName = lookup.packageName ?? lookup.slug ?? "";
  return `/app/getMeta/package_name=${encodeURIComponent(packageName)}`;
}

function lookupCacheKey(lookup: CatalogLookup) {
  return lookup.appId
    ? `app:${lookup.appId}`
    : lookup.apkId
      ? `apk:${lookup.apkId}`
      : lookup.md5
        ? `md5:${lookup.md5}`
        : `package:${lookup.packageName ?? lookup.slug}`;
}

export const babaStoreFeedProvider: CatalogProvider = {
  source: "catalog",

  async listApps(query: CatalogQuery): Promise<ProviderListResult> {
    if (!SEARCH_BASE) {
      return { apps: [], total: 0, nextOffset: null };
    }

    const urls = queryEndpoints(query);
    return cached(`babastore:list:${urls.join("|")}`, CACHE_TTL, async () => {
      const responses = await Promise.allSettled(
        urls.map((url) => feedFetch<FeedListResponse>(url))
      );
      const fulfilled = responses.filter(
        (response): response is PromiseFulfilledResult<FeedListResponse> =>
          response.status === "fulfilled"
      );
      const category =
        query.category && query.category !== "all"
          ? query.category
              .split("-")
              .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
              .join(" ")
          : undefined;
      const list = fulfilled.flatMap((response) => response.value.datalist?.list ?? response.value.list ?? []);
      const apps = mergeMappedApps(list
        .map((item) => mapFeedApp(item, category))
        .filter((item): item is CatalogApp => Boolean(item)));
      const total = fulfilled.reduce(
        (sum, response) =>
          sum + (response.value.datalist?.total ?? response.value.datalist?.list?.length ?? response.value.list?.length ?? 0),
        0
      );
      const nextOffset =
        fulfilled
          .map((response) => response.value.datalist?.next ?? null)
          .find((value): value is number => typeof value === "number") ?? null;

      return {
        apps,
        total: Math.max(total, apps.length),
        nextOffset
      };
    });
  },

  async getApp(input: string | CatalogLookup) {
    const lookup = lookupFromInput(input);

    if (!META_BASE) return null;

    return cached(`babastore:meta:${lookupCacheKey(lookup)}`, CACHE_TTL, async () => {
      const payload = await feedFetch<FeedMetaResponse>(
        endpoint(META_BASE, lookupPath(lookup))
      );
      const app = payload.data ? mapFeedApp(payload.data) : null;

      if (!app) return null;

      const [versions, reviews, recommended] = await Promise.all([
        loadFeedVersions(app.packageName).catch(() => []),
        loadFeedReviews(app.packageName).catch(() => []),
        loadFeedRecommended(app.packageName, 8).catch(() => [])
      ]);

      return {
        ...app,
        versions: versions.length
          ? versions.map((version) => ({ ...version, apkUrl: app.apkUrl }))
          : app.versions,
        reviewItems: reviews,
        reviews: app.reviews || reviews.length,
        tags: app.tags.length ? app.tags : recommended.slice(0, 4).map((item) => item.category)
      };
    });
  },

  async getDownloadUrl(input: string | CatalogLookup) {
    const lookup = lookupFromInput(input);

    if (!META_BASE) return null;

    return cached(`babastore:download:${lookupCacheKey(lookup)}`, CACHE_TTL, async () => {
      const payload = await feedFetch<FeedMetaResponse>(
        endpoint(META_BASE, lookupPath(lookup))
      );

      return payload.data ? privateDownloadUrl(payload.data) : null;
    });
  },

  async getAssetUrl(asset: string, input: string | CatalogLookup) {
    const lookup = lookupFromInput(input);

    if (!META_BASE) return null;

    return cached(`babastore:asset:${asset}:${lookupCacheKey(lookup)}`, CACHE_TTL, async () => {
      const [assetName, indexValue] = asset.split(":");
      const index = Number(indexValue ?? "0") || 0;
      const payload = await feedFetch<FeedMetaResponse>(
        endpoint(META_BASE, lookupPath(lookup))
      );

      return payload.data ? privateAssetUrl(payload.data, assetName, index) : null;
    });
  },

  async getVersions(packageName: string) {
    return cached(`babastore:versions:${packageName}`, CACHE_TTL, async () => {
      return loadFeedVersions(packageName);
    });
  },

  async getReviews(packageName: string) {
    return cached(`babastore:reviews:${packageName}`, CACHE_TTL, async () => {
      return loadFeedReviews(packageName);
    });
  },

  async getRecommended(packageName: string, limit = 8) {
    return cached(`babastore:recommended:${packageName}:${limit}`, CACHE_TTL, async () => {
      return loadFeedRecommended(packageName, limit);
    });
  },

  async getStore(storeName: string) {
    if (!SEARCH_BASE) return null;

    return cached(`babastore:store:${storeName}`, CACHE_TTL, async () => {
      const payload = await feedFetch<FeedStoreResponse>(
        endpoint(SEARCH_BASE, `/store/getMeta/store_name=${encodeURIComponent(storeName)}`)
      );

      return payload.data ? mapFeedStore(payload.data) : null;
    });
  }
};
