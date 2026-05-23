import { Megaphone, Radio, ToggleLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth/guards";
import { getAnnouncements } from "@/lib/admin/admin";
import { formatDate, formatDownloads } from "@/lib/catalog/catalog";
import { deleteAnnouncementAction, saveAnnouncementAction } from "@/app/admin/actions";
import { AnnouncementsSetup } from "./announcements-setup";

export const metadata = {
  title: "Admin Announcements"
};

export default async function AdminAnnouncementsPage() {
  const { missingEnv } = await requireRole(["admin"]);
  const announcements = await getAnnouncements();
  const activeCount = announcements.filter((announcement) => announcement.is_active).length;

  return (
    <DashboardShell
      section="admin"
      title="Announcements"
      description="Publish short messages for the storefront and user dashboards."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}
        <AnnouncementsSetup />
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Announcements" value={formatDownloads(announcements.length)} helper="All saved messages" icon={Megaphone} />
          <StatCard title="Active" value={formatDownloads(activeCount)} helper="Visible to users" icon={Radio} />
          <StatCard title="Inactive" value={formatDownloads(announcements.length - activeCount)} helper="Draft or paused" icon={ToggleLeft} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
          <Card>
            <CardHeader>
              <p className="mono-label">NEW MESSAGE</p>
              <CardTitle className="mt-1">Create announcement</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveAnnouncementAction} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required placeholder="Maintenance window" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="body">Message</Label>
                  <Textarea id="body" name="body" required className="min-h-32" />
                </div>
                <label className="flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
                  <input type="checkbox" name="isActive" />
                  Show this announcement publicly
                </label>
                <Button type="submit">Publish message</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="mono-label">MESSAGES</p>
              <CardTitle className="mt-1">{formatDownloads(announcements.length)} saved</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {announcements.length ? (
                announcements.map((announcement) => (
                  <div key={announcement.id} className="rounded-md border border-neutral-200 bg-white p-4">
                    <form action={saveAnnouncementAction} className="grid gap-3">
                      <input type="hidden" name="id" value={announcement.id} />
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <Input name="title" defaultValue={announcement.title} required />
                          <p className="mt-2 text-xs text-neutral-500">
                            Updated {formatDate(announcement.updated_at)}
                          </p>
                        </div>
                        <Badge variant={announcement.is_active ? "default" : "secondary"}>
                          {announcement.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <Textarea name="body" defaultValue={announcement.body} required />
                      <label className="flex items-center gap-3 text-sm text-neutral-600">
                        <input type="checkbox" name="isActive" defaultChecked={announcement.is_active} />
                        Show publicly
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" type="submit">Save</Button>
                      </div>
                    </form>
                    <form action={deleteAnnouncementAction} className="mt-3">
                      <input type="hidden" name="announcementId" value={announcement.id} />
                      <Button size="sm" variant="destructive" type="submit">Delete</Button>
                    </form>
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
                  No announcements have been created yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
