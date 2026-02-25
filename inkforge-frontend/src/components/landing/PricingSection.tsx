import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/data";

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl tracking-wider">
            Simple <span className="text-gradient">Pricing</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Start for free, upgrade when you're ready</p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card p-1">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Yearly
              <span className="ml-1 text-xs text-success">-20%</span>
            </button>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`card-hover rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-primary glow-violet bg-card"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold tracking-widest">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">
                  ${yearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-sm text-muted-foreground">/mo</span>
                )}
              </div>
              <Button
                className={`mt-6 w-full ${
                  plan.highlighted
                    ? "btn-glow border-0 text-primary-foreground"
                    : "border-border bg-secondary text-foreground hover:bg-surface-hover"
                }`}
              >
                {plan.cta}
              </Button>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
