"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  deleteAnnouncement,
  deleteCategory,
  deleteReview,
  deleteTelegramAutomation,
  getUserEmailsByRoleFilter,
  respondToReview,
  saveAnnouncement,
  saveTelegramAutomation,
  updateAppsStatus,
  updateUserRole,
  upsertCategory
} from "@/lib/admin/admin";
import { sendAppPublishedEmail, sendReviewNotificationEmail, sendMarketingEmail } from "@/lib/notifications/email";
import { sendTelegramMessage, getBotMe, getWebhookInfo } from "@/lib/notifications/telegram";
import type { UserRole } from "@/lib/constants";
import type { AppStatus } from "@/lib/supabase/types";

const appStatuses = new Set<AppStatus>(["draft", "published", "rejected", "flagged"]);
const userRoles = new Set<UserRole>(["user", "developer", "admin"]);

async function notifyDeveloperOnReview(
  appId: string,
  status: AppStatus,
  reason?: string | null
) {
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
    } else if (status === "rejected") {
      await sendReviewNotificationEmail(developerEmail, app.name, false, reason);
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

export async function moderateAppWithReasonAction(
  appId: string,
  status: AppStatus,
  reason?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireRole(["admin"]);
    if (!appStatuses.has(status)) {
      return { ok: false, error: "Invalid status." };
    }
    if (status === "rejected" && !reason?.trim()) {
      return { ok: false, error: "Rejection reason is required." };
    }
    await updateAppsStatus([appId], status);
    await notifyDeveloperOnReview(appId, status, reason ?? null);
    revalidatePath("/admin");
    revalidatePath("/admin/apps");
    revalidatePath(`/admin/apps/${appId}`);
    revalidatePath("/");
    revalidateTag("catalog");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to update status."
    };
  }
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

  try {
    await saveAnnouncement({
      id,
      title,
      body,
      is_active: isActive
    });
    revalidatePath("/admin/announcements");
    revalidatePath("/");
  } catch (err) {
    console.error("saveAnnouncement failed:", err);
  }
}

export async function deleteAnnouncementAction(formData: FormData) {
  await requireRole(["admin"]);
  const announcementId = String(formData.get("announcementId") ?? "");
  if (!announcementId) return;

  try {
    await deleteAnnouncement(announcementId);
    revalidatePath("/admin/announcements");
    revalidatePath("/");
  } catch (err) {
    console.error("deleteAnnouncement failed:", err);
  }
}

export async function sendMarketingAction(
  _prevState: { ok: boolean; message: string; sent: number; failed: number },
  formData: FormData
): Promise<{ ok: boolean; message: string; sent: number; failed: number }> {
  void _prevState;
  await requireRole(["admin"]);

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const audience = String(formData.get("audience") ?? "all");

  if (!subject || !body) {
    return { ok: false, message: "Subject and body are required.", sent: 0, failed: 0 };
  }

  let emails: string[] = [];

  if (audience === "custom") {
    const custom = String(formData.get("customEmails") ?? "").trim();
    emails = custom
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));
  } else {
    const role = audience === "all" ? undefined : (audience as UserRole);
    emails = await getUserEmailsByRoleFilter(role);
  }

  if (!emails.length) {
    return { ok: false, message: "No recipients found for the selected audience.", sent: 0, failed: 0 };
  }

  const results = await sendMarketingEmail({ to: emails, subject, body });
  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;

  revalidatePath("/admin/email");

  return {
    ok: failed === 0,
    message: `Sent to ${sent} recipient${sent !== 1 ? "s" : ""}${failed ? ` (${failed} failed)` : ""}.`,
    sent,
    failed
  };
}

export async function sendTelegramBroadcastAction(
  _prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  void _prevState;
  await requireRole(["admin"]);

  const chatId = String(formData.get("chatId") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();

  if (!chatId || !text) {
    return { ok: false, message: "Chat ID and message are required." };
  }

  const result = await sendTelegramMessage(chatId, text, "MarkdownV2");
  if (result.ok) {
    return { ok: true, message: "Message sent successfully." };
  }
  return { ok: false, message: result.error ?? "Failed to send message." };
}

export async function saveTelegramAutomationAction(
  _prevState: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  void _prevState;
  await requireRole(["admin"]);
  const id = String(formData.get("id") ?? "") || undefined;
  const name = String(formData.get("name") ?? "").trim();
  const isActive = formData.get("isActive") === "on";
  const triggerType = String(formData.get("triggerType") ?? "all") as "all" | "keyword" | "regex";
  const triggerPattern = String(formData.get("triggerPattern") ?? "").trim() || null;
  const replyStyle = String(formData.get("replyStyle") ?? "concise") as "concise" | "detailed" | "friendly" | "professional";
  const maxTokens = parseInt(String(formData.get("maxTokens") ?? "150"), 10) || 150;
  const temperature = parseFloat(String(formData.get("temperature") ?? "0.5")) || 0.5;
  const allowedChatIdsRaw = String(formData.get("allowedChatIds") ?? "").trim();

  if (!name) return { ok: false, message: "Rule name is required." };

  const allowedChatIds = allowedChatIdsRaw
    ? allowedChatIdsRaw.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
    : [];

  try {
    await saveTelegramAutomation({
      id,
      name,
      is_active: isActive,
      trigger_type: triggerType,
      trigger_pattern: triggerPattern,
      reply_style: replyStyle,
      max_tokens: maxTokens,
      temperature,
      allowed_chat_ids: allowedChatIds
    });
    revalidatePath("/admin/telegram");
    return { ok: true, message: id ? "Rule updated." : "Rule created." };
  } catch (err) {
    return { ok: false, message: String(err) };
  }
}

export async function deleteTelegramAutomationAction(formData: FormData) {
  await requireRole(["admin"]);
  const id = String(formData.get("automationId") ?? "");
  if (!id) return;
  try {
    await deleteTelegramAutomation(id);
    revalidatePath("/admin/telegram");
  } catch (err) {
    console.error("deleteTelegramAutomation failed:", err);
  }
}

export async function getTelegramBotInfoAction() {
  await requireRole(["admin"]);
  const bot = await getBotMe();
  const webhook = await getWebhookInfo();
  return { bot, webhook };
}
