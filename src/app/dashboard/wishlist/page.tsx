import Link from "next/link";
import { Heart, PackageSearch } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getUserLibrary } from "@/lib/user/user";
import { formatDate } from "@/lib/catalog/catalog";

export default async function WishlistPage() {
  const { missingEnv, profile } = await requireRole(["user", "developer", "admin"]);
  const library = profile ? await getUserLibrary(profile.id) : null;

  return (
    <DashboardShell
      section="user"
      title="Wishlist"
      description="Saved apps that you can return to anytime."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Saved apps</CardTitle>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/">
                <Heart />
                Browse catalog
              </Link>
            </Button>
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
                      {item.app.category} · Saved {formatDate(item.savedAt)}
                    </div>
                  </div>
                  <Heart className="size-4 shrink-0 text-neutral-400" />
                </Link>
              ))
            ) : (
              <EmptyState
                icon={PackageSearch}
                title="No saved apps"
                description="Saved apps will appear here once you use the wishlist button."
                action={
                  <Button asChild variant="secondary">
                    <Link href="/">Explore apps</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
