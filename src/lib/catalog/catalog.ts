import { createClient } from "@/lib/supabase/server";
import { seedApps } from "@/lib/catalog/seed";
import type { CatalogApp, CatalogFilters, CategorySummary } from "@/lib/catalog/types";

function isSupabaseReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

async function getSupabaseApps(): Promise<CatalogApp[]> {
  if (!isSupabaseReady()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("apps")
      .select(
        "id, name, package_name, version, description, tags, apk_url, icon_url, status, updated_at, categories(name)"
      )
      .eq("status", "published")
      .order("updated_at", { ascending: false });

    if (error || !data?.length) {
      return [];
    }

    return data.map((app, index) => {
      const category = Array.isArray(app.categories)
        ? app.categories[0]?.name
        : app.categories?.name;
      const seed = seedApps[index % seedApps.length];

      return {
        id: app.id,
        slug: normalizeSlug(app.name),
        name: app.name,
        developer: "Verified developer",
        packageName: app.package_name,
        version: app.version,
        category: category ?? "Tools",
        summary:
          app.description?.slice(0, 132) ||
          "Published Android app available on BabaSwift AppStore.",
        description:
          app.description ||
          "This app was published by a verified BabaSwift developer.",
        rating: seed.rating,
        reviews: seed.reviews,
        downloads: seed.downloads,
        sizeMb: seed.sizeMb,
        updatedAt: app.updated_at,
        apkUrl: app.apk_url,
        iconUrl: app.icon_url,
        accent: seed.accent,
        tags: app.tags?.length ? app.tags : seed.tags,
        screenshots: seed.screenshots,
        changelog: seed.changelog,
        status: "published"
      };
    });
  } catch {
    return [];
  }
}

export async function getCatalogApps() {
  const supabaseApps = await getSupabaseApps();
  return supabaseApps.length ? supabaseApps : seedApps;
}

export async function getCatalogApp(slug: string) {
  const apps = await getCatalogApps();
  return apps.find((app) => app.slug === slug || app.id === slug) ?? null;
}

export function getCategorySummaries(apps: CatalogApp[]): CategorySummary[] {
  const counts = new Map<string, number>();
  apps.forEach((app) => counts.set(app.category, (counts.get(app.category) ?? 0) + 1));

  return Array.from(counts.entries()).map(([name, count]) => ({
    name,
    slug: normalizeSlug(name),
    count
  }));
}

export function filterCatalogApps(apps: CatalogApp[], filters: CatalogFilters) {
  const now = new Date("2026-05-22T00:00:00.000Z");
  const query = filters.query?.trim().toLowerCase();

  let result = apps.filter((app) => {
    const matchesQuery =
      !query ||
      [app.name, app.developer, app.category, app.summary, app.packageName, ...app.tags]
        .join(" ")
        .toLowerCase()
        .includes(query);

    const matchesCategory =
      !filters.category ||
      filters.category === "all" ||
      normalizeSlug(app.category) === filters.category;

    const matchesRating = !filters.minRating || app.rating >= filters.minRating;

    const matchesSize =
      !filters.size ||
      filters.size === "all" ||
      (filters.size === "small" && app.sizeMb <= 30) ||
      (filters.size === "medium" && app.sizeMb > 30 && app.sizeMb <= 80) ||
      (filters.size === "large" && app.sizeMb > 80);

    const updatedDate = new Date(app.updatedAt);
    const diffDays =
      (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
    const matchesUpdated =
      !filters.updated ||
      filters.updated === "all" ||
      (filters.updated === "week" && diffDays <= 7) ||
      (filters.updated === "month" && diffDays <= 31) ||
      (filters.updated === "quarter" && diffDays <= 93);

    return matchesQuery && matchesCategory && matchesRating && matchesSize && matchesUpdated;
  });

  switch (filters.sort) {
    case "rating":
      result = result.sort((a, b) => b.rating - a.rating);
      break;
    case "downloads":
      result = result.sort((a, b) => b.downloads - a.downloads);
      break;
    case "newest":
      result = result.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      break;
    case "size":
      result = result.sort((a, b) => a.sizeMb - b.sizeMb);
      break;
    default:
      result = result.sort((a, b) => b.downloads * b.rating - a.downloads * a.rating);
  }

  return result;
}

export function formatDownloads(value: number) {
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

export function appMetrics(app: CatalogApp) {
  return {
    rating: app.rating.toFixed(1),
    reviews: formatDownloads(app.reviews),
    downloads: formatDownloads(app.downloads),
    size: `${parseNumber(app.sizeMb, 0).toFixed(0)} MB`
  };
}

