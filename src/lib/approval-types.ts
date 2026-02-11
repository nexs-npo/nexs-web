/**
 * Approval System Types
 *
 * 議案承認システムのデータ型定義
 */

// ========================================
// Core Types
// ========================================

/**
 * 承認レコード（GitHub に保存される JSON の型）
 */
export interface ApprovalRecord {
  /** 対象議案ID (例: "RES-2026-001") */
  proposalId: string;

  /** 承認者の Clerk User ID */
  approverId: string;

  /** 承認者の表示名（署名用） */
  approverName: string;

  /** 承認時の議案コンテンツ SHA-256 ハッシュ（改ざん検知用） */
  targetContentHash: string;

  /** 承認時刻 (ISO 8601) */
  timestamp: string;

  /** 再認証レベル ("strict", "strict_mfa" 等) */
  authLevel: string;

  /** Clerk Session ID（監査追跡用） */
  sessionId: string;
}

// ========================================
// API Request/Response Types
// ========================================

/**
 * 承認アクション リクエストボディ
 */
export interface ApproveRequest {
  /** 対象議案ID */
  proposalId: string;

  /** クライアントが計算したコンテンツハッシュ */
  contentHash: string;
}

/**
 * 承認一覧 API レスポンス
 */
export interface ApprovalsListResponse {
  /** 承認レコードの配列 */
  approvals: ApprovalRecord[];

  /** 総承認数 */
  total: number;
}

/**
 * 承認アクション API レスポンス
 */
export interface ApproveResponse {
  /** 成功メッセージ */
  message: string;

  /** 作成された承認レコード */
  approval: ApprovalRecord;
}

/**
 * エラーレスポンス
 */
export interface ErrorResponse {
  /** エラーメッセージ */
  error: string;

  /** エラーコード（オプション） */
  code?: string;
}
