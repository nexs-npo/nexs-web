import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import { mkdirSync, writeFileSync } from 'node:fs';

// ============================================================
// Clerk (Authentication) - 環境変数で有効化
// ============================================================
// 現在は無効化されています。有効にするには:
//   1. .env に PUBLIC_CLERK_PUBLISHABLE_KEY と CLERK_SECRET_KEY を設定
//   2. 開発サーバーを再起動
// 詳細: docs/05_ENVIRONMENT_SETUP.md, .env.example
// ============================================================
const clerkEnabled = !!process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkIntegration = clerkEnabled
  ? [(await import('@clerk/astro')).default({
      afterSignInUrl: '/',
      afterSignUpUrl: '/',
    })]
  : [];

// Keystatic integration (Vite plugin only, no route injection).
// Keystatic UIページは src/pages/keystatic/[...params].astro で手動管理。
// Clerk有効時でも、Keystatic管理画面にClerkの認証スクリプトが干渉しないよう
// Astro islandを使わず直接Reactをマウントする方式を採用している。
function keystatic() {
  return {
    name: 'keystatic',
    hooks: {
      'astro:config:setup': ({ updateConfig, config }) => {
        updateConfig({
          vite: {
            plugins: [{
              name: 'keystatic-vite',
              resolveId(id) {
                if (id === 'virtual:keystatic-config') {
                  return this.resolve('./keystatic.config', './a');
                }
                return null;
              }
            }],
            optimizeDeps: {
              entries: ['keystatic.config.*', '.astro/keystatic-imports.js']
            }
          }
        });
        const dotAstroDir = new URL('./.astro/', config.root);
        mkdirSync(dotAstroDir, { recursive: true });
        writeFileSync(
          new URL('keystatic-imports.js', dotAstroDir),
          `import "@keystatic/astro/ui";\nimport "@keystatic/astro/api";\nimport "@keystatic/core/ui";\n`
        );
      }
    }
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://nexs.or.jp',
  output: 'hybrid',
  adapter: node({
    mode: 'standalone',
  }),
  trailingSlash: 'ignore',
  integrations: [
    mdx(),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    ...clerkIntegration,
    keystatic(),
  ],
  vite: {
    optimizeDeps: {
      exclude: ['@clerk/astro'],
    },
  },
});
