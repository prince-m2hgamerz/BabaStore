export function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function appAccent(seed: string): string {
  const accents: readonly string[] = [
    "linear-gradient(135deg, #007cf0, #00dfd8)",
    "linear-gradient(135deg, #7928ca, #ff0080)",
    "linear-gradient(135deg, #ff4d4d, #f9cb28)",
    "linear-gradient(135deg, #171717, #4d4d4d)"
  ];
  const index = seed
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0) % accents.length;

  return accents[index]!;
}

export function lineItems(value: string | null | undefined) {
  return (value ?? "")
    .split(/\r?\n|•/)
    .map((line) => line.trim())
    .filter(Boolean);
}
