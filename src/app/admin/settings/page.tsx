import type { Metadata } from "next";
import { Activity, CheckCircle2, XCircle, MinusCircle, Server } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/guards";
import { getSystemStatus } from "@/lib/admin/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "System Health"
};

const iconMap: Record<string, typeof CheckCircle2> = {
  ok: CheckCircle2,
  error: XCircle,
  missing: MinusCircle
};

const colorMap: Record<string, string> = {
  ok: "text-emerald-600",
  error: "text-red-600",
  missing: "text-neutral-400"
};

export default async function SystemHealthPage() {
  await requireRole(["admin"]);
  const status = await getSystemStatus();

  const services = [
    {
      title: "Core Infrastructure",
      description: "Database, authentication, and storage services",
      items: ["Supabase DB", "Supabase Auth", "Cloudflare R2"] as const
    },
    {
      title: "Communications",
      description: "Email and notification services",
      items: ["Resend", "Telegram Bot"] as const
    },
    {
      title: "Add-ons",
      description: "Optional feature services",
      items: ["VirusTotal", "AI (NVIDIA/Gemini)"] as const
    }
  ];

  return (
    <DashboardShell
      section="admin"
      title="System Health"
      description="Monitor connected services and platform configuration."
    >
      <div className="grid gap-6">
        {services.map((group) => (
          <Card key={group.title} className="overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary/60 to-primary/30" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="size-4" />
                {group.title}
              </CardTitle>
              <p className="text-xs text-neutral-500">{group.description}</p>
            </CardHeader>
            <CardContent className="grid gap-3">
              {group.items.map((key) => {
                const s = status[key];
                const Icon = iconMap[s ?? "missing"] ?? MinusCircle;
                const color = colorMap[s ?? "missing"] ?? "text-neutral-400";
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50/80 px-4 py-3 transition hover:bg-neutral-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Icon className={cn("size-5 shrink-0", color)} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-950">{key}</p>
                        <p className="text-xs text-neutral-500">
                          {s === "ok" ? "Configured and ready" : s === "missing" ? "Not configured" : "Error"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                        s === "ok"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-neutral-100 text-neutral-500"
                      )}
                    >
                      {s === "ok" ? "Active" : "Inactive"}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/60 to-primary/30" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4" />
            Platform info
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
            <p className="text-xs text-neutral-500">Version</p>
            <p className="mt-0.5 font-medium text-neutral-950">{siteConfig.name} 0.1.0</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
            <p className="text-xs text-neutral-500">Framework</p>
            <p className="mt-0.5 font-medium text-neutral-950">Next.js 15</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
            <p className="text-xs text-neutral-500">Environment</p>
            <p className="mt-0.5 font-medium text-neutral-950">
              {process.env.NODE_ENV ?? "production"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/admin">Back to dashboard</Link>
        </Button>
      </div>
    </DashboardShell>
  );
}
