"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Loader2, Mail, Lock } from "lucide-react";
import { loginAction, type AuthActionState } from "@/app/actions/auth";
import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {
  ok: false,
  message: ""
};

export function LoginForm({ nextPath = "" }: { nextPath?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <AuthMessage state={state} />
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      <div className="grid gap-1.5">
        <Label htmlFor="email" className="text-[13px] font-medium text-neutral-700">
          Email
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 rounded-md pl-9"
            required
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-[13px] font-medium text-neutral-700">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-[12px] font-medium text-neutral-600 hover:text-neutral-950"
          >
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            className="h-11 rounded-md pl-9"
            minLength={8}
            required
          />
        </div>
      </div>
      <Button type="submit" size="lg" className="mt-1 w-full rounded-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        Sign in
      </Button>
    </form>
  );
}
