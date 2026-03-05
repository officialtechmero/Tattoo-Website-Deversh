import type { Metadata } from "next";
import Index from "@/views/Index";
import { siteUrl } from "@/lib/site";
import { getHomeDesigns } from "@/lib/home-images";

export async function generateMetadata(): Promise<Metadata> {
  const designs = await getHomeDesigns();
  const firstImage = designs[0]?.image;

  return {
    title: "AI Tattoo Generator",
    description:
      "Generate unique tattoo ideas, browse trending styles, and turn concepts into ready-to-share designs.",
    alternates: {
      canonical: "/",
    },
    openGraph: firstImage
      ? {
        images: [{ url: firstImage, width: 1200, height: 630, alt: "InkForge tattoo designs" }],
      }
      : undefined,
    twitter: firstImage
      ? {
        images: [firstImage],
      }
      : undefined,
  };
}

export const revalidate = 300;

export default async function Page() {
  const designs = await getHomeDesigns();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "InkForge AI",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    description:
      "Generate unique tattoo ideas, browse trending styles, and turn concepts into ready-to-share designs.",
    url: siteUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Index designs={designs} />
    </>
  );
}
