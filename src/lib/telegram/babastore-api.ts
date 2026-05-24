const API_BASE = "https://babastore.m2hgamerz.workers.dev/api/7";

const FETCH_TIMEOUT = 6000;

type FeedApp = {
  id?: string;
  name?: string;
  package?: string;
  app?: string;
  icon?: string;
  graphic?: string;
  size?: number;
  updated?: string;
  modified?: string;
  added?: string;
  developer?: { name?: string; id?: string };
  store?: { name?: string; app?: string; appearance?: { description?: string } };
  file?: {
    vername?: string;
    vercode?: number;
    filesize?: number;
    md5sum?: string;
    path?: string;
    path_alt?: string;
    added?: string;
    tags?: string[];
    malware?: { rank?: number };
  };
  media?: {
    description?: string;
    summary?: string;
    news?: string;
    keywords?: string[];
    screenshots?: { url?: string }[];
  };
  stats?: {
    pdownloads?: number;
    downloads?: number;
    prating?: { avg?: number; total?: number };
    rating?: { avg?: number; total?: number };
  };
  age?: { title?: string; name?: string };
};

type ApiResponse = {
  app?: FeedApp;
  apps?: FeedApp[];
  total?: number;
  count?: number;
  data?: FeedApp[];
};

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  });
  if (!res.ok) throw new Error(`BabaStore API error ${res.status}: ${res.statusText}`);
  return res.json() as T;
}

function mapApp(a: FeedApp) {
  const name = a.name || a.app || "Unknown";
  const pkg = a.package || "";
  const id = a.id || "";
  const slug = `app-${id}-${name.toLowerCase().replace(/\s+/g, "-")}`;
  const rating = a.stats?.prating?.avg ?? a.stats?.rating?.avg ?? null;
  const reviews = a.stats?.prating?.total ?? a.stats?.rating?.total ?? 0;
  const downloads = a.stats?.pdownloads ?? a.stats?.downloads ?? 0;
  const version = a.file?.vername ?? "Latest";
  const developer = a.developer?.name || a.store?.name || "BabaStore";
  const description = a.media?.description || a.store?.appearance?.description || "";
  const summary = a.media?.summary || description.slice(0, 160);
  const tags = [...(a.media?.keywords ?? []), ...(a.file?.tags ?? [])];
  return {
    id: `babastore:${id || pkg}`,
    slug,
    name,
    packageName: pkg,
    developer,
    version,
    rating,
    reviews,
    downloads,
    sizeBytes: a.file?.filesize ?? a.size ?? null,
    updatedAt: a.updated ?? a.modified ?? a.file?.added ?? a.added ?? "",
    description,
    summary: summary.slice(0, 300),
    tags: tags.slice(0, 10),
    iconUrl: a.icon ?? null,
    bannerUrl: a.graphic ?? null,
  };
}

export type BotApp = ReturnType<typeof mapApp>;

export async function searchApps(query: string, limit = 10): Promise<BotApp[]> {
  const path = `/apps/search/query=${encodeURIComponent(query)}/limit=${limit}`;
  const data = await apiFetch<ApiResponse>(path);
  const apps = data.apps || data.data || [];
  return apps.map(mapApp).filter(Boolean);
}

export async function getAppByPackage(pkg: string): Promise<BotApp | null> {
  try {
    const data = await apiFetch<ApiResponse>(`/app/getMeta/package_name=${encodeURIComponent(pkg)}`);
    if (data.app) return mapApp(data.app);
    if (data.apps?.length) return mapApp(data.apps[0]!);
    return null;
  } catch {
    return null;
  }
}

export async function getAppById(id: string): Promise<BotApp | null> {
  try {
    const data = await apiFetch<ApiResponse>(`/app/getMeta/app_id=${encodeURIComponent(id)}`);
    if (data.app) return mapApp(data.app);
    return null;
  } catch {
    return null;
  }
}

export async function listApps(store = "apps", limit = 10): Promise<BotApp[]> {
  const path = `/listApps/store_name=${encodeURIComponent(store)}/limit=${limit}`;
  const data = await apiFetch<ApiResponse>(path);
  const apps = data.apps || data.data || [];
  return apps.map(mapApp).filter(Boolean);
}

export async function getStoreApps(store: string, limit = 10): Promise<BotApp[]> {
  const path = `/apps/get/store_name=${encodeURIComponent(store)}/limit=${limit}`;
  const data = await apiFetch<ApiResponse>(path);
  const apps = data.apps || data.data || [];
  return apps.map(mapApp).filter(Boolean);
}

export async function getAppVersions(pkg: string) {
  const data = await apiFetch<{
    versions?: { vername?: string; vercode?: number; filesize?: number; added?: string }[];
  }>(`/app/getVersions/package_name=${encodeURIComponent(pkg)}`);
  return data.versions || [];
}

const CATEGORY_MAP: Record<string, string> = {
  games: "games",
  vpn: "vpn",
  ai: "ai",
  social: "social",
  entertainment: "entertainment",
  education: "education",
  tools: "tools",
  communication: "communication",
};

export const CATEGORY_NAMES = Object.keys(CATEGORY_MAP);

export function resolveCategory(input: string): string | null {
  const key = input.toLowerCase().trim();
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key]!;
  for (const [name, query] of Object.entries(CATEGORY_MAP)) {
    if (name.startsWith(key)) return query;
    if (query.startsWith(key)) return query;
  }
  return null;
}

export async function browseCategory(category: string, limit = 10): Promise<BotApp[]> {
  const query = CATEGORY_MAP[category.toLowerCase()];
  if (!query) return [];
  return searchApps(query, limit);
}

export async function getCategoryCount(category: string): Promise<number> {
  const query = CATEGORY_MAP[category.toLowerCase()];
  if (!query) return 0;
  try {
    const path = `/apps/search/query=${encodeURIComponent(query)}/limit=1`;
    const data = await apiFetch<ApiResponse>(path);
    return data.total ?? data.count ?? 0;
  } catch {
    return 0;
  }
}
