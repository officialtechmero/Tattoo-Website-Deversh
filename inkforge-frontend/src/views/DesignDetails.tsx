// "use client";

// import { useParams, useRouter } from "next/navigation";
// import { Navbar } from "@/components/layout/Navbar";
// import { Footer } from "@/components/layout/Footer";
// import { Button } from "@/components/ui/button";
// import { Heart, Download, ArrowLeft } from "lucide-react";
// import { flashDesigns } from "@/lib/data";

// export default function DesignDetails() {
//   const params = useParams<{ id: string }>();
//   const id = params?.id;
//   const router = useRouter();

//   const design = flashDesigns.find(d => d.id === Number(id));

//   if (!design) {
//     return <div className="p-10">Design not found</div>;
//   }

//   const sessionCost = design.sessionCost || 120;
//   const sessions = design.sessions || 3;
//   const tip = design.tip || 40;

//   const total = sessionCost * sessions + tip;

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />

//       <div className="container mx-auto px-4 pt-24 pb-16">

//         {/* ✅ Back Button */}
//         <Button
//           className="bg-transparent hover:text-black mb-6 text-muted-foreground"
//           onClick={() => router.back()}
//         >
//           <ArrowLeft /> Back
//         </Button>

//         <div className="grid gap-10 md:grid-cols-2">

//           {/* Image */}
//           <div className="rounded-2xl border border-border bg-card p-3">
//             <img
//               src={design.image}
//               alt={design.name}
//               className="w-full rounded-xl object-cover"
//             />
//           </div>

//           {/* Details */}
//           <div>
//             <h1 className="font-display text-3xl font-bold mb-2 tracking-wider">
//               {design.name || "Untitled Tattoo"}
//             </h1>

//             <p className="text-muted-foreground mb-6">
//               Created by {design.artist || "AI Generator"}
//             </p>

//             <div className="space-y-3 text-sm">

//               <Detail label="Category" value={design.category || design.style} />
//               <Detail label="Type" value={design.type || "Blackwork"} />
//               <Detail label="Owner City" value={design.city || "Los Angeles"} />
//               <Detail label="Session Cost" value={`$${sessionCost}`} />
//               <Detail label="Tip" value={`$${tip}`} />
//               <Detail label="Sessions" value={sessions} />
//               <Detail label="Total Estimated Cost" value={`$${total}`} />

//             </div>

//             {/* Buttons */}
//             <div className="flex gap-3 mt-8">
//               <Button className="gap-2">
//                 <Heart className="h-4 w-4" />
//                 Favorite
//               </Button>

//               <Button variant="outline" className="gap-2">
//                 <Download className="h-4 w-4" />
//                 Download
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }

// function Detail({ label, value }) {
//   return (
//     <div className="flex justify-between border-b border-border pb-2">
//       <span className="text-muted-foreground">{label}</span>
//       <span className="font-medium">{value}</span>
//     </div>
//   );
// }


"use client";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Heart, Download, ArrowLeft } from "lucide-react";
import { flashDesigns } from "@/lib/data";
import { useMemo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export default function DesignDetails() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [likedIds, setLikedIds] = useState<Record<number, boolean>>({});
  const [extraLikes, setExtraLikes] = useState<Record<number, number>>({});

  const toggleLike = useCallback((e: React.MouseEvent, designId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedIds((prev) => {
      const wasLiked = !!prev[designId];
      setExtraLikes((el) => ({
        ...el,
        [designId]: wasLiked ? (el[designId] || 1) - 1 : (el[designId] || 0) + 1,
      }));
      return { ...prev, [designId]: !wasLiked };
    });
  }, []);

  const design = flashDesigns.find((d) => d.id === Number(id));

  // ── Similar: same style, exclude current ─────────────────────────────────
  const similarDesigns = useMemo(() => {
    if (!design) return [];
    return flashDesigns
      .filter((d) => d.id !== design.id && d.style === design.style)
      .slice(0, 6);
  }, [design]);

  // ── You May Also Like: different style but same category/theme/body part ─
  const youMayAlsoLike = useMemo(() => {
    if (!design) return [];
    return flashDesigns
      .filter(
        (d) =>
          d.id !== design.id &&
          d.style !== design.style &&
          (d.category === design.category ||
            d.theme === design.theme ||
            d.bodyPart === design.bodyPart ||
            d.animal === design.animal ||
            d.floral === design.floral),
      )
      .slice(0, 6);
  }, [design]);

  if (!design) {
    return <div className="p-10">Design not found</div>;
  }

  const sessionCost = design.sessionCost || 120;
  const sessions = design.sessions || 3;
  const tip = design.tip || 40;
  const total = sessionCost * sessions + tip;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <style>{`
        @keyframes like-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.45); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .like-pop { animation: like-pop 0.35s ease forwards; }
      `}</style>

      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Back */}
        <Button
          className="bg-transparent hover:text-black mb-6 text-muted-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft /> Back
        </Button>

        {/* Main detail grid */}
        <div className="grid gap-10 md:grid-cols-2">
          {/* Image */}
          <div className="rounded-2xl border border-border bg-card p-3">
            <img
              src={design.image}
              alt={design.name}
              className="w-full rounded-xl object-cover"
            />
          </div>

          {/* Details */}
          <div>
            <h1 className="font-display text-3xl font-bold mb-2 tracking-wider">
              {design.name || "Untitled Tattoo"}
            </h1>
            <p className="text-muted-foreground mb-6">
              Created by {design.artist || "AI Generator"}
            </p>
            <div className="space-y-3 text-sm">
              <Detail label="Category" value={design.category || design.style} />
              <Detail label="Type" value={design.type || "Blackwork"} />
              <Detail label="Owner City" value={design.city || "Los Angeles"} />
              <Detail label="Session Cost" value={`$${sessionCost}`} />
              <Detail label="Tip" value={`$${tip}`} />
              <Detail label="Sessions" value={sessions} />
              <Detail label="Total Estimated Cost" value={`$${total}`} />
            </div>
            <div className="flex gap-3 mt-8">
              <Button className="gap-2">
                <Heart className="h-4 w-4" /> Favorite
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
          </div>
        </div>

        {/* ── Similar Designs ─────────────────────────────────────────────── */}
        {similarDesigns.length > 0 && (
          <section className="mt-20">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-1">
                  Same Style
                </p>
                <h2 className="font-display text-2xl font-bold tracking-wider">
                  Similar <span className="text-gradient">Designs</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  More {design.style} tattoos you might love
                </p>
              </div>
              <Link
                href="/explore"
                className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
              >
                View all
              </Link>
            </div>

            <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-6 [column-fill:_balance]">
              {similarDesigns.map((d, i) => (
                <DesignCard
                  key={d.id}
                  design={d}
                  index={i}
                  isLiked={!!likedIds[d.id]}
                  displayLikes={(d.likes || 0) + (extraLikes[d.id] || 0)}
                  onLike={toggleLike}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── You May Also Like ────────────────────────────────────────────── */}
        {youMayAlsoLike.length > 0 && (
          <section className="mt-20">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-1">
                  Curated For You
                </p>
                <h2 className="font-display text-2xl font-bold tracking-wider">
                  You May Also <span className="text-gradient">Like</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Designs across styles that share your taste
                </p>
              </div>
              <Link
                href="/explore"
                className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
              >
                Explore more
              </Link>
            </div>

            <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-6 [column-fill:_balance]">
              {youMayAlsoLike.map((d, i) => (
                <DesignCard
                  key={d.id}
                  design={d}
                  index={i}
                  isLiked={!!likedIds[d.id]}
                  displayLikes={(d.likes || 0) + (extraLikes[d.id] || 0)}
                  onLike={toggleLike}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}

// ── Reusable Pinterest-style card ──────────────────────────────────────────
function DesignCard({
  design,
  index,
  isLiked,
  displayLikes,
  onLike,
}: {
  design: (typeof flashDesigns)[number];
  index: number;
  isLiked: boolean;
  displayLikes: number;
  onLike: (e: React.MouseEvent, id: number) => void;
}) {
  return (
    <Link href={`/design/${design.id}`} className="block mb-3 break-inside-avoid">
      <article className="group overflow-hidden rounded-2xl border border-border bg-card cursor-pointer">
        <div className="relative overflow-hidden">
          <Image
            src={design.image}
            alt={`${design.style} tattoo`}
            width={600}
            height={800}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            priority={index < 4}
            loading={index < 4 ? undefined : "lazy"}
            className="w-full h-auto object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
              View Design
            </span>
          </div>

          {/* Like button */}
          <button
            onClick={(e) => onLike(e, design.id)}
            aria-label={isLiked ? "Unlike" : "Like"}
            aria-pressed={isLiked}
            className={`absolute top-2.5 right-2.5 rounded-full p-1.5 transition-all duration-200 ${isLiked
                ? "bg-pink-500/20 opacity-100"
                : "bg-background/60 opacity-0 group-hover:opacity-100 hover:bg-background/80"
              }`}
          >
            <Heart
              className={`h-3.5 w-3.5 transition-colors duration-200 ${isLiked ? "fill-pink-500 text-pink-500 like-pop" : "text-foreground"
                }`}
            />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary truncate max-w-[70%]">
            {design.style}
          </span>
          <span
            className={`flex items-center gap-1 text-[11px] transition-colors duration-200 ${isLiked ? "text-pink-500" : "text-muted-foreground"
              }`}
          >
            <Heart
              className={`h-3 w-3 ${isLiked ? "fill-pink-500 text-pink-500" : ""}`}
            />
            {displayLikes}
          </span>
        </div>
      </article>
    </Link>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}