import { MessageSquareText, Star } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnvWarning } from "@/components/dashboard/env-warning";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getFeedback } from "@/lib/admin/admin";
import { formatDate } from "@/lib/catalog/catalog";

export const metadata = {
  title: "Admin Feedback"
};

export default async function AdminFeedbackPage() {
  const { missingEnv } = await requireRole(["admin"]);
  const feedback = await getFeedback();

  return (
    <DashboardShell
      section="admin"
      title="Feedback"
      description="Review user ratings and written feedback across published apps."
    >
      <div className="grid gap-4">
        {missingEnv ? <EnvWarning /> : null}
        <Card>
          <CardHeader>
            <CardTitle>User feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {feedback.length ? (
              <div className="grid gap-3">
                <div className="hidden overflow-x-auto rounded-md border border-neutral-200 lg:block">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
                    <tr>
                      <th className="p-3">Rating</th>
                      <th className="p-3">App</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Feedback</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedback.map((item) => (
                      <tr key={item.id} className="border-t border-neutral-200 align-top">
                        <td className="p-3">
                          <Badge variant="secondary">
                            <Star className="mr-1 size-3 fill-amber-400 text-amber-400" />
                            {item.rating}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-neutral-950">{item.app?.name ?? "Unknown app"}</div>
                          <div className="font-mono text-xs text-neutral-500">{item.app?.package_name ?? "No package"}</div>
                        </td>
                        <td className="p-3 text-neutral-600">
                          {item.user?.username || item.user?.email || "Unknown user"}
                        </td>
                        <td className="max-w-md p-3 text-neutral-600">
                          {item.body ?? "No written feedback."}
                        </td>
                        <td className="p-3 text-neutral-500">{formatDate(item.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                <div className="grid gap-3 lg:hidden">
                  {feedback.map((item) => (
                    <div key={item.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-medium text-neutral-950">
                            {item.app?.name ?? "Unknown app"}
                          </div>
                          <div className="truncate font-mono text-xs text-neutral-500">
                            {item.app?.package_name ?? "No package"}
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          <Star className="mr-1 size-3 fill-amber-400 text-amber-400" />
                          {item.rating}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-neutral-600">
                        {item.body ?? "No written feedback."}
                      </p>
                      <div className="mt-3 grid gap-1 text-xs text-neutral-500">
                        <div className="truncate">
                          User: {item.user?.username || item.user?.email || "Unknown user"}
                        </div>
                        <div>Date: {formatDate(item.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={MessageSquareText}
                title="No feedback yet"
                description="Reviews and user feedback will appear here after users rate apps."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
