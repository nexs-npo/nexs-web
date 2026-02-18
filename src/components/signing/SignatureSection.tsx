/**
 * SignatureSection
 *
 * 議案ページに表示する電子署名セクション。
 * 署名の進捗・署名者リスト・署名ボタン・DocuSeal埋め込みモーダルを提供する。
 *
 * 設計（01_PHILOSOPHY.md準拠）:
 * - PIIを持たない: 署名者名はサーバーサイドで解決せず、Clerk userIdのみ表示
 *   （MVP: "メンバー" or "あなた" 表記。Phase 4以降でIDから名前解決を検討）
 * - Resilience: APIエラー時はフォールバックメッセージを表示し、クラッシュしない
 * - Isolation: このコンポーネントは署名機能のみに責任を持つ
 */

import { useAuth } from '@clerk/astro/react';
import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================
// Types（status APIのレスポンスに対応）
// ============================================================

type SignatureStatus = 'pending' | 'signed' | 'declined';

type SignatureRecord = {
  id: string;
  signer_clerk_id: string;
  status: SignatureStatus;
  signed_at: string | null;
};

type SignatureRequest = {
  id: string;
  title: string;
  document_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  required_signers: number;
  created_at: string;
  completed_at: string | null;
};

type StatusResponse = {
  request: SignatureRequest | null;
  signatures: SignatureRecord[];
};

// ============================================================
// Props
// ============================================================

type Props = {
  referenceSlug: string; // 議案スラグ（例: "RES-2026-001"）
};

// ============================================================
// Component
// ============================================================

export default function SignatureSection({ referenceSlug }: Props) {
  const { userId, isLoaded } = useAuth();

  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // モーダル制御
  const [showModal, setShowModal] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [isFetchingEmbed, setIsFetchingEmbed] = useState(false);
  const [embedError, setEmbedError] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ── 署名状態の取得 ────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/signing/status?slug=${encodeURIComponent(referenceSlug)}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as StatusResponse;
      setStatusData(data);
    } catch {
      setError(
        '署名データの取得に失敗しました。しばらく後に再読み込みしてください。',
      );
    } finally {
      setLoading(false);
    }
  }, [referenceSlug]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // ── 「署名する」ボタン押下 ──────────────────────────────────
  const handleSignClick = async () => {
    setIsFetchingEmbed(true);
    setEmbedError(null);
    try {
      const res = await fetch(
        `/api/signing/embed?slug=${encodeURIComponent(referenceSlug)}`,
      );
      const data = (await res.json()) as { embed_src?: string; error?: string };

      if (!res.ok || !data.embed_src) {
        setEmbedError(data.error ?? '署名URLの取得に失敗しました');
        return;
      }

      setEmbedUrl(data.embed_src);
      setShowModal(true);
    } catch {
      setEmbedError('署名サービスへの接続に失敗しました');
    } finally {
      setIsFetchingEmbed(false);
    }
  };

  // ── モーダルを閉じて状態を更新 ───────────────────────────────
  const handleModalClose = () => {
    setShowModal(false);
    setEmbedUrl(null);
    // 署名が完了した可能性があるので状態を再取得
    fetchStatus();
  };

  // ── ローディング中 ────────────────────────────────────────
  if (!isLoaded || loading) {
    return (
      <section className="mb-12">
        <SectionHeader />
        <div className="text-xs text-gray-400 font-mono py-4">
          読み込み中...
        </div>
      </section>
    );
  }

  // ── エラー時（Resilience: クラッシュせずメッセージ表示）────────
  if (error) {
    return (
      <section className="mb-12">
        <SectionHeader />
        <div className="text-xs text-gray-400 py-4">{error}</div>
      </section>
    );
  }

  // ── 署名リクエストがまだない ────────────────────────────────
  if (!statusData?.request) {
    return (
      <section className="mb-12">
        <SectionHeader />
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 text-center">
          <p className="text-xs text-gray-400">
            署名リクエストはまだ作成されていません
          </p>
        </div>
      </section>
    );
  }

  const { request, signatures } = statusData;

  const signedCount = signatures.filter((s) => s.status === 'signed').length;
  const isCompleted = request.status === 'completed';
  const isExpired = request.status === 'expired';

  // 現在のユーザーの署名レコード
  const mySignature = userId
    ? signatures.find((s) => s.signer_clerk_id === userId)
    : null;
  const iAmSigner = !!mySignature;
  const iHaveSigned = mySignature?.status === 'signed';

  return (
    <section className="mb-12">
      <SectionHeader />

      {/* 進捗バー */}
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-700">
            {isCompleted ? '署名完了' : isExpired ? '期限切れ' : '署名進行中'}
          </span>
          <span className="text-xs font-mono text-gray-500">
            {signedCount} / {request.required_signers}
          </span>
        </div>

        {/* プログレスバー */}
        <div className="w-full h-1 bg-gray-200 rounded">
          <div
            className={`h-1 rounded transition-all duration-500 ${isCompleted ? 'bg-gray-900' : 'bg-gray-500'}`}
            style={{
              width: `${Math.min(100, (signedCount / request.required_signers) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* 署名者リスト */}
      <div className="space-y-2 mb-5">
        {signatures.map((sig) => {
          const isMe = sig.signer_clerk_id === userId;
          return (
            <div
              key={sig.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <SignerStatusIcon status={sig.status} />
                <span className="text-sm text-gray-700">
                  {isMe ? 'あなた' : 'メンバー'}
                </span>
                {isMe && (
                  <span className="text-[9px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    YOU
                  </span>
                )}
              </div>
              <div className="text-right">
                <span
                  className={`text-[10px] font-bold ${
                    sig.status === 'signed'
                      ? 'text-gray-900'
                      : sig.status === 'declined'
                        ? 'text-gray-400'
                        : 'text-gray-400'
                  }`}
                >
                  {sig.status === 'signed'
                    ? '署名済み'
                    : sig.status === 'declined'
                      ? '辞退'
                      : '未署名'}
                </span>
                {sig.signed_at && (
                  <div className="text-[9px] text-gray-400 font-mono mt-0.5">
                    {new Date(sig.signed_at).toLocaleDateString('ja-JP')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 署名ボタン */}
      {iAmSigner && !iHaveSigned && !isCompleted && !isExpired && (
        <div>
          {embedError && (
            <p className="text-xs text-gray-500 mb-2">{embedError}</p>
          )}
          <button
            type="button"
            onClick={handleSignClick}
            disabled={isFetchingEmbed}
            className="w-full py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingEmbed ? '署名URLを取得中...' : '署名する'}
          </button>
        </div>
      )}

      {/* 自分が署名済みのメッセージ */}
      {iAmSigner && iHaveSigned && (
        <div className="text-center py-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-bold text-gray-700">
            署名が完了しています
          </p>
        </div>
      )}

      {/* 全員署名完了 */}
      {isCompleted && (
        <div className="text-center py-3 bg-gray-900 rounded-xl">
          <p className="text-xs font-bold text-white">
            すべての署名が完了しました
          </p>
          {request.completed_at && (
            <p className="text-[9px] text-gray-400 font-mono mt-1">
              {new Date(request.completed_at).toLocaleDateString('ja-JP')}
            </p>
          )}
        </div>
      )}

      {/* DocuSeal 署名モーダル */}
      {showModal && embedUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">電子署名</h2>
              <button
                type="button"
                onClick={handleModalClose}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-mono"
              >
                ✕ 閉じる
              </button>
            </div>
            <iframe
              ref={iframeRef}
              src={embedUrl}
              className="w-full"
              style={{ height: '70vh' }}
              title="DocuSeal 電子署名"
            />
          </div>
        </div>
      )}
    </section>
  );
}

// ── サブコンポーネント ──────────────────────────────────────

function SectionHeader() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="block w-1 h-4 bg-gray-400" />
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
        電子署名
      </span>
    </div>
  );
}

function SignerStatusIcon({ status }: { status: SignatureStatus }) {
  if (status === 'signed') {
    return (
      <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] text-white font-bold">✓</span>
      </div>
    );
  }
  if (status === 'declined') {
    return (
      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] text-gray-400 font-bold">✕</span>
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
  );
}
