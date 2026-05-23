const BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.VITE_TELEGRAM_ADMIN_CHAT_ID;

function isReady() {
  return Boolean(BOT_TOKEN && CHAT_ID);
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

export async function sendTelegramNotification(params: {
  title: string;
  message: string;
  level?: "info" | "warning" | "error";
}) {
  if (!isReady()) return;

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
