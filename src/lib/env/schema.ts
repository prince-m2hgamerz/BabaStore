import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),

  VIRUSTOTAL_API_KEY: z.string().min(1).optional(),

  CLOUDFLARE_API_TOKEN: z.string().min(1).optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1).optional(),
  CLOUDFLARE_R2_BUCKET: z.string().default("babastore-apps"),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().url().optional(),
  CLOUDFLARE_R2_ENABLE_PUBLIC_ACCESS: z.string().default("true"),

  R2_API_TOKEN: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_S3_URL: z.string().url().optional(),

  NVIDIA_API_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),

  APTOIDE_API_KEY: z.string().min(1).optional(),

  VITE_ADMIN_EMAIL: z.string().email().optional(),
  VITE_TELEGRAM_BOT_TOKEN: z.string().optional(),
  VITE_TELEGRAM_ADMIN_CHAT_ID: z.string().optional(),

  BABASTORE_FEED_SEARCH_URL: z.string().url().optional(),
  BABASTORE_FEED_META_URL: z.string().url().optional()
});

export type Env = z.infer<typeof envSchema>;

let _parsed: Env | null = null;

export function getEnv(): Env {
  if (_parsed) return _parsed;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .filter((i) => i.code === "invalid_type")
      .map((i) => i.path.join("."));

    if (missing.length) {
      console.warn(`[env] Missing optional variables: ${missing.join(", ")}`);
    }

    _parsed = result.data as unknown as Env;
  } else {
    _parsed = result.data;
  }

  return _parsed;
}

export function requireEnv(key: keyof Env): string {
  const val = getEnv()[key];
  if (!val) {
    throw new Error(`Required environment variable ${String(key)} is not set`);
  }
  return val as string;
}
