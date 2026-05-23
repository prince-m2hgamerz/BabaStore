import { NextResponse } from "next/server";
import { checkNewMessagesAndReply } from "@/lib/telegram/user-client";

export const maxDuration = 60;

export async function POST() {
  const result = await checkNewMessagesAndReply();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET() {
  const result = await checkNewMessagesAndReply();
  return NextResponse.json({ ok: true, ...result });
}
