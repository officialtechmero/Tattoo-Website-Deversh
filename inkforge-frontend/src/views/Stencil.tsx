import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Upload, Download, ArrowRight, Info } from "lucide-react";
import { motion } from "framer-motion";
import tattooSample6 from "@/assets/tattoo-sample-6.jpg";

export default function Stencil() {
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">
            Image to <span className="text-gradient">Stencil</span>
          </h1>
          <p className="mb-8 text-muted-foreground">Convert any image into a clean tattoo stencil</p>
        </motion.div>

        {/* Pro banner */}
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <Info className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            This feature is available on <span className="font-semibold text-primary">Pro</span> and{" "}
            <span className="font-semibold text-primary">Artist</span> plans.
          </p>
        </div>

        {!uploaded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-2xl"
          >
            <button
              onClick={() => setUploaded(true)}
              className="w-full rounded-2xl border-2 border-dashed border-border bg-card p-16 text-center transition-all hover:border-primary/50 hover:bg-surface-hover group"
            >
              <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="font-display text-lg font-semibold">Drop your image here</p>
              <p className="mt-2 text-sm text-muted-foreground">or click to browse • PNG, JPG up to 10MB</p>
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border p-3">
                  <span className="text-sm font-medium">Original</span>
                </div>
                <div className="aspect-square">
                  <img src={tattooSample6.src} alt="Original" className="h-full w-full object-cover" />
                </div>
              </div>

              <div className="flex items-center justify-center md:hidden">
                <ArrowRight className="h-6 w-6 text-primary rotate-90" />
              </div>

              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border p-3">
                  <span className="text-sm font-medium">Stencil</span>
                </div>
                <div className="aspect-square">
                  <img
                    src={tattooSample6.src}
                    alt="Stencil"
                    className="h-full w-full object-cover"
                    style={{ filter: "grayscale(100%) contrast(200%) brightness(1.1)" }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <Button className="btn-glow border-0 text-primary-foreground gap-2">
                <Download className="h-4 w-4" /> Download Stencil
              </Button>
              <Button variant="outline" className="border-border" onClick={() => setUploaded(false)}>
                Upload Another
              </Button>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
