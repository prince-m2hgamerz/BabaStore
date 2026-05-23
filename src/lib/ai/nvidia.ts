const API_KEY = process.env.NVIDIA_API_KEY;
const BASE = "https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions";

export async function getNvidiaRecommendations(
  category: string,
  tags: string[]
): Promise<string[] | null> {
  if (!API_KEY) return null;

  try {
    const response = await fetch(
      `${BASE}/meta/llama-3.1-8b-instruct`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Suggest 3 Android apps in the "${category}" category with tags: ${tags.join(", ")}. Return only app names as a comma-separated list, no extra text.`
            }
          ],
          temperature: 0.7,
          max_tokens: 100
        })
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    return text
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean)
      .slice(0, 3);
  } catch {
    return null;
  }
}

export async function getNvidiaAssistantResponse(
  prompt: string
): Promise<string | null> {
  if (!API_KEY) return null;

  try {
    const response = await fetch(
      `${BASE}/meta/llama-3.1-8b-instruct`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 200
        })
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}
