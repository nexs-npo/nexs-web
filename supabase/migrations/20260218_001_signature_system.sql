-- ============================================================
-- Signature System Schema
-- Created: 2026-02-18
-- Branch: feat/digital-signature-flow
--
-- 署名システム用テーブル。PIIは保持しない。
-- - Clerk userId（不透明ID）のみ保存
-- - 署名者名はClerkから表示時に解決する
-- - 署名済みPDFはGoogle Workspaceに保管（PII例外）
-- ============================================================

-- ============================================================
-- 署名リクエスト（署名を求める文書単位）
-- ============================================================
CREATE TABLE IF NOT EXISTS signature_requests (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type          TEXT NOT NULL,
  -- 'board_resolution' | 'general_resolution' | 'membership' | 'employment' | 'volunteer'
  title                  TEXT NOT NULL,
  reference_id           TEXT,             -- 議案ID等の外部参照（例: 'RES-2026-001'）
  reference_slug         TEXT,             -- コンテンツへのスラグ
  status                 TEXT NOT NULL DEFAULT 'pending',
  -- 'pending' | 'in_progress' | 'completed' | 'expired'
  required_signers       INTEGER NOT NULL DEFAULT 1,
  docuseal_submission_id INTEGER,
  content_hash           TEXT,             -- 署名対象コンテンツのSHA-256
  created_by             TEXT NOT NULL,    -- Clerk userId
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at           TIMESTAMPTZ,
  expires_at             TIMESTAMPTZ
);

-- ============================================================
-- 個別の署名記録
-- ============================================================
CREATE TABLE IF NOT EXISTS signatures (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id             UUID NOT NULL REFERENCES signature_requests(id) ON DELETE CASCADE,
  signer_clerk_id        TEXT NOT NULL,    -- Clerk userId（PIIではない）
  status                 TEXT NOT NULL DEFAULT 'pending',
  -- 'pending' | 'signed' | 'declined'
  docuseal_submitter_id  INTEGER,
  content_hash           TEXT,             -- 署名時点のコンテンツハッシュ
  signed_at              TIMESTAMPTZ,
  google_drive_file_id   TEXT,             -- 署名済みPDFの参照
  metadata               JSONB,            -- DocuSeal監査情報等（PII除外）
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- インデックス
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_signature_requests_reference_slug
  ON signature_requests(reference_slug);

CREATE INDEX IF NOT EXISTS idx_signature_requests_status
  ON signature_requests(status);

CREATE INDEX IF NOT EXISTS idx_signatures_request_id
  ON signatures(request_id);

CREATE INDEX IF NOT EXISTS idx_signatures_signer_clerk_id
  ON signatures(signer_clerk_id);

-- ============================================================
-- Row Level Security
-- 署名記録は全員が閲覧可能（透明性）
-- 書き込みはサービスロールキー（サーバーサイド）のみ
-- ============================================================
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能
CREATE POLICY "Anyone can read signature_requests"
  ON signature_requests FOR SELECT USING (true);

CREATE POLICY "Anyone can read signatures"
  ON signatures FOR SELECT USING (true);

-- 書き込みはサービスロールのみ（RLSをバイパス）
-- → nexs-web のサーバーサイドAPIが service_role キーで操作
