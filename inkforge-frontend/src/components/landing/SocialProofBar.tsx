import { Users, Image, Award } from "lucide-react";

const stats = [
  { icon: Users, label: "Growing community", value: "Tattoo lovers and artists" },
  { icon: Image, label: "Fresh designs", value: "Continuously added to the library" },
  { icon: Award, label: "Search-first workflow", value: "Built for fast design discovery" },
];

export function SocialProofBar() {
  return (
    <section className="border-y border-border bg-secondary/50">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 text-center md:text-left">
              <stat.icon className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
