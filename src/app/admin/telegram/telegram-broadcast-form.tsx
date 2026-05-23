"use client";

import { useActionState } from "react";
import { Loader2, Send, CheckCircle2, XCircle } from "lucide-react";
import { sendTelegramBroadcastAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function TelegramBroadcastForm() {
  const [state, formAction, pending] = useActionState(sendTelegramBroadcastAction, {
    ok: false,
    message: ""
  });

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="chatId">Chat ID</Label>
          <Input
            id="chatId"
            name="chatId"
            type="text"
            placeholder="e.g. 5798029484"
            required
          />
          <p className="text-xs text-neutral-400">
            Numeric chat ID. Use @userinfobot to find yours.
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="parseMode">Formatting</Label>
          <div className="flex h-10 items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500">
            MarkdownV2 supported
          </div>
          <p className="text-xs text-neutral-400">
            Use *bold*, _italic_, `code`, [text](url)
          </p>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="text">Message</Label>
        <Textarea
          id="text"
          name="text"
          rows={6}
          className="min-h-32"
          placeholder="Write your message here. Markdown formatting supported."
          required
        />
      </div>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        {pending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
