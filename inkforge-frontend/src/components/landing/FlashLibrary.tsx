"use client";

import { useState } from "react";
import Image from "next/image";
import { cleanTattooDescription } from "@/lib/slug";
import { landingStyles, type LandingDesign } from "@/lib/landing";

const filterTabs = ["All", ...landingStyles] as const;

export function FlashLibrary({ designs }: { designs: LandingDesign[] }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const sourceDesigns = designs.length > 0
    ? designs
    : [
      {
        id: "placeholder",
        image: "/placeholder.svg",
        style: "Traditional",
        likes: 0,
        alt: "Tattoo placeholder",
      },
    ];

  const filtered = activeFilter === "All"
    ? sourceDesigns.slice(0, 12)
    : sourceDesigns.filter((d) => d.style === activeFilter).slice(0, 12);

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl tracking-normal">
            Trending <span className="text-gradient">Designs</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Discover popular tattoo designs from our community</p>
        </div>

        {/* Filter tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${activeFilter === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((design) => (
            <div
              key={design.id}
              className="group card-hover overflow-hidden rounded-lg border border-border bg-card"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={design.image}
                  alt={cleanTattooDescription(design.alt || `${design.style} tattoo design`)}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  loading="lazy"
                  className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
