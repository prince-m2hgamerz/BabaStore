import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";
import { getCatalogApps } from "@/lib/catalog/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = siteConfig.url.replace(/\/$/, "");
  const currentDate = new Date().toISOString().split("T")[0];

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0
    },
    {
      url: `${siteUrl}/login`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3
    },
    {
      url: `${siteUrl}/register`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3
    },
    {
      url: `${siteUrl}/developer`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.6
    },
    {
      url: `${siteUrl}/developer/upload`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.5
    },
    {
      url: `${siteUrl}/docs/setup`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: `${siteUrl}/legal/privacy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.2
    },
    {
      url: `${siteUrl}/legal/terms`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.2
    },
    {
      url: `${siteUrl}/legal/developer-policy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.2
    }
  ];

  let appRoutes: MetadataRoute.Sitemap = [];

  try {
    const apps = await getCatalogApps({ limit: 500 });
    appRoutes = apps.map((app) => ({
      url: `${siteUrl}/apps/${app.slug}`,
      lastModified: app.updatedAt?.split("T")[0] ?? currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }));
  } catch {
    // Sitemap works without app routes
  }

  return [...staticRoutes, ...appRoutes];
}
