import { NextResponse, type NextRequest } from "next/server";
import { getCatalogApps } from "@/lib/catalog/catalog";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const apps = await getCatalogApps({
    query,
    limit: 8
  });

  const suggestions = apps.map((app) => ({
    id: app.id,
    slug: app.slug,
    name: app.name,
    packageName: app.packageName,
    iconUrl: app.iconUrl,
    accent: app.accent
  }));

  return NextResponse.json({ suggestions });
}
