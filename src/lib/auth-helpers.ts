/**
 * Clerk認証のヘルパー関数
 */

/**
 * Clerk が有効かどうかを確認
 */
export function isClerkEnabled(): boolean {
  return (
    !!process.env.PUBLIC_CLERK_PUBLISHABLE_KEY ||
    !!import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY
  );
}

/**
 * 現在のユーザーが認証されているかどうかを確認
 *
 * @param locals - Astro.locals
 * @returns 認証されている場合は true
 */
export function isAuthenticated(locals: any): boolean {
  if (!isClerkEnabled()) {
    return false;
  }

  const { userId } = locals.auth();
  return !!userId;
}
