import { TelegramClient } from "telegram";
import { Api } from "telegram";
import { StringSession } from "telegram/sessions";
import { createAdminClient } from "@/lib/supabase/admin";

function getApiCredentials() {
  const apiId = parseInt(process.env.TELEGRAM_API_ID ?? "0", 10);
  const apiHash = process.env.TELEGRAM_API_HASH ?? "";
  if (!apiId || !apiHash) return null;
  return { apiId, apiHash };
}

// ── DB helpers ──────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db() { return createAdminClient().from("telegram_account") as any; }

async function getFirstRow() {
  const { data } = await db().select("*").limit(1);
  return data?.[0] ?? null;
}

async function upsert(patch: Record<string, unknown>) {
  const row = await getFirstRow();
  if (row) {
    await db().update({ ...patch, updated_at: new Date().toISOString() }).eq("id", row.id);
  } else {
    await db().insert(patch);
  }
}

function saveSession(client: TelegramClient): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (client.session as any).save();
}

// ── Public API ──────────────────────────────────────────

export async function sendAuthCode(phone: string): Promise<{ ok: boolean; error?: string }> {
  const creds = getApiCredentials();
  if (!creds) return { ok: false, error: "TELEGRAM_API_ID or TELEGRAM_API_HASH not set" };

  try {
    const stringSession = new StringSession();
    const client = new TelegramClient(stringSession, creds.apiId, creds.apiHash, {
      connectionRetries: 3,
      useWSS: true
    });
    await client.connect();

    const sendResult = await client.invoke(
      new Api.auth.SendCode({
        phoneNumber: phone,
        apiId: creds.apiId,
        apiHash: creds.apiHash,
        settings: new Api.CodeSettings({})
      })
    );

    const sessionString = saveSession(client);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const phoneCodeHash = (sendResult as any).phoneCodeHash as string;
    await client.disconnect();

    await upsert({
      phone,
      temp_session: sessionString,
      phone_code_hash: phoneCodeHash,
      is_connected: false
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function verifyAuthCode(
  code: string,
  password?: string
): Promise<{ ok: boolean; error?: string; session?: string }> {
  const creds = getApiCredentials();
  if (!creds) return { ok: false, error: "API credentials not configured" };

  const row = await getFirstRow();
  if (!row?.temp_session) return { ok: false, error: "No pending auth. Send code first." };
  if (!row?.phone) return { ok: false, error: "No phone number on record." };

  try {
    const stringSession = new StringSession(row.temp_session);
    const client = new TelegramClient(stringSession, creds.apiId, creds.apiHash, {
      connectionRetries: 3,
      useWSS: true
    });
    await client.connect();

    try {
      await client.invoke(
        new Api.auth.SignIn({
          phoneNumber: row.phone,
          phoneCodeHash: row.phone_code_hash ?? "",
          phoneCode: code
        })
      );
    } catch (signInErr: unknown) {
      const signInMsg = String(signInErr);
      // If 2FA is enabled, auth.SignIn returns error "SESSION_PASSWORD_NEEDED"
      if (signInMsg.includes("SESSION_PASSWORD_NEEDED") || signInMsg.toLowerCase().includes("password")) {
        if (!password) {
          await client.disconnect();
          return { ok: false, error: "2FA_PASSWORD_REQUIRED" };
        }
        const { computeCheck } = await import("telegram/Password");
        const passwordSrpResult = await client.invoke(new Api.account.GetPassword());
        const check = await computeCheck(passwordSrpResult, password);
        await client.invoke(
          new Api.auth.CheckPassword({ password: check })
        );
      } else {
        await client.disconnect();
        if (signInMsg.toLowerCase().includes("code") && signInMsg.toLowerCase().includes("invalid")) {
          return { ok: false, error: "Invalid code." };
        }
        return { ok: false, error: signInMsg };
      }
    }

    const finalSession = saveSession(client);
    await client.disconnect();

    await upsert({
      session_string: finalSession,
      temp_session: null,
      phone_code_hash: null,
      is_connected: true,
      phone: row.phone
    });

    return { ok: true, session: finalSession };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function getAccountStatus(): Promise<{
  connected: boolean;
  phone?: string;
  autoReplyEnabled: boolean;
  pendingAuth: boolean;
}> {
  try {
    const row = await getFirstRow();
    if (!row) return { connected: false, autoReplyEnabled: true, pendingAuth: false };

    let sessionValid = false;
    if (row.session_string) {
      try {
        const creds = getApiCredentials();
        if (creds) {
          const client = new TelegramClient(new StringSession(row.session_string), creds.apiId, creds.apiHash, {
            connectionRetries: 2,
            useWSS: true
          });
          await client.connect();
          await client.disconnect();
          sessionValid = true;
        }
      } catch {
        sessionValid = false;
      }
    }

    return {
      connected: sessionValid,
      phone: row.phone ?? undefined,
      autoReplyEnabled: row.auto_reply_enabled ?? true,
      pendingAuth: Boolean(row.temp_session && !row.session_string)
    };
  } catch {
    return { connected: false, autoReplyEnabled: true, pendingAuth: false };
  }
}

export async function sendMessageAsUser(
  chatPeer: string,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  const creds = getApiCredentials();
  if (!creds) return { ok: false, error: "API credentials not configured" };

  const row = await getFirstRow();
  if (!row?.session_string) return { ok: false, error: "Not authenticated." };

  try {
    const client = new TelegramClient(new StringSession(row.session_string), creds.apiId, creds.apiHash, {
      connectionRetries: 3,
      useWSS: true
    });
    await client.connect();

    let peer: string | number = chatPeer;
    if (/^\d+$/.test(chatPeer)) peer = parseInt(chatPeer, 10);

    await client.sendMessage(peer, { message });
    await client.disconnect();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function checkNewMessagesAndReply(): Promise<{
  checked: number;
  replied: number;
  error?: string;
  skipped?: Record<string, number | string>;
}> {
  const creds = getApiCredentials();
  if (!creds) return { checked: 0, replied: 0, error: "API credentials not configured" };

  const row = await getFirstRow();
  if (!row?.session_string) return { checked: 0, replied: 0, error: "Not authenticated." };
  if (!row.auto_reply_enabled) return { checked: 0, replied: 0, error: "Auto-reply disabled." };

  // Load active automation rules
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rulesTb = createAdminClient().from("telegram_automations") as any;
  const { data: rules } = await rulesTb.select("*").eq("is_active", true);
  if (!rules?.length) return { checked: 0, replied: 0, error: "No active rules." };

  try {
    const client = new TelegramClient(new StringSession(row.session_string), creds.apiId, creds.apiHash, {
      connectionRetries: 3,
      useWSS: true
    });
    await client.connect();

    // Get recent dialogs (conversations)
    const dialogs = await client.getDialogs({ limit: 20 });
    let replied = 0;
    const skipped = { notUser: 0, noId: 0, noRule: 0, noIncoming: 0, noDedup: 0, noMatch: 0, noAi: 0, aiError: "" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logTb = createAdminClient().from("telegram_chat_logs") as any;

    for (const dialog of dialogs) {
      try {
        // GramJS v2 Dialog has .isUser boolean from constructor
        if (!dialog.isUser) { skipped.notUser++; continue; }
        if (!dialog.id) { skipped.noId++; continue; }

        const chatId = String(dialog.id);
        const chatPeer = dialog.id;

        // Check if this chat is allowed by any rule
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allowedRules = rules.filter((r: any) =>
          !r.allowed_chat_ids?.length || r.allowed_chat_ids.includes(chatId)
        );
        if (!allowedRules.length) { skipped.noRule++; continue; }

        // Fetch recent messages for context + dedup
        const recentMsgs = await client.getMessages(chatPeer, { limit: 15 });
        if (!recentMsgs?.length) { skipped.noIncoming++; continue; }

        // Build conversation history (oldest to newest)
        const history: Array<{ text: string; isOutgoing: boolean }> = [];
        let lastIncoming: { id: number; text: string } | null = null;

        for (const msg of recentMsgs.toReversed()) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const m = msg as any;
          if (m.message) {
            history.push({ text: m.message, isOutgoing: !!m.out });
            if (!m.out) {
              lastIncoming = { id: m.id, text: m.message };
            }
          }
        }

        if (!lastIncoming?.text) { skipped.noIncoming++; continue; }

        // Dedup: check if we already replied to this message_id
        const { data: existing } = await logTb
          .select("id")
          .eq("chat_id", chatId)
          .eq("message_id", lastIncoming.id)
          .eq("direction", "incoming")
          .limit(1);
        if (existing?.length) { skipped.noDedup++; continue; }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const senderName = (dialog.entity as any)?.firstName ?? (dialog.entity as any)?.title ?? "User";

        // Find matching rule
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matched = allowedRules.find((r: any) => {
          if (r.trigger_type === "all") return true;
          if (!r.trigger_pattern) return false;
          if (r.trigger_type === "keyword") return lastIncoming!.text.toLowerCase().includes(r.trigger_pattern.toLowerCase());
          if (r.trigger_type === "regex") {
            try { return new RegExp(r.trigger_pattern, "i").test(lastIncoming!.text); } catch { return false; }
          }
          return false;
        });

        if (!matched) { skipped.noMatch++; continue; }

        // Generate AI reply with conversation context
        const { generateTelegramReply } = await import("@/lib/ai/nvidia");
        const aiReply = await generateTelegramReply({
          message: lastIncoming.text,
          senderName,
          replyStyle: matched.reply_style,
          maxTokens: matched.max_tokens,
          temperature: matched.temperature,
          conversationHistory: history
        });

        if (!aiReply) { skipped.noAi++; continue; }

        await client.sendMessage(chatPeer, { message: aiReply });
        replied++;

        // Log both sides
        await logTb.insert({
          chat_id: chatId,
          message_id: lastIncoming.id,
          direction: "incoming",
          text: lastIncoming.text,
          reply: aiReply,
          automation_id: matched.id
        });
        await logTb.insert({
          chat_id: chatId,
          message_id: null,
          direction: "outgoing",
          text: aiReply,
          automation_id: matched.id
        });
      } catch (dialogErr) {
        console.error("Skipped dialog due to error:", dialogErr);
      }
    }

    // Disconnect silently — catch any timeout errors from cleanup
    try {
      await client.disconnect();
    } catch {
      // GramJS background tasks may reject after disconnect
    }

    return { checked: dialogs.length, replied, skipped };
  } catch (err) {
    console.error("checkNewMessagesAndReply error:", err);
    return { checked: 0, replied: 0, error: String(err) };
  }
}

export async function disconnectAccount(): Promise<void> {
  await upsert({ session_string: null, temp_session: null, is_connected: false, phone: "" });
}
