import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import prettier from 'prettier';

// Configuration
const BASE_URL = process.env.SNAPSHOT_URL || 'http://localhost:8080';
const OUTPUT_DIR = '_design_snapshots';
const TAILWIND_CDN = 'https://cdn.tailwindcss.com';

// Pages to capture (can be easily extended)
const PAGES = ['/', '/lab/', '/library/', '/office/', '/mydesk/'];

/**
 * Capture HTML from a page using Playwright
 */
async function capturePage(page, url) {
  console.log(`📸 Capturing: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });
  return await page.content();
}

/**
 * Process HTML: remove scripts, add Tailwind CDN
 */
function processHtml(html) {
  const $ = cheerio.load(html);

  // Remove all script tags
  $('script').remove();

  // Add Tailwind CSS CDN to head
  $('head').append(`\n    <script src="${TAILWIND_CDN}"></script>`);

  return $.html();
}

/**
 * Format HTML using Prettier
 */
async function formatHtml(html) {
  return await prettier.format(html, {
    parser: 'html',
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    singleQuote: false,
  });
}

/**
 * Generate filename from URL path
 */
function getFilename(urlPath) {
  if (urlPath === '/') return 'index.html';
  // Remove leading/trailing slashes and replace remaining slashes with hyphens
  return `${urlPath.replace(/^\/|\/$/g, '').replace(/\//g, '-')}.html`;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting design snapshot tool...\n');
  console.log(`📍 Target URL: ${BASE_URL}\n`);

  // Create output directory
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Launch browser
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    for (const urlPath of PAGES) {
      const url = `${BASE_URL}${urlPath}`;

      // Capture page HTML
      const rawHtml = await capturePage(page, url);

      // Process HTML
      const processedHtml = processHtml(rawHtml);

      // Format HTML
      const formattedHtml = await formatHtml(processedHtml);

      // Save to file
      const filename = getFilename(urlPath);
      const filepath = join(OUTPUT_DIR, filename);
      writeFileSync(filepath, formattedHtml);

      console.log(`✅ Saved: ${filename}\n`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }

  console.log('🎉 All snapshots created successfully!');
  console.log(`📁 Output directory: ${OUTPUT_DIR}/`);
}

main();
