import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { versionCreateSchema } from "@/lib/validators/developer";

export async function POST(
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
  const parsed = versionCreateSchema.safeParse({
    versionName: formData.get("versionName"),
    versionCode: formData.get("versionCode") || undefined,
    apkUrl: formData.get("apkUrl"),
    apkSize: formData.get("apkSize"),
    changelog: formData.get("changelog"),
    publishNow: formData.get("publishNow") === "on"
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid version details." },
      { status: 400 }
    );
  }

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

  const { error: versionError } = await supabase.from("app_versions").insert({
    app_id: id,
    version_name: parsed.data.versionName,
    version_code: parsed.data.versionCode ?? null,
    apk_url: parsed.data.apkUrl,
    apk_size: parsed.data.apkSize,
    changelog: parsed.data.changelog
  });

  if (versionError) {
    return NextResponse.json({ error: versionError.message }, { status: 500 });
  }

  const { error: appUpdateError } = await supabase
    .from("apps")
    .update({
      version: parsed.data.versionName,
      apk_url: parsed.data.apkUrl,
      status: parsed.data.publishNow ? "published" : "draft",
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (appUpdateError) {
    return NextResponse.json({ error: appUpdateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
