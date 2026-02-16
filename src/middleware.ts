import { sequence } from 'astro:middleware';
import { clerkMiddleware } from '@clerk/astro/server';

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
 * Clerk 認証ミドルウェア
 *
 * 【UX改善】/mydesk は protect() を呼ばず、ページレベルで認証チェック
 * → 未認証でもページにアクセス可能にし、ページ内でモーダルログインを表示
 * → 別ドメインへのリダイレクトを防ぎ、アプリ内で認証完結
 *
 * 参考: https://clerk.com/docs/reference/astro/clerk-middleware
 */
const authMiddleware = clerkEnabled
  ? clerkMiddleware()
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
