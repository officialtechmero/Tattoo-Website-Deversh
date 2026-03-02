import 'dotenv/config';

import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: false });

  const context = await browser.newContext();

  const page = await context.newPage();

  await page.goto("https://www.pinterest.com/login/");

  await page.fill('input[name="id"]', process.env.PINTEREST_EMAIL || "");
  await page.fill('input[name="password"]', process.env.PINTEREST_PASSWORD || "");

  await page.click('button[type="submit"]');

  await page.waitForTimeout(5000);

  // save login session
  await context.storageState({ path: "pinterest-session.json" });

  await browser.close();

  console.log("Login session saved.");
})();