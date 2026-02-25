import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Heart, Download, ArrowLeft } from "lucide-react";
import { flashDesigns } from "@/lib/data";

export default function DesignDetails() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const design = flashDesigns.find(d => d.id === Number(id));

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

      <div className="container mx-auto px-4 pt-24 pb-16">

        {/* ✅ Back Button */}
        <Button
          className="bg-transparent hover:text-black mb-6 text-muted-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft /> Back
        </Button>

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

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              <Button className="gap-2">
                <Heart className="h-4 w-4" />
                Favorite
              </Button>

              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
