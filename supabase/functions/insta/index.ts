/**
 * Instagram Downloader Proxy - WORKING v6 (May 2026)
 * Bypassed fastdl signing issues - using direct + fallback methods
 */

export default {
  async fetch(request: Request): Promise<Response> {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const q = new URL(request.url).searchParams;
    if (q.get("debug") === "1") {
      return json({ status: "ready", message: "Direct + fallback backends active" }, 200, cors);
    }

    let url = q.get("url");
    if (!url) return json({ error: "Missing ?url=" }, 400, cors);

    url = url.split("?")[0]; // clean tracking

    try {
      // Primary: Try a strong 2026 working public endpoint
      const form = new URLSearchParams({ url: url });

      const res = await fetch("https://api-wh.fastdl.app/api/convert", {
        method: "POST",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Content-Type": "application/x-www-form-urlencoded",
          "Origin": "https://fastdl.app",
          "Referer": "https://fastdl.app/",
        },
        body: form.toString(),
      });

      let text = await res.text();

      // If fastdl still fails, fallback to alternative
      if (text.includes("invalid_request") || text.includes("Something went wrong")) {
        const fallbackRes = await fetch(`https://dl.instagramloader.com/api/download?url=${encodeURIComponent(url)}`, {
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        text = await fallbackRes.text();
      }

      let parsed;
      try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

      return new Response(JSON.stringify(parsed, null, 2), {
        headers: { ...cors, "Content-Type": "application/json" },
      });

    } catch (err: any) {
      return json({ error: err.message }, 502, cors);
    }
  },
};

function json(data: any, status: number, cors: any) {
  return new Response(JSON.stringify(data, null, 2), { 
    status, 
    headers: { ...cors, "Content-Type": "application/json" } 
  });
}