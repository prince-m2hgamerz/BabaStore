"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  Loader2,
  PackagePlus,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  X
} from "lucide-react";
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
import { UploadProgressDialog, type UploadFolder } from "./upload-progress-dialog";
import { useUploadJobs, type CompletedAsset } from "./use-upload-jobs";

type Category = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "name" | "description"
>;

type Asset = {
  jobId: string;
  url: string;
  size: number;
  name: string;
  flagged?: boolean;
};

type FormDraft = {
  packageName: string;
  name: string;
  versionName: string;
  versionCode: string;
  shortDescription: string;
  description: string;
  selectedCategory: string;
  tags: string;
  privacyPolicyUrl: string;
  iconAsset: Asset | null;
  apkAsset: Asset | null;
  screenshotAssets: Asset[];
  changelog: string;
};

const DRAFT_KEY = "babastore.uploadDraft.v1";

function readDraft(): Partial<FormDraft> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<FormDraft>;
  } catch {
    return {};
  }
}

function persistDraft(draft: Partial<FormDraft>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function UploadForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  const [packageName, setPackageName] = useState("");
  const [name, setName] = useState("");
  const [versionName, setVersionName] = useState("");
  const [versionCode, setVersionCode] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id ?? "");
  const [tags, setTags] = useState("");
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState("");
  const [iconAsset, setIconAsset] = useState<Asset | null>(null);
  const [apkAsset, setApkAsset] = useState<Asset | null>(null);
  const [screenshotAssets, setScreenshotAssets] = useState<Asset[]>([]);
  const [changelog, setChangelog] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Hydrate from draft on first mount. localStorage isn't available on the server
  // so we have to sync state after mount; the lint warning is a false positive
  // (the file-level disable above handles it).
  useEffect(() => {
    const draft = readDraft();
    if (draft.packageName) setPackageName(draft.packageName);
    if (draft.name) setName(draft.name);
    if (draft.versionName) setVersionName(draft.versionName);
    if (draft.versionCode) setVersionCode(draft.versionCode);
    if (draft.shortDescription) setShortDescription(draft.shortDescription);
    if (draft.description) setDescription(draft.description);
    if (draft.selectedCategory) setSelectedCategory(draft.selectedCategory);
    if (draft.tags) setTags(draft.tags);
    if (draft.privacyPolicyUrl) setPrivacyPolicyUrl(draft.privacyPolicyUrl);
    if (draft.iconAsset) setIconAsset(draft.iconAsset);
    if (draft.apkAsset) setApkAsset(draft.apkAsset);
    if (draft.screenshotAssets) setScreenshotAssets(draft.screenshotAssets);
    if (draft.changelog) setChangelog(draft.changelog);
    setHydrated(true);
  }, []);

  // Persist draft whenever fields change (skip the first synthetic render)
  useEffect(() => {
    if (!hydrated) return;
    persistDraft({
      packageName,
      name,
      versionName,
      versionCode,
      shortDescription,
      description,
      selectedCategory,
      tags,
      privacyPolicyUrl,
      iconAsset,
      apkAsset,
      screenshotAssets,
      changelog
    });
  }, [
    hydrated,
    packageName,
    name,
    versionName,
    versionCode,
    shortDescription,
    description,
    selectedCategory,
    tags,
    privacyPolicyUrl,
    iconAsset,
    apkAsset,
    screenshotAssets,
    changelog
  ]);

  function handleAssetReady(asset: CompletedAsset) {
    if (asset.folder === "apks") {
      setApkAsset({
        jobId: asset.jobId,
        url: asset.publicUrl,
        size: asset.fileSize,
        name: asset.fileName,
        flagged: asset.flagged
      });
      toast({
        title: asset.flagged ? "APK uploaded — needs admin review" : "APK ready",
        description: asset.flagged
          ? "VirusTotal flagged this APK. You can still submit; an admin will review the full report."
          : "VirusTotal scan passed. Continue filling the listing.",
        variant: asset.flagged ? "destructive" : "default"
      });
    } else if (asset.folder === "icons") {
      setIconAsset({
        jobId: asset.jobId,
        url: asset.publicUrl,
        size: asset.fileSize,
        name: asset.fileName
      });
    } else {
      setScreenshotAssets((curr) => {
        if (curr.some((a) => a.jobId === asset.jobId)) return curr;
        return [
          ...curr,
          {
            jobId: asset.jobId,
            url: asset.publicUrl,
            size: asset.fileSize,
            name: asset.fileName
          }
        ].slice(0, 8);
      });
    }
  }

  const { jobs, open, setOpen, upload, retry } = useUploadJobs({
    onAssetReady: handleAssetReady
  });

  const category = categories.find((item) => item.id === selectedCategory);
  const tagList = useMemo(
    () => tags.split(",").map((t) => t.trim()).filter(Boolean),
    [tags]
  );

  function handleFiles(files: FileList | null, folder: UploadFolder) {
    if (!files || !files.length) return;
    if (!packageName) {
      toast({
        title: "Package name required",
        description: "Enter the Android package name first.",
        variant: "destructive"
      });
      return;
    }
    Array.from(files).forEach((file) => {
      upload(file, folder, packageName);
    });
  }

  function removeScreenshot(jobId: string) {
    setScreenshotAssets((curr) => curr.filter((s) => s.jobId !== jobId));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCategory) {
      toast({
        title: "Category required",
        description: "Choose a category before submitting.",
        variant: "destructive"
      });
      return;
    }
    if (!apkAsset) {
      toast({
        title: "APK required",
        description: "Upload an APK and wait for the VirusTotal scan to pass.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.set("categoryId", selectedCategory);
    formData.set("iconUrl", iconAsset?.url ?? "");
    formData.set(
      "screenshotUrls",
      screenshotAssets.map((item) => item.url).join("\n")
    );
    formData.set("apkUrl", apkAsset.url);
    formData.set("apkSize", String(apkAsset.size));

    try {
      const response = await fetch("/api/developer/apps", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !payload.id) {
        throw new Error(payload.error ?? "Unable to save app.");
      }
      clearDraft();
      toast({
        title: "Submitted for review",
        description:
          "Admins will review the listing shortly. You'll be notified by email."
      });
      router.push(`/developer/apps/${payload.id}`);
      router.refresh();
    } catch (error) {
      toast({
        title: "Save failed",
        description:
          error instanceof Error ? error.message : "Unable to save app.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Find any in-flight job for a folder so we can show a hint on the picker.
  const inFlight = (folder: UploadFolder) =>
    jobs.some(
      (j) => j.folder === folder && (j.status === "uploading" || j.status === "scanning" || j.status === "queued")
    );

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>App package</CardTitle>
              <CardDescription>
                This information becomes the public store listing after admin approval.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">App name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="packageName">Android package name</Label>
                  <Input
                    id="packageName"
                    name="packageName"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="com.company.app"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="versionName">Version name</Label>
                  <Input
                    id="versionName"
                    name="versionName"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    placeholder="1.0.0"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="versionCode">Version code</Label>
                  <Input
                    id="versionCode"
                    name="versionCode"
                    type="number"
                    min={1}
                    value={versionCode}
                    onChange={(e) => setVersionCode(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    required
                  >
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

              <div className="grid gap-1.5">
                <Label htmlFor="shortDescription">Short description</Label>
                <Input
                  id="shortDescription"
                  name="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  maxLength={240}
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="description">Full description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-44"
                  required
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="privacyPolicyUrl">Privacy policy URL</Label>
                  <Input
                    id="privacyPolicyUrl"
                    name="privacyPolicyUrl"
                    type="url"
                    value={privacyPolicyUrl}
                    onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Release files</CardTitle>
              <CardDescription>
                APKs are scanned by VirusTotal for malicious behaviour. Images are stored directly in R2.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-3">
                <FilePicker
                  label="APK file"
                  accept=".apk,application/vnd.android.package-archive,application/octet-stream"
                  inFlight={inFlight("apks")}
                  asset={apkAsset}
                  onPick={(files) => handleFiles(files, "apks")}
                />
                <FilePicker
                  label="App icon"
                  accept="image/png,image/jpeg,image/webp"
                  inFlight={inFlight("icons")}
                  asset={iconAsset}
                  onPick={(files) => handleFiles(files, "icons")}
                />
                <FilePicker
                  label={`Screenshots (${screenshotAssets.length}/8)`}
                  accept="image/png,image/jpeg,image/webp"
                  inFlight={inFlight("screenshots")}
                  asset={null}
                  multiple
                  onPick={(files) => handleFiles(files, "screenshots")}
                />
              </div>

              {screenshotAssets.length ? (
                <div className="flex flex-wrap gap-2">
                  {screenshotAssets.map((s) => (
                    <div
                      key={s.jobId}
                      className="group relative size-20 overflow-hidden rounded-md border border-neutral-200 bg-canvas-soft"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.url}
                        alt={s.name}
                        className="size-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(s.jobId)}
                        className="absolute right-1 top-1 hidden size-5 items-center justify-center rounded-full bg-neutral-950/80 text-white group-hover:flex"
                        aria-label="Remove screenshot"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-1.5">
                <Label htmlFor="changelog">Release notes</Label>
                <Textarea
                  id="changelog"
                  name="changelog"
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="grid h-fit gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <Eye className="size-4" />
                Preview
              </CardTitle>
              <CardDescription>Live preview of the listing card.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-lg border border-neutral-200 bg-white p-3 sm:p-4">
                <div className="flex gap-3">
                  <div
                    className="grid size-14 shrink-0 place-items-center squircle bg-neutral-950 text-lg font-semibold text-white"
                    style={
                      iconAsset
                        ? {
                            backgroundImage: `url("${iconAsset.url}")`,
                            backgroundSize: "cover"
                          }
                        : undefined
                    }
                  >
                    {!iconAsset ? (name || "A").slice(0, 1) : ""}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-neutral-950">
                      {name || "App name"}
                    </h3>
                    <p className="truncate text-xs text-neutral-500">
                      {category?.name ?? "Category"}
                    </p>
                    <p className="mt-2 line-clamp-3 text-[13px] leading-5 text-neutral-600">
                      {shortDescription ||
                        description ||
                        "Enter listing content to preview."}
                    </p>
                  </div>
                </div>
                {tagList.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tagList.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-2 text-[13px]">
                <Row label="APK" value={apkAsset?.name ?? "Not uploaded"} ok={!!apkAsset} />
                <Row label="Icon" value={iconAsset?.name ?? "Not uploaded"} ok={!!iconAsset} />
                <Row
                  label="Screenshots"
                  value={`${screenshotAssets.length} / 8`}
                  ok={screenshotAssets.length > 0}
                />
                <Row label="Version" value={versionName || "Not set"} ok={!!versionName} />
              </div>

              {apkAsset?.flagged ? (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[12px] leading-5 text-amber-900">
                  <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    <strong className="font-semibold">VirusTotal flagged this APK.</strong>{" "}
                    You can still submit. The full scan report will be attached
                    and an admin will review it before approving.
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-[12px] leading-5 text-blue-900">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    Apps are reviewed by an admin before going live. You can
                    refresh this page during a long upload — it resumes automatically.
                  </span>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting || !apkAsset || !selectedCategory}
                className="w-full rounded-full"
              >
                {submitting ? <Loader2 className="animate-spin" /> : <PackagePlus />}
                {apkAsset?.flagged ? "Submit anyway for admin review" : "Submit for review"}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </form>

      <UploadProgressDialog
        open={open}
        jobs={jobs}
        onClose={() => setOpen(false)}
        onRetry={retry}
      />
    </>
  );
}

function FilePicker({
  label,
  accept,
  multiple = false,
  asset,
  inFlight,
  onPick
}: {
  label: string;
  accept: string;
  multiple?: boolean;
  asset: Asset | null;
  inFlight: boolean;
  onPick: (files: FileList | null) => void;
}) {
  const flagged = !!asset?.flagged;
  const borderClass = flagged
    ? "border-amber-300 bg-amber-50"
    : "border-neutral-300 bg-canvas-soft hover:border-neutral-950";
  return (
    <label
      className={`grid min-h-28 cursor-pointer place-items-center rounded-lg border border-dashed p-4 text-center transition ${borderClass}`}
    >
      <input
        className="sr-only"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => {
          onPick(event.target.files);
          event.target.value = "";
        }}
      />
      <span className="grid gap-2 text-[13px] text-neutral-700">
        {inFlight ? (
          <Loader2 className="mx-auto size-5 animate-spin text-neutral-950" />
        ) : flagged ? (
          <ShieldAlert className="mx-auto size-5 text-amber-600" />
        ) : asset ? (
          <CheckCircle2 className="mx-auto size-5 text-emerald-600" />
        ) : (
          <UploadCloud className="mx-auto size-5 text-neutral-950" />
        )}
        <span className="font-medium">{label}</span>
        {asset ? (
          <>
            <span className="block truncate text-[11px] text-neutral-500">
              {asset.name}
            </span>
            {flagged ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-amber-800">
                <ShieldAlert className="size-2.5" />
                Needs admin review
              </span>
            ) : null}
          </>
        ) : null}
      </span>
    </label>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-neutral-100 pb-2 last:border-0 last:pb-0">
      <span className="text-neutral-500">{label}</span>
      <span
        className={`min-w-0 truncate text-right ${ok ? "text-neutral-950" : "text-neutral-400"}`}
      >
        {value}
      </span>
    </div>
  );
}
