"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PricingSection } from "@/components/landing/PricingSection";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. Your access continues until the end of your billing period." },
  { q: "Do credits roll over?", a: "No, credits reset at the beginning of each billing cycle. Make sure to use them!" },
  { q: "Can I use designs commercially?", a: "Commercial use is available on Pro and Artist plans. Free plan designs are for personal use only." },
  { q: "What styles are supported?", a: "We support 8 styles: Traditional, Minimalist, Tribal, Geometric, Watercolor, Japanese, Neo-Traditional, and Blackwork." },
  { q: "Is there a free trial?", a: "Yes! Every new account gets 3 free credits to try the platform. No credit card required." },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <PricingSection />

        {/* FAQ */}
        <section className="pb-24">
          <div className="container mx-auto max-w-2xl px-4">
            <h2 className="mb-8 text-center font-display text-2xl font-bold tracking-wider">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl border border-border bg-card px-4"
                >
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

