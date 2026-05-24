import { NextResponse } from "next/server";
import { sendTelegramRaw } from "@/lib/notifications/telegram";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const token = process.env.VITE_TELEGRAM_BOT_TOKEN;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const errors: string[] = [];
  const results: Record<string, unknown> = {};

  if (!token) {
    return NextResponse.json({ ok: false, error: "No bot token configured" }, { status: 500 });
  }

  // 1. Set webhook
  if (siteUrl) {
    const webhookUrl = `${siteUrl.replace(/\/+$/, "")}/api/telegram/webhook`;
    const whRes = await sendTelegramRaw("setWebhook", {
      url: webhookUrl,
      drop_pending_updates: true,
      allowed_updates: ["message"]
    });
    results.webhook = whRes;
    if (!whRes.ok) errors.push(`Webhook: ${whRes.error || "Failed"}`);
  } else {
    errors.push("NEXT_PUBLIC_SITE_URL not set");
  }

  // 2. Set bot commands
  const commandsRes = await sendTelegramRaw("setMyCommands", {
    commands: [
      { command: "start", description: "Welcome message and available commands" },
      { command: "help", description: "Show all commands" },
      { command: "categories", description: "Browse app categories" },
      { command: "browse", description: "Browse apps in a category. Usage: /browse <category>" },
      { command: "search", description: "Search for apps. Usage: /search <query>" },
      { command: "app", description: "Get app details and download link. Usage: /app <name>" },
      { command: "download", description: "Direct download link. Usage: /download <slug>" }
    ]
  });
  results.commands = commandsRes;
  if (!commandsRes.ok) errors.push(`Commands: ${commandsRes.error || "Failed"}`);

  // 3. Check webhook info
  const infoRes = await sendTelegramRaw("getWebhookInfo", {});
  results.webhookInfo = infoRes;

  // 4. Check Edge Function status
  let edgeFunctionStatus = "not_configured";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tb = createAdminClient().from("telegram_account") as any;
  const { data: account } = await tb.select("auto_reply_enabled, is_connected, session_string").limit(1).single();
  if (account?.is_connected && account?.session_string) {
    edgeFunctionStatus = account.auto_reply_enabled ? "active" : "disabled";
  } else {
    edgeFunctionStatus = "account_not_connected";
  }
  results.edgeFunction = { status: edgeFunctionStatus };

  return NextResponse.json({
    ok: errors.length === 0,
    errors: errors.length ? errors : undefined,
    results
  });
}
