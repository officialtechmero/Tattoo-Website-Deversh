import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tattooSamples } from "@/lib/data";

const INK_PARTICLE_COUNT = 20;

function pseudoRandom(index: number, salt: number) {
  let x = ((index + 1) * 0x9e3779b1) ^ (salt * 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  x = (x ^ (x >>> 16)) >>> 0;
  return x / 4294967296;
}

const inkParticleStyles = Array.from({ length: INK_PARTICLE_COUNT }, (_, i) => ({
  width: `${(pseudoRandom(i, 1) * 6 + 2).toFixed(3)}px`,
  height: `${(pseudoRandom(i, 2) * 6 + 2).toFixed(3)}px`,
  left: `${(pseudoRandom(i, 3) * 100).toFixed(3)}%`,
  top: `${(pseudoRandom(i, 4) * 100).toFixed(3)}%`,
  animationDelay: `${(pseudoRandom(i, 5) * 6).toFixed(3)}s`,
  animationDuration: `${(pseudoRandom(i, 6) * 4 + 4).toFixed(3)}s`,
}));

function InkParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {inkParticleStyles.map((style, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/20 animate-float"
          style={style}
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
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered Tattoo Design
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-tight tracking-wide md:text-7xl">
            <span className="block text-9xl">Design Your </span>
            <span className="text-gradient text-8xl">Dream Ink</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            AI-powered tattoo generator. Describe your idea, choose your style, get stunning results instantly.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/explore">
              <Button size="lg" className="btn-glow border-0 px-8 text-primary-foreground gap-2">
                <Sparkles className="h-4 w-4" />
                Explore Designs
              </Button>
            </Link>
            {/* <Link href="/explore">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-white gap-2">
                See Examples
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link> */}
          </div>
        </div>
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
              <Image
                src={img}
                alt={`Tattoo design sample ${i + 1}`}
                width={224}
                height={224}
                sizes="224px"
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
