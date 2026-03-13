import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { flashDesigns } from "@/lib/data";
import { makeSlugId } from "@/lib/slug";
import { categoryToSlug, getPrimaryCategory } from "@/lib/explore-categories";

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

  const designRoutes: MetadataRoute.Sitemap = flashDesigns.map((design) => {
    const category = getPrimaryCategory(design.name || design.style || "Tattoo");
    const categorySlug = categoryToSlug(category);
    const slugId = makeSlugId(design.name || design.style || "tattoo-design", design.id);
    return {
      url: `${siteUrl}/design/${categorySlug}/${slugId}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    };
  });

  return [...staticRoutes, ...designRoutes];
}
