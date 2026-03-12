import type { Metadata } from "next";
import DesignDetails from "@/views/DesignDetails";
import ExploreDesignDetails from "@/views/ExploreDesignDetails";
import { flashDesigns } from "@/lib/data";
import { extractNumericId, splitSlugId } from "@/lib/slug";

type DesignPageParams = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: DesignPageParams): Promise<Metadata> {
  const { id } = await params;
  const numericId = extractNumericId(id);
  const design = numericId ? flashDesigns.find((item) => item.id === Number(numericId)) : undefined;
  const { slug } = splitSlugId(id);
  const title = design
    ? `${design.style} Tattoo Design #${design.id}`
    : `${slug ? slug.replace(/-/g, " ") : "Tattoo"} Design #${id}`;

  return {
    title,
    description: design
      ? "View tattoo design details, estimated sessions, and style information in TatooInkify."
      : "Explore a unique tattoo design with curated references, top picks, and similar styles.",
    alternates: {
      canonical: `/design/${id}`,
    },
  };
}

export default async function Page({ params }: DesignPageParams) {
  const { id } = await params;
  const numericId = extractNumericId(id);
  const design = numericId ? flashDesigns.find((item) => item.id === Number(numericId)) : undefined;
  if (design) {
    return <DesignDetails />;
  }
  return <ExploreDesignDetails />;
}
