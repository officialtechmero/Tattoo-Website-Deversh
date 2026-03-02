// // import {chromium} from 'playwright';

// // const scrapePinterest = async (query: string, maxScrolls = 10) => {
// //   const browser = await chromium.launch({headless: true});
// //   const page = await browser.newPage();

// //   const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;

// //   await page.goto(searchUrl, {waitUntil: "networkidle"});
// //   const images = new Set<string>();
  
// //   for(let i = 0; i < maxScrolls; i++) {
// //     const res = await page.$$eval("img", imgs =>
// //       imgs.map(img => ({
// //         src: img.src,
// //         alt: img.alt
// //       }))
// //     );

// //     res.forEach(img => {
// //       if(img.src && img.src.includes("pinimg")) {
// //         images.add(JSON.stringify(img));
// //       }
// //     });

// //     await page.evaluate(() => {
// //       window.scrollBy(0, window.innerHeight);
// //     });

// //     await page.waitForTimeout(3000);
// //   }

// //   await browser.close();

// //   return [...images].map(i => JSON.parse(i));
// // }

// // // (async () => {
// // //   const results = await scrapePinterest("modern tattoo designs", 200);
// // //   console.log(results);
// // // });

// // export default scrapePinterest;

// import { chromium } from "playwright";

// const scrapePinterest = async (
//   query: string,
//   limit = 20,
//   maxScrolls = 50
// ) => {
//   const browser = await chromium.launch({ headless: true });
//   const page = await browser.newPage();

//   const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;

//   await page.goto(searchUrl, { waitUntil: "networkidle" });

//   const images = new Map<string, { src: string; alt: string }>();

//   for (let i = 0; i < maxScrolls; i++) {

//     const res = await page.$$eval("img", imgs =>
//       imgs.map(img => ({
//         src: img.src,
//         alt: img.alt
//       }))
//     );

//     for (const img of res) {
//       if (img.src && img.src.includes("pinimg")) {

//         if (!images.has(img.src)) {
//           images.set(img.src, img);
//         }

//         // stop when limit reached
//         if (images.size >= limit) {
//           await browser.close();
//           return Array.from(images.values());
//         }
//       }
//     }

//     await page.evaluate(() => {
//       window.scrollBy(0, window.innerHeight);
//     });

//     await page.waitForTimeout(2000);
//   }

//   await browser.close();

//   return Array.from(images.values()).slice(0, limit);
// };

// export default scrapePinterest;



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

  const page = await browser.newPage();

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