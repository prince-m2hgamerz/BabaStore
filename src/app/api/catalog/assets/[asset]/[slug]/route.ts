import { NextResponse, type NextRequest } from "next/server";
import { getCatalogAssetUrl } from "@/lib/catalog/catalog";

const allowedAssets = new Set(["icon", "banner", "screenshot"] as const);

function contentTypeFor(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  return contentType.startsWith("image/") ? contentType : "image/webp";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asset: string; slug: string }> }
) {
  const { asset, slug } = await params;

  if (!allowedAssets.has(asset as "icon" | "banner" | "screenshot")) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const index = Math.max(Number(request.nextUrl.searchParams.get("index") ?? "0") || 0, 0);
  const assetUrl = await getCatalogAssetUrl({
    slug,
    asset: asset as "icon" | "banner" | "screenshot",
    index
  });

  if (!assetUrl) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const upstream = await fetch(assetUrl, {
    cache: "force-cache",
    next: { revalidate: 60 * 60 * 24 }
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Asset unavailable" }, { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": contentTypeFor(upstream),
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800"
    }
  });
}
