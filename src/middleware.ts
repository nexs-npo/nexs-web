import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
import { sequence } from 'astro:middleware';

// ========================================
// Clerk Middleware
// ========================================

/**
 * Clerk が無効の場合はミドルウェアをスキップ
 *
 * 環境変数 PUBLIC_CLERK_PUBLISHABLE_KEY が設定されていない場合、
 * astro.config.mjs で Clerk インテグレーションがロードされない。
 * その状態で clerkMiddleware() を実行するとエラーになるため、
 * ミドルウェア自体を条件分岐でスキップする。
 */
const clerkEnabled = !!import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * 保護ルート（認証が必要なルート）
 *
 * ここに指定したルートは、未認証の場合 Clerk のログインページにリダイレクトされる。
 */
const isProtectedRoute = createRouteMatcher(['/mydesk(.*)', '/api/governance/approve(.*)']);

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
    (context, next) => next();

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
