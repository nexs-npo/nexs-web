/**
 * DocuSeal Webhook Handler
 * POST /api/signing/webhook
 *
 * DocuSeal から署名完了通知を受け取り、Supabase のメタデータを更新する。
 * このエンドポイントはインターネットに公開されるため、送信元検証を必ず行う。
 *
 * 処理フロー:
 * 1. X-nexs-Secret ヘッダーで送信元を検証
 * 2. DocuSeal submission ID で署名リクエストを特定
 * 3. 各署名者の完了状態を signatures テーブルに反映
 * 4. 全員署名完了なら signature_requests を completed に更新
 * （Phase 4 で Google Drive への PDF 保管を追加予定）
 */

import type { APIRoute } from 'astro';
import { verifyWebhookSecret } from '@/lib/docuseal';
import { checkAndCompleteRequest, markSignatureCompleted } from '@/lib/signing';
import { supabase } from '@/lib/supabase';

export const prerender = false;

// DocuSeal Webhook のペイロード型定義
type DocuSealSubmitter = {
  id: number;
  external_id: string | null; // Clerk userId
  status: 'awaiting' | 'opened' | 'completed' | 'declined';
  completed_at: string | null;
};

type DocuSealWebhookPayload = {
  event_type: string;
  timestamp: string;
  data: {
    id: number; // DocuSeal submission ID
    status: string;
    submitters: DocuSealSubmitter[];
  };
};

export const POST: APIRoute = async ({ request }) => {
  // ── 1. 送信元検証 ──────────────────────────────────────────
  const secret = request.headers.get('x-nexs-secret');
  if (!verifyWebhookSecret(secret)) {
    console.warn('[webhook] Invalid or missing webhook secret');
    return new Response('Unauthorized', { status: 401 });
  }

  // ── 2. ペイロード解析 ──────────────────────────────────────
  let payload: DocuSealWebhookPayload;
  try {
    payload = (await request.json()) as DocuSealWebhookPayload;
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // submission.completed 以外は無視（設定上は来ないはずだが念のため）
  if (payload.event_type !== 'submission.completed') {
    return new Response('Ignored', { status: 200 });
  }

  const docusealSubmissionId = payload.data.id;

  // ── 3. Supabase から対応する署名リクエストを取得 ────────────
  const { data: requestRow, error: findErr } = await supabase
    .from('signature_requests')
    .select('id')
    .eq('docuseal_submission_id', docusealSubmissionId)
    .single();

  if (findErr || !requestRow) {
    console.error(
      '[webhook] Signature request not found for submission:',
      docusealSubmissionId,
      findErr,
    );
    // 200 を返す（DocuSeal がリトライしないように）
    return new Response('Request not found', { status: 200 });
  }

  const requestId = requestRow.id;

  // ── 4. 完了した署名者ごとに signatures テーブルを更新 ────────
  // external_id（Clerk userId）が設定されている完了済み署名者のみ処理
  const completedSubmitters = payload.data.submitters.filter(
    (s): s is DocuSealSubmitter & { external_id: string } =>
      s.status === 'completed' && typeof s.external_id === 'string',
  );

  for (const submitter of completedSubmitters) {
    const { error: markErr } = await markSignatureCompleted(
      requestId,
      submitter.external_id, // Clerk userId（型ガード済み）
      {
        status: 'signed',
        signed_at: submitter.completed_at ?? new Date().toISOString(),
        docuseal_submitter_id: submitter.id,
        content_hash: null, // Phase 3 で実装
        google_drive_file_id: null, // Phase 4 で実装
        metadata: {
          docuseal_submitter_id: submitter.id,
          docuseal_submission_id: docusealSubmissionId,
          // PII（氏名・メール）は含めない
        },
      },
    );

    if (markErr) {
      console.error('[webhook] Failed to mark signature:', markErr);
    }
  }

  // ── 5. 全員署名済みなら request を completed に ───────────────
  const { error: completeErr } = await checkAndCompleteRequest(requestId);
  if (completeErr) {
    console.error('[webhook] Failed to complete request:', completeErr);
  }

  return new Response('OK', { status: 200 });
};
