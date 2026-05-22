"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export function DeleteAppCard({
  appId,
  appName
}: {
  appId: string;
  appName: string;
}) {
  const router = useRouter();
  const [confirmName, setConfirmName] = useState("");
  const [pending, setPending] = useState(false);
  const confirmed = confirmName.trim() === appName;

  async function deleteApp() {
    if (!confirmed) {
      return;
    }

    setPending(true);

    try {
      const response = await fetch(`/api/developer/apps/${appId}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete app.");
      }

      toast({
        title: "App deleted",
        description: `${appName} has been removed from your developer inventory.`
      });
      router.push("/developer/apps");
      router.refresh();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unable to delete app.",
        variant: "destructive"
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-red-200 bg-red-50/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-950">
          <Trash2 className="size-5" />
          Danger zone
        </CardTitle>
        <CardDescription>
          Delete this app, versions, screenshots, reviews, and download records.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="confirm-delete">Type the app name to confirm</Label>
          <Input
            id="confirm-delete"
            value={confirmName}
            onChange={(event) => setConfirmName(event.target.value)}
            placeholder={appName}
            autoComplete="off"
          />
        </div>
        <Button
          type="button"
          variant="destructive"
          disabled={!confirmed || pending}
          onClick={deleteApp}
          className="w-full"
        >
          {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
          Delete app
        </Button>
      </CardContent>
    </Card>
  );
}
