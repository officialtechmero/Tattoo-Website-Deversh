"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Sparkles, Download, Share2, Heart, Loader2, RefreshCw } from "lucide-react";
import { styles, placements, tattooSamples } from "@/lib/data";
import { motion } from "framer-motion";

export default function Generate() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Minimalist");
  const [selectedPlacement, setSelectedPlacement] = useState("Forearm");
  const [complexity, setComplexity] = useState(3);
  const [colorMode, setColorMode] = useState<"bw" | "color">("bw");
  const [lineWeight, setLineWeight] = useState<"Fine" | "Medium" | "Bold">("Medium");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [credits, setCredits] = useState(3);

  const handleGenerate = () => {
    if (credits <= 0) return;
    setGenerating(true);
    setResult(null);
    setTimeout(() => {
      setResult(tattooSamples[Math.floor(Math.random() * tattooSamples.length)]);
      setGenerating(false);
      setCredits((c) => Math.max(0, c - 1));
    }, 2000);
  };

  const recentGenerations = tattooSamples.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl tracking-wider">
            AI Tattoo <span className="text-gradient">Generator</span>
          </h1>
          <p className="mb-8 text-muted-foreground">Describe your idea and let AI create your perfect design</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Prompt */}
            <div>
              <label className="mb-2 block text-sm font-medium">Describe your tattoo idea</label>
              <textarea
                value={prompt}
                required={true}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A wolf howling at the moon with geometric patterns..."
                className="w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-none"
              />
            </div>

            {/* Style selector */}
            <div>
              <label className="mb-2 block text-sm font-medium">Style</label>
              <div className="flex flex-wrap gap-2">
                {styles.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStyle(s)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedStyle === s
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Placement */}
            <div>
              <label className="mb-2 block text-sm font-medium">Placement</label>
              <div className="flex flex-wrap gap-2">
                {placements.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPlacement(p)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${selectedPlacement === p
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Complexity */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Complexity: {["Simple", "Light", "Medium", "Detailed", "Complex"][complexity - 1]}
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={complexity}
                onChange={(e) => setComplexity(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Color & Line weight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Color</label>
                <div className="flex gap-2">
                  {(["bw", "color"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setColorMode(m)}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${colorMode === m
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-muted-foreground"
                        }`}
                    >
                      {m === "bw" ? "Black & White" : "Color"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Line Weight</label>
                <div className="flex gap-2">
                  {(["Fine", "Medium", "Bold"] as const).map((w) => (
                    <button
                      key={w}
                      onClick={() => setLineWeight(w)}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${lineWeight === w
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-muted-foreground"
                        }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={generating || credits <= 0}
              className="btn-glow w-full border-0 text-primary-foreground gap-2 h-12 text-base"
            >
              {generating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {generating ? "Generating..." : "Generate Design"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              You have <span className="font-semibold text-primary">{credits}</span> credits remaining
            </p>
          </motion.div>

          {/* Right: Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="aspect-square flex items-center justify-center">
                {generating ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Creating your design...</p>
                  </div>
                ) : result ? (
                  <img
                    src={result}
                    alt="Generated tattoo"
                    className={`h-full w-full object-cover ${colorMode === "bw" ? "grayscale" : ""}`}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-8 text-center">
                    <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">Your tattoo will appear here</p>
                  </div>
                )}
              </div>

              {result && (
                <div className="border-t border-border p-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{selectedStyle}</span>
                    <span className="rounded-full bg-card border border-border px-3 py-1 text-xs text-muted-foreground">{selectedPlacement}</span>
                    <span className="rounded-full bg-card border border-border px-3 py-1 text-xs text-muted-foreground">
                      {["Simple", "Light", "Medium", "Detailed", "Complex"][complexity - 1]}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="btn-glow flex-1 border-0 text-primary-foreground gap-1">
                      <Download className="h-3.5 w-3.5" /> Download HD
                    </Button>
                    <Button size="sm" variant="outline" className="border-border gap-1">
                      <Heart className="h-3.5 w-3.5" /> Save
                    </Button>
                    <Button size="sm" variant="outline" className="border-border gap-1">
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </Button>
                    <Button size="sm" variant="outline" className="border-border gap-1" onClick={handleGenerate}>
                      <RefreshCw className="h-3.5 w-3.5" /> Variation
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Recent generations */}
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground tracking-widest">Recent Generations</h3>
              <div className="grid grid-cols-4 gap-2">
                {recentGenerations.map((img, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-xl border border-border">
                    <img src={img} alt="" className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

