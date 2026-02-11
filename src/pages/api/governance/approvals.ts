import type { APIRoute } from 'astro';
import { listDirectory, getFileContent } from '@/lib/github';
import type { ApprovalRecord, ApprovalsListResponse, ErrorResponse } from '@/lib/approval-types';

export const prerender = false;

/**
 * GET /api/governance/approvals?proposalId=RES-2026-001
 *
 * 指定した議案の承認レコード一覧を取得
 */
export const GET: APIRoute = async ({ url }) => {
  const proposalId = url.searchParams.get('proposalId');

  // バリデーション: proposalId が必須
  if (!proposalId) {
    const error: ErrorResponse = { error: 'proposalId parameter is required' };
    return new Response(JSON.stringify(error), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // GITHUB_TOKEN の存在確認
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
    // GitHub API で承認ファイル一覧を取得
    const dirPath = `data/approvals/${proposalId}`;
    const files = await listDirectory(dirPath, token);

    // JSON ファイルのみをフィルタ
    const jsonFiles = files.filter((f) => f.type === 'file' && f.name.endsWith('.json'));

    // 各ファイルの内容を取得してパース
    const approvals: ApprovalRecord[] = [];
    for (const file of jsonFiles) {
      try {
        const content = await getFileContent(file.path, token);
        const record: ApprovalRecord = JSON.parse(content);
        approvals.push(record);
      } catch (err) {
        // パースエラーは無視（壊れたファイルがあっても続行）
        console.error(`Failed to parse approval file: ${file.path}`, err);
      }
    }

    // timestamp でソート（新しい順）
    approvals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const response: ApprovalsListResponse = {
      approvals,
      total: approvals.length,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Failed to fetch approvals:', err);
    const error: ErrorResponse = {
      error: err instanceof Error ? err.message : 'Failed to fetch approvals',
    };
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
