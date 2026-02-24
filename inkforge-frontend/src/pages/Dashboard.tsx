import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home, Sparkles, Compass, Image, Settings, Crown, Droplet,
  Download, Trash2, Plus, Menu, X,
} from "lucide-react";
import { flashDesigns } from "@/lib/data";
import { motion } from "framer-motion";

const sidebarLinks = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Sparkles, label: "Generate", to: "/generate" },
  { icon: Compass, label: "Explore", to: "/explore" },
  { icon: Image, label: "My Designs", to: "/dashboard" },
  { icon: Settings, label: "Settings", to: "/dashboard" },
];

const myDesigns = flashDesigns.slice(0, 6);

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const creditsUsed = 3;
  const creditsTotal = 3;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-card border border-border p-2 md:hidden"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-secondary flex flex-col transition-transform md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-border p-4">
          <span className="font-display text-lg font-bold tracking-wider">InkForge AI</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Credits widget */}
        <div className="border-t border-border p-4">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Credits</span>
              <span className="text-xs text-muted-foreground">{creditsUsed}/{creditsTotal}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(creditsUsed / creditsTotal) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{creditsTotal - creditsUsed} credits remaining</p>
          </div>

          <Link to="/pricing">
            <Button size="sm" className="btn-glow mt-3 w-full border-0 text-primary-foreground gap-1">
              <Crown className="h-3.5 w-3.5" /> Upgrade
            </Button>
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-background/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="font-display text-2xl font-bold md:text-3xl">My Designs</h1>
                <p className="text-sm text-muted-foreground mt-1">Your saved tattoo designs</p>
              </div>
              <Link to="/generate">
                <Button className="btn-glow border-0 text-primary-foreground gap-2">
                  <Plus className="h-4 w-4" /> Generate New Design
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myDesigns.map((design, i) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group card-hover overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={design.image}
                      alt={`${design.style} tattoo`}
                      className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {design.style}
                      </span>
                      <span className="text-xs text-muted-foreground">{design.date}</span>
                    </div>
                    <div className="flex gap-1">
                      <button className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
