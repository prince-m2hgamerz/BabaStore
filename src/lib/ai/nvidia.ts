const API_KEY = process.env.NVIDIA_API_KEY;
const BASE = "https://integrate.api.nvidia.com/v1";

async function nvidiaChatCompletion(body: Record<string, unknown>): Promise<string | null> {
  if (!API_KEY) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(`NVIDIA API error ${response.status}: ${text}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.error("NVIDIA API call failed:", err);
    return null;
  }
}

export async function getNvidiaRecommendations(
  category: string,
  tags: string[]
): Promise<string[] | null> {
  const text = await nvidiaChatCompletion({
    model: "meta/llama-3.1-8b-instruct",
    messages: [
      {
        role: "user",
        content: `Suggest 3 Android apps in the "${category}" category with tags: ${tags.join(", ")}. Return only app names as a comma-separated list, no extra text.`
      }
    ],
    temperature: 0.7,
    max_tokens: 100
  });

  if (!text) return null;
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export async function getNvidiaAssistantResponse(
  prompt: string
): Promise<string | null> {
  return nvidiaChatCompletion({
    model: "meta/llama-3.1-8b-instruct",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 200
  });
}

function generateFallbackReply(
  incoming: string,
  style: "concise" | "detailed" | "friendly" | "professional"
): string {
  const lower = incoming.toLowerCase();
  const hi = ["hi", "hello", "hey", "sup", "yo", "what's up"];
  const bye = ["bye", "goodbye", "see you", "cya", "later"];
  const how = ["how are you", "how's it", "how do you", "what's up"];
  const thx = ["thanks", "thank you", "ty", "thx", "appreciate"];
  const ok = ["ok", "okay", "k", "kk", "sure", "alright"];
  const help = ["help", "what can you", "what do you"];

  if (hi.some(w => lower.includes(w))) {
    if (style === "professional") return "Hello! How can I help you today?";
    if (style === "concise") return "Hey! What's up?";
    return "Hey there! How's it going?";
  }
  if (bye.some(w => lower.includes(w))) {
    if (style === "professional") return "Goodbye! Have a great day.";
    return "See ya! Take care.";
  }
  if (how.some(w => lower.includes(w))) {
    if (style === "concise") return "Doing great, thanks! You?";
    return "I'm doing great, thanks for asking! How about you?";
  }
  if (thx.some(w => lower.includes(w))) {
    if (style === "professional") return "You're welcome! Happy to help.";
    return "No problem! Anytime.";
  }
  if (ok.some(w => lower.includes(w))) {
    return "Cool, let me know if you need anything!";
  }
  if (help.some(w => lower.includes(w))) {
    return "I'm here to chat! What's on your mind?";
  }

  const fallbacks: Record<string, string[]> = {
    concise: ["Got it.", "Sure.", "Interesting!", "I see.", "Cool!"],
    detailed: ["That's interesting! Tell me more about it.", "I see what you mean. What do you think?", "Got it, thanks for sharing!"],
    friendly: ["That's awesome! Tell me more!", "Oh nice! How's that going?", "Haha, gotcha!", "Sounds good!"],
    professional: ["Thank you for sharing. I appreciate your input.", "Noted. Is there anything else I can help with?", "I understand. Let me know if you need further assistance."]
  };
  const list = (fallbacks[style] ?? fallbacks.friendly) as string[];
  return list[Math.floor(Math.random() * list.length)] ?? "Got it!";
}

export async function generateTelegramReply(params: {
  message: string;
  senderName?: string;
  replyStyle: "concise" | "detailed" | "friendly" | "professional";
  maxTokens: number;
  temperature: number;
  conversationHistory?: Array<{ text: string; isOutgoing: boolean }>;
}): Promise<string | null> {
  const styleGuide: Record<string, string> = {
    concise: "Keep replies short, direct, and under 2 sentences. Be helpful but brief.",
    detailed: "Provide thorough, well-structured replies with explanations and examples where relevant.",
    friendly: "Reply warmly and conversationally. Use a casual, approachable tone.",
    professional: "Reply in a formal, polished tone. Be precise and well-mannered."
  };

  let contextBlock = "";
  if (params.conversationHistory?.length) {
    const lines = params.conversationHistory
      .slice(-20)
      .map((m) => `${m.isOutgoing ? "[You]" : `[${params.senderName ?? "User"}]`}: ${m.text}`);
    contextBlock = "Conversation history (oldest to newest):\n" + lines.join("\n") + "\n\nLatest message to reply to:\n";
  }

  const systemPrompt = [
    "You are a real person chatting on Telegram. You reply as yourself, not as an assistant or AI.",
    "Never mention being an AI, bot, or assistant. Never explain yourself.",
    "Reply in the exact same language the other person is using.",
    "Keep replies very short — 1 to 2 sentences max. Be direct and human.",
    "Sound like a normal person texting a friend: casual, warm, to the point.",
    "Acknowledge what they said, then respond naturally. No fluff, no bullet points, no lists.",
    styleGuide[params.replyStyle] ?? styleGuide.friendly
  ].join("\n");

  const userContent = contextBlock
    ? contextBlock + params.message
    : params.message;

  const aiReply = await nvidiaChatCompletion({
    model: "meta/llama-3.1-8b-instruct",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ],
    temperature: params.temperature,
    max_tokens: Math.min(params.maxTokens, 80)
  });

  if (aiReply) return aiReply;

  return generateFallbackReply(params.message, params.replyStyle);
}
