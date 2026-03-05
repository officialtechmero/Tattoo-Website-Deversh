export const landingStyles = [
  "Traditional",
  "Minimalist",
  "Tribal",
  "Geometric",
  "Watercolor",
  "Japanese",
  "Neo-Traditional",
  "Blackwork",
] as const;

export type LandingDesign = {
  id: string;
  image: string;
  style: string;
  likes: number;
  alt: string;
};

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

