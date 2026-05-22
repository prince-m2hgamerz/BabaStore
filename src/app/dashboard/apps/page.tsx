import Link from "next/link";
import { Download, Heart, PackageSearch, Play } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getUserLibrary } from "@/lib/user/user";
import { formatDate } from "@/lib/catalog/catalog";

export default async function UserAppsPage() {
  const { missingEnv, profile } = await requireRole(["user", "developer", "admin"]);
  const library = profile ? await getUserLibrary(profile.id) : null;

  return (
    <DashboardShell
      section="user"
      title="My Apps"
      description="Your downloads, saved apps, and quick access to the public catalog."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Downloads</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-neutral-950">
              {library?.totalDownloads ?? 0}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Wishlist</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-neutral-950">
              {library?.totalWishlist ?? 0}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/">
                  <Play />
                  Browse apps
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent downloads</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {library?.uniqueDownloads.length ? (
                library.uniqueDownloads.map((item) => (
                  <Link
                    key={item.downloadId}
                    href={`/apps/${item.app.slug}`}
                    className="flex items-center justify-between gap-4 rounded-md border border-neutral-200 bg-white p-3 transition hover:bg-neutral-50"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-neutral-950">
                        {item.app.name}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">
                        {item.app.category} - {formatDate(item.downloadedAt)}
                      </div>
                    </div>
                    <Download className="size-4 shrink-0 text-neutral-400" />
                  </Link>
                ))
              ) : (
                <EmptyState
                  icon={PackageSearch}
                  title="No downloads yet"
                  description="Your download history will appear here after you install apps."
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved apps</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {library?.wishlist.length ? (
                library.wishlist.map((item) => (
                  <Link
                    key={item.id}
                    href={`/apps/${item.app.slug}`}
                    className="flex items-center justify-between gap-4 rounded-md border border-neutral-200 bg-white p-3 transition hover:bg-neutral-50"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-neutral-950">
                        {item.app.name}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">
                        Saved {formatDate(item.savedAt)}
                      </div>
                    </div>
                    <Heart className="size-4 shrink-0 text-neutral-400" />
                  </Link>
                ))
              ) : (
                <EmptyState
                  icon={PackageSearch}
                  title="Wishlist is empty"
                  description="Tap the save button on any app page to keep it here."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
