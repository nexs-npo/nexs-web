/**
 * 署名状態確認 API
 * GET /api/signing/status?slug={reference_slug}
 *
 * 認証不要 — 署名状態は誰でも閲覧可能（透明性の原則）。
 *
 * レスポンス:
 * {
 *   request: SignatureRequest | null,
 *   signatures: Array<{
 *     id: string,
 *     signer_clerk_id: string,   // Clerk userId（不透明ID）
 *     status: 'pending' | 'signed' | 'declined',
 *     signed_at: string | null,
 *   }>,
 * }
 *
 * 署名者名の表示について:
 * Supabase には Clerk userId のみ保存する。氏名の解決はクライアント側か
 * 別エンドポイントで行う（Safety by Exclusion: PIIを保存しない）。
 */

import type { APIRoute } from 'astro';
import { getSignatureRequestBySlug } from '@/lib/signing';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  // Astro slugs are always lowercase — normalize for consistent DB lookup
  const slug = url.searchParams.get('slug')?.toLowerCase();

  if (!slug) {
    return new Response(
      JSON.stringify({ error: 'slug パラメータが必要です' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { data, error } = await getSignatureRequestBySlug(slug);

  if (error) {
    return new Response(
      JSON.stringify({ error: '署名データの取得に失敗しました' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!data) {
    // 署名リクエストがまだ存在しない（正常状態）
    return new Response(JSON.stringify({ request: null, signatures: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      request: {
        id: data.id,
        title: data.title,
        document_type: data.document_type,
        status: data.status,
        required_signers: data.required_signers,
        created_at: data.created_at,
        completed_at: data.completed_at,
      },
      signatures: data.signatures.map((s) => ({
        id: s.id,
        signer_clerk_id: s.signer_clerk_id,
        status: s.status,
        signed_at: s.signed_at,
      })),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
