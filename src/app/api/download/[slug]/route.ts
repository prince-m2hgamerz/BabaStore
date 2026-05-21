import { NextResponse, type NextRequest } from "next/server";
import { getCatalogApp } from "@/lib/catalog/catalog";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const app = await getCatalogApp(slug);

  if (!app) {
    return NextResponse.json({ error: "App not found" }, { status: 404 });
  }

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !app.id.startsWith("seed-")
  ) {
    try {
      const supabase = await createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      await supabase.from("downloads").insert({
        app_id: app.id,
        user_id: user?.id ?? null,
        user_agent: request.headers.get("user-agent")
      });
    } catch {
      // Download logging should not block a user from receiving the APK.
    }
  }

  if (!app.apkUrl) {
    return NextResponse.json(
      { error: "No APK URL configured for this app yet." },
      { status: 409 }
    );
  }

  return NextResponse.redirect(app.apkUrl);
}

