import { NextResponse } from "next/server";
import { getCatalogStore } from "@/lib/catalog/catalog";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const store = await getCatalogStore(name);

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json({ store });
}
