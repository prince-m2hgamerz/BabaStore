import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");

  try {
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...rest] = trimmed.split("=");
      const value = rest.join("=").trim().replace(/^["']|["']$/g, "");
      process.env[key.trim()] ||= value;
    }
  } catch {
    // The script also works with environment variables supplied by the shell.
  }
}

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing.`);
  return value;
}

async function cloudflareFetch(accountId, token, path, init = {}) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  });
  const payload = await response.json().catch(() => ({ success: response.ok }));
  return { status: response.status, ...payload };
}

loadEnv();

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || required("CLOUDFLARE_ACCOUNT_ID");
const token = required("CLOUDFLARE_API_TOKEN");
const bucket = process.env.CLOUDFLARE_R2_BUCKET || "babastore-apps";
const storageClass = process.env.CLOUDFLARE_R2_STORAGE_CLASS || "Standard";

const existing = await cloudflareFetch(accountId, token, `/r2/buckets/${encodeURIComponent(bucket)}`);

if (existing.success) {
  console.log(`R2 bucket ready: ${bucket}`);
  process.exit(0);
}

const created = await cloudflareFetch(accountId, token, "/r2/buckets", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ name: bucket, storageClass })
});

if (!created.success && created.status !== 409) {
  const message = created.errors?.map((error) => error.message).join("; ") || "Cloudflare R2 bucket creation failed.";
  throw new Error(message);
}

console.log(`R2 bucket ready: ${bucket}`);
