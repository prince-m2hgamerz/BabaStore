import { createHash, createHmac, randomUUID } from "node:crypto";

const uploadableTypes = new Set([
  "application/vnd.android.package-archive",
  "application/zip",
  "application/octet-stream",
  "image/png",
  "image/jpeg",
  "image/webp"
]);

function r2Env() {
  return {
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID ?? process.env.CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    bucket: process.env.CLOUDFLARE_R2_BUCKET ?? "babastore-apps",
    publicBaseUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    storageClass: process.env.CLOUDFLARE_R2_STORAGE_CLASS ?? "Standard"
  };
}

export function isR2Ready() {
  const env = r2Env();

  const canUseCloudflareApi = Boolean(env.accountId && env.apiToken && env.bucket);
  const canUseS3Presign = Boolean(
    env.accountId && env.accessKeyId && env.secretAccessKey && env.bucket && env.publicBaseUrl
  );

  return canUseCloudflareApi || canUseS3Presign;
}

export function isR2ApiReady() {
  const env = r2Env();
  return Boolean(env.accountId && env.apiToken && env.bucket);
}

export function isR2PresignReady() {
  const env = r2Env();
  return Boolean(
    env.accountId && env.accessKeyId && env.secretAccessKey && env.bucket && env.publicBaseUrl
  );
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value, "utf8").digest();
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function awsEncode(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function normalizeFileName(value: string) {
  const fallback = "upload";
  const base = value.split(/[\\/]/).pop() ?? fallback;
  const cleaned = base
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || fallback;
}

function extensionFor(contentType: string, fileName: string) {
  const existing = fileName.match(/\.[a-z0-9]+$/i)?.[0];

  if (existing) {
    return existing.toLowerCase();
  }

  if (contentType === "image/png") {
    return ".png";
  }

  if (contentType === "image/jpeg") {
    return ".jpg";
  }

  if (contentType === "image/webp") {
    return ".webp";
  }

  return ".apk";
}

function publicUrlForKey(key: string, publicBaseUrl: string) {
  return `${publicBaseUrl.replace(/\/$/, "")}/${key
    .split("/")
    .map(awsEncode)
    .join("/")}`;
}

function objectKeyForCloudflareApi(key: string) {
  return key.split("/").map(awsEncode).join("/");
}

function bodyInitFromBuffer(buffer: Buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

function assertUploadableType(contentType: string) {
  if (!uploadableTypes.has(contentType)) {
    throw new Error("This file type is not allowed for app uploads.");
  }
}

function cloudflareApiUrl(accountId: string, path: string) {
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}${path}`;
}

type CloudflareResponse<T> = {
  success: boolean;
  result?: T;
  errors?: Array<{ code?: number; message?: string }>;
  messages?: unknown[];
};

async function cloudflareFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<CloudflareResponse<T> & { status: number }> {
  const env = r2Env();

  if (!env.accountId || !env.apiToken) {
    throw new Error("Cloudflare account ID or API token is missing.");
  }

  const response = await fetch(cloudflareApiUrl(env.accountId, path), {
    ...init,
    headers: {
      Authorization: `Bearer ${env.apiToken}`,
      ...(init.headers ?? {})
    }
  });
  const text = await response.text();
  const payload = text
    ? (JSON.parse(text) as CloudflareResponse<T>)
    : ({ success: response.ok } as CloudflareResponse<T>);

  return { ...payload, status: response.status };
}

function cloudflareErrorMessage(payload: CloudflareResponse<unknown>) {
  return payload.errors?.map((error) => error.message).filter(Boolean).join("; ") || "Cloudflare R2 request failed.";
}

export function r2BucketName() {
  return r2Env().bucket;
}

export async function ensureR2Bucket() {
  const env = r2Env();

  if (!env.bucket) {
    throw new Error("Cloudflare R2 bucket name is missing.");
  }

  const existing = await cloudflareFetch(`/r2/buckets/${awsEncode(env.bucket)}`);
  if (existing.success || existing.status === 200) {
    return { bucket: env.bucket, created: false };
  }

  const created = await cloudflareFetch(`/r2/buckets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: env.bucket,
      storageClass: env.storageClass
    })
  });

  if (!created.success && created.status !== 409) {
    throw new Error(cloudflareErrorMessage(created));
  }

  return { bucket: env.bucket, created: created.status !== 409 };
}

async function getManagedPublicBaseUrl() {
  const env = r2Env();

  if (!env.bucket) {
    throw new Error("Cloudflare R2 bucket name is missing.");
  }

  if (env.publicBaseUrl) {
    return env.publicBaseUrl;
  }

  const managed = await cloudflareFetch<{ domain?: string; enabled?: boolean }>(
    `/r2/buckets/${awsEncode(env.bucket)}/domains/managed`
  );

  if (managed.success && managed.result?.domain && managed.result.enabled) {
    return `https://${managed.result.domain}`;
  }

  if (process.env.CLOUDFLARE_R2_ENABLE_PUBLIC_ACCESS === "false") {
    throw new Error("Cloudflare R2 public URL is missing and managed r2.dev access is disabled.");
  }

  const enabled = await cloudflareFetch<{ domain?: string; enabled?: boolean }>(
    `/r2/buckets/${awsEncode(env.bucket)}/domains/managed`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ enabled: true })
    }
  );

  if (!enabled.success || !enabled.result?.domain) {
    throw new Error(cloudflareErrorMessage(enabled));
  }

  return `https://${enabled.result.domain}`;
}

export type PresignedUpload = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
};

export type R2UploadedObject = {
  publicUrl: string;
  key: string;
  bucket: string;
  size: number;
};

function createUploadKey({
  developerId,
  fileName,
  contentType,
  folder
}: {
  developerId: string;
  fileName: string;
  contentType: string;
  folder: "apks" | "icons" | "screenshots";
}) {
  const normalizedFileName = normalizeFileName(fileName);

  return [
    "developers",
    developerId,
    folder,
    `${randomUUID()}${extensionFor(contentType, normalizedFileName)}`
  ].join("/");
}

export async function uploadR2ObjectViaCloudflareApi({
  developerId,
  fileName,
  contentType,
  folder,
  body
}: {
  developerId: string;
  fileName: string;
  contentType: string;
  folder: "apks" | "icons" | "screenshots";
  body: Buffer;
}): Promise<R2UploadedObject> {
  const env = r2Env();

  if (!env.accountId || !env.apiToken || !env.bucket) {
    throw new Error("Cloudflare R2 API environment variables are missing.");
  }

  assertUploadableType(contentType);
  await ensureR2Bucket();

  const key = createUploadKey({ developerId, fileName, contentType, folder });
  const publicBaseUrl = await getManagedPublicBaseUrl();

  const upload = await cloudflareFetch<{ key?: string; size?: string }>(
    `/r2/buckets/${awsEncode(env.bucket)}/objects/${objectKeyForCloudflareApi(key)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "cf-r2-storage-class": env.storageClass
      },
      body: bodyInitFromBuffer(body)
    }
  );

  if (!upload.success) {
    throw new Error(cloudflareErrorMessage(upload));
  }

  return {
    publicUrl: publicUrlForKey(key, publicBaseUrl),
    key,
    bucket: env.bucket,
    size: body.byteLength
  };
}

export async function createR2PresignedPutUrl({
  developerId,
  fileName,
  contentType,
  folder
}: {
  developerId: string;
  fileName: string;
  contentType: string;
  folder: "apks" | "icons" | "screenshots";
}): Promise<PresignedUpload> {
  const env = r2Env();

  if (
    !env.accountId ||
    !env.accessKeyId ||
    !env.secretAccessKey ||
    !env.bucket ||
    !env.publicBaseUrl
  ) {
    throw new Error("Cloudflare R2 upload environment variables are missing.");
  }

  assertUploadableType(contentType);

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";
  const service = "s3";
  const host = `${env.accountId}.r2.cloudflarestorage.com`;
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const expiresIn = 900;
  const key = createUploadKey({ developerId, fileName, contentType, folder });
  const canonicalUri = `/${env.bucket}/${key.split("/").map(awsEncode).join("/")}`;
  const params = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${env.accessKeyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "content-type;host"
  });
  const canonicalQueryString = Array.from(params.entries())
    .map(([paramKey, value]) => `${awsEncode(paramKey)}=${awsEncode(value)}`)
    .sort()
    .join("&");
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`;
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    "content-type;host",
    "UNSIGNED-PAYLOAD"
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest)
  ].join("\n");
  const signingKey = hmac(
    hmac(hmac(hmac(`AWS4${env.secretAccessKey}`, dateStamp), region), service),
    "aws4_request"
  );
  const signature = createHmac("sha256", signingKey)
    .update(stringToSign, "utf8")
    .digest("hex");

  params.set("X-Amz-Signature", signature);

  return {
    uploadUrl: `https://${host}${canonicalUri}?${params.toString()}`,
    publicUrl: publicUrlForKey(key, env.publicBaseUrl),
    key,
    expiresIn
  };
}
