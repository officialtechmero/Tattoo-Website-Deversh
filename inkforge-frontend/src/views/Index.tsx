import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StyleGallery } from "@/components/landing/StyleGallery";
import { FlashLibrary } from "@/components/landing/FlashLibrary";
import { Testimonials } from "@/components/landing/Testimonials";
import type { LandingDesign } from "@/lib/landing";

type IndexProps = {
  designs: LandingDesign[];
};

const Index = ({ designs }: IndexProps) => {
  const heroImages = designs.slice(0, 16).map((item) => item.image);
  const styleImages = designs.slice(0, 8).map((item) => item.image);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection images={heroImages} />
      <SocialProofBar />
      <HowItWorks />
      <StyleGallery images={styleImages} />
      <FlashLibrary designs={designs} />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
