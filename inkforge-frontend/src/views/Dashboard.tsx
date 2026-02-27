"use client";
import { useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Home, Sparkles, Compass, Settings, Crown, Heart,
  Download, Trash2, Plus, Menu, X, Search, SlidersHorizontal,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  LogOut, User, CreditCard, Receipt, Trash, Eye, EyeOff,
  Share2, RefreshCw, ImageIcon, Check, ChevronDown, ChevronUp,
} from "lucide-react";
import { flashDesigns, styles } from "@/lib/data";

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 20;

const NAV_ITEMS = [
  { id: "my-designs", icon: Home,      label: "My Designs" },
  { id: "favorites",  icon: Heart,     label: "Favorites"  },
  { id: "generate",   icon: Sparkles,  label: "Generate"   },
  { id: "explore",    icon: Compass,   label: "Explore"    },
  { id: "pricing",    icon: Crown,     label: "Pricing"    },
  { id: "settings",   icon: Settings,  label: "Settings"   },
] as const;
type NavId = typeof NAV_ITEMS[number]["id"];

const SETTINGS_TABS = [
  { id: "account", icon: User,       label: "Account Info" },
  { id: "billing", icon: CreditCard, label: "Billing"      },
] as const;
type SettingsTab = typeof SETTINGS_TABS[number]["id"];

// ─── Explore helpers ──────────────────────────────────────────────────────────
const sortOptions = ["Popular", "Newest", "Most Liked"];
const filterCategories = {
  Gender:    ["Men", "Women"],
  "Body Part": ["Forearm","Full Sleeve","Half Sleeve","Thigh","Hand","Shoulder","Wrist","Band","Back","Calf","Chest","Sternum","Finger","Ankle"],
  Themes:    ["Skull","Space","Book","Gothic","Ocean","Cartoon","Compass"],
  Symbol:    ["Anxiety","Strength","Warrior","Mom","Sister","Zodiac"],
  Floral:    ["Rose","Flower","Lotus","Wildflower","Orchid","Dandelion"],
  Animals:   ["Lion","Wolf","Werewolf","Black Jaguar","Tiger","Spider Web"],
  Celestial: ["Sun And Moon","Star","Sunset","Sun","Moon","Sunrise"],
  Unique:    ["Aztec","Egyptian","Celtic","Flash","Henna","Yakuza","Sugar Skull"],
};
type FilterCategory = keyof typeof filterCategories;
type ActiveFilters   = Record<FilterCategory, string[]>;
const createEmptyFilters = (): ActiveFilters =>
  Object.fromEntries(Object.keys(filterCategories).map((c) => [c, []])) as unknown as ActiveFilters;
function distributeIntoColumns<T>(items: T[], n: number): T[][] {
  const cols: T[][] = Array.from({ length: n }, () => []);
  items.forEach((item, i) => cols[i % n].push(item));
  return cols;
}

// ─── Shared: Pagination Bar ───────────────────────────────────────────────────
function PaginationBar({ currentPage, totalPages, totalCount, onGoToPage }: {
  currentPage: number; totalPages: number; totalCount: number; onGoToPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const nums = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };
  const iconCls = "inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-card text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary";
  const pageCls = "inline-flex items-center justify-center h-8 min-w-[2rem] px-2.5 rounded-lg border border-border bg-card text-sm font-medium transition-all hover:bg-secondary";
  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-xs text-muted-foreground">
        Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
        <span className="font-semibold text-foreground">{totalPages}</span>
        <span className="ml-1">({totalCount.toLocaleString()} designs)</span>
      </p>
      <div className="flex items-center gap-1">
        <button className={iconCls} onClick={() => onGoToPage(1)} disabled={currentPage === 1} title="First page"><ChevronsLeft className="h-4 w-4" /></button>
        <button className={iconCls} onClick={() => onGoToPage(currentPage - 1)} disabled={currentPage === 1} title="Previous page"><ChevronLeft className="h-4 w-4" /></button>
        <div className="flex items-center gap-1 mx-1">
          {nums().map((p, idx) =>
            p === "..." ? (
              <span key={`e${idx}`} className="px-1 text-muted-foreground text-sm">…</span>
            ) : (
              <button key={p} onClick={() => onGoToPage(p as number)}
                className={`${pageCls} ${currentPage === p ? "bg-primary text-primary-foreground border-primary hover:bg-primary" : ""}`}>
                {p}
              </button>
            )
          )}
        </div>
        <button className={iconCls} onClick={() => onGoToPage(currentPage + 1)} disabled={currentPage === totalPages} title="Next page"><ChevronRight className="h-4 w-4" /></button>
        <button className={iconCls} onClick={() => onGoToPage(totalPages)} disabled={currentPage === totalPages} title="Last page"><ChevronsRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

// ─── View: My Designs ─────────────────────────────────────────────────────────
function MyDesignsView({ onNavigate }: { onNavigate: (id: NavId) => void }) {
  const myDesigns = flashDesigns.slice(0, 6);
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">My Designs</h1>
          <p className="text-sm text-muted-foreground mt-1">Your saved tattoo designs</p>
        </div>
        <Button onClick={() => onNavigate("generate")} className="btn-glow border-0 text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Generate New Design
        </Button>
      </div>
      {myDesigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
          <p className="text-muted-foreground text-sm">No designs yet.</p>
          <button onClick={() => onNavigate("generate")} className="mt-3 text-xs text-primary underline hover:opacity-80">
            Generate your first design
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myDesigns.map((design) => (
            <div key={design.id} className="group card-hover overflow-hidden rounded-2xl border border-border bg-card">
              <div className="aspect-square overflow-hidden">
                <Image src={design.image} alt={`${design.style} tattoo`} width={700} height={700}
                  sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                  className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{design.style}</span>
                  <span className="text-xs text-muted-foreground">{design.date}</span>
                </div>
                <div className="flex gap-1">
                  <button className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"><Download className="h-4 w-4" /></button>
                  <button className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── View: Favorites ──────────────────────────────────────────────────────────
function FavoritesView({ onNavigate }: { onNavigate: (id: NavId) => void }) {
  const favoriteDesigns = flashDesigns.slice(2, 5);
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Favorites</h1>
        <p className="text-sm text-muted-foreground mt-1">Designs you've liked</p>
      </div>
      {favoriteDesigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
          <p className="text-muted-foreground text-sm">No favorites yet.</p>
          <button onClick={() => onNavigate("explore")} className="mt-3 text-xs text-primary underline hover:opacity-80">Browse designs to like</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteDesigns.map((design) => (
            <div key={design.id} className="group card-hover overflow-hidden rounded-2xl border border-border bg-card">
              <div className="aspect-square overflow-hidden relative">
                <Image src={design.image} alt={`${design.style} tattoo`} width={700} height={700}
                  sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                  className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <button className="absolute top-2.5 right-2.5 rounded-full p-1.5 bg-pink-500/20">
                  <Heart className="h-3.5 w-3.5 fill-pink-500 text-pink-500" />
                </button>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{design.style}</span>
                <button className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"><Download className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── View: Generate ───────────────────────────────────────────────────────────
function GenerateView() {
  const placementsList  = ["Forearm","Full Sleeve","Half Sleeve","Thigh","Hand","Shoulder","Wrist","Band","Back","Calf","Chest","Sternum","Finger","Ankle"];
  const complexityLabels = ["Simple","Light","Medium","Detailed","Complex"];

  const [prompt, setPrompt]                       = useState("");
  const [selectedStyle, setSelectedStyle]         = useState("Minimalist");
  const [selectedPlacement, setSelectedPlacement] = useState("Forearm");
  const [complexity, setComplexity]               = useState(3);
  const [colorMode, setColorMode]                 = useState<"bw"|"color">("bw");
  const [lineWeight, setLineWeight]               = useState<"Fine"|"Medium"|"Bold">("Medium");
  const [generating, setGenerating]               = useState(false);
  const [result, setResult]                       = useState<string|null>(null);
  const [credits, setCredits]                     = useState(3);

  const handleGenerate = () => {
    if (credits <= 0 || !prompt.trim()) return;
    setGenerating(true);
    setResult(null);
    setTimeout(() => {
      setResult(flashDesigns[Math.floor(Math.random() * flashDesigns.length)].image);
      setGenerating(false);
      setCredits((c) => Math.max(0, c - 1));
    }, 2000);
  };

  const recentGenerations = flashDesigns.slice(0, 4).map((d) => d.image);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold md:text-3xl tracking-wider">
          AI Tattoo <span className="text-gradient">Generator</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Describe your idea and let AI create your perfect design</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Controls */}
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">Describe your tattoo idea</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="A wolf howling at the moon with geometric patterns..."
              className="w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-none" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Style</label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button key={s} onClick={() => setSelectedStyle(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedStyle === s ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Placement</label>
            <div className="flex flex-wrap gap-2">
              {placementsList.map((p) => (
                <button key={p} onClick={() => setSelectedPlacement(p)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedPlacement === p ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Complexity: {complexityLabels[complexity - 1]}
            </label>
            <input type="range" min={1} max={5} value={complexity}
              onChange={(e) => setComplexity(Number(e.target.value))}
              className="w-full accent-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Color</label>
              <div className="flex gap-2">
                {(["bw","color"] as const).map((m) => (
                  <button key={m} onClick={() => setColorMode(m)}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${colorMode === m ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"}`}>
                    {m === "bw" ? "B & W" : "Color"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Line Weight</label>
              <div className="flex gap-2">
                {(["Fine","Medium","Bold"] as const).map((w) => (
                  <button key={w} onClick={() => setLineWeight(w)}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${lineWeight === w ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"}`}>
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={generating || credits <= 0 || !prompt.trim()}
            className="btn-glow w-full border-0 text-primary-foreground gap-2 h-12 text-base">
            {generating
              ? <><span className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin inline-block mr-2" />Generating...</>
              : <><Sparkles className="h-5 w-5" /> Generate Design</>}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            You have <span className="font-semibold text-primary">{credits}</span> credits remaining
          </p>
        </div>
        {/* Right: Preview */}
        <div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="aspect-square flex items-center justify-center">
              {generating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Creating your design...</p>
                </div>
              ) : result ? (
                <Image src={result} alt="Generated tattoo" width={1200} height={1200}
                  sizes="(max-width:1024px) 100vw,50vw" priority
                  className={`h-full w-full object-cover ${colorMode === "bw" ? "grayscale" : ""}`} />
              ) : (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">Your tattoo will appear here</p>
                </div>
              )}
            </div>
            <div className={`border-t border-border p-4 ${result ? "" : "invisible min-h-[112px]"}`}>
              {result && (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{selectedStyle}</span>
                    <span className="rounded-full bg-card border border-border px-3 py-1 text-xs text-muted-foreground">{selectedPlacement}</span>
                    <span className="rounded-full bg-card border border-border px-3 py-1 text-xs text-muted-foreground">{complexityLabels[complexity - 1]}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="btn-glow flex-1 border-0 text-primary-foreground gap-1"><Download className="h-3.5 w-3.5" /> Download HD</Button>
                    <Button size="sm" variant="outline" className="border-border gap-1"><Heart className="h-3.5 w-3.5" /> Save</Button>
                    <Button size="sm" variant="outline" className="border-border gap-1"><Share2 className="h-3.5 w-3.5" /> Share</Button>
                    <Button size="sm" variant="outline" className="border-border gap-1" onClick={handleGenerate}><RefreshCw className="h-3.5 w-3.5" /> Variation</Button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground tracking-widest">Recent Generations</h3>
            <div className="grid grid-cols-4 gap-2">
              {recentGenerations.map((img, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-xl border border-border">
                  <Image src={img} alt={`Recent generation ${i + 1}`} width={300} height={300}
                    sizes="(max-width:1024px) 25vw,12vw"
                    className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── View: Explore ────────────────────────────────────────────────────────────
function ExploreView() {
  const [search, setSearch]               = useState("");
  const [activeStyle, setActiveStyle]     = useState("All");
  const [showFilters, setShowFilters]     = useState(false);
  const [activeSort, setActiveSort]       = useState("Popular");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(createEmptyFilters());
  const [likedIds, setLikedIds]           = useState<Record<number, boolean>>({});
  const [extraLikes, setExtraLikes]       = useState<Record<number, number>>({});
  const [currentPage, setCurrentPage]     = useState(1);

  const toggleLike = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation(); e.preventDefault();
    setLikedIds((prev) => {
      const was = !!prev[id];
      setExtraLikes((el) => ({ ...el, [id]: was ? (el[id] || 1) - 1 : (el[id] || 0) + 1 }));
      return { ...prev, [id]: !was };
    });
  }, []);

  const toggleFilter = useCallback((cat: FilterCategory, val: string) => {
    setActiveFilters((prev) => {
      const cur = prev[cat];
      return { ...prev, [cat]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val] };
    });
    setCurrentPage(1);
  }, []);

  const clearAll = useCallback(() => {
    setActiveFilters(createEmptyFilters());
    setActiveStyle("All");
    setActiveSort("Popular");
    setCurrentPage(1);
  }, []);

  const hasActive  = useMemo(() => activeStyle !== "All" || Object.values(activeFilters).some((a) => a.length > 0), [activeStyle, activeFilters]);
  const activeCount = useMemo(() => Object.values(activeFilters).reduce((c, v) => c + v.length, 0) + (activeStyle === "All" ? 0 : 1), [activeFilters, activeStyle]);

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = flashDesigns.filter((d) => {
      if (activeStyle !== "All" && d.style !== activeStyle) return false;
      if (q && !d.style.toLowerCase().includes(q)) return false;
      if (activeFilters.Gender.length    && d.gender    && !activeFilters.Gender.includes(d.gender))             return false;
      if (activeFilters["Body Part"].length && d.bodyPart && !activeFilters["Body Part"].includes(d.bodyPart))   return false;
      if (activeFilters.Themes.length    && d.theme     && !activeFilters.Themes.includes(d.theme))             return false;
      if (activeFilters.Symbol.length    && d.symbol    && !activeFilters.Symbol.includes(d.symbol))            return false;
      if (activeFilters.Floral.length    && d.floral    && !activeFilters.Floral.includes(d.floral))            return false;
      if (activeFilters.Animals.length   && d.animal    && !activeFilters.Animals.includes(d.animal))           return false;
      if (activeFilters.Celestial.length && d.celestial && !activeFilters.Celestial.includes(d.celestial))      return false;
      if (activeFilters.Unique.length    && d.unique    && !activeFilters.Unique.includes(d.unique))            return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (activeSort === "Most Liked") return (b.likes || 0) - (a.likes || 0);
      if (activeSort === "Newest")     return (b.id    || 0) - (a.id    || 0);
      return 0;
    });
  }, [activeFilters, activeSort, activeStyle, search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE)), [sorted]);
  const paginated  = useMemo(() => sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [sorted, currentPage]);
  const goToPage   = useCallback((p: number) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const cols2 = useMemo(() => distributeIntoColumns(paginated, 2), [paginated]);
  const cols3 = useMemo(() => distributeIntoColumns(paginated, 3), [paginated]);
  const cols4 = useMemo(() => distributeIntoColumns(paginated, 4), [paginated]);

  const renderCard = (design: typeof flashDesigns[0], i: number) => {
    const isLiked = !!likedIds[design.id];
    const likes   = (design.likes || 0) + (extraLikes[design.id] || 0);
    return (
      <article key={design.id} className="group mb-3 overflow-hidden rounded-2xl border border-border bg-card cursor-pointer">
        <div className="relative overflow-hidden">
          <Image src={design.image} alt={`${design.style} tattoo`} width={600} height={900}
            sizes="(max-width:640px) 50vw,(max-width:1280px) 33vw,25vw"
            priority={i < 6} loading={i < 6 ? undefined : "lazy"}
            className="w-full h-auto object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105" />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-3">
            <span className="inline-flex self-start rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">View Design</span>
          </div>
          <button onClick={(e) => toggleLike(e, design.id)}
            className={`absolute top-2.5 right-2.5 rounded-full p-1.5 transition-all duration-200 ${isLiked ? "bg-pink-500/20 opacity-100" : "bg-black/40 opacity-0 group-hover:opacity-100 hover:bg-black/60"}`}>
            <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-pink-500 text-pink-500" : "text-white"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary truncate max-w-[70%]">{design.style}</span>
          <span className={`flex items-center gap-1 text-[11px] ${isLiked ? "text-pink-500" : "text-muted-foreground"}`}>
            <Heart className={`h-3 w-3 ${isLiked ? "fill-pink-500 text-pink-500" : ""}`} />{likes}
          </span>
        </div>
      </article>
    );
  };

  const FilterPanel = () => (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Sort by</label>
        <div className="flex flex-wrap gap-1">
          {sortOptions.map((o) => (
            <button key={o} onClick={() => { setActiveSort(o); setCurrentPage(1); }}
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
            <button key={s} onClick={() => { setActiveStyle(s); setCurrentPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activeStyle === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      {(Object.entries(filterCategories) as [FilterCategory, string[]][]).map(([cat, opts]) => (
        <div key={cat}>
          <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">{cat}</label>
          <div className="flex flex-wrap gap-1">
            {opts.map((opt) => (
              <button key={opt} onClick={() => toggleFilter(cat, opt)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activeFilters[cat].includes(opt) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      {hasActive && (
        <button onClick={clearAll} className="text-xs text-muted-foreground underline hover:text-foreground text-left mt-1">Clear all filters</button>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Explore</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse AI-generated tattoo designs</p>
      </div>
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search styles..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {hasActive && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">{activeCount}</span>}
        </button>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", ...styles].map((s) => (
          <button key={s} onClick={() => { setActiveStyle(s); setCurrentPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${activeStyle === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="flex gap-6 items-start">
        {showFilters && (
          <aside className="w-52 shrink-0">
            <div className="sticky top-4 rounded-xl border border-border bg-card p-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-sm">Filters</span>
                <button onClick={() => setShowFilters(false)} className="rounded-full p-1 hover:bg-secondary transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <FilterPanel />
            </div>
          </aside>
        )}
        <div className="flex-1 min-w-0">
          {paginated.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 md:hidden">
                {cols2.map((col, ci) => <div key={ci} className="flex flex-col gap-3">{col.map((d, i) => renderCard(d, ci * cols2[0].length + i))}</div>)}
              </div>
              <div className="hidden md:grid xl:hidden grid-cols-3 gap-3">
                {cols3.map((col, ci) => <div key={ci} className="flex flex-col gap-3">{col.map((d, i) => renderCard(d, ci * cols3[0].length + i))}</div>)}
              </div>
              <div className="hidden xl:grid grid-cols-4 gap-3">
                {cols4.map((col, ci) => <div key={ci} className="flex flex-col gap-3">{col.map((d, i) => renderCard(d, ci * cols4[0].length + i))}</div>)}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-muted-foreground text-sm">No designs match your filters.</p>
              <button onClick={clearAll} className="mt-3 text-xs text-primary underline hover:opacity-80">Clear all filters</button>
            </div>
          )}
          <PaginationBar currentPage={currentPage} totalPages={totalPages} totalCount={sorted.length} onGoToPage={goToPage} />
        </div>
      </div>
    </div>
  );
}

// ─── View: Pricing ────────────────────────────────────────────────────────────
const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out InkForge AI",
    credits: 3,
    features: ["3 AI generations", "Basic styles", "Standard quality", "Personal use only"],
    unavailable: ["HD downloads", "Commercial use", "Priority generation", "Advanced styles"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For tattoo enthusiasts who want more",
    credits: 50,
    features: ["50 AI generations/mo", "All styles", "HD downloads", "Commercial use", "Priority generation", "Save & organise designs"],
    unavailable: ["API access", "White-label"],
    cta: "Start Pro",
    highlight: true,
  },
  {
    name: "Artist",
    price: "$29",
    period: "per month",
    description: "For professional tattoo artists",
    credits: 200,
    features: ["200 AI generations/mo", "All styles", "HD downloads", "Commercial use", "Priority generation", "Save & organise designs", "API access", "Client sharing"],
    unavailable: [],
    cta: "Start Artist",
    highlight: false,
  },
];

const faqs = [
  { q: "Can I cancel anytime?",        a: "Yes, you can cancel your subscription at any time. Your access continues until the end of your billing period." },
  { q: "Do credits roll over?",         a: "No, credits reset at the beginning of each billing cycle. Make sure to use them!" },
  { q: "Can I use designs commercially?", a: "Commercial use is available on Pro and Artist plans. Free plan designs are for personal use only." },
  { q: "What styles are supported?",    a: "We support 11 styles: Blackwork, Geometric, Watercolor, Traditional, Minimalist, Realism, Tribal, Japanese, Dotwork, Sketch, and Surrealism." },
  { q: "Is there a free trial?",        a: "Yes! Every new account gets 3 free credits to try the platform. No credit card required." },
];

function PricingView({ onNavigate }: { onNavigate: (id: NavId) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billing, setBilling] = useState<"monthly"|"yearly">("monthly");

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="font-display text-2xl font-bold md:text-3xl mb-2">
          Simple, Transparent <span className="text-gradient">Pricing</span>
        </h1>
        <p className="text-muted-foreground text-sm mb-6">Choose the plan that works for you</p>
        {/* Billing toggle */}
        <div className="inline-flex items-center rounded-full border border-border bg-card p-1 gap-1">
          <button onClick={() => setBilling("monthly")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Monthly
          </button>
          <button onClick={() => setBilling("yearly")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${billing === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Yearly <span className="ml-1 text-[10px] text-green-500 font-semibold">–20%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="grid gap-6 md:grid-cols-3 mb-16">
        {pricingPlans.map((plan) => {
          const yearlyPrice = plan.price === "$0" ? "$0" : `$${Math.round(parseInt(plan.price.slice(1)) * 0.8)}`;
          const displayPrice = billing === "yearly" ? yearlyPrice : plan.price;
          return (
            <div key={plan.name}
              className={`relative rounded-2xl border p-6 flex flex-col gap-4 transition-all ${plan.highlight ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border bg-card"}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">Most Popular</span>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-foreground">{displayPrice}</span>
                  <span className="text-sm text-muted-foreground pb-1">/{billing === "yearly" ? "mo, billed yearly" : plan.period}</span>
                </div>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              </div>
              <div className="rounded-xl bg-primary/10 px-4 py-2.5 text-center">
                <span className="text-sm font-semibold text-primary">{plan.credits} credits</span>
                <span className="text-xs text-muted-foreground ml-1">/ month</span>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />{f}
                  </li>
                ))}
                {plan.unavailable.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground line-through opacity-50">
                    <X className="h-3.5 w-3.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => onNavigate("settings")}
                className={`w-full border-0 gap-1 ${plan.highlight ? "btn-glow text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
                <Crown className="h-3.5 w-3.5" /> {plan.cta}
              </Button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="mb-8 text-center font-display text-xl font-bold tracking-wider">
          Frequently Asked <span className="text-gradient">Questions</span>
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors text-left gap-4">
                {faq.q}
                {openFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── View: Settings ───────────────────────────────────────────────────────────
function SettingsView({ onNavigate }: { onNavigate: (id: NavId) => void }) {
  const [tab, setTab]               = useState<SettingsTab>("account");
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm]             = useState({
    name: "John Doe", email: "john@example.com", country: "", city: "",
    describes: "", expLevel: "", newPassword: "", confirmPassword: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const purchaseHistory = [
    { date: "Feb 1, 2025",  plan: "Pro Monthly",  amount: "$12.00", status: "Paid" },
    { date: "Jan 1, 2025",  plan: "Pro Monthly",  amount: "$12.00", status: "Paid" },
    { date: "Dec 1, 2024",  plan: "Starter Pack", amount: "$5.00",  status: "Paid" },
  ];

  const inputCls = "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const labelCls = "mb-1.5 block text-sm font-medium text-foreground";

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and billing</p>
      </div>
      {/* Sub-tabs */}
      <div className="flex justify-center gap-2 mb-8 border-b border-border">
        {SETTINGS_TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === "account" && (
        <div className="max-w-xl mx-auto space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Name</label><input value={form.name} onChange={set("name")} placeholder="Your name" className={inputCls} /></div>
            <div><label className={labelCls}>Email</label><input value={form.email} onChange={set("email")} type="email" placeholder="you@email.com" className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Country</label><input value={form.country} onChange={set("country")} placeholder="United States" className={inputCls} /></div>
            <div><label className={labelCls}>City</label><input value={form.city} onChange={set("city")} placeholder="New York" className={inputCls} /></div>
          </div>
          <div>
            <label className={labelCls}>Best describes you</label>
            <select value={form.describes} onChange={set("describes")} className={inputCls}>
              <option value="">Select...</option>
              <option>Tattoo enthusiast</option>
              <option>Tattoo artist</option>
              <option>Collector</option>
              <option>Just exploring</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Experience level</label>
            <select value={form.expLevel} onChange={set("expLevel")} className={inputCls}>
              <option value="">Select...</option>
              <option>Beginner — first tattoo</option>
              <option>Intermediate — a few tattoos</option>
              <option>Experienced — many tattoos</option>
              <option>Professional artist</option>
            </select>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-sm font-semibold text-foreground mb-4">Change Password</p>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>New Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={form.newPassword} onChange={set("newPassword")} placeholder="New password" className={`${inputCls} pr-10`} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Confirm New Password</label>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Confirm password" className={`${inputCls} pr-10`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button className="btn-glow border-0 text-primary-foreground gap-2">Save Details</Button>
            <button className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <Trash className="h-4 w-4" /> Delete Account
            </button>
          </div>
        </div>
      )}

      {tab === "billing" && (
        <div className="max-w-xl mx-auto space-y-6">
          {/* Current plan */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Current Plan</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-lg">Pro Monthly</p>
                <p className="text-sm text-muted-foreground">Renews Feb 28, 2026 · $12.00/mo</p>
              </div>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">Active</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => onNavigate("pricing")} className="btn-glow border-0 text-primary-foreground gap-1">
                <Crown className="h-3.5 w-3.5" /> Upgrade Plan
              </Button>
              <button className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel Plan</button>
            </div>
          </div>
          {/* Credits */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Available Credits</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-foreground">0</span>
              <span className="text-sm text-muted-foreground pb-1">/ 3 credits</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: "0%" }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Credits reset on your billing date</p>
          </div>
          {/* Order history */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Order & Purchase History</p>
            <div className="space-y-3">
              {purchaseHistory.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Receipt className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.plan}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{item.amount}</p>
                    <span className="text-[10px] rounded-full bg-green-500/10 text-green-500 px-2 py-0.5 font-medium">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeNav, setActiveNav]     = useState<NavId>("my-designs");
  const [sidebarOpen, setSidebarOpen] = useState(false);       // mobile drawer
  const [collapsed, setCollapsed]     = useState(false);       // desktop collapse
  const creditsUsed  = 3;
  const creditsTotal = 3;

  const navigate = useCallback((id: NavId) => {
    setActiveNav(id);
    setSidebarOpen(false);
  }, []);

  const renderView = () => {
    switch (activeNav) {
      case "my-designs": return <MyDesignsView onNavigate={navigate} />;
      case "favorites":  return <FavoritesView onNavigate={navigate} />;
      case "generate":   return <GenerateView />;
      case "explore":    return <ExploreView />;
      case "pricing":    return <PricingView onNavigate={navigate} />;
      case "settings":   return <SettingsView onNavigate={navigate} />;
    }
  };

  // Sidebar width class depending on collapsed state (desktop only)
  const sidebarW = collapsed ? "md:w-16" : "md:w-64";
  const mainML   = collapsed ? "md:ml-16" : "md:ml-64";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-card border border-border p-2 md:hidden">
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 ${sidebarW} border-r border-border bg-secondary flex flex-col transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        {/* Logo + collapse toggle */}
        <div className="flex items-center justify-between border-b border-border p-4 min-h-[60px]">
          {!collapsed && <span className="font-display text-lg font-bold tracking-wider truncate">InkForge AI</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1 overflow-hidden">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => navigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${activeNav === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"} ${collapsed ? "justify-center px-2" : ""}`}>
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom: credits + upgrade + logout */}
        <div className="border-t border-border p-3 space-y-2">
          {!collapsed && (
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Credits</span>
                <span className="text-xs text-muted-foreground">{creditsUsed}/{creditsTotal}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(creditsUsed / creditsTotal) * 100}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{creditsTotal - creditsUsed} credits remaining</p>
            </div>
          )}
          <button
            onClick={() => navigate("pricing")}
            title={collapsed ? "Upgrade" : undefined}
            className={`w-full flex items-center gap-2 rounded-xl btn-glow px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors ${collapsed ? "justify-center" : ""}`}>
            <Crown className="h-4 w-4 shrink-0" />
            {!collapsed && "Upgrade"}
          </button>
          <button
            title={collapsed ? "Log Out" : undefined}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ${collapsed ? "justify-center" : ""}`}>
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Log Out"}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-background/60 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main content ── */}
      <main className={`flex-1 ${mainML} transition-all duration-300`}>
        <div className="container mx-auto px-4 py-8 md:py-12">
          {renderView()}
        </div>
      </main>
    </div>
  );
}