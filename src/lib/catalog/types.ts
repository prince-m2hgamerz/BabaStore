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
  accent: string;
  tags: string[];
  screenshots: string[];
  changelog: string[];
  status: "draft" | "published" | "rejected" | "flagged";
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
