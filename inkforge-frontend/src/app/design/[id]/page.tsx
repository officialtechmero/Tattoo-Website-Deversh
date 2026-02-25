import type { Metadata } from "next";
import DesignDetails from "@/views/DesignDetails";
import { flashDesigns } from "@/lib/data";

type DesignPageParams = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: DesignPageParams): Promise<Metadata> {
  const { id } = await params;
  const design = flashDesigns.find((item) => item.id === Number(id));
  const title = design
    ? `${design.style} Tattoo Design #${id}`
    : `Tattoo Design #${id}`;

  return {
    title,
    description:
      "View tattoo design details, estimated sessions, and style information in InkForge AI.",
    alternates: {
      canonical: `/design/${id}`,
    },
  };
}

export default function Page() {
  return <DesignDetails />;
}
