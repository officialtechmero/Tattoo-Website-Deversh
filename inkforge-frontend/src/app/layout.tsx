import type { Metadata } from "next";
import type { Viewport } from "next";
import type { ReactNode } from "react";
import { Bebas_Neue, DM_Sans, DM_Serif_Display } from "next/font/google";
import "../index.css";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
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
    default: "TatooInkify | Tattoo Reference Library",
    template: "%s | TatooInkify",
  },
  description:
    "Explore a searchable tattoo reference library and collect ideas for your next tattoo session.",
  applicationName: "TatooInkify",
  keywords: [
    "tattoo reference library",
    "tattoo design discovery",
    "tattoo ideas",
    "tattoo styles",
    "flash tattoo designs",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "TatooInkify",
    title: "TatooInkify | Tattoo Reference Library",
    description:
      "Explore a searchable tattoo reference library and collect ideas for your next tattoo session.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "TatooInkify | Tattoo Reference Library",
    description:
      "Explore a searchable tattoo reference library and collect ideas for your next tattoo session.",
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
        <ServiceWorkerRegister />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
