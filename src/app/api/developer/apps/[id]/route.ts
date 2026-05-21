import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { appUpdateSchema } from "@/lib/validators/developer";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
  const parsed = appUpdateSchema.safeParse({
    name: formData.get("name"),
    packageName: formData.get("packageName"),
    categoryId: formData.get("categoryId"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    tags: formData.get("tags") ?? "",
    privacyPolicyUrl: formData.get("privacyPolicyUrl") ?? "",
    iconUrl: formData.get("iconUrl") ?? "",
    screenshotUrls: formData.get("screenshotUrls") ?? "",
    status: formData.get("status")
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid app details." },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const supabase = await createClient();
  const { data: app, error: appError } = await supabase
    .from("apps")
    .select("id, developer_id")
    .eq("id", id)
    .single();

  if (appError || !app) {
    return NextResponse.json({ error: "App not found." }, { status: 404 });
  }

  if (app.developer_id !== profile.id && profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("apps")
    .update({
      category_id: input.categoryId,
      name: input.name,
      package_name: input.packageName,
      description: `${input.shortDescription}\n\n${input.description}`,
      tags: input.tags,
      privacy_policy_url: input.privacyPolicyUrl,
      icon_url: input.iconUrl,
      status: input.status,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("app_screenshots").delete().eq("app_id", id);

  if (input.screenshotUrls.length) {
    const { error: screenshotError } = await supabase
      .from("app_screenshots")
      .insert(
        input.screenshotUrls.map((imageUrl, index) => ({
          app_id: id,
          image_url: imageUrl,
          sort_order: index
        }))
      );

    if (screenshotError) {
      return NextResponse.json({ error: screenshotError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
