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
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
        state.ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{state.message}</span>
    </div>
  );
}
