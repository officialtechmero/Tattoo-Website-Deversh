import { cleanTattooDescription } from "./slug";

type CategoryDefinition = {
  label: string;
  slug: string;
  keywords: string[];
};

const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    label: "Floral",
    slug: "floral",
    keywords: ["floral", "flower", "rose", "lily", "lotus", "botanical", "blossom", "peony", "orchid", "tulip"],
  },
  {
    label: "Animal",
    slug: "animal",
    keywords: ["animal", "wolf", "tiger", "lion", "snake", "eagle", "owl", "panther", "bear", "fox"],
  },
  {
    label: "Skull",
    slug: "skull",
    keywords: ["skull", "bones", "skeleton", "cranium"],
  },
  {
    label: "Japanese",
    slug: "japanese",
    keywords: ["japanese", "irezumi", "koi", "samurai", "geisha", "oni", "yokai", "dragon"],
  },
  {
    label: "Traditional",
    slug: "traditional",
    keywords: ["traditional", "old school", "american traditional", "classic"],
  },
  {
    label: "Blackwork",
    slug: "blackwork",
    keywords: ["blackwork", "black work", "solid black", "ink heavy"],
  },
  {
    label: "Geometric",
    slug: "geometric",
    keywords: ["geometric", "geometry", "sacred geometry", "mandala", "pattern"],
  },
  {
    label: "Minimalist",
    slug: "minimalist",
    keywords: ["minimal", "minimalist", "fine line", "linework", "single line"],
  },
  {
    label: "Tribal",
    slug: "tribal",
    keywords: ["tribal", "polynesian", "maori", "aztec"],
  },
  {
    label: "Script",
    slug: "script",
    keywords: ["script", "lettering", "calligraphy", "quote", "text"],
  },
  {
    label: "Portrait",
    slug: "portrait",
    keywords: ["portrait", "face", "realism", "realistic"],
  },
  {
    label: "Nature",
    slug: "nature",
    keywords: ["nature", "landscape", "mountain", "forest", "tree", "ocean", "wave"],
  },
  {
    label: "Celestial",
    slug: "celestial",
    keywords: ["celestial", "moon", "sun", "stars", "galaxy", "constellation", "cosmic"],
  },
  {
    label: "Religious",
    slug: "religious",
    keywords: ["religious", "cross", "prayer", "angel", "saint", "church"],
  },
  {
    label: "Mythic",
    slug: "mythic",
    keywords: ["myth", "mythic", "phoenix", "griffin", "unicorn", "dragon"],
  },
  {
    label: "Abstract",
    slug: "abstract",
    keywords: ["abstract", "surreal", "experimental", "conceptual"],
  },
];

const GENERAL_CATEGORY = "General";

const normalize = (value: string) => value.toLowerCase();

export function extractCategoriesFromText(text: string): string[] {
  const normalized = normalize(text || "");
  if (!normalized) return [GENERAL_CATEGORY];

  const matches = CATEGORY_DEFINITIONS.filter((category) =>
    category.keywords.some((keyword) => normalized.includes(keyword))
  ).map((category) => category.label);

  return matches.length > 0 ? matches : [GENERAL_CATEGORY];
}

export function getPrimaryCategory(text: string): string {
  return extractCategoriesFromText(text)[0] ?? GENERAL_CATEGORY;
}

export function categoryToSlug(label: string): string {
  const match = CATEGORY_DEFINITIONS.find((category) => category.label === label);
  if (match) return match.slug;
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "general";
}

export function categoryFromSlug(slug: string | null): string | null {
  if (!slug) return null;
  const normalized = slug.trim().toLowerCase();
  if (!normalized || normalized === "all") return null;
  const match = CATEGORY_DEFINITIONS.find((category) => category.slug === normalized);
  return match?.label ?? null;
}

export function listCategoryDefinitions(): { label: string; slug: string }[] {
  return CATEGORY_DEFINITIONS.map((category) => ({ label: category.label, slug: category.slug }));
}

export function extractTagsFromText(text: string): string[] {
  if (!text) return [];
  
  // Clean using the same logic as title
  const cleaned = cleanTattooDescription(text);
  
  // Split by common separators
  const parts = cleaned.split(/[,;&]|\s+and\s+/i);
  
  const tags: string[] = [];
  const stopWords = new Set(["a", "an", "the", "with", "showing", "featuring", "displaying", "tattoo", "tattoos", "design", "designs", "in", "on", "of", "their", "his", "her", "on", "at", "around"]);
  const bodyParts = new Set(["arm", "hand", "shoulder", "leg", "back", "chest", "body", "forearm", "wrist", "ankle", "thigh", "neck"]);

  parts.forEach(part => {
    const trimmed = part.trim();
    if (!trimmed) return;
    
    // If it's a multi-word part (like "black and grey") preserve it if it's short, or split if it looks like a phrase
    if (trimmed.toLowerCase() === "black and grey" || trimmed.toLowerCase() === "black & grey") {
      tags.push("black and grey");
      return;
    }
    
    // Further split by spaces to get individual words
    const words = trimmed.split(/\s+/);
    words.forEach(word => {
      const lowerWord = word.toLowerCase().replace(/[^\w]/g, "");
      if (lowerWord.length > 2 && !stopWords.has(lowerWord) && !bodyParts.has(lowerWord)) {
        tags.push(lowerWord);
      }
    });
  });

  // Return unique tags
  return Array.from(new Set(tags));
}
