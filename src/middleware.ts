import { sequence } from 'astro:middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

// ========================================
// Clerk Middleware
// ========================================

/**
 * プレビュー環境での protect() スキップ
 *
 * Coolify などの Docker コンテナ環境では、ミドルウェアでの環境変数アクセスが
 * 不安定な場合があるため、プレビュー環境では protect() をスキップする。
 *
 * clerkMiddleware 自体は実行されるため、Astro.locals.auth() は利用可能。
 * ただし、未認証でも保護ルートにアクセスできる（テスト用）。
 *
 * 本番環境では正常に動作するため問題なし。
 */
const isPreview = process.env.PREVIEW_MODE === 'true';

if (isPreview) {
  console.log('[Middleware] Preview mode detected - protect() will be skipped');
}

/**
 * Clerk が無効の場合はミドルウェアをスキップ
 */
const clerkEnabled =
  !!process.env.PUBLIC_CLERK_PUBLISHABLE_KEY ||
  !!import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * 保護ルート（認証が必要なルート）
 *
 * ここに指定したルートは、未認証の場合 Clerk のログインページにリダイレクトされる。
 * ただし、PREVIEW_MODE=true の場合は protect() がスキップされる。
 */
const isProtectedRoute = createRouteMatcher([
  '/mydesk(.*)',
  '/api/governance/approve(.*)',
]);

/**
 * Clerk 認証ミドルウェア
 *
 * 保護ルートにアクセスした未認証ユーザーを Sign In ページにリダイレクトする。
 * 公開ルートはそのまま通過。
 *
 * PREVIEW_MODE=true の場合は protect() をスキップ（未認証でもアクセス可能）。
 */
const authMiddleware = clerkEnabled
  ? clerkMiddleware((auth, context) => {
      if (!isPreview && isProtectedRoute(context.request)) {
        auth.protect();
      }
    })
  : // Clerk 無効時は何もしないミドルウェア
    (_context, next) => next();

// ========================================
// Export
// ========================================

/**
 * ミドルウェアの合成
 *
 * 現在は Clerk のみだが、将来的に他のミドルウェアを追加する場合は
 * sequence() に追加する。
 */
export const onRequest = sequence(authMiddleware);
