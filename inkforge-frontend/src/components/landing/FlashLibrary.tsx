import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { flashDesigns, styles } from "@/lib/data";

const filterTabs = ["All", ...styles] as const;

export function FlashLibrary() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? flashDesigns.slice(0, 12)
    : flashDesigns.filter((d) => d.style === activeFilter).slice(0, 12);

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl tracking-wider">
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
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeFilter === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((design, i) => (
            <div
              key={design.id}
              className="group card-hover overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={design.image}
                  alt={`${design.style} tattoo`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                  className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {design.style}
                </span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Heart className="h-3.5 w-3.5" />
                  <span className="text-xs">{design.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
