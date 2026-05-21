"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import type { DeveloperAppDetail } from "@/lib/developer/developer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

type Category = Pick<Database["public"]["Tables"]["categories"]["Row"], "id" | "name">;

function splitDescription(description: string | null) {
  const parts = (description ?? "").split(/\n\s*\n/);
  return {
    shortDescription: parts[0] ?? "",
    description: parts.slice(1).join("\n\n") || parts[0] || ""
  };
}

export function AppEditor({
  app,
  categories
}: {
  app: DeveloperAppDetail;
  categories: Category[];
}) {
  const router = useRouter();
  const initialDescription = useMemo(() => splitDescription(app.description), [app.description]);
  const [submitting, setSubmitting] = useState(false);
  const [categoryId, setCategoryId] = useState(app.categoryId ?? categories[0]?.id ?? "");
  const [status, setStatus] = useState(app.status);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    formData.set("categoryId", categoryId);
    formData.set("status", status);

    try {
      const response = await fetch(`/api/developer/apps/${app.id}`, {
        method: "PUT",
        body: formData
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update app.");
      }

      toast({
        title: "App updated",
        description: "The store listing has been saved."
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unable to update app.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listing metadata</CardTitle>
        <CardDescription>
          Changes here update the developer preview and public listing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">App name</Label>
              <Input id="name" name="name" defaultValue={app.name} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="packageName">Package name</Label>
              <Input id="packageName" name="packageName" defaultValue={app.packageName} required />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="shortDescription">Short description</Label>
            <Input
              id="shortDescription"
              name="shortDescription"
              defaultValue={initialDescription.shortDescription}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Full description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialDescription.description}
              className="min-h-40"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" defaultValue={app.tags.join(", ")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="privacyPolicyUrl">Privacy policy URL</Label>
              <Input
                id="privacyPolicyUrl"
                name="privacyPolicyUrl"
                type="url"
                defaultValue={app.privacyPolicyUrl ?? ""}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="iconUrl">Icon URL</Label>
              <Input id="iconUrl" name="iconUrl" type="url" defaultValue={app.iconUrl ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="screenshotUrls">Screenshot URLs</Label>
              <Textarea
                id="screenshotUrls"
                name="screenshotUrls"
                defaultValue={app.screenshotsUrls.join("\n")}
                className="min-h-20"
              />
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full sm:w-fit">
            {submitting ? <Loader2 className="animate-spin" /> : <Save />}
            Save listing
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
