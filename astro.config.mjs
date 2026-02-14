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

// Clerk Appearance カスタマイズ
// アプリのデザインシステムに統一（モノトーン、モバイルファースト）
const clerkAppearance = {
  variables: {
    colorPrimary: '#111827', // gray-900
    colorBackground: '#ffffff',
    colorText: '#111827',
    colorTextSecondary: '#6b7280', // gray-500
    colorInputBackground: '#ffffff',
    colorInputText: '#111827',
    borderRadius: '0.75rem', // rounded-xl
    fontFamily: '"Noto Sans JP", "Inter", sans-serif',
  },
  elements: {
    card: 'shadow-xl border border-gray-100',
    formButtonPrimary:
      'bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors',
    formFieldInput:
      'border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-lg',
    footerActionLink: 'text-gray-600 hover:text-gray-900',
  },
};

const clerkIntegration = clerkEnabled
  ? [
      (await import('@clerk/astro')).default({
        // fallbackRedirectUrl を使用（afterSignInUrl は deprecated）
        fallbackRedirectUrl: '/',
        // Appearance カスタマイズでブランド統一
        appearance: clerkAppearance,
        // 日本語化
        localization: {
          locale: 'ja-JP',
        },
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
