import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Fingerprint,
  Globe,
  Hash,
  Package,
  ShieldAlert,
  ShieldCheck,
  Star,
  Tag,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getAdminAppById } from "@/lib/admin/admin";
import { formatDate, formatBytes, formatDownloads } from "@/lib/catalog/catalog";
import { moderateSingleAppAction } from "@/app/admin/actions";

export const metadata = {
  title: "Admin App Detail"
};

function ScanProgressBar({ count, total, label, color }: { count: number; total: number; label: string; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-16 shrink-0 text-right text-neutral-600">{count} {label}</span>
    </div>
  );
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

  const latestScan = app.scans[0] as {
    id: string;
    virus_total_status: string;
    malicious_count: number;
    suspicious_count: number;
    harmless_count: number;
    undetected_count: number;
    timeout_count: number;
    file_name: string;
    sha256: string;
    virus_total_source: string | null;
    r2_url: string | null;
    created_at: string;
  } | undefined;

  const totalEngines = latestScan
    ? latestScan.malicious_count + latestScan.suspicious_count + latestScan.harmless_count + latestScan.undetected_count + latestScan.timeout_count
    : 0;

  return (
    <div className="grid gap-4">
      <div>
        <Link
          href="/admin/apps"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950"
        >
          <ArrowLeft className="size-4" />
          Back to apps
        </Link>
      </div>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="mono-label">BabaStore</p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-normal text-neutral-950 sm:text-3xl">
            {app.name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500">
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs">
              {app.package_name}
            </code>
            <span>·</span>
            <span>v{app.version}</span>
            <span>·</span>
            <span>{app.category?.name ?? "Uncategorized"}</span>
            <span>·</span>
            <Badge
              variant={
                app.status === "published"
                  ? "success"
                  : app.status === "rejected"
                    ? "destructive"
                    : "warning"
              }
              className="capitalize"
            >
              {app.status}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <form>
            <Button
              size="sm"
              type="submit"
              formAction={moderateSingleAppAction.bind(null, app.id, "published")}
            >
              <CheckCircle2 />
              Approve
            </Button>
          </form>
          <form>
            <Button
              size="sm"
              variant="secondary"
              type="submit"
              formAction={moderateSingleAppAction.bind(null, app.id, "flagged")}
            >
              <AlertTriangle />
              Flag
            </Button>
          </form>
          <form>
            <Button
              size="sm"
              variant="secondary"
              type="submit"
              formAction={moderateSingleAppAction.bind(null, app.id, "draft")}
            >
              <Clock3 />
              Return
            </Button>
          </form>
          <form>
            <Button
              size="sm"
              variant="destructive"
              type="submit"
              formAction={moderateSingleAppAction.bind(null, app.id, "rejected")}
            >
              <XCircle />
              Reject
            </Button>
          </form>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/apps/${app.package_name ?? app.id}`} target="_blank">
              <ExternalLink />
              Store page
            </Link>
          </Button>
        </div>
      </header>

      {/* Metadata cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <Download className="size-4" />
              Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-neutral-950">{formatDownloads(app.totalDownloads)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <Package className="size-4" />
              Developer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-neutral-700">
            {app.developer?.username || "N/A"}
            {app.developer?.email ? (
              <div className="mt-0.5 font-mono text-xs text-neutral-500">{app.developer.email}</div>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <FileText className="size-4" />
              Created
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-neutral-700">
            {formatDate(app.created_at)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <Clock3 className="size-4" />
              Updated
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-neutral-700">
            {formatDate(app.updated_at)}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {app.description ? (
        <Card>
          <CardHeader>
            <p className="mono-label">DESCRIPTION</p>
            <CardTitle className="mt-1">App summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
              {app.description}
            </p>
            {app.tags?.length ? (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <Tag className="size-3.5 text-neutral-400" />
                {app.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="font-mono text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Links */}
      {(app.apk_url || app.privacy_policy_url) ? (
        <Card>
          <CardHeader>
            <p className="mono-label">RESOURCES</p>
            <CardTitle className="mt-1">Files & links</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {app.apk_url ? (
              <div className="flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <Download className="size-4 shrink-0 text-neutral-400" />
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-neutral-600">
                  {app.apk_url}
                </span>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={app.apk_url} target="_blank">
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              </div>
            ) : null}
            {app.privacy_policy_url ? (
              <div className="flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <Globe className="size-4 shrink-0 text-neutral-400" />
                <span className="min-w-0 flex-1 truncate text-neutral-600">
                  {app.privacy_policy_url}
                </span>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={app.privacy_policy_url} target="_blank">
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Version history */}
        <Card>
          <CardHeader>
            <p className="mono-label">VERSIONS</p>
            <CardTitle className="mt-1">Release history ({app.versions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {app.versions.length ? (
              <div className="grid gap-2">
                {app.versions.map((version: { id: string; version_name: string; version_code: number | null; apk_size: number | null; changelog: string | null; created_at: string }) => (
                  <div key={version.id} className="rounded-md border border-neutral-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-950">{version.version_name}</span>
                        {version.version_code ? (
                          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500">
                            code {version.version_code}
                          </code>
                        ) : null}
                      </div>
                      <span className="text-xs text-neutral-500">{formatDate(version.created_at)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-neutral-500">
                      {version.apk_size ? (
                        <span className="flex items-center gap-1">
                          <Download className="size-3" />
                          {formatBytes(version.apk_size)}
                        </span>
                      ) : null}
                    </div>
                    {version.changelog ? (
                      <p className="mt-1.5 text-sm text-neutral-600">{version.changelog}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
                No version history.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {/* VirusTotal report */}
          <Card>
            <CardHeader>
              <p className="mono-label">SECURITY</p>
              <CardTitle className="mt-1">VirusTotal scan report</CardTitle>
            </CardHeader>
            <CardContent>
              {latestScan ? (
                <div className="grid gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {latestScan.virus_total_status === "clean" ? (
                        <ShieldCheck className="size-5 text-green-600" />
                      ) : latestScan.virus_total_status === "blocked" ? (
                        <ShieldAlert className="size-5 text-red-600" />
                      ) : (
                        <Clock3 className="size-5 text-amber-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-neutral-950">
                          {latestScan.virus_total_status === "clean"
                            ? "Clean — no threats detected"
                            : latestScan.virus_total_status === "blocked"
                              ? `${latestScan.malicious_count} threat${latestScan.malicious_count !== 1 ? "s" : ""} detected`
                              : "Analysis in progress"}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Scanned {formatDate(latestScan.created_at)}
                          {latestScan.virus_total_source === "hash"
                            ? " (cached)"
                            : latestScan.virus_total_source === "upload"
                              ? " (file upload)"
                              : ""}
                        </p>
                      </div>
                    </div>
                    {latestScan.sha256 ? (
                      <code className="hidden max-w-[160px] truncate rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 sm:block" title={latestScan.sha256}>
                        <Fingerprint className="mr-1 inline size-3" />
                        {latestScan.sha256.slice(0, 16)}...
                      </code>
                    ) : null}
                  </div>

                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <p className="mb-2 text-xs font-medium text-neutral-600">
                      Detection breakdown ({totalEngines} engines)
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
                        color="bg-orange-400"
                      />
                      <ScanProgressBar
                        count={latestScan.harmless_count}
                        total={totalEngines}
                        label="harmless"
                        color="bg-green-500"
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

                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <Hash className="size-3" />
                    <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px]">
                      {latestScan.sha256}
                    </code>
                    {latestScan.file_name ? (
                      <>
                        <span>·</span>
                        <span>File: {latestScan.file_name}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
                  <ShieldAlert className="mx-auto size-8 text-neutral-300" />
                  <p className="mt-2 font-medium text-neutral-600">Not scanned</p>
                  <p className="mt-1">This app has not been submitted for VirusTotal analysis.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <p className="mono-label">REVIEWS</p>
              <CardTitle className="mt-1">Latest feedback ({app.reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {app.reviews.length ? (
                <div className="grid gap-2">
                  {app.reviews.slice(0, 5).map((review: { id: string; profiles: { username: string | null; email: string } | { username: string | null; email: string }[] | null; rating: number; body: string | null; created_at: string }) => {
                    const profile = Array.isArray(review.profiles)
                      ? review.profiles[0]
                      : review.profiles;
                    const userName = profile?.username ?? profile?.email ?? "Anonymous";
                    return (
                      <div key={review.id} className="rounded-md border border-neutral-200 bg-white p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-950">{userName}</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`size-3 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-neutral-500">{formatDate(review.created_at)}</span>
                        </div>
                        {review.body ? (
                          <p className="mt-1 text-sm text-neutral-600">{review.body}</p>
                        ) : null}
                      </div>
                    );
                  })}
                  {app.reviews.length > 5 ? (
                    <Link
                      href={`/admin/reviews?q=${app.package_name}`}
                      className="block text-center text-sm text-blue-600 hover:underline"
                    >
                      View all {app.reviews.length} reviews
                    </Link>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
                  No reviews yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
