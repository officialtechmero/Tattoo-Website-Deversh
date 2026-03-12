import { PenLine, Palette, Download } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    step: "01",
    title: "Search The Library",
    description: "Start with keywords to find tattoo references that match your style.",
  },
  {
    icon: Palette,
    step: "02",
    title: "Filter And Compare",
    description: "Review results by theme, body placement, and visual direction.",
  },
  {
    icon: Download,
    step: "03",
    title: "Download And Save",
    description: "Download references and shortlist the designs you want to discuss.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl tracking-normal">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Three simple steps to find your next tattoo reference</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.step}
              className="card-hover rounded-2xl border border-border bg-card p-8 text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="font-display text-lg font-bold text-primary">{step.step}</span>
              <h3 className="mt-2 font-display text-xl font-bold tracking-normal">{step.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
