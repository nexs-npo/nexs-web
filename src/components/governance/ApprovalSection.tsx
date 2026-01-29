import { useState } from 'react';
import { ShieldCheck, CheckCircle2, FileSearch, PenTool, Lock } from 'lucide-react';
import AuditLogModal from './AuditLogModal';

const TOTAL_REQUIRED = 3;

interface Props {
  approvalCount: number;
  slug: string;
}

export default function ApprovalSection({ approvalCount, slug }: Props) {
  const [auditOpen, setAuditOpen] = useState(false);

  const filePath = `src/content/resolutions/${slug}.mdx`;
  const allApproved = approvalCount >= TOTAL_REQUIRED;

  return (
    <>
      <section className="mb-8">
        <div className="bg-white border-2 border-gray-900 rounded-lg p-5 shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gray-900" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">承認状況 (Approval Status)</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">承認者はGitコミット履歴で検証可能</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-mono font-bold text-gray-900">
                {approvalCount}
                <span className="text-sm text-gray-400">/{TOTAL_REQUIRED}</span>
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex gap-1.5">
              {Array.from({ length: TOTAL_REQUIRED }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < approvalCount ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 font-mono">
              {allApproved
                ? '必要な承認が完了しています'
                : `あと${TOTAL_REQUIRED - approvalCount}件の承認が必要です`}
            </p>
          </div>

          {/* Signatures */}
          <div className="space-y-2 mb-4">
            {Array.from({ length: TOTAL_REQUIRED }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 p-2 rounded ${
                  i < approvalCount ? 'bg-gray-50' : ''
                }`}
              >
                {i < approvalCount ? (
                  <CheckCircle2 className="w-4 h-4 text-gray-900" />
                ) : (
                  <PenTool className="w-4 h-4 text-gray-300" />
                )}
                <span
                  className={`text-xs ${
                    i < approvalCount
                      ? 'font-bold text-gray-900'
                      : 'text-gray-300'
                  }`}
                >
                  {i < approvalCount ? `署名 #${i + 1}` : '未署名'}
                </span>
              </div>
            ))}
          </div>

          {/* Audit Log Button */}
          <button
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
