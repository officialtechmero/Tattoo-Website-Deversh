import tattooSample1 from "@/assets/tattoo-sample-1.jpg";
import tattooSample2 from "@/assets/tattoo-sample-2.jpg";
import tattooSample3 from "@/assets/tattoo-sample-3.jpg";
import tattooSample4 from "@/assets/tattoo-sample-4.jpg";
import tattooSample5 from "@/assets/tattoo-sample-5.jpg";
import tattooSample6 from "@/assets/tattoo-sample-6.jpg";
import tattooSample7 from "@/assets/tattoo-sample-7.jpg";
import tattooSample8 from "@/assets/tattoo-sample-8.jpg";
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

export const flashDesigns: TattooDesign[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  image: tattooSamples[i % 8],
  style: styles[i % 8],
  likes: 50 + ((i * 73 + 191) % 500),
  placement: ["Forearm", "Upper Arm", "Chest", "Back", "Ankle", "Wrist"][i % 6],
  date: `2025-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
}));

export const testimonials = [
  {
    name: "Derek J.",
    avatar: "https://ui-avatars.com/api/?name=Derek+J&background=7C3AED&color=fff&size=80&format=png",
    rating: 5,
    quote: "One of the best art AIs I've ever used. My friend is literally getting a tattoo of an image it created.",
  },
  {
    name: "Filippa M.",
    avatar: "https://ui-avatars.com/api/?name=Filippa+M&background=7C3AED&color=fff&size=80&format=png",
    rating: 5,
    quote: "I've been searching for something like this to help me find a design that feels 100% right for me.",
  },
  {
    name: "Marina R.",
    avatar: "https://ui-avatars.com/api/?name=Marina+R&background=7C3AED&color=fff&size=80&format=png",
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
