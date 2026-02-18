/**
 * 署名リクエスト作成 API
 * POST /api/signing/create
 *
 * 議案に対する署名リクエストを作成し、DocuSeal Submission を起動する。
 * 認証必須（board または admin ロールのみ）。
 *
 * リクエストボディ:
 * {
 *   template_id: number,          // DocuSeal のテンプレート ID
 *   reference_slug: string,       // 議案スラグ（例: "RES-2026-001"）
 *   reference_id: string,         // 議案 ID（例: "RES-2026-001"）
 *   title: string,                // 署名リクエストの表示タイトル
 *   document_type: string,        // 'board_resolution' など
 *   submitters: Array<{
 *     clerk_user_id: string,      // 署名者の Clerk userId
 *     role: string,               // DocuSeal テンプレート上のロール名
 *   }>
 * }
 *
 * レスポンス:
 * {
 *   request_id: string,           // Supabase の署名リクエスト ID
 *   embed_src: string | null,     // リクエスト者自身の署名 URL（即時署名用）
 * }
 *
 * 設計メモ（01_PHILOSOPHY.md 準拠）:
 * - PIIをSupabaseに保存しない: 署名者のメール・氏名はClerkから取得してDocuSealに渡すが、Supabaseには保存しない
 * - Clerk userIdのみをSupabaseに保存（不透明ID）
 * - エラー時は適切なHTTPステータスコードで返す（UIがフォールバックを表示できるように）
 */

import { clerkClient } from '@clerk/astro/server';
import type { APIRoute } from 'astro';
import { createSubmission } from '@/lib/docuseal';
import { isBoardOrAdmin } from '@/lib/roles';
import { createSignatureRequest, createSignatures } from '@/lib/signing';

export const prerender = false;

type SubmitterInput = {
  clerk_user_id: string;
  role: string;
};

type CreateRequestBody = {
  template_id: number;
  reference_slug: string;
  reference_id: string;
  title: string;
  document_type:
    | 'board_resolution'
    | 'general_resolution'
    | 'membership'
    | 'employment'
    | 'volunteer';
  submitters: SubmitterInput[];
};

export const POST: APIRoute = async (context) => {
  const { request, locals } = context;

  // ── 1. 認証チェック ────────────────────────────────────────
  const { userId, sessionClaims } = locals.auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: 'ログインが必要です' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ロールチェック: board 以上のみ署名リクエストを作成できる
  const role = sessionClaims?.role as string | undefined;
  if (!isBoardOrAdmin(role as Parameters<typeof isBoardOrAdmin>[0])) {
    return new Response(
      JSON.stringify({ error: '署名リクエストを作成する権限がありません' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // ── 2. リクエストボディ解析 ────────────────────────────────
  let body: CreateRequestBody;
  try {
    body = (await request.json()) as CreateRequestBody;
  } catch {
    return new Response(
      JSON.stringify({ error: 'リクエストの形式が不正です' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const {
    template_id,
    // Astro slugs are always lowercase — normalize to prevent case mismatch
    reference_slug: reference_slug_raw,
    reference_id,
    title,
    document_type,
    submitters,
  } = body;
  const reference_slug = reference_slug_raw?.toLowerCase();

  if (!template_id || !reference_slug || !title || !submitters?.length) {
    return new Response(
      JSON.stringify({ error: '必須パラメータが不足しています' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // ── 3. 署名者の情報を Clerk から取得 ──────────────────────
  // メール・氏名は DocuSeal に渡すが Supabase には保存しない（PII非保存原則）
  let submitterDetails: Array<
    (typeof submitters)[number] & { email: string | undefined; name: string }
  >;
  try {
    const clerk = clerkClient(context);
    submitterDetails = await Promise.all(
      submitters.map(async (s) => {
        const user = await clerk.users.getUser(s.clerk_user_id);
        const email =
          user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
            ?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
        const name =
          [user.firstName, user.lastName].filter(Boolean).join(' ') ||
          email?.split('@')[0] ||
          '未設定';
        return { ...s, email, name };
      }),
    );
  } catch (err) {
    console.error('[create] Failed to fetch submitter info from Clerk:', err);
    return new Response(
      JSON.stringify({ error: '署名者情報の取得に失敗しました' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // ── 4. DocuSeal Submission を作成 ──────────────────────────
  let submission: Awaited<ReturnType<typeof createSubmission>>;
  try {
    submission = await createSubmission({
      template_id,
      submitters: submitterDetails.map((s) => ({
        name: s.name,
        email: s.email,
        role: s.role,
        external_id: s.clerk_user_id, // Clerk userId → webhook で照合に使う
      })),
    });
  } catch (err) {
    console.error('[create] DocuSeal submission failed:', err);
    return new Response(
      JSON.stringify({ error: '署名サービスとの接続に失敗しました' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // DocuSeal POST /api/submissions は submitter の配列を返す
  // submission_id（作成された Submission の ID）は各 submitter が持つ
  if (!submission.length) {
    console.error('[create] DocuSeal returned empty submitters array');
    return new Response(
      JSON.stringify({ error: '署名サービスからの応答が不正でした' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const docusealSubmissionId = submission[0].submission_id;

  // ── 5. Supabase に署名リクエストを保存 ─────────────────────
  const { data: signatureRequest, error: reqErr } =
    await createSignatureRequest({
      document_type,
      title,
      reference_id,
      reference_slug,
      status: 'in_progress',
      required_signers: submitters.length,
      docuseal_submission_id: docusealSubmissionId,
      content_hash: null, // Phase 3 で実装
      created_by: userId,
      completed_at: null,
      expires_at: null,
    });

  if (reqErr || !signatureRequest) {
    console.error('[create] Failed to save signature request:', reqErr);
    return new Response(
      JSON.stringify({ error: 'データの保存に失敗しました' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // ── 6. 署名者レコードを Supabase に保存 ────────────────────
  // PIIは保存しない: Clerk userId のみ記録
  // submission は DocuSealSubmitter[] なので直接 Map を作成
  const submitterMap = new Map(submission.map((s) => [s.external_id, s]));

  const signatureRecords = submitters.map((s) => {
    const docusealSubmitter = submitterMap.get(s.clerk_user_id);
    return {
      request_id: signatureRequest.id,
      signer_clerk_id: s.clerk_user_id,
      status: 'pending' as const,
      docuseal_submitter_id: docusealSubmitter?.id ?? null,
      content_hash: null,
      signed_at: null,
      google_drive_file_id: null,
      metadata: null,
    };
  });

  const { error: sigErr } = await createSignatures(signatureRecords);
  if (sigErr) {
    console.error('[create] Failed to save signatures:', sigErr);
    // リクエストは作成済みなのでエラーにはしない（Webhookで補完可能）
  }

  // ── 7. リクエスト者の embed_src を取得して返す ──────────────
  // 「署名する」を押したユーザーがそのまま署名できる埋め込み URL
  // submission は DocuSealSubmitter[] なので直接 find する
  const mySubmitter = submission.find((s) => s.external_id === userId);
  const embedSrc = mySubmitter?.embed_src ?? null;

  return new Response(
    JSON.stringify({
      request_id: signatureRequest.id,
      embed_src: embedSrc,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
