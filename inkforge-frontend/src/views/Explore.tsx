"use client";
import { useMemo, useState, useCallback } from "react";
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

const valueSnippets: Record<string, { essence: string }> = {
  Men: { essence: "bold masculine energy" },
  Women: { essence: "elegant feminine expression" },
  Forearm: { essence: "the forearm — a highly visible canvas" },
  "Full Sleeve": { essence: "a full sleeve wrapping shoulder to wrist" },
  "Half Sleeve": { essence: "a half sleeve from shoulder to elbow" },
  Thigh: { essence: "the thigh — a spacious intimate canvas" },
  Hand: { essence: "the hand — bold placement for the fearless" },
  Shoulder: { essence: "the shoulder — a naturally curved frame" },
  Wrist: { essence: "the wrist — always in quiet view" },
  Band: { essence: "a band encircling the body in continuity" },
  Back: { essence: "the back — the body's largest epic canvas" },
  Calf: { essence: "the calf — strong and shapely" },
  Chest: { essence: "the chest — closest to the heart" },
  Sternum: { essence: "the sternum — centered and deeply personal" },
  Finger: { essence: "the finger — tiny and daring" },
  Ankle: { essence: "the ankle — subtle and graceful" },
  Skull: { essence: "skull motifs that celebrate life through mortality" },
  Space: { essence: "cosmic space imagery and galactic wonder" },
  Book: { essence: "literary and book-inspired themes" },
  Gothic: { essence: "gothic dark romance and dramatic shadows" },
  Ocean: { essence: "ocean waves and deep sea energy" },
  Cartoon: { essence: "playful cartoon art and nostalgic imagery" },
  Compass: { essence: "compass and navigation symbols" },
  Anxiety: { essence: "inner-storm symbolism turned into outer beauty" },
  Strength: { essence: "symbols of strength and hard-won resilience" },
  Warrior: { essence: "warrior spirit and fearless iconography" },
  Mom: { essence: "a heartfelt tribute to motherhood" },
  Sister: { essence: "a celebration of the sisterhood bond" },
  Zodiac: { essence: "zodiac and celestial star sign symbols" },
  Rose: { essence: "rose motifs dripping with passion and beauty" },
  Flower: { essence: "delicate floral blooms in full expression" },
  Lotus: { essence: "lotus flowers rising through transformation" },
  Wildflower: { essence: "free-spirited wildflowers growing untamed" },
  Orchid: { essence: "exotic orchids for the refined and rare" },
  Dandelion: { essence: "wishful dandelions carrying seeds of hope" },
  Lion: { essence: "lion imagery radiating courage and raw power" },
  Wolf: { essence: "wolf symbolism — loyalty, instinct, and freedom" },
  Werewolf: { essence: "werewolf transformation and primal duality" },
  "Black Jaguar": { essence: "black jaguar power — sleek and commanding" },
  Tiger: { essence: "fierce tiger energy — electric and unstoppable" },
  "Spider Web": { essence: "intricate spider web patterns of patience" },
  "Sun And Moon": { essence: "the eternal sun and moon duality" },
  Star: { essence: "star motifs — ancient light guiding the lost" },
  Sunset: { essence: "golden sunset scenes of endings and beginnings" },
  Sun: { essence: "radiant sun energy — the source of all warmth" },
  Moon: { essence: "lunar mystery and the phases of change" },
  Sunrise: { essence: "sunrise symbolism — the promise of every new day" },
  Aztec: { essence: "Aztec heritage patterns and ancient warrior gods" },
  Egyptian: { essence: "Egyptian mythology and Nile-born mysticism" },
  Celtic: { essence: "Celtic knotwork from the mists of ancient Europe" },
  Flash: { essence: "classic flash art — bold, timeless, walk-in cool" },
  Henna: { essence: "henna-inspired organic flow and intricate detail" },
  Yakuza: { essence: "Yakuza irezumi tradition and full-body storytelling" },
  "Sugar Skull": { essence: "sugar skull Day of the Dead color and joy" },
};

const styleDescriptions: Record<string, string> = {
  All: "Every tattoo tells a story only its wearer truly knows. Browse our entire collection — from razor-sharp geometric precision and delicate watercolor washes to ancient tribal heritage and dreamlike surrealism. Whatever draws you in, your perfect design is waiting somewhere in this gallery.",
  Blackwork: "Blackwork is the art of commitment — bold, uncompromising lines and deep solid ink that ages with extraordinary grace. These designs command attention through contrast alone, turning the skin into a striking monochrome canvas. If you believe that the strongest statements need no colour, blackwork speaks your language.",
  Geometric: "Geometry has fascinated humans since the dawn of civilisation, and geometric tattooing transforms that obsession into wearable art. Sacred shapes, impossible symmetry, and razor-precise linework come together in designs that feel both ancient and futuristic. Every angle is intentional, every intersection meaningful.",
  Watercolor: "Watercolor tattoos capture the spontaneous beauty of paint bleeding across wet paper — vivid splashes, soft gradients, and brushstroke edges that make the skin feel like a living canvas. These designs are joyful, expressive, and utterly unique, because no two watercolor pieces ever bleed quite the same way.",
  Traditional: "Rooted in the golden age of sailor tattoos and carnival flash, traditional tattooing is bold, bright, and built to last. Thick outlines, a classic limited palette, and iconic imagery make these designs as recognisable a century from now as they are today. Timeless is not a strong enough word.",
  Minimalist: "Minimalist tattoos prove that restraint is its own form of power. A single clean line, a tiny symbol, a whisper of ink — these designs carry enormous meaning in the smallest possible space. They suit every placement, age beautifully, and speak loudest in the quietest moments.",
  Realism: "Realism tattoos are an act of technical wizardry — hyper-detailed shading, precise tonal range, and extraordinary skill combine to blur the line between photograph and skin. Portraits, animals, objects, and scenes rendered so convincingly you have to look twice to believe they are ink.",
  Tribal: "Tribal tattooing is one of humanity's oldest forms of identity and belonging, with roots in Polynesian, Maori, and indigenous cultures worldwide. These bold, rhythmic patterns speak the language of heritage, strength, and spiritual connection — worn not just as decoration, but as a declaration of who you are and where you come from.",
  Japanese: "Japanese irezumi is one of the world's most complete and storied tattoo traditions. Flowing compositions, mythic creatures, crashing waves, cherry blossoms, and warrior imagery come together in a visual language developed over centuries. These designs are not just tattoos — they are full narratives worn on the body.",
  Dotwork: "Dotwork is meditative tattooing — thousands of individual points placed with extraordinary patience to build texture, tone, and breathtaking detail. Up close you see the dots; from a distance, a seamless masterpiece emerges. The technique suits mandalas, geometric forms, and portraiture alike with stunning results.",
  Sketch: "Sketch-style tattoos look like a master artist's pencil drawing brought permanently to life on skin. Loose, energetic lines, visible hatching, and that wonderful sense of an artwork caught mid-creation give these designs a raw, intellectual energy that finished illustrations simply cannot replicate.",
  Surrealism: "Surrealist tattoos drag the subconscious mind into the visible world. Melting clocks, impossible anatomies, dreamscapes where gravity and logic no longer apply — these designs are deeply personal, endlessly conversation-starting, and utterly unlike anything else. Wear your inner dream life on the outside.",
};

type FilterCategory = keyof typeof filterCategories;
type ActiveFilters = Record<FilterCategory, string[]>;

const createEmptyFilters = () =>
  Object.fromEntries(
    Object.keys(filterCategories).map((cat) => [cat, [] as string[]]),
  ) as ActiveFilters;

const join = (arr: string[]) => {
  if (arr.length === 0) return "";
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return `${arr.slice(0, -1).join(", ")}, and ${arr[arr.length - 1]}`;
};

function buildDescription(
  activeStyle: string,
  activeFilters: ActiveFilters,
): { label: string; description: string } {
  const activeValues = (Object.values(activeFilters) as string[][]).flat();

  // ── No filters at all → full "All" overview ────────────────────────────
  if (activeValues.length === 0 && activeStyle === "All") {
    return {
      label: "All Designs",
      description: styleDescriptions.All,
    };
  }

  // ── Only style tab, no chips ───────────────────────────────────────────
  if (activeValues.length === 0) {
    return {
      label: activeStyle,
      description:
        styleDescriptions[activeStyle] ??
        `Explore our curated collection of ${activeStyle} tattoo designs — each one crafted with intention, artistry, and a deep respect for the tradition it draws from. Whether you are a first-timer or a seasoned collector, these pieces are designed to resonate.`,
    };
  }

  // ── One or more filter chips active → build combined sentence ─────────
  const genders = activeValues.filter((v) => filterCategories.Gender.includes(v));
  const bodyParts = activeValues.filter((v) => filterCategories["Body Part"].includes(v));
  const themes = activeValues.filter((v) =>
    [
      ...filterCategories.Themes,
      ...filterCategories.Symbol,
      ...filterCategories.Floral,
      ...filterCategories.Animals,
      ...filterCategories.Celestial,
      ...filterCategories.Unique,
    ].includes(v),
  );

  const stylePrefix = activeStyle !== "All" ? `${activeStyle} ` : "";
  const themeEssences = themes.map((v) => valueSnippets[v]?.essence).filter(Boolean) as string[];
  const genderEssences = genders.map((v) => valueSnippets[v]?.essence).filter(Boolean) as string[];
  const bodyEssences = bodyParts.map((v) => valueSnippets[v]?.essence).filter(Boolean) as string[];

  // Build sentence fragments
  const parts: string[] = [];
  if (genderEssences.length) parts.push(`forged with ${join(genderEssences)}`);
  if (themeEssences.length)
    parts.push(
      themeEssences.length === 1
        ? `centred around ${themeEssences[0]}`
        : `weaving together ${join(themeEssences)}`,
    );
  if (bodyEssences.length)
    parts.push(
      bodyEssences.length === 1
        ? `perfectly suited to ${bodyEssences[0]}`
        : `thoughtfully composed for ${join(bodyEssences)}`,
    );

  // Closing sentence varies by how many filters are active
  const closing =
    activeValues.length === 1
      ? `Every piece in this selection has been chosen because it captures that feeling perfectly — browse slowly, something here was made for you.`
      : activeValues.length <= 3
        ? `Each design in this edit has been chosen for how powerfully it brings those elements together — a small but potent collection worth exploring in full.`
        : `With this many layers of intent stacked together, every result you see here is genuinely rare — a design that checks every one of your boxes at once.`;

  const coreDesc =
    parts.length > 0
      ? `${stylePrefix}tattoo${activeValues.length > 1 ? "s" : ""} ${parts.join(", ")} — a curated edit that speaks directly to a very specific kind of collector. ${closing}`
      : `A focused collection of ${stylePrefix}designs featuring ${join(
        activeValues.map((v) => valueSnippets[v]?.essence ?? v),
      )}. ${closing}`;

  // Label
  const label =
    activeValues.length === 1
      ? `${stylePrefix}${activeValues[0]}`
      : activeValues.length <= 3
        ? activeValues.join(" · ")
        : `${activeValues.length} Filters Active`;

  return { label, description: coreDesc };
}

export default function Explore() {
  const [search, setSearch] = useState("");
  const [activeStyle, setActiveStyle] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [activeSort, setActiveSort] = useState("Popular");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(createEmptyFilters());
  const [likedIds, setLikedIds] = useState<Record<number, boolean>>({});
  const [extraLikes, setExtraLikes] = useState<Record<number, number>>({});

  const toggleLike = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLikedIds((prev) => {
      const wasLiked = !!prev[id];
      setExtraLikes((el) => ({
        ...el,
        [id]: wasLiked ? (el[id] || 1) - 1 : (el[id] || 0) + 1,
      }));
      return { ...prev, [id]: !wasLiked };
    });
  }, []);

  const toggleFilter = useCallback((category: FilterCategory, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters(createEmptyFilters());
    setActiveStyle("All");
    setActiveSort("Popular");
  }, []);

  const hasActiveFilters = useMemo(
    () => activeStyle !== "All" || Object.values(activeFilters).some((arr) => arr.length > 0),
    [activeStyle, activeFilters],
  );

  const activeFilterCount = useMemo(
    () =>
      Object.values(activeFilters).reduce((c, v) => c + v.length, 0) +
      (activeStyle === "All" ? 0 : 1),
    [activeFilters, activeStyle],
  );

  // Always returns something — never null
  const activeDescription = useMemo(
    () => buildDescription(activeStyle, activeFilters),
    [activeStyle, activeFilters],
  );

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = flashDesigns.filter((d) => {
      if (activeStyle !== "All" && d.style !== activeStyle) return false;
      if (q && !d.style.toLowerCase().includes(q)) return false;
      if (activeFilters.Gender.length && d.gender && !activeFilters.Gender.includes(d.gender)) return false;
      if (activeFilters["Body Part"].length && d.bodyPart && !activeFilters["Body Part"].includes(d.bodyPart)) return false;
      if (activeFilters.Themes.length && d.theme && !activeFilters.Themes.includes(d.theme)) return false;
      if (activeFilters.Symbol.length && d.symbol && !activeFilters.Symbol.includes(d.symbol)) return false;
      if (activeFilters.Floral.length && d.floral && !activeFilters.Floral.includes(d.floral)) return false;
      if (activeFilters.Animals.length && d.animal && !activeFilters.Animals.includes(d.animal)) return false;
      if (activeFilters.Celestial.length && d.celestial && !activeFilters.Celestial.includes(d.celestial)) return false;
      if (activeFilters.Unique.length && d.unique && !activeFilters.Unique.includes(d.unique)) return false;
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
        <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Sort by</label>
        <div className="flex flex-wrap gap-1">
          {sortOptions.map((o) => (
            <button key={o} onClick={() => setActiveSort(o)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activeSort === o ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {o}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Style</label>
        <div className="flex flex-wrap gap-1">
          {["All", ...styles].map((s) => (
            <button key={s} onClick={() => setActiveStyle(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activeStyle === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      {(Object.entries(filterCategories) as [FilterCategory, string[]][]).map(([category, options]) => (
        <div key={category}>
          <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">{category}</label>
          <div className="flex flex-wrap gap-1">
            {options.map((opt) => (
              <button key={opt} onClick={() => toggleFilter(category, opt)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activeFilters[category].includes(opt) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      {hasActiveFilters && (
        <button onClick={clearAllFilters}
          className="text-xs text-muted-foreground underline hover:text-foreground transition-colors text-left mt-1">
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
          <p className="mb-8 text-muted-foreground">Browse our collection of AI-generated tattoo designs</p>
        </div>

        {/* Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="search-designs" className="sr-only">Search tattoo ideas</label>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="search-designs" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tattoo ideas..."
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="outline" className="border-border gap-2 lg:hidden"
            onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}>
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Mobile drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
            <div className="filter-scroll absolute left-0 top-0 h-full w-72 overflow-y-auto rounded-r-2xl border-r border-border bg-card p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold text-sm">Filters</span>
                <button onClick={() => setShowFilters(false)}
                  className="rounded-full p-1 hover:bg-secondary transition-colors" aria-label="Close filters">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        <div className="flex gap-6 items-start">
          {/* Desktop sidebar */}
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
            {/* Style tabs */}
            <div className="mb-4 flex flex-wrap gap-2">
              {["All", ...styles].map((s) => (
                <button key={s} onClick={() => setActiveStyle(s)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${activeStyle === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                  {s}
                </button>
              ))}
            </div>

            {/* ── Description banner — always visible, never conditional ─── */}
            <div key={activeDescription.label} className="animate-desc-in mb-6 rounded-xl border border-border bg-card px-5 py-4">
              {/* Active filter chips — only when filters are on */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {activeStyle !== "All" && (
                    <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                      {activeStyle}
                    </span>
                  )}
                  {(Object.values(activeFilters) as string[][]).flat().map((v) => (
                    <span key={v} className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                      {v}
                    </span>
                  ))}
                </div>
              )}

              {/* Label */}
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-1">
                {activeDescription.label}
              </p>

              {/* Description — always present */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activeDescription.description}
              </p>
            </div>

            {/* Grid */}
            <div className="columns-2 gap-3 sm:columns-2 xl:columns-3 [column-fill:_balance]">
              {sorted.map((design, i) => {
                const isLiked = !!likedIds[design.id];
                const displayLikes = (design.likes || 0) + (extraLikes[design.id] || 0);
                return (
                  <article key={design.id}
                    className="group mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card cursor-pointer">
                    <div className="relative overflow-hidden">
                      <Image
                        src={design.image} alt={`${design.style} tattoo`}
                        width={900} height={1200}
                        sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        priority={i < 4} loading={i < 4 ? undefined : "lazy"}
                        className="w-full h-auto object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Button asChild size="sm" className="btn-glow border-0 text-primary-foreground text-xs px-4">
                          <Link href={`/design/${design.id}`}>View Design</Link>
                        </Button>
                      </div>
                      <button onClick={(e) => toggleLike(e, design.id)}
                        aria-label={isLiked ? "Unlike" : "Like"} aria-pressed={isLiked}
                        className={`absolute top-2.5 right-2.5 rounded-full p-1.5 transition-all duration-200 ${isLiked ? "bg-pink-500/20 opacity-100" : "bg-background/60 opacity-0 group-hover:opacity-100 hover:bg-background/80"}`}>
                        <Heart className={`h-3.5 w-3.5 transition-colors duration-200 ${isLiked ? "fill-pink-500 text-pink-500 animate-like-pop" : "text-foreground"}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary truncate max-w-[70%]">
                        {design.style}
                      </span>
                      <span className={`flex items-center gap-1 text-[11px] transition-colors duration-200 ${isLiked ? "text-pink-500" : "text-muted-foreground"}`}>
                        <Heart className={`h-3 w-3 transition-all duration-200 ${isLiked ? "fill-pink-500 text-pink-500" : ""}`} />
                        {displayLikes}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>

            {sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-muted-foreground text-sm">No designs match your filters.</p>
                <button onClick={clearAllFilters}
                  className="mt-3 text-xs text-primary underline hover:opacity-80 transition-opacity">
                  Clear all filters
                </button>
              </div>
            )}

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
