import type { Metadata } from "next";
import { Mail, Send, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailComposeForm } from "./email-compose-form";

export const metadata: Metadata = {
  title: "Email Marketing"
};

export default async function EmailMarketingPage() {
  await requireRole(["admin"]);

  return (
    <DashboardShell
      section="admin"
      title="Email Marketing"
      description="Compose and send email campaigns to your users via Resend."
    >
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="size-4" />
              Compose campaign
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmailComposeForm />
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4" />
                Audience guide
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-neutral-600 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <p className="font-medium text-neutral-950">All users</p>
                <p className="mt-0.5 text-xs">Every registered account on BabaStore</p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <p className="font-medium text-neutral-950">Developers</p>
                <p className="mt-0.5 text-xs">Users with the developer role</p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <p className="font-medium text-neutral-950">Admins</p>
                <p className="mt-0.5 text-xs">Platform administrators</p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <p className="font-medium text-neutral-950">Custom</p>
                <p className="mt-0.5 text-xs">Enter specific email addresses</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="size-4" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-neutral-600">
              <p>
                Emails are sent individually to each recipient. For large audiences,
                delivery may take a few minutes.
              </p>
              <p>
                All emails include the BabaStore branded template with header, body,
                and footer with unsubscribe instructions.
              </p>
              <p>
                Rate limits apply based on your Resend plan. Check your Resend
                dashboard for delivery status.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
