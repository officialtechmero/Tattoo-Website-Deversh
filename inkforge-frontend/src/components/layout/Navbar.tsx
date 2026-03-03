"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Explore", to: "/explore" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          {/* <Droplet className="h-7 w-7 text-primary" /> */}
          <span className="font-display text-2xl font-bold text-foreground tracking-widest">
            InkForge <span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.to
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/explore">
            <Button size="sm" className="btn-glow border-0 text-primary-foreground">
              Browse Designs
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-foreground md:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-b border-border bg-background md:hidden">
          <div className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === link.to
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2">
              <Link href="/explore" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button className="btn-glow w-full border-0 text-primary-foreground">Browse Designs</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
