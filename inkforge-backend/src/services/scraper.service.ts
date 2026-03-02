import { chromium } from "playwright";
import { db } from "../db/client";
import { scrapeImages } from "../db/schema";
import { eq } from "drizzle-orm";

type ImageResult = {
  src: string;
  alt: string;
};

const applyStealth = async (page: any) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false
    });

    // @ts-ignore
    window.chrome = { runtime: {} };

    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3]
    });

    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"]
    });
  });
};

const getHighQualityImage = (url: string): string => {
  return url.replace(/\/\d+x\d+\//, "/originals/");
};

const checkQueryExists = async (query: string) => {
  const existing = await db
    .select()
    .from(scrapeImages)
    .where(eq(scrapeImages.query, query))
    .limit(1);

  return existing.length > 0;
};

const scrapePinterest = async (
  query: string,
  limit: number = 20,
  maxScrolls: number = 80
): Promise<ImageResult[]> => {

  // check DB first
  const exists = await checkQueryExists(query);

  if (exists) {
    console.log("Query already scraped:", query);
    return [];
  }

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox"
    ]
  });

  const context = await browser.newContext({
    storageState: "pinterest-session.json",
    viewport: { width: 1280, height: 900 }
  });

  const page = await context.newPage();

  await applyStealth(page);

  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(60000);

  const searchUrl =
    `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;

  await page.goto(searchUrl, {
    waitUntil: "domcontentloaded"
  });

  const imagesMap = new Map<string, ImageResult>();

  let previousHeight = 0;

  for (let scroll = 0; scroll < maxScrolls; scroll++) {

    const results = await page.$$eval(
      'img[src*="i.pinimg.com"]',
      imgs =>
        imgs.map(img => ({
          src: (img as HTMLImageElement).src,
          alt: (img as HTMLImageElement).alt || ""
        }))
    );

    for (const img of results) {

      if (!img.src) continue;

      const highRes = getHighQualityImage(img.src);

      if (!imagesMap.has(highRes)) {

        imagesMap.set(highRes, {
          src: highRes,
          alt: img.alt
        });
      }

      if (imagesMap.size >= limit) break;
    }

    if (imagesMap.size >= limit) break;

    const newHeight = await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 2);
      return document.body.scrollHeight;
    });

    if (newHeight === previousHeight) {
      break;
    }

    previousHeight = newHeight;

    await page.waitForTimeout(2000);
  }

  const imagesArray = Array.from(imagesMap.values()).slice(0, limit);

  if (imagesArray.length > 0) {

    await db
      .insert(scrapeImages)
      .values(
        imagesArray.map(img => ({
          query,
          imageLink: img.src,
          imageAlt: img.alt || ""
        }))
      )
      .onConflictDoNothing();
  }

  await browser.close();

  return imagesArray;
};

export default scrapePinterest;