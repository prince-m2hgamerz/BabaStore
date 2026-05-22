import { NextResponse, type NextRequest } from "next/server";
import { lookupCatalogApp } from "@/lib/catalog/catalog";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const app = await lookupCatalogApp({
    slug: params.get("slug") ?? undefined,
    packageName: params.get("package") ?? params.get("packageName") ?? undefined,
    appId: params.get("appId") ?? undefined,
    apkId: params.get("apkId") ?? undefined,
    md5: params.get("md5") ?? undefined
  });

  if (!app) {
    return NextResponse.json({ error: "App not found" }, { status: 404 });
  }

  return NextResponse.json({ app });
}
