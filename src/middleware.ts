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
 * APIルートの保護
 *
 * これらのルートは、未認証の場合 Clerk のログインページにリダイレクトされる。
 * （APIエンドポイントはモーダルログインではなく、完全な保護が必要）
 */
const isProtectedApiRoute = createRouteMatcher(['/api/governance/approve(.*)']);

/**
 * Clerk 認証ミドルウェア
 *
 * 【UX改善】/mydesk は protect() を呼ばず、ページレベルで認証チェック
 * → 未認証でもページにアクセス可能にし、ページ内でモーダルログインを表示
 * → 別ドメインへのリダイレクトを防ぎ、アプリ内で認証完結
 *
 * 【セキュリティ】APIルートは引き続き protect() で保護
 * → 未認証でのAPIアクセスを防ぐ
 *
 * 参考: https://clerk.com/docs/reference/astro/clerk-middleware
 */
const authMiddleware = clerkEnabled
  ? clerkMiddleware((auth, context) => {
      // APIルートのみ protect() を呼ぶ（未認証時はリダイレクト）
      if (isProtectedApiRoute(context.request)) {
        return auth().protect();
      }

      // /mydesk は protect() を呼ばず、通過させる
      // → mydesk.astro でページレベル認証チェック（既に実装済み）
      // → 未認証の場合は LoginPrompt を表示（mode="modal" でアプリ内完結）
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
