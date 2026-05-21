import { createClient } from "@/lib/supabase/server";
import type { CatalogApp, CatalogFilters, CategorySummary } from "@/lib/catalog/types";

function isSupabaseReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function appAccent(seed: string) {
  const accents = [
    "linear-gradient(135deg, #007cf0, #00dfd8)",
    "linear-gradient(135deg, #7928ca, #ff0080)",
    "linear-gradient(135deg, #ff4d4d, #f9cb28)",
    "linear-gradient(135deg, #171717, #4d4d4d)"
  ];
  const index = seed
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0) % accents.length;

  return accents[index];
}

function categoryNameFromRelation(value: unknown) {
  if (!value) {
    return "Uncategorized";
  }

  if (Array.isArray(value)) {
    const first = value[0] as { name?: string } | undefined;
    return first?.name ?? "Uncategorized";
  }

  return (value as { name?: string }).name ?? "Uncategorized";
}

function developerNameFromRelation(value: unknown) {
  if (!value) {
    return "Developer";
  }

  if (Array.isArray(value)) {
    const first = value[0] as { username?: string | null; email?: string | null } | undefined;
    return first?.username || first?.email || "Developer";
  }

  const profile = value as { username?: string | null; email?: string | null };
  return profile.username || profile.email || "Developer";
}

function lineItems(value: string | null | undefined) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

async function getSupabaseApps(status: "published" | "all" = "published"): Promise<CatalogApp[]> {
  if (!isSupabaseReady()) {
    return [];
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("apps")
      .select(
        "id, developer_id, name, package_name, version, description, tags, privacy_policy_url, apk_url, icon_url, status, updated_at, categories(name), profiles(username,email)"
      )
      .order("updated_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: apps, error } = await query;

    if (error || !apps?.length) {
      return [];
    }

    const appIds = apps.map((app) => app.id);
    const [{ data: downloads }, { data: reviews }, { data: versions }, { data: screenshots }] =
      await Promise.all([
        supabase.from("downloads").select("app_id").in("app_id", appIds),
        supabase.from("reviews").select("app_id,rating").in("app_id", appIds),
        supabase
          .from("app_versions")
          .select("app_id,version_name,apk_url,apk_size,changelog,created_at")
          .in("app_id", appIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("app_screenshots")
          .select("app_id,image_url,sort_order")
          .in("app_id", appIds)
          .order("sort_order", { ascending: true })
      ]);

    const downloadsByApp = new Map<string, number>();
    downloads?.forEach((item) => {
      downloadsByApp.set(item.app_id, (downloadsByApp.get(item.app_id) ?? 0) + 1);
    });

    const ratingsByApp = new Map<string, number[]>();
    reviews?.forEach((item) => {
      ratingsByApp.set(item.app_id, [...(ratingsByApp.get(item.app_id) ?? []), item.rating]);
    });

    const versionsByApp = new Map<string, NonNullable<typeof versions>>();
    versions?.forEach((item) => {
      versionsByApp.set(item.app_id, [...(versionsByApp.get(item.app_id) ?? []), item]);
    });

    const screenshotsByApp = new Map<string, string[]>();
    screenshots?.forEach((item) => {
      screenshotsByApp.set(item.app_id, [...(screenshotsByApp.get(item.app_id) ?? []), item.image_url]);
    });

    return apps.map((app) => {
      const category = categoryNameFromRelation(app.categories);
      const appRatings = ratingsByApp.get(app.id) ?? [];
      const latestVersion = versionsByApp.get(app.id)?.[0];
      const description = app.description ?? "";

      return {
        id: app.id,
        slug: normalizeSlug(`${app.name}-${app.package_name}`),
        name: app.name,
        developer: developerNameFromRelation(app.profiles),
        developerId: app.developer_id,
        packageName: app.package_name,
        version: app.version,
        category,
        categorySlug: normalizeSlug(category),
        summary: description ? description.slice(0, 132) : null,
        description,
        privacyPolicyUrl: app.privacy_policy_url,
        rating: appRatings.length
          ? appRatings.reduce((sum, rating) => sum + rating, 0) / appRatings.length
          : null,
        reviews: appRatings.length,
        downloads: downloadsByApp.get(app.id) ?? 0,
        sizeBytes: latestVersion?.apk_size ?? null,
        updatedAt: app.updated_at,
        apkUrl: latestVersion?.apk_url ?? app.apk_url,
        iconUrl: app.icon_url,
        accent: appAccent(app.package_name),
        tags: app.tags ?? [],
        screenshots: screenshotsByApp.get(app.id) ?? [],
        changelog: lineItems(latestVersion?.changelog),
        status: app.status
      };
    });
  } catch {
    return [];
  }
}

export async function getCatalogApps() {
  return getSupabaseApps("published");
}

export async function getCatalogApp(slug: string) {
  const apps = await getCatalogApps();
  return apps.find((app) => app.slug === slug || app.id === slug) ?? null;
}

export async function getCategories(): Promise<CategorySummary[]> {
  if (!isSupabaseReady()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("name, slug")
      .order("name", { ascending: true });

    if (error || !data) {
      return [];
    }

    const apps = await getCatalogApps();
    const counts = new Map<string, number>();
    apps.forEach((app) => counts.set(app.categorySlug, (counts.get(app.categorySlug) ?? 0) + 1));

    return data.map((category) => ({
      name: category.name,
      slug: category.slug,
      count: counts.get(category.slug) ?? 0
    }));
  } catch {
    return [];
  }
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
  const now = new Date();
  const query = filters.query?.trim().toLowerCase();

  let result = apps.filter((app) => {
    const matchesQuery =
      !query ||
      [app.name, app.developer, app.category, app.summary ?? "", app.packageName, ...app.tags]
        .join(" ")
        .toLowerCase()
        .includes(query);

    const matchesCategory =
      !filters.category ||
      filters.category === "all" ||
      app.categorySlug === filters.category;

    const matchesRating =
      !filters.minRating || (app.rating !== null && app.rating >= filters.minRating);

    const sizeMb = app.sizeBytes === null ? null : app.sizeBytes / 1024 / 1024;
    const matchesSize =
      !filters.size ||
      filters.size === "all" ||
      sizeMb === null ||
      (filters.size === "small" && sizeMb <= 30) ||
      (filters.size === "medium" && sizeMb > 30 && sizeMb <= 80) ||
      (filters.size === "large" && sizeMb > 80);

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
      result = result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
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
      result = result.sort((a, b) => (a.sizeBytes ?? Number.MAX_SAFE_INTEGER) - (b.sizeBytes ?? Number.MAX_SAFE_INTEGER));
      break;
    default:
      result = result.sort((a, b) => {
        const aScore = a.downloads + (a.rating ?? 0) * 100;
        const bScore = b.downloads + (b.rating ?? 0) * 100;
        return bScore - aScore;
      });
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

