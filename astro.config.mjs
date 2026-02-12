import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

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
  ? [
      (await import('@clerk/astro')).default({
        // fallbackRedirectUrl を使用（afterSignInUrl は deprecated）
        fallbackRedirectUrl: '/',
      }),
    ]
  : [];

// https://astro.build/config
export default defineConfig({
  site: 'https://nexs.or.jp',
  output: 'hybrid',
  adapter: node({
    // middleware: server.mjs で Basic Auth と静的ファイル配信を処理
    mode: 'middleware',
  }),
  server: {
    host: '0.0.0.0',
    port: 8080,
  },
  trailingSlash: 'ignore',
  integrations: [
    mdx(),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    ...clerkIntegration,
  ],
  vite: {
    optimizeDeps: {
      exclude: ['@clerk/astro'],
    },
  },
});
