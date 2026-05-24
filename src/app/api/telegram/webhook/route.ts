import { NextResponse } from "next/server";
import { processTelegramUpdate } from "@/lib/telegram/engine";
import { sendTelegramRaw } from "@/lib/notifications/telegram";

export async function POST(request: Request) {
  let update: unknown;
  try {
    update = await request.json();
    await processTelegramUpdate(update as {
      update_id: number;
      message?: {
        message_id: number;
        chat: { id: number; type: string; title?: string; first_name?: string; username?: string };
        from?: { id: number; first_name?: string; username?: string };
        text?: string;
        date: number;
      };
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    try {
      const msg = update as { message?: { chat?: { id?: number } } } | undefined;
      const chatId = msg?.message?.chat?.id;
      if (chatId) {
        await sendTelegramRaw("sendMessage", {
          chat_id: String(chatId),
          text: "⚠️ Sorry, an internal error occurred. Please try again.",
          disable_web_page_preview: true
        });
      }
    } catch {
      // Best effort
    }
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  const token = process.env.VITE_TELEGRAM_BOT_TOKEN;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!token || !siteUrl) {
    return NextResponse.json(
      { ok: false, error: "Bot token or site URL not configured" },
      { status: 500 }
    );
  }
  const webhookUrl = `${siteUrl.replace(/\/+$/, "")}/api/telegram/webhook`;
  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=true`,
    { method: "POST" }
  );
  const data = await res.json();
  return NextResponse.json(data);
}
