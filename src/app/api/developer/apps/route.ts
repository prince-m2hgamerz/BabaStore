import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { appMetadataSchema } from "@/lib/validators/developer";
import { notifyNewApp } from "@/lib/notifications/telegram";

export async function POST(request: NextRequest) {
  const { profile, missingEnv } = await getCurrentProfile();

  if (missingEnv) {
    return NextResponse.json(
      { error: "Supabase environment variables are missing." },
      { status: 503 }
    );
  }

  if (!profile || !["developer", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const parsed = appMetadataSchema.safeParse({
    name: formData.get("name"),
    packageName: formData.get("packageName"),
    versionName: formData.get("versionName"),
    versionCode: formData.get("versionCode") || undefined,
    categoryId: formData.get("categoryId"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    tags: formData.get("tags") ?? "",
    privacyPolicyUrl: formData.get("privacyPolicyUrl") ?? "",
    apkUrl: formData.get("apkUrl"),
    apkSize: formData.get("apkSize"),
    iconUrl: formData.get("iconUrl") ?? "",
    screenshotUrls: formData.get("screenshotUrls") ?? "",
    changelog: formData.get("changelog"),
    publishNow: formData.get("publishNow") === "on"
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid app details." },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const supabase = await createClient();
  const { data: existingApp } = await supabase
    .from("apps")
    .select("id")
    .eq("package_name", input.packageName)
    .maybeSingle();

  if (existingApp) {
    return NextResponse.json(
      { error: "An app with this package name already exists." },
      { status: 409 }
    );
  }

  const description = `${input.shortDescription}\n\n${input.description}`;

  // If the latest VirusTotal scan for this APK was "blocked", auto-route the
  // listing into the admin's flagged queue so they see the full scan report
  // alongside the listing details. The developer is NOT blocked from submitting.
  let initialStatus: "draft" | "published" | "flagged" =
    profile.role === "admin" && input.publishNow ? "published" : "draft";
  try {
    const { data: latestScan } = await supabase
      .from("upload_scans")
      .select("virus_total_status, r2_url")
      .eq("developer_id", profile.id)
      .eq("folder", "apks")
      .eq("r2_url", input.apkUrl)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestScan?.virus_total_status === "blocked") {
      initialStatus = "flagged";
    }
  } catch {
    // Best-effort — if scan lookup fails, fall back to the default status above.
  }

  const { data: app, error: appError } = await supabase
    .from("apps")
    .insert({
      developer_id: profile.id,
      category_id: input.categoryId,
      name: input.name,
      package_name: input.packageName,
      version: input.versionName,
      description,
      tags: input.tags,
      privacy_policy_url: input.privacyPolicyUrl,
      apk_url: input.apkUrl,
      icon_url: input.iconUrl,
      status: initialStatus
    })
    .select("id")
    .single();

  if (appError || !app) {
    return NextResponse.json(
      { error: appError?.message ?? "Unable to save app." },
      { status: 500 }
    );
  }

  const { error: versionError } = await supabase.from("app_versions").insert({
    app_id: app.id,
    version_name: input.versionName,
    version_code: input.versionCode ?? null,
    apk_url: input.apkUrl,
    apk_size: input.apkSize,
    changelog: input.changelog
  });

  if (versionError) {
    return NextResponse.json(
      { error: versionError.message },
      { status: 500 }
    );
  }

  if (input.screenshotUrls.length) {
    const { error: screenshotsError } = await supabase.from("app_screenshots").insert(
      input.screenshotUrls.map((imageUrl, index) => ({
        app_id: app.id,
        image_url: imageUrl,
        sort_order: index
      }))
    );

    if (screenshotsError) {
      return NextResponse.json(
        { error: screenshotsError.message },
        { status: 500 }
      );
    }
  }

  revalidateTag("catalog");
  notifyNewApp(input.name, profile.email ?? "Unknown");

  return NextResponse.json({ id: app.id });
}
