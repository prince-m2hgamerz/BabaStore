import { ImageResponse } from "@vercel/og";
import { getCatalogApp } from "@/lib/catalog/catalog";

export const runtime = "edge";

const domain = (process.env.NEXT_PUBLIC_SITE_URL ?? "")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

export const alt = "BabaStore — Download Free Android APKs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = await getCatalogApp(slug);

  const accent = app?.accent ?? "#171717";
  const name = app?.name ?? "BabaStore";
  const developer = app?.developer ?? "";
  const rating = app?.rating ?? null;
  const summary = app?.summary ?? app?.description ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          background: "#fafafa",
          fontFamily: "Inter, sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px",
            flex: 1
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginBottom: 16
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 16,
                background: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 36,
                fontWeight: 700
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: "#171717",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1
                }}
              >
                {name}
              </span>
              {developer ? (
                <span
                  style={{
                    fontSize: 24,
                    color: "#4d4d4d",
                    marginTop: 4
                  }}
                >
                  {developer}
                </span>
              ) : null}
            </div>
          </div>

          {summary ? (
            <p
              style={{
                fontSize: 22,
                color: "#666",
                lineHeight: 1.5,
                margin: "16px 0 0",
                maxWidth: 800,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            >
              {summary.slice(0, 280)}
            </p>
          ) : null}

          <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 20,
                color: "#888",
                background: "#eee",
                padding: "8px 16px",
                borderRadius: 100
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{rating ? `${rating}/5` : "No ratings"}</span>
            </div>
            <span style={{ fontSize: 18, color: "#888" }}>Android APK</span>
            <span style={{ fontSize: 18, color: "#888" }}>Free download</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 80px",
            borderTop: "1px solid #e5e5e5"
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 600, color: "#171717" }}>
            BabaStore
          </span>
          <span style={{ fontSize: 16, color: "#888" }}>
            {domain}
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
