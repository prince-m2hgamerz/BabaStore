"use client";

import { useActionState, useState } from "react";
import {
  Loader2,
  Send,
  CheckCircle2,
  XCircle,
  Users,
  UserCircle,
  ShieldCheck,
  AtSign
} from "lucide-react";
import { sendMarketingAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const audiences = [
  { value: "all", label: "All users", icon: Users, desc: "Everyone registered on BabaStore" },
  { value: "user", label: "Users", icon: UserCircle, desc: "Standard user accounts" },
  { value: "developer", label: "Developers", icon: UserCircle, desc: "Developer accounts" },
  { value: "admin", label: "Admins", icon: ShieldCheck, desc: "Platform admins" },
  { value: "custom", label: "Custom", icon: AtSign, desc: "Manual email list" }
] as const;

export function EmailComposeForm() {
  const [audience, setAudience] = useState("all");

  const [state, formAction, pending] = useActionState(sendMarketingAction, {
    ok: false,
    message: "",
    sent: 0,
    failed: 0
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
          {state.ok ? <CheckCircle2 className="size-4 mt-0.5 shrink-0" /> : <XCircle className="size-4 mt-0.5 shrink-0" />}
          <div>
            <p>{state.message}</p>
            {state.sent > 0 && (
              <p className="mt-1 text-xs opacity-75">
                {state.sent} delivered, {state.failed} failed
              </p>
            )}
          </div>
        </div>
      ) : null}

      <div className="grid gap-1.5">
        <Label>Audience</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {audiences.map((a) => (
            <label
              key={a.value}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 p-2.5 text-center transition",
                audience === a.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              <input
                type="radio"
                name="audience"
                value={a.value}
                checked={audience === a.value}
                onChange={() => setAudience(a.value)}
                className="sr-only"
              />
              <a.icon className={cn("size-4", audience === a.value ? "text-blue-600" : "text-neutral-400")} />
              <span className="text-xs font-medium text-neutral-900">{a.label}</span>
              <span className="text-[10px] leading-tight text-neutral-500">{a.desc}</span>
            </label>
          ))}
        </div>
      </div>

      {audience === "custom" ? (
        <div className="grid gap-1.5">
          <Label htmlFor="customEmails">Email addresses</Label>
          <textarea
            id="customEmails"
            name="customEmails"
            rows={3}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            placeholder="user1@example.com, user2@example.com"
          />
          <p className="text-xs text-neutral-400">Separate emails with commas, semicolons, or newlines</p>
        </div>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          type="text"
          placeholder="e.g. New features on BabaStore"
          required
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="body">Email body</Label>
        <textarea
          id="body"
          name="body"
          rows={8}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          placeholder="Write your email content here. Plain text only — it will be wrapped in the BabaStore branded template."
          required
        />
        <p className="text-xs text-neutral-400">
          Plain text content auto-formatted into the BabaStore branded email template.
        </p>
      </div>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        {pending ? "Sending..." : "Send campaign"}
      </Button>
    </form>
  );
}
