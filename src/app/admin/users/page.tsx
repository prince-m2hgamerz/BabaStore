import { Crown, Search, Shield, UserRound } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { requireRole } from "@/lib/auth/guards";
import { getAdminOverview } from "@/lib/admin/admin";
import { formatDate, formatDownloads } from "@/lib/catalog/catalog";
import { updateUserRoleAction } from "@/app/admin/actions";

export const metadata = {
  title: "Admin Users"
};

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { missingEnv } = await requireRole(["admin"]);
  const params = await searchParams;
  const query = String(Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "").toLowerCase();
  const overview = await getAdminOverview();
  const users = query
    ? overview.users.filter((user) =>
        [user.email, user.username ?? "", user.role].join(" ").toLowerCase().includes(query)
      )
    : overview.users;

  return (
    <DashboardShell
      section="admin"
      title="User Management"
      description="Search accounts, review roles, and promote or restrict users."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total users" value={formatDownloads(overview.stats.totalUsers)} helper="All registered profiles" icon={UserRound} />
          <StatCard title="Developers" value={formatDownloads(overview.stats.developers)} helper="Can publish app listings" icon={Shield} />
          <StatCard title="Admins" value={formatDownloads(overview.stats.admins)} helper="Full platform access" icon={Crown} />
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mono-label">ACCOUNTS</p>
              <CardTitle className="mt-1">{formatDownloads(users.length)} users</CardTitle>
            </div>
            <form className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <Input name="q" defaultValue={query} className="pl-9" placeholder="Search users" />
            </form>
          </CardHeader>
          <CardContent>
            <div className="hidden overflow-x-auto rounded-md border border-neutral-200 lg:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Joined</th>
                    <th className="p-3">Update role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-neutral-200">
                      <td className="p-3">
                        <div className="font-medium text-neutral-950">{user.username || "No username"}</div>
                        <div className="text-xs text-neutral-500">{user.email}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                      </td>
                      <td className="p-3 text-neutral-500">{formatDate(user.created_at)}</td>
                      <td className="p-3">
                        <form action={updateUserRoleAction} className="flex items-center gap-2">
                          <input type="hidden" name="userId" value={user.id} />
                          <Select name="role" defaultValue={user.role}>
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="developer">Developer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" type="submit">Save</Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 lg:hidden">
              {users.map((user) => (
                <div key={user.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-neutral-950">{user.username || "No username"}</div>
                      <div className="truncate text-xs text-neutral-500">{user.email}</div>
                    </div>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className="shrink-0">
                      {user.role}
                    </Badge>
                  </div>
                  <div className="mt-3 text-xs text-neutral-500">Joined {formatDate(user.created_at)}</div>
                  <form action={updateUserRoleAction} className="mt-3 grid gap-2 xs:grid-cols-[1fr_auto]">
                    <input type="hidden" name="userId" value={user.id} />
                    <Select name="role" defaultValue={user.role}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" type="submit">Save</Button>
                  </form>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
