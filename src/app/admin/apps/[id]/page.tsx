import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileArchive,
  FileText,
  Fingerprint,
  Globe,
  Hash,
  Layers,
  MailIcon,
  Package,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Star,
  Tag,
  User as UserIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getAdminAppById } from "@/lib/admin/admin";
import { formatDate, formatBytes, formatDownloads } from "@/lib/catalog/catalog";
import { moderateAppWithReasonAction } from "@/app/admin/actions";
import { ModerationActions } from "@/components/admin/moderation-actions";
import type { AppStatus } from "@/lib/supabase/types";

export const metadata = {
  title: "App review"
};

type ScanRow = {
  id: string;
  virus_total_status: string;
  virus_total_source: string | null;
  virus_total_analysis_id: string | null;
  malicious_count: number;
  suspicious_count: number;
  harmless_count: number;
  undetected_count: number;
  timeout_count: number;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  folder: string;
  sha256: string;
  r2_url: string | null;
  created_at: string;
};

function ScanProgressBar({
  count,
  total,
  label,
  color
}: {
  count: number;
  total: number;
  label: string;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-20 shrink-0 text-right tabular-nums text-neutral-600">
        {count} {label}
      </span>
    </div>
  );
}

function StatusPill({ status }: { status: AppStatus | string }) {
  const map: Record<string, { color: string; label: string }> = {
    published: { color: "bg-emerald-50 text-emerald-700 ring-emerald-200", label: "Published" },
    draft: { color: "bg-neutral-100 text-neutral-700 ring-neutral-200", label: "In review" },
    rejected: { color: "bg-red-50 text-red-700 ring-red-200", label: "Rejected" },
    flagged: { color: "bg-amber-50 text-amber-700 ring-amber-200", label: "Flagged" }
  };
  const c = map[status] ?? {
    color: "bg-neutral-100 text-neutral-700 ring-neutral-200",
    label: String(status)
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em] ring-1 ring-inset ${c.color}`}
    >
      {c.label}
    </span>
  );
}

function ScanIcon({ status }: { status: string }) {
  if (status === "clean") return <ShieldCheck className="size-5 text-emerald-600" />;
  if (status === "blocked") return <ShieldAlert className="size-5 text-red-600" />;
  if (status === "processing") return <Clock3 className="size-5 text-amber-600" />;
  return <ShieldQuestion className="size-5 text-neutral-400" />;
}

export default async function AdminAppDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);
  const { id } = await params;
  const app = await getAdminAppById(id);
  if (!app) notFound();

  const apkScans = (app.scans as ScanRow[]).filter((s) => s.folder === "apks");
  const latestScan = apkScans[0];

  const totalEngines = latestScan
    ? latestScan.malicious_count +
      latestScan.suspicious_count +
      latestScan.harmless_count +
      latestScan.undetected_count +
      latestScan.timeout_count
    : 0;

  const description = app.description ?? "";
  const summary = description.split("\n\n")[0] ?? description;
  const longDescription = description.includes("\n\n")
    ? description.slice(summary.length + 2)
    : "";

  const screenshots = (app.screenshots ?? []) as Array<{
    id: string;
    image_url: string;
    sort_order: number;
  }>;

  const otherDeveloperApps = (app.otherDeveloperApps ?? []) as Array<{
    id: string;
    name: string;
    package_name: string;
    status: AppStatus;
    version: string;
    updated_at: string;
  }>;

  const reviewQuality = computeReviewQuality({
    description,
    screenshots: screenshots.length,
    privacyPolicyUrl: app.privacy_policy_url,
    iconUrl: app.icon_url,
    tags: app.tags?.length ?? 0,
    scanStatus: latestScan?.virus_total_status ?? "missing"
  });

  return (
    <div className="grid gap-4 sm:gap-5">
      <div>
        <Link
          href="/admin/apps"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-neutral-600 hover:text-neutral-950"
        >
          <ArrowLeft className="size-4" />
          Back to apps
        </Link>
      </div>

      {/* Hero header */}
      <header className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="flex size-[88px] shrink-0 items-center justify-center squircle bg-neutral-100 text-2xl font-semibold text-neutral-500 sm:size-[120px]"
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
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              App review
            </p>
            <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.5px] text-neutral-950 sm:text-[28px]">
              {app.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-neutral-600 sm:text-[13px]">
              <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px]">
                {app.package_name}
              </code>
              <span className="text-neutral-300">·</span>
              <span>v{app.version}</span>
              <span className="text-neutral-300">·</span>
              <span>{app.category?.name ?? "Uncategorized"}</span>
              <span className="text-neutral-300">·</span>
              <StatusPill status={app.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <Download className="size-3" />
                {formatDownloads(app.totalDownloads)} downloads
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                {app.reviews?.length ?? 0} reviews
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3" />
                Updated {formatDate(app.updated_at)}
              </span>
            </div>

            {/* Review quality scorecard */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-md sm:grid-cols-3">
              <QualityChip
                label="Listing"
                value={reviewQuality.listingScore}
                ok={reviewQuality.listingScore >= 75}
              />
              <QualityChip
                label="Assets"
                value={reviewQuality.assetsScore}
                ok={reviewQuality.assetsScore >= 75}
              />
              <QualityChip
                label="Security"
                value={reviewQuality.securityScore}
                ok={reviewQuality.securityScore >= 75}
              />
            </div>
          </div>

          <div className="shrink-0">
            <Button size="sm" variant="ghost" asChild className="rounded-full">
              <Link
                href={`/apps/${(app as { slug?: string | null }).slug ?? app.package_name}`}
                target="_blank"
              >
                <ExternalLink />
                Public listing
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-5 border-t border-neutral-100 pt-4">
          <ModerationActions
            appId={app.id}
            appName={app.name}
            currentStatus={app.status as AppStatus}
            onModerate={moderateAppWithReasonAction}
          />
        </div>
      </header>

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* Left column */}
        <div className="grid gap-4 sm:gap-5">
          {/* Screenshots */}
          {screenshots.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  <Layers className="size-4" />
                  Screenshots ({screenshots.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="-mx-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-3 pb-2 scrollbar-none sm:mx-0 sm:gap-3 sm:px-0">
                  {screenshots.map((s) => (
                    <a
                      key={s.id}
                      href={s.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="snap-start"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.image_url}
                        alt={`${app.name} screenshot`}
                        loading="lazy"
                        className="h-[220px] w-auto rounded-lg border border-neutral-200 bg-canvas-soft object-cover sm:h-[300px]"
                      />
                    </a>
                  ))}
                  <div className="w-2 shrink-0 sm:hidden" aria-hidden />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <FileText className="size-4" />
                Listing copy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary ? (
                <p className="text-[14px] font-medium leading-6 text-neutral-900">{summary}</p>
              ) : null}
              {longDescription ? (
                <p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-neutral-700">
                  {longDescription}
                </p>
              ) : null}
              {app.tags?.length ? (
                <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-neutral-100 pt-3">
                  <Tag className="size-3.5 text-neutral-400" />
                  {app.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="font-mono text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
              <dl className="mt-4 grid gap-2 border-t border-neutral-100 pt-3 text-[13px] sm:grid-cols-2">
                <Field
                  icon={Globe}
                  label="Privacy policy"
                  value={
                    app.privacy_policy_url ? (
                      <Link
                        href={app.privacy_policy_url}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        Visit policy
                      </Link>
                    ) : (
                      <span className="text-amber-700">Missing</span>
                    )
                  }
                />
                <Field
                  icon={Download}
                  label="APK URL"
                  value={
                    app.apk_url ? (
                      <Link
                        href={app.apk_url}
                        target="_blank"
                        className="font-mono text-[11px] text-blue-600 hover:underline"
                      >
                        Download
                      </Link>
                    ) : (
                      <span className="text-red-700">Missing</span>
                    )
                  }
                />
              </dl>
            </CardContent>
          </Card>

          {/* Version history */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <Package className="size-4" />
                Release history ({app.versions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {app.versions.length ? (
                <div className="grid gap-2">
                  {(app.versions as Array<{
                    id: string;
                    version_name: string;
                    version_code: number | null;
                    apk_size: number | null;
                    changelog: string | null;
                    apk_url: string | null;
                    created_at: string;
                  }>).map((v) => (
                    <div
                      key={v.id}
                      className="rounded-xl border border-neutral-200 bg-canvas-soft p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-neutral-950">
                            v{v.version_name}
                          </span>
                          {v.version_code ? (
                            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-neutral-500">
                              code {v.version_code}
                            </code>
                          ) : null}
                        </div>
                        <span className="text-[11px] text-neutral-500">
                          {formatDate(v.created_at)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-neutral-500">
                        {v.apk_size ? (
                          <span className="inline-flex items-center gap-1">
                            <FileArchive className="size-3" />
                            {formatBytes(v.apk_size)}
                          </span>
                        ) : null}
                        {v.apk_url ? (
                          <Link
                            href={v.apk_url}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <ExternalLink className="size-3" />
                            APK
                          </Link>
                        ) : null}
                      </div>
                      {v.changelog ? (
                        <p className="mt-2 whitespace-pre-wrap text-[12px] leading-5 text-neutral-700">
                          {v.changelog}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-200 bg-canvas-soft p-6 text-center text-[13px] text-neutral-500">
                  No version history.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <Star className="size-4" />
                User reviews ({app.reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {app.reviews.length ? (
                <div className="grid gap-2">
                  {(app.reviews as Array<{
                    id: string;
                    rating: number;
                    body: string | null;
                    created_at: string;
                    profiles:
                      | { username: string | null; email: string }
                      | { username: string | null; email: string }[]
                      | null;
                  }>)
                    .slice(0, 8)
                    .map((review) => {
                      const profile = Array.isArray(review.profiles)
                        ? review.profiles[0]
                        : review.profiles;
                      const userName =
                        profile?.username ?? profile?.email ?? "Anonymous";
                      return (
                        <div
                          key={review.id}
                          className="rounded-xl border border-neutral-200 bg-canvas-soft p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-medium text-neutral-950">
                                {userName}
                              </span>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={
                                      star <= review.rating
                                        ? "size-3 fill-amber-400 text-amber-400"
                                        : "size-3 text-neutral-200"
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-[11px] text-neutral-500">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                          {review.body ? (
                            <p className="mt-1.5 text-[12px] leading-5 text-neutral-700">
                              {review.body}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-200 bg-canvas-soft p-6 text-center text-[13px] text-neutral-500">
                  No user reviews yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="grid gap-4 sm:gap-5">
          {/* Developer card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <UserIcon className="size-4" />
                Developer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-[15px] font-semibold text-neutral-600">
                  {(app.developer?.username ?? app.developer?.email ?? "?")
                    .slice(0, 1)
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-neutral-950">
                    {app.developer?.username ?? "Unnamed developer"}
                  </p>
                  <p className="flex items-center gap-1 truncate text-[12px] text-neutral-500">
                    <MailIcon className="size-3" />
                    {app.developer?.email ?? "—"}
                  </p>
                </div>
              </div>
              {(app.developer as { created_at?: string } | null)?.created_at ? (
                <p className="mt-3 text-[11px] text-neutral-500">
                  Joined{" "}
                  {formatDate(
                    (app.developer as { created_at: string }).created_at
                  )}
                </p>
              ) : null}

              {otherDeveloperApps.length ? (
                <div className="mt-4 border-t border-neutral-100 pt-3">
                  <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500">
                    Other apps from this developer
                  </p>
                  <div className="mt-2 grid gap-1.5">
                    {otherDeveloperApps.map((other) => (
                      <Link
                        key={other.id}
                        href={`/admin/apps/${other.id}`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[12px] transition hover:bg-canvas-soft"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-950">
                            {other.name}
                          </p>
                          <p className="truncate font-mono text-[10px] text-neutral-500">
                            {other.package_name}
                          </p>
                        </div>
                        <StatusPill status={other.status} />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* VirusTotal scan report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <ShieldCheck className="size-4" />
                VirusTotal report
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestScan ? (
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <ScanIcon status={latestScan.virus_total_status} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-neutral-950">
                        {latestScan.virus_total_status === "clean"
                          ? "No threats detected"
                          : latestScan.virus_total_status === "blocked"
                            ? `${latestScan.malicious_count + latestScan.suspicious_count} engine${latestScan.malicious_count + latestScan.suspicious_count === 1 ? "" : "s"} flagged this APK`
                            : "Analysis in progress"}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {formatDate(latestScan.created_at)}
                        {latestScan.virus_total_source === "hash"
                          ? " · cached"
                          : latestScan.virus_total_source === "upload"
                            ? " · fresh scan"
                            : ""}
                      </p>
                    </div>
                  </div>

                  {totalEngines > 0 ? (
                    <div className="rounded-lg border border-neutral-200 bg-canvas-soft p-3">
                      <p className="mb-2 text-[11px] font-mono uppercase tracking-[0.04em] text-neutral-500">
                        {totalEngines} engines reported
                      </p>
                      <div className="grid gap-1.5">
                        <ScanProgressBar
                          count={latestScan.malicious_count}
                          total={totalEngines}
                          label="malicious"
                          color="bg-red-500"
                        />
                        <ScanProgressBar
                          count={latestScan.suspicious_count}
                          total={totalEngines}
                          label="suspicious"
                          color="bg-amber-400"
                        />
                        <ScanProgressBar
                          count={latestScan.harmless_count}
                          total={totalEngines}
                          label="clean"
                          color="bg-emerald-500"
                        />
                        <ScanProgressBar
                          count={latestScan.undetected_count}
                          total={totalEngines}
                          label="undetected"
                          color="bg-neutral-300"
                        />
                        <ScanProgressBar
                          count={latestScan.timeout_count}
                          total={totalEngines}
                          label="timeout"
                          color="bg-neutral-400"
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-1 text-[11px] text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      <Hash className="size-3" />
                      <code
                        className="truncate rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px]"
                        title={latestScan.sha256}
                      >
                        {latestScan.sha256.slice(0, 32)}…
                      </code>
                    </div>
                    {latestScan.virus_total_analysis_id ? (
                      <div className="flex items-center gap-1.5">
                        <Fingerprint className="size-3" />
                        <code className="font-mono text-[10px]">
                          {latestScan.virus_total_analysis_id.slice(0, 24)}…
                        </code>
                      </div>
                    ) : null}
                  </div>

                  {/* Full scan history */}
                  {apkScans.length > 1 ? (
                    <details className="group border-t border-neutral-100 pt-3">
                      <summary className="cursor-pointer text-[12px] font-medium text-neutral-700 hover:text-neutral-950">
                        Full scan history ({apkScans.length})
                      </summary>
                      <div className="mt-2 grid gap-2">
                        {apkScans.slice(1).map((scan) => (
                          <div
                            key={scan.id}
                            className="rounded-lg border border-neutral-200 bg-canvas-soft p-2.5 text-[11px]"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <ScanIcon status={scan.virus_total_status} />
                                <span className="font-medium text-neutral-950">
                                  {scan.virus_total_status}
                                </span>
                              </div>
                              <span className="text-neutral-500">
                                {formatDate(scan.created_at)}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-neutral-500">
                              {scan.file_name} ·{" "}
                              {scan.file_size ? formatBytes(scan.file_size) : "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </details>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-200 bg-canvas-soft p-6 text-center text-[13px] text-neutral-500">
                  <ShieldQuestion className="mx-auto size-7 text-neutral-400" />
                  <p className="mt-2 font-medium text-neutral-700">No scan on file</p>
                  <p className="mt-0.5 text-[12px]">
                    The developer hasn&apos;t submitted an APK for scanning yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviewer checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <Eye className="size-4" />
                Reviewer checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-[13px]">
                <CheckRow
                  ok={Boolean(app.icon_url)}
                  label="App icon uploaded"
                />
                <CheckRow
                  ok={screenshots.length >= 2}
                  label={`At least 2 screenshots (${screenshots.length})`}
                />
                <CheckRow
                  ok={(description?.length ?? 0) >= 80}
                  label={`Description ≥ 80 chars (${description?.length ?? 0})`}
                />
                <CheckRow
                  ok={Boolean(app.privacy_policy_url)}
                  label="Privacy policy URL set"
                />
                <CheckRow
                  ok={(app.tags?.length ?? 0) >= 1}
                  label={`Tags defined (${app.tags?.length ?? 0})`}
                />
                <CheckRow
                  ok={latestScan?.virus_total_status === "clean"}
                  label="VirusTotal scan clean"
                />
                <CheckRow
                  ok={Boolean(app.apk_url)}
                  label="APK URL stored"
                />
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Globe;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 text-neutral-500">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="min-w-0 truncate text-right">{value}</span>
    </div>
  );
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-start gap-2">
      <span
        className={`mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full ${
          ok ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-400"
        }`}
      >
        {ok ? "✓" : "·"}
      </span>
      <span className={ok ? "text-neutral-700" : "text-neutral-500"}>{label}</span>
    </li>
  );
}

function QualityChip({
  label,
  value,
  ok
}: {
  label: string;
  value: number;
  ok: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-2.5 text-center ${
        ok
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-neutral-600">
        {label}
      </p>
      <p
        className={`mt-0.5 text-[18px] font-semibold tabular-nums ${
          ok ? "text-emerald-700" : "text-amber-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function computeReviewQuality(input: {
  description: string;
  screenshots: number;
  privacyPolicyUrl: string | null;
  iconUrl: string | null;
  tags: number;
  scanStatus: string;
}) {
  let listing = 0;
  if (input.description.length >= 80) listing += 50;
  if (input.description.length >= 240) listing += 30;
  if (input.tags >= 1) listing += 20;

  let assets = 0;
  if (input.iconUrl) assets += 40;
  if (input.screenshots >= 1) assets += 20;
  if (input.screenshots >= 3) assets += 20;
  if (input.privacyPolicyUrl) assets += 20;

  let security = 0;
  if (input.scanStatus === "clean") security = 100;
  else if (input.scanStatus === "processing") security = 60;
  else if (input.scanStatus === "blocked") security = 0;
  else security = 40;

  return {
    listingScore: Math.min(100, listing),
    assetsScore: Math.min(100, assets),
    securityScore: Math.min(100, security)
  };
}
