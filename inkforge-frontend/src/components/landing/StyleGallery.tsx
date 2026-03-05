import Image from "next/image";
import { landingStyles } from "@/lib/landing";

export function StyleGallery({ images }: { images: string[] }) {
  const sourceImages = images.length > 0 ? images : ["/placeholder.svg"];

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
          {landingStyles.map((style, i) => (
            <div
              key={style}
              className="group flex-shrink-0 w-44 cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg border-border bg-card">
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={sourceImages[i % sourceImages.length]}
                    alt={`${style} tattoo style example`}
                    width={176}
                    height={176}
                    sizes="176px"
                    loading="lazy"
                    className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 w-full p-3 text-center">
                  <h3 className="font-display text-sm font-semibold tracking-widest">{style}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
