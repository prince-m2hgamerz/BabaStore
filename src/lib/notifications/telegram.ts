const BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.VITE_TELEGRAM_ADMIN_CHAT_ID;

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

export function getBotConfig() {
  return {
    token: BOT_TOKEN,
    adminChatId: CHAT_ID
  };
}

export function isBotReady() {
  return Boolean(BOT_TOKEN);
}

export async function sendTelegramMessage(chatId: string, text: string, parseMode?: "MarkdownV2" | "HTML") {
  if (!BOT_TOKEN) return { ok: false, error: "Bot token not configured" };

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode ?? "MarkdownV2",
        disable_web_page_preview: true
      })
    });
    const data = await res.json();
    return { ok: res.ok, error: data.description };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function getBotMe() {
  if (!BOT_TOKEN) return { ok: false, error: "Bot token not configured" };

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.ok) {
      return { ok: true, bot: data.result as { id: number; username: string; first_name: string } };
    }
    return { ok: false, error: data.description };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function getWebhookInfo() {
  if (!BOT_TOKEN) return { ok: false, error: "Bot token not configured" };

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.ok) {
      return {
        ok: true,
        webhook: data.result as {
          url: string;
          has_custom_certificate: boolean;
          pending_update_count: number;
          last_error_date?: number;
          last_error_message?: string;
          max_connections?: number;
        }
      };
    }
    return { ok: false, error: data.description };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function sendTelegramRaw(method: string, body: Record<string, unknown>) {
  if (!BOT_TOKEN) return { ok: false, error: "Bot token not configured" };
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return { ok: res.ok, ...data };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function sendTelegramNotification(params: {
  title: string;
  message: string;
  level?: "info" | "warning" | "error";
}) {
  if (!isBotReady() || !CHAT_ID) return;

  const icon =
    params.level === "error"
      ? "🚨"
      : params.level === "warning"
      ? "⚠️"
      : "ℹ️";

  const text = [
    `${icon} *${escapeMarkdown(params.title)}*`,
    "",
    escapeMarkdown(params.message)
  ].join("\n");

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true
      })
    });
  } catch {
    // Telegram notifications are best-effort
  }
}

export async function notifyNewUser(email: string) {
  return sendTelegramNotification({
    title: "New user registered",
    message: `Email: ${email}`,
    level: "info"
  });
}

export async function notifyNewApp(name: string, developer: string) {
  return sendTelegramNotification({
    title: "New app published",
    message: `App: ${name}\nDeveloper: ${developer}`,
    level: "info"
  });
}

export async function notifyMalwareFound(appName: string, rank: string) {
  return sendTelegramNotification({
    title: "Malware detected in upload",
    message: `App: ${appName}\nRank: ${rank}`,
    level: "error"
  });
}

export async function notifyError(context: string, error: string) {
  return sendTelegramNotification({
    title: `Error: ${context}`,
    message: error,
    level: "error"
  });
}
