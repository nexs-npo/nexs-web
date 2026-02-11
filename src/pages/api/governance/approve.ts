import { reverificationErrorResponse } from '@clerk/shared/authorization-errors';
import type { APIRoute } from 'astro';
import type {
  ApprovalRecord,
  ApproveRequest,
  ApproveResponse,
  ErrorResponse,
} from '@/lib/approval-types';
import { createFile, getFileContent, listDirectory } from '@/lib/github';
import { computeHash } from '@/lib/hash';

export const prerender = false;

/**
 * POST /api/governance/approve
 *
 * 議案の承認アクションを実行
 * - Clerk 再認証を強制（5分以内の second_factor 認証）
 * - コンテンツハッシュを検証
 * - 重複承認をチェック
 * - GitHub に承認レコードを保存
 */
export const POST: APIRoute = async ({ request, locals }) => {
  // ========================================
  // 1. 認証チェック
  // ========================================

  const { userId, sessionId, has } = locals.auth();

  // 未認証
  if (!userId || !sessionId) {
    const error: ErrorResponse = {
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
    };
    return new Response(JSON.stringify(error), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 再認証チェック（5分以内に second_factor 認証を要求）
  const isReverified = has({
    reverification: { afterMinutes: 5, level: 'second_factor' },
  });

  if (!isReverified) {
    // Clerk の標準エラーレスポンスを返す（クライアントが自動で再認証モーダルを表示）
    return reverificationErrorResponse({
      afterMinutes: 5,
      level: 'second_factor',
    });
  }

  // ========================================
  // 2. リクエストボディの解析
  // ========================================

  let body: ApproveRequest;
  try {
    body = await request.json();
  } catch {
    const error: ErrorResponse = { error: 'Invalid JSON body' };
    return new Response(JSON.stringify(error), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { proposalId, contentHash } = body;

  if (!proposalId || !contentHash) {
    const error: ErrorResponse = {
      error: 'proposalId and contentHash are required',
      code: 'MISSING_FIELDS',
    };
    return new Response(JSON.stringify(error), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ========================================
  // 3. GITHUB_TOKEN の存在確認
  // ========================================

  const token = import.meta.env.GITHUB_TOKEN;
  if (!token) {
    const error: ErrorResponse = {
      error: 'GITHUB_TOKEN is not configured',
      code: 'TOKEN_MISSING',
    };
    return new Response(JSON.stringify(error), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // ========================================
    // 4. コンテンツハッシュ検証
    // ========================================

    // proposalId から slug を推測（例: RES-2026-001 → RES-2026-001）
    const slug = proposalId.toLowerCase();
    const mdxPath = `src/content/resolutions/${slug}.mdx`;

    let originalContent: string;
    try {
      originalContent = await getFileContent(mdxPath, token);
    } catch (_err) {
      const error: ErrorResponse = {
        error: `Resolution not found: ${proposalId}`,
        code: 'NOT_FOUND',
      };
      return new Response(JSON.stringify(error), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // フロントマターを除去して本文のみを取得
    const bodyMatch = originalContent.match(/^---\n.*?\n---\n(.*)$/s);
    const bodyText = bodyMatch ? bodyMatch[1] : originalContent;

    // サーバーサイドでハッシュを計算
    const serverHash = await computeHash(bodyText.trim());

    // クライアントから送られたハッシュと比較
    if (serverHash !== contentHash) {
      const error: ErrorResponse = {
        error: 'Content has been modified. Please reload the page.',
        code: 'CONTENT_MISMATCH',
      };
      return new Response(JSON.stringify(error), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ========================================
    // 5. 重複承認チェック
    // ========================================

    const dirPath = `data/approvals/${proposalId}`;
    const existingFiles = await listDirectory(dirPath, token);

    // すでに同じユーザーの承認が存在するか
    const userAlreadyApproved = existingFiles.some((f) =>
      f.name.includes(`_${userId}.json`),
    );

    if (userAlreadyApproved) {
      const error: ErrorResponse = {
        error: 'You have already approved this proposal',
        code: 'ALREADY_APPROVED',
      };
      return new Response(JSON.stringify(error), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ========================================
    // 6. 承認者の表示名を取得
    // ========================================

    // Clerk Backend SDK を使ってユーザー情報を取得
    const clerkSecretKey = import.meta.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      const error: ErrorResponse = {
        error: 'CLERK_SECRET_KEY is not configured',
        code: 'CLERK_NOT_CONFIGURED',
      };
      return new Response(JSON.stringify(error), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Clerk Backend SDK の動的インポート
    const { clerkClient } = await import('@clerk/astro/server');
    const user = await clerkClient().users.getUser(userId);

    // 日本式の姓名順（lastName + firstName）
    const approverName =
      `${user.lastName || ''} ${user.firstName || ''}`.trim() ||
      user.username ||
      userId;

    // ========================================
    // 7. 承認レコードの作成
    // ========================================

    const now = new Date();
    const timestamp = now.toISOString();

    // ファイル名用のタイムスタンプ（YYYYMMDD-HHmmss）
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const fileTimestamp = `${year}${month}${day}-${hours}${minutes}${seconds}`;

    const approvalRecord: ApprovalRecord = {
      proposalId,
      approverId: userId,
      approverName,
      targetContentHash: contentHash,
      timestamp,
      authLevel: 'strict', // 5分以内、second_factor
      sessionId,
    };

    // ========================================
    // 8. GitHub にコミット
    // ========================================

    const fileName = `${fileTimestamp}_${userId}.json`;
    const filePath = `${dirPath}/${fileName}`;
    const fileContent = JSON.stringify(approvalRecord, null, 2);
    const commitMessage = `approval: ${proposalId} by ${approverName}`;

    await createFile(filePath, fileContent, commitMessage, token);

    // ========================================
    // 9. 成功レスポンス
    // ========================================

    const response: ApproveResponse = {
      message: 'Approval recorded successfully',
      approval: approvalRecord,
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Failed to process approval:', err);
    const error: ErrorResponse = {
      error: err instanceof Error ? err.message : 'Failed to process approval',
    };
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
