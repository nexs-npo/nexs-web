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
 * Process HTML: remove scripts/stylesheets, strip Vite-generated CSS, add Tailwind CDN
 */
function processHtml(html) {
  const $ = cheerio.load(html);

  // Remove all script tags
  $('script').remove();

  // Remove all stylesheet links
  $('link[rel="stylesheet"]').remove();

  // Remove Vite/Astro-generated style tags — these contain the full Tailwind
  // utility dump and make the snapshot unreadably long. Tailwind CDN replaces them.
  $('style[data-vite-dev-id]').remove();

  // Restore Google Fonts (was inside the removed Vite style tag)
  $('head').append(
    '\n    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=Noto+Sans+JP:wght@400;500;700;900&family=Space+Mono:wght@400;700&display=swap" />',
  );

  // Restore base font rules (body font-family was inside the removed Vite style tag)
  $('head').append(`
    <style>
      body { font-family: 'Inter', 'Noto Sans JP', sans-serif; -webkit-font-smoothing: antialiased; }
      code, pre, .font-mono { font-family: 'Space Mono', monospace; }
    </style>`);

  // Add Tailwind CSS CDN to head (replaces the removed utility CSS)
  $('head').append(`\n    <script src="${TAILWIND_CDN}"></script>`);

  // Pass project font config to Tailwind CDN — must come AFTER the CDN script
  // so that the `tailwind` global exists when this runs
  $('head').append(`
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
              mono: ['Space Mono', 'monospace'],
            },
          },
        },
      };
    </script>`);

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
      const html = await capturePage(page, url);

      // Process HTML (strip Vite CSS, add Tailwind CDN)
      const processedHtml = processHtml(html);

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
