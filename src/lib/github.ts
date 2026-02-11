/**
 * GitHub Contents API Utility
 *
 * GitHub Contents API を使って承認データの読み書きを行うユーティリティ。
 * 既存の audit-log.ts のパターンを踏襲。
 */

const REPO = 'nexs-npo/nexs-web';
const API_BASE = 'https://api.github.com';

/**
 * GitHub API リクエストの共通ヘッダー
 */
function getHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'nexs-web',
  };
}

// ========================================
// Types
// ========================================

/**
 * GitHub Contents API のファイルエントリ
 */
export interface GitHubFileEntry {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  download_url: string | null;
}

/**
 * GitHub Contents API のファイル内容レスポンス
 */
interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  content: string; // Base64 encoded
  encoding: string;
}

// ========================================
// Read Operations
// ========================================

/**
 * ファイルの内容を取得
 *
 * @param path - リポジトリ内のファイルパス
 * @param token - GitHub Personal Access Token
 * @returns ファイル内容（テキスト）
 */
export async function getFileContent(path: string, token: string): Promise<string> {
  const url = `${API_BASE}/repos/${REPO}/contents/${encodeURIComponent(path)}`;

  const res = await fetch(url, {
    headers: getHeaders(token),
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`File not found: ${path}`);
    }
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data: GitHubFileContent = await res.json();

  // Base64 デコード
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return content;
}

/**
 * ディレクトリ内のファイル一覧を取得
 *
 * @param path - リポジトリ内のディレクトリパス
 * @param token - GitHub Personal Access Token
 * @returns ファイルエントリの配列（空配列の場合もあり）
 */
export async function listDirectory(
  path: string,
  token: string
): Promise<GitHubFileEntry[]> {
  const url = `${API_BASE}/repos/${REPO}/contents/${encodeURIComponent(path)}`;

  const res = await fetch(url, {
    headers: getHeaders(token),
  });

  if (!res.ok) {
    if (res.status === 404) {
      // ディレクトリが存在しない場合は空配列を返す
      return [];
    }
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data: GitHubFileEntry[] = await res.json();
  return data;
}

// ========================================
// Write Operations
// ========================================

/**
 * ファイルを作成（新規作成のみ、上書きは不可）
 *
 * @param path - リポジトリ内のファイルパス
 * @param content - ファイル内容（テキスト）
 * @param message - コミットメッセージ
 * @param token - GitHub Personal Access Token
 */
export async function createFile(
  path: string,
  content: string,
  message: string,
  token: string
): Promise<void> {
  const url = `${API_BASE}/repos/${REPO}/contents/${encodeURIComponent(path)}`;

  // Base64 エンコード
  const contentBase64 = Buffer.from(content, 'utf-8').toString('base64');

  const body = {
    message,
    content: contentBase64,
    // branch: 'main', // デフォルトブランチに書き込む
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      ...getHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to create file: ${res.status} - ${JSON.stringify(errorData)}`
    );
  }
}
