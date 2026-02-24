import { tattooSamples, styles } from "@/lib/data";
import { motion } from "framer-motion";

export function StyleGallery() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl tracking-wider">
            Explore Tattoo <span className="text-gradient">Styles</span>
          </h2>
          <p className="mt-4 text-muted-foreground">8 unique artistic styles to choose from</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {styles.map((style, i) => (
            <motion.div
              key={style}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group flex-shrink-0 w-44 cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={tattooSamples[i]}
                    alt={style}
                    className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 w-full p-3 text-center">
                  <span className="font-display text-sm font-semibold tracking-widest">{style}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
