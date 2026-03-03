import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { flashDesigns } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/explore`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const designRoutes: MetadataRoute.Sitemap = flashDesigns.map((design) => ({
    url: `${siteUrl}/design/${design.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...designRoutes];
}
