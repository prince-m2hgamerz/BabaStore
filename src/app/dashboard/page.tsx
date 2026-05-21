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
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <Input className="pl-9" placeholder="Search BabaStore..." />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Downloaded apps" value="0" helper="Tracked after Phase 2" icon={Download} />
          <StatCard title="Wishlist" value="0" helper="Enabled in Phase 5" icon={Heart} />
          <StatCard title="Account state" value="Ready" helper="Protected route active" icon={ShieldCheck} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>For You</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/55">
              App feeds connect in Phase 2 after the app catalog and download
              flow are implemented.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

