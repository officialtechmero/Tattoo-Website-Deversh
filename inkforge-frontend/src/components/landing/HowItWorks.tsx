import { PenLine, Palette, Download } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    step: "01",
    title: "Describe Your Idea",
    description: "Type a text prompt describing your dream tattoo design.",
  },
  {
    icon: Palette,
    step: "02",
    title: "Choose Style & Placement",
    description: "Pick from 8 unique styles and body placement options.",
  },
  {
    icon: Download,
    step: "03",
    title: "Download & Share",
    description: "Export your design in HD and share with your tattoo artist.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl tracking-wider">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Three simple steps to your perfect tattoo design</p>
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
              <h3 className="mt-2 font-display text-xl font-bold tracking-wider">{step.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
