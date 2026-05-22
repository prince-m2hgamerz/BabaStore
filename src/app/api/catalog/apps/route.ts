import { NextResponse, type NextRequest } from "next/server";
import { getCatalogResult } from "@/lib/catalog/catalog";
import type { CatalogQuery } from "@/lib/catalog/types";

function getQuery(request: NextRequest): CatalogQuery {
  const params = request.nextUrl.searchParams;

  return {
    query: params.get("q") ?? undefined,
    category: params.get("category") ?? undefined,
    store: params.get("store") ?? undefined,
    source: (params.get("source") ?? "all") as CatalogQuery["source"],
    language: params.get("lang") ?? undefined,
    mature: params.get("mature") === "true",
    minRating: Number(params.get("rating") ?? "0") || undefined,
    size: (params.get("size") ?? "all") as CatalogQuery["size"],
    updated: (params.get("updated") ?? "all") as CatalogQuery["updated"],
    sort: (params.get("sort") ?? "featured") as CatalogQuery["sort"],
    limit: Number(params.get("limit") ?? "24") || 24,
    offset: Number(params.get("offset") ?? "0") || 0
  };
}

export async function GET(request: NextRequest) {
  const result = await getCatalogResult(getQuery(request));
  return NextResponse.json(result);
}
