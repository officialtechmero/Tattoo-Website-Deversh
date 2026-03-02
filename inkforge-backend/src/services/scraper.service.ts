import {chromium} from 'playwright';

const scrapePinterest = async (query: string, maxScrolls = 10) => {
  const browser = await chromium.launch({headless: true});
  const page = await browser.newPage();

  const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;

  await page.goto(searchUrl, {waitUntil: "networkidle"});
  const images = new Set<string>();
  
  for(let i = 0; i < maxScrolls; i++) {
    const res = await page.$$eval("img", imgs =>
      imgs.map(img => ({
        src: img.src,
        alt: img.alt
      }))
    );

    res.forEach(img => {
      if(img.src && img.src.includes("pinimg")) {
        images.add(JSON.stringify(img));
      }
    });

    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    await page.waitForTimeout(3000);
  }

  await browser.close();

  return [...images].map(i => JSON.parse(i));
}

(async () => {
  const results = await scrapePinterest("modern tattoo designs", 200);
  console.log(results);
});