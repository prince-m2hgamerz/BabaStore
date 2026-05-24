// ═══════════════════════════════════════════════════════════════════
//  BabaStore Telegram Bot — Supabase Edge Function
//  Bot API 10.0 — Single file index.ts
//  Deploy : supabase functions deploy telegram-bot --no-verify-jwt
//  Secrets: TELEGRAM_BOT_TOKEN   (required)
//           TELEGRAM_SECRET_TOKEN (optional webhook secret)
// ═══════════════════════════════════════════════════════════════════

const BASE_URL   = "https://babastore.m2hgamerz.workers.dev/api/7";
const BOT_TOKEN  = Deno.env.get("TELEGRAM_BOT_TOKEN")    ?? "";
const SECRET_TOK = Deno.env.get("TELEGRAM_SECRET_TOKEN") ?? "";

// ─── Telegram types ───────────────────────────────────────────────

interface TgUpdate {
  update_id:       number;
  message?:        TgMessage;
  callback_query?: TgCallbackQuery;
  inline_query?:   TgInlineQuery;
  guest_message?:  TgMessage;
}

interface TgMessage {
  message_id: number;
  from?:      TgUser;
  chat:       TgChat;
  text?:      string;
  date:       number;
}

interface TgUser {
  id:         number;
  first_name: string;
  username?:  string;
}

interface TgChat {
  id:    number;
  type:  string;
}

interface TgCallbackQuery {
  id:                string;
  from:              TgUser;
  message?:          TgMessage;
  data?:             string;
  inline_message_id?: string;
}

interface TgInlineQuery {
  id:     string;
  from:   TgUser;
  query:  string;
  offset: string;
}

// ─── App types ────────────────────────────────────────────────────

interface BotApp {
  name:         string;
  package:      string;
  version:      string;
  sizeBytes?:   number;
  developer?:   string;
  rating?:      number;
  downloads?:   number;
  updatedAt?:   string;
  description?: string;
}

interface Review {
  author?:  string;
  rating?:  number;
  comment?: string;
  date?:    string;
}

// ─── Telegram API ─────────────────────────────────────────────────

type TgExtra = Record<string, unknown>;

/** Raw Telegram API call — always returns the parsed JSON body. */
async function tgCall(
  method: string,
  body:   TgExtra
): Promise<{ ok: boolean; result?: unknown; description?: string }> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/${method}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      }
    );
    const json = await res.json();
    if (!json.ok) {
      console.warn(`[tg/${method}] FAILED:`, json.description ?? JSON.stringify(json));
    }
    return json;
  } catch (err) {
    console.error(`[tg/${method}] EXCEPTION:`, err);
    return { ok: false, description: String(err) };
  }
}

/** Send a new message — always works. */
async function send(chatId: number, text: string, extra: TgExtra = {}) {
  return tgCall("sendMessage", {
    chat_id:                  chatId,
    text,
    parse_mode:               "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
}

/**
 * Try to edit an existing message (better UX — no extra message).
 * If Telegram rejects for ANY reason (message not modified, too old,
 * permissions, etc.) fall back to sending a brand-new message.
 * This is the #1 fix for silent button failures.
 */
async function safeEdit(
  chatId:    number,
  messageId: number,
  text:      string,
  extra:     TgExtra = {}
) {
  const res = await tgCall("editMessageText", {
    chat_id:                  chatId,
    message_id:               messageId,
    text,
    parse_mode:               "HTML",
    disable_web_page_preview: true,
    ...extra,
  });

  if (!res.ok) {
    // Fallback: send a fresh message so the user always gets a response
    console.log("[tg] edit failed, falling back to sendMessage");
    return send(chatId, text, extra);
  }
  return res;
}

/** Show "typing…" indicator — fire-and-forget, never throws. */
function typing(chatId: number) {
  tgCall("sendChatAction", { chat_id: chatId, action: "typing" }).catch(() => {});
}

/** Acknowledge a callback query — must be called within 10 s. */
async function ackCBQ(id: string, text?: string, alert = false) {
  return tgCall("answerCallbackQuery", {
    callback_query_id: id,
    ...(text ? { text, show_alert: alert } : {}),
  });
}

/** Build an inline keyboard markup object. */
function kbd(rows: { text: string; callback_data: string }[][]) {
  return { reply_markup: { inline_keyboard: rows } };
}

/** Build rows of app buttons (2 per row). */
function appKbd(apps: BotApp[]): { text: string; callback_data: string }[][] {
  const btns = apps
    .filter(a => a.package)
    .slice(0, 8)
    .map(a => ({ text: `📦 ${a.name}`, callback_data: `APP|${a.package}` }));

  const rows: typeof btns[] = [];
  for (let i = 0; i < btns.length; i += 2) rows.push(btns.slice(i, i + 2));
  return rows;
}

/** Register bot command menu with BotFather — idempotent, fire-and-forget. */
function registerCommands() {
  tgCall("setMyCommands", {
    commands: [
      { command: "start",      description: "Welcome & help" },
      { command: "search",     description: "Search apps — /search <query>" },
      { command: "app",        description: "App details — /app <package>" },
      { command: "versions",   description: "APK versions — /versions <package>" },
      { command: "trending",   description: "Trending apps now" },
      { command: "reviews",    description: "User reviews — /reviews <package>" },
      { command: "recommend",  description: "Similar apps — /recommend <package>" },
      { command: "categories", description: "Browse by category" },
      { command: "help",       description: "Show all commands" },
    ],
  }).catch(e => console.warn("[tg] setMyCommands:", e));
}

// ─── BabaStore API ────────────────────────────────────────────────

async function apiFetch(path: string): Promise<unknown> {
  const url = `${BASE_URL}${path}`;
  console.log("[api]", url);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal:  AbortSignal.timeout(8000),
    });
    if (!res.ok) { console.error(`[api] HTTP ${res.status}`); return null; }
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { console.error("[api] bad JSON:", text.slice(0, 200)); return null; }
  } catch (err) {
    console.error("[api] fetch error:", err);
    return null;
  }
}

// Handles every known Aptoide-flavoured response shape
function extractList(raw: unknown): Record<string, unknown>[] {
  if (!raw) return [];
  const r = raw as Record<string, unknown>;
  // { datalist: { list: [...] } }
  const dl = r.datalist as Record<string, unknown> | undefined;
  if (Array.isArray(dl?.list)) return dl!.list as Record<string, unknown>[];
  // { list: [...] }
  if (Array.isArray(r.list))  return r.list  as Record<string, unknown>[];
  // { apps: [...] }
  if (Array.isArray(r.apps))  return r.apps  as Record<string, unknown>[];
  // { data: [...] }
  if (Array.isArray(r.data))  return r.data  as Record<string, unknown>[];
  // { data: { list: [...] } }
  const d = r.data as Record<string, unknown> | undefined;
  if (Array.isArray(d?.list)) return d!.list as Record<string, unknown>[];
  // raw array
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  console.warn("[api] unknown list shape:", JSON.stringify(raw).slice(0, 200));
  return [];
}

function extractTotal(raw: unknown): number {
  if (!raw || typeof raw !== "object") return 0;
  const r = raw as Record<string, unknown>;
  const dl = r.datalist as Record<string, unknown> | undefined;
  return (dl?.total as number) ?? (r.total as number) ?? 0;
}

function extractSingle(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null;
  const r = raw as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && !Array.isArray(r.data))
    return r.data as Record<string, unknown>;
  if (r.app  && typeof r.app === "object")  return r.app  as Record<string, unknown>;
  if (r.item && typeof r.item === "object") return r.item as Record<string, unknown>;
  if (typeof r.name === "string" || typeof r.package === "string" ||
      typeof r.package_name === "string") return r;
  return null;
}

type RawRecord = Record<string, unknown>;

function mapApp(r: RawRecord): BotApp | null {
  const pkg =
    (r.package_name as string) ||
    (r.package      as string) ||
    (r.apk_package  as string) || "";
  if (!pkg) return null;

  const name = (r.name as string) || (r.app as string) || (r.title as string) || pkg;

  const file    = r.file as RawRecord | undefined;
  const version = (file?.vername as string) || (r.version as string) || (r.vername as string) || "?";

  const sizeBytes =
    (file?.filesize as number) ?? (r.size as number) ?? (r.filesize as number) ?? undefined;

  const dev        = r.developer as RawRecord | undefined;
  const developer  = (dev?.name as string) || (r.developer as string) || (r.author as string) || undefined;

  const stats   = r.stats   as RawRecord | undefined;
  const prating = stats?.prating as RawRecord | undefined;
  const rObj    = stats?.rating  as RawRecord | undefined;
  const rating  = (prating?.avg as number) ?? (rObj?.avg as number) ?? (r.rating as number) ?? undefined;

  const downloads =
    (stats?.pdownloads as number) ?? (stats?.downloads as number) ?? (r.downloads as number) ?? undefined;

  const updatedAt = (r.updated as string) || (r.modified as string) || (r.added as string) || undefined;

  const media       = r.media as RawRecord | undefined;
  const description = (media?.description as string) || (r.description as string) ||
                      (media?.summary     as string) || (r.summary     as string) || "";

  return { name, package: pkg, version, sizeBytes, developer, rating, downloads, updatedAt, description };
}

// ─── API calls ────────────────────────────────────────────────────

async function apiSearch(
  query: string, limit = 8, offset = 0
): Promise<{ apps: BotApp[]; total: number }> {
  const raw  = await apiFetch(
    `/apps/search/query=${encodeURIComponent(query)}/limit=${limit}/offset=${offset}`
  );
  return {
    apps:  extractList(raw).map(mapApp).filter(Boolean) as BotApp[],
    total: extractTotal(raw),
  };
}

async function apiMeta(pkg: string): Promise<BotApp | null> {
  const raw    = await apiFetch(`/app/getMeta/package_name=${encodeURIComponent(pkg)}`);
  const single = extractSingle(raw);
  if (single) return mapApp(single);
  if (raw && typeof raw === "object") return mapApp(raw as RawRecord);
  return null;
}

async function apiVersions(pkg: string): Promise<BotApp[]> {
  const raw = await apiFetch(`/app/getVersions/package_name=${encodeURIComponent(pkg)}`);
  return extractList(raw).map(mapApp).filter(Boolean) as BotApp[];
}

async function apiTrending(limit = 10): Promise<BotApp[]> {
  const raw = await apiFetch(`/listApps/store_name=apps/limit=${limit}`);
  return extractList(raw).map(mapApp).filter(Boolean) as BotApp[];
}

async function apiReviews(pkg: string): Promise<Review[]> {
  const raw = await apiFetch(
    `/reviews/get/package_name=${encodeURIComponent(pkg)}/limit=5`
  );
  return extractList(raw).map((r: RawRecord): Review => ({
    author:  (r.user as RawRecord | undefined)?.name as string ?? (r.author  as string) ?? "Anonymous",
    rating:  (r.stats as RawRecord | undefined)?.rating as number ?? (r.rating as number) ?? 0,
    comment: (r.body    as string) || (r.comment as string) || "",
    date:    (r.added   as string) || (r.date    as string) || "",
  }));
}

async function apiRecommended(pkg: string): Promise<BotApp[]> {
  const raw = await apiFetch(
    `/apps/getRecommended/package_name=${encodeURIComponent(pkg)}/limit=8`
  );
  return extractList(raw).map(mapApp).filter(Boolean) as BotApp[];
}

// ─── Formatters ───────────────────────────────────────────────────

function fmtBytes(n?: number): string {
  if (!n) return "?";
  if (n >= 1_048_576) return `${(n / 1_048_576).toFixed(1)} MB`;
  if (n >= 1_024)     return `${(n / 1_024).toFixed(1)} KB`;
  return `${n} B`;
}

function fmtDL(n?: number): string {
  if (!n) return "";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B+`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K+`;
  return String(n);
}

function trunc(s: string, max = 200): string {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function appCard(app: BotApp): string {
  const lines = [
    `📦 <b>${app.name}</b>`,
    "━━━━━━━━━━━━━━━━━━━━",
    `📌 <code>${app.package}</code>`,
    `🔢 Version: <b>${app.version}</b>`,
    `📏 Size: <b>${fmtBytes(app.sizeBytes)}</b>`,
  ];
  if (app.rating)    lines.push(`⭐ Rating: <b>${app.rating}</b>`);
  if (app.downloads) lines.push(`📥 Downloads: <b>${fmtDL(app.downloads)}</b>`);
  if (app.developer) lines.push(`👤 Developer: <b>${app.developer}</b>`);
  if (app.updatedAt) lines.push(`🕒 Updated: <b>${app.updatedAt}</b>`);
  if (app.description) lines.push(`\n📝 ${trunc(app.description, 200)}`);
  return lines.join("\n");
}

// ─── reply helper — used by EVERY handler ────────────────────────
//
//  msgId present  → try edit first, fall back to send (for callbacks)
//  msgId absent   → always send (for commands)

async function reply(
  chatId: number,
  text:   string,
  extra:  TgExtra = {},
  msgId?: number
) {
  if (msgId) return safeEdit(chatId, msgId, text, extra);
  return send(chatId, text, extra);
}

// ─── Command / callback handlers ─────────────────────────────────

async function onStart(chatId: number, firstName: string) {
  await send(chatId,
    `👋 Hey <b>${firstName}</b>! Welcome to <b>BabaStore Bot</b> 🤖📦\n\n` +
    `<b>Commands:</b>\n` +
    `🔍 /search &lt;query&gt; — Search apps\n` +
    `📦 /app &lt;package&gt; — Full app details\n` +
    `🔢 /versions &lt;package&gt; — All APK versions\n` +
    `🔥 /trending — Trending right now\n` +
    `⭐ /reviews &lt;package&gt; — User reviews\n` +
    `💡 /recommend &lt;package&gt; — Similar apps\n` +
    `📋 /categories — Browse by category\n\n` +
    `<i>Tip: inline search works too — type </i><code>@YourBotName minecraft</code><i> in any chat.</i>`
  );
}

async function onHelp(chatId: number) {
  await send(chatId,
    `<b>📖 Help</b>\n\n` +
    `/search &lt;q&gt; — e.g. <code>/search telegram</code>\n` +
    `/app &lt;pkg&gt; — e.g. <code>/app com.whatsapp</code>\n` +
    `/versions &lt;pkg&gt;\n` +
    `/trending\n` +
    `/reviews &lt;pkg&gt;\n` +
    `/recommend &lt;pkg&gt;\n` +
    `/categories\n\n` +
    `<b>Short aliases:</b> /s /info /ver /rec /similar /trend /cats`
  );
}

async function onSearch(
  chatId: number,
  query:  string,
  offset = 0,
  msgId?: number
) {
  if (!query.trim()) {
    return reply(chatId, "❗ Provide a search term — e.g. <code>/search minecraft</code>", {}, msgId);
  }

  typing(chatId);

  const { apps, total } = await apiSearch(query, 8, offset);

  if (!apps.length) {
    return reply(chatId, `😕 No results for "<b>${query}</b>". Try a different keyword.`, {}, msgId);
  }

  const lines = apps.map((app, i) =>
    `${offset + i + 1}. <b>${app.name}</b>  v${app.version}` +
    (app.rating ? `  ⭐${app.rating}` : "") +
    `\n   <code>${app.package}</code>`
  );

  const nav: { text: string; callback_data: string }[] = [];
  if (offset > 0)       nav.push({ text: "⬅️ Prev", callback_data: `SEARCH|${query}|${offset - 8}` });
  if (apps.length === 8) nav.push({ text: "➡️ Next", callback_data: `SEARCH|${query}|${offset + 8}` });

  const rows = [
    ...appKbd(apps),
    ...(nav.length ? [nav] : []),
  ];

  const header =
    `📋 <b>${query}</b>` +
    (offset > 0    ? ` — page ${Math.floor(offset / 8) + 1}` : "") +
    (total > 0     ? ` (${total} total)` : "") +
    `\n\n`;

  return reply(
    chatId,
    header + lines.join("\n\n") + `\n\n<i>Tap an app for details ↓</i>`,
    rows.length ? kbd(rows) : {},
    msgId
  );
}

async function onApp(chatId: number, pkg: string, msgId?: number) {
  if (!pkg.trim()) {
    return reply(chatId, "❗ Provide a package — e.g. <code>/app com.whatsapp</code>", {}, msgId);
  }

  typing(chatId);

  let app = await apiMeta(pkg);

  if (!app) {
    // Fallback: search by name
    const { apps } = await apiSearch(pkg, 1);
    if (apps.length) app = await apiMeta(apps[0]!.package);
  }

  if (!app) {
    return reply(chatId, `😕 Not found: <code>${pkg}</code>\n\nTry /search ${pkg}`, {}, msgId);
  }

  return reply(chatId, appCard(app), kbd([
    [
      { text: "🔢 Versions",     callback_data: `VERSIONS|${app.package}` },
      { text: "⭐ Reviews",      callback_data: `REVIEWS|${app.package}`  },
    ],
    [
      { text: "💡 Similar Apps", callback_data: `RECOMMEND|${app.package}` },
    ],
  ]), msgId);
}

async function onVersions(chatId: number, pkg: string, msgId?: number) {
  if (!pkg.trim()) {
    return reply(chatId, "❗ Provide a package — e.g. <code>/versions com.whatsapp</code>", {}, msgId);
  }

  typing(chatId);

  const versions = await apiVersions(pkg);

  if (!versions.length) {
    return reply(chatId, `😕 No version history found for <code>${pkg}</code>.`, {}, msgId);
  }

  const lines = versions.slice(0, 15).map((v, i) =>
    `${i + 1}. v<b>${v.version}</b>  📦 ${fmtBytes(v.sizeBytes)}` +
    (v.updatedAt ? `  📅 ${v.updatedAt}` : "")
  );

  return reply(chatId,
    `🔢 <b>Versions of</b> <code>${pkg}</code> (${versions.length} total):\n\n` +
    lines.join("\n") +
    (versions.length > 15 ? `\n<i>…and ${versions.length - 15} more</i>` : ""),
    {}, msgId
  );
}

async function onTrending(chatId: number, msgId?: number) {
  typing(chatId);

  const apps = await apiTrending(10);

  if (!apps.length) {
    return reply(chatId, "😕 Could not load trending apps. Try again later.", {}, msgId);
  }

  const lines = apps.map((app, i) =>
    `${i + 1}. <b>${app.name}</b>` +
    (app.rating    ? `  ⭐${app.rating}` : "") +
    (app.downloads ? `  📥${fmtDL(app.downloads)}` : "") +
    `\n   <code>${app.package}</code>`
  );

  const rows = appKbd(apps);

  return reply(chatId,
    `🔥 <b>Trending Apps</b>\n\n` + lines.join("\n\n"),
    rows.length ? kbd(rows) : {},
    msgId
  );
}

async function onReviews(chatId: number, pkg: string, msgId?: number) {
  if (!pkg.trim()) {
    return reply(chatId, "❗ Provide a package — e.g. <code>/reviews com.whatsapp</code>", {}, msgId);
  }

  typing(chatId);

  const reviews = await apiReviews(pkg);

  if (!reviews.length) {
    return reply(chatId, `😕 No reviews found for <code>${pkg}</code>.`, {}, msgId);
  }

  const lines = reviews.slice(0, 5).map(r => {
    const stars   = "⭐".repeat(Math.min(5, Math.max(1, Math.round(Number(r.rating ?? 3)))));
    const comment = r.comment ? `\n   ${trunc(r.comment, 160)}` : "";
    const date    = r.date ? `  <i>${r.date}</i>` : "";
    return `${stars} <b>${r.author ?? "Anonymous"}</b>${date}${comment}`;
  });

  return reply(chatId,
    `⭐ <b>Reviews for</b> <code>${pkg}</code>:\n\n` +
    lines.join("\n\n") +
    (reviews.length > 5 ? `\n\n<i>Showing 5 of ${reviews.length}</i>` : ""),
    {}, msgId
  );
}

async function onRecommend(chatId: number, pkg: string, msgId?: number) {
  if (!pkg.trim()) {
    return reply(chatId, "❗ Provide a package — e.g. <code>/recommend com.whatsapp</code>", {}, msgId);
  }

  typing(chatId);

  const apps = await apiRecommended(pkg);

  if (!apps.length) {
    return reply(chatId, `😕 No recommendations for <code>${pkg}</code>.`, {}, msgId);
  }

  const lines = apps.slice(0, 8).map((app, i) =>
    `${i + 1}. <b>${app.name}</b>` +
    (app.rating ? `  ⭐${app.rating}` : "") +
    `\n   <code>${app.package}</code>`
  );

  return reply(chatId,
    `💡 <b>Similar to</b> <code>${pkg}</code>:\n\n` + lines.join("\n\n"),
    kbd(appKbd(apps)),
    msgId
  );
}

async function onCategories(chatId: number) {
  await send(chatId, `📋 <b>Browse by Category</b>\n\nTap a category:`,
    kbd([
      [{ text: "🎮 Games",     callback_data: "CAT|games"     }, { text: "🤖 AI",        callback_data: "CAT|ai"        }],
      [{ text: "💬 Social",    callback_data: "CAT|social"    }, { text: "🔒 VPN",       callback_data: "CAT|vpn"       }],
      [{ text: "🎵 Music",     callback_data: "CAT|music"     }, { text: "📷 Photo",     callback_data: "CAT|photo"     }],
      [{ text: "💰 Finance",   callback_data: "CAT|finance"   }, { text: "📰 News",      callback_data: "CAT|news"      }],
      [{ text: "🏥 Health",    callback_data: "CAT|health"    }, { text: "🎓 Education", callback_data: "CAT|education" }],
      [{ text: "🔥 Trending Now", callback_data: "TRENDING|" }],
    ])
  );
}

// ─── Inline query handler ─────────────────────────────────────────

async function handleInlineQuery(iq: TgInlineQuery) {
  const query = iq.query.trim();
  if (!query) {
    return tgCall("answerInlineQuery", {
      inline_query_id: iq.id,
      results:         [{ type: "article", id: "hint", title: "Type to search BabaStore…",
                          input_message_content: { message_text: "Search BabaStore for apps 📦" } }],
      cache_time:      0,
    });
  }

  const { apps } = await apiSearch(query, 5);

  const results = apps.map(app => ({
    type:        "article",
    id:          app.package,
    title:       `${app.name}  v${app.version}`,
    description: `${fmtBytes(app.sizeBytes)} · ${app.developer ?? "BabaStore"}` +
                 (app.rating ? ` · ⭐${app.rating}` : ""),
    input_message_content: {
      message_text:             appCard(app),
      parse_mode:               "HTML",
      disable_web_page_preview: true,
    },
    reply_markup: {
      inline_keyboard: [[
        { text: "🔢 Versions",    callback_data: `VERSIONS|${app.package}`  },
        { text: "💡 Similar",     callback_data: `RECOMMEND|${app.package}` },
      ]],
    },
  }));

  return tgCall("answerInlineQuery", {
    inline_query_id: iq.id,
    results,
    cache_time:      30,
    is_personal:     true,
  });
}

// ─── Callback query handler ───────────────────────────────────────
//
//  IMPORTANT: callback_data format is  ACTION|payload
//             using | as separator (safe — package names use dots, never pipes)
//             Actions are UPPERCASE to distinguish from text content.
//
//  Flow: ack immediately → handle → safeEdit (fallback to send)

async function handleCallback(cbq: TgCallbackQuery) {
  // Acknowledge within 10 s — removes the loading spinner on the button
  await ackCBQ(cbq.id);

  const chatId = cbq.message?.chat.id;
  const msgId  = cbq.message?.message_id;
  const data   = (cbq.data ?? "").trim();

  if (!chatId) {
    console.warn("[cb] no chatId in callback_query");
    return;
  }

  // Split on first pipe only
  const pipeIdx = data.indexOf("|");
  if (pipeIdx === -1) {
    console.warn("[cb] bad callback_data (no pipe):", data);
    return;
  }
  const action  = data.slice(0, pipeIdx).toUpperCase();
  const payload = data.slice(pipeIdx + 1);

  console.log(`[cb] action=${action} payload=${payload} msgId=${msgId}`);

  try {
    switch (action) {
      case "APP":      return await onApp(chatId, payload, msgId);
      case "VERSIONS": return await onVersions(chatId, payload, msgId);
      case "REVIEWS":  return await onReviews(chatId, payload, msgId);
      case "RECOMMEND":return await onRecommend(chatId, payload, msgId);
      case "TRENDING": return await onTrending(chatId, msgId);
      case "CAT":      return await onSearch(chatId, payload, 0, msgId);

      case "SEARCH": {
        // payload = "query text|offset"  (lastIndexOf to handle query containing |)
        const lastPipe = payload.lastIndexOf("|");
        if (lastPipe === -1) return await onSearch(chatId, payload, 0, msgId);
        const q      = payload.slice(0, lastPipe);
        const offset = parseInt(payload.slice(lastPipe + 1)) || 0;
        return await onSearch(chatId, q, offset, msgId);
      }

      default:
        console.warn("[cb] unknown action:", action);
        return await send(chatId, `❓ Unknown action: ${action}\nUse /help`);
    }
  } catch (err) {
    console.error("[cb] handler threw:", err);
    // Always give the user some feedback, never silently fail
    await send(chatId, "⚠️ Something went wrong. Please try again.");
  }
}

// ─── Message handler ──────────────────────────────────────────────

async function handleMessage(msg: TgMessage) {
  const chatId    = msg.chat.id;
  const text      = (msg.text ?? "").trim();
  const firstName = msg.from?.first_name ?? "there";

  if (!text) return;

  if (!text.startsWith("/")) {
    // Treat plain text as a search hint
    return send(chatId,
      `🔎 Search for that?\n\n<code>/search ${text}</code>\n\nOr /help for all commands.`
    );
  }

  // "/cmd@botname args" → cmd, arg
  const spaceIdx = text.indexOf(" ");
  const rawCmd   = (spaceIdx === -1 ? text : text.slice(0, spaceIdx))
    .replace(/^\//, "").toLowerCase().split("@")[0];
  const arg      = spaceIdx === -1 ? "" : text.slice(spaceIdx + 1).trim();

  switch (rawCmd) {
    case "start":                            return onStart(chatId, firstName);
    case "help":                             return onHelp(chatId);
    case "search":     case "s":             return onSearch(chatId, arg);
    case "app":        case "info":          return onApp(chatId, arg);
    case "versions":   case "ver":           return onVersions(chatId, arg);
    case "trending":   case "trend":         return onTrending(chatId);
    case "reviews":    case "review":        return onReviews(chatId, arg);
    case "recommend":  case "rec":
    case "similar":                          return onRecommend(chatId, arg);
    case "categories": case "cats":
    case "cat":                              return onCategories(chatId);
    default:
      return send(chatId,
        `❓ Unknown command <b>/${rawCmd}</b>. Use /help to see all commands.`
      );
  }
}

// ─── Entry point ──────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ status: "ok", bot: "BabaStore Bot", version: "3.0" }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (SECRET_TOK) {
    const h = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (h !== SECRET_TOK) return new Response("Unauthorized", { status: 401 });
  }

  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN not set");
    return new Response("Bot token missing", { status: 500 });
  }

  let update: TgUpdate;
  try {
    update = await req.json() as TgUpdate;
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  try {
    if      (update.callback_query) await handleCallback(update.callback_query);
    else if (update.inline_query)   await handleInlineQuery(update.inline_query);
    else if (update.message)        await handleMessage(update.message);
    else if (update.guest_message)  await handleMessage(update.guest_message);
  } catch (err) {
    // Never let an uncaught error stop us returning 200 — Telegram would retry forever
    console.error("[main] unhandled error:", err);
  }

  registerCommands();   // fire-and-forget, safe on every request

  return new Response("OK", { status: 200 });
});