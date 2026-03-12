const placeholderImage = "/placeholder.svg";

export const tattooSamples = Array.from({ length: 16 }, () => placeholderImage);

export const tattooHeroImage = placeholderImage;

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
    quote: "The library helped me quickly collect solid references before my studio consultation.",
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
    quote: "Easy to search, easy to download, and much better for planning real tattoo sessions.",
  },
];

export const pricingPlans = [
  {
    name: "Free",
    price: 0,
    description: "Get started with tattoo reference discovery",
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
