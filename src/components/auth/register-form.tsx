"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { registerAction, type AuthActionState } from "@/app/actions/auth";
import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const initialState: AuthActionState = {
  ok: false,
  message: ""
};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <AuthMessage state={state} />
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" autoComplete="username" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label>Account type</Label>
        <Select name="role" defaultValue="user">
          <SelectTrigger>
            <SelectValue placeholder="Choose role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="mt-2" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <ArrowRight />}
        Create account
      </Button>
      <p className="text-center text-xs text-white/45">
        Already registered?{" "}
        <Link href="/login" className="text-primary hover:text-primary/80">
          Sign in
        </Link>
      </p>
    </form>
  );
}

