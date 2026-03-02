import { chromium } from "playwright";

type ImageResult = {
  src: string;
  alt: string;
};

/**
 * Convert Pinterest thumbnail URLs to high quality
 */
const getHighQualityImage = (url: string): string => {
  return url
    .replace(/236x|474x|564x/g, "736x")
    .replace("/736x/", "/originals/");
};

/**
 * Pinterest Image Scraper
 */
const scrapePinterest = async (
  query: string,
  limit: number = 20,
  maxScrolls: number = 50
): Promise<ImageResult[]> => {

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    storageState: "pinterest-session.json"
  });

  const page = await context.newPage();

  const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;

  await page.goto(searchUrl, { waitUntil: "load" });

  const images = new Map<string, ImageResult>();

  for (let i = 0; i < maxScrolls; i++) {

    const results = await page.$$eval('img[src*="pinimg"]', imgs =>
      imgs.map(img => ({
        src: (img as HTMLImageElement).src,
        alt: (img as HTMLImageElement).alt || ""
      }))
    );

    for (const img of results) {

      if (!img.src) continue;

      const highQualityUrl = img.src
        .replace(/236x|474x|564x/g, "736x")
        .replace("/736x/", "/originals/");

      if (!images.has(highQualityUrl)) {
        images.set(highQualityUrl, {
          src: highQualityUrl,
          alt: img.alt
        });
      }

      // Stop when enough images collected
      if (images.size >= limit) {
        await browser.close();
        return Array.from(images.values());
      }
    }

    // Scroll page to load more pins
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    await page.waitForTimeout(3000);
  }

  await browser.close();

  return Array.from(images.values()).slice(0, limit);
};

export default scrapePinterest;