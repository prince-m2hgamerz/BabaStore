"use client";

import { useActionState } from "react";
import {
  CheckCircle2,
  Loader2,
  Save,
  XCircle
} from "lucide-react";
import { saveTelegramAutomationAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { TelegramAutomation } from "@/lib/admin/admin";

interface Props {
  rule?: TelegramAutomation | null;
}

export function AutomationRuleForm({ rule }: Props) {
  const [state, formAction, pending] = useActionState(
    saveTelegramAutomationAction,
    { ok: false, message: "" }
  );

  return (
    <form action={formAction} className="grid gap-5">
      {state.message ? (
        <div
          className={cn(
            "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          )}
        >
          {state.ok ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <p>{state.message}</p>
        </div>
      ) : null}

      {rule?.id ? (
        <input type="hidden" name="id" value={rule.id} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="name">Rule Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={rule?.name ?? ""}
            placeholder="e.g. General Auto-Reply"
            required
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={rule?.is_active ?? true}
            className="size-4 rounded border-neutral-300"
          />
          <Label htmlFor="isActive" className="text-sm font-normal">
            Rule active
          </Label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="triggerType">Trigger Type</Label>
          <select
            id="triggerType"
            name="triggerType"
            defaultValue={rule?.trigger_type ?? "all"}
            className="flex h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="all">All messages</option>
            <option value="keyword">Keyword match</option>
            <option value="regex">Regex match</option>
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="triggerPattern">
            Pattern <span className="text-neutral-400">(optional if &quot;all&quot;)</span>
          </Label>
          <Input
            id="triggerPattern"
            name="triggerPattern"
            defaultValue={rule?.trigger_pattern ?? ""}
            placeholder="e.g. hello, help, order"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="replyStyle">Reply Style</Label>
          <select
            id="replyStyle"
            name="replyStyle"
            defaultValue={rule?.reply_style ?? "friendly"}
            className="flex h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="concise">Concise</option>
            <option value="detailed">Detailed</option>
            <option value="friendly">Friendly</option>
            <option value="professional">Professional</option>
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="maxTokens">Max Tokens</Label>
          <Input
            id="maxTokens"
            name="maxTokens"
            type="number"
            min={20}
            max={200}
            defaultValue={rule?.max_tokens ?? 80}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="temperature">Temperature</Label>
          <Input
            id="temperature"
            name="temperature"
            type="number"
            step="0.1"
            min="0"
            max="1"
            defaultValue={rule?.temperature ?? 0.5}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="allowedChatIds">
          Allowed Chat IDs <span className="text-neutral-400">(leave empty for all chats)</span>
        </Label>
        <Textarea
          id="allowedChatIds"
          name="allowedChatIds"
          rows={3}
          defaultValue={(rule?.allowed_chat_ids ?? []).join("\n")}
          placeholder="5798029484&#10;-1001234567890"
          className="min-h-20"
        />
        <p className="text-xs text-neutral-400">
          One chat ID per line. Leave empty to allow all chats.
        </p>
      </div>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        {pending ? "Saving..." : rule?.id ? "Update Rule" : "Create Rule"}
      </Button>
    </form>
  );
}
