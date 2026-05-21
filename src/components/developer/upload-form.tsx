"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, Loader2, PackagePlus, UploadCloud } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

type Category = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "name" | "description"
>;

type UploadedFile = {
  url: string;
  size: number;
  name: string;
};

function defaultApkContentType(file: File) {
  return file.type || "application/vnd.android.package-archive";
}

async function uploadWithPresign({
  file,
  folder,
  packageName
}: {
  file: File;
  folder: "apks" | "icons" | "screenshots";
  packageName: string;
}) {
  const response = await fetch("/api/developer/uploads/presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: folder === "apks" ? defaultApkContentType(file) : file.type,
      folder,
      packageName
    })
  });

  const payload = (await response.json()) as {
    uploadUrl?: string;
    publicUrl?: string;
    error?: string;
  };

  if (!response.ok || !payload.uploadUrl || !payload.publicUrl) {
    throw new Error(payload.error ?? "Unable to prepare file upload.");
  }

  const uploadResponse = await fetch(payload.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": folder === "apks" ? defaultApkContentType(file) : file.type
    },
    body: file
  });

  if (!uploadResponse.ok) {
    throw new Error("Cloudflare R2 rejected the file upload.");
  }

  return {
    url: payload.publicUrl,
    size: file.size,
    name: file.name
  };
}

export function UploadForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [packageName, setPackageName] = useState("");
  const [name, setName] = useState("");
  const [versionName, setVersionName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id ?? "");
  const [tags, setTags] = useState("");
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [apk, setApk] = useState<UploadedFile | null>(null);
  const [screenshots, setScreenshots] = useState<UploadedFile[]>([]);
  const [changelog, setChangelog] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [publishNow, setPublishNow] = useState(false);

  const category = categories.find((item) => item.id === selectedCategory);
  const tagList = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags]
  );

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    folder: "apks" | "icons" | "screenshots"
  ) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    if (!packageName) {
      toast({
        title: "Package name required",
        description: "Enter the Android package name before uploading files.",
        variant: "destructive"
      });
      event.target.value = "";
      return;
    }

    try {
      setUploading(folder);
      const uploads = await Promise.all(
        files.map((file) => uploadWithPresign({ file, folder, packageName }))
      );

      if (folder === "apks") {
        setApk(uploads[0] ?? null);
      }

      if (folder === "icons") {
        setIconUrl(uploads[0]?.url ?? "");
      }

      if (folder === "screenshots") {
        setScreenshots((current) => [...current, ...uploads].slice(0, 8));
      }

      toast({
        title: "Upload complete",
        description: `${uploads.length} file${uploads.length === 1 ? "" : "s"} uploaded.`
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to upload file.",
        variant: "destructive"
      });
    } finally {
      setUploading(null);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    formData.set("categoryId", selectedCategory);
    formData.set("iconUrl", iconUrl);
    formData.set("screenshotUrls", screenshots.map((item) => item.url).join("\n"));
    formData.set("shortDescription", shortDescription);
    formData.set("description", description);
    formData.set("tags", tags);
    formData.set("privacyPolicyUrl", privacyPolicyUrl);
    formData.set("name", name);
    formData.set("packageName", packageName);
    formData.set("versionName", versionName);
    formData.set("changelog", changelog);

    if (apk) {
      formData.set("apkUrl", apk.url);
      formData.set("apkSize", String(apk.size));
    }

    if (publishNow) {
      formData.set("publishNow", "on");
    }

    try {
      const response = await fetch("/api/developer/apps", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json()) as { id?: string; error?: string };

      if (!response.ok || !payload.id) {
        throw new Error(payload.error ?? "Unable to save app.");
      }

      toast({
        title: "App saved",
        description: publishNow ? "The app is published." : "The app is saved as a draft."
      });
      router.push(`/developer/apps/${payload.id}`);
      router.refresh();
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unable to save app.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid gap-5">
        <Card>
          <CardHeader>
            <CardTitle>App package</CardTitle>
            <CardDescription>
              This information becomes the public store listing after publishing.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">App name</Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="packageName">Android package name</Label>
                <Input
                  id="packageName"
                  name="packageName"
                  value={packageName}
                  onChange={(event) => setPackageName(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="versionName">Version name</Label>
                <Input
                  id="versionName"
                  name="versionName"
                  value={versionName}
                  onChange={(event) => setVersionName(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="versionCode">Version code</Label>
                <Input id="versionCode" name="versionCode" type="number" min={1} />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="shortDescription">Short description</Label>
              <Input
                id="shortDescription"
                name="shortDescription"
                value={shortDescription}
                onChange={(event) => setShortDescription(event.target.value)}
                maxLength={240}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Full description</Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-44"
                required
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="privacyPolicyUrl">Privacy policy URL</Label>
                <Input
                  id="privacyPolicyUrl"
                  name="privacyPolicyUrl"
                  type="url"
                  value={privacyPolicyUrl}
                  onChange={(event) => setPrivacyPolicyUrl(event.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Release files</CardTitle>
            <CardDescription>
              APK files, icons, and screenshots upload directly to Cloudflare R2.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="grid min-h-28 cursor-pointer place-items-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center transition hover:border-neutral-950">
                <input
                  className="sr-only"
                  type="file"
                  accept=".apk,application/vnd.android.package-archive,application/octet-stream"
                  onChange={(event) => handleFileUpload(event, "apks")}
                />
                <span className="grid gap-2 text-sm text-neutral-600">
                  {uploading === "apks" ? (
                    <Loader2 className="mx-auto size-5 animate-spin text-neutral-950" />
                  ) : apk ? (
                    <CheckCircle2 className="mx-auto size-5 text-blue-600" />
                  ) : (
                    <UploadCloud className="mx-auto size-5 text-neutral-950" />
                  )}
                  APK file
                </span>
              </label>

              <label className="grid min-h-28 cursor-pointer place-items-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center transition hover:border-neutral-950">
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => handleFileUpload(event, "icons")}
                />
                <span className="grid gap-2 text-sm text-neutral-600">
                  {uploading === "icons" ? (
                    <Loader2 className="mx-auto size-5 animate-spin text-neutral-950" />
                  ) : iconUrl ? (
                    <CheckCircle2 className="mx-auto size-5 text-blue-600" />
                  ) : (
                    <UploadCloud className="mx-auto size-5 text-neutral-950" />
                  )}
                  Icon image
                </span>
              </label>

              <label className="grid min-h-28 cursor-pointer place-items-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center transition hover:border-neutral-950">
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={(event) => handleFileUpload(event, "screenshots")}
                />
                <span className="grid gap-2 text-sm text-neutral-600">
                  {uploading === "screenshots" ? (
                    <Loader2 className="mx-auto size-5 animate-spin text-neutral-950" />
                  ) : screenshots.length ? (
                    <CheckCircle2 className="mx-auto size-5 text-blue-600" />
                  ) : (
                    <UploadCloud className="mx-auto size-5 text-neutral-950" />
                  )}
                  Screenshots
                </span>
              </label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="changelog">Release notes</Label>
              <Textarea
                id="changelog"
                name="changelog"
                value={changelog}
                onChange={(event) => setChangelog(event.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="grid h-fit gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="size-5" />
              Preview
            </CardTitle>
            <CardDescription>
              This preview uses the data currently entered in the form.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-md border border-neutral-200 bg-white p-4">
              <div className="flex gap-3">
                <div className="grid size-14 shrink-0 place-items-center rounded-md bg-neutral-950 text-lg font-semibold text-white">
                  {(name || "A").slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-neutral-950">
                    {name || "App name"}
                  </h3>
                  <p className="truncate text-xs text-neutral-500">
                    {category?.name ?? "Category"}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm leading-5 text-neutral-600">
                  {shortDescription || description || "Enter listing content to preview the app card."}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {tagList.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">APK</span>
                <span className="truncate text-neutral-950">{apk?.name ?? "Not uploaded"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">Screenshots</span>
                <span className="text-neutral-950">{screenshots.length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">Version</span>
                <span className="text-neutral-950">{versionName || "Not set"}</span>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(event) => setPublishNow(event.target.checked)}
                className="mt-1"
              />
              <span>
                Publish immediately after saving. Leave unchecked to keep this app as a draft.
              </span>
            </label>

            <Button type="submit" disabled={submitting || uploading !== null} className="w-full">
              {submitting ? <Loader2 className="animate-spin" /> : <PackagePlus />}
              Save app
            </Button>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
