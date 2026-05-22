import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  Brush,
  CheckCircle2,
  KeyRound,
  Laptop,
  LockKeyhole,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/guards";
import { formatDate } from "@/lib/catalog/catalog";

export const metadata: Metadata = {
  title: "Settings"
};

export default async function SettingsPage() {
  const { missingEnv, profile, user } = await requireRole(["user", "developer", "admin"]);

  return (
    <DashboardShell
      section="user"
      title="Settings"
      description="Manage your account, security, and session preferences."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}

        <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <span className="text-neutral-500">Email</span>
                <span className="truncate font-medium text-neutral-950">{profile?.email ?? user?.email}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <span className="text-neutral-500">Username</span>
                <span className="font-medium text-neutral-950">{profile?.username ?? "Not set"}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <span className="text-neutral-500">Role</span>
                <span className="font-medium capitalize text-neutral-950">{profile?.role ?? "user"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button variant="secondary" asChild className="w-full">
                <Link href="/dashboard">
                  <ShieldCheck />
                  Protected access
                </Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" className="w-full">
                  <LogOut />
                  Sign out
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              icon: LockKeyhole,
              title: "Persistent session",
              description: "Your browser session is refreshed securely by middleware until you sign out.",
              status: user ? "Active" : "Signed out"
            },
            {
              icon: Bell,
              title: "Account notifications",
              description: "Release activity, wishlist changes, and security alerts use your account email.",
              status: profile?.email ? "Ready" : "Needs email"
            },
            {
              icon: Brush,
              title: "Interface theme",
              description: "The responsive dashboard follows the shared BabaStore design system across devices.",
              status: "Synced"
            }
          ].map((item) => (
            <Card key={item.title} className="glass-hover">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <item.icon className="size-5 text-neutral-950" />
                  <Badge variant="secondary">{item.status}</Badge>
                </div>
                <CardTitle className="pt-2 text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-neutral-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Security checklist</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              {
                icon: CheckCircle2,
                label: "Verified Supabase session",
                value: user ? "Current session detected" : "No active session"
              },
              {
                icon: KeyRound,
                label: "Password recovery",
                value: "Available from the sign-in page"
              },
              {
                icon: Laptop,
                label: "Current device",
                value: "This browser is authorized"
              },
              {
                icon: ShieldCheck,
                label: "Account created",
                value: user?.created_at ? formatDate(user.created_at) : "Unknown"
              }
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3"
              >
                <item.icon className="mt-0.5 size-4 shrink-0 text-neutral-950" />
                <div className="min-w-0">
                  <div className="font-medium text-neutral-950">{item.label}</div>
                  <div className="mt-1 text-neutral-500">{item.value}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
