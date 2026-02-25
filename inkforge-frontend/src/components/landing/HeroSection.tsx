import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { tattooSamples } from "@/lib/data";

function InkParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/20 animate-float"
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${Math.random() * 4 + 4}s`,
          }}
        />
      ))}
      <div className="absolute inset-0 ink-gradient" />
    </div>
  );
}

export function HeroSection() {
  const doubled = [...tattooSamples, ...tattooSamples];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
      <InkParticles />

      <div className="container relative z-10 mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered Tattoo Design
          </div>

          <div className="font-display text-5xl font-extrabold leading-tight tracking-wide md:text-7xl">
            <div className="text-9xl">Design Your{" "}</div>
            <div className="text-gradient text-8xl">Dream Ink</div>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            AI-powered tattoo generator. Describe your idea, choose your style, get stunning results instantly.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="btn-glow border-0 px-8 text-primary-foreground gap-2">
                <Sparkles className="h-4 w-4" />
                Start Free - 3 Credits
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-white gap-2">
                See Examples
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Auto-scrolling tattoo samples */}
      <div className="relative w-full overflow-hidden py-8">
        <div className="absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />
        <div className="animate-scroll-x flex gap-4">
          {doubled.map((img, i) => (
            <div
              key={i}
              className="h-56 w-56 shrink-0 overflow-hidden rounded-sm border border-border"
            >
              <img
                src={img}
                alt={`Tattoo sample ${i + 1}`}
                className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
