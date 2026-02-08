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
 * Fetch all CSS content from the page
 */
async function fetchAllStyles(page) {
  console.log('  🎨 Analyzing CSS...');

  // Get stylesheet and inline style counts from the browser
  const { stylesheets, inlineStyleCount } = await page.evaluate(() => {
    const stylesheets = [];

    // Get all <link rel="stylesheet"> elements
    for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
      try {
        // Find the corresponding CSSStyleSheet
        for (const sheet of document.styleSheets) {
          if (sheet.href === link.href) {
            const rules = [];
            try {
              // Extract all CSS rules
              for (const rule of sheet.cssRules) {
                rules.push(rule.cssText);
              }
              stylesheets.push({
                href: link.href,
                css: rules.join('\n'),
              });
            } catch (_e) {
              // CORS or other access issues - skip this stylesheet
              console.warn(`Cannot read stylesheet: ${link.href}`);
            }
            break;
          }
        }
      } catch (_e) {
        // Skip if there's an error
      }
    }

    // Count inline <style> tags (already in HTML)
    const inlineStyleCount = document.querySelectorAll('style').length;

    return { stylesheets, inlineStyleCount };
  });

  if (stylesheets.length > 0) {
    console.log(
      `  ✓ Found ${stylesheets.length} external stylesheet(s) - will inline`,
    );
  }
  if (inlineStyleCount > 0) {
    console.log(
      `  ✓ Found ${inlineStyleCount} inline <style> tag(s) - already inlined`,
    );
  }
  if (stylesheets.length === 0 && inlineStyleCount === 0) {
    console.log('  ⚠ No CSS found (Tailwind CDN will be added)');
  }

  return stylesheets;
}

/**
 * Capture HTML from a page using Playwright
 */
async function capturePage(page, url) {
  console.log(`📸 Capturing: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Fetch CSS before getting HTML
  const styles = await fetchAllStyles(page);

  // Get HTML content
  const html = await page.content();

  return { html, styles };
}

/**
 * Process HTML: remove scripts/stylesheets, inline CSS, add Tailwind CDN
 */
function processHtml(html, styles) {
  const $ = cheerio.load(html);

  // Remove all script tags
  $('script').remove();

  // Remove all stylesheet links
  $('link[rel="stylesheet"]').remove();

  // Inline all CSS from the page
  if (styles.length > 0) {
    const inlinedCss = styles.map((s) => s.css).join('\n\n');
    $('head').append(`\n    <style>\n${inlinedCss}\n    </style>`);
  }

  // Add Tailwind CSS CDN to head (for utility classes)
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

      // Capture page HTML and CSS
      const { html, styles } = await capturePage(page, url);

      // Process HTML (inline CSS)
      const processedHtml = processHtml(html, styles);

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
