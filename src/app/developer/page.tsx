import { BarChart3, PackageCheck, UploadCloud } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";

export default async function DeveloperDashboardPage() {
  const { missingEnv } = await requireRole(["developer", "admin"]);

  return (
    <DashboardShell
      section="developer"
      title="Developer Dashboard"
      description="Prepare app metadata, versions, and upload workflows for Android releases."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Apps" value="0" helper="Drafts and published apps" icon={PackageCheck} />
          <StatCard title="Downloads" value="0" helper="Analytics starts Phase 4" icon={BarChart3} />
          <StatCard title="Pending reviews" value="0" helper="Moderation starts Phase 4" icon={UploadCloud} />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upload pipeline</CardTitle>
            <Button size="sm" disabled>
              <UploadCloud />
              Phase 3
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600">
              R2 direct upload, APK metadata validation, and publish preview are
              scheduled for Phase 3.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
