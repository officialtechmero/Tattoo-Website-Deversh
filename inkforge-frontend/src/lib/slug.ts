export function cleanTattooDescription(value: string): string {
  if (!value) return "";
  let cleaned = value.trim();

  // Strip common AI prefixes/markers
  const markers = [
    "this contains an image of",
    "this contains",
    "contains",
    "this may contain",
    "image of",
    "a photo of",
    "a close up of",
  ];
  
  // First, handle line-by-line cleaning
  const lines = cleaned.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const filtered = lines.filter(line => !markers.some(marker => line.toLowerCase().startsWith(marker)));
  
  if (filtered.length > 0) {
    cleaned = filtered.join(" ");
  }

  // Then, handle substring markers within the text (e.g. "This may contain: ...")
  for (const marker of markers) {
    const lower = cleaned.toLowerCase();
    const index = lower.indexOf(marker);
    if (index !== -1) {
      const rest = cleaned.slice(index + marker.length).trim();
      // Remove leading colons, dots, spaces
      cleaned = rest.replace(/^[\s:.-]+/, "").trim();
    }
  }

  // Common filler patterns to remove (regex)
  const patterns = [
    /^(a\s+)?(person|man|woman|guy|girl|hand|arm|shoulder|leg|back|chest|body)\s+(with|having|showing|featuring|displaying|wearing)\s+a?\s*tattoo\s+(of|on|on\s+their|on\s+his|on\s+her)\s+[\w\s]+\s+(holding|showing|featuring|displaying)\s+a/i,
    /^(a\s+)?(person|man|woman|guy|girl|body)\s+(with|having|showing|featuring|displaying|wearing)\s+a?\s*tattoo\s+(of|on\s+their|on\s+his|on\s+her)\s+[\w\s]+/i,
    /^(a\s+)?(person|man|woman|guy|girl|body)\s+(with|having|showing|featuring|displaying|wearing)\s+a?\s*tattoo\s+of\s+/i,
    /^(a\s+)?(person|man|woman|guy|girl)\s+with\s+a\s+/i,
    /^(a\s+)?(person|man|woman|guy|girl)\s+holding\s+a\s+/i,
    /^(a\s+)?tattoo\s+(of|on|on\s+their|on\s+his|on\s+her)\s+/i,
    /^(a\s+)?tattoo\s+of\s+/i,
    /\s+(in|on|at|around)\s+(his|her|their)\s+(hand|arm|shoulder|leg|back|chest|body)/gi,
    /\s+holding\s+a\s+/gi,
    /\s+showing\s+a\s+/gi,
  ];

  for (const pattern of patterns) {
    const next = cleaned.replace(pattern, "").trim();
    if (next && next !== cleaned) {
      cleaned = next;
    }
  }

  // Capitalize first letter if it's a letter
  if (cleaned && /^[a-z]/i.test(cleaned)) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned || value;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function splitSlugId(slugId: string): { slug: string; id: string } {
  const source = slugId || "";
  
  // Match 8-character hex prefix or full UUID at the end
  const uuidMatch = source.match(
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
  );
  if (uuidMatch && uuidMatch.index !== undefined) {
    const id = uuidMatch[1];
    const slug = source.slice(0, Math.max(0, uuidMatch.index - 1)).replace(/-+$/, "");
    return { slug, id };
  }

  // Fallback for 8-char hex prefix
  const parts = source.split("-").filter(Boolean);
  if (parts.length <= 1) {
    return { slug: source, id: "" };
  }

  const lastPart = parts[parts.length - 1];
  // If the last part looks like an 8-char hex prefix or a numeric ID
  if (lastPart && (lastPart.length === 8 && /^[0-9a-f]{8}$/i.test(lastPart)) || /^\d+$/.test(lastPart)) {
     return {
      slug: parts.slice(0, -1).join("-"),
      id: lastPart,
    };
  }

  return {
    slug: parts.join("-"),
    id: "",
  };
}

export function extractNumericId(slugId: string): number | null {
  const { id } = splitSlugId(slugId);
  if (!id) return null;
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : null;
}

export function makeSlugId(slugBase: string, id: string | number): string {
  const cleaned = cleanTattooDescription(slugBase || "design");
  const fullSlug = slugify(cleaned);
  // Shorten slug to max 50 chars or ~6 words
  const slug = fullSlug.split("-").slice(0, 6).join("-").slice(0, 50).replace(/-+$/, "");
  
  // If id is a UUID, take the first 8 characters
  const shortId = typeof id === "string" && id.length > 8 ? id.slice(0, 8) : id;
  
  return `${slug || "design"}-${shortId}`;
}
