# **00. Context Map for AI & Developers**

このファイルは、次世代社会デザイン研究機構（nexs）のWebサイト開発に参加する**AIエージェント**および**人間の開発者**へ向けた、コンテキストマップ（案内図）です。

本プロジェクトは**オープンソース（OSS）**として開発・公開されます。

開発作業を開始する前に、以下のドキュメント群を読み込み、プロジェクトの「思想」と「構造」を理解してください。

## **Documentation Structure**

### 1. 概念と定義（Why & What）

| File | Description |
| :---- | :---- |
| **01_PHILOSOPHY.md** | **最重要。** 開発哲学・マニフェスト。意思決定の優先順位（安全＞OSS＞UX...）。AI-Readinessの定義。 |
| **02_PRODUCT_DEFINITION.md** | nexs のプロダクト定義。対象ユーザー、解決する課題。 |

### 2. 技術と設計（How）

| File | Description |
| :---- | :---- |
| **10_DEV_ENVIRONMENT.md** | 開発環境構築手順。Clerk, Supabase, Cloudflare の設定。 |
| **11_SYSTEM_ARCHITECTURE.md** | システム構成・技術スタック。自宅サーバーとクラウドの分離。OSSとしてのセキュアな構成。 |
| **12_DATA_SCHEMA.md** | データ構造・スキーマ。Supabase (PostgreSQL) のER図。Clerk IDとの連携、RLSポリシー。 |
| **13_UI_STYLE_GUIDE.md** | デザインガイドライン。モバイルファーストUI、Tailwind設定、カラーパレット。 |
| **14_PWA_STRATEGY.md** | PWA戦略。オフライン対応、モバイルインストール、レジリエンス。 |
| **15_CODING_RULES.md** | コーディング規約。 |

### 3. 運用と進行（When & Where）

| File | Description |
| :---- | :---- |
| **20_DEPLOYMENT_GUIDE.md** | デプロイ手順。Docker, Coolify, 環境変数設定。 |
| **21_KNOWLEDGE_GUIDE.md** | Knowledge 記事の書き方。5カテゴリ構造と執筆規約。 |
| **22_RESOLUTIONS_GUIDE.md** | 議案（Resolutions）の運用ルール。議案ID、ブランチ運用、PR マージルール。 |
| **23_DESIGN_WORKFLOW.md** | デザインチーム ↔ 開発AI の協業ワークフロー。 |

### 4. その他

| File | Description |
| :---- | :---- |
| **99_DEV_LOG.md** | 開発ログ。設計判断の経緯を記録。 |

## **Directory Structure (Planned)**

/
├── public/
│   └── llms.txt        # AIエージェント用サイトマップ
├── src/
│   ├── components/     # React Components (Islands) - DiscussionDrawer, Cards
│   ├── layouts/        # Astro Layouts - BaseLayout (w/ ViewTransitions)
│   ├── pages/          # Astro Pages (Routing) - index.astro, projects/[slug].astro
│   ├── lib/            # Shared Utilities - supabaseClient.ts
│   └── styles/         # Global Styles (Tailwind)
├── docs/               # Project Documentation (You are here)
└── astro.config.mjs    # Configuration

## **How to Work with This Project**

1. **Philosophy First:** コードの効率性よりも「疎結合」と「安全性」を優先してください（詳細は 01_PHILOSOPHY.md）。
2. **Open Source Mindset:** コードは全世界に公開されます。**シークレットキー（API Key, Password）を絶対にコミットしないでください。**
3. **Mobile First:** 常にスマートフォンでの表示・体験を基準に実装してください。
4. **Fail Gracefully:** バックエンド（自宅サーバー）がダウンしていても、フロントエンドがクラッシュしないよう、エラーハンドリングを徹底してください。
