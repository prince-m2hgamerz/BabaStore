import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const start = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if account is connected and auto-reply is enabled
    const { data: account, error: accountError } = await supabase
      .from("telegram_account")
      .select("auto_reply_enabled, is_connected, session_string")
      .maybeSingle();

    if (accountError) {
      console.error("DB error reading telegram_account:", accountError.message);
      return new Response(
        JSON.stringify({ error: `DB error: ${accountError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!account) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "no_account_row" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (!account.is_connected || !account.session_string) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "not_connected" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (!account.auto_reply_enabled) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "auto_reply_disabled" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Call the Next.js API on Vercel
    const baseUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") || "https://baba-store.vercel.app";
    const apiUrl = `${baseUrl.replace(/\/+$/, "")}/api/telegram/user/check-messages`;

    console.log(`Calling: ${apiUrl}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000); // 55s timeout

    let res: Response;
    try {
      res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    const elapsed = Date.now() - start;
    let result: Record<string, unknown>;
    try {
      result = await res.json();
    } catch {
      result = { rawStatus: res.status, rawText: await res.text().catch(() => "") };
    }

    console.log(`Telegram poll [${elapsed}ms]:`, JSON.stringify(result));

    if (result.error) {
      console.error("Telegram poll API error:", result.error);
    }

    // Log this poll attempt to telegram_chat_logs for diagnostics
    const { error: logError } = await supabase
      .from("telegram_chat_logs")
      .insert({
        chat_id: "system",
        direction: "incoming",
        text: `[EdgeFunction] poll at ${new Date().toISOString()}`,
        reply: JSON.stringify({ checked: result.checked, replied: result.replied, error: result.error })
      });

    if (logError) {
      console.error("Failed to log poll result:", logError.message);
    }

    return new Response(JSON.stringify({ ok: true, elapsed, ...result }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    const elapsed = Date.now() - start;
    console.error(`Telegram poll function error [${elapsed}ms]:`, String(err));
    return new Response(
      JSON.stringify({ error: String(err), elapsed }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
