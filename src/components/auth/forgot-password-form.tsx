"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import {
  forgotPasswordAction,
  type AuthActionState
} from "@/app/actions/auth";
import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {
  ok: false,
  message: ""
};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialState
  );

  return (
    <form action={formAction} className="grid gap-5">
      <AuthMessage state={state} />
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="pl-9"
            required
          />
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
        Send reset link
      </Button>
      <Button variant="ghost" size="sm" asChild className="w-full">
        <Link href="/login">
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </Button>
    </form>
  );
}
