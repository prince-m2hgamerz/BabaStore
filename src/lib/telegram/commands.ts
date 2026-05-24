import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramRaw, getBotMe } from "@/lib/notifications/telegram";

function siteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  return url.replace(/\/+$/, "");
}

type Ctx = {
  chatId: string;
  chatType: string;
  senderId?: number;
  senderName: string;
  args: string[];
  isAdmin: boolean;
};

function md(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

function link(url: string, label: string): string {
  return `[${label.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&")}](${url})`;
}

async function sendReply(chatId: string, text: string, replyTo?: number) {
  return sendTelegramRaw("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "MarkdownV2",
    disable_web_page_preview: true,
    ...(replyTo ? { reply_to_message_id: replyTo } : {})
  });
}

// ── Catalog API helpers ─────────────────────────

async function fetchApps(params: Record<string, string>) {
  const url = new URL(`${siteUrl()}/api/catalog/apps`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  return res.json() as Promise<{ apps: Record<string, unknown>[]; total: number }>;
}

async function fetchApp(slug: string) {
  const url = `${siteUrl()}/api/catalog/lookup?slug=${encodeURIComponent(slug)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return (data as { app?: Record<string, unknown> }).app ?? null;
}

async function fetchCategories() {
  const { getCategories } = await import("@/lib/catalog/catalog");
  return getCategories();
}

// ── Command handlers ────────────────────────────

async function cmdStart(ctx: Ctx) {
  const lines = [
    `👋 *Welcome to BabaStore Bot\\!*`,
    ``,
    `Browse and download Android apps right from Telegram\\.`,
    ``,
    `*Commands:*`,
    `\`/categories\` \\- Browse app categories`,
    `\`/browse <category>\` \\- List apps in a category`,
    `\`/search <query>\` \\- Search for apps`,
    `\`/app <name>\` \\- Get app details \\& download link`,
    `\`/download <slug>\` \\- Direct download link`,
    `\`/help\` \\- Show this help`,
  ];

  if (ctx.isAdmin) {
    lines.push(``, `*Admin:*`, `\`/stats\` \\- Bot statistics`);
  }

  await sendReply(ctx.chatId, lines.join("\n"));
}

async function cmdHelp(ctx: Ctx) {
  return cmdStart(ctx);
}

async function cmdCategories(ctx: Ctx) {
  const cats = await fetchCategories();
  if (!cats?.length) {
    return sendReply(ctx.chatId, "No categories available right now.");
  }

  const lines = ["*Categories:*", ""];
  for (const cat of cats) {
    lines.push(`📁 ${md(cat.name)} \\(${cat.count} apps\\) \\- \`/browse ${cat.slug}\``);
  }
  lines.push("", "Use `/browse <category>` to see apps.");

  await sendReply(ctx.chatId, lines.join("\n"));
}

async function cmdBrowse(ctx: Ctx) {
  const category = ctx.args[0];
  if (!category) {
    return sendReply(ctx.chatId, "Usage: `/browse <category>`\nExample: `/browse games`");
  }

  const result = await fetchApps({ category, limit: "10", sort: "popularity" });
  if (!result || !result.apps.length) {
    return sendReply(ctx.chatId, `No apps found in category *${md(category)}*\\.`);
  }

  const lines = [`*${md(category)} — Top ${Math.min(result.apps.length, 10)} apps:*`, ""];
  for (let i = 0; i < Math.min(result.apps.length, 10); i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = result.apps[i] as any;
    lines.push(
      `${i + 1}\\. *${md(app.name || "Unknown")}*` +
      (app.rating ? ` ⭐${app.rating}` : "") +
      (app.downloads ? ` \\- ${formatNum(app.downloads)} dl` : "")
    );
  }
  lines.push("", `Use \`/app <name>\` for details and download link\\.`);

  await sendReply(ctx.chatId, lines.join("\n"));
}

async function cmdSearch(ctx: Ctx) {
  const query = ctx.args.join(" ");
  if (!query || query.length < 2) {
    return sendReply(ctx.chatId, "Usage: `/search <query>`\nExample: `/search vpn`");
  }

  const result = await fetchApps({ q: query, limit: "10" });
  if (!result || !result.apps.length) {
    return sendReply(ctx.chatId, `No results for *${md(query)}*\\.`);
  }

  const lines = [`*Search results for "${md(query)}":*`, ""];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const app of result.apps.slice(0, 10) as any[]) {
    lines.push(
      `🔹 *${md(app.name || "Unknown")}*` +
      (app.rating ? ` ⭐${app.rating}` : "") +
      ` \\- \`/app ${md(app.name || "").toLowerCase().replace(/\s+/g, "-")}\``
    );
  }

  await sendReply(ctx.chatId, lines.join("\n"));
}

async function cmdApp(ctx: Ctx) {
  const name = ctx.args.join(" ");
  if (!name) {
    return sendReply(ctx.chatId, "Usage: `/app <name>`\nExample: `/app my app`");
  }

  // Try lookup by slug first, then search
  let app = await fetchApp(name.toLowerCase().replace(/\s+/g, "-"));
  if (!app) {
    const result = await fetchApps({ q: name, limit: "1" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (result?.apps?.length) app = result.apps[0] as any;
  }

  if (!app) {
    return sendReply(ctx.chatId, `Could not find app *${md(name)}*\\. Try \`/search ${md(name)}\` first\\.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = app as any;
  const sUrl = siteUrl();
  const appUrl = `${sUrl}/apps/${a.slug || ""}`;
  const downloadSlug = a.slug || a.id || "";

  const lines = [
    `*${md(a.name || "App")}*`,
    ``,
    a.summary ? `${md(a.summary)}` : null,
    ``,
    a.developer ? `👤 *Developer:* ${md(a.developer)}` : null,
    a.category ? `📁 *Category:* ${md(a.category)}` : null,
    a.rating ? `⭐ *Rating:* ${a.rating}/5 \\(${a.reviews || 0} reviews\\)` : null,
    a.downloads ? `📥 *Downloads:* ${formatNum(a.downloads)}` : null,
    a.sizeBytes ? `💾 *Size:* ${formatSize(a.sizeBytes as number)}` : null,
    a.version ? `📦 *Version:* ${md(a.version)}` : null,
    ``,
    `🔗 ${link(appUrl, "View on BabaStore")}`,
    downloadSlug ? `📥 ${link(`${sUrl}/api/download/${downloadSlug}`, "Download APK")}` : null
  ].filter(Boolean);

  await sendReply(ctx.chatId, lines.join("\n"));
}

async function cmdDownload(ctx: Ctx) {
  const slug = ctx.args[0];
  if (!slug) {
    return sendReply(ctx.chatId, "Usage: `/download <slug>`\nExample: `/download app-1234-my-app`");
  }

  const sUrl = siteUrl();
  const downloadUrl = `${sUrl}/api/download/${encodeURIComponent(slug)}`;

  await sendReply(ctx.chatId, `📥 *Download:* ${link(downloadUrl, "Click to download")}\n\nSlug: \`${md(slug)}\``);
}

async function cmdStats(ctx: Ctx) {
  if (!ctx.isAdmin) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logTb = createAdminClient().from("telegram_chat_logs") as any;
  const { count: totalLogs } = await logTb.select("*", { count: "exact", head: true });
  const { count: todayLogs } = await logTb
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - 86400000).toISOString());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rulesTb = createAdminClient().from("telegram_automations") as any;
  const { data: rules } = await rulesTb.select("id").eq("is_active", true);

  const bot = await getBotMe();

  const lines = [
    `*Bot Stats*`,
    ``,
    `🤖 *Bot:* ${bot.ok ? `@${bot.bot?.username}` : "Unknown"}`,
    `📊 *Total messages:* ${totalLogs ?? 0}`,
    `📊 *Today:* ${todayLogs ?? 0}`,
    `⚙️ *Active rules:* ${rules?.length ?? 0}`,
    `✅ *24/7 Worker:* ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configured" : "Not configured"}`
  ];

  await sendReply(ctx.chatId, lines.join("\n"));
}

// ── Router ──────────────────────────────────────

const commandMap: Record<string, (ctx: Ctx) => Promise<unknown>> = {
  start: cmdStart,
  help: cmdHelp,
  categories: cmdCategories,
  browse: cmdBrowse,
  search: cmdSearch,
  app: cmdApp,
  download: cmdDownload,
  stats: cmdStats
};

const adminCommands = new Set(["stats"]);

export async function handleCommand(text: string, ctx: Ctx): Promise<boolean> {
  // Parse /command@botusername args
  const match = text.match(/^\/(\w+)(?:@\w+)?(?:\s+(.*))?$/);
  if (!match) return false;

  const cmd = match[1]!.toLowerCase();
  const args = (match[2] || "").trim().split(/\s+/).filter(Boolean);
  const handler = commandMap[cmd];
  if (!handler) return false;

  // Check admin-only commands
  if (adminCommands.has(cmd) && !ctx.isAdmin) {
    await sendReply(ctx.chatId, "This command is restricted to admins.");
    return true;
  }

  await handler({ ...ctx, args });
  return true;
}

// ── Utility ─────────────────────────────────────

function formatNum(n: number | undefined): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatSize(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${bytes} B`;
}
