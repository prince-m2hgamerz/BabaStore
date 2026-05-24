import type { Metadata } from "next";
import {
  Bot,
  BrainCircuit,
  Cloud,
  MessageSquare,
  Send,
  Settings2,
  Smartphone,
  Trash2,
  Webhook
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/guards";
import { getBotMe, getWebhookInfo } from "@/lib/notifications/telegram";
import { getTelegramAutomations, getTelegramChatLogs } from "@/lib/admin/admin";
import { getAccountStatus } from "@/lib/telegram/user-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TelegramBroadcastForm } from "./telegram-broadcast-form";
import { AutomationRuleForm } from "./automation-rule-form";
import { PersonalAccountForm } from "./personal-account-form";
import { deleteTelegramAutomationAction } from "@/app/admin/actions";
import { IntervalWorkerStatus } from "./interval-worker-status";
import { TelegramSetupButton } from "./telegram-setup-button";

export const metadata: Metadata = {
  title: "Telegram Bot"
};

export default async function TelegramBotPage() {
  await requireRole(["admin"]);
  const [bot, webhook, rules, logs, accountStatus] = await Promise.all([
    getBotMe(),
    getWebhookInfo(),
    getTelegramAutomations(),
    getTelegramChatLogs(20),
    getAccountStatus()
  ]);

  const hasToken = Boolean(process.env.VITE_TELEGRAM_BOT_TOKEN);
  const hasNvidia = Boolean(process.env.NVIDIA_API_KEY);
  const hasApiCreds = Boolean(process.env.TELEGRAM_API_ID && process.env.TELEGRAM_API_HASH);
  const hasEdgeFunction = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <DashboardShell
      section="admin"
      title="Telegram Bot"
      description="Auto-reply to Telegram messages as your personal account using NVIDIA AI. Manage rules, send broadcasts, and monitor activity."
    >
      <div className="grid gap-4 sm:gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Card className="min-w-0 overflow-hidden transition-shadow hover:shadow-md">
            <div className="h-1 w-full bg-gradient-to-r from-sky-500 to-sky-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="min-w-0 truncate text-sm font-medium text-neutral-500">Bot (API Token)</CardTitle>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                <Bot className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              {hasToken && bot.ok ? (
                <div>
                  <div className="break-words text-lg font-bold tracking-tight text-neutral-950">
                    @{bot.bot?.username ?? "Connected"}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-neutral-400">
                    {bot.bot?.first_name} &middot; ID: {bot.bot?.id}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-lg font-bold tracking-tight text-red-600">Disconnected</div>
                  <p className="mt-1 text-xs leading-5 text-neutral-400">
                    {hasToken ? "Invalid token or API error" : "No bot token configured"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0 overflow-hidden transition-shadow hover:shadow-md">
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-violet-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="min-w-0 truncate text-sm font-medium text-neutral-500">Webhook</CardTitle>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <Webhook className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              {webhook.ok && webhook.webhook ? (
                <div>
                  <div className="truncate text-sm font-medium text-neutral-950">
                    {webhook.webhook.url || "No webhook set"}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-neutral-400">
                    {webhook.webhook.pending_update_count} pending updates
                  </p>
                  {webhook.webhook.last_error_message ? (
                    <p className="mt-1 text-xs text-red-500">
                      Last error: {webhook.webhook.last_error_message}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div>
                  <div className="text-sm font-medium text-neutral-500">No webhook</div>
                  <p className="mt-1 text-xs text-neutral-400">Bot uses long polling (getUpdates)</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0 overflow-hidden transition-shadow hover:shadow-md">
            <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-amber-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="min-w-0 truncate text-sm font-medium text-neutral-500">AI Engine</CardTitle>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <BrainCircuit className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              {hasNvidia ? (
                <div>
                  <div className="text-lg font-bold tracking-tight text-emerald-600">Online</div>
                  <p className="mt-1 text-xs leading-5 text-neutral-400">
                    NVIDIA Llama 3.1 8B &middot; {rules.filter((r) => r.is_active).length} active rules
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-lg font-bold tracking-tight text-red-600">Offline</div>
                  <p className="mt-1 text-xs leading-5 text-neutral-400">No NVIDIA_API_KEY configured</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0 overflow-hidden transition-shadow hover:shadow-md">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="min-w-0 truncate text-sm font-medium text-neutral-500">Auto-Reply Rules</CardTitle>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Settings2 className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold tracking-tight text-neutral-950">{rules.length}</div>
              <p className="mt-1 text-xs leading-5 text-neutral-400">
                {rules.filter((r) => r.is_active).length} active
                {rules.length ? ` \u00b7 ${rules.filter((r) => r.trigger_type === "keyword").length} keyword, ${rules.filter((r) => r.trigger_type === "all").length} catch-all` : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0 overflow-hidden transition-shadow hover:shadow-md">
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-indigo-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="min-w-0 truncate text-sm font-medium text-neutral-500">24/7 Auto-Reply</CardTitle>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <Cloud className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <IntervalWorkerStatus
                connected={accountStatus.connected}
                autoReplyEnabled={accountStatus.autoReplyEnabled}
                hasEdgeFunction={hasEdgeFunction}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="size-4" />
              Personal Account (MTProto)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasApiCreds ? (
              <PersonalAccountForm initial={accountStatus} />
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <p className="font-medium">API credentials not configured</p>
                <p className="mt-1 text-xs text-amber-700">
                  Add TELEGRAM_API_ID and TELEGRAM_API_HASH to your .env file. Get yours at https://my.telegram.org
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings2 className="size-4" />
              Auto-Reply Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {rules.length === 0 ? (
              <p className="text-sm text-neutral-400">
                No rules yet. Create one below to start auto-replying with AI.
              </p>
            ) : (
              <div className="grid gap-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 shrink-0 rounded-full ${rule.is_active ? "bg-emerald-500" : "bg-neutral-300"}`} />
                        <span className="truncate text-sm font-medium text-neutral-950">{rule.name}</span>
                        <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-500">
                          {rule.trigger_type === "all" ? "Catch-all" : rule.trigger_type === "keyword" ? `Keyword: ${rule.trigger_pattern}` : `Regex: ${rule.trigger_pattern}`}
                        </span>
                        <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-500 capitalize">
                          {rule.reply_style}
                        </span>
                      </div>
                      {rule.allowed_chat_ids.length > 0 ? (
                        <p className="mt-1 truncate text-xs text-neutral-400">
                          Chats: {rule.allowed_chat_ids.join(", ")}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-neutral-400">All chats allowed</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <form action={`/admin/telegram`} method="GET">
                        <input type="hidden" name="edit" value={rule.id} />
                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                          Edit
                        </Button>
                      </form>
                      <form action={deleteTelegramAutomationAction}>
                        <input type="hidden" name="automationId" value={rule.id} />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <details className="mt-2 rounded-lg border border-neutral-200">
              <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                <Bot className="size-4" />
                {rules.length > 0 ? "Add Another Rule" : "Create Your First Rule"}
              </summary>
              <div className="border-t border-neutral-200 p-4">
                <AutomationRuleForm />
              </div>
            </details>
          </CardContent>
        </Card>

        {logs.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="size-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-1 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                          log.direction === "incoming"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {log.direction === "incoming" ? "IN" : "OUT"}
                      </span>
                      <span className="truncate text-xs text-neutral-400">Chat: {log.chat_id}</span>
                      <span className="ml-auto shrink-0 text-[10px] text-neutral-400">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs text-neutral-700">{log.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Webhook className="size-4" />
              Setup Bot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-neutral-500">
              Auto-configure the webhook URL and register bot commands with Telegram.
            </p>
            <TelegramSetupButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="size-4" />
              Send Message (Bot API)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TelegramBroadcastForm />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
