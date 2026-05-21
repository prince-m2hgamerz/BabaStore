export type CatalogApp = {
  id: string;
  slug: string;
  name: string;
  developer: string;
  packageName: string;
  version: string;
  category: string;
  summary: string;
  description: string;
  rating: number;
  reviews: number;
  downloads: number;
  sizeMb: number;
  updatedAt: string;
  apkUrl: string | null;
  iconUrl: string | null;
  accent: string;
  tags: string[];
  screenshots: string[];
  changelog: string[];
  status: "published";
};

export type CatalogFilters = {
  query?: string;
  category?: string;
  minRating?: number;
  size?: "all" | "small" | "medium" | "large";
  updated?: "all" | "week" | "month" | "quarter";
  sort?: "featured" | "rating" | "downloads" | "newest" | "size";
};

export type CategorySummary = {
  name: string;
  slug: string;
  count: number;
};

