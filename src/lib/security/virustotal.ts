import { createHash } from "node:crypto";

const VIRUSTOTAL_API = "https://www.virustotal.com/api/v3";
const DIRECT_UPLOAD_LIMIT = 32 * 1024 * 1024;
const MAX_UPLOAD_SIZE = 650 * 1024 * 1024;

type VirusTotalStats = {
  harmless?: number;
  malicious?: number;
  suspicious?: number;
  timeout?: number;
  undetected?: number;
};

export type VirusTotalObject = {
  data?: {
    id?: string;
    attributes?: {
      status?: string;
      stats?: VirusTotalStats;
      last_analysis_stats?: VirusTotalStats;
    };
  };
  error?: {
    code?: string;
    message?: string;
  };
};

export type VirusTotalScanResult = {
  sha256: string;
  status: "clean" | "blocked" | "processing";
  source: "hash" | "upload";
  analysisId: string | null;
  stats: Required<VirusTotalStats>;
  message: string;
  retryAfterSeconds?: number;
};

function emptyStats(): Required<VirusTotalStats> {
  return {
    harmless: 0,
    malicious: 0,
    suspicious: 0,
    timeout: 0,
    undetected: 0
  };
}

export function isVirusTotalReady() {
  return Boolean(process.env.VIRUSTOTAL_API_KEY);
}

function normalizeStats(value: VirusTotalStats | null | undefined): Required<VirusTotalStats> {
  return {
    ...emptyStats(),
    ...(value ?? {})
  };
}

function extractStats(payload: VirusTotalObject) {
  return normalizeStats(
    payload.data?.attributes?.last_analysis_stats ?? payload.data?.attributes?.stats
  );
}

function hasStats(stats: Required<VirusTotalStats>) {
  return Object.values(stats).some((value) => value > 0);
}

function isClean(stats: Required<VirusTotalStats>) {
  return hasStats(stats) && stats.malicious === 0 && stats.suspicious === 0;
}

export function scanResultFromVirusTotalPayload({
  payload,
  sha256,
  source,
  analysisId,
  processingMessage = "VirusTotal is still processing this file."
}: {
  payload: VirusTotalObject;
  sha256: string;
  source: "hash" | "upload";
  analysisId: string | null;
  processingMessage?: string;
}): VirusTotalScanResult {
  const stats = extractStats(payload);

  if (!hasStats(stats) || payload.data?.attributes?.status === "queued") {
    return {
      sha256,
      status: "processing",
      source,
      analysisId: payload.data?.id ?? analysisId,
      stats,
      message: processingMessage,
      retryAfterSeconds: 15
    };
  }

  const clean = isClean(stats);

  return {
    sha256,
    status: clean ? "clean" : "blocked",
    source,
    analysisId: payload.data?.id ?? analysisId,
    stats,
    message: clean
      ? "VirusTotal analysis is clean."
      : "VirusTotal detected malicious or suspicious engines."
  };
}

function sha256(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function blobPartFromBuffer(buffer: Buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

async function vtFetch(path: string, init: RequestInit = {}) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    throw new Error("VirusTotal API key is missing.");
  }

  const response = await fetch(`${VIRUSTOTAL_API}${path}`, {
    ...init,
    headers: {
      "x-apikey": apiKey,
      ...(init.headers ?? {})
    }
  });
  const text = await response.text();
  const payload = text
    ? safeJsonParse<VirusTotalObject>(text, {
        error: { message: `VirusTotal returned an invalid response with status ${response.status}.` }
      })
    : {};

  return {
    ok: response.ok,
    status: response.status,
    payload
  };
}

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function sha256Hex(buffer: Buffer) {
  return sha256(buffer);
}

export async function lookupVirusTotalFile(hash: string) {
  const response = await vtFetch(`/files/${hash}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(response.payload.error?.message ?? "VirusTotal file lookup failed.");
  }

  return response.payload;
}

async function getVirusTotalUploadUrl() {
  const response = await vtFetch("/files/upload_url");

  if (!response.ok || !response.payload.data) {
    throw new Error(response.payload.error?.message ?? "VirusTotal upload URL request failed.");
  }

  return String(response.payload.data);
}

export async function lookupVirusTotalAnalysis(analysisId: string) {
  const response = await vtFetch(`/analyses/${analysisId}`);

  if (!response.ok) {
    throw new Error(response.payload.error?.message ?? "VirusTotal analysis lookup failed.");
  }

  return response.payload;
}

export async function submitFileToVirusTotal({
  body,
  fileName,
  contentType
}: {
  body: Buffer;
  fileName: string;
  contentType: string;
}) {
  if (body.byteLength > MAX_UPLOAD_SIZE) {
    throw new Error("File is too large for VirusTotal scanning.");
  }

  const formData = new FormData();
  formData.set("file", new Blob([blobPartFromBuffer(body)], { type: contentType }), fileName);
  const uploadUrl =
    body.byteLength > DIRECT_UPLOAD_LIMIT ? await getVirusTotalUploadUrl() : `${VIRUSTOTAL_API}/files`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "x-apikey": process.env.VIRUSTOTAL_API_KEY ?? ""
    },
    body: formData
  });
  const payload = (await response.json()) as VirusTotalObject;

  if (!response.ok || !payload.data?.id) {
    throw new Error(payload.error?.message ?? "VirusTotal file analysis upload failed.");
  }

  return payload.data.id;
}

export async function scanFileWithVirusTotal({
  body,
  fileName,
  contentType
}: {
  body: Buffer;
  fileName: string;
  contentType: string;
}): Promise<VirusTotalScanResult> {
  const fileHash = sha256(body);
  const existing = await lookupVirusTotalFile(fileHash);

  if (existing) {
    return scanResultFromVirusTotalPayload({
      payload: existing,
      sha256: fileHash,
      source: "hash",
      analysisId: existing.data?.id ?? null,
      processingMessage: "VirusTotal already has this file queued and is still processing it."
    });
  }

  return {
    sha256: fileHash,
    status: "processing",
    source: "upload",
    analysisId: await submitFileToVirusTotal({ body, fileName, contentType }),
    stats: emptyStats(),
    message: "VirusTotal scan submitted. Check again shortly.",
    retryAfterSeconds: 15
  };
}
