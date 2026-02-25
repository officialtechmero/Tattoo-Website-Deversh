import type { Metadata } from "next";
import Generate from "@/views/Generate";

export const metadata: Metadata = {
  title: "Generate Tattoo Designs",
  description:
    "Create custom tattoo artwork with prompt-based AI generation, style controls, and downloadable results.",
  alternates: {
    canonical: "/generate",
  },
};

export default function Page() {
  return <Generate />;
}
