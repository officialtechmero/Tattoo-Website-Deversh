import { chromium } from "playwright";

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
  return url.replace(/\/\d+x\//, "/736x/");
};

const scrapePinterest = async (
  query: string,
  limit: number = 20,
  maxScrolls: number = 80
): Promise<ImageResult[]> => {

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

  await browser.close();

  return imagesArray;
};

export default scrapePinterest;
