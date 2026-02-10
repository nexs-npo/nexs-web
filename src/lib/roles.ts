/**
 * Member Role Management
 *
 * ロール管理は Clerk の publicMetadata.role を唯一の真実源とする。
 * このファイルは型定義とヘルパー関数のみを提供する。
 */

// ========================================
// Types
// ========================================

/**
 * メンバーロール
 *
 * Clerk Dashboard で publicMetadata に設定する:
 * User → Metadata → Public → {"role": "board"}
 */
export type MemberRole = 'admin' | 'board' | 'office' | 'regular' | 'supporter';

/**
 * Clerk publicMetadata の型拡張
 */
export interface ClerkPublicMetadata {
  role?: MemberRole;
}

// ========================================
// Constants
// ========================================

/**
 * ロール表示名マッピング（日本語）
 */
export const ROLE_LABELS: Record<MemberRole, string> = {
  admin: 'システム管理者',
  board: 'ボードメンバー',
  office: '事務局メンバー',
  regular: '正会員',
  supporter: '賛助会員',
} as const;

/**
 * 全ロールのリスト（型ガード用）
 */
export const VALID_ROLES: MemberRole[] = [
  'admin',
  'board',
  'office',
  'regular',
  'supporter',
];

// ========================================
// Type Guards
// ========================================

/**
 * 値が有効な MemberRole かどうかを判定
 */
export function isValidRole(value: unknown): value is MemberRole {
  return typeof value === 'string' && VALID_ROLES.includes(value as MemberRole);
}

/**
 * Clerk の publicMetadata から安全にロールを取得
 *
 * @returns ロール or null（未設定 or 不正な値）
 */
export function getRoleFromMetadata(
  metadata: Record<string, unknown> | undefined
): MemberRole | null {
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }

  const role = metadata.role;
  return isValidRole(role) ? role : null;
}

// ========================================
// Role Checks
// ========================================

/**
 * 指定したロールを持つか判定
 */
export function hasRole(userRole: MemberRole | null, ...roles: MemberRole[]): boolean {
  if (!userRole) return false;
  return roles.includes(userRole);
}

/**
 * ボードメンバーまたは管理者か判定
 *
 * admin は全てのボード権限を含む
 */
export function isBoardOrAdmin(userRole: MemberRole | null): boolean {
  return hasRole(userRole, 'board', 'admin');
}

/**
 * 事務局メンバーまたは管理者か判定
 */
export function isOfficeOrAdmin(userRole: MemberRole | null): boolean {
  return hasRole(userRole, 'office', 'admin');
}

/**
 * 管理者か判定
 */
export function isAdmin(userRole: MemberRole | null): boolean {
  return hasRole(userRole, 'admin');
}

/**
 * 認証されている（何らかのロールを持つ）か判定
 */
export function isAuthenticated(userRole: MemberRole | null): boolean {
  return userRole !== null;
}
