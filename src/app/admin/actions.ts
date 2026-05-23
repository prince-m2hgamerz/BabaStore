"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  deleteAnnouncement,
  deleteCategory,
  deleteReview,
  respondToReview,
  saveAnnouncement,
  updateAppsStatus,
  updateUserRole,
  upsertCategory
} from "@/lib/admin/admin";
import { sendAppPublishedEmail, sendReviewNotificationEmail } from "@/lib/notifications/email";
import type { AppStatus } from "@/lib/supabase/types";
import type { UserRole } from "@/lib/constants";

const appStatuses = new Set<AppStatus>(["draft", "published", "rejected", "flagged"]);
const userRoles = new Set<UserRole>(["user", "developer", "admin"]);

async function notifyDeveloperOnReview(appId: string, status: AppStatus) {
  try {
    const supabase = await createClient();
    const { data: app } = await supabase
      .from("apps")
      .select("name, profiles(email)")
      .eq("id", appId)
      .single();

    if (!app) return;

    const profile = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles;
    const developerEmail = profile?.email;
    if (!developerEmail) return;

    if (status === "published") {
      await sendAppPublishedEmail(developerEmail, app.name);
    } else {
      await sendReviewNotificationEmail(developerEmail, app.name, false);
    }
  } catch {
    // Notifications are best-effort
  }
}

export async function respondToReviewAction(formData: FormData) {
  await requireRole(["admin"]);
  const reviewId = String(formData.get("reviewId") ?? "");
  const response = String(formData.get("response") ?? "");
  if (!reviewId || !response) return;
  await respondToReview(reviewId, response);
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/apps/[id]");
}

export async function deleteReviewAction(formData: FormData) {
  await requireRole(["admin"]);
  const reviewId = String(formData.get("reviewId") ?? "");
  if (!reviewId) return;
  await deleteReview(reviewId);
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/apps/[id]");
}

export async function moderateAppsAction(formData: FormData) {
  await requireRole(["admin"]);
  const ids = formData.getAll("appIds").map(String).filter(Boolean);
  const status = String(formData.get("status") ?? "") as AppStatus;

  if (!ids.length || !appStatuses.has(status)) return;

  await updateAppsStatus(ids, status);
  await Promise.all(ids.map((id) => notifyDeveloperOnReview(id, status)));
  revalidatePath("/admin");
  revalidatePath("/admin/apps");
  revalidatePath("/");
  revalidateTag("catalog");
}

export async function moderateSingleAppAction(appId: string, status: AppStatus, _formData?: FormData) {
  void _formData;
  await requireRole(["admin"]);
  if (!appStatuses.has(status)) return;
  await updateAppsStatus([appId], status);
  await notifyDeveloperOnReview(appId, status);
  revalidatePath("/admin");
  revalidatePath("/admin/apps");
  revalidatePath("/");
  revalidateTag("catalog");
}

export async function updateUserRoleAction(formData: FormData) {
  await requireRole(["admin"]);
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as UserRole;

  if (!userId || !userRoles.has(role)) return;

  await updateUserRole(userId, role);
  revalidatePath("/admin/users");
}

export async function saveCategoryAction(formData: FormData) {
  await requireRole(["admin"]);
  const id = String(formData.get("id") ?? "") || undefined;
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name || !slug) return;

  await upsertCategory({
    id,
    name,
    slug,
    description: description || null
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidateTag("catalog");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireRole(["admin"]);
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!categoryId) return;

  await deleteCategory(categoryId);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function saveAnnouncementAction(formData: FormData) {
  await requireRole(["admin"]);
  const id = String(formData.get("id") ?? "") || undefined;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!title || !body) return;

  await saveAnnouncement({
    id,
    title,
    body,
    is_active: isActive
  });
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

export async function deleteAnnouncementAction(formData: FormData) {
  await requireRole(["admin"]);
  const announcementId = String(formData.get("announcementId") ?? "");
  if (!announcementId) return;

  await deleteAnnouncement(announcementId);
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}
