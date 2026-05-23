import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

function getClient() {
  if (!API_KEY) return null;
  return new GoogleGenerativeAI(API_KEY);
}

export async function summarizeText(
  text: string,
  maxLength = 150
): Promise<string | null> {
  const genAI = getClient();
  if (!genAI || !text.trim()) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(
      `Summarize this in at most ${maxLength} characters. Only return the summary, no extra text:\n\n${text.slice(0, 2000)}`
    );
    return result.response.text().trim().slice(0, maxLength) || null;
  } catch {
    return null;
  }
}

export async function generateTags(
  name: string,
  description: string
): Promise<string[]> {
  const genAI = getClient();
  if (!genAI || !description.trim()) return [];

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(
      `Generate 3-5 relevant tags for an Android app called "${name}" with this description. Return ONLY a comma-separated list of tags, no numbering or extra text:\n\n${description.slice(0, 1500)}`
    );
    const text = result.response.text().trim();
    return text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 5);
  } catch {
    return [];
  }
}

export async function generateSmartSuggestions(
  query: string
): Promise<string[]> {
  const genAI = getClient();
  if (!genAI || query.length < 2) return [];

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(
      `Generate 5 search suggestions for Android app store for the query "${query}". Return ONLY a comma-separated list.`
    );
    const text = result.response.text().trim();
    return text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 5);
  } catch {
    return [];
  }
}
