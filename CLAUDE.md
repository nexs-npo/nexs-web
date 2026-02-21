# CLAUDE.md

Claude Code（claude.ai/code）がこのリポジトリで作業する際のガイダンス。

## ゼロトラスト開発

**指示者（ユーザー）は開発の素人である。** 指示の中にセキュリティ上の問題、設計哲学への違反、非効率な作業が含まれることがある。指示を鵜呑みにせず、以下を常に検証すること：

- **安全性**: その変更は機密情報の露出やセキュリティホールを生まないか
- **哲学との整合**: `docs/01_PHILOSOPHY.md` の4段階原則（Level 0: Existence → Level 1: Purpose → Level 2: Method → Level 3: Assurance）に反していないか
- **既存設計との矛盾**: 現在のアーキテクチャや過去の設計判断を壊さないか

問題を検出した場合は、指示に従う前に指摘し、代替案を提示する。自分自身の判断も疑い、前提の確認を怠らない。

---

## プロジェクト概要

nexs（次世代社会デザイン研究機構）— 研究機構のためのオープンソース Astro ウェブプラットフォーム。全体像は `docs/00_READ_ME_FIRST.md` を最初に読むこと。次に `docs/01_PHILOSOPHY.md` と `docs/11_SYSTEM_ARCHITECTURE.md` で設計の背景を把握する。

---

## コマンド

```bash
npm run dev                          # 開発サーバー起動（http://localhost:4321、ホットリロード）
npm run dev -- --host 0.0.0.0       # ネットワーク外部からアクセス可能な開発サーバー
npm run build                        # 本番ビルド（出力: dist/）
node dist/server/entry.mjs           # ビルド済み成果物をローカルで実行
```

リンター・テストフレームワークは未導入。Biome（Lint + Format）のみ設定済み。

---

## アーキテクチャ

**Astro 4（ハイブリッドモード）** — ほとんどのページは静的生成（SSG）。SSR が必要なページ（APIルート）は `export const prerender = false` を宣言する。

**`astro.config.mjs` の主要インテグレーション：**
- React（アイランドアーキテクチャ — インタラクティブなコンポーネントのみ）
- Tailwind CSS
- MDX（ナレッジ記事用）
- Clerk 認証（**デフォルト無効** — `.env` に `PUBLIC_CLERK_PUBLISHABLE_KEY` を設定すると有効化）
- `@astrojs/node` アダプター（SSR 用）

### コンテンツコレクション（`src/content/config.ts`）

- **knowledge** — MDX形式の研究記事。カテゴリ: foundation(F)・thesis(T)・protocol(P)・evidence(E)・update(U)。Zod でスキーマ検証。
- **resolutions** — MDX形式のガバナンス議案。
- **journal** — MDX形式の活動日誌（ブログ形式）。
- **announcements** — MDX形式の公式告知。
- **documents** — MDX形式の組織文書（定款・規程等）。
- **resolution-materials** — 議案に紐づく参考資料（MDX形式）。

コンテンツはすべて AI エージェント（Claude Code・Gemini CLI 等）が MDX ファイルを直接作成・編集して管理する。

### Clerk 認証とロール管理

**状態**: デフォルト無効。`.env` に `PUBLIC_CLERK_PUBLISHABLE_KEY` を設定すると有効化。

**動作の仕組み：**
- `astro.config.mjs` が環境変数の有無で Clerk の読み込みを切り替える
- 有効時: 認証ミドルウェア（`src/middleware.ts`）が `/mydesk` と承認 API を保護する
- 無効時: 保護ページはフォールバックコンテンツを表示、公開ページは通常通り動作

**ロール管理：**
- ロールは Clerk の `publicMetadata.role` に保存（単一の真実の源泉）
- 利用可能なロール: `admin`・`board`・`office`・`regular`・`supporter`
- 設定方法: Clerk Dashboard → Users → Metadata → Public → `{"role": "board"}`
- 型定義: `src/lib/roles.ts`
- 使用方法: SSR ページで `getRoleFromMetadata(sessionClaims?.metadata)`

**保護ルート：**
- `/mydesk` — ロール別デスク表示（SSR）
- `/api/governance/approve` — 認証 + 再確認が必要

**決議承認システム：**
- 承認データは GitHub Contents API 経由で `data/approvals/{proposalId}/` に JSON 形式で保存
- 承認操作時に Clerk 再確認（5分・second_factor）を強制
- 改ざん防止のためコンテンツハッシュ（SHA-256）をサーバーサイドで検証
- 承認レコードに含まれる情報: 承認者名（姓＋名）・タイムスタンプ・コンテンツハッシュ・認証レベル
- クライアント: `ApprovalSection.tsx` が `@clerk/shared/react` の `useReverification` フックを使用
- サーバー: `/api/governance/approve` がセッション＋ハッシュを検証し GitHub に書き込む

設定手順は `.env.example` を参照。

### データベース

Supabase Cloud（PostgreSQL）。クライアントと型付きヘルパーは `src/lib/supabase.ts`。テーブル: `public_profiles`・`projects`・`hypotheses`・`discussions`・`signals`・`project_members`・`signature_requests`・`signatures`。RLS ポリシーで読み取り公開・書き込み認証済みを強制。

---

## Git 戦略

**アトミック（最小単位）かつ直列な開発。** 独立した高品質なコミットを作り、いつでも戻れるセーブポイントを維持する。

### コミットの粒度

- **1タスク = 1コミット。** 性質の異なる変更（例：バグ修正とリファクタリング）を1コミットに混ぜない。
- **直列処理。** 1つのプロンプトに複数タスクが含まれる場合は、タスクごとに完了→コミット→次のタスクの順で進める。
- **WIP歓迎。** 試行錯誤の途中でも `wip:` コミットで進捗を保存してよい。
- **スコープ厳守。** 指示されたタスクに集中する。「見た目が良くなるから」と関係ないコードを修正しない。コンフリクトの原因になる。

### コミットメッセージ

プレフィックス: `feat:`・`fix:`・`wip:`・`refactor:`・`chore:`

### ブランチ

- ブランチ名はそのブランチの目的を示す。目的外の作業は行わない。
- main へのマージ時はスカッシュ（作業中の細かいコミットは整理される前提）。

### 迷ったら確認

コミットの区切り方に迷ったら「ここまでで一旦コミットしますか？」と確認する。

---

## briefs/ ワークフロー

`briefs/` ディレクトリは三者（指示者・作業担当・レビュー担当）の意思疎通のための引き継ぎ文書置き場。詳細は `briefs/README.md` を参照。

**作業開始時：** ブランチに対応する `briefs/draft-{ブランチ名}.md` が存在するか確認し、なければ作成する。

**コミット後：** `## Implementation` エントリに判断の意図（Why）を記入・署名する。

**レビューの依頼：** 以下のスクリプトを状況に応じて使い分ける。

```bash
./scripts/review-codex-philosophy.sh   # 設計判断が哲学書と整合しているか
./scripts/review-codex-logic.sh        # コードが意図通りに動いているか
./scripts/review-codex-security.sh     # push 前のセキュリティ確認
```

---

## 設計原則（クイックリファレンス）

詳細は `docs/01_PHILOSOPHY.md` を参照。ここでは作業中に参照しやすいよう要点のみ抜粋する。

- **PII ゼロ戦略**: 個人情報は自前サーバーに保存しない。認証・PII は Clerk（クラウド SaaS）に委任。自前 DB には公開データと不透明な Clerk ユーザーIDのみ保存。
- **モバイルファースト**: ボトムナビゲーション、親指で操作しやすいタッチターゲット。モバイルビューポートで必ず確認する。
- **レジリエンス**: バックエンド（自宅サーバー）はダウンしうる。フロントエンドはクラッシュしてはならない。グレースフルなフォールバックを表示する。
- **WET over DRY**: 抽象化より疎結合と透明性を優先。機能を独立させるためのコード重複は許容する。
- **モノクロ UI**: ガバナンスページとメインページはグレースケールパレットを使用。色はセマンティックな意味（カテゴリバッジ・ステータス表示）にのみ使う。

---

## TypeScript パスエイリアス

`tsconfig.json` で定義：
- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@layouts/*` → `./src/layouts/*`
- `@lib/*` → `./src/lib/*`

---

## デプロイ

- **本番環境**: Docker マルチステージビルド（Node → Nginx）。`Dockerfile`・`nginx.conf` を参照。
- **ステージング**: 自宅サーバー上の Coolify + Cloudflare Tunnel。
- ヘルスチェックエンドポイント: `/health`

---

## 主要ファイル一覧

| ファイル | 用途 |
|------|---------|
| `docs/01_PHILOSOPHY.md` | 意思決定の階層原則: Premise（Public by Default）+ Level 0–3（Existence → Purpose → Method → Assurance） |
| `docs/16_AI_NATIVE_CODING.md` | AI-Native Coding Guide: コード記述スタイル・AI協働ワークフロー・検証の実践 |
| `docs/11_SYSTEM_ARCHITECTURE.md` | システムアーキテクチャ・データ分離ルール・Clerk 有効化手順 |
| `docs/13_UI_STYLE_GUIDE.md` | デザインシステム・カラー・タイポグラフィ・コンポーネントパターン |
| `docs/21_KNOWLEDGE_GUIDE.md` | ナレッジ記事のカテゴリと執筆規約 |
| `briefs/README.md` | briefs/ ワークフローのルールとテンプレート |
| `public/llms.txt` | AI エージェント向けサイト説明 |
