import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppStatus, Database } from "@/lib/supabase/types";
import { formatBytes } from "@/lib/catalog/catalog";
import type { UserRole } from "@/lib/constants";

type AppRow = Database["public"]["Tables"]["apps"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

type AppRelation = Pick<CategoryRow, "name" | "slug"> | null;
type ProfileRelation = Pick<ProfileRow, "email" | "username"> | null;
type FeedbackAppRelation = { name: string; package_name: string } | null;
type AdminAppRecord = AppRow & {
  profiles: ProfileRelation | ProfileRelation[];
  categories: AppRelation | AppRelation[];
};
type FeedbackRecord = Database["public"]["Tables"]["reviews"]["Row"] & {
  apps: FeedbackAppRelation | FeedbackAppRelation[];
  profiles: ProfileRelation | ProfileRelation[];
};

export type AdminApp = AppRow & {
  developer: Pick<ProfileRow, "email" | "username"> | null;
  category: Pick<CategoryRow, "name" | "slug"> | null;
  latestVersion: {
    version_name: string;
    apk_size: number | null;
    created_at: string;
  } | null;
  downloads: number;
  reviews: number;
};

export type AdminOverview = {
  apps: AdminApp[];
  users: ProfileRow[];
  categories: CategoryRow[];
  stats: {
    totalApps: number;
    reviewQueue: number;
    publishedApps: number;
    rejectedApps: number;
    flaggedApps: number;
    totalUsers: number;
    developers: number;
    admins: number;
    downloads: number;
    reviews: number;
    storageBytes: number;
    storageLabel: string;
  };
  chartData: Array<{
    date: string;
    downloads: number;
    apps: number;
  }>;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UploadScan = {
  id: string;
  developer_id: string | null;
  package_name: string | null;
  folder: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  sha256: string;
  virus_total_status: string;
  virus_total_source: string | null;
  virus_total_analysis_id: string | null;
  malicious_count: number;
  suspicious_count: number;
  harmless_count: number;
  undetected_count: number;
  timeout_count: number;
  r2_bucket: string | null;
  r2_key: string | null;
  r2_url: string | null;
  created_at: string;
};

export type FeedbackItem = {
  id: string;
  rating: number;
  body: string | null;
  developer_response: string | null;
  created_at: string;
  app: FeedbackAppRelation;
  user: ProfileRelation;
};

function isSupabaseReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function relationOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  if (!isSupabaseReady()) {
    return emptyOverview();
  }

  const supabase = await createClient();
  const [
    appsResult,
    usersResult,
    categoriesResult,
    versionsResult,
    downloadsResult,
    reviewsResult
  ] = await Promise.all([
    supabase
      .from("apps")
      .select("*, profiles(email,username), categories(name,slug)")
      .order("updated_at", { ascending: false }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name", { ascending: true }),
    supabase
      .from("app_versions")
      .select("app_id,version_name,apk_size,created_at")
      .order("created_at", { ascending: false }),
    supabase.from("downloads").select("app_id,created_at"),
    supabase.from("reviews").select("app_id,created_at")
  ]);

  const apps = (appsResult.data ?? []) as AdminAppRecord[];
  const users = usersResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const versions = versionsResult.data ?? [];
  const downloads = downloadsResult.data ?? [];
  const reviews = reviewsResult.data ?? [];

  const downloadsByApp = new Map<string, number>();
  downloads.forEach((item) => {
    downloadsByApp.set(item.app_id, (downloadsByApp.get(item.app_id) ?? 0) + 1);
  });

  const reviewsByApp = new Map<string, number>();
  reviews.forEach((item) => {
    reviewsByApp.set(item.app_id, (reviewsByApp.get(item.app_id) ?? 0) + 1);
  });

  const latestVersionByApp = new Map<string, (typeof versions)[number]>();
  versions.forEach((version) => {
    if (!latestVersionByApp.has(version.app_id)) {
      latestVersionByApp.set(version.app_id, version);
    }
  });

  const adminApps: AdminApp[] = apps.map((app) => ({
    ...app,
    developer: relationOne(app.profiles),
    category: relationOne(app.categories),
    latestVersion: latestVersionByApp.get(app.id) ?? null,
    downloads: downloadsByApp.get(app.id) ?? 0,
    reviews: reviewsByApp.get(app.id) ?? 0
  }));

  const storageBytes = versions.reduce((total, version) => total + (version.apk_size ?? 0), 0);
  const chartData = buildChartData(downloads, apps);

  return {
    apps: adminApps,
    users,
    categories,
    stats: {
      totalApps: apps.length,
      reviewQueue: apps.filter((app) => app.status === "draft").length,
      publishedApps: apps.filter((app) => app.status === "published").length,
      rejectedApps: apps.filter((app) => app.status === "rejected").length,
      flaggedApps: apps.filter((app) => app.status === "flagged").length,
      totalUsers: users.length,
      developers: users.filter((user) => user.role === "developer").length,
      admins: users.filter((user) => user.role === "admin").length,
      downloads: downloads.length,
      reviews: reviews.length,
      storageBytes,
      storageLabel: formatBytes(storageBytes)
    },
    chartData
  };
}

export async function updateAppsStatus(appIds: string[], status: AppStatus) {
  if (!appIds.length) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("apps")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", appIds);

  if (error) throw new Error(error.message);
}

export async function updateUserRole(userId: string, role: ProfileRow["role"]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}

export async function upsertCategory(input: {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
}) {
  const supabase = await createClient();
  const payload = {
    name: input.name,
    slug: input.slug,
    description: input.description ?? null
  };
  const query = input.id
    ? supabase.from("categories").update(payload).eq("id", input.id)
    : supabase.from("categories").insert(payload);
  const { error } = await query;

  if (error) throw new Error(error.message);
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) throw new Error(error.message);
}

export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function saveAnnouncement(input: {
  id?: string;
  title: string;
  body: string;
  is_active: boolean;
}) {
  const supabase = createAdminClient();
  const payload = {
    title: input.title,
    body: input.body,
    is_active: input.is_active,
    updated_at: new Date().toISOString()
  };
  const { error } = input.id
    ? await supabase.from("announcements").update(payload).eq("id", input.id)
    : await supabase.from("announcements").insert(payload);

  if (error) throw new Error(error.message);
}

export async function deleteAnnouncement(announcementId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("announcements").delete().eq("id", announcementId);
  if (error) throw new Error(error.message);
}

export type ReviewAdminItem = {
  id: string;
  appId: string;
  appName: string;
  appPackageName: string;
  userName: string;
  userEmail: string;
  userId: string;
  rating: number;
  body: string | null;
  developerResponse: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DownloadAnalytics = {
  totalDownloads: number;
  uniqueDownloads: number;
  todayDownloads: number;
  weekDownloads: number;
  dailyData: Array<{ date: string; downloads: number }>;
  topApps: Array<{
    appId: string;
    appName: string;
    packageName: string;
    downloads: number;
  }>;
};

type ReviewRecord = Database["public"]["Tables"]["reviews"]["Row"] & {
  apps: { name: string; package_name: string } | { name: string; package_name: string }[] | null;
  profiles: { username: string | null; email: string } | { username: string | null; email: string }[] | null;
};

export async function getReviewList(options?: {
  limit?: number;
  offset?: number;
  minRating?: number;
  search?: string;
}): Promise<{ reviews: ReviewAdminItem[]; total: number }> {
  try {
    const supabase = await createClient();
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    let query = supabase
      .from("reviews")
      .select("*, apps(name,package_name), profiles(username,email)", { count: "exact" });

    if (options?.minRating) {
      query = query.gte("rating", options.minRating);
    }

    if (options?.search) {
      query = query.or(
        `apps.name.ilike.%${options.search}%,apps.package_name.ilike.%${options.search}%,profiles.username.ilike.%${options.search}%`
      );
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data) return { reviews: [], total: 0 };

    const items: ReviewAdminItem[] = (data as ReviewRecord[]).map((item) => {
      const app = Array.isArray(item.apps) ? item.apps[0] : item.apps;
      const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
      return {
        id: item.id,
        appId: item.app_id,
        appName: app?.name ?? "Unknown",
        appPackageName: app?.package_name ?? "",
        userName: profile?.username ?? profile?.email ?? "Unknown",
        userEmail: profile?.email ?? "",
        userId: item.user_id,
        rating: item.rating,
        body: item.body,
        developerResponse: item.developer_response,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      };
    });

    return { reviews: items, total: count ?? data.length };
  } catch {
    return { reviews: [], total: 0 };
  }
}

export async function getDownloadAnalytics(): Promise<DownloadAnalytics> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("downloads")
      .select("app_id, user_id, created_at");

    if (error || !data) {
      return {
        totalDownloads: 0,
        uniqueDownloads: 0,
        todayDownloads: 0,
        weekDownloads: 0,
        dailyData: [],
        topApps: []
      };
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const todayDownloads = data.filter((d) => new Date(d.created_at) >= todayStart).length;
    const weekDownloads = data.filter((d) => new Date(d.created_at) >= weekStart).length;
    const uniqueByUser = new Set(data.filter((d) => d.user_id).map((d) => d.user_id)).size;

    const dailyMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString("en", { month: "short", day: "numeric" });
      dailyMap.set(key, 0);
    }
    data.forEach((d) => {
      const key = new Date(d.created_at).toLocaleDateString("en", { month: "short", day: "numeric" });
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
      }
    });

    const appDownloads = new Map<string, number>();
    data.forEach((d) => {
      appDownloads.set(d.app_id, (appDownloads.get(d.app_id) ?? 0) + 1);
    });

    const topAppIds = [...appDownloads.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);

    const { data: apps } = await supabase
      .from("apps")
      .select("id, name, package_name")
      .in("id", topAppIds);

    const appMap = new Map((apps ?? []).map((a) => [a.id, a]));

    const topApps = topAppIds.map((id) => ({
      appId: id,
      appName: appMap.get(id)?.name ?? "Unknown",
      packageName: appMap.get(id)?.package_name ?? "",
      downloads: appDownloads.get(id) ?? 0
    }));

    return {
      totalDownloads: data.length,
      uniqueDownloads: uniqueByUser,
      todayDownloads,
      weekDownloads,
      dailyData: [...dailyMap.entries()].map(([date, downloads]) => ({ date, downloads })),
      topApps
    };
  } catch {
    return {
      totalDownloads: 0,
      uniqueDownloads: 0,
      todayDownloads: 0,
      weekDownloads: 0,
      dailyData: [],
      topApps: []
    };
  }
}

export async function getAdminAppById(appId: string) {
  try {
    const supabase = await createClient();
    const { data: app, error } = await supabase
      .from("apps")
      .select("*, profiles(email,username), categories(name,slug)")
      .eq("id", appId)
      .single();

    if (error || !app) return null;

    const [versions, scans, reviews, downloads] = await Promise.all([
      supabase
        .from("app_versions")
        .select("*")
        .eq("app_id", appId)
        .order("created_at", { ascending: false }),
      supabase
        .from("upload_scans")
        .select("*")
        .eq("package_name", ((app as { package_name: string }).package_name))
        .order("created_at", { ascending: false }),
      supabase
        .from("reviews")
        .select("*, profiles(username,email)")
        .eq("app_id", appId)
        .order("created_at", { ascending: false }),
      supabase
        .from("downloads")
        .select("id, created_at")
        .eq("app_id", appId)
    ]);

    return {
      ...app,
      developer: Array.isArray(app.profiles) ? app.profiles[0] : app.profiles,
      category: Array.isArray(app.categories) ? app.categories[0] : app.categories,
      versions: versions.data ?? [],
      scans: scans.data ?? [],
      reviews: reviews.data ?? [],
      totalDownloads: downloads.data?.length ?? 0
    };
  } catch {
    return null;
  }
}

export async function respondToReview(reviewId: string, response: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ developer_response: response, updated_at: new Date().toISOString() })
    .eq("id", reviewId);

  if (error) throw new Error(error.message);
}

export async function deleteReview(reviewId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) throw new Error(error.message);
}

export async function getUploadScans(limit = 100): Promise<UploadScan[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("upload_scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getFeedback(limit = 100): Promise<FeedbackItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, rating, body, developer_response, created_at, apps(name,package_name), profiles(email,username)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return (data as FeedbackRecord[]).map((item) => ({
      id: item.id,
      rating: item.rating,
      body: item.body,
      developer_response: item.developer_response,
      created_at: item.created_at,
      app: relationOne(item.apps),
      user: relationOne(item.profiles)
    }));
  } catch {
    return [];
  }
}

function buildChartData(
  downloads: Array<{ created_at: string }>,
  apps: Array<{ created_at: string }>
) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  return days.map((date) => {
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    return {
      date: date.toLocaleDateString("en", { month: "short", day: "numeric" }),
      downloads: downloads.filter((item) => inRange(item.created_at, date, next)).length,
      apps: apps.filter((item) => inRange(item.created_at, date, next)).length
    };
  });
}

function inRange(value: string, start: Date, end: Date) {
  const time = new Date(value).getTime();
  return time >= start.getTime() && time < end.getTime();
}

function emptyOverview(): AdminOverview {
  return {
    apps: [],
    users: [],
    categories: [],
    chartData: [],
    stats: {
      totalApps: 0,
      reviewQueue: 0,
      publishedApps: 0,
      rejectedApps: 0,
      flaggedApps: 0,
      totalUsers: 0,
      developers: 0,
      admins: 0,
      downloads: 0,
      reviews: 0,
      storageBytes: 0,
      storageLabel: "0 MB"
    }
  };
}

export async function getUserEmailsByRole(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("profiles").select("email");
    if (error || !data) return [];
    return data.map((p) => p.email).filter(Boolean) as string[];
  } catch {
    return [];
  }
}

export async function getUserEmailsByRoleFilter(role?: UserRole): Promise<string[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from("profiles").select("email");
    if (role) {
      query = query.eq("role", role);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((p) => p.email).filter(Boolean) as string[];
  } catch {
    return [];
  }
}

export async function getSystemStatus() {
  const checks: Record<string, "ok" | "error" | "missing"> = {};

  checks["Supabase DB"] =
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "ok"
      : "missing";

  checks["Supabase Auth"] = process.env.SUPABASE_SERVICE_ROLE_KEY ? "ok" : "missing";

  checks["Resend"] = process.env.RESEND_API_KEY ? "ok" : "missing";

  checks["Cloudflare R2"] = process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN ? "ok" : "missing";

  checks["VirusTotal"] = process.env.VIRUSTOTAL_API_KEY ? "ok" : "missing";

  checks["AI (NVIDIA/Gemini)"] =
    process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY ? "ok" : "missing";

  checks["Telegram Bot"] = process.env.VITE_TELEGRAM_BOT_TOKEN ? "ok" : "missing";

  return checks;
}
