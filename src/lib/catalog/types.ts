export type CatalogApp = {
  id: string;
  slug: string;
  name: string;
  developer: string;
  developerId: string;
  packageName: string;
  version: string;
  category: string;
  categorySlug: string;
  summary: string | null;
  description: string;
  privacyPolicyUrl: string | null;
  rating: number | null;
  reviews: number;
  downloads: number;
  sizeBytes: number | null;
  updatedAt: string;
  apkUrl: string | null;
  iconUrl: string | null;
  bannerUrl?: string | null;
  accent: string;
  tags: string[];
  screenshots: string[];
  changelog: string[];
  status: "draft" | "published" | "rejected" | "flagged";
  source?: CatalogSource;
  sourceLabel?: string;
  externalUrl?: string | null;
  storeName?: string | null;
  ageRating?: string | null;
  malwareRank?: string | null;
  versions?: CatalogAppVersion[];
  reviewItems?: CatalogReview[];
};

export type CatalogFilters = {
  query?: string;
  category?: string;
  store?: string;
  source?: CatalogSource | "all";
  language?: string;
  mature?: boolean;
  minRating?: number;
  size?: "all" | "small" | "medium" | "large";
  updated?: "all" | "week" | "month" | "quarter";
  sort?: "featured" | "popularity" | "rating" | "downloads" | "newest" | "size";
};

export type CategorySummary = {
  name: string;
  slug: string;
  count: number;
};

export type CatalogSource = "local" | "catalog";

export type CatalogAppVersion = {
  id: string;
  version: string;
  versionCode?: number | null;
  sizeBytes: number | null;
  updatedAt: string;
  apkUrl: string | null;
  malwareRank?: string | null;
};

export type CatalogReview = {
  id: string;
  author: string;
  rating: number | null;
  title: string | null;
  body: string | null;
  createdAt: string;
  avatarUrl?: string | null;
};

export type CatalogStore = {
  source: CatalogSource;
  id: string;
  name: string;
  title: string;
  description: string | null;
  avatarUrl: string | null;
  url: string | null;
  appCount: number;
  subscribers: number;
  downloads: number;
  reviews: number;
  badge: string | null;
  updatedAt: string;
};

export type CatalogLookup = {
  slug?: string;
  packageName?: string;
  appId?: string;
  apkId?: string;
  md5?: string;
};

export type CatalogQuery = CatalogFilters & {
  limit?: number;
  offset?: number;
};

export type CatalogResult = {
  apps: CatalogApp[];
  total: number;
  nextOffset: number | null;
  sources: CatalogSource[];
};
