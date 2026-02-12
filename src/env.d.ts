/// <reference path="../.astro/types.d.ts" />

// Clerk Session Token の型拡張
declare global {
  interface CustomJwtSessionClaims {
    role?: 'admin' | 'board' | 'office' | 'regular' | 'supporter';
  }
}
