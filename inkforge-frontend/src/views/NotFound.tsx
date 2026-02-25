import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, Home, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const quickLinks = [
  { label: "Explore Designs", href: "/explore" },
  { label: "Generate Tattoo", href: "/generate" },
  { label: "Pricing", href: "/pricing" },
];

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative overflow-hidden px-4 pb-20 pt-28">
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="ink-gradient absolute inset-x-0 top-0 h-80" />
        </div>

        <section className="relative mx-auto max-w-4xl rounded-3xl border border-border bg-card/70 p-8 text-center backdrop-blur-sm md:p-14">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Compass className="h-7 w-7 text-primary" />
          </div>

          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Lost In The Gallery
          </p>

          <h1 className="font-display text-6xl font-bold leading-none tracking-wider text-gradient md:text-8xl">
            404
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
            This page does not exist, or the link is no longer available.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/">
              <Button className="btn-glow border-0 text-primary-foreground">
                <Home className="mr-2 h-4 w-4" />
                Back To Home
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" className="border-border">
                Browse Designs
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-2 text-left sm:grid-cols-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;

