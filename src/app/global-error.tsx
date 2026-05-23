"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <main
          style={{
            display: "grid",
            minHeight: "100vh",
            placeItems: "center",
            padding: "40px 16px",
            fontFamily: "system-ui, sans-serif",
            background: "#fafafa",
            color: "#171717"
          }}
        >
          <div
            style={{
              maxWidth: 400,
              textAlign: "center"
            }}
          >
            <AlertTriangle
              style={{
                margin: "0 auto",
                width: 36,
                height: 36,
                color: "#f59e0b"
              }}
            />
            <h1
              style={{
                marginTop: 16,
                fontSize: 24,
                fontWeight: 600
              }}
            >
              Critical error
            </h1>
            <p
              style={{
                marginTop: 8,
                fontSize: 14,
                lineHeight: 1.5,
                color: "#666"
              }}
            >
              A serious error occurred. Please try refreshing the page.
            </p>
            {error.digest ? (
              <p
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "#999",
                  fontFamily: "monospace"
                }}
              >
                Error ID: {error.digest}
              </p>
            ) : null}
            <button
              onClick={() => reset()}
              style={{
                marginTop: 20,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px",
                borderRadius: 100,
                border: "1px solid #e5e5e5",
                background: "#fff",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              <RefreshCw style={{ width: 16, height: 16 }} />
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
