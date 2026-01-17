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
git clone https://github.com/your-org/nexs-web.git
cd nexs-web

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env and fill in your credentials
# (Clerk, Supabase, etc.)

# IMPORTANT: Commit package-lock.json if it was generated
# This ensures consistent builds in Docker/Coolify
git add package-lock.json
git commit -m "chore: Add package-lock.json for reproducible builds"

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

## 📁 Project Structure

```
nexs-web/
├── docs/                      # Project Documentation
│   ├── 00_READ_ME_FIRST.md   # AI & Developer Context Map
│   ├── 01_PHILOSOPHY.md      # Core Values & Decision Making
│   ├── 02_ARCHITECTURE.md    # Tech Stack & Infrastructure
│   ├── 03_DATA_SCHEMA.md     # Database Schema (ER Diagram)
│   ├── 04_UI_UX_GUIDELINES.md # Design System
│   ├── 05_ENVIRONMENT_SETUP.md # Setup Guide
│   ├── 06_PWA_STRATEGY.md    # PWA Implementation
│   └── 07_DEPLOYMENT_GUIDE.md # Deployment (Coolify, Docker, Cloudflare)
├── src/
│   ├── components/           # React Components (Islands)
│   ├── layouts/              # Astro Layouts
│   ├── pages/                # Astro Pages (Routing)
│   ├── lib/                  # Shared Utilities
│   └── styles/               # Global Styles
├── public/
│   ├── llms.txt              # AI Agent Sitemap
│   └── manifest.json         # PWA Manifest
├── supabase/
│   └── migrations/           # Database Migrations
├── mockups/                  # UI Prototypes
├── Dockerfile                # Docker image definition
├── docker-compose.yml        # Docker Compose configuration
├── nginx.conf                # Nginx server configuration
└── .env.example              # Environment Variables Template
```

---

## 🗄️ Database Schema

主要テーブル:

- **public_profiles** - Clerkユーザー情報のキャッシュ（Zero PII）
- **projects** - 実験プロジェクト
- **hypotheses** - 検証項目
- **discussions** - オープンディスカッション
- **signals** - AIニュース + 実験ログ
- **project_members** - プロジェクトメンバーシップ

詳細は [`docs/03_DATA_SCHEMA.md`](./docs/03_DATA_SCHEMA.md) とマイグレーションファイル [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) を参照してください。

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

- **Website**: https://nexs.jp (準備中)
- **GitHub**: https://github.com/your-org/nexs-web
- **Documentation**: [docs/](./docs/)
- **Contact**: info@nexs.jp

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
