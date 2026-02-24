import { Users, Image, Award } from "lucide-react";

const stats = [
  { icon: Users, label: "1.5M+ users", value: "Trusted worldwide" },
  { icon: Image, label: "50M+ designs", value: "Generated to date" },
  { icon: Award, label: "Featured in", value: "Inked Magazine, Huffington Post, Yahoo News" },
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
