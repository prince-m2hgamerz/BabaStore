import { NextResponse } from "next/server";
import { verifyAuthCode } from "@/lib/telegram/user-client";

export async function POST(request: Request) {
  try {
    const { code, password } = await request.json();
    if (!code) {
      return NextResponse.json({ ok: false, error: "Verification code required." }, { status: 400 });
    }

    const result = await verifyAuthCode(code, password);
    if (!result.ok) {
      if (result.error === "2FA_PASSWORD_REQUIRED") {
        return NextResponse.json({ ok: false, error: "2FA_PASSWORD_REQUIRED", requirePassword: true }, { status: 400 });
      }
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }
}
