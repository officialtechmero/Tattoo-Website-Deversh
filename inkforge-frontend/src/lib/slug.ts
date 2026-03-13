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
  const fullSlug = slugify(slugBase || "design");
  // Shorten slug to max 50 chars or ~6 words
  const slug = fullSlug.split("-").slice(0, 6).join("-").slice(0, 50).replace(/-+$/, "");
  
  // If id is a UUID, take the first 8 characters
  const shortId = typeof id === "string" && id.length > 8 ? id.slice(0, 8) : id;
  
  return `${slug || "design"}-${shortId}`;
}
