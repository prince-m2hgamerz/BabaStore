const API_BASE = "https://babastore.m2hgamerz.workers.dev/api/7";
const FETCH_TIMEOUT = 6000;

type FeedApp = {
  id?: number | string;
  name?: string;
  app?: string;
  package?: string;
  uname?: string;
  size?: number;
  icon?: string;
  graphic?: string;
  added?: string;
  modified?: string;
  updated?: string;
  uptype?: string;
  developer?: { id?: number; name?: string; website?: string; email?: string; privacy?: string };
  store?: { id?: number; name?: string; avatar?: string; appearance?: { theme?: string; description?: string }; stats?: { apps?: number; subscribers?: number; downloads?: number } };
  file?: {
    vername?: string;
    vercode?: number;
    filesize?: number;
    md5sum?: string;
    path?: string;
    path_alt?: string;
    added?: string;
    tags?: string[];
    signature?: { sha1?: string; owner?: string };
    malware?: { rank?: string; reason?: unknown; added?: string; modified?: string };
    hardware?: Record<string, unknown>;
    used_permissions?: string[];
    used_features?: string[];
    flags?: Record<string, unknown>;
  };
  media?: {
    description?: string;
    summary?: string;
    news?: string;
    keywords?: string[];
    screenshots?: { url?: string; height?: number; width?: number }[];
    videos?: { type?: string; url?: string; thumbnail?: string }[];
  };
  stats?: {
    downloads?: number;
    pdownloads?: number;
    rating?: { avg?: number; total?: number; votes?: { value?: number; count?: number }[] };
    prating?: { avg?: number; total?: number };
  };
  age?: { name?: string; title?: string; pegi?: string; rating?: number };
  obb?: Record<string, unknown>;
  appcoins?: { advertising?: boolean; billing?: boolean; flags?: unknown[] };
  urls?: Record<string, string>;
  has_versions?: boolean;
};

type SearchResponse = {
  info: Record<string, unknown>;
  datalist: {
    total: number;
    count: number;
    offset: number;
    limit: number;
    next: number | null;
    hidden: number;
    loaded: boolean;
    list: FeedApp[];
  };
};

type MetaResponse = {
  info: Record<string, unknown>;
  data: FeedApp;
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
  const id = a.id?.toString() || "";
  const date = a.updated || a.modified || a.added || "";
  const rating = a.stats?.prating?.avg ?? a.stats?.rating?.avg ?? null;
  const reviews = a.stats?.prating?.total ?? a.stats?.rating?.total ?? 0;
  const downloads = a.stats?.pdownloads ?? a.stats?.downloads ?? 0;
  const version = a.file?.vername ?? "Latest";
  const description = a.media?.description || "";
  const summary = a.media?.summary || description.slice(0, 160);
  return {
    id: `babastore:${id || pkg}`,
    slug: `app-${id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    name,
    packageName: pkg,
    developer: a.developer?.name || a.store?.name || "BabaStore",
    developerId: a.developer?.id?.toString() || "0",
    version,
    rating,
    reviews,
    downloads,
    sizeBytes: a.file?.filesize ?? a.size ?? null,
    updatedAt: date,
    description: description.slice(0, 1000),
    summary: summary.slice(0, 300),
    tags: a.media?.keywords || a.file?.tags || [],
    iconUrl: a.icon ?? null,
    bannerUrl: a.graphic ?? null,
    category: categoryFromKeywords(a.media?.keywords),
  };
}

function categoryFromKeywords(keywords?: string[]): string {
  if (!keywords?.length) return "Apps";
  const text = keywords.join(" ").toLowerCase();
  if (text.includes("game")) return "Games";
  if (text.includes("vpn")) return "VPN";
  if (text.includes("ai") || text.includes("chatbot") || text.includes("intelligence")) return "AI";
  if (text.includes("social") || text.includes("chat") || text.includes("message")) return "Social";
  if (text.includes("photo") || text.includes("video") || text.includes("music") || text.includes("entertain")) return "Entertainment";
  if (text.includes("learn") || text.includes("education") || text.includes("teach")) return "Education";
  if (text.includes("tool") || text.includes("utility") || text.includes("manager") || text.includes("editor")) return "Tools";
  if (text.includes("communication") || text.includes("call") || text.includes("dialer")) return "Communication";
  return "Apps";
}

export type BotApp = ReturnType<typeof mapApp>;

export async function searchApps(query: string, limit = 10): Promise<BotApp[]> {
  const path = `/apps/search/query=${encodeURIComponent(query)}/limit=${limit}`;
  const data = await apiFetch<SearchResponse>(path);
  return (data.datalist?.list || []).map(mapApp).filter(Boolean);
}

export async function searchAppsAll(query: string, limit = 100): Promise<BotApp[]> {
  const path = `/apps/search/query=${encodeURIComponent(query)}/limit=${limit}`;
  const data = await apiFetch<SearchResponse>(path);
  return (data.datalist?.list || []).map(mapApp).filter(Boolean);
}

export async function getAppByPackage(pkg: string): Promise<BotApp | null> {
  try {
    const data = await apiFetch<MetaResponse>(`/app/getMeta/package_name=${encodeURIComponent(pkg)}`);
    if (data.data) return mapApp(data.data);
    return null;
  } catch {
    return null;
  }
}

export async function getAppById(id: string): Promise<BotApp | null> {
  try {
    const data = await apiFetch<MetaResponse>(`/app/getMeta/app_id=${encodeURIComponent(id)}`);
    if (data.data) return mapApp(data.data);
    return null;
  } catch {
    return null;
  }
}

export async function listApps(store = "apps", limit = 10): Promise<BotApp[]> {
  const path = `/listApps/store_name=${encodeURIComponent(store)}/limit=${limit}`;
  const data = await apiFetch<SearchResponse>(path);
  return (data.datalist?.list || []).map(mapApp).filter(Boolean);
}

export async function getStoreApps(store: string, limit = 20): Promise<BotApp[]> {
  const path = `/apps/get/store_name=${encodeURIComponent(store)}/limit=${limit}`;
  const data = await apiFetch<SearchResponse>(path);
  return (data.datalist?.list || []).map(mapApp).filter(Boolean);
}

export async function searchByCategory(store: string, category: string, limit = 10): Promise<BotApp[]> {
  const all = await getStoreApps(store, 100);
  const cat = category.toLowerCase();
  return all.filter((a) => a.category.toLowerCase() === cat).slice(0, limit);
}

const CATEGORY_QUERIES: Record<string, string> = {
  games: "games",
  vpn: "vpn",
  ai: "ai",
  social: "social",
  entertainment: "entertainment",
  education: "education",
  tools: "tools",
  communication: "communication",
};

export const CATEGORY_NAMES = Object.keys(CATEGORY_QUERIES);

export function resolveCategory(input: string): string | null {
  const key = input.toLowerCase().trim();
  if (CATEGORY_QUERIES[key]) return key;
  for (const name of CATEGORY_NAMES) {
    if (name.startsWith(key)) return name;
  }
  return null;
}

export async function browseCategory(category: string, limit = 10): Promise<BotApp[]> {
  const query = CATEGORY_QUERIES[category.toLowerCase()];
  if (!query) return [];
  return searchApps(query, limit);
}

export async function getCategoryCount(category: string): Promise<number> {
  const query = CATEGORY_QUERIES[category.toLowerCase()];
  if (!query) return 0;
  try {
    const path = `/apps/search/query=${encodeURIComponent(query)}/limit=1`;
    const data = await apiFetch<SearchResponse>(path);
    return data.datalist?.total ?? 0;
  } catch {
    return 0;
  }
}
