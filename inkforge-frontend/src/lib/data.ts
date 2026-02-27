import tattooSample1 from "@/assets/tattoo-sample-1.jpg";
import tattooSample10 from "@/assets/tattoo-sample-10.jpg";
import tattooSample11 from "@/assets/tattoo-sample-11.jpg";
import tattooSample12 from "@/assets/tattoo-sample-12.jpg";
import tattooSample13 from "@/assets/tattoo-sample-13.jpg";
import tattooSample14 from "@/assets/tattoo-sample-14.jpg";
import tattooSample15 from "@/assets/tattoo-sample-15.jpg";
import tattooSample16 from "@/assets/tattoo-sample-16.jpg";
import tattooSample2 from "@/assets/tattoo-sample-2.jpg";
import tattooSample3 from "@/assets/tattoo-sample-3.jpg";
import tattooSample4 from "@/assets/tattoo-sample-4.jpg";
import tattooSample5 from "@/assets/tattoo-sample-5.jpg";
import tattooSample6 from "@/assets/tattoo-sample-6.jpg";
import tattooSample7 from "@/assets/tattoo-sample-7.jpg";
import tattooSample8 from "@/assets/tattoo-sample-8.jpg";
import tattooSample9 from "@/assets/tattoo-sample-9.jpg";
import tattooHero from "@/assets/tattoo-hero.jpg";

export const tattooSamples = [
  tattooSample1.src,
  tattooSample2.src,
  tattooSample3.src,
  tattooSample4.src,
  tattooSample5.src,
  tattooSample6.src,
  tattooSample7.src,
  tattooSample8.src,
  tattooSample9.src,
  tattooSample10.src,
  tattooSample11.src,
  tattooSample12.src,
  tattooSample13.src,
  tattooSample14.src,
  tattooSample15.src,
  tattooSample16.src,
];

export const tattooHeroImage = tattooHero.src;

export const styles = [
  "Traditional",
  "Minimalist",
  "Tribal",
  "Geometric",
  "Watercolor",
  "Japanese",
  "Neo-Traditional",
  "Blackwork",
] as const;

export const placements = [
  "Forearm",
  "Upper Arm",
  "Chest",
  "Back",
  "Ankle",
  "Wrist",
  "Thigh",
  "Neck",
] as const;

export interface TattooDesign {
  sessionCost?: number;
  sessions?: number;
  tip?: number;
  name?: string;
  artist?: string;
  category?: string;
  type?: string;
  city?: string;
  gender?: string;
  bodyPart?: string;
  theme?: string;
  symbol?: string;
  floral?: string;
  animal?: string;
  celestial?: string;
  unique?: string;
  id: number;
  image: string;
  style: string;
  likes: number;
  placement?: string;
  date?: string;
}

export const flashDesigns: TattooDesign[] = Array.from({ length: 48 }, (_, i) => ({
  id: i + 1,
  image: tattooSamples[i % tattooSamples.length],
  style: styles[i % 8],
  likes: 50 + ((i * 73 + 191) % 500),
  placement: ["Forearm", "Upper Arm", "Chest", "Back", "Ankle", "Wrist"][i % 6],
  date: `2025-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
}));

export const testimonials = [
  {
    name: "Derek J.",
    initials: "DJ",
    avatarClass: "bg-[#3f6212] text-[#f7fee7]",
    rating: 5,
    quote: "One of the best art AIs I've ever used. My friend is literally getting a tattoo of an image it created.",
  },
  {
    name: "Filippa M.",
    initials: "FM",
    avatarClass: "bg-[#1f2937] text-[#f9fafb]",
    rating: 5,
    quote: "I've been searching for something like this to help me find a design that feels 100% right for me.",
  },
  {
    name: "Marina R.",
    initials: "MR",
    avatarClass: "bg-[#365314] text-[#fefce8]",
    rating: 5,
    quote: "Thanks for this marvelous tool... AI-generated tattoos, copy-pasted to my body!",
  },
];

export const pricingPlans = [
  {
    name: "Free",
    price: 0,
    description: "Get started with AI tattoo design",
    features: ["3 credits", "Basic styles", "Watermarked downloads", "Community gallery access"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 12,
    yearlyPrice: 10,
    description: "Unlimited creative freedom",
    features: [
      "Unlimited generations",
      "All 8 styles",
      "HD downloads",
      "Body placement preview",
      "No watermarks",
      "Priority support",
    ],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Artist",
    price: 29,
    yearlyPrice: 23,
    description: "Professional tattoo tools",
    features: [
      "Everything in Pro",
      "Image-to-stencil converter",
      "Private designs",
      "Priority generation",
      "Commercial license",
      "API access",
    ],
    cta: "Go Artist",
    highlighted: false,
  },
];
