import { NextResponse, type NextRequest } from "next/server";
import { getCatalogApp, getCatalogDownloadUrl } from "@/lib/catalog/catalog";
import { createClient } from "@/lib/supabase/server";
import type { CatalogApp } from "@/lib/catalog/types";

function apkFileName(app: CatalogApp) {
  const safeName = `${app.name}-${app.version}`
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${safeName || "babastore-app"}.apk`;
}

function streamHeaders(app: CatalogApp, upstream: Response) {
  const headers = new Headers();
  const contentType = upstream.headers.get("content-type") || "application/vnd.android.package-archive";
  const contentLength = upstream.headers.get("content-length");
  const contentRange = upstream.headers.get("content-range");
  const acceptRanges = upstream.headers.get("accept-ranges");

  headers.set("content-type", contentType);
  headers.set("content-disposition", `attachment; filename="${apkFileName(app)}"`);
  headers.set("cache-control", "private, no-store");
  if (contentLength) headers.set("content-length", contentLength);
  if (contentRange) headers.set("content-range", contentRange);
  if (acceptRanges) headers.set("accept-ranges", acceptRanges);

  return headers;
}

async function fetchDownload(downloadUrl: string, request: NextRequest, method: "GET" | "HEAD") {
  const range = request.headers.get("range");
  const headers = new Headers();
  if (range) headers.set("range", range);

  return fetch(downloadUrl, {
    method,
    headers,
    cache: "no-store",
    redirect: "follow"
  });
}

async function logLocalDownload(app: CatalogApp, request: NextRequest) {
  if (
    app.source !== "local" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    await supabase.from("downloads").insert({
      app_id: app.id,
      user_id: user?.id ?? null,
      user_agent: request.headers.get("user-agent")
    });
  } catch {
    // Download logging should not block a user from receiving the APK.
  }
}

async function getDownloadContext(slug: string) {
  const app = await getCatalogApp(slug);

  if (!app) {
    return { app: null, downloadUrl: null };
  }
  const downloadUrl = await getCatalogDownloadUrl(app);

  return { app, downloadUrl };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { app, downloadUrl } = await getDownloadContext(slug);

  if (!app) {
    return NextResponse.json({ error: "App not found" }, { status: 404 });
  }

  if (!downloadUrl) {
    return NextResponse.json(
      { error: "No APK URL configured for this app yet." },
      { status: 409 }
    );
  }

  const upstream = await fetchDownload(downloadUrl, request, "GET");

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json(
      { error: "The APK file is not available right now." },
      { status: 502 }
    );
  }

  await logLocalDownload(app, request);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: streamHeaders(app, upstream)
  });
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { app, downloadUrl } = await getDownloadContext(slug);

  if (!app) {
    return new Response(null, { status: 404 });
  }

  if (!downloadUrl) {
    return new Response(null, { status: 409 });
  }

  const upstream = await fetchDownload(downloadUrl, request, "HEAD").catch(() => null);

  if (!upstream || (!upstream.ok && upstream.status !== 206)) {
    return new Response(null, {
      status: 200,
      headers: streamHeaders(app, new Response(null))
    });
  }

  return new Response(null, {
    status: upstream.status,
    headers: streamHeaders(app, upstream)
  });
}
