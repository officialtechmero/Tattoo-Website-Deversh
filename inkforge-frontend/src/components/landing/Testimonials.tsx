import { Star } from "lucide-react";
import { testimonials } from "@/lib/landing";

export function Testimonials() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl tracking-wider">
            Loved by <span className="text-gradient">Creators</span>
          </h2>
          <p className="mt-4 text-muted-foreground">See what our users are saying</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="card-hover rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="mb-6 text-sm text-muted-foreground italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${t.avatarClass}`}
                >
                  {t.initials}
                </div>
                <span className="text-sm font-semibold">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
