import { z } from "zod";

export const androidPackageSchema = z
  .string()
  .min(5, "Enter a valid Android package name.")
  .max(160, "Package name is too long.")
  .regex(
    /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/,
    "Use a reverse-domain package name such as com.company.app."
  );

export const appMetadataSchema = z.object({
  name: z.string().min(2, "App name must be at least 2 characters.").max(80),
  packageName: androidPackageSchema,
  versionName: z.string().min(1, "Version name is required.").max(40),
  versionCode: z.coerce.number().int().positive().optional(),
  categoryId: z.string().uuid("Choose a category."),
  shortDescription: z.string().min(24, "Write at least 24 characters.").max(240),
  description: z.string().min(80, "Write at least 80 characters.").max(6000),
  tags: z
    .string()
    .max(240)
    .transform((value) =>
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 10)
    ),
  privacyPolicyUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .pipe(z.string().url("Enter a valid privacy policy URL.").nullable()),
  apkUrl: z.string().url("Upload a valid APK file first."),
  apkSize: z.coerce.number().int().positive("Upload a valid APK file first."),
  iconUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .pipe(z.string().url("Icon URL must be valid.").nullable()),
  screenshotUrls: z
    .string()
    .max(4000)
    .transform((value) =>
      value
        .split(/\r?\n|,/)
        .map((url) => url.trim())
        .filter(Boolean)
    )
    .pipe(z.array(z.string().url("Screenshot URLs must be valid.")).max(8)),
  changelog: z.string().min(10, "Write release notes for this version.").max(2000),
  publishNow: z.coerce.boolean().default(false)
});

export const appUpdateSchema = appMetadataSchema
  .omit({
    apkUrl: true,
    apkSize: true,
    changelog: true,
    versionCode: true,
    versionName: true,
    publishNow: true
  })
  .extend({
    status: z.enum(["draft", "published", "rejected", "flagged"])
  });

export const versionCreateSchema = z.object({
  versionName: z.string().min(1, "Version name is required.").max(40),
  versionCode: z.coerce.number().int().positive().optional(),
  apkUrl: z.string().url("Upload a valid APK file first."),
  apkSize: z.coerce.number().int().positive("Upload a valid APK file first."),
  changelog: z.string().min(10, "Write release notes for this version.").max(2000),
  publishNow: z.coerce.boolean().default(false)
});

export type AppMetadataInput = z.infer<typeof appMetadataSchema>;
export type AppUpdateInput = z.infer<typeof appUpdateSchema>;
export type VersionCreateInput = z.infer<typeof versionCreateSchema>;
