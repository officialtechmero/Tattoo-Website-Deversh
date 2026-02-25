"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StyleGallery } from "@/components/landing/StyleGallery";
import { FlashLibrary } from "@/components/landing/FlashLibrary";
import { Testimonials } from "@/components/landing/Testimonials";
import { PricingSection } from "@/components/landing/PricingSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <HowItWorks />
      <StyleGallery />
      <FlashLibrary />
      <Testimonials />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;

