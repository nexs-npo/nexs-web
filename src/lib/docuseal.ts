/**
 * DocuSeal API Client
 *
 * DocuSeal（電子署名エンジン）のREST APIラッパー。
 * サーバーサイドのみで使用すること（APIキーを含む）。
 *
 * API Reference: https://www.docuseal.co/docs/api
 */

const DOCUSEAL_API_URL = import.meta.env.DOCUSEAL_API_URL;
const DOCUSEAL_API_KEY = import.meta.env.DOCUSEAL_API_KEY;

// ============================================================
// Types
// ============================================================

export type DocuSealTemplate = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  slug: string;
};

export type DocuSealSubmitter = {
  id: number;
  submission_id: number;
  uuid: string;
  email: string;
  name: string | null;
  role: string;
  status: 'awaiting' | 'opened' | 'completed' | 'declined';
  external_id: string | null; // Clerk userId を渡す
  embed_src: string | null; // 埋め込み署名URL
  completed_at: string | null;
  declined_at: string | null;
  created_at: string;
};

export type DocuSealSubmission = {
  id: number;
  template_id: number;
  status: 'pending' | 'completed' | 'expired';
  submitters: DocuSealSubmitter[];
  created_at: string;
  completed_at: string | null;
  audit_log_url: string | null;
  combined_document_url: string | null;
};

export type CreateSubmissionParams = {
  template_id: number;
  submitters: {
    name: string;
    email: string;
    role: string;
    external_id?: string; // Clerk userId
    values?: Record<string, string>;
  }[];
};

// ============================================================
// HTTP Client
// ============================================================

async function docusealFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!DOCUSEAL_API_URL || !DOCUSEAL_API_KEY) {
    throw new Error('DocuSeal environment variables are not configured');
  }

  const url = `${DOCUSEAL_API_URL}/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'X-Auth-Token': DOCUSEAL_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DocuSeal API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ============================================================
// API Methods
// ============================================================

/** テンプレート一覧を取得 */
export async function listTemplates(): Promise<DocuSealTemplate[]> {
  const data = await docusealFetch<{ data: DocuSealTemplate[] }>('/templates');
  return data.data;
}

/** テンプレート詳細を取得 */
export async function getTemplate(
  templateId: number,
): Promise<DocuSealTemplate> {
  return docusealFetch<DocuSealTemplate>(`/templates/${templateId}`);
}

/** 署名リクエスト（Submission）を作成し、署名者の埋め込みURLを返す */
export async function createSubmission(
  params: CreateSubmissionParams,
): Promise<DocuSealSubmission> {
  return docusealFetch<DocuSealSubmission>('/submissions', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/** Submission の状態を取得 */
export async function getSubmission(
  submissionId: number,
): Promise<DocuSealSubmission> {
  return docusealFetch<DocuSealSubmission>(`/submissions/${submissionId}`);
}

/** 署名済みPDFのダウンロードURLを取得（combined document） */
export async function getSignedPdfUrl(
  submissionId: number,
): Promise<string | null> {
  const submission = await getSubmission(submissionId);
  return submission.combined_document_url;
}

// ============================================================
// Webhook Verification
// ============================================================

/**
 * DocuSeal Webhookの送信元を検証する
 *
 * DocuSealはカスタムヘッダー方式でWebhookを認証する。
 * リクエストヘッダーに X-nexs-Secret が含まれているか確認する。
 */
export function verifyWebhookSecret(headerSecret: string | null): boolean {
  const expectedSecret = import.meta.env.DOCUSEAL_WEBHOOK_SECRET;
  if (!expectedSecret) return false;
  if (!headerSecret) return false;
  return headerSecret === expectedSecret;
}
