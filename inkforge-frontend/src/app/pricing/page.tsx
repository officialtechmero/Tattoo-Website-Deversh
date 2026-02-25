import type { Metadata } from "next";
import Pricing from "@/views/Pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Compare InkForge AI plans for personal and professional tattoo design workflows.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function Page() {
  return <Pricing />;
}
