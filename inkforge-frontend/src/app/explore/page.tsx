import type { Metadata } from "next";
import Explore from "@/views/Explore";

export const metadata: Metadata = {
  title: "Explore Tattoo Designs",
  description:
    "Browse AI-generated tattoo flash designs by style, placement, and category to find your next ink idea.",
  alternates: {
    canonical: "/explore",
  },
};

export default function Page() {
  return <Explore />;
}
