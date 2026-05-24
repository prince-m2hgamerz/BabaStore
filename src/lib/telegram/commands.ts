import { sendTelegramRaw, getBotMe } from "@/lib/notifications/telegram";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  searchApps,
  getAppByPackage,
  browseCategory,
  getCategoryCount,
  CATEGORY_NAMES,
  resolveCategory,
} from "@/lib/telegram/babastore-api";
import type { BotApp } from "@/lib/telegram/babastore-api";

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

async function sendReply(chatId: string, text: string) {
  return sendTelegramRaw("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "MarkdownV2",
    disable_web_page_preview: true,
  });
}

function formatNum(n: number | undefined | null): string {
  if (!n || n === 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatSize(bytes: number | undefined | null): string {
  if (!bytes) return "0 B";
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatRating(rating: number | null | undefined): string {
  if (!rating) return "";
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return "⭐".repeat(full) + (half ? "½" : "");
}

// ── Command handlers ────────────────────────────

async function cmdStart(ctx: Ctx) {
  const lines = [
    "👋 *Welcome to BabaStore Bot\\!*",
    "",
    "Browse and download Android apps right from Telegram\\.",
    "",
    "*Commands:*",
    "`/categories` \\- Browse app categories",
    "`/browse <category>` \\- List apps in a category",
    "`/search <query>` \\- Search for apps",
    "`/app <name>` \\- Get app details \\& download link",
    "`/download <slug>` \\- Direct download link",
    "`/help` \\- Show this help",
  ];

  if (ctx.isAdmin) {
    lines.push("", "*Admin:*", "`/stats` \\- Bot statistics");
  }

  await sendReply(ctx.chatId, lines.join("\n"));
}

async function cmdHelp(ctx: Ctx) {
  return cmdStart(ctx);
}

async function cmdCategories(ctx: Ctx) {
  try {
    const counts = await Promise.all(
      CATEGORY_NAMES.map(async (name) => ({
        name,
        count: await getCategoryCount(name),
      }))
    );

    const lines = ["*Categories:*", ""];
    for (const cat of counts) {
      const label = cat.name.charAt(0).toUpperCase() + cat.name.slice(1);
      lines.push(
        `📁 ${md(label)} \\(${formatNum(cat.count)} apps\\) \\- \`/browse ${cat.name}\``
      );
    }
    lines.push("", "Use `/browse <category>` to see apps\\.");

    await sendReply(ctx.chatId, lines.join("\n"));
  } catch (err) {
    console.error("cmdCategories error:", err);
    await sendReply(ctx.chatId, "Could not load categories\\. Please try again later\\.");
  }
}

async function cmdBrowse(ctx: Ctx) {
  try {
    const input = ctx.args[0];
    if (!input) {
      return sendReply(
        ctx.chatId,
        "Usage: `/browse <category>`\nExample: `/browse games`\n\nCategories: " +
          CATEGORY_NAMES.map((c) => `\`${c}\``).join(", ")
      );
    }

    const query = resolveCategory(input);
    if (!query) {
      return sendReply(
        ctx.chatId,
        `Unknown category *${md(input)}*\\. Try: ` +
          CATEGORY_NAMES.map((c) => `\`${c}\``).join(", ")
      );
    }

    const apps = await browseCategory(query, 10);
    if (!apps.length) {
      return sendReply(ctx.chatId, `No apps found in category *${md(input)}*\\.`);
    }

    const lines = [
      `*${md(input.charAt(0).toUpperCase() + input.slice(1))} \\- Top ${apps.length} apps:*`,
      "",
    ];
    for (let i = 0; i < apps.length; i++) {
      const a = apps[i]!;
      lines.push(
        `${i + 1}\\. *${md(a.name)}*` +
          (a.rating ? ` ${formatRating(a.rating)}` : "") +
          (a.downloads ? ` \\- ${formatNum(a.downloads)} dl` : "")
      );
    }
    lines.push("", "Use `/app <name>` for details and download link\\.");

    await sendReply(ctx.chatId, lines.join("\n"));
  } catch (err) {
    console.error("cmdBrowse error:", err);
    await sendReply(ctx.chatId, "Could not browse category\\. Please try again later\\.");
  }
}

async function cmdSearch(ctx: Ctx) {
  try {
    const query = ctx.args.join(" ");
    if (!query || query.length < 2) {
      return sendReply(
        ctx.chatId,
        "Usage: `/search <query>`\nExample: `/search vpn`"
      );
    }

    const apps = await searchApps(query, 10);
    if (!apps.length) {
      return sendReply(ctx.chatId, `No results for *${md(query)}*\\.`);
    }

    const lines = [`*Search results for "${md(query)}":*`, ""];
    for (const a of apps) {
      lines.push(
        `🔹 *${md(a.name)}*` +
          (a.rating ? ` ${formatRating(a.rating)}` : "") +
          ` \\- \`/app ${md(a.name.toLowerCase().replace(/\s+/g, "-"))}\``
      );
    }

    await sendReply(ctx.chatId, lines.join("\n"));
  } catch (err) {
    console.error("cmdSearch error:", err);
    await sendReply(ctx.chatId, "Search failed\\. Please try again later\\.");
  }
}

async function cmdApp(ctx: Ctx) {
  try {
    const name = ctx.args.join(" ");
    if (!name) {
      return sendReply(
        ctx.chatId,
        "Usage: `/app <name>`\nExample: `/app my app`"
      );
    }

    // Try to find by package name first
    let app: BotApp | null = null;
    const pkgRegex = /^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/i;
    if (pkgRegex.test(name)) {
      app = await getAppByPackage(name);
    }

    // Fallback to search
    if (!app) {
      const results = await searchApps(name, 1);
      if (results.length) app = results[0]!;
    }

    if (!app) {
      return sendReply(
        ctx.chatId,
        `Could not find app *${md(name)}*\\. Try \`/search ${md(name)}\` first\\.`
      );
    }

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://baba-store.vercel.app"
    ).replace(/\/+$/, "");
    const appUrl = `${siteUrl}/apps/${app.slug || ""}`;

    const lines = [
      `*${md(app.name)}*`,
      "",
      app.summary ? md(app.summary) : null,
      "",
      app.developer ? `👤 *Dev:* ${md(app.developer)}` : null,
      app.rating ? `${formatRating(app.rating)} *Rating:* ${app.rating}/5 \\(${formatNum(app.reviews)} reviews\\)` : null,
      app.downloads ? `📥 *Downloads:* ${formatNum(app.downloads)}` : null,
      app.sizeBytes ? `💾 *Size:* ${formatSize(app.sizeBytes)}` : null,
      app.version ? `📦 *Version:* ${md(app.version)}` : null,
      app.packageName ? `📎 *Package:* \`${md(app.packageName)}\`` : null,
      "",
      `🔗 ${link(appUrl, "View on BabaStore")}`,
      app.slug
        ? `📥 ${link(`${siteUrl}/api/download/${encodeURIComponent(app.slug)}`, "Download APK")}`
        : null,
    ].filter(Boolean);

    await sendReply(ctx.chatId, lines.join("\n"));
  } catch (err) {
    console.error("cmdApp error:", err);
    await sendReply(ctx.chatId, "Could not find app details\\. Please try again\\.");
  }
}

async function cmdDownload(ctx: Ctx) {
  try {
    const slug = ctx.args[0];
    if (!slug) {
      return sendReply(
        ctx.chatId,
        "Usage: `/download <slug>`\nExample: `/download app\\-1234\\-my\\-app`"
      );
    }

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://baba-store.vercel.app"
    ).replace(/\/+$/, "");
    const downloadUrl = `${siteUrl}/api/download/${encodeURIComponent(slug)}`;

    await sendReply(
      ctx.chatId,
      `📥 *Download:* ${link(downloadUrl, "Click to download")}\n\nSlug: \`${md(slug)}\``
    );
  } catch (err) {
    console.error("cmdDownload error:", err);
    await sendReply(ctx.chatId, "Download link failed\\. Please try again\\.");
  }
}

async function cmdStats(ctx: Ctx) {
  try {
    if (!ctx.isAdmin) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logTb = createAdminClient().from("telegram_chat_logs") as any;
    const { count: totalLogs } = await logTb.select("*", {
      count: "exact",
      head: true,
    });
    const { count: todayLogs } = await logTb
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 86400000).toISOString());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rulesTb = createAdminClient().from("telegram_automations") as any;
    const { data: rules } = await rulesTb.select("id").eq("is_active", true);

    const bot = await getBotMe();

    const lines = [
      "*Bot Stats*",
      "",
      `🤖 *Bot:* ${bot.ok ? `@${bot.bot?.username}` : "Unknown"}`,
      `📊 *Total messages:* ${totalLogs ?? 0}`,
      `📊 *Today:* ${todayLogs ?? 0}`,
      `⚙️ *Active rules:* ${rules?.length ?? 0}`,
      `✅ *24/7 Worker:* ${
        process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configured" : "Not configured"
      }`,
    ];

    await sendReply(ctx.chatId, lines.join("\n"));
  } catch (err) {
    console.error("cmdStats error:", err);
    await sendReply(ctx.chatId, "Stats unavailable\\. Try again later\\.");
  }
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
  stats: cmdStats,
};

const adminCommands = new Set(["stats"]);

export async function handleCommand(
  text: string,
  ctx: Ctx
): Promise<boolean> {
  try {
    const match = text.match(/^\/(\w+)(?:@\w+)?(?:\s+(.*))?$/);
    if (!match) return false;

    const cmd = match[1]!.toLowerCase();
    const args = (match[2] || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const handler = commandMap[cmd];
    if (!handler) return false;

    if (adminCommands.has(cmd) && !ctx.isAdmin) {
      await sendReply(ctx.chatId, "This command is restricted to admins.");
      return true;
    }

    await handler({ ...ctx, args });
    return true;
  } catch (err) {
    console.error("Command handler error:", err);
    try {
      await sendReply(
        ctx.chatId,
        "⚠️ An error occurred\\. Please try again later\\."
      );
    } catch {
      // Best effort
    }
    return true;
  }
}
