import { landingStyles, type LandingDesign } from "@/lib/landing";

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

const sanitizeImageUrl = (url: string) => {
  if (!url) return "/placeholder.svg";
  return url;
};

export async function getHomeDesigns(): Promise<LandingDesign[]> {
  try {
    const url = `${backendBaseUrl}/api/explore?page=1&limit=${HOME_LIMIT}&withTotal=0`;
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

    return items.map((item, index) => ({
      id: item.id,
      image: sanitizeImageUrl(item.imageLink),
      style: landingStyles[index % landingStyles.length],
      likes: seededLikes(index),
      alt: item.imageAlt || item.query || "Tattoo design",
    }));
  } catch {
    return [];
  }
}
