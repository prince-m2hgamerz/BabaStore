import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { UploadForm } from "@/components/developer/upload-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getDeveloperOverview } from "@/lib/developer/developer";

export const metadata = {
  title: "Upload APK"
};

export default async function DeveloperUploadPage() {
  const { missingEnv, profile } = await requireRole(["developer", "admin"]);
  const overview = profile ? await getDeveloperOverview(profile.id, profile.role) : null;
  const categories = overview?.categories ?? [];

  return (
    <DashboardShell
      section="developer"
      title="Upload APK"
      description="Create a store listing, upload APK assets to R2, and preview the listing before publishing."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/developer/apps">
              <ArrowLeft />
              Back to apps
            </Link>
          </Button>
        </div>

        {categories.length ? (
          <UploadForm categories={categories} />
        ) : (
          <Card>
            <CardContent className="p-6 text-sm leading-6 text-neutral-600">
              No app categories are available in Supabase. Add categories from the
              schema before uploading apps.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
