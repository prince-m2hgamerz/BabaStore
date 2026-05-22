import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;

  if (!appId || appId.includes(":")) {
    return NextResponse.json({ review: null });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ review: null });
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("rating, body, updated_at")
    .eq("app_id", appId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ review: null });
  }

  return NextResponse.json({ review: data });
}
