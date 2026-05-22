import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { normalizeSlug } from "@/lib/catalog/catalog";
import type { UserRole } from "@/lib/constants";

type AppRow = Database["public"]["Tables"]["apps"]["Row"];
type AppVersionRow = Database["public"]["Tables"]["app_versions"]["Row"];
type AppScreenshotRow = Database["public"]["Tables"]["app_screenshots"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type CategorySummaryRow = Pick<CategoryRow, "id" | "name" | "slug" | "description">;

type AppRelation = {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
} | null;

type ProfileRelation = {
  username?: string | null;
  email?: string | null;
} | null;

type AppRecord = AppRow & {
  categories: AppRelation;
  profiles: ProfileRelation;
};

type VersionRecord = AppVersionRow;
type ScreenshotRecord = AppScreenshotRow;

export type DeveloperAppSummary = {
  id: string;
  name: string;
  slug: string;
  packageName: string;
  version: string;
  status: AppRow["status"];
  updatedAt: string;
  downloads: number;
  screenshots: number;
  category: string;
  categorySlug: string;
  versionCount: number;
  iconUrl: string | null;
  apkUrl: string | null;
  sizeBytes: number | null;
  privacyPolicyUrl: string | null;
  description: string | null;
  tags: string[];
  packageReady: boolean;
};

export type DeveloperAppDetail = DeveloperAppSummary & {
  viewerRole: UserRole;
  developerName: string;
  developerEmail: string;
  categoryId: string | null;
  categoryDescription: string | null;
  createdAt: string;
  latestVersion: VersionRecord | null;
  versions: VersionRecord[];
  screenshotsUrls: string[];
  totalRatings: number;
  averageRating: number | null;
  reviewCount: number;
};

export type DeveloperOverview = {
  apps: DeveloperAppSummary[];
  categories: CategorySummaryRow[];
  totalDownloads: number;
  totalApps: number;
  publishedApps: number;
  draftApps: number;
  totalRatings: number;
  averageRating: number | null;
  recentVersions: Array<VersionRecord & { appName: string; appSlug: string }>;
};

type AppCounters = {
  downloads: number;
  screenshots: number;
  versions: number;
};

function emptyOverview(): DeveloperOverview {
  return {
    apps: [],
    categories: [],
    totalDownloads: 0,
    totalApps: 0,
    publishedApps: 0,
    draftApps: 0,
    totalRatings: 0,
    averageRating: null,
    recentVersions: []
  };
}

function appSlug(app: Pick<AppRow, "name" | "package_name">) {
  return normalizeSlug(`${app.name}-${app.package_name}`);
}

function appCategory(app: AppRecord) {
  return app.categories?.name ?? "Uncategorized";
}

function appCategorySlug(app: AppRecord) {
  return app.categories?.slug ?? normalizeSlug(appCategory(app));
}

function summarizeApp(
  app: AppRecord,
  counters: AppCounters,
  latestVersion?: VersionRecord | null
): DeveloperAppSummary {
  const category = appCategory(app);

  return {
    id: app.id,
    name: app.name,
    slug: appSlug(app),
    packageName: app.package_name,
    version: app.version,
    status: app.status,
    updatedAt: app.updated_at,
    downloads: counters.downloads,
    screenshots: counters.screenshots,
    category,
    categorySlug: appCategorySlug(app),
    versionCount: counters.versions,
    iconUrl: app.icon_url,
    apkUrl: app.apk_url,
    sizeBytes: latestVersion?.apk_size ?? null,
    privacyPolicyUrl: app.privacy_policy_url,
    description: app.description,
    tags: app.tags ?? [],
    packageReady: Boolean(app.package_name && app.apk_url)
  };
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export async function getDeveloperOverview(
  developerId: string,
  role: UserRole = "developer"
): Promise<DeveloperOverview> {
  try {
    const supabase = await createClient();
    let appsQuery = supabase
      .from("apps")
      .select(
        "id, developer_id, name, package_name, version, description, tags, privacy_policy_url, apk_url, icon_url, status, created_at, updated_at, category_id, categories(name, slug)"
      )
      .order("updated_at", { ascending: false });

    if (role !== "admin") {
      appsQuery = appsQuery.eq("developer_id", developerId);
    }

    const { data: appsData, error: appsError } = await appsQuery;

    if (appsError || !appsData) {
      return emptyOverview();
    }

    const apps = appsData as AppRecord[];
    const appIds = apps.map((app) => app.id);

    const [categoriesResult, downloadsResult, reviewsResult, screenshotsResult, versionsResult] =
      await Promise.all([
        supabase.from("categories").select("id, name, slug, description").order("name", { ascending: true }),
        appIds.length
          ? supabase.from("downloads").select("app_id").in("app_id", appIds)
          : Promise.resolve({ data: [] as Array<{ app_id: string }> }),
        appIds.length
          ? supabase.from("reviews").select("app_id, rating").in("app_id", appIds)
          : Promise.resolve({ data: [] as Array<{ app_id: string; rating: number }> }),
        appIds.length
          ? supabase.from("app_screenshots").select("app_id, image_url, sort_order").in("app_id", appIds)
          : Promise.resolve({ data: [] as ScreenshotRecord[] }),
        appIds.length
          ? supabase
              .from("app_versions")
              .select("id, app_id, version_name, version_code, apk_url, apk_size, changelog, created_at")
              .in("app_id", appIds)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [] as VersionRecord[] })
      ]);

    const categories = (categoriesResult.data ?? []) as CategorySummaryRow[];

    const downloadsByApp = new Map<string, number>();
    downloadsResult.data?.forEach((item) => {
      downloadsByApp.set(item.app_id, (downloadsByApp.get(item.app_id) ?? 0) + 1);
    });

    const ratingsByApp = new Map<string, number[]>();
    reviewsResult.data?.forEach((item) => {
      ratingsByApp.set(item.app_id, [...(ratingsByApp.get(item.app_id) ?? []), item.rating]);
    });

    const screenshotsByApp = new Map<string, number>();
    screenshotsResult.data?.forEach((item) => {
      screenshotsByApp.set(item.app_id, (screenshotsByApp.get(item.app_id) ?? 0) + 1);
    });

    const versionsByApp = new Map<string, VersionRecord[]>();
    versionsResult.data?.forEach((version) => {
      versionsByApp.set(version.app_id, [...(versionsByApp.get(version.app_id) ?? []), version]);
    });

    const appSummaries = apps.map((app) =>
      summarizeApp(app, {
        downloads: downloadsByApp.get(app.id) ?? 0,
        screenshots: screenshotsByApp.get(app.id) ?? 0,
        versions: versionsByApp.get(app.id)?.length ?? 0
      }, versionsByApp.get(app.id)?.[0] ?? null)
    );

    const appMap = new Map(appSummaries.map((app) => [app.id, app] as const));
    const recentVersions = (versionsResult.data ?? [])
      .map((version) => {
        const app = appMap.get(version.app_id);
        if (!app) {
          return null;
        }

        return {
          ...version,
          appName: app.name,
          appSlug: app.slug
        };
      })
      .filter((item): item is VersionRecord & { appName: string; appSlug: string } => Boolean(item))
      .slice(0, 6);

    const allRatings = Array.from(ratingsByApp.values()).flat();
    const totalRatings = allRatings.length;

    return {
      apps: appSummaries,
      categories,
      totalDownloads: sum(appSummaries.map((app) => app.downloads)),
      totalApps: appSummaries.length,
      publishedApps: appSummaries.filter((app) => app.status === "published").length,
      draftApps: appSummaries.filter((app) => app.status === "draft").length,
      totalRatings,
      averageRating: totalRatings ? sum(allRatings) / totalRatings : null,
      recentVersions
    };
  } catch {
    return emptyOverview();
  }
}

export async function getDeveloperApp(
  developerId: string,
  idOrSlug: string,
  role: UserRole = "developer"
): Promise<DeveloperAppDetail | null> {
  try {
    const supabase = await createClient();
    let appQuery = supabase
      .from("apps")
      .select(
        "id, developer_id, name, package_name, version, description, tags, privacy_policy_url, apk_url, icon_url, status, created_at, updated_at, category_id, categories(name, slug, description), profiles(username, email)"
      )
      .order("updated_at", { ascending: false });

    if (role !== "admin") {
      appQuery = appQuery.eq("developer_id", developerId);
    }

    const { data, error } = await appQuery;

    if (error || !data?.length) {
      return null;
    }

    const app = (data as AppRecord[]).find(
      (item) => item.id === idOrSlug || appSlug(item) === idOrSlug
    );

    if (!app) {
      return null;
    }

    const [{ data: versionsData }, { data: screenshotsData }, { data: downloadsData }, { data: reviewsData }] =
      await Promise.all([
        supabase
          .from("app_versions")
          .select("id, app_id, version_name, version_code, apk_url, apk_size, changelog, created_at")
          .eq("app_id", app.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("app_screenshots")
          .select("id, app_id, image_url, sort_order, created_at")
          .eq("app_id", app.id)
          .order("sort_order", { ascending: true }),
        supabase.from("downloads").select("id").eq("app_id", app.id),
        supabase.from("reviews").select("rating").eq("app_id", app.id)
      ]);

    const versions = (versionsData ?? []) as VersionRecord[];
    const screenshots = (screenshotsData ?? []) as ScreenshotRecord[];
    const ratings = reviewsData?.map((item) => item.rating) ?? [];
    const latestVersion = versions[0] ?? null;

    return {
      ...summarizeApp(app, {
        downloads: downloadsData?.length ?? 0,
        screenshots: screenshots.length,
        versions: versions.length
      }, latestVersion),
      viewerRole: role,
      developerName: app.profiles?.username ?? app.profiles?.email ?? "Developer",
      developerEmail: app.profiles?.email ?? "",
      categoryId: app.category_id,
      categoryDescription: app.categories?.description ?? null,
      createdAt: app.created_at,
      latestVersion,
      versions,
      screenshotsUrls: screenshots.map((item) => item.image_url),
      totalRatings: ratings.length,
      averageRating: ratings.length ? sum(ratings) / ratings.length : null,
      reviewCount: ratings.length
    };
  } catch {
    return null;
  }
}
