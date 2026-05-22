import Link from "next/link";
import { Download, Heart, PackageSearch, Search, ShieldCheck } from "lucide-react";
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

export default async function UserDashboardPage() {
  const { missingEnv, profile } = await requireRole(["user", "developer", "admin"]);
  const library = profile ? await getUserLibrary(profile.id) : null;

  return (
    <DashboardShell
      section="user"
      title="User Dashboard"
      description="Browse apps, track downloads, and manage wishlist items."
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
                {library.recommendedApps.slice(0, 3).map((app) => (
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
