import { useAuth } from '@clerk/astro/react';
import { useReverification } from '@clerk/shared/react';
import {
  AlertCircle,
  CheckCircle2,
  FileSearch,
  Loader2,
  Lock,
  PenTool,
  ShieldCheck,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type {
  ApprovalRecord,
  ApprovalsListResponse,
  ApproveResponse,
} from '@/lib/approval-types';
import AuditLogModal from './AuditLogModal';

interface Props {
  proposalId: string;
  slug: string;
  contentHash: string;
  totalRequired?: number;
}

export default function ApprovalSection({
  proposalId,
  slug,
  contentHash,
  totalRequired = 3,
}: Props) {
  const { isSignedIn, userId } = useAuth();
  const [auditOpen, setAuditOpen] = useState(false);

  // 承認データの状態管理
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 承認アクションの状態管理
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [approveSuccess, setApproveSuccess] = useState(false);

  const filePath = `src/content/resolutions/${slug}.mdx`;
  const approvalCount = approvals.length;
  const allApproved = approvalCount >= totalRequired;
  const userHasApproved = approvals.some((a) => a.approverId === userId);

  // ========================================
  // 承認データの取得
  // ========================================

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/governance/approvals?proposalId=${encodeURIComponent(proposalId)}`,
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch approvals: ${res.status}`);
      }

      const data: ApprovalsListResponse = await res.json();
      setApprovals(data.approvals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId]);

  // ========================================
  // 承認アクション（再認証付き）
  // ========================================

  const [performApproval] = useReverification(
    async () => {
      setApproving(true);
      setApproveError(null);
      setApproveSuccess(false);

      const res = await fetch('/api/governance/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, contentHash }),
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Approval failed: ${res.status}`);
      }

      const data: ApproveResponse = await res.json();
      return data;
    },
    {
      onCancel: () => {
        setApproving(false);
        setApproveError('承認がキャンセルされました');
      },
    },
  );

  const handleApprove = async () => {
    try {
      const result = await performApproval();
      if (!result) return; // キャンセルされた場合

      setApproveSuccess(true);
      setApproving(false);

      // 承認一覧を再取得
      await fetchApprovals();

      // 成功メッセージを3秒後に消す
      setTimeout(() => setApproveSuccess(false), 3000);
    } catch (err) {
      setApproving(false);
      setApproveError(err instanceof Error ? err.message : 'Approval failed');
    }
  };

  // ========================================
  // UI レンダリング
  // ========================================

  return (
    <>
      <section className="mb-8">
        <div className="bg-white border-2 border-gray-900 rounded-lg p-5 shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gray-900" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  承認状況 (Approval Status)
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  承認者はGitコミット履歴で検証可能
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-mono font-bold text-gray-900">
                {approvalCount}
                <span className="text-sm text-gray-400">/{totalRequired}</span>
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex gap-1.5">
              {/* biome-ignore lint/suspicious/noArrayIndexKey: Static progress bar slots */}
              {Array.from({ length: totalRequired }).map((_, i) => (
                <div
                  key={`progress-${i}`}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < approvalCount ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 font-mono">
              {allApproved
                ? '必要な承認が完了しています'
                : `あと${totalRequired - approvalCount}件の承認が必要です`}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-4 text-gray-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              承認データを読み込み中...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded text-xs text-red-600 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Signatures */}
          {!loading && !error && (
            <div className="space-y-2 mb-4">
              {approvals.map((approval, _i) => (
                <div
                  key={approval.approverId}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-900" />
                    <div>
                      <span className="text-xs font-bold text-gray-900">
                        {approval.approverName}
                      </span>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {new Date(approval.timestamp).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty Slots */}
              {/* biome-ignore lint/suspicious/noArrayIndexKey: Static empty slots */}
              {Array.from({ length: totalRequired - approvalCount }).map(
                (_, i) => (
                  <div
                    key={`empty-slot-${approvalCount + i}`}
                    className="flex items-center gap-2 p-2 rounded"
                  >
                    <PenTool className="w-4 h-4 text-gray-300" />
                    <span className="text-xs text-gray-300">未署名</span>
                  </div>
                ),
              )}
            </div>
          )}

          {/* Approve Button (認証済み & 未承認ユーザーのみ) */}
          {isSignedIn && !userHasApproved && !allApproved && !loading && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleApprove}
                disabled={approving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {approving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    承認処理中...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    この議案を承認する
                  </>
                )}
              </button>

              {/* Approve Error */}
              {approveError && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{approveError}</span>
                </div>
              )}

              {/* Approve Success */}
              {approveSuccess && (
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded text-xs text-green-600 mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>承認が完了しました</span>
                </div>
              )}
            </div>
          )}

          {/* Already Approved Message */}
          {isSignedIn && userHasApproved && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 text-center">
              あなたはすでにこの議案を承認しています
            </div>
          )}

          {/* Content Hash (Collapsible) */}
          <details className="mb-4">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
              コンテンツハッシュを表示
            </summary>
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <p className="text-[10px] font-mono text-gray-400 break-all">
                {contentHash}
              </p>
            </div>
          </details>

          {/* Audit Log Button */}
          <button
            type="button"
            onClick={() => setAuditOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <FileSearch className="w-3.5 h-3.5" />
            署名履歴を確認する (Audit Log)
          </button>

          {/* Tamper-proof note */}
          <div className="flex items-center justify-center gap-1 mt-3">
            <Lock className="w-3 h-3 text-gray-300" />
            <span className="text-[10px] text-gray-300 font-mono">
              Tamper-proof: verified via Git history
            </span>
          </div>
        </div>
      </section>

      <AuditLogModal
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
        filePath={filePath}
      />
    </>
  );
}
