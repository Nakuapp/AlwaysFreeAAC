#!/usr/bin/env node
/**
 * Captures 7" and 10" tablet screenshots of AlwaysFreeAAC using Playwright.
 *
 * Usage:
 * node scripts/take-screenshots.mjs [base-url]
 *
 * Defaults to http://127.0.0.1:4173 (vite preview default).
 * Screenshots are written to screenshots/ in the project root.
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE_URL = process.argv[2] ?? "http://127.0.0.1:4173";
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "screenshots");

const VIEWPORTS = [
  // --- Phone (6.5-inch standard modern aspect ratios) ---
  { label: "phone-portrait", width: 1242, height: 2688 },
  { label: "phone-landscape", width: 2688, height: 1242 },
  // 7-inch tablet — portrait and landscape
  { label: "7in-portrait", width: 800, height: 1280 },
  { label: "7in-landscape", width: 1280, height: 800 },
  // 10-inch tablet — portrait and landscape
  { label: "10in-portrait", width: 1200, height: 1920 },
  { label: "10in-landscape", width: 1920, height: 1200 },
];

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  try {
    for (const { label, width, height } of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width, height } });

      try {
        // --- SCREEN 1: Home/Index Screen ---
        await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
        await page.waitForSelector(".category-nav", { state: "visible" });

        const fileHome = join(OUT_DIR, `01-home-${label}.png`);
        await page.screenshot({ path: fileHome, fullPage: false });
        console.log(`Saved ${fileHome}`);

        // --- SCREEN 2: Media Screen ---
        const firstCategory = page.locator(".category-nav button, .category-nav a").last();
        if ((await firstCategory.count()) > 0) {
          await firstCategory.click();
          await page.waitForTimeout(500); // Short pause for any transitions

          const fileCategory = join(OUT_DIR, `02-media-${label}.png`);
          await page.screenshot({ path: fileCategory, fullPage: false });
          console.log(`Saved ${fileCategory}`);
        }

        // --- SCREEN 3: Settings Screen ---
        const settingsButton = page
          .locator('button:has-text("Settings"), button:has-text("Edit"), .settings-btn')
          .first();
        if ((await settingsButton.count()) > 0) {
          await settingsButton.click();
          await page.waitForTimeout(500);

          const fileSettings = join(OUT_DIR, `03-settings-${label}.png`);
          await page.screenshot({ path: fileSettings, fullPage: false });
          console.log(`Saved ${fileSettings}`);
        }
      } catch (err) {
        console.error(`Failed capturing viewport ${label}:`, err.message);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\nAll screenshots written to ${OUT_DIR}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
