import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="font-display text-xl font-bold tracking-widest">TatooInkify</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Curated tattoo reference library with searchable designs for your next ink idea.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground tracking-widest">Product</h4>
            <div className="flex flex-col gap-2">
              {["Explore"].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground tracking-widest">Company</h4>
            <div className="flex flex-col gap-2">
              {["Blog", "Privacy", "Terms"].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground tracking-widest">Social</h4>
            <div className="flex flex-col gap-2">
              {["Twitter / X", "Instagram", "TikTok"].map((item) => (
                <Link key={item} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © 2026 TatooInkify. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

