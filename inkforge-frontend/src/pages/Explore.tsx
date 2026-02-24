// import { useState } from "react";
// import { Navbar } from "@/components/layout/Navbar";
// import { Footer } from "@/components/layout/Footer";
// import { Search, Heart, SlidersHorizontal } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { flashDesigns, styles } from "@/lib/data";
// import { motion } from "framer-motion";

// const sortOptions = ["Popular", "Newest", "Most Liked"];

// export default function Explore() {
//   const [search, setSearch] = useState("");
//   const [activeStyle, setActiveStyle] = useState("All");
//   const [showFilters, setShowFilters] = useState(false);

//   const filtered = flashDesigns.filter((d) => {
//     if (activeStyle !== "All" && d.style !== activeStyle) return false;
//     if (search && !d.style.toLowerCase().includes(search.toLowerCase())) return false;
//     return true;
//   });

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />
//       <div className="container mx-auto px-4 pt-24 pb-16">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
//           <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">
//             Explore <span className="text-gradient">Designs</span>
//           </h1>
//           <p className="mb-8 text-muted-foreground">Browse our collection of AI-generated tattoo designs</p>
//         </motion.div>

//         {/* Search & Filters */}
//         <div className="mb-6 flex flex-col gap-4 sm:flex-row">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search tattoo ideas..."
//               className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
//             />
//           </div>
//           <Button
//             variant="outline"
//             className="border-border gap-2"
//             onClick={() => setShowFilters(!showFilters)}
//           >
//             <SlidersHorizontal className="h-4 w-4" /> Filters
//           </Button>
//         </div>

//         {/* Filter bar */}
//         {showFilters && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             className="mb-6 rounded-xl border border-border bg-card p-4"
//           >
//             <div className="flex flex-wrap gap-4">
//               <div>
//                 <label className="mb-2 block text-xs font-medium text-muted-foreground">Style</label>
//                 <div className="flex flex-wrap gap-1">
//                   {["All", ...styles].map((s) => (
//                     <button
//                       key={s}
//                       onClick={() => setActiveStyle(s)}
//                       className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
//                         activeStyle === s
//                           ? "bg-primary text-primary-foreground"
//                           : "bg-secondary text-muted-foreground hover:text-foreground"
//                       }`}
//                     >
//                       {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <div>
//                 <label className="mb-2 block text-xs font-medium text-muted-foreground">Sort by</label>
//                 <div className="flex gap-1">
//                   {sortOptions.map((o) => (
//                     <button
//                       key={o}
//                       className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
//                     >
//                       {o}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         )}

//         {/* Style tabs */}
//         <div className="mb-6 flex flex-wrap gap-2">
//           {["All", ...styles].map((s) => (
//             <button
//               key={s}
//               onClick={() => setActiveStyle(s)}
//               className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
//                 activeStyle === s
//                   ? "bg-primary text-primary-foreground"
//                   : "bg-card border border-border text-muted-foreground hover:text-foreground"
//               }`}
//             >
//               {s}
//             </button>
//           ))}
//         </div>

//         {/* Masonry-like grid */}
//         <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
//           {filtered.map((design, i) => (
//             <motion.div
//               key={design.id}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: (i % 6) * 0.05 }}
//               className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card"
//             >
//               <div className="relative overflow-hidden">
//                 <img
//                   src={design.image}
//                   alt={`${design.style} tattoo`}
//                   className="w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
//                   style={{ aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/3" }}
//                 />
//                 <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
//                   <Button size="sm" className="btn-glow border-0 text-primary-foreground">
//                     Use As Base
//                   </Button>
//                 </div>
//                 <button className="absolute top-3 right-3 rounded-full bg-background/60 p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background/80">
//                   <Heart className="h-4 w-4 text-foreground" />
//                 </button>
//               </div>
//               <div className="flex items-center justify-between p-3">
//                 <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
//                   {design.style}
//                 </span>
//                 <span className="flex items-center gap-1 text-xs text-muted-foreground">
//                   <Heart className="h-3 w-3" /> {design.likes}
//                 </span>
//               </div>
//             </motion.div>
//           ))}
//         </div>

//         {/* Load More */}
//         <div className="mt-10 text-center">
//           <Button variant="outline" className="border-border">Load More</Button>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// }

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, Heart, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { flashDesigns, styles } from "@/lib/data";
import { motion } from "framer-motion";

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

export default function Explore() {
  const [search, setSearch] = useState("");
  const [activeStyle, setActiveStyle] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [activeSort, setActiveSort] = useState("Popular");

  const navigate = useNavigate();

  // One state object to track selected values per category
  const [activeFilters, setActiveFilters] = useState(
    Object.fromEntries(Object.keys(filterCategories).map((cat) => [cat, []]))
  );

  const toggleFilter = (category, value) => {
    setActiveFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters(
      Object.fromEntries(Object.keys(filterCategories).map((cat) => [cat, []]))
    );
    setActiveStyle("All");
    setActiveSort("Popular");
  };

  const hasActiveFilters =
    activeStyle !== "All" ||
    Object.values(activeFilters).some((arr) => arr.length > 0);

  const filtered = flashDesigns.filter((d) => {
    // Style tab filter
    if (activeStyle !== "All" && d.style !== activeStyle) return false;

    // Search filter
    if (search && !d.style.toLowerCase().includes(search.toLowerCase())) return false;

    // Gender filter
    if (activeFilters.Gender.length > 0 && d.gender && !activeFilters.Gender.includes(d.gender))
      return false;

    // Body Part filter
    if (activeFilters["Body Part"].length > 0 && d.bodyPart && !activeFilters["Body Part"].includes(d.bodyPart))
      return false;

    // Themes filter
    if (activeFilters.Themes.length > 0 && d.theme && !activeFilters.Themes.includes(d.theme))
      return false;

    // Symbol filter
    if (activeFilters.Symbol.length > 0 && d.symbol && !activeFilters.Symbol.includes(d.symbol))
      return false;

    // Floral filter
    if (activeFilters.Floral.length > 0 && d.floral && !activeFilters.Floral.includes(d.floral))
      return false;

    // Animals filter
    if (activeFilters.Animals.length > 0 && d.animal && !activeFilters.Animals.includes(d.animal))
      return false;

    // Celestial filter
    if (activeFilters.Celestial.length > 0 && d.celestial && !activeFilters.Celestial.includes(d.celestial))
      return false;

    // Unique filter
    if (activeFilters.Unique.length > 0 && d.unique && !activeFilters.Unique.includes(d.unique))
      return false;

    return true;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (activeSort === "Most Liked") return (b.likes || 0) - (a.likes || 0);
    if (activeSort === "Newest") return (b.id || 0) - (a.id || 0);
    return 0; // "Popular" — keep original order
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">
            Explore <span className="text-gradient">Designs</span>
          </h1>
          <p className="mb-8 text-muted-foreground">Browse our collection of AI-generated tattoo designs</p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tattoo ideas..."
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button
            variant="outline"
            className="border-border gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                ●
              </span>
            )}
          </Button>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex flex-wrap gap-4">
              {/* Style */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">Style</label>
                <div className="flex flex-wrap gap-1">
                  {["All", ...styles].map((s) => (
                    <button
                      key={s}
                      onClick={() => setActiveStyle(s)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activeStyle === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort by */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">Sort by</label>
                <div className="flex gap-1">
                  {sortOptions.map((o) => (
                    <button
                      key={o}
                      onClick={() => setActiveSort(o)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activeSort === o
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic filter categories from image */}
              {Object.entries(filterCategories).map(([category, options]) => (
                <div key={category}>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    {category}
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => toggleFilter(category, opt)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activeFilters[category].includes(opt)
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

              {/* Clear all */}
              {hasActiveFilters && (
                <div className="flex w-full items-end">
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Style tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {["All", ...styles].map((s) => (
            <button
              key={s}
              onClick={() => setActiveStyle(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${activeStyle === s
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Masonry-like grid */}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {sorted.map((design, i) => (
            <motion.div
              key={design.id}
              onClick={() => navigate(`/design/${design.id}`)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 6) * 0.05 }}
              className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative overflow-hidden">
                <img
                  src={design.image}
                  alt={`${design.style} tattoo`}
                  className="w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                  style={{ aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/3" }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="sm" className="btn-glow border-0 text-primary-foreground">
                    Check Details
                  </Button>
                </div>
                <button className="absolute top-3 right-3 rounded-full bg-background/60 p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background/80">
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
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-10 text-center">
          <Button variant="outline" className="border-border">Load More</Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}