#!/usr/bin/env node

// Standalone Telegram auto-reply worker.
// Polls the Next.js check-messages API every 15 seconds.
// Run alongside `next dev` or `next start`:
//   node scripts/telegram-worker.mjs
//
// For Vercel production, set up a Cron Job (Pro plan)
// hitting GET https://yoursite.com/api/telegram/user/check-messages
// every minute.

const BASE = process.env.BASE_URL || "http://localhost:3000";

async function poll() {
  try {
    const res = await fetch(`${BASE}/api/telegram/user/check-messages`, {
      method: "POST"
    });
    const data = await res.json();
    const ts = new Date().toISOString().slice(11, 19);
    if (data.error) {
      console.log(`[${ts}] Poll error: ${data.error}`);
    } else {
      console.log(`[${ts}] Checked ${data.checked}, replied ${data.replied}${data.skipped?.noDedup ? ` (${data.skipped.noDedup} deduped)` : ""}`);
    }
  } catch (err) {
    const ts = new Date().toISOString().slice(11, 19);
    console.error(`[${ts}] Fetch failed:`, err.message);
  }
}

console.log("Telegram auto-reply worker started. Polling every 15s...");
poll();
setInterval(poll, 15000);
