"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { makeSlugId, slugify, splitSlugId } from "@/lib/slug";
import { categoryToSlug, getPrimaryCategory } from "@/lib/explore-categories";
import place_holder from "../../public/placeholder.svg";

type ShowcaseDesign = {
  id: string;
  title: string;
  image: string;
  tag: string;
};

type ExploreImage = {
  id: string;
  query: string;
  imageLink: string;
  imageAlt: string;
  created_at: string;
};

type ExploreResponse = {
  status: string;
  data: ExploreImage[];
  pagination: {
    page: number;
    limit: number;
    total: number | null;
    totalPages: number | null;
  };
};

const emptyExploreResponse = (): ExploreResponse => ({
  status: "Error",
  data: [],
  pagination: {
    page: 1,
    limit: 0,
    total: 0,
    totalPages: 1,
  },
});

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function toTitleCase(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildDescription(seed: number, wordCount = 300): string {
  const words = [
    "ink",
    "line",
    "shade",
    "contrast",
    "texture",
    "rhythm",
    "flow",
    "balance",
    "edge",
    "detail",
    "light",
    "shadow",
    "form",
    "gesture",
    "story",
    "symbol",
    "craft",
    "focus",
    "motion",
    "quiet",
    "bold",
    "soft",
    "precise",
    "layered",
    "organic",
    "modern",
    "timeless",
    "raw",
    "elegant",
    "dense",
    "minimal",
    "wild",
    "poised",
    "lively",
    "steady",
    "guided",
    "intentional",
    "curated",
    "refined",
    "dramatic",
    "spark",
    "tone",
    "shape",
    "depth",
    "frame",
    "arc",
    "anchor",
    "texture",
    "grain",
    "veil",
    "whisper",
    "echo",
    "pulse",
    "storyline",
    "gesture",
    "negative",
    "space",
    "alignment",
    "focus",
    "cadence",
    "pattern",
    "symbolic",
    "layer",
    "structure",
    "drift",
    "shine",
    "glow",
    "trace",
    "mark",
    "composition",
    "centered",
    "balanced",
    "crafted",
    "heroic",
    "poetic",
    "clean",
    "luminous",
    "charged",
    "spirited",
    "classic",
    "brave",
    "narrative",
  ];
  const rng = mulberry32(seed || 1);
  const result: string[] = [];

  for (let i = 0; i < wordCount; i += 1) {
    const word = words[Math.floor(rng() * words.length)] || "ink";
    const isSentenceStart = i % 18 === 0;
    const output = isSentenceStart ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    result.push(output);
  }

  const withPunctuation = result
    .map((word, idx) => ((idx + 1) % 18 === 0 ? `${word}.` : word))
    .join(" ");
  return withPunctuation;
}

function stripMayContain(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const filtered = lines.filter((line) => !line.toLowerCase().startsWith("this may contain"));
  if (filtered.length) return filtered.join(" ");

  const marker = "this may contain";
  const index = trimmed.toLowerCase().indexOf(marker);
  if (index === -1) return trimmed;

  const after = trimmed.slice(index + marker.length);
  const cleaned = after.replace(/^[\s:.-]+/, "").trim();
  return cleaned || trimmed;
}

function mapExploreItem(item: ExploreImage): ShowcaseDesign {
  const title = stripMayContain(item.imageAlt || item.query || "Design");
  const tag = stripMayContain(item.query || item.imageAlt || "Design");
  return {
    id: item.id,
    title: title || "Design",
    tag: tag || "Design",
    image: item.imageLink,
  };
}

export default function ExploreDesignDetails() {
  const params = useParams<{ id: string }>();
  const slugId = params?.id || "";
  const { slug, id } = splitSlugId(slugId);
  const [currentDesign, setCurrentDesign] = useState<ExploreImage | null>(null);
  const cleanedTitle = stripMayContain(currentDesign?.imageAlt || currentDesign?.query || "");
  const title = cleanedTitle || toTitleCase(slug || "custom design");
  const seed = seedFromString(slugId);
  const description = useMemo(() => buildDescription(seed, 300), [seed]);
  const [topPicks, setTopPicks] = useState<ShowcaseDesign[]>([]);
  const [similar, setSimilar] = useState<ShowcaseDesign[]>([]);
  const heroImage = currentDesign?.imageLink || place_holder;
  const heroAlt = cleanedTitle || `${title} tattoo design`;
  const category = getPrimaryCategory(stripMayContain(currentDesign?.imageAlt || currentDesign?.query || title));
  const categorySlug = categoryToSlug(category);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        if (!id) {
          setCurrentDesign(null);
          return;
        }

        const designRes = await fetch(`/api/explore/${id}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const designJson = designRes.ok
          ? ((await designRes.json()) as { status: string; data: ExploreImage })
          : null;

        setCurrentDesign(designJson?.data ?? null);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setCurrentDesign(null);
      }
    };

    void load();
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      const searchTerm = stripMayContain(currentDesign?.query || currentDesign?.imageAlt || "").trim();

      const topParams = new URLSearchParams({
        limit: "6",
        withTotal: "0",
        random: "1",
      });
      if (searchTerm) topParams.set("search", searchTerm);

      const similarParams = new URLSearchParams({
        limit: "6",
        withTotal: "0",
      });
      if (searchTerm) {
        similarParams.set("search", searchTerm);
      } else {
        similarParams.set("random", "1");
      }

      try {
        const [topRes, similarRes] = await Promise.all([
          fetch(`/api/explore?${topParams.toString()}`, {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch(`/api/explore?${similarParams.toString()}`, {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        const [topJson, similarJson] = await Promise.all([
          topRes.ok ? (topRes.json() as Promise<ExploreResponse>) : Promise.resolve(emptyExploreResponse()),
          similarRes.ok ? (similarRes.json() as Promise<ExploreResponse>) : Promise.resolve(emptyExploreResponse()),
        ]);

        const topItems = (topJson.data || []).filter((item) => item.id !== id);
        const similarItems = (similarJson.data || []).filter((item) => item.id !== id);

        setTopPicks(topItems.map(mapExploreItem));
        setSimilar(similarItems.map(mapExploreItem));
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setTopPicks([]);
        setSimilar([]);
      }
    };

    void load();
    return () => controller.abort();
  }, [currentDesign?.imageAlt, currentDesign?.query, id]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pb-16 pt-24">
        <Button asChild className="bg-transparent hover:text-black mb-3 text-muted-foreground">
          <Link href="/explore">
            <ArrowLeft /> Back to explore
          </Link>
        </Button>
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/explore" className="hover:text-foreground transition-colors">
            Explore
          </Link>
          <span>/</span>
          <Link
            href={`/explore?category=${encodeURIComponent(categorySlug)}`}
            className="hover:text-foreground transition-colors"
          >
            {category}
          </Link>
          <span>/</span>
          <span className="text-foreground">
            {title.length > 25 ? `${title.slice(0, 25)}...` : title}
          </span>
        </nav>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-3">
            <img
              src={heroImage}
              alt={heroAlt}
              className="w-full max-h-[560px] rounded-xl object-contain"
              loading="eager"
            />
          </div>
          <div>
            {/* <p className="text-xs uppercase tracking-normal text-primary">Design #{id || "X"}</p> */}
            <h1 className="font-display text-3xl font-bold mb-4 tracking-normal">{title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>

        {topPicks.length > 0 && (
          <section className="mt-20">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-normal text-primary mb-1">Top Picks</p>
                <h2 className="font-display text-2xl font-bold tracking-normal">
                  Top <span className="text-gradient">Picks</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Hand-picked references that match this vibe</p>
              </div>
              <Link
                href="/explore"
                className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {topPicks.map((design, index) => (
                <DesignCard key={design.id} design={design} index={index} />
              ))}
            </div>
          </section>
        )}

        {similar.length > 0 && (
          <section className="mt-20">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-normal text-primary mb-1">Similar Designs</p>
                <h2 className="font-display text-2xl font-bold tracking-normal">
                  Similar <span className="text-gradient">Designs</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Other directions with complementary energy</p>
              </div>
              <Link
                href="/explore"
                className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
              >
                Explore more
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {similar.map((design, index) => (
                <DesignCard key={design.id} design={design} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}

function DesignCard({ design, index }: { design: ShowcaseDesign; index: number }) {
  const category = getPrimaryCategory(design.title);
  const categorySlug = categoryToSlug(category);
  const slugId = makeSlugId(slugify(stripMayContain(design.title)), design.id);
  return (
    <Link href={`/design/${categorySlug}/${slugId}`} className="block">
      <article className="group overflow-hidden rounded-2xl border border-border bg-card cursor-pointer">
        <div className="relative overflow-hidden">
          <img
            src={design.image}
            alt={design.title}
            loading={index < 4 ? "eager" : "lazy"}
            className="w-full aspect-[3/4] object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
              View Design
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
