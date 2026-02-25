import type { Metadata } from "next";
import Stencil from "@/views/Stencil";

export const metadata: Metadata = {
  title: "Image To Stencil",
  description:
    "Convert images into clean stencil-ready tattoo line art with InkForge AI tools.",
  alternates: {
    canonical: "/stencil",
  },
};

export default function Page() {
  return <Stencil />;
}
