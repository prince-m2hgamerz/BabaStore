import type {
  CatalogApp,
  CatalogAppVersion,
  CatalogLookup,
  CatalogQuery,
  CatalogReview,
  CatalogSource,
  CatalogStore
} from "@/lib/catalog/types";

export type ProviderListResult = {
  apps: CatalogApp[];
  total?: number;
  nextOffset?: number | null;
};

export type CatalogProvider = {
  source: CatalogSource;
  listApps(query: CatalogQuery): Promise<ProviderListResult>;
  getApp(lookup: string | CatalogLookup): Promise<CatalogApp | null>;
  getDownloadUrl?(lookup: string | CatalogLookup): Promise<string | null>;
  getAssetUrl?(asset: string, lookup: string | CatalogLookup): Promise<string | null>;
  getVersions?(packageName: string): Promise<CatalogAppVersion[]>;
  getReviews?(packageName: string): Promise<CatalogReview[]>;
  getRecommended?(packageName: string, limit?: number): Promise<CatalogApp[]>;
  getStore?(storeName: string): Promise<CatalogStore | null>;
};
