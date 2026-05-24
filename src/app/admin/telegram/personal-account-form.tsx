"use client";

import { useState, useRef } from "react";
import {
  CheckCircle2,
  Loader2,
  LogOut,
  Phone,
  KeyRound,
  Shield,
  XCircle,
  User,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Status {
  connected: boolean;
  phone?: string;
  autoReplyEnabled: boolean;
  pendingAuth: boolean;
}

export function PersonalAccountForm({ initial }: { initial: Status }) {
  const phoneRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>(initial);
  const [step, setStep] = useState<"idle" | "sent" | "password">(
    initial.pendingAuth ? "sent" : "idle"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    const phone = phoneRef.current?.value ?? "";
    if (!phone) {
      setError("Phone number is required.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/telegram/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error);
      } else {
        setStep("sent");
        setMessage("Code sent! Check your Telegram app for the login code.");
      }
    } catch {
      setError("Failed to send code.");
    }
    setLoading(false);
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    const code = codeRef.current?.value ?? "";
    const password = passwordRef.current?.value ?? "";

    if (!code) {
      setError("Verification code is required.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/telegram/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password: password || undefined })
      });
      const data = await res.json();
      if (!data.ok) {
        if (data.requirePassword) {
          setStep("password");
          setError("Two-factor authentication enabled. Enter your password.");
        } else {
          setError(data.error);
        }
      } else {
        setStatus({ ...status, connected: true, pendingAuth: false });
        setStep("idle");
        setMessage("Connected! Your Telegram account is now active.");
      }
    } catch {
      setError("Failed to verify code.");
    }
    setLoading(false);
  }

  async function disconnect() {
    setLoading(true);
    try {
      await fetch("/api/telegram/user/status", { method: "DELETE" });
      setStatus({ connected: false, autoReplyEnabled: true, pendingAuth: false });
      setStep("idle");
      setMessage("Account disconnected.");
    } catch {
      setError("Failed to disconnect.");
    }
    setLoading(false);
  }

  async function checkMessages() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/telegram/user/check-messages", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      const parts = [`Checked ${data.checked} dialogs`, `replied ${data.replied}`];
      if (data.elapsed) parts.push(`in ${data.elapsed}ms`);
      if (data.skipped) {
        const skippedEntries = Object.entries(data.skipped).filter(([, v]) => (v as number) > 0);
        if (skippedEntries.length) {
          parts.push(`skipped: ${skippedEntries.map(([k, v]) => `${k}=${v}`).join(", ")}`);
        }
      }
      setMessage(parts.join(", "));
    } catch {
      setError("Failed to check messages.");
    }
    setLoading(false);
  }

  return (
    <div className="grid gap-4">
      {message ? (
        <div className={cn(
          "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
          error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
        )}>
          {message.includes("Connected") || message.includes("replied") ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <p>{message}</p>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
          <XCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {status.connected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <User className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-800">Connected as {status.phone}</p>
              <p className="text-xs text-emerald-600">Telegram personal account active</p>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={disconnect} disabled={loading}>
              {loading ? <Loader2 className="size-3 animate-spin" /> : <LogOut className="size-3" />}
              Disconnect
            </Button>
          </div>

          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={checkMessages} disabled={loading}>
            {loading ? <Loader2 className="size-3 animate-spin" /> : <Play className="size-3" />}
            Check Messages Now
          </Button>
        </div>
      ) : step === "sent" || step === "password" ? (
        <form onSubmit={verifyCode} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="code">Verification Code</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <Input
                ref={codeRef}
                id="code"
                name="code"
                className="pl-10"
                placeholder="e.g. 12345"
                required
                autoFocus
              />
            </div>
          </div>

          {step === "password" ? (
            <div className="grid gap-1.5">
              <Label htmlFor="password">2FA Password</Label>
              <div className="relative">
                <Shield className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type="password"
                  className="pl-10"
                  placeholder="Your Telegram cloud password"
                />
              </div>
            </div>
          ) : null}

          <Button type="submit" size="lg" disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <KeyRound className="size-4" />
            )}
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={sendCode} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <Input
                ref={phoneRef}
                id="phone"
                name="phone"
                className="pl-10"
                placeholder="+1234567890"
                defaultValue={initial.phone ?? ""}
                required
              />
            </div>
            <p className="text-xs text-neutral-400">
              Your phone number with country code (e.g. +1234567890)
            </p>
          </div>

          <Button type="submit" size="lg" disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Phone className="size-4" />
            )}
            {loading ? "Sending..." : "Send Code"}
          </Button>
        </form>
      )}
    </div>
  );
}
