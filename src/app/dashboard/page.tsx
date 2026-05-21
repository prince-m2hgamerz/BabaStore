import { Download, Heart, Search, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireRole } from "@/lib/auth/guards";

export default async function UserDashboardPage() {
  const { missingEnv } = await requireRole(["user", "developer", "admin"]);

  return (
    <DashboardShell
      section="user"
      title="User Dashboard"
      description="Browse apps, track downloads, and manage wishlist items."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input className="pl-9" placeholder="Search BabaStore..." />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Downloaded apps" value="0" helper="Tracked from install activity" icon={Download} />
          <StatCard title="Wishlist" value="0" helper="Saved app list" icon={Heart} />
          <StatCard title="Account state" value="Ready" helper="Protected route active" icon={ShieldCheck} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>For You</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600">
              Public app feeds use the live catalog browsing and download flow.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
