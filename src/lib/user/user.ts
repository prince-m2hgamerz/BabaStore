import { createClient } from "@/lib/supabase/server";
import { getCatalogApps } from "@/lib/catalog/catalog";
import type { CatalogApp } from "@/lib/catalog/types";

type UserDownloadRecord = {
  id: string;
  app_id: string;
  created_at: string;
};

type WishlistRecord = {
  id: string;
  app_id: string;
  created_at: string;
};

export type DownloadedApp = {
  downloadId: string;
  downloadedAt: string;
  app: CatalogApp;
};

export type SavedApp = {
  id: string;
  savedAt: string;
  app: CatalogApp;
};

export type UserReviewItem = {
  id: string;
  appId: string;
  appName: string;
  appSlug: string;
  rating: number;
  body: string | null;
  createdAt: string;
};

export type UserLibrary = {
  downloads: DownloadedApp[];
  uniqueDownloads: DownloadedApp[];
  wishlist: SavedApp[];
  reviews: UserReviewItem[];
  recommendedApps: CatalogApp[];
  totalDownloads: number;
  totalWishlist: number;
};

async function getDownloadRows(userId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("downloads")
      .select("id, app_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as UserDownloadRecord[];
  } catch {
    return [];
  }
}

async function getWishlistRows(userId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("id, app_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as WishlistRecord[];
  } catch {
    return [];
  }
}

export async function isAppWishlisted(userId: string, appId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("id")
      .eq("user_id", userId)
      .eq("app_id", appId)
      .maybeSingle();

    return !error && Boolean(data);
  } catch {
    return false;
  }
}

export async function getUserLibrary(userId: string): Promise<UserLibrary> {
  const supabase = await createClient();
  const [apps, downloads, wishlist] = await Promise.all([
    getCatalogApps({ limit: 500 }),
    getDownloadRows(userId),
    getWishlistRows(userId)
  ]);
  let reviewRows: {
    id: string;
    app_id: string;
    rating: number;
    body: string | null;
    created_at: string;
  }[] | null = null;
  try {
    const { data } = await supabase
      .from("reviews")
      .select("id, app_id, rating, body, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    reviewRows = data;
  } catch {
    reviewRows = null;
  }
  const appsById = new Map(apps.map((app) => [app.id, app]));

  const downloadItems = downloads
    .map((download) => {
      const app = appsById.get(download.app_id);
      if (!app) {
        return null;
      }

      return {
        downloadId: download.id,
        downloadedAt: download.created_at,
        app
      };
    })
    .filter((item): item is DownloadedApp => Boolean(item));

  const seenDownloads = new Set<string>();
  const uniqueDownloads = downloadItems.filter((item) => {
    if (seenDownloads.has(item.app.id)) {
      return false;
    }

    seenDownloads.add(item.app.id);
    return true;
  });

  const savedItems = wishlist
    .map((item) => {
      const app = appsById.get(item.app_id);
      if (!app) {
        return null;
      }

      return {
        id: item.id,
        savedAt: item.created_at,
        app
      };
    })
    .filter((item): item is SavedApp => Boolean(item));

  const reviewItems: UserReviewItem[] = (reviewRows ?? [])
    .map((review) => {
      const app = appsById.get(review.app_id);
      return app
        ? {
            id: review.id,
            appId: review.app_id,
            appName: app.name,
            appSlug: app.slug,
            rating: review.rating,
            body: review.body,
            createdAt: review.created_at
          }
        : null;
    })
    .filter((item): item is UserReviewItem => Boolean(item));

  const blockedIds = new Set([
    ...uniqueDownloads.map((item) => item.app.id),
    ...savedItems.map((item) => item.app.id)
  ]);
  const recommendedApps = apps.filter((app) => !blockedIds.has(app.id)).slice(0, 6);

  return {
    downloads: downloadItems,
    uniqueDownloads,
    wishlist: savedItems,
    reviews: reviewItems,
    recommendedApps,
    totalDownloads: downloads.length,
    totalWishlist: wishlist.length
  };
}
