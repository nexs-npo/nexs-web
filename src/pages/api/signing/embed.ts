/**
 * 署名用埋め込みURL取得 API
 * GET /api/signing/embed?slug={reference_slug}
 *
 * 署名者本人が「署名する」を押したとき、DocuSeal の埋め込み署名URLを返す。
 * 認証必須 + 署名者本人のみアクセス可能。
 *
 * レスポンス:
 * { embed_src: string }
 */

import type { APIRoute } from 'astro';
import { getSubmission } from '@/lib/docuseal';
import { getSignatureRequestBySlug } from '@/lib/signing';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  // ── 1. 認証チェック ──────────────────────────────────────────
  const { userId } = locals.auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: 'ログインが必要です' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const slug = url.searchParams.get('slug');
  if (!slug) {
    return new Response(JSON.stringify({ error: 'slug が必要です' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── 2. 署名リクエストを取得 ──────────────────────────────────
  const { data: request, error: fetchErr } =
    await getSignatureRequestBySlug(slug);

  if (fetchErr) {
    return new Response(
      JSON.stringify({ error: '署名データの取得に失敗しました' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  if (!request?.docuseal_submission_id) {
    return new Response(
      JSON.stringify({ error: '署名リクエストが見つかりません' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  // ── 3. 署名者であることを確認 ────────────────────────────────
  const userSignature = request.signatures.find(
    (s) => s.signer_clerk_id === userId,
  );

  if (!userSignature) {
    return new Response(
      JSON.stringify({ error: 'この署名リクエストの署名者ではありません' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  if (userSignature.status === 'signed') {
    return new Response(JSON.stringify({ error: 'すでに署名済みです' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── 4. DocuSeal から埋め込みURLを取得 ────────────────────────
  let embedSrc: string | null = null;
  try {
    const submission = await getSubmission(request.docuseal_submission_id);
    const submitter = submission.submitters.find(
      (s) => s.external_id === userId,
    );
    embedSrc = submitter?.embed_src ?? null;
  } catch (err) {
    console.error('[embed] DocuSeal API error:', err);
    return new Response(
      JSON.stringify({ error: '署名サービスとの接続に失敗しました' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!embedSrc) {
    return new Response(
      JSON.stringify({ error: '署名URLが取得できませんでした' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  return new Response(JSON.stringify({ embed_src: embedSrc }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
