import { landingStyles, type LandingDesign } from "@/lib/landing";
import { normalizeImageUrl } from "@/lib/image-url";

type ExploreImage = {
  id: string;
  query: string;
  imageLink: string;
  imageAlt: string;
};

type ExploreResponse = {
  data?: ExploreImage[];
};

const backendBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000").replace(/\/+$/, "");
const HOME_LIMIT = 48;
const HOME_REVALIDATE_SECONDS = 300;

const seededLikes = (index: number) => 100 + ((index * 97 + 211) % 900);

export async function getHomeDesigns(): Promise<LandingDesign[]> {
  try {
    const url = `${backendBaseUrl}/api/explore?limit=${HOME_LIMIT}&withTotal=0&random=1`;
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "force-cache",
      next: { revalidate: HOME_REVALIDATE_SECONDS, tags: ["home-designs"] },
    });

    if (!response.ok) {
      return [];
    }

    const json = (await response.json()) as ExploreResponse;
    const items = json.data ?? [];
    const seenQueries = new Set<string>();
    const uniqueItems = items.filter((item) => {
      const queryKey = item.query.trim().toLowerCase();
      if (!queryKey) return true;
      if (seenQueries.has(queryKey)) return false;
      seenQueries.add(queryKey);
      return true;
    });

    return uniqueItems.map((item, index) => ({
      id: item.id,
      image: normalizeImageUrl(item.imageLink),
      style: landingStyles[index % landingStyles.length],
      likes: seededLikes(index),
      alt: item.imageAlt || item.query || "Tattoo design",
    }));
  } catch {
    return [];
  }
}
