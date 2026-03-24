const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+.-]*:/i;

export function normalizeImageUrl(url?: string | null): string {
  const trimmed = url?.trim();

  if (!trimmed) {
    return "/placeholder.svg";
  }

  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("//")) {
      return `https:${trimmed}`;
    }
    return trimmed;
  }

  if (ABSOLUTE_URL_PATTERN.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed.replace(/^\/+/, "")}`;
}

export function isRemoteImageUrl(url?: string | null): boolean {
  const normalized = normalizeImageUrl(url);
  return normalized.startsWith("http://") || normalized.startsWith("https://");
}
