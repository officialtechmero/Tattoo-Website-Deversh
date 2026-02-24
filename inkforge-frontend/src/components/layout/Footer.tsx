import { Link } from "react-router-dom";
import { Droplet } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="font-display text-xl font-bold tracking-widest">InkForge AI</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered tattoo design generator. Create stunning, unique tattoo designs in seconds.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground tracking-widest">Product</h4>
            <div className="flex flex-col gap-2">
              {["Generate", "Explore", "Stencil", "Pricing"].map((item) => (
                <Link key={item} to={`/${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground tracking-widest">Company</h4>
            <div className="flex flex-col gap-2">
              {["Blog", "Privacy", "Terms"].map((item) => (
                <span key={item} className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground tracking-widest">Social</h4>
            <div className="flex flex-col gap-2">
              {["Twitter / X", "Instagram", "TikTok"].map((item) => (
                <span key={item} className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © 2026 InkForge AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
