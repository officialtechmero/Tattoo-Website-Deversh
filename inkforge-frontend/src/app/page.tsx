import type { Metadata } from "next";
import Index from "@/views/Index";

export const metadata: Metadata = {
  title: "AI Tattoo Generator",
  description:
    "Generate unique tattoo ideas, browse trending styles, and turn concepts into ready-to-share designs.",
};

export default function Page() {
  return <Index />;
}
