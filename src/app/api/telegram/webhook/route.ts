import { NextResponse } from "next/server";
import { processTelegramUpdate } from "@/lib/telegram/engine";

export async function POST(request: Request) {
  try {
    const update = await request.json();
    await processTelegramUpdate(update);
    return NextResponse.json({ ok: true });
  } catch {
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
