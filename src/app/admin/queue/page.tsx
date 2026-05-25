import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Inbox,
  ShieldAlert,
  Star
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getAdminOverview } from "@/lib/admin/admin";
import { formatDate } from "@/lib/catalog/catalog";
import { moderateAppsAction, moderateSingleAppAction } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ScanButton } from "@/components/admin/scan-button";
import type { Database } from "@/lib/supabase/types";

type UploadScan = Database["public"]["Tables"]["upload_scans"]["Row"];

export const metadata = {
  title: "Review queue"
};

async function getApkScanMap() {
  // upload_scans is typically RLS-restricted to the owning developer. Admins
  // need the full picture, so use the service-role client when available and
  // fall back to the cookie-auth client only if the service key is missing.
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminClient()
    : await createClient();
  const { data } = await supabase
    .from("upload_scans")
    .select("*")
    .eq("folder", "apks")
    .order("created_at", { ascending: false });

  const map = new Map<string, UploadScan>();
  (data ?? []).forEach((scan) => {
    if (!scan.package_name) return;
    if (!map.has(scan.package_name)) map.set(scan.package_name, scan);
  });
  return map;
}

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const map = {
    high: "bg-red-50 text-red-700 ring-red-200",
    medium: "bg-amber-50 text-amber-700 ring-amber-200",
    low: "bg-neutral-100 text-neutral-700 ring-neutral-200"
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ring-1 ring-inset ${map[priority]}`}
    >
      {priority}
    </span>
  );
}

export default async function AdminQueuePage() {
  const { missingEnv } = await requireRole(["admin"]);
  const overview = await getAdminOverview();
  const scanMap = await getApkScanMap();

  const queue = overview.apps
    .filter((app) => app.status === "draft" || app.status === "flagged")
    .map((app) => {
      const scan = scanMap.get(app.package_name);
      const isFlaggedByVT = scan?.virus_total_status === "blocked";
      const priority: "high" | "medium" | "low" =
        app.status === "flagged" || isFlaggedByVT
          ? "high"
          : !scan || scan.virus_total_status === "processing"
            ? "medium"
            : "low";
      return { app, scan, isFlaggedByVT, priority };
    })
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 } as const;
      if (order[a.priority] !== order[b.priority]) {
        return order[a.priority] - order[b.priority];
      }
      return new Date(a.app.updated_at).getTime() - new Date(b.app.updated_at).getTime();
    });

  const flaggedCount = queue.filter((q) => q.priority === "high").length;
  const newSubmissions = queue.filter((q) => q.app.status === "draft").length;

  return (
    <DashboardShell
      section="admin"
      title="Review queue"
      description="Apps waiting for your approval. Flagged submissions show first."
    >
      <div className="grid gap-4 sm:gap-5">
        {missingEnv ? <EnvWarning /> : null}

        {/* Summary band */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-neutral-950/5">
                <Inbox className="size-5 text-neutral-700" />
              </span>
              <div>
                <p className="text-[22px] font-semibold tabular-nums text-neutral-950 sm:text-[26px]">
                  {queue.length}
                </p>
                <p className="text-[12px] text-neutral-500">Awaiting review</p>
              </div>
            </div>
            <div className="hidden h-10 w-px bg-neutral-200 sm:block" aria-hidden />
            <div className="flex items-center gap-2">
              <PriorityBadge priority="high" />
              <span className="text-[13px] tabular-nums text-neutral-700">
                {flaggedCount} flagged
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-blue-700 ring-1 ring-inset ring-blue-200">
                new
              </span>
              <span className="text-[13px] tabular-nums text-neutral-700">
                {newSubmissions} fresh
              </span>
            </div>
          </div>
        </div>

        {queue.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-canvas-soft p-10 text-center">
            <CheckCircle2 className="mx-auto size-9 text-emerald-500" />
            <p className="mt-3 text-[16px] font-semibold text-neutral-950">
              All caught up
            </p>
            <p className="mt-1 text-[13px] text-neutral-500">
              No apps are waiting for review. New submissions will land here automatically.
            </p>
            <Button asChild variant="secondary" className="mt-4 rounded-full">
              <Link href="/admin/apps">
                Browse all apps
                <ArrowRight />
              </Link>
            </Button>
          </div>
        ) : (
          <form action={moderateAppsAction} className="grid gap-3">
            {queue.map(({ app, scan, isFlaggedByVT, priority }) => (
              <Card key={app.id} className="overflow-hidden">
                <CardContent className="grid gap-4 p-4 sm:gap-5 sm:p-5">
                  {/* Header row */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <label className="flex min-w-0 items-start gap-3">
                      <input
                        name="appIds"
                        type="checkbox"
                        value={app.id}
                        className="mt-1 size-4 shrink-0 rounded border-neutral-300"
                        aria-label={`Select ${app.name}`}
                      />
                      <span
                        className="flex size-12 shrink-0 items-center justify-center squircle bg-neutral-100 text-[15px] font-semibold text-neutral-500 sm:size-14"
                        style={
                          app.icon_url
                            ? {
                                backgroundImage: `url("${app.icon_url}")`,
                                backgroundSize: "cover",
                                color: "transparent"
                              }
                            : undefined
                        }
                      >
                        {!app.icon_url ? app.name.slice(0, 1).toUpperCase() : ""}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <Link
                            href={`/admin/apps/${app.id}`}
                            className="text-[15px] font-semibold text-neutral-950 hover:underline"
                          >
                            {app.name}
                          </Link>
                          <PriorityBadge priority={priority} />
                          {isFlaggedByVT ? (
                            <Badge
                              variant="warning"
                              className="text-[10px] font-semibold uppercase tracking-[0.04em]"
                            >
                              VT flag
                            </Badge>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[11px] text-neutral-500">
                          {app.package_name} · v{app.version}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-neutral-500">
                          {app.developer?.username ?? app.developer?.email ?? "Developer"}
                          {" · "}submitted {formatDate(app.updated_at)}
                        </span>
                      </span>
                    </label>

                    {/* Scan chip + reviews */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ScanButton
                        appId={app.id}
                        appName={app.name}
                        initialScan={
                          scan
                            ? {
                                status: scan.virus_total_status,
                                malicious: scan.malicious_count,
                                suspicious: scan.suspicious_count,
                                total:
                                  scan.malicious_count +
                                  scan.suspicious_count +
                                  scan.harmless_count +
                                  scan.undetected_count +
                                  scan.timeout_count,
                                createdAt: scan.created_at
                              }
                            : null
                        }
                      />
                      {(app.reviews ?? 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-canvas-soft px-2 py-0.5 text-[11px] text-neutral-600">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          {app.reviews}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Description preview */}
                  {app.description ? (
                    <p className="line-clamp-2 text-[12px] leading-5 text-neutral-600 sm:text-[13px]">
                      {app.description.split("\n\n")[0]}
                    </p>
                  ) : null}

                  {/* Action row */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
                    <Button
                      size="sm"
                      type="submit"
                      formAction={moderateSingleAppAction.bind(null, app.id, "published")}
                      className="rounded-full"
                    >
                      <CheckCircle2 />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      type="submit"
                      formAction={moderateSingleAppAction.bind(null, app.id, "flagged")}
                      className="rounded-full"
                    >
                      <ShieldAlert />
                      Flag
                    </Button>
                    <Button size="sm" variant="ghost" asChild className="ml-auto rounded-full">
                      <Link href={`/admin/apps/${app.id}`}>
                        <ExternalLink />
                        Open full review
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Bulk actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[14px]">Bulk actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button
                  name="status"
                  value="published"
                  type="submit"
                  size="sm"
                  className="rounded-full"
                >
                  <CheckCircle2 />
                  Approve selected
                </Button>
                <Button
                  name="status"
                  value="flagged"
                  variant="secondary"
                  type="submit"
                  size="sm"
                  className="rounded-full"
                >
                  <ShieldAlert />
                  Flag selected
                </Button>
                <Button
                  name="status"
                  value="rejected"
                  variant="destructive"
                  type="submit"
                  size="sm"
                  className="rounded-full"
                >
                  Reject selected
                </Button>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}
