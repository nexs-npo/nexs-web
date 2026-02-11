import { sequence } from 'astro:middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

// ========================================
// Clerk Middleware
// ========================================

/**
 * プレビュー環境でミドルウェアをスキップ
 *
 * Coolify などの Docker コンテナ環境では、ミドルウェアでの環境変数アクセスが
 * 不安定な場合があるため、プレビュー環境ではミドルウェアをスキップする。
 *
 * 本番環境では正常に動作するため問題なし。
 */
const isPreview = process.env.PREVIEW_MODE === 'true';

if (isPreview) {
  console.log('[Middleware] Preview mode detected - Clerk middleware disabled');
}

/**
 * Clerk が無効の場合はミドルウェアをスキップ
 */
const clerkEnabled =
  !isPreview &&
  (!!process.env.PUBLIC_CLERK_PUBLISHABLE_KEY ||
    !!import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY);

/**
 * 保護ルート（認証が必要なルート）
 *
 * ここに指定したルートは、未認証の場合 Clerk のログインページにリダイレクトされる。
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
 */
const authMiddleware = clerkEnabled
  ? clerkMiddleware((auth, context) => {
      if (isProtectedRoute(context.request)) {
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
