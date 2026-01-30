import { ExternalLink, GitCommitHorizontal, Info, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Commit {
  sha: string;
  message: string;
  date: string;
  author: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  filePath: string;
}

export default function AuditLogModal({ open, onClose, filePath }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError(null);

    fetch(`/api/governance/audit-log?path=${encodeURIComponent(filePath)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 503)
            throw new Error(
              '監査ログは現在利用できません（GITHUB_TOKEN未設定）',
            );
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then((data: Commit[]) => {
        setCommits(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, filePath]);

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-md rounded-lg border border-gray-200 p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <GitCommitHorizontal className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-bold text-gray-900">
              監査ログ (Audit Log)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 mb-4 p-3 bg-gray-50 rounded text-[10px] text-gray-500">
          <Info className="w-3 h-3 mt-0.5 shrink-0" />
          <p>
            このログはGitHub上のコミット履歴から取得しています。
            すべての変更はGitのコミットとして記録されており、改ざんできません。
          </p>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              <p className="text-xs text-gray-400 mt-2">取得中...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && commits.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs text-gray-400">コミット履歴がありません</p>
            </div>
          )}

          {!loading && !error && commits.length > 0 && (
            <div className="space-y-0">
              {commits.map((commit, i) => (
                <div key={commit.sha} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                    {i < commits.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200" />
                    )}
                  </div>
                  {/* Card */}
                  <div className="pb-4 flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {commit.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-gray-400">
                        {commit.sha.slice(0, 7)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {commit.author}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(commit.date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <a
            href="https://github.com/shinkkhs/nexs-web"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            GitHub で確認
          </a>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-900 transition-colors px-3 py-1"
          >
            閉じる
          </button>
        </div>
      </div>
    </dialog>
  );
}
