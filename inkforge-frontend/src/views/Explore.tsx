"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, Heart, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { flashDesigns, styles } from "@/lib/data";

const sortOptions = ["Popular", "Newest", "Most Liked"];
const filterCategories = {
  Gender: ["Men", "Women"],
  "Body Part": [
    "Forearm", "Full Sleeve", "Half Sleeve", "Thigh", "Hand", "Shoulder",
    "Wrist", "Band", "Back", "Calf", "Chest", "Sternum", "Finger", "Ankle",
  ],
  Themes: ["Skull", "Space", "Book", "Gothic", "Ocean", "Cartoon", "Compass"],
  Symbol: ["Anxiety", "Strength", "Warrior", "Mom", "Sister", "Zodiac"],
  Floral: ["Rose", "Flower", "Lotus", "Wildflower", "Orchid", "Dandelion"],
  Animals: ["Lion", "Wolf", "Werewolf", "Black Jaguar", "Tiger", "Spider Web"],
  Celestial: ["Sun And Moon", "Star", "Sunset", "Sun", "Moon", "Sunrise"],
  Unique: ["Aztec", "Egyptian", "Celtic", "Flash", "Henna", "Yakuza", "Sugar Skull"],
};

type FilterCategory = keyof typeof filterCategories;
type ActiveFilters = Record<FilterCategory, string[]>;

const createEmptyFilters = () =>
  Object.fromEntries(
    Object.keys(filterCategories).map((cat) => [cat, [] as string[]]),
  ) as ActiveFilters;

export default function Explore() {
  const [search, setSearch] = useState("");
  const [activeStyle, setActiveStyle] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [activeSort, setActiveSort] = useState("Popular");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(createEmptyFilters());

  const toggleFilter = (category: FilterCategory, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters(createEmptyFilters());
    setActiveStyle("All");
    setActiveSort("Popular");
  };

  const hasActiveFilters = useMemo(
    () => activeStyle !== "All" || Object.values(activeFilters).some((arr) => arr.length > 0),
    [activeStyle, activeFilters],
  );
  const activeFilterCount = useMemo(
    () =>
      Object.values(activeFilters).reduce((count, values) => count + values.length, 0) +
      (activeStyle === "All" ? 0 : 1),
    [activeFilters, activeStyle],
  );

  const sorted = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = flashDesigns.filter((d) => {
      if (activeStyle !== "All" && d.style !== activeStyle) return false;
      if (normalizedSearch && !d.style.toLowerCase().includes(normalizedSearch)) return false;
      if (activeFilters.Gender.length > 0 && d.gender && !activeFilters.Gender.includes(d.gender)) return false;
      if (activeFilters["Body Part"].length > 0 && d.bodyPart && !activeFilters["Body Part"].includes(d.bodyPart)) return false;
      if (activeFilters.Themes.length > 0 && d.theme && !activeFilters.Themes.includes(d.theme)) return false;
      if (activeFilters.Symbol.length > 0 && d.symbol && !activeFilters.Symbol.includes(d.symbol)) return false;
      if (activeFilters.Floral.length > 0 && d.floral && !activeFilters.Floral.includes(d.floral)) return false;
      if (activeFilters.Animals.length > 0 && d.animal && !activeFilters.Animals.includes(d.animal)) return false;
      if (activeFilters.Celestial.length > 0 && d.celestial && !activeFilters.Celestial.includes(d.celestial)) return false;
      if (activeFilters.Unique.length > 0 && d.unique && !activeFilters.Unique.includes(d.unique)) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (activeSort === "Most Liked") return (b.likes || 0) - (a.likes || 0);
      if (activeSort === "Newest") return (b.id || 0) - (a.id || 0);
      return 0;
    });
  }, [activeFilters, activeSort, activeStyle, search]);

  const FilterPanel = () => (
    <div className="flex flex-col gap-5">
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Sort by
        </label>
        <div className="flex flex-wrap gap-1">
          {sortOptions.map((o) => (
            <button
              key={o}
              onClick={() => setActiveSort(o)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                activeSort === o
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Style
        </label>
        <div className="flex flex-wrap gap-1">
          {["All", ...styles].map((s) => (
            <button
              key={s}
              onClick={() => setActiveStyle(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                activeStyle === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {(Object.entries(filterCategories) as [FilterCategory, string[]][]).map(([category, options]) => (
        <div key={category}>
          <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {category}
          </label>
          <div className="flex flex-wrap gap-1">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => toggleFilter(category, opt)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  activeFilters[category].includes(opt)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="text-xs text-muted-foreground underline hover:text-foreground transition-colors text-left mt-1"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <div>
          <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">
            Explore <span className="text-gradient">Designs</span>
          </h1>
          <p className="mb-8 text-muted-foreground">
            Browse our collection of AI-generated tattoo designs
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="search-designs" className="sr-only">
              Search tattoo ideas
            </label>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="search-designs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tattoo ideas..."
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button
            variant="outline"
            className="border-border gap-2 lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="mobile-filters-panel"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            <div
              id="mobile-filters-panel"
              className="filter-scroll absolute left-0 top-0 h-full w-72 overflow-y-auto rounded-r-2xl border-r border-border bg-card p-5 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold text-sm">Filters</span>
                <button
                  onClick={() => setShowFilters(false)}
                  className="rounded-full p-1 hover:bg-secondary transition-colors"
                  aria-label="Close filters panel"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        <div className="flex gap-6">
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="filter-scroll sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-border bg-card p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold text-sm flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
                </span>
                {hasActiveFilters && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-6 flex flex-wrap gap-2">
              {["All", ...styles].map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveStyle(s)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    activeStyle === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="columns-1 gap-4 sm:columns-2 lg:columns-2 xl:columns-3">
              {sorted.map((design, i) => (
                <article
                  key={design.id}
                  className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={design.image}
                      alt={`${design.style} tattoo`}
                      width={900}
                      height={1200}
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      priority={i === 0}
                      loading={i === 0 ? undefined : "lazy"}
                      className="w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                      style={{ aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/3" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button asChild size="sm" className="btn-glow border-0 text-primary-foreground">
                        <Link href={`/design/${design.id}`}>Check Details</Link>
                      </Button>
                    </div>
                    <button
                      className="absolute top-3 right-3 rounded-full bg-background/60 p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background/80"
                      aria-label={`Save ${design.style} tattoo design`}
                    >
                      <Heart className="h-4 w-4 text-foreground" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {design.style}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3" /> {design.likes}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button variant="outline" className="border-border">Load More</Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
