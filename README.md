# nexs - 次世代社会デザイン研究機構

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Astro](https://img.shields.io/badge/Astro-4.x-ff5d01?logo=astro)](https://astro.build)
[![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

**社会をデザインする、柔らかな実験場。**

AI時代の社会システムを実証・還元するリサーチコレクティブのオープンソースWebプラットフォーム。

---

## 🌐 About This Project

nexsは、テクノロジーと社会システムの交差点における新たな価値創造を目指すリサーチコレクティブです。本リポジトリは、私たちの実験プロジェクト、仮説検証、オープンディスカッションを世界に発信するためのWebサイトです。

### Core Values

1. **安全と信頼** - "持たない"ことによる究極の安全（Zero PII Strategy）
2. **Open Source** - コードもまた、社会への還元物
3. **UX** - 人間とAI、双方にとっての読みやすさを設計
4. **開発のしやすさ** - 疎結合なアーキテクチャで、AIとの協働を最適化
5. **コードの効率性** - WET over DRY（冗長性を許容し、複雑性を避ける）

詳細は [`docs/01_PHILOSOPHY.md`](./docs/01_PHILOSOPHY.md) を参照してください。

---

## 🚀 Features

- **📱 Mobile First PWA** - スマートフォンでの体験を最優先、ホーム画面にインストール可能
- **⚡ 爆速表示** - Astro による静的生成（SSG）で、初回表示も再訪問も高速
- **🔒 Zero PII** - 個人情報を自宅サーバーに保存しない安全設計
- **💬 オープンディスカッション** - プロジェクトごとの議論（CC BY 4.0）
- **🤖 AI-Ready** - `/llms.txt`, JSON-LD, セマンティックHTMLでAIエージェントが情報取得可能
- **🌊 Resilient** - バックエンドがダウンしても静的コンテンツは稼働継続

---

## 🏗️ Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| **Frontend** | [Astro](https://astro.build) | SSG Framework (Islands Architecture) |
| **Content** | [MDX](https://mdxjs.com/) | Markdown + Components |
| **UI Library** | [React](https://react.dev) | Interactive Components |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | Utility-first CSS |
| **Hosting** | [Cloudflare Pages](https://pages.cloudflare.com) | CDN + Edge Network |
| **Auth** | [Clerk](https://clerk.com) | Authentication (PII管理) |
| **Database** | [Supabase](https://supabase.com) (Self-Hosted) | PostgreSQL + Realtime |
| **Tunnel** | [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/) | Secure Home Server Exposure |

詳細は [`docs/02_ARCHITECTURE.md`](./docs/02_ARCHITECTURE.md) を参照してください。

---

## 📦 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or pnpm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/shinkkhs/nexs-web.git
cd nexs-web

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env and fill in your credentials
# (Clerk, Supabase, etc.)

# Run development server
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop
docker-compose down
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Environment Setup

詳細な環境構築手順は [`docs/05_ENVIRONMENT_SETUP.md`](./docs/05_ENVIRONMENT_SETUP.md) を参照してください。

デプロイメント（Coolify、Docker、Cloudflare Pages）の詳細は [`docs/07_DEPLOYMENT_GUIDE.md`](./docs/07_DEPLOYMENT_GUIDE.md) を参照してください。

---

## 📁 ディレクトリ構造（詳細）

```
nexs-web/
├── 📄 astro.config.mjs          # Astro設定ファイル（プラグイン追加時に編集）
├── 📄 package.json              # 依存パッケージ一覧
├── 📄 tailwind.config.mjs       # Tailwind CSS設定（色・フォント変更時）
├── 📄 tsconfig.json             # TypeScript設定
│
├── 📂 docs/                     # プロジェクトドキュメント
│   ├── 00_READ_ME_FIRST.md     # AI・開発者向けコンテキスト
│   ├── 01_PHILOSOPHY.md        # 開発哲学・意思決定基準
│   ├── 02_ARCHITECTURE.md      # 技術アーキテクチャ
│   ├── 03_DATA_SCHEMA.md       # データベース設計
│   ├── 04_UI_UX_GUIDELINES.md  # デザインシステム
│   ├── 05_ENVIRONMENT_SETUP.md # 環境構築ガイド
│   ├── 06_PWA_STRATEGY.md      # PWA実装方針
│   └── 07_DEPLOYMENT_GUIDE.md  # デプロイ手順
│
├── 📂 public/                   # 静的ファイル（そのまま配信される）
│   ├── favicon.svg             # ブラウザタブのアイコン
│   ├── llms.txt                # AIエージェント向けサイトマップ
│   ├── manifest.json           # PWA設定（アプリ名・アイコン）
│   └── robots.txt              # 検索エンジン向け設定
│
└── 📂 src/                      # ソースコード（★主な編集対象）
    │
    ├── 📂 components/           # 再利用可能なUIパーツ
    │   ├── BottomNav.tsx       # 画面下部のナビゲーションバー
    │   ├── Header.tsx          # 画面上部のヘッダー
    │   ├── Icons.tsx           # アイコン集（SVG）
    │   │
    │   └── 📂 knowledge/        # Knowledge専用コンポーネント
    │       ├── CopyForAI.tsx           # 「Copy for AI」ボタン
    │       ├── KnowledgeLink.astro     # 記事内参照リンク
    │       └── KnowledgeLinkTooltip.astro  # ツールチップ表示
    │
    ├── 📂 content/              # コンテンツ管理（★記事編集はここ）
    │   ├── config.ts           # コンテンツスキーマ定義
    │   │
    │   └── 📂 knowledge/        # Knowledge記事（MDX形式）
    │       ├── f-001.mdx       # F-001: 適者生存の誤読
    │       ├── f-002.mdx       # F-002: 贈与経済の再定義
    │       ├── t-001.mdx       # T-001: 分散型自律組織の可能性
    │       ├── p-001.mdx       # P-001: 地域通貨実証実験
    │       ├── e-001.mdx       # E-001: 3ヶ月間の交換頻度推移
    │       └── u-001.mdx       # U-001: 新たな共助モデルの提言
    │
    ├── 📂 layouts/              # ページの共通レイアウト
    │   ├── BaseLayout.astro            # 全ページ共通（head, meta等）
    │   └── KnowledgeArticleLayout.astro # Knowledge記事専用
    │
    ├── 📂 lib/                  # ユーティリティ関数
    │   └── supabase.ts         # Supabase接続設定
    │
    ├── 📂 pages/                # ページファイル（★URL構造に対応）
    │   ├── index.astro         # トップページ (/)
    │   ├── about.astro         # nexsについて (/about)
    │   ├── contact.astro       # お問い合わせ (/contact)
    │   ├── collaboration.astro # 協働参加 (/collaboration)
    │   │
    │   ├── signals.astro       # Signals一覧 (/signals)
    │   ├── 📂 signals/
    │   │   ├── 001.astro       # Signal詳細 (/signals/001)
    │   │   ├── 002.astro       # Signal詳細 (/signals/002)
    │   │   └── 003.astro       # Signal詳細 (/signals/003)
    │   │
    │   ├── knowledge.astro     # Knowledge一覧 (/knowledge)
    │   ├── 📂 knowledge/
    │   │   └── [slug].astro    # Knowledge詳細（動的ルート）
    │   │                       # → /knowledge/f-001, /knowledge/t-001 等
    │   │
    │   ├── projects.astro      # Projects一覧 (/projects)
    │   └── 📂 projects/
    │       ├── shared-service.astro  # みんなの事務局 (/projects/shared-service)
    │       ├── nexs-app.astro        # nexsアプリ (/projects/nexs-app)
    │       └── open-issue.astro      # open issue (/projects/open-issue)
    │
    └── 📂 styles/
        └── global.css          # 全体に適用されるCSS
```

---

## ✏️ 編集ガイド（素人向け）

### 🔸 Knowledge記事を追加・編集したい

**場所:** `src/content/knowledge/` フォルダ内の `.mdx` ファイル

**手順:**
1. 既存ファイル（例: `f-001.mdx`）をコピー
2. ファイル名を変更（例: `f-003.mdx`）
3. 上部の `---` で囲まれた部分（frontmatter）を編集:

```yaml
---
id: "F-003"                    # 記事ID（大文字）
title: "記事タイトル"           # タイトル
summary: "要約文..."           # 一覧ページに表示される説明
category: "foundation"         # foundation/thesis/protocol/evidence/update
author: "著者名"
date: "2025年1月"
relatedIds: ["f-001", "t-001"] # 関連記事のID（小文字）
---
```

4. `---` より下に本文をMarkdown形式で記述

**他の記事へのリンク:**
```mdx
import KnowledgeLink from '@/components/knowledge/KnowledgeLink.astro';

本仮説は<KnowledgeLink id="f-001" />に基づいています。
```

---

### 🔸 Signalsページを追加したい

**場所:** `src/pages/signals/` フォルダ

**手順:**
1. 既存ファイル（例: `001.astro`）をコピー
2. ファイル名を変更（例: `004.astro`）
3. 内容を編集

**注意:** `src/pages/signals.astro`（一覧ページ）にも新しい記事へのリンクを追加してください。

---

### 🔸 Projectsページを追加したい

**場所:** `src/pages/projects/` フォルダ

**手順:**
1. 既存ファイル（例: `shared-service.astro`）をコピー
2. ファイル名を変更（例: `new-project.astro`）
3. 内容を編集

**注意:** `src/pages/projects.astro`（一覧ページ）にも新しいプロジェクトへのリンクを追加してください。

---

### 🔸 ヘッダーやナビゲーションを編集したい

- **ヘッダー:** `src/components/Header.tsx`
- **下部ナビ:** `src/components/BottomNav.tsx`
- **アイコン:** `src/components/Icons.tsx`

---

### 🔸 全体のスタイル（色・フォント）を変更したい

- **Tailwind設定:** `tailwind.config.mjs`
- **グローバルCSS:** `src/styles/global.css`

---

## 🗄️ Database Schema

主要テーブル:

- **public_profiles** - Clerkユーザー情報のキャッシュ（Zero PII）
- **projects** - 実験プロジェクト
- **hypotheses** - 検証項目
- **discussions** - オープンディスカッション
- **signals** - AIニュース + 実験ログ
- **project_members** - プロジェクトメンバーシップ

詳細は [`docs/03_DATA_SCHEMA.md`](./docs/03_DATA_SCHEMA.md) を参照してください。

---

## 🎨 Design System

**Concept:** "Mobile Research Lab"

- **モバイルファースト** - 主要操作は画面下部に集約
- **カラーパレット** - グレーベース、意味のある場所にのみ色を使用
- **タイポグラフィ** - Noto Sans JP + Inter + Space Mono
- **モーション** - 控えめなアニメーション（Fade In Up, Pulse）

詳細は [`docs/04_UI_UX_GUIDELINES.md`](./docs/04_UI_UX_GUIDELINES.md) を参照してください。

---

## 🔐 Security & Privacy

### Zero PII Strategy

**自宅サーバー（Supabase）には個人情報を一切保存しません。**

- ✅ **Clerkに保存**: メールアドレス、パスワード、ソーシャルログイン情報
- ✅ **Supabaseに保存**: Clerk ID（ランダム文字列）、表示名、公開情報のみ

万が一自宅サーバーが侵害されても、流出するのは「公開済みの議論データ」と「無意味なID文字列」のみです。

### Open Source & Secrets Management

- **コードは全て公開** (Public Repository)
- **シークレットキーは環境変数で管理** (.env は .gitignore に含める)
- **Security by Obscurity には依存しない**

---

## 🤝 Contributing

本プロジェクトはオープンソースです。Issue報告、Pull Requestを歓迎します。

### Development Workflow

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Philosophy First

コードを書く前に、必ず [`docs/01_PHILOSOPHY.md`](./docs/01_PHILOSOPHY.md) を読んでください。技術的判断に迷った際は、本ドキュメントの優先順位に従ってください。

---

## 📜 License

このプロジェクトは [MIT License](./LICENSE) の下で公開されています。

- **ソースコード**: MIT License（自由に使用・改変・再配布可能）
- **議論データ**: CC BY 4.0（クレジット表示で再利用可能）

---

## 🔗 Links

- **Website**: https://nexs.or.jp
- **GitHub**: https://github.com/shinkkhs/nexs-web
- **Documentation**: [docs/](./docs/)
- **Contact**: info@nexs.or.jp

---

## 🙏 Acknowledgments

このプロジェクトは、以下のオープンソースプロジェクトに支えられています:

- [Astro](https://astro.build) - The web framework for content-driven websites
- [React](https://react.dev) - The library for web and native user interfaces
- [Tailwind CSS](https://tailwindcss.com) - A utility-first CSS framework
- [Supabase](https://supabase.com) - The Open Source Firebase Alternative
- [Clerk](https://clerk.com) - The most comprehensive User Management Platform

---

**Built with ❤️ by nexs | 次世代社会デザイン研究機構**

*「仮説・実証・還元」のサイクルを通じ、持続可能な社会のプロトタイプを提示する。*
