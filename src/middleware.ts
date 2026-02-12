import { sequence } from 'astro:middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

// ========================================
// Clerk Middleware
// ========================================

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
 */
const isProtectedRoute = createRouteMatcher([
  '/mydesk(.*)',
  '/api/governance/approve(.*)',
]);

/**
 * Clerk 認証ミドルウェア（公式パターン）
 *
 * 保護ルートにアクセスした未認証ユーザーを Sign In ページにリダイレクトする。
 * 公開ルートはそのまま通過。
 *
 * 参考: https://clerk.com/docs/reference/astro/clerk-middleware
 */
const authMiddleware = clerkEnabled
  ? clerkMiddleware((auth, context) => {
      const url = new URL(context.request.url);

      // 保護ルートでない場合は何もしない
      if (!isProtectedRoute(context.request)) {
        return;
      }

      // 認証状態を確認
      const { isAuthenticated, userId } = auth();

      // デバッグログ
      console.log('[Middleware]', {
        path: url.pathname,
        isAuthenticated,
        userId: userId || 'none',
      });

      // 未認証の場合はログインページにリダイレクト
      if (!isAuthenticated) {
        console.log('[Middleware] Redirecting to sign-in');
        return auth().redirectToSignIn();
      }

      console.log('[Middleware] Authenticated, allowing access');
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
