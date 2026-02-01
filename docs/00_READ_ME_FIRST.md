# **00. Context Map for AI & Developers**

このファイルは、次世代社会デザイン研究機構（nexs）のWebサイト開発に参加する**AIエージェント**および**人間の開発者**へ向けた、コンテキストマップ（案内図）です。

本プロジェクトは**オープンソース（OSS）**として開発・公開されます。

開発作業を開始する前に、以下のドキュメント群を読み込み、プロジェクトの「思想」と「構造」を理解してください。

## **Documentation Structure**

| File | Title | Description | Key Focus |
| :---- | :---- | :---- | :---- |
| **01** | **PHILOSOPHY** | 開発哲学・マニフェスト | **最重要。** 意思決定の優先順位（安全＞OSS＞UX...）。AI-Readinessの定義。 |
| **02** | **ARCHITECTURE** | システム構成・技術スタック | 自宅サーバーとクラウドの分離。OSSとしてのセキュアな構成（Secrets管理）。 |
| **03** | **DATA_SCHEMA** | データ構造・スキーマ | Supabase (PostgreSQL) のER図。Clerk IDとの連携、RLSポリシー。 |
| **04** | **UI_UX_GUIDELINES** | デザインガイドライン | モバイルファーストUI、Tailwind設定、カラーパレット、アニメーション定義。 |

## **Operational Guides**

`docs/guides/` には、nexs メンバー向けの運用ガイドがあります。開発者でなくても読める内容です。

| File | Description |
| :---- | :---- |
| **guides/RESOLUTIONS_GUIDE.md** | 議案（Resolutions）の運用ルール。議案ID、ブランチ運用、PR マージルール、Git 履歴の保護。 |

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
