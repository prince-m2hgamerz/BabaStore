import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { rateLimit } from "@/lib/security/rate-limit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";
    const key = `${ip}:${pathname}`;

    const result = rateLimit({ key, maxRequests: 30, windowMs: 60_000 });

    if (!result.ok) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(result.resetIn / 1000)),
            "Content-Type": "application/json"
          }
        }
      );
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
