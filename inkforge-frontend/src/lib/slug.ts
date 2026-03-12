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
  const uuidMatch = source.match(
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
  );
  if (uuidMatch && uuidMatch.index !== undefined) {
    const id = uuidMatch[1];
    const slug = source.slice(0, Math.max(0, uuidMatch.index - 1)).replace(/-+$/, "");
    return { slug, id };
  }

  const parts = source.split("-").filter(Boolean);
  if (parts.length <= 1) {
    return { slug: source, id: "" };
  }
  return {
    slug: parts.slice(0, -1).join("-"),
    id: parts[parts.length - 1] || "",
  };
}

export function extractNumericId(slugId: string): number | null {
  const { id } = splitSlugId(slugId);
  if (!id) return null;
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : null;
}

export function makeSlugId(slugBase: string, id: string | number): string {
  const slug = slugify(slugBase || "design");
  return `${slug || "design"}-${id}`;
}
