import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Cloud,
  Database,
  KeyRound,
  ScanSearch,
  ShieldCheck,
  UploadCloud
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/guards";
import { isR2Ready, r2BucketName } from "@/lib/storage/r2";
import { isVirusTotalReady } from "@/lib/security/virustotal";

export const metadata: Metadata = {
  title: "Developer Settings"
};

export default async function DeveloperSettingsPage() {
  const { missingEnv, profile } = await requireRole(["developer", "admin"]);
  const r2Ready = isR2Ready();
  const virusTotalReady = isVirusTotalReady();

  return (
    <DashboardShell
      section="developer"
      title="Developer Settings"
      description="Manage your publishing profile and upload defaults."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Developer profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <span className="text-neutral-500">Email</span>
                <span className="truncate font-medium text-neutral-950">{profile?.email ?? "Unknown"}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <span className="text-neutral-500">Username</span>
                <span className="font-medium text-neutral-950">{profile?.username ?? "Not set"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing defaults</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button variant="secondary" asChild className="w-full">
                <Link href="/developer/upload">
                  <UploadCloud />
                  Upload APK
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/developer">
                  <ShieldCheck />
                  Back to overview
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              icon: Cloud,
              title: "Cloudflare R2 storage",
              description: `Uploads are stored in the ${r2BucketName()} bucket after validation.`,
              status: r2Ready ? "Connected" : "Needs env"
            },
            {
              icon: ScanSearch,
              title: "VirusTotal scanning",
              description: "APK, icon, and screenshot uploads are scanned before R2 storage.",
              status: virusTotalReady ? "Enabled" : "Needs key"
            },
            {
              icon: Database,
              title: "Release records",
              description: "Version history, APK size, screenshots, and publishing state are saved in Supabase.",
              status: missingEnv ? "Needs env" : "Ready"
            }
          ].map((item) => (
            <Card key={item.title} className="glass-hover">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <item.icon className="size-5 text-neutral-950" />
                  <Badge variant={item.status.includes("Needs") ? "secondary" : "success"}>
                    {item.status}
                  </Badge>
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
            <CardTitle>Publishing checklist</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              {
                icon: CheckCircle2,
                label: "Package identity",
                value: "Upload forms require a valid reverse-domain package name."
              },
              {
                icon: KeyRound,
                label: "API keys",
                value: "Server-only keys stay in environment variables and are never shown in the UI."
              },
              {
                icon: UploadCloud,
                label: "APK upload",
                value: "Saving is blocked until a scanned APK returns a public R2 URL."
              },
              {
                icon: ShieldCheck,
                label: "Moderation",
                value: "Draft, published, rejected, and flagged states are enforced by role permissions."
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
