import { NextResponse } from "next/server";
import { checkNewMessagesAndReply } from "@/lib/telegram/user-client";

export const maxDuration = 60;

export async function POST() {
  const start = Date.now();
  const result = await checkNewMessagesAndReply();
  console.log(`[check-messages] ${Date.now() - start}ms:`, JSON.stringify(result));
  return NextResponse.json({ ok: true, elapsed: Date.now() - start, ...result });
}

export async function GET() {
  const start = Date.now();
  const result = await checkNewMessagesAndReply();
  console.log(`[check-messages] ${Date.now() - start}ms:`, JSON.stringify(result));
  return NextResponse.json({ ok: true, elapsed: Date.now() - start, ...result });
}
