import { NextResponse } from "next/server";
import { sendAuthCode } from "@/lib/telegram/user-client";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ ok: false, error: "Phone number required." }, { status: 400 });
    }

    const result = await sendAuthCode(phone);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }
}
