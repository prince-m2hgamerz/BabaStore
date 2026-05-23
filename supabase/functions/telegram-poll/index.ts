import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const start = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: account } = await supabase
      .from("telegram_account")
      .select("auto_reply_enabled, is_connected, session_string")
      .limit(1)
      .single();

    if (!account?.auto_reply_enabled || !account?.session_string) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "not_connected_or_disabled" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const baseUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") || "https://baba-store.vercel.app";
    const res = await fetch(`${baseUrl}/api/telegram/user/check-messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const result = await res.json();

    const elapsed = Date.now() - start;
    console.log(`Telegram poll [${elapsed}ms]: checked ${result.checked}, replied ${result.replied}`);

    if (result.error) {
      console.error("Telegram poll error:", result.error);
    }

    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Telegram poll function error:", String(err));
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
