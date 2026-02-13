# 11. System Architecture

**Version:** 2.0
**Created:** 2026-02 with Claude Code (Sonnet 4.5)

このドキュメントでは、nexs-webのシステム構成、技術選定の理由、データの配置戦略について説明します。

---

## 1. Architecture Overview

nexs-webは、**「組織のデジタルツイン」** を実現するために設計されたハイブリッドアーキテクチャを採用しています。

### Key Characteristics

- **Static-First:** 基本は静的サイト生成（SSG）、動的処理は最小限
- **Zero PII:** 個人情報は自前で持たず、外部専門基盤に委任
- **Resilient:** 部分障害が全体に波及しない設計
- **Open by Default:** コードは公開、秘密は環境変数で分離

---

## 2. Design Principles

### Zero PII Architecture

**「持たざる安全」** の実践として、個人を特定できる情報（PII）は自前のデータベースに保存しません。

- **認証・個人情報管理:** Clerk（外部SaaS、SOC 2準拠）に委任
- **Self-hosted DB:** Clerkから発行された不可逆なID文字列のみを保存
- **メリット:** 侵害されても「公開済みデータ + 無意味なID」のみ流出

### Hybrid Infrastructure

クラウドの堅牢性と、Self-hostedの柔軟性を組み合わせます。

- **Cloud（安全地帯）:** 認証、静的コンテンツ配信
- **Self-hosted（実験地帯）:** データベース、動的API

### Graceful Degradation（優雅な縮退）

Self-hostedサーバーがダウンしても、コアコンテンツは生き残ります。

- **静的コンテンツ:** サーバー障害時も閲覧可能
- **動的機能:** エラー時は「メンテナンス中」を表示し、クラッシュしない

### Static-First Approach

Astroによる静的サイト生成（SSG）を基本とし、以下を実現：

- **高速表示:** ビルド時にHTMLを生成、CDNで配信
- **セキュリティ:** 動的な攻撃面を最小化
- **AI可読性:** クリーンなHTMLとセマンティックマークアップ

---

## 3. Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| **Framework** | Astro 4 | 静的サイト生成 + Hybrid SSR |
| **UI Library** | React | 動的コンポーネント（Islands） |
| **Styling** | Tailwind CSS | ユーティリティファーストCSS |
| **Type Safety** | TypeScript | 型安全な開発 |
| **Linter/Formatter** | Biome | 高速なコード品質管理 |
| **Authentication** | Clerk | 認証・個人情報管理（外部SaaS） |
| **Database** | Supabase (PostgreSQL) | Self-hosted データベース |
| **Deployment** | Docker + Nginx | コンテナ化されたデプロイ |
| **Network** | Cloudflare Tunnel | セキュアなトンネリング |

---

## 4. Deployment Phases

### Phase 1: Self-Hosted with Coolify **[← 現在地]**

**環境:**
- Coolify（Self-hosted PaaS）on 自宅サーバー
- Docker + Nginx
- Cloudflare Tunnel経由で公開

**メリット:**
- 低コスト運用
- 完全なコントロール
- 実験的機能の柔軟な実装

**制約:**
- 可用性は自宅回線・電源に依存
- スケーラビリティに限界

### Phase 2: Cloud Migration **[将来計画]**

**予定環境:**
- Cloudflare Pages / Vercel / Netlify（フロントエンド）
- Supabase Cloud / 外部PostgreSQL（データベース）

**移行理由:**
- 高可用性の実現
- グローバルスケール対応
- 運用負荷の軽減

---

## 5. Infrastructure Diagram

```
┌─────────────┐
│   User/AI   │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────┐
│   Static Site (Astro SSG)        │
│   + React Islands                │
└──────┬───────────────────┬───────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌──────────────┐
│   Clerk     │     │  Supabase    │
│  (Auth SaaS)│     │ (Self-hosted)│
└─────────────┘     └──────────────┘
   Cloud               Self-hosted
  (安全地帯)          (実験地帯)
```

**データフロー:**
1. ユーザーがサイトにアクセス → 静的HTMLを高速表示
2. ログインが必要な機能 → Clerkで認証
3. 動的データ（議論、プロジェクト） → Supabaseから取得

---

## 6. Data Architecture

### データの配置戦略

| データ種類 | 保存場所 | 理由 |
|-----------|---------|------|
| **個人情報** (Email, Password) | Clerk | PII管理の専門基盤に委任 |
| **公開コンテンツ** (記事, 議案) | Git Repository (MDX) | バージョン管理、透明性 |
| **動的データ** (議論, プロジェクト) | Supabase | リアルタイム性が必要 |
| **静的アセット** (画像) | Cloudinary | CDN配信 |

### セキュリティ境界

- **Public Zone:** 誰でもアクセス可能（記事、プロジェクト情報）
- **Authenticated Zone:** ログイン必要（議論投稿、マイデスク）
- **Role-based Zone:** 特定ロールのみ（議案承認、事務局機能）

---

## 7. Authentication System

### Clerk + Session Token Customization

**認証フロー:**
1. ユーザーがClerkでログイン
2. Clerkが Session Token を発行（JWT）
3. Session Tokenに `role` カスタムクレームを埋め込み
4. フロントエンドで `sessionClaims.role` を読み取り

**ロール定義:**

| Role | 権限 | 用途 |
|------|------|------|
| `admin` | 全権限 | システム管理者 |
| `board` | 議案承認、意思決定 | 理事メンバー |
| `office` | 法人運営、規程参照 | 事務局メンバー |
| `regular` | 研究参加、記事閲覧 | 正会員 |
| `supporter` | 閲覧、コメント | 賛助会員 |

**実装:**
- 型定義: `src/env.d.ts` (CustomJwtSessionClaims)
- ミドルウェア: `src/middleware.ts` (保護ルート制御)
- ページ: `src/pages/mydesk.astro` (ロール別UI)

**設定方法:**
- Clerk Dashboard → Sessions → Customize session token
- Template: `{"role": "{{user.public_metadata.role}}"}`

---

## 8. Resilience & Fallback Strategy

### 障害時の挙動

| 障害箇所 | 影響範囲 | フォールバック |
|---------|---------|--------------|
| Self-hosted DB停止 | 議論機能のみ | 「メンテナンス中」表示 |
| Clerk停止 | 認証機能のみ | ログイン不可、閲覧は可能 |
| CDN停止 | 全体 | （CloudflareレベルのSLA） |

### 設計思想

- **部分障害の隔離:** 一つの機能の死が全体を殺さない
- **静的コンテンツの生存:** サーバーが全滅してもコンテンツは残る
- **透明な障害通知:** エラーを隠さず、状況を正直に表示

---

## 9. OSS Compliance

### Public Repository

- **公開範囲:** ソースコード、ドキュメント、Issue管理
- **非公開:** `.env`（環境変数）、APIキー、接続文字列

### Reproducibility

第三者がこのリポジトリをForkし、独自の環境で再現できるよう設計：

- 環境変数のサンプル: `.env.example`
- セットアップガイド: `10_DEV_ENVIRONMENT.md`
- Docker構成: `Dockerfile`, `docker-compose.yml`

### Security by Design

- **Secretless Code:** 秘密情報はコードに含めない
- **Environment Variables:** 全ての秘密は環境変数で管理
- **Git Ignore:** `.env` は必ず `.gitignore` に含める
