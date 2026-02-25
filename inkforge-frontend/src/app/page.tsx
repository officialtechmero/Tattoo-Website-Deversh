import type { Metadata } from "next";
import Index from "@/views/Index";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Tattoo Generator",
  description:
    "Generate unique tattoo ideas, browse trending styles, and turn concepts into ready-to-share designs.",
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
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
      <Index />
    </>
  );
}
