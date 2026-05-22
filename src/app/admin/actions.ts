"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import {
  deleteAnnouncement,
  deleteCategory,
  saveAnnouncement,
  updateAppsStatus,
  updateUserRole,
  upsertCategory
} from "@/lib/admin/admin";
import type { AppStatus } from "@/lib/supabase/types";
import type { UserRole } from "@/lib/constants";

const appStatuses = new Set<AppStatus>(["draft", "published", "rejected", "flagged"]);
const userRoles = new Set<UserRole>(["user", "developer", "admin"]);

export async function moderateAppsAction(formData: FormData) {
  await requireRole(["admin"]);
  const ids = formData.getAll("appIds").map(String).filter(Boolean);
  const status = String(formData.get("status") ?? "") as AppStatus;

  if (!ids.length) throw new Error("Select at least one app.");
  if (!appStatuses.has(status)) throw new Error("Invalid app status.");

  await updateAppsStatus(ids, status);
  revalidatePath("/admin");
  revalidatePath("/admin/apps");
  revalidatePath("/");
  revalidateTag("catalog");
}

export async function moderateSingleAppAction(appId: string, status: AppStatus, _formData?: FormData) {
  void _formData;
  await requireRole(["admin"]);
  if (!appStatuses.has(status)) throw new Error("Invalid app status.");
  await updateAppsStatus([appId], status);
  revalidatePath("/admin");
  revalidatePath("/admin/apps");
  revalidatePath("/");
  revalidateTag("catalog");
}

export async function updateUserRoleAction(formData: FormData) {
  await requireRole(["admin"]);
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as UserRole;

  if (!userId) throw new Error("User is required.");
  if (!userRoles.has(role)) throw new Error("Invalid role.");

  await updateUserRole(userId, role);
  revalidatePath("/admin/users");
}

export async function saveCategoryAction(formData: FormData) {
  await requireRole(["admin"]);
  const id = String(formData.get("id") ?? "") || undefined;
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name || !slug) throw new Error("Name and slug are required.");

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
  if (!categoryId) throw new Error("Category is required.");

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

  if (!title || !body) throw new Error("Title and body are required.");

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
  if (!announcementId) throw new Error("Announcement is required.");

  await deleteAnnouncement(announcementId);
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}
