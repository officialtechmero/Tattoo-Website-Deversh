import { chromium } from "playwright";

type ImageResult = {
  src: string;
  alt: string;
};

const applyStealth = async (page: any) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });

    // @ts-ignore
    window.chrome = { runtime: {} };

    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3],
    });

    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
  });
};

const getHighQualityImage = (url: string): string => {
  return url.replace(/\/\d+x\//, "/736x/");
};

/**
 * Extracts meaningful keywords from a query string.
 * Strips common filler words (stopwords) so only content words remain.
 *
 * "best tattoo designs" → ["tattoo", "designs"]
 * "cool forarm sleeve ideas" → ["forarm", "sleeve", "ideas"]
 */
const extractKeywords = (query: string): string[] => {
  const STOPWORDS = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "need", "dare",
    "ought", "used", "best", "top", "great", "good", "cool", "nice",
    "beautiful", "amazing", "awesome", "perfect", "simple", "easy",
    "ideas", "idea", "style", "styles", "design", "designs", "look",
    "looks", "most", "more", "very", "really", "just", "some", "any",
    "all", "new", "old", "big", "small",
  ]);

  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
};

/**
 * Returns true if the alt text contains at least one of the required keywords.
 *
 * Alt texts on Pinterest often look like:
 *   "skull and roses tattoo"
 *   "forarm tattoo design"
 *   "This may contain: a woman with tattoos on her arm"
 *
 * We strip the "This may contain:" prefix before matching.
 */
const altMatchesQuery = (alt: string, keywords: string[]): boolean => {
  if (!alt || keywords.length === 0) return false;

  // Pinterest often prefixes alts with "This may contain: ..."
  const cleaned = alt
    .toLowerCase()
    .replace(/^this may contain:\s*/i, "")
    .replace(/[^a-z0-9\s]/g, "");

  return keywords.some((keyword) => cleaned.includes(keyword));
};

const scrapePinterest = async (
  query: string,
  limit: number = 20,
  maxScrolls: number = 80
): Promise<ImageResult[]> => {
  const keywords = extractKeywords(query);

  console.log(`[scraper] Query keywords extracted: [${keywords.join(", ")}]`);

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled", "--no-sandbox"],
  });

  const context = await browser.newContext({
    storageState: "pinterest-session.json",
    viewport: { width: 1280, height: 900 },
  });

  const page = await context.newPage();

  await applyStealth(page);

  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(60000);

  const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;

  await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

  const imagesMap = new Map<string, ImageResult>();

  let previousHeight = 0;

  for (let scroll = 0; scroll < maxScrolls; scroll++) {
    const results = await page.$$eval("img[src*='i.pinimg.com']", (imgs) =>
      imgs.map((img) => ({
        src: (img as HTMLImageElement).src,
        alt: (img as HTMLImageElement).alt || "",
      }))
    );

    for (const img of results) {
      if (!img.src) continue;

      // Skip images whose alt text doesn't relate to the query
      if (!altMatchesQuery(img.alt, keywords)) continue;

      const highRes = getHighQualityImage(img.src);

      if (!imagesMap.has(highRes)) {
        imagesMap.set(highRes, { src: highRes, alt: img.alt });
      }

      if (imagesMap.size >= limit) break;
    }

    console.log(
      `[scraper] Scroll ${scroll + 1}/${maxScrolls} — matched ${imagesMap.size}/${limit} images`
    );

    if (imagesMap.size >= limit) break;

    const newHeight = await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 2);
      return document.body.scrollHeight;
    });

    if (newHeight === previousHeight) break;

    previousHeight = newHeight;

    await page.waitForTimeout(2000);
  }

  await browser.close();

  return Array.from(imagesMap.values()).slice(0, limit);
};

export default scrapePinterest;