"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, PackagePlus, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

type UploadedApk = {
  url: string;
  size: number;
  name: string;
};

async function uploadApk(file: File, packageName: string) {
  const contentType = file.type || "application/vnd.android.package-archive";
  const response = await fetch("/api/developer/uploads/presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType,
      folder: "apks",
      packageName
    })
  });
  const payload = (await response.json()) as {
    uploadUrl?: string;
    publicUrl?: string;
    error?: string;
  };

  if (!response.ok || !payload.uploadUrl || !payload.publicUrl) {
    throw new Error(payload.error ?? "Unable to prepare APK upload.");
  }

  const uploadResponse = await fetch(payload.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType
    },
    body: file
  });

  if (!uploadResponse.ok) {
    throw new Error("Cloudflare R2 rejected the APK upload.");
  }

  return {
    url: payload.publicUrl,
    size: file.size,
    name: file.name
  };
}

export function VersionForm({
  appId,
  packageName
}: {
  appId: string;
  packageName: string;
}) {
  const router = useRouter();
  const [apk, setApk] = useState<UploadedApk | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const uploaded = await uploadApk(file, packageName);
      setApk(uploaded);
      toast({
        title: "APK uploaded",
        description: uploaded.name
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to upload APK.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    if (apk) {
      formData.set("apkUrl", apk.url);
      formData.set("apkSize", String(apk.size));
    }

    try {
      const response = await fetch(`/api/developer/apps/${appId}/versions`, {
        method: "POST",
        body: formData
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save version.");
      }

      toast({
        title: "Version saved",
        description: "The latest APK has been added to this app."
      });
      setApk(null);
      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unable to save version.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add version</CardTitle>
        <CardDescription>
          Upload a new APK and save version notes for this app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="versionName">Version name</Label>
              <Input id="versionName" name="versionName" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="versionCode">Version code</Label>
              <Input id="versionCode" name="versionCode" type="number" min={1} />
            </div>
          </div>

          <label className="grid min-h-28 cursor-pointer place-items-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center transition hover:border-neutral-950">
            <input
              className="sr-only"
              type="file"
              accept=".apk,application/vnd.android.package-archive,application/octet-stream"
              onChange={handleUpload}
            />
            <span className="grid gap-2 text-sm text-neutral-600">
              {uploading ? (
                <Loader2 className="mx-auto size-5 animate-spin text-neutral-950" />
              ) : apk ? (
                <CheckCircle2 className="mx-auto size-5 text-blue-600" />
              ) : (
                <UploadCloud className="mx-auto size-5 text-neutral-950" />
              )}
              {apk?.name ?? "Upload APK"}
            </span>
          </label>

          <div className="grid gap-2">
            <Label htmlFor="changelog">Release notes</Label>
            <Textarea id="changelog" name="changelog" required />
          </div>

          <label className="flex items-start gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
            <input type="checkbox" name="publishNow" className="mt-1" />
            <span>Publish this version immediately.</span>
          </label>

          <Button type="submit" disabled={submitting || uploading} className="w-full sm:w-fit">
            {submitting ? <Loader2 className="animate-spin" /> : <PackagePlus />}
            Add version
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
