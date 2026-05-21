"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { AuthActionState } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

export function AuthMessage({ state }: { state: AuthActionState }) {
  if (!state.message) {
    return null;
  }

  const Icon = state.ok ? CheckCircle2 : XCircle;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        state.ok
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
          : "border-destructive/30 bg-destructive/10 text-red-100"
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{state.message}</span>
    </div>
  );
}

