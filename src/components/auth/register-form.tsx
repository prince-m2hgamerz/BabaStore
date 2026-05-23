"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Loader2, Mail, Lock, User, Code2, UserCircle } from "lucide-react";
import { registerAction, type AuthActionState } from "@/app/actions/auth";
import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const roles = [
  {
    value: "user",
    label: "User",
    description: "Browse, install, and review apps",
    icon: UserCircle
  },
  {
    value: "developer",
    label: "Developer",
    description: "Publish and manage your own apps",
    icon: Code2
  }
] as const;

const initialState: AuthActionState = {
  ok: false,
  message: ""
};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="grid gap-5">
      <AuthMessage state={state} />

      <div className="grid gap-1.5">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            id="username"
            name="username"
            autoComplete="username"
            placeholder="Choose a username"
            className="pl-9"
            minLength={3}
            maxLength={32}
            required
          />
        </div>
      </div>

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

      <div className="grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="pl-9"
            minLength={8}
            required
          />
        </div>
        <p className="text-xs text-neutral-400">Minimum 8 characters</p>
      </div>

      <div className="grid gap-1.5">
        <Label>Account type</Label>
        <div className="grid grid-cols-2 gap-2">
          {roles.map((r) => (
            <label
              key={r.value}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition hover:border-neutral-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50"
              )}
            >
              <input
                type="radio"
                name="role"
                value={r.value}
                defaultChecked={r.value === "user"}
                className="sr-only"
              />
              <r.icon className="size-5 text-neutral-500 has-[:checked]:text-blue-600" />
              <span className="text-sm font-medium text-neutral-900">{r.label}</span>
              <span className="text-[11px] leading-tight text-neutral-500">{r.description}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        Create account
      </Button>

      <p className="text-center text-xs text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </p>
    </form>
  );
}
