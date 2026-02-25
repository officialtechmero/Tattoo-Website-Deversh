import type { Metadata } from "next";
import type { Viewport } from "next";
import type { ReactNode } from "react";
import { Bebas_Neue, DM_Sans, DM_Serif_Display } from "next/font/google";
import "../index.css";
import { Providers } from "@/components/providers";
import { siteUrl } from "@/lib/site";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InkForge AI | AI Tattoo Generator and Design Studio",
    template: "%s | InkForge AI",
  },
  description:
    "Create custom tattoo concepts with AI, explore styles, and preview ideas before your next session.",
  applicationName: "InkForge AI",
  keywords: [
    "AI tattoo generator",
    "tattoo design app",
    "tattoo ideas",
    "tattoo styles",
    "flash tattoo designs",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "InkForge AI",
    title: "InkForge AI | AI Tattoo Generator and Design Studio",
    description:
      "Create custom tattoo concepts with AI, explore styles, and preview ideas before your next session.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "InkForge AI | AI Tattoo Generator and Design Studio",
    description:
      "Create custom tattoo concepts with AI, explore styles, and preview ideas before your next session.",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c8f04d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${dmSans.variable} ${dmSerifDisplay.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
