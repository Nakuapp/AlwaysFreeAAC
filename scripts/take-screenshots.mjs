#!/usr/bin/env node
/**
 * Captures 7" and 10" tablet screenshots of AlwaysFreeAAC using Playwright.
 *
 * Usage:
 *   node scripts/take-screenshots.mjs [base-url]
 *
 * Defaults to http://localhost:4173 (vite preview default).
 * Screenshots are written to screenshots/ in the project root.
 */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE_URL = process.argv[2] ?? 'http://localhost:4173';
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');

const VIEWPORTS = [
  // 7-inch tablet — portrait and landscape
  { label: '7in-portrait',  width:  800, height: 1280 },
  { label: '7in-landscape', width: 1280, height:  800 },
  // 10-inch tablet — portrait and landscape
  { label: '10in-portrait',  width: 1200, height: 1920 },
  { label: '10in-landscape', width: 1920, height: 1200 },
];

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();

  for (const { label, width, height } of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width, height } });

    // Wait for the app to fully render before capturing.
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Allow any animations / font loading to settle.
    await page.waitForTimeout(1000);

    const file = join(OUT_DIR, `screenshot-${label}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`Saved ${file}`);

    await page.close();
  }

  await browser.close();
  console.log(`\nAll screenshots written to ${OUT_DIR}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
