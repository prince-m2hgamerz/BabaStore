import type { NextConfig } from "next";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.supabase.co;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.r2.dev https://*.workers.dev https://*.supabase.co https://*.googleusercontent.com https://*.gstatic.com https://*.githubusercontent.com https://*.cloudfront.net https://*.m2hio.in;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://*.r2.dev https://*.workers.dev;
  frame-src 'self' https://accounts.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, " ").trim();

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev"
      },
      {
        protocol: "https",
        hostname: "**.workers.dev"
      },
      {
        protocol: "https",
        hostname: "**.supabase.co"
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com"
      },
      {
        protocol: "https",
        hostname: "**.gstatic.com"
      },
      {
        protocol: "https",
        hostname: "**.githubusercontent.com"
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net"
      },
      {
        protocol: "https",
        hostname: "**.m2hio.in"
      }
    ]
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          }
        ]
      }
    ];
  },

  async redirects() {
    return [
      {
        source: "/app/:slug",
        destination: "/apps/:slug",
        permanent: true
      },
      {
        source: "/store",
        destination: "/",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
