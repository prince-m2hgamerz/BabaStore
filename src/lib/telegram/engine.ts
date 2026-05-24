import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramRaw } from "@/lib/notifications/telegram";
import { generateTelegramReply } from "@/lib/ai/nvidia";
import { handleCommand } from "@/lib/telegram/commands";

type AutomationRule = {
  id: string;
  name: string;
  is_active: boolean;
  trigger_type: "all" | "keyword" | "regex";
  trigger_pattern: string | null;
  reply_style: "concise" | "detailed" | "friendly" | "professional";
  max_tokens: number;
  temperature: number;
  allowed_chat_ids: string[];
};

function escapeMarkdownV2(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

function matchTrigger(
  text: string,
  rule: AutomationRule
): boolean {
  if (rule.trigger_type === "all") return true;
  if (!rule.trigger_pattern) return false;
  if (rule.trigger_type === "keyword") {
    return text.toLowerCase().includes(rule.trigger_pattern.toLowerCase());
  }
  if (rule.trigger_type === "regex") {
    try {
      return new RegExp(rule.trigger_pattern, "i").test(text);
    } catch {
      return false;
    }
  }
  return false;
}

function isChatAllowed(
  chatId: string,
  rule: AutomationRule
): boolean {
  if (!rule.allowed_chat_ids || rule.allowed_chat_ids.length === 0) return true;
  return rule.allowed_chat_ids.includes(chatId);
}

export async function processTelegramUpdate(update: {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number; type: string; title?: string; first_name?: string; username?: string };
    from?: { id: number; first_name?: string; username?: string };
    text?: string;
    date: number;
  };
}) {
  const msg = update.message;
  if (!msg?.text) return;

  const chatId = String(msg.chat.id);
  const incomingText = msg.text;
  const senderName = msg.from?.first_name ?? "User";

  // ── Handle bot commands first ──
  const isAdmin = msg.from?.id
    ? await isSenderAdmin(msg.from.id)
    : false;

  const handled = await handleCommand(incomingText, {
    chatId,
    chatType: msg.chat.type,
    senderId: msg.from?.id,
    senderName,
    args: [],
    isAdmin
  });
  if (handled) return;

  // ── Fall through to auto-reply rules ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tb = createAdminClient().from("telegram_automations") as any;

  const { data: rules, error } = await tb
    .select("*")
    .eq("is_active", true);

  if (error || !rules?.length) return;

  const matchedRule = (rules as AutomationRule[]).find(
    (rule) => isChatAllowed(chatId, rule) && matchTrigger(incomingText, rule)
  );

  if (!matchedRule) return;

  const aiReply = await generateTelegramReply({
    message: incomingText,
    senderName,
    replyStyle: matchedRule.reply_style,
    maxTokens: matchedRule.max_tokens,
    temperature: matchedRule.temperature
  });

  if (!aiReply) return;

  const result = await sendTelegramRaw("sendMessage", {
    chat_id: chatId,
    text: escapeMarkdownV2(aiReply),
    parse_mode: "MarkdownV2",
    reply_to_message_id: msg.message_id,
    disable_web_page_preview: true
  });

  if (!result.ok) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logTb = createAdminClient().from("telegram_chat_logs") as any;

  await logTb.insert({
    chat_id: chatId,
    message_id: msg.message_id,
    direction: "incoming",
    text: incomingText,
    reply: aiReply,
    automation_id: matchedRule.id
  });

  await logTb.insert({
    chat_id: chatId,
    message_id: result.message_id ?? null,
    direction: "outgoing",
    text: aiReply,
    automation_id: matchedRule.id
  });
}

// ── Helpers ─────────────────────────────────────

function isSenderAdmin(userId: number): boolean {
  const adminId = process.env.VITE_TELEGRAM_ADMIN_CHAT_ID;
  if (!adminId) return false;
  return String(userId) === adminId;
}
