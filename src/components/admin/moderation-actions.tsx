"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import type { AppStatus } from "@/lib/supabase/types";

type Props = {
  appId: string;
  appName: string;
  currentStatus: AppStatus;
  onModerate: (
    appId: string,
    status: AppStatus,
    reason?: string
  ) => Promise<{ ok: boolean; error?: string }>;
};

export function ModerationActions({ appId, appName, currentStatus, onModerate }: Props) {
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<{ status: AppStatus; reason: string } | null>(
    null
  );

  function run(status: AppStatus, reason?: string) {
    startTransition(async () => {
      const result = await onModerate(appId, status, reason);
      if (result.ok) {
        toast({
          title: `${appName} ${labelFor(status)}`,
          description:
            status === "rejected"
              ? "Developer notified with the rejection reason."
              : "Developer has been notified."
        });
        setConfirm(null);
      } else {
        toast({
          title: "Action failed",
          description: result.error ?? "Unable to update app status.",
          variant: "destructive"
        });
      }
    });
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={pending || currentStatus === "published"}
          onClick={() => run("published")}
          className="rounded-full"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 />}
          Approve & publish
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={pending || currentStatus === "flagged"}
          onClick={() => run("flagged")}
          className="rounded-full"
        >
          <AlertTriangle />
          Flag
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={pending || currentStatus === "draft"}
          onClick={() => run("draft")}
          className="rounded-full"
        >
          <Clock3 />
          Return to draft
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending || currentStatus === "rejected"}
          onClick={() => setConfirm({ status: "rejected", reason: "" })}
          className="rounded-full"
        >
          <XCircle />
          Reject
        </Button>
      </div>

      {confirm ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-[13px] font-semibold text-red-900">
            Reject {appName}?
          </p>
          <p className="mt-0.5 text-[12px] text-red-700">
            This message is emailed to the developer.
          </p>
          <div className="mt-3 grid gap-2">
            <Label htmlFor="rejection-reason" className="text-[12px] text-red-900">
              Reason (required)
            </Label>
            <Textarea
              id="rejection-reason"
              value={confirm.reason}
              onChange={(e) =>
                setConfirm((c) => (c ? { ...c, reason: e.target.value } : c))
              }
              rows={3}
              maxLength={1000}
              placeholder="e.g. Privacy policy URL is not reachable. Screenshots don't match the actual app."
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="destructive"
                disabled={!confirm.reason.trim() || pending}
                onClick={() => run("rejected", confirm.reason.trim())}
                className="rounded-full"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <XCircle />}
                Confirm reject
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirm(null)}
                disabled={pending}
                className="rounded-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function labelFor(status: AppStatus) {
  switch (status) {
    case "published":
      return "approved & published";
    case "rejected":
      return "rejected";
    case "flagged":
      return "flagged";
    default:
      return "returned to draft";
  }
}
