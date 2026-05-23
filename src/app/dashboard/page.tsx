import Link from "next/link";
import {
  Clock,
  Download,
  Heart,
  MessageSquare,
  PackageSearch,
  Search,
  ShieldCheck,
  Star
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { AppCard } from "@/components/marketing/app-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireRole } from "@/lib/auth/guards";
import { getUserLibrary } from "@/lib/user/user";
import { formatDate } from "@/lib/catalog/catalog";

export default async function UserDashboardPage() {
  const { missingEnv, profile } = await requireRole(["user", "developer", "admin"]);
  const library = profile ? await getUserLibrary(profile.id) : null;

  return (
    <DashboardShell
      section="user"
      title="User Dashboard"
      description="Browse apps, track downloads, manage wishlist items, and view your reviews."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}
        <form action="/" className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input name="q" className="pl-9" placeholder="Search BabaStore..." />
        </form>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Downloaded apps"
            value={String(library?.uniqueDownloads.length ?? 0)}
            helper={`${library?.totalDownloads ?? 0} total install events`}
            icon={Download}
          />
          <StatCard
            title="Wishlist"
            value={String(library?.totalWishlist ?? 0)}
            helper="Saved apps in your account"
            icon={Heart}
          />
          <StatCard
            title="Account state"
            value="Ready"
            helper={`${profile?.role ?? "user"} access active`}
            icon={ShieldCheck}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <p className="mono-label">ACTIVITY</p>
                <CardTitle className="mt-1">Recent downloads</CardTitle>
              </div>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/dashboard/apps">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {library?.uniqueDownloads.length ? (
                <div className="grid gap-2">
                  {library.uniqueDownloads.slice(0, 5).map((item) => (
                    <Link
                      key={item.downloadId}
                      href={`/apps/${item.app.slug}`}
                      className="flex items-center gap-3 rounded-md border border-neutral-200 p-3 text-sm transition hover:bg-neutral-50"
                    >
                      <div
                        className="flex size-10 shrink-0 items-center justify-center rounded-md text-lg text-white"
                        style={{ background: item.app.accent }}
                      >
                        {item.app.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-neutral-950">{item.app.name}</p>
                        <p className="text-xs text-neutral-500">{item.app.category}</p>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-neutral-400">
                        <Clock className="size-3" />
                        {formatDate(item.downloadedAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Download}
                  title="No downloads yet"
                  description="Apps you download will appear here."
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <p className="mono-label">REVIEWS</p>
                <CardTitle className="mt-1">Your reviews</CardTitle>
              </div>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/">Browse apps</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {library?.reviews.length ? (
                <div className="grid gap-2">
                  {library.reviews.slice(0, 5).map((review) => (
                    <Link
                      key={review.id}
                      href={`/apps/${review.appSlug}`}
                      className="rounded-md border border-neutral-200 p-3 text-sm transition hover:bg-neutral-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate font-medium text-neutral-950">{review.appName}</span>
                        <span className="flex items-center gap-1 text-amber-500">
                          <Star className="size-3 fill-current" />
                          {review.rating}/5
                        </span>
                      </div>
                      {review.body ? (
                        <p className="mt-1 line-clamp-2 text-neutral-600">{review.body}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-neutral-400">{formatDate(review.createdAt)}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="No reviews yet"
                  description="Rate and review apps you've downloaded to see them here."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <p className="mono-label">FOR YOU</p>
              <CardTitle className="mt-1">Recommended apps</CardTitle>
            </div>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/">Browse all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {library?.recommendedApps.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {library.recommendedApps.slice(0, 6).map((app) => (
                  <AppCard key={app.id} app={app} compact />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={PackageSearch}
                title="No recommendations yet"
                description="Published apps appear here when the catalog has items you have not installed or saved."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
