import { summarizeText, generateTags } from "./gemini";

export async function aiSummarize(
  text: string,
  maxLength?: number
): Promise<string | null> {
  return summarizeText(text, maxLength);
}

export async function aiGenerateTags(
  name: string,
  description: string
): Promise<string[]> {
  return generateTags(name, description);
}

export {
  summarizeText,
  generateTags,
  generateSmartSuggestions
} from "./gemini";

export {
  getNvidiaRecommendations,
  getNvidiaAssistantResponse
} from "./nvidia";
