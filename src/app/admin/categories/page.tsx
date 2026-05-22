import { Boxes, PackageCheck, Tags } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth/guards";
import { getAdminOverview } from "@/lib/admin/admin";
import { formatDownloads } from "@/lib/catalog/catalog";
import { deleteCategoryAction, saveCategoryAction } from "@/app/admin/actions";

export const metadata = {
  title: "Admin Categories"
};

export default async function AdminCategoriesPage() {
  const { missingEnv } = await requireRole(["admin"]);
  const overview = await getAdminOverview();

  return (
    <DashboardShell
      section="admin"
      title="Category Management"
      description="Create and maintain marketplace categories used by app listings."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Categories" value={formatDownloads(overview.categories.length)} helper="Store taxonomy" icon={Tags} />
          <StatCard title="Published apps" value={formatDownloads(overview.stats.publishedApps)} helper="Visible to visitors" icon={PackageCheck} />
          <StatCard title="Total listings" value={formatDownloads(overview.stats.totalApps)} helper="All statuses" icon={Boxes} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
          <Card>
            <CardHeader>
              <p className="mono-label">NEW CATEGORY</p>
              <CardTitle className="mt-1">Add category</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveCategoryAction} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required placeholder="Security" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" name="slug" required placeholder="security" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <Button type="submit">Create category</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="mono-label">EXISTING</p>
              <CardTitle className="mt-1">{formatDownloads(overview.categories.length)} categories</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {overview.categories.map((category) => (
                <div key={category.id} className="rounded-md border border-neutral-200 bg-white p-4">
                  <form action={saveCategoryAction} className="grid gap-3 md:grid-cols-[1fr_1fr_1.2fr_auto] md:items-end">
                    <input type="hidden" name="id" value={category.id} />
                    <div className="grid gap-2">
                      <Label htmlFor={`name-${category.id}`}>Name</Label>
                      <Input id={`name-${category.id}`} name="name" defaultValue={category.name} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`slug-${category.id}`}>Slug</Label>
                      <Input id={`slug-${category.id}`} name="slug" defaultValue={category.slug} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`description-${category.id}`}>Description</Label>
                      <Input id={`description-${category.id}`} name="description" defaultValue={category.description ?? ""} />
                    </div>
                    <Button size="sm" type="submit">Save</Button>
                  </form>
                  <form action={deleteCategoryAction} className="mt-3">
                    <input type="hidden" name="categoryId" value={category.id} />
                    <Button size="sm" variant="destructive" type="submit">Delete</Button>
                  </form>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
