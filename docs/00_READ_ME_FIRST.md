# 00. Context Map for AI & Developers

**Version:** 1.0
**Created:** 2026-02 with Claude Code (Sonnet 4.5)

このファイルは、次世代社会デザイン研究機構（nexs）のWebサイト開発に参加する**AIエージェント**および**人間の開発者**へ向けた、コンテキストマップ（案内図）です。

本プロジェクトは**オープンソース（OSS）**として開発・公開されます。

開発作業を開始する前に、以下のドキュメント群を読み込み、プロジェクトの「思想」と「構造」を理解してください。

---

## Documentation Structure

### 0. 導入
| File | Title | Description |
| :---- | :---- | :---- |
| **00_READ_ME_FIRST.md** | このファイル | ドキュメント全体の案内図 |

### 1. 概念と定義（Why & What）
| File | Title | Description |
| :---- | :---- | :---- |
| **01_PHILOSOPHY.md** | 開発哲学 | **最重要。** 意思決定の優先順位（安全＞OSS＞UX...）。 |
| **02_PRODUCT_DEFINITION.md** | プロダクト定義 | nexsとは何か、対象ユーザー、解決する課題 |

### 2. 技術と設計（How）
| File | Title | Description |
| :---- | :---- | :---- |
| **10_DEV_ENVIRONMENT.md** | 開発環境 | 環境構築手順、必要なツール |
| **11_SYSTEM_ARCHITECTURE.md** | システム構成 | 技術スタック、サーバー分離、セキュリティ設計 |
| **12_DATA_SCHEMA.md** | データスキーマ | Supabase (PostgreSQL) のER図、Clerk ID連携 |
| **13_UI_STYLE_GUIDE.md** | UIスタイルガイド | デザインシステム、Tailwind設定、コンポーネント |
| **14_PWA_STRATEGY.md** | PWA戦略 | プログレッシブWebアプリ化の方針 |
| **15_CODING_RULES.md** | コーディング規約 | 具体的な実装ルール |

### 3. 運用と進行（When & Where）
| File | Title | Description |
| :---- | :---- | :---- |
| **20_DEPLOYMENT_GUIDE.md** | デプロイガイド | 本番環境へのデプロイ手順 |
| **21_KNOWLEDGE_GUIDE.md** | ナレッジ記事ガイド | Knowledge記事の執筆・管理方法 |
| **22_RESOLUTIONS_GUIDE.md** | 決議システムガイド | 議案の運用ルール、ブランチ運用 |
| **23_DESIGN_WORKFLOW.md** | デザインワークフロー | デザイン作業の進め方 |

### 4. その他
| File | Title | Description |
| :---- | :---- | :---- |
| **99_DEV_LOG.md** | 開発ログ（サマリー） | 重要なエラーと解決策の記録 |

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
