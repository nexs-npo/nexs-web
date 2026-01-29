# Context for Prompt Design: nexs-web

**Ver 3.0 | 2026-01-28**
**Target Audience:** プロジェクトの状況を理解し、作業者（AI/人間）への適切な指示（プロンプト）を組み立てる「参謀」役のAI、またはシニアエンジニア。

---

## 1. この資料の目的 (Meta-Objective)
あなたは、現場監督（ユーザー）から「この機能を実装したいから、新人AI（作業者）向けの指示プロンプトを書いて」と相談されています。
この資料は、**作業用AIに「的確で、プロジェクトの哲学に沿った、手戻りのない」作業をさせるための指示戦略とコンテキスト**をまとめたものです。

**重要:** あなたがファイルシステムへのアクセス権限を持っていなくても、この資料だけで適切な指示が出せるように、必要な情報はすべてここに記載されています。

---

## 2. プロジェクトの基本構造 (Architecture & Schema)
作業用AIにファイルの場所やDB構造を教える際は、以下の情報を参照してください。

### 📂 Directory Structure (Map)
```text
nexs-web/
├── 📄 astro.config.mjs          # Astro設定
├── 📄 package.json              # 依存パッケージ
├── 📄 tailwind.config.mjs       # Tailwind設定
│
├── 📂 public/
│   ├── llms.txt                # AI向けサイトマップ
│   └── robots.txt              # 検索エンジン設定
│
└── 📂 src/                      # ソースコード（作業の中心）
    │
    ├── 📂 components/           # 再利用可能なUIパーツ
    │   ├── BottomNav.tsx       # スマホ用下部ナビ
    │   ├── Header.tsx          # ヘッダー
    │   ├── Icons.tsx           # アイコン集
    │   └── 📂 knowledge/        # Knowledge機能用パーツ
    │
    ├── 📂 content/              # コンテンツ（MDX）
    │   ├── config.ts           # スキーマ定義
    │   └── 📂 knowledge/        # 記事データ
    │
    ├── 📂 layouts/              # 共通レイアウト
    │   ├── BaseLayout.astro    # 全ページ共通（head等）
    │   └── KnowledgeArticleLayout.astro
    │
    ├── 📂 lib/                  # ユーティリティ
    │   └── supabase.ts         # DB接続クライアント
    │
    ├── 📂 pages/                # ルーティング（URL構造）
    │   ├── index.astro         # トップ
    │   ├── signals.astro       # Signals一覧
    │   ├── knowledge.astro     # Knowledge一覧
    │   ├── projects.astro      # Projects一覧
    │   └── [slug].astro        # 動的ルート
    │
    └── 📂 styles/
        └── global.css          # 全体CSS
```

### 🗄️ Database Schema (Zero PII Strategy)
作業用AIがDB関連のコードを書く際、以下のスキーマを厳守させてください。特に**PII（個人情報）の扱いは厳禁**です。

*   **public_profiles:** ユーザー情報
    *   `clerk_id` (PK): ClerkのUser ID（文字列）。**emailは持たない。**
    *   `display_name`, `avatar_url`, `role` (admin/researcher/member)
*   **projects:** 実験プロジェクト
    *   `id`, `slug`, `title`, `description`, `status`
*   **discussions:** 議論データ
    *   `user_clerk_id` (FK): 投稿者のClerk ID
    *   `content`, `parent_id` (返信用)

---

## 3. 作業用AIへの「指示の勘所」 (Instruction Strategy)
このプロジェクトには、一般的なWeb開発の常識とは異なる独特な「癖」があります。作業用AIへの指示には、必ず以下の制約条件を混ぜてください。

### 🛡️ 対「個人情報」の指示（最重要）
*   **哲学:** Safety & Trust (Zero PII)
*   **プロンプトへの組み込み:**
    > 「データベース操作や認証関連のコードを書く際は、**個人情報（メール、氏名）のカラムを絶対に作成・参照しないでください。** ユーザー識別は必ず `clerk_id` のみで行ってください。」

### 🧩 対「コード設計」の指示
*   **哲学:** WET over DRY (疎結合優先)
*   **プロンプトへの組み込み:**
    > 「既存のコードと重複しても構わないので、**ファイルを跨いだ共通化は避けてください。** この機能単独で完結し、他の機能を壊さない実装（WET原則）を優先してください。」

### 📱 対「UI実装」の指示
*   **哲学:** Mobile First
*   **プロンプトへの組み込み:**
    > 「スタイリングは**モバイル表示を最優先**で実装してください。PC向けの調整は `md:` プレフィックスでのみ行ってください。」

### 🤖 対「AI対応」の指示
*   **哲学:** AI-Readiness
*   **プロンプトへの組み込み:**
    > 「HTML構造はセマンティック（`<article>`, `<section>`等）にし、JSON-LDを含めるなど、AIエージェントが情報を読み取りやすい構造を維持してください。」

---

## 4. プロンプト生成テンプレート (Recipe)
作業用AIへのプロンプトを出力する際は、以下の構成を推奨します。

```markdown
# 役割
あなたは nexs-web プロジェクトの専任エンジニアです。

# コンテキスト（前提共有）
このプロジェクトは「Zero PII（個人情報を持たない）」と「WET over DRY（共通化より疎結合）」を掲げるAstro製Webアプリです。

# タスク
[ここに具体的な依頼内容]
例：モバイル版のSignals一覧ページのデザイン崩れを修正してください。

# 具体的な指示
1. ファイル [対象ファイルパス] を読み込んでください。
2. [修正ポイント] を変更してください。

# 制約条件（遵守必須）
1. **Zero PII:** DBに個人情報を保存しない。Clerk IDのみ使用する。
2. **WET over DRY:** 無理な共通化を避け、変更の影響範囲をこのファイル内に閉じ込める。
3. **Mobile First:** スマホでの表示を基準にCSSを書く。
```

---

## 5. 補足情報の参照先（作業用AI向け）
もし作業用AIに詳細なドキュメントを読ませる必要がある場合は、以下のパスを提示してください。
（あなたは読めなくても、作業用AIは読める可能性があります）

*   **開発哲学:** `docs/01_PHILOSOPHY.md`
*   **DB設計:** `docs/03_DATA_SCHEMA.md`
*   **UIガイド:** `docs/04_UI_UX_GUIDELINES.md`

---
**このコンテキストに基づき、作業用AIが「一発で正解を出せる」最高品質のプロンプトを設計してください。**
