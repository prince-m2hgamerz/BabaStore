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
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    bucket: process.env.CLOUDFLARE_R2_BUCKET,
    publicBaseUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL
  };
}

export function isR2Ready() {
  const env = r2Env();

  return Boolean(
    env.accountId &&
      env.accessKeyId &&
      env.secretAccessKey &&
      env.bucket &&
      env.publicBaseUrl
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

export type PresignedUpload = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
};

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

  if (!uploadableTypes.has(contentType)) {
    throw new Error("This file type is not allowed for app uploads.");
  }

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";
  const service = "s3";
  const host = `${env.accountId}.r2.cloudflarestorage.com`;
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const expiresIn = 900;
  const normalizedFileName = normalizeFileName(fileName);
  const key = [
    "developers",
    developerId,
    folder,
    `${randomUUID()}${extensionFor(contentType, normalizedFileName)}`
  ].join("/");
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
