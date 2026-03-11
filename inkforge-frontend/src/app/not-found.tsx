import type { Metadata } from "next";
import NotFound from "@/views/NotFound";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you requested was not found. Explore TatooInkify's tattoo reference library and discover curated tattoo designs.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function GlobalNotFound() {
  return <NotFound />;
}
