import type { CatalogApp } from "@/lib/catalog/types";

export function formatDownloads(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(value >= 10_000_000_000 ? 0 : 1)}B`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }

  return String(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function formatBytes(value: number | null) {
  if (value === null) {
    return "Not set";
  }

  if (value >= 1024 * 1024 * 1024) {
    return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  return `${Math.max(1, Math.round(value / 1024 / 1024))} MB`;
}

export function appMetrics(app: CatalogApp) {
  return {
    rating: app.rating === null ? "No ratings" : app.rating.toFixed(1),
    reviews: formatDownloads(app.reviews),
    downloads: formatDownloads(app.downloads),
    size: formatBytes(app.sizeBytes)
  };
}
