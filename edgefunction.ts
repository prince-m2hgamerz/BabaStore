// Supabase Edge Function — Telegram Bot with BabaStore APIs
// Deploy: supabase functions deploy telegram-bot
// Set env vars: TELEGRAM_BOT_TOKEN, TELEGRAM_SECRET_TOKEN (optional webhook secret)

const BASE_URL = "https://babastore.m2hgamerz.workers.dev";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  text?: string;
  date: number;
}

interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
}

interface TelegramChat {
  id: number;
  type: string;
}

interface AppMeta {
  app_id?: number | string;
  name?: string;
  package_name?: string;
  version?: string;
  size?: number | string;
  description?: string;
  icon_url?: string;
  developer?: string;
  rating?: number | string;
  downloads?: number | string;
  category?: string;
  updated?: string;
  apk_id?: number | string;
  [key: string]: unknown;
}

// ─── Telegram API Helpers ─────────────────────────────────────────────────────

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const SECRET_TOKEN = Deno.env.get("TELEGRAM_SECRET_TOKEN") ?? "";

async function callTelegram(method: string, body: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function sendMessage(
  chatId: number,
  text: string,
  extra: Record<string, unknown> = {}
) {
  return callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
}

async function answerCallbackQuery(queryId: string, text?: string) {
  return callTelegram("answerCallbackQuery", {
    callback_query_id: queryId,
    text,
  });
}

function inlineKeyboard(rows: { text: string; callback_data: string }[][]) {
  return {
    reply_markup: { inline_keyboard: rows },
  };
}

// ─── BabaStore API Helpers ────────────────────────────────────────────────────

async function apiGet(path: string): Promise<unknown> {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
}

async function searchApps(query: string, limit = 8, offset = 0) {
  return apiGet(`/api/7/apps/search/query=${encodeURIComponent(query)}/limit=${limit}/offset=${offset}`);
}

async function getAppMeta(packageName: string) {
  return apiGet(`/api/7/app/getMeta/package_name=${encodeURIComponent(packageName)}`);
}

async function getAppVersions(packageName: string) {
  return apiGet(`/api/7/app/getVersions/package_name=${encodeURIComponent(packageName)}`);
}

async function getTrending(limit = 10) {
  return apiGet(`/api/7/listApps/store_name=apps/limit=${limit}`);
}

async function getReviews(packageName: string) {
  return apiGet(`/api/7/reviews/get/package_name=${encodeURIComponent(packageName)}`);
}

async function getRecommended(packageName: string) {
  return apiGet(`/api/7/apps/getRecommended/package_name=${encodeURIComponent(packageName)}`);
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtSize(bytes: number | string | undefined): string {
  if (!bytes) return "Unknown";
  const n = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (isNaN(n)) return String(bytes);
  if (n >= 1_048_576) return `${(n / 1_048_576).toFixed(1)} MB`;
  if (n >= 1_024) return `${(n / 1_024).toFixed(1)} KB`;
  return `${n} B`;
}

function fmtDownloads(d: number | string | undefined): string {
  if (!d) return "N/A";
  const n = typeof d === "string" ? parseInt(d) : d;
  if (isNaN(n)) return String(d);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K+`;
  return String(n);
}

function fmtApp(app: AppMeta): string {
  const name = app.name ?? "Unknown";
  const pkg = app.package_name ?? "";
  const ver = app.version ?? "?";
  const size = fmtSize(app.size as number | string | undefined);
  const rating = app.rating ? `⭐ ${app.rating}` : "";
  const dl = fmtDownloads(app.downloads as number | string | undefined);
  const dev = app.developer ? `👤 ${app.developer}` : "";
  const cat = app.category ? `📂 ${app.category}` : "";

  return [
    `<b>${name}</b>  v${ver}`,
    pkg ? `<code>${pkg}</code>` : "",
    [rating, dl ? `📥 ${dl}` : "", size ? `📦 ${size}` : ""].filter(Boolean).join("  "),
    [dev, cat].filter(Boolean).join("  "),
  ]
    .filter(Boolean)
    .join("\n");
}

function truncate(str: string, max = 120): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

// ─── Command Handlers ─────────────────────────────────────────────────────────

async function handleStart(chatId: number, firstName: string) {
  await sendMessage(
    chatId,
    `👋 Hey <b>${firstName}</b>! Welcome to <b>BabaStore Bot</b> 🤖📦\n\n` +
      `I can help you search and explore Android apps from BabaStore.\n\n` +
      `<b>Commands:</b>\n` +
      `🔍 /search &lt;query&gt; — Search apps\n` +
      `📦 /app &lt;package&gt; — App details\n` +
      `🔢 /versions &lt;package&gt; — All versions\n` +
      `🔥 /trending — Trending apps\n` +
      `⭐ /reviews &lt;package&gt; — User reviews\n` +
      `💡 /recommend &lt;package&gt; — Similar apps\n` +
      `📋 /categories — Browse by category\n` +
      `❓ /help — Show this help\n\n` +
      `<i>Example: /search whatsapp</i>`
  );
}

async function handleHelp(chatId: number) {
  await sendMessage(
    chatId,
    `<b>📖 BabaStore Bot — Help</b>\n\n` +
      `<b>/search</b> &lt;query&gt;\n` +
      `  Search apps by name or keyword.\n` +
      `  e.g. <code>/search telegram</code>\n\n` +
      `<b>/app</b> &lt;package_name&gt;\n` +
      `  Get full details for an app.\n` +
      `  e.g. <code>/app com.whatsapp</code>\n\n` +
      `<b>/versions</b> &lt;package_name&gt;\n` +
      `  List all available APK versions.\n` +
      `  e.g. <code>/versions com.whatsapp</code>\n\n` +
      `<b>/trending</b>\n` +
      `  Show top trending apps right now.\n\n` +
      `<b>/reviews</b> &lt;package_name&gt;\n` +
      `  Read user reviews for an app.\n` +
      `  e.g. <code>/reviews com.whatsapp</code>\n\n` +
      `<b>/recommend</b> &lt;package_name&gt;\n` +
      `  Discover similar apps.\n` +
      `  e.g. <code>/recommend com.whatsapp</code>\n\n` +
      `<b>/categories</b>\n` +
      `  Browse popular app categories.`
  );
}

async function handleSearch(chatId: number, query: string, offset = 0) {
  if (!query.trim()) {
    return sendMessage(chatId, "❗ Please provide a search term.\n<i>Example: /search minecraft</i>");
  }

  await sendMessage(chatId, `🔍 Searching for <b>${query}</b>…`);

  const data = (await searchApps(query, 8, offset)) as { apps?: AppMeta[]; total?: number } | null;
  const apps: AppMeta[] = data?.apps ?? (Array.isArray(data) ? (data as AppMeta[]) : []);

  if (!apps.length) {
    return sendMessage(chatId, `😕 No apps found for "<b>${query}</b>".\nTry a different keyword.`);
  }

  const lines = apps.map((app, i) => {
    const name = app.name ?? "Unknown";
    const pkg = app.package_name ?? "";
    const ver = app.version ? ` v${app.version}` : "";
    const rating = app.rating ? ` ⭐${app.rating}` : "";
    return `${offset + i + 1}. <b>${name}</b>${ver}${rating}\n   <code>${pkg}</code>`;
  });

  const keyboard =
    apps.length === 8
      ? inlineKeyboard([
          [
            { text: "➡️ Next Page", callback_data: `search:${query}:${offset + 8}` },
            ...(offset > 0 ? [{ text: "⬅️ Prev", callback_data: `search:${query}:${offset - 8}` }] : []),
          ],
          apps
            .slice(0, 4)
            .map((a) => ({ text: `📦 ${a.name ?? a.package_name}`, callback_data: `app:${a.package_name}` })),
          apps
            .slice(4)
            .map((a) => ({ text: `📦 ${a.name ?? a.package_name}`, callback_data: `app:${a.package_name}` })),
        ])
      : inlineKeyboard([
          apps.map((a) => ({ text: `📦 ${a.name ?? a.package_name}`, callback_data: `app:${a.package_name}` })),
        ]);

  await sendMessage(
    chatId,
    `📋 Results for "<b>${query}</b>"` + (offset > 0 ? ` (page ${Math.floor(offset / 8) + 1})` : "") + `:\n\n` +
      lines.join("\n\n") +
      `\n\n<i>Tap an app name below for details</i>`,
    keyboard
  );
}

async function handleApp(chatId: number, packageName: string) {
  if (!packageName.trim()) {
    return sendMessage(chatId, "❗ Provide a package name.\n<i>Example: /app com.whatsapp</i>");
  }

  await sendMessage(chatId, `📦 Fetching details for <code>${packageName}</code>…`);

  const data = (await getAppMeta(packageName)) as { app?: AppMeta } | AppMeta | null;
  const app: AppMeta | null = (data as { app?: AppMeta })?.app ?? (data as AppMeta) ?? null;

  if (!app || !app.name) {
    return sendMessage(chatId, `😕 Could not find app <code>${packageName}</code>.\nCheck the package name and try again.`);
  }

  const desc = app.description ? `\n📝 ${truncate(String(app.description), 200)}` : "";

  const text =
    `📦 <b>${app.name}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📌 <code>${app.package_name}</code>\n` +
    `🔢 Version: <b>${app.version ?? "N/A"}</b>\n` +
    `📏 Size: <b>${fmtSize(app.size as number | string | undefined)}</b>\n` +
    `⭐ Rating: <b>${app.rating ?? "N/A"}</b>\n` +
    `📥 Downloads: <b>${fmtDownloads(app.downloads as number | string | undefined)}</b>\n` +
    `👤 Developer: <b>${app.developer ?? "N/A"}</b>\n` +
    `📂 Category: <b>${app.category ?? "N/A"}</b>\n` +
    (app.updated ? `🕒 Updated: <b>${app.updated}</b>\n` : "") +
    desc;

  const pkg = app.package_name ?? packageName;

  await sendMessage(chatId, text, inlineKeyboard([
    [
      { text: "🔢 Versions", callback_data: `versions:${pkg}` },
      { text: "⭐ Reviews", callback_data: `reviews:${pkg}` },
    ],
    [
      { text: "💡 Similar Apps", callback_data: `recommend:${pkg}` },
    ],
  ]));
}

async function handleVersions(chatId: number, packageName: string) {
  if (!packageName.trim()) {
    return sendMessage(chatId, "❗ Provide a package name.\n<i>Example: /versions com.whatsapp</i>");
  }

  await sendMessage(chatId, `🔢 Fetching versions for <code>${packageName}</code>…`);

  const data = (await getAppVersions(packageName)) as { versions?: AppMeta[] } | AppMeta[] | null;
  const versions: AppMeta[] =
    (data as { versions?: AppMeta[] })?.versions ??
    (Array.isArray(data) ? (data as AppMeta[]) : []);

  if (!versions.length) {
    return sendMessage(chatId, `😕 No version history found for <code>${packageName}</code>.`);
  }

  const lines = versions.slice(0, 12).map((v, i) => {
    const ver = v.version ?? "?";
    const size = fmtSize(v.size as number | string | undefined);
    const date = v.updated ?? "";
    return `${i + 1}. <b>v${ver}</b>  📦 ${size}${date ? `  📅 ${date}` : ""}`;
  });

  await sendMessage(
    chatId,
    `🔢 <b>Versions of</b> <code>${packageName}</code>:\n\n` +
      lines.join("\n") +
      (versions.length > 12 ? `\n\n<i>…and ${versions.length - 12} more versions</i>` : "")
  );
}

async function handleTrending(chatId: number) {
  await sendMessage(chatId, "🔥 Fetching trending apps…");

  const data = (await getTrending(10)) as { apps?: AppMeta[] } | AppMeta[] | null;
  const apps: AppMeta[] =
    (data as { apps?: AppMeta[] })?.apps ??
    (Array.isArray(data) ? (data as AppMeta[]) : []);

  if (!apps.length) {
    return sendMessage(chatId, "😕 Could not load trending apps right now. Try again later.");
  }

  const lines = apps.map((app, i) => {
    const name = app.name ?? "Unknown";
    const pkg = app.package_name ?? "";
    const rating = app.rating ? ` ⭐${app.rating}` : "";
    const dl = app.downloads ? ` 📥${fmtDownloads(app.downloads as number | string | undefined)}` : "";
    return `${i + 1}. <b>${name}</b>${rating}${dl}\n   <code>${pkg}</code>`;
  });

  await sendMessage(
    chatId,
    `🔥 <b>Trending Apps</b>\n\n` + lines.join("\n\n"),
    inlineKeyboard([
      apps
        .slice(0, 5)
        .map((a) => ({ text: a.name ?? a.package_name ?? "App", callback_data: `app:${a.package_name}` })),
      apps
        .slice(5)
        .map((a) => ({ text: a.name ?? a.package_name ?? "App", callback_data: `app:${a.package_name}` })),
    ])
  );
}

async function handleReviews(chatId: number, packageName: string) {
  if (!packageName.trim()) {
    return sendMessage(chatId, "❗ Provide a package name.\n<i>Example: /reviews com.whatsapp</i>");
  }

  await sendMessage(chatId, `⭐ Loading reviews for <code>${packageName}</code>…`);

  const data = (await getReviews(packageName)) as { reviews?: Array<{ author?: string; rating?: number | string; comment?: string; date?: string }> } | Array<{ author?: string; rating?: number | string; comment?: string; date?: string }> | null;
  type Review = { author?: string; rating?: number | string; comment?: string; date?: string };
  const reviews: Review[] =
    (data as { reviews?: Review[] })?.reviews ??
    (Array.isArray(data) ? (data as Review[]) : []);

  if (!reviews.length) {
    return sendMessage(chatId, `😕 No reviews found for <code>${packageName}</code>.`);
  }

  const lines = reviews.slice(0, 5).map((r) => {
    const stars = "⭐".repeat(Math.min(5, Number(r.rating ?? 5)));
    const author = r.author ?? "Anonymous";
    const comment = truncate(r.comment ?? "", 150);
    const date = r.date ? ` • ${r.date}` : "";
    return `${stars} <b>${author}</b>${date}\n${comment}`;
  });

  await sendMessage(
    chatId,
    `⭐ <b>Reviews for</b> <code>${packageName}</code>:\n\n` +
      lines.join("\n\n") +
      (reviews.length > 5 ? `\n\n<i>Showing top 5 of ${reviews.length} reviews</i>` : "")
  );
}

async function handleRecommend(chatId: number, packageName: string) {
  if (!packageName.trim()) {
    return sendMessage(chatId, "❗ Provide a package name.\n<i>Example: /recommend com.whatsapp</i>");
  }

  await sendMessage(chatId, `💡 Finding similar apps to <code>${packageName}</code>…`);

  const data = (await getRecommended(packageName)) as { apps?: AppMeta[] } | AppMeta[] | null;
  const apps: AppMeta[] =
    (data as { apps?: AppMeta[] })?.apps ??
    (Array.isArray(data) ? (data as AppMeta[]) : []);

  if (!apps.length) {
    return sendMessage(chatId, `😕 No recommendations found for <code>${packageName}</code>.`);
  }

  const lines = apps.slice(0, 8).map((app, i) => {
    const name = app.name ?? "Unknown";
    const pkg = app.package_name ?? "";
    const rating = app.rating ? ` ⭐${app.rating}` : "";
    return `${i + 1}. <b>${name}</b>${rating}\n   <code>${pkg}</code>`;
  });

  await sendMessage(
    chatId,
    `💡 <b>Apps similar to</b> <code>${packageName}</code>:\n\n` + lines.join("\n\n"),
    inlineKeyboard(
      [apps.slice(0, 4), apps.slice(4, 8)].map((row) =>
        row.map((a) => ({ text: a.name ?? a.package_name ?? "App", callback_data: `app:${a.package_name}` }))
      )
    )
  );
}

async function handleCategories(chatId: number) {
  await sendMessage(
    chatId,
    `📋 <b>Browse by Category</b>\n\nTap a category to explore:`,
    inlineKeyboard([
      [
        { text: "🎮 Games", callback_data: "cat:games" },
        { text: "🤖 AI", callback_data: "cat:ai" },
      ],
      [
        { text: "💬 Social", callback_data: "cat:social" },
        { text: "🔒 VPN", callback_data: "cat:vpn" },
      ],
      [
        { text: "🎵 Music", callback_data: "cat:music" },
        { text: "📷 Photo", callback_data: "cat:photo" },
      ],
      [
        { text: "💰 Finance", callback_data: "cat:finance" },
        { text: "📰 News", callback_data: "cat:news" },
      ],
      [
        { text: "🏥 Health", callback_data: "cat:health" },
        { text: "🎓 Education", callback_data: "cat:education" },
      ],
    ])
  );
}

// ─── Callback Query Router ────────────────────────────────────────────────────

async function handleCallback(query: TelegramCallbackQuery) {
  const chatId = query.message?.chat.id;
  if (!chatId) return;

  const data = query.data ?? "";
  const [action, ...rest] = data.split(":");

  await answerCallbackQuery(query.id);

  switch (action) {
    case "app":
      return handleApp(chatId, rest.join(":"));

    case "versions":
      return handleVersions(chatId, rest.join(":"));

    case "reviews":
      return handleReviews(chatId, rest.join(":"));

    case "recommend":
      return handleRecommend(chatId, rest.join(":"));

    case "search": {
      const [queryText, offsetStr] = rest;
      return handleSearch(chatId, queryText, parseInt(offsetStr ?? "0"));
    }

    case "cat":
      return handleSearch(chatId, rest.join(":"));

    default:
      await sendMessage(chatId, "❓ Unknown action. Use /help to see available commands.");
  }
}

// ─── Message Router ───────────────────────────────────────────────────────────

async function handleMessage(msg: TelegramMessage) {
  const chatId = msg.chat.id;
  const text = msg.text?.trim() ?? "";
  const firstName = msg.from?.first_name ?? "there";

  if (!text.startsWith("/")) {
    // Non-command: try searching the text
    return sendMessage(
      chatId,
      `🤔 Not sure what you mean. Try searching:\n/search ${text}\n\nOr use /help to see all commands.`
    );
  }

  const [rawCmd, ...args] = text.split(/\s+/);
  const cmd = rawCmd.toLowerCase().replace(/^\//, "").split("@")[0]; // handle /cmd@botname
  const arg = args.join(" ");

  switch (cmd) {
    case "start":
      return handleStart(chatId, firstName);
    case "help":
      return handleHelp(chatId);
    case "search":
    case "s":
      return handleSearch(chatId, arg);
    case "app":
    case "info":
      return handleApp(chatId, arg);
    case "versions":
    case "ver":
      return handleVersions(chatId, arg);
    case "trending":
    case "trend":
      return handleTrending(chatId);
    case "reviews":
    case "review":
      return handleReviews(chatId, arg);
    case "recommend":
    case "rec":
    case "similar":
      return handleRecommend(chatId, arg);
    case "categories":
    case "cats":
    case "cat":
      return handleCategories(chatId);
    default:
      await sendMessage(
        chatId,
        `❓ Unknown command <b>/${cmd}</b>.\nUse /help to see all available commands.`
      );
  }
}

// ─── Edge Function Entry Point ────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Health check
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "ok", bot: "BabaStore Bot" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Validate secret token (optional but recommended)
  if (SECRET_TOKEN) {
    const incoming = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (incoming !== SECRET_TOKEN) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is not set");
    return new Response("Bot token missing", { status: 500 });
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  try {
    if (update.callback_query) {
      await handleCallback(update.callback_query);
    } else if (update.message) {
      await handleMessage(update.message);
    }
  } catch (err) {
    console.error("Handler error:", err);
    // Don't throw — always return 200 to Telegram to avoid retry storms
  }

  return new Response("OK", { status: 200 });
});