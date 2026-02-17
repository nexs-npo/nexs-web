# 電子署名/承認フロー実装プラン

**作成日**: 2026-02-16
**ブランチ**: feat/digital-signature-flow
**ステータス**: 計画中

---

## 1. 目的

紙＋ハンコ相当の機能をアプリ内でデジタル完結させる。
登記・官公庁提出など外部手続きは対象外。内部ガバナンス用途に限定する。

---

## 2. 設計方針

### 2.1 哲学との整合

| 原則 | 対応 |
|------|------|
| **Safety by Exclusion** | Supabaseには Clerk userId（不透明ID）+ ハッシュ + タイムスタンプのみ保存。PIIは保持しない。署名者名はClerkから表示時に解決する |
| **PII例外: 署名済みPDF** | 署名済みPDFは個人情報を含むためGoogle Workspaceに保管。自ホストには置かない。DocuSealは署名実行エンジンとして一時的にPIIを処理する |
| **Resilience** | DocuSealが停止しても、Supabase上のメタデータ + Google Drive上のPDFで「誰が・いつ・何に署名したか」を確認可能（出口戦略） |
| **Isolation over Abstraction** | 署名機能は独立モジュールとして実装。既存ページに影響を与えない |
| **Replaceable Code** | DocuSealをエンジンとして抽象化し、将来別の署名サービスに差し替え可能な設計 |

### 2.2 アーキテクチャ概要

```
┌─────────────────────────────────────────────────────┐
│                    nexs-web (Astro)                   │
│                    Coolify (自宅サーバー)              │
│                                                       │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ 署名UI   │  │ API Routes   │  │ Webhook Handler│ │
│  │(React)   │  │ /api/signing │  │ /api/webhook   │ │
│  └────┬─────┘  └──────┬───────┘  └───────┬────────┘ │
│       │               │                   │          │
└───────┼───────────────┼───────────────────┼──────────┘
        │               │                   │
        ▼               ▼                   ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────────┐
│  DocuSeal    │ │  Supabase   │ │ Google Workspace │
│  (署名実行)  │ │  (メタデータ)│ │ (署名済みPDF)    │
│  Coolify     │ │  Cloud      │ │ Cloud SaaS       │
│  自宅サーバー│ │  (Free Tier)│ │                  │
└──────────────┘ └─────────────┘ └──────────────────┘
```

### 2.3 署名フロー

```
1. ユーザーが議案ページで「署名する」をタップ
2. nexs-web → DocuSeal API: 署名リクエスト作成
   - Clerk userId を external_id として付与
   - テンプレートIDと署名者情報を送信
3. DocuSeal の署名UIをモーダル/埋め込みで表示
4. ユーザーが署名を実行
5. DocuSeal → nexs-web Webhook: 署名完了通知
6. Webhook Handler:
   a. DocuSeal APIから署名済みPDFをダウンロード
   b. Google Drive APIでPDFをアップロード
   c. Supabaseにメタデータを保存
      - Clerk userId, タイムスタンプ, コンテンツハッシュ
      - DocuSeal参照ID, Google Drive ファイルID
7. UIが署名状態を更新
```

---

## 3. データ設計

### 3.1 Supabase テーブル

```sql
-- 署名リクエスト（署名を求める文書単位）
CREATE TABLE signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL,
  -- 'board_resolution' | 'general_resolution' | 'membership' | 'employment' | 'volunteer'
  title TEXT NOT NULL,
  reference_id TEXT,            -- 議案ID等の外部参照（例: 'RES-2026-001'）
  reference_slug TEXT,          -- コンテンツへのスラグ
  status TEXT NOT NULL DEFAULT 'pending',
  -- 'pending' | 'in_progress' | 'completed' | 'expired'
  required_signers INTEGER NOT NULL DEFAULT 1,
  docuseal_submission_id INTEGER,
  content_hash TEXT,            -- 署名対象コンテンツのSHA-256
  created_by TEXT NOT NULL,     -- Clerk userId
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- 個別の署名記録
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES signature_requests(id),
  signer_clerk_id TEXT NOT NULL,   -- Clerk userId（PIIではない）
  status TEXT NOT NULL DEFAULT 'pending',
  -- 'pending' | 'signed' | 'declined'
  docuseal_submitter_id INTEGER,
  content_hash TEXT,               -- 署名時点のコンテンツハッシュ
  signed_at TIMESTAMPTZ,
  google_drive_file_id TEXT,       -- 署名済みPDFの参照
  metadata JSONB,                  -- DocuSeal監査情報等（PII除外）
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: 署名記録は全員が閲覧可能（透明性）、書き込みはサーバーサイドのみ
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read signature_requests"
  ON signature_requests FOR SELECT USING (true);

CREATE POLICY "Anyone can read signatures"
  ON signatures FOR SELECT USING (true);
```

### 3.2 保存場所の整理

| データ | 保存先 | PII | 理由 |
|--------|--------|-----|------|
| 署名メタデータ | Supabase Cloud | なし（Clerk userIdは不透明ID） | 高速な状態確認、RLS、常時稼働 |
| 署名済みPDF | Google Workspace | あり（氏名等） | 企業SaaS、権限管理、バックアップ |
| 署名テンプレート | DocuSeal | なし | エンジン側で管理 |
| 監査ログ（DocuSeal発行） | Google Workspace + Supabase(参照のみ) | なし | 証跡の保全 |

---

## 4. 実装フェーズ

### Phase 0: 既存承認システムの削除

既存のGit + Clerk MFAベースの承認システムを削除する。

**削除対象:**
- `src/lib/approval-types.ts`
- `src/lib/github.ts`
- `src/lib/hash.ts`
- `src/pages/api/governance/approve.ts`
- `src/pages/api/governance/approvals.ts`
- `src/pages/api/governance/audit-log.ts`
- `src/components/governance/ApprovalSection.tsx`
- `src/components/governance/AuditLogModal.tsx`
- `data/approvals/` ディレクトリ

**修正対象:**
- `src/pages/governance/resolutions/[slug].astro` - ApprovalSection除去
- `src/middleware.ts` - 承認APIルート保護を除去
- `CLAUDE.md` - 承認システム関連ドキュメント更新
- `.env.example` - GITHUB_TOKEN セクション除去
- `src/content/config.ts` - resolutions の approvals フィールド除去

### Phase 1: インフラ構築

1. **Supabase Cloud セットアップ**（ユーザー作業: supabase.com でプロジェクト作成、接続情報取得）
2. **DocuSeal デプロイ**（Coolify/自宅サーバー） ← 外部AIへの指示が必要
3. データベーススキーマ作成（Supabase Cloud の SQL Editor で実行）
4. 環境変数の設定
5. DocuSeal APIキー取得とテンプレート作成

### Phase 2: コア署名エンジン統合（MVP基盤）

1. DocuSeal APIクライアント（`src/lib/docuseal.ts`）
2. Webhook受信エンドポイント（`src/pages/api/signing/webhook.ts`）
3. 署名メタデータのSupabase保存処理
4. 署名リクエスト作成API（`src/pages/api/signing/create.ts`）
5. 署名状態確認API（`src/pages/api/signing/status.ts`）

### Phase 3: MVP — 理事会議案書の決議承認

1. 署名UIコンポーネント（`src/components/signing/SignatureSection.tsx`）
   - DocuSeal埋め込みフォームをモーダル表示
   - 複数署名者の進捗表示
   - 署名済み一覧表示（署名者名はClerkから解決）
2. 議案ページへの統合（`resolutions/[slug].astro`）
3. ロールベースアクセス制御（boardロール以上が署名可能）
4. 署名完了時のステータス更新

### Phase 4: Google Workspace 連携

1. Google Drive API統合（`src/lib/google-drive.ts`）
2. 署名済みPDFのGoogle Driveアップロード
3. Webhookハンドラへの組み込み
4. ファイル参照IDのSupabase保存

### Phase 5: 総会議案書の決議承認

1. Phase 3のフローを流用
2. ロールベースの表示制御（正会員以上が署名可能）
3. テンプレートの追加

### Phase 6: 入会契約

1. 単一署名フローの実装
2. 入会用テンプレート作成
3. 署名完了後のClerkロール更新検討

### Phase 7: 雇用契約・ボランティア同意書

1. 二者署名フロー（法人側 + 個人）
2. 各テンプレートの作成

---

## 5. 環境変数（追加予定）

```bash
# DocuSeal
DOCUSEAL_API_URL=https://docuseal.yourdomain.com
DOCUSEAL_API_KEY=your_docuseal_api_key

# DocuSeal Webhook
DOCUSEAL_WEBHOOK_SECRET=your_webhook_secret

# Google Workspace (Phase 4)
# GOOGLE_SERVICE_ACCOUNT_KEY=base64_encoded_service_account_json
# GOOGLE_DRIVE_FOLDER_ID=target_folder_id
```

---

## 6. 障害時の設計

| 障害シナリオ | 影響 | 対策 |
|-------------|------|------|
| DocuSeal停止 | 新規署名不可 | UIに「署名サービスが一時的に利用できません」表示。既存メタデータ + Google Drive PDFで過去の署名は確認可能 |
| Supabase Cloud停止 | 署名状態の表示不可 | フォールバックメッセージ表示（既存のResilienceパターン）。Cloud SaaS なので稼働率は高い |
| Google Drive停止 | PDF保管不可 | Webhook処理でリトライキューに入れ、復旧後に再送 |
| Webhook受信失敗 | メタデータ未保存 | DocuSeal側にデータは残るため、定期的な同期バッチで補完可能 |

---

## 7. 制約・前提

- Clerk全員アカウント保有が前提
- DocuSealのテンプレート管理はDocuSeal管理画面で行う（MVP）
- 署名の取消は不可（法的署名の性質上、設計上の制約）
- MVPでは日本語UIを優先
