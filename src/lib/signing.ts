/**
 * Signing Data Access Layer
 *
 * 電子署名システムのSupabaseデータ操作。
 * このモジュールはサーバーサイドのAPIルート・Webhookハンドラからのみ呼ばれる。
 *
 * 設計原則（01_PHILOSOPHY.md準拠）:
 * - Safety by Exclusion: PIIは一切保存しない。Clerk userIdは不透明IDとして扱う。
 * - Isolation over Abstraction: 他機能から独立した署名専用モジュール。
 * - Resilience: DB操作は全てtry/catchでラップし、エラーを呼び出し元に返す。
 * - Replaceable Code: Supabaseを別DBに差し替える場合はこのファイルのみ変更。
 */

import type { Database } from './supabase';
import { createServiceClient, supabase } from './supabase';

// ============================================================
// Types
// ============================================================

export type SignatureRequest =
  Database['public']['Tables']['signature_requests']['Row'];
export type SignatureRequestInsert =
  Database['public']['Tables']['signature_requests']['Insert'];
export type Signature = Database['public']['Tables']['signatures']['Row'];
export type SignatureInsert =
  Database['public']['Tables']['signatures']['Insert'];

// 署名リクエストと紐づく署名一覧を合わせた表示用の型
export type SignatureRequestWithSignatures = SignatureRequest & {
  signatures: Signature[];
};

// ============================================================
// Read Operations（anonクライアント / 公開データ）
// ============================================================

/**
 * 議案スラグから署名リクエストを取得する
 * 認証不要 — 署名状態は誰でも閲覧可能（透明性の原則）
 */
export async function getSignatureRequestBySlug(
  slug: string,
): Promise<{
  data: SignatureRequestWithSignatures | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('signature_requests')
      .select('*, signatures(*)')
      .eq('reference_slug', slug)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // レコードが存在しない場合は正常（まだ署名リクエストがない）
      if (error.code === 'PGRST116') return { data: null, error: null };
      throw error;
    }

    return { data: data as SignatureRequestWithSignatures, error: null };
  } catch (err) {
    console.error('getSignatureRequestBySlug error:', err);
    return { data: null, error: '署名データの取得に失敗しました' };
  }
}

/**
 * IDから署名リクエストを取得する
 */
export async function getSignatureRequestById(
  id: string,
): Promise<{
  data: SignatureRequestWithSignatures | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('signature_requests')
      .select('*, signatures(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data: data as SignatureRequestWithSignatures, error: null };
  } catch (err) {
    console.error('getSignatureRequestById error:', err);
    return { data: null, error: '署名データの取得に失敗しました' };
  }
}

// ============================================================
// Write Operations（service_roleクライアント / サーバーサイドのみ）
// ============================================================

/**
 * 新規署名リクエストを作成する
 * /api/signing/create から呼ばれる
 */
export async function createSignatureRequest(
  params: SignatureRequestInsert,
): Promise<{ data: SignatureRequest | null; error: string | null }> {
  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from('signature_requests')
      .insert(params)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('createSignatureRequest error:', err);
    return { data: null, error: '署名リクエストの作成に失敗しました' };
  }
}

/**
 * 署名リクエストのステータスと DocuSeal Submission ID を更新する
 * 署名リクエスト作成後、DocuSeal から Submission ID が返ってきたタイミングで呼ぶ
 */
export async function updateSignatureRequestStatus(
  id: string,
  updates: Pick<
    SignatureRequestInsert,
    'status' | 'docuseal_submission_id' | 'completed_at'
  >,
): Promise<{ error: string | null }> {
  try {
    const db = createServiceClient();
    const { error } = await db
      .from('signature_requests')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('updateSignatureRequestStatus error:', err);
    return { error: '署名リクエストの更新に失敗しました' };
  }
}

/**
 * 個別の署名記録を作成する
 * 署名リクエスト作成時に、各署名者分のレコードをまとめて作成する
 */
export async function createSignatures(
  records: SignatureInsert[],
): Promise<{ error: string | null }> {
  try {
    const db = createServiceClient();
    const { error } = await db.from('signatures').insert(records);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('createSignatures error:', err);
    return { error: '署名レコードの作成に失敗しました' };
  }
}

/**
 * 署名完了時に個別署名レコードを更新する
 * DocuSeal Webhook（submission.completed）から呼ばれる
 *
 * 更新内容:
 * - status: 'signed'
 * - signed_at: 署名日時（DocuSeal提供）
 * - docuseal_submitter_id: DocuSeal上の署名者ID
 * - content_hash: 署名時点のコンテンツハッシュ
 * - google_drive_file_id: 署名済みPDFの保管先（Phase 4で追加）
 * - metadata: DocuSealの監査情報（PII除外済みのもの）
 */
export async function markSignatureCompleted(
  requestId: string,
  signerClerkId: string,
  updates: Pick<
    SignatureInsert,
    | 'status'
    | 'signed_at'
    | 'docuseal_submitter_id'
    | 'content_hash'
    | 'google_drive_file_id'
    | 'metadata'
  >,
): Promise<{ error: string | null }> {
  try {
    const db = createServiceClient();
    const { error } = await db
      .from('signatures')
      .update(updates)
      .eq('request_id', requestId)
      .eq('signer_clerk_id', signerClerkId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('markSignatureCompleted error:', err);
    return { error: '署名完了の記録に失敗しました' };
  }
}

/**
 * 署名リクエストの全員が署名完了したか確認し、完了なら request ステータスを更新
 * Webhook処理の最後に呼ぶ
 */
export async function checkAndCompleteRequest(
  requestId: string,
): Promise<{ error: string | null }> {
  try {
    const db = createServiceClient();

    // 署名リクエストと全署名レコードを取得
    const { data: request, error: reqErr } = await db
      .from('signature_requests')
      .select('required_signers')
      .eq('id', requestId)
      .single();

    if (reqErr) throw reqErr;

    const { data: sigs, error: sigErr } = await db
      .from('signatures')
      .select('status')
      .eq('request_id', requestId);

    if (sigErr) throw sigErr;

    const signedCount = sigs.filter((s) => s.status === 'signed').length;

    if (signedCount >= request.required_signers) {
      const { error: updateErr } = await db
        .from('signature_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateErr) throw updateErr;
    }

    return { error: null };
  } catch (err) {
    console.error('checkAndCompleteRequest error:', err);
    return { error: '署名完了チェックに失敗しました' };
  }
}
