import { NextResponse } from "next/server";
import { getAccountStatus, disconnectAccount } from "@/lib/telegram/user-client";

export async function GET() {
  const status = await getAccountStatus();
  return NextResponse.json({ ok: true, ...status });
}

export async function DELETE() {
  await disconnectAccount();
  return NextResponse.json({ ok: true });
}
