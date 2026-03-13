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

export function getKeywordsForCategory(slug: string): string[] | null {
  const match = CATEGORY_DEFINITIONS.find((cat) => cat.slug === slug.toLowerCase());
  return match ? match.keywords : null;
}
