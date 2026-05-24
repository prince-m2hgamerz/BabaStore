"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";

export function TelegramSetupButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function handleSetup() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/telegram/setup", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ ok: false, errors: ["Network error"] });
    }
    setLoading(false);
  }

  return (
    <div className="grid gap-3">
      <Button onClick={handleSetup} disabled={loading} size="lg">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Webhook className="size-4" />}
        {loading ? "Configuring..." : "Setup Webhook & Commands"}
      </Button>

      {result ? (
        <div
          className={cn(
            "rounded-lg border px-3 py-2.5 text-sm",
            result.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          )}
        >
          <div className="flex items-center gap-2 font-medium">
            {result.ok ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
            {result.ok ? "Setup complete" : "Setup had errors"}
          </div>
          {result.errors ? (
            <ul className="mt-1 list-inside list-disc text-xs">
              {(result.errors as string[]).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : null}
          {result.results ? (
            <div className="mt-2 text-xs text-neutral-500">
              {(result.results as Record<string, { ok?: boolean }>).webhook?.ok !== false ? "✅ Webhook" : "❌ Webhook"}
              {" · "}
              {(result.results as Record<string, { ok?: boolean }>).commands?.ok !== false ? "✅ Commands" : "❌ Commands"}
              {" · "}
              {(result.results as Record<string, { status?: string }>).edgeFunction?.status === "active"
                ? "✅ 24/7 Worker"
                : "ℹ️ Edge Function: " + ((result.results as Record<string, { status?: string }>).edgeFunction?.status ?? "unknown")}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
