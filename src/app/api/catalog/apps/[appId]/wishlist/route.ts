import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;

  if (!appId || appId.includes(":")) {
    return NextResponse.json({ saved: false });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ saved: false });
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("app_id", appId)
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ saved: !error && Boolean(data) });
}
