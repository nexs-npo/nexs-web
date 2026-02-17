# 作業手順（TASK）

**プラン**: PLAN.md 参照
**ブランチ**: feat/digital-signature-flow
**開始日**: 2026-02-16

---

## Phase 0: 既存承認システムの削除

### Task 0-1: 承認関連ファイルの削除

**目的**: Git + Clerk MFAベースの旧承認システムを完全に除去する

**削除するファイル:**
1. `src/lib/approval-types.ts`
2. `src/lib/github.ts`
3. `src/lib/hash.ts`
4. `src/pages/api/governance/approve.ts`
5. `src/pages/api/governance/approvals.ts`
6. `src/pages/api/governance/audit-log.ts`
7. `src/components/governance/ApprovalSection.tsx`
8. `src/components/governance/AuditLogModal.tsx`
9. `data/approvals/` ディレクトリ

**コミット**: `refactor: Remove legacy Git-based approval system`

### Task 0-2: 既存ページからの承認機能除去

**修正するファイル:**
1. `src/pages/governance/resolutions/[slug].astro`
   - `ApprovalSection` コンポーネントのimportと使用を削除
   - `computeHash` のimportと使用を削除
   - `contentHash` の算出処理を削除
2. `src/middleware.ts`
   - `/api/governance/approve(.*)` の保護ルートを削除
3. `src/content/config.ts`
   - resolutionsスキーマから `approvals` フィールドを削除（存在する場合）

**コミット**: `refactor: Remove approval integration from pages`

### Task 0-3: ドキュメントの更新

**修正するファイル:**
1. `CLAUDE.md`
   - 「Resolution Approval System」セクションを削除
   - 「Protected Routes」から承認API参照を削除
   - 新しい電子署名システムへの参照を追加（後のPhaseで詳細化）
2. `.env.example`
   - 「GitHub Token (Audit Log & Approval Storage)」セクションを削除
3. `.work/DEV_LOG.md`
   - 旧承認システム削除の記録を追加

**コミット**: `docs: Update documentation for approval system removal`

**ここまでで一旦 staging にマージ → プレビュー確認**

---

## Phase 1: インフラ構築

### Task 1-1: Supabase Cloud セットアップ 🔧ユーザー作業

**担当**: ユーザー
**内容**: supabase.com でプロジェクトを作成し、接続情報を取得する

**手順:**
1. https://supabase.com にアクセスし、アカウント作成（GitHub連携推奨）
2. 新規プロジェクト作成（リージョン: Tokyo 推奨）
3. 接続情報を取得:
   - Project URL → `PUBLIC_SUPABASE_URL`
   - anon public key → `PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
4. `.env` に接続情報を設定

### Task 1-2: DocuSeal デプロイ 🔧外部作業

**担当**: ユーザー + 外部AI
**内容**: CoolifyでDocuSealをデプロイし、API接続を確立する

**外部AIへの指示プロンプト** を作成して渡す。指示内容:
- Coolify上でDocuSealをデプロイ
- Cloudflare Tunnelでの公開設定（内部アクセスのみ推奨）
- API keyの発行
- Webhook URLの設定

### Task 1-3: データベーススキーマ作成

**前提**: Task 1-1 完了後
**内容**: PLAN.md Section 3.1 のスキーマをSupabase Cloudに適用

**作業:**
1. SQLマイグレーションファイルを作成
2. Supabase Cloud の SQL Editor でスキーマ適用
3. RLSポリシー設定

**コミット**: `feat: Add signature system database schema`

### Task 1-4: 環境変数の設定

**内容**: .env.example にDocuSeal関連の環境変数を追加

**追加する変数:**
```
DOCUSEAL_API_URL=
DOCUSEAL_API_KEY=
DOCUSEAL_WEBHOOK_SECRET=
```

**コミット**: `chore: Add DocuSeal environment variables`

---

## Phase 2: コア署名エンジン統合

### Task 2-1: DocuSeal APIクライアント

**作成ファイル**: `src/lib/docuseal.ts`

**実装内容:**
- DocuSeal REST APIのラッパー
- テンプレート一覧取得
- 署名リクエスト（Submission）作成
- 署名状態確認
- 署名済みPDFダウンロード
- エラーハンドリング

**コミット**: `feat: Add DocuSeal API client`

### Task 2-2: Supabase 署名データアクセス層

**修正ファイル**: `src/lib/supabase.ts`（型定義追加）
**作成ファイル**: `src/lib/signing.ts`（署名固有のDB操作）

**実装内容:**
- signature_requests テーブルのCRUD
- signatures テーブルのCRUD
- 型定義の追加

**コミット**: `feat: Add signing data access layer`

### Task 2-3: Webhook受信エンドポイント

**作成ファイル**: `src/pages/api/signing/webhook.ts`

**実装内容:**
- DocuSealからのWebhook受信（POST）
- Webhook署名の検証（セキュリティ）
- 署名完了イベントの処理:
  1. メタデータをSupabaseに保存
  2. 全署名者完了時にリクエストステータスを更新
- prerender = false（SSRエンドポイント）

**コミット**: `feat: Add DocuSeal webhook handler`

### Task 2-4: 署名リクエスト作成API

**作成ファイル**: `src/pages/api/signing/create.ts`

**実装内容:**
- POST: 新規署名リクエスト作成
- Clerk認証必須
- DocuSeal Submission作成
- Supabaseにリクエスト記録保存
- レスポンス: 署名用embed URL

**コミット**: `feat: Add signing request creation API`

### Task 2-5: 署名状態確認API

**作成ファイル**: `src/pages/api/signing/status.ts`

**実装内容:**
- GET: 署名リクエストの状態取得
- 認証不要（透明性: 誰でも署名状態を確認可能）
- Supabaseからメタデータ取得
- 署名者名はClerk Backend SDKで解決

**コミット**: `feat: Add signing status API`

---

## Phase 3: MVP — 理事会議案書の決議承認

### Task 3-1: 署名UIコンポーネント

**作成ファイル**: `src/components/signing/SignatureSection.tsx`

**実装内容:**
- 署名進捗表示（N/M 署名完了）
- 署名者一覧（名前はClerkから解決、タイムスタンプ表示）
- 「署名する」ボタン → DocuSeal埋め込みフォームをモーダル表示
- ロールチェック（boardロール以上のみ署名ボタン表示）
- 署名完了/エラー状態のハンドリング

**コミット**: `feat: Add SignatureSection component`

### Task 3-2: 議案ページへの統合

**修正ファイル**: `src/pages/governance/resolutions/[slug].astro`

**実装内容:**
- SignatureSection コンポーネントを追加
- 議案データからsignature_requestを参照
- propsの受け渡し

**コミット**: `feat: Integrate signing into resolution pages`

### Task 3-3: DocuSealテンプレート作成 🔧外部作業

**担当**: ユーザー
**内容**: DocuSeal管理画面で理事会議案書のテンプレートを作成

**ここまででMVP完了 → staging → レビュー → main マージ検討**

---

## Phase 4: Google Workspace 連携（別ブランチ推奨）

### Task 4-1: Google Drive API統合
### Task 4-2: Webhookハンドラへの組み込み
### Task 4-3: ファイル参照のSupabase保存

---

## Phase 5〜7: 後続機能（別ブランチ推奨）

- Phase 5: 総会議案書（ロールベース制御追加）
- Phase 6: 入会契約（単一署名フロー）
- Phase 7: 雇用/ボランティア契約（二者署名フロー）

---

## チェックリスト

- [ ] Phase 0: 旧承認システム削除完了
- [ ] Phase 1: Supabase + DocuSeal デプロイ完了
- [ ] Phase 2: APIエンドポイント実装完了
- [ ] Phase 3: 署名UI完成、理事会議案で動作確認
- [ ] Phase 4: Google Workspace連携完了
