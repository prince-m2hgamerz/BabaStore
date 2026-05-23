import { NextResponse, type NextRequest } from "next/server";
import { aiSummarize, aiGenerateTags } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { text, action } = body as {
    text?: string;
    action?: "summarize" | "tags";
  };

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  if (action === "tags") {
    const name = (body.name as string) ?? "";
    const tags = await aiGenerateTags(name, text);
    return NextResponse.json({ tags });
  }

  const summary = await aiSummarize(text);
  return NextResponse.json({ summary });
}
