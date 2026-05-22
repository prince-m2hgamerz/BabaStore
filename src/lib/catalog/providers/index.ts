import { babaStoreFeedProvider } from "@/lib/catalog/providers/babastore-feed";
import type { CatalogProvider } from "@/lib/catalog/providers/types";

export const externalProviders: CatalogProvider[] = [babaStoreFeedProvider];

export type { CatalogProvider, ProviderListResult } from "@/lib/catalog/providers/types";
