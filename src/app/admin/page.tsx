import { Database, ShieldCheck, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminDashboardPage() {
  const { missingEnv } = await requireRole(["admin"]);

  return (
    <DashboardShell
      section="admin"
      title="Admin Dashboard"
      description="Moderate apps, users, categories, announcements, reports, and storage usage."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Apps awaiting review" value="0" helper="Queue starts Phase 4" icon={ShieldCheck} />
          <StatCard title="Users" value="0" helper="Supabase profiles table" icon={Users} />
          <StatCard title="Storage usage" value="0 MB" helper="R2 monitor starts Phase 4" icon={Database} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Moderation queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600">
              Approve, reject, flag, and bulk moderation workflows are reserved
              for Phase 4 after app submissions exist.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
