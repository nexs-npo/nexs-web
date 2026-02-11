# **02. Technical Architecture & Stack**

「ロマン（自宅サーバー）」と「実利（クラウド）」を組み合わせた、低コストかつ堅牢なハイブリッド構成。

また、**オープンソース（OSS）**として公開することを前提に、秘匿情報と公開コードを厳格に分離する。

## **1. Tech Stack**

| Layer | Technology | Role | Reason |
| :---- | :---- | :---- | :---- |
| **Frontend** | **Astro** | Web Framework | 基本を静的HTMLとして出力し、高速表示とSEO/AI可読性を最大化する。必要な箇所（議論機能）のみReactをロードする（Islands Architecture）。 |
| **UI Library** | **React** | Component | 複雑なインタラクション（議論、フォーム）の実装に使用。 |
| **Hosting** | **Cloudflare Pages** | Web Hosting | 帯域無制限、商用利用可、グローバルCDNによる高速配信。静的アセットの配信を担当。 |
| **Auth** | **Clerk** | Authentication | **【現在無効】** 個人情報（PII）の管理・認証UIの提供。自宅サーバーへのPII保存を回避するために採用。現在は `.env` にキーを設定するまで無効化されている（詳細は下記 Section 6）。 |
| **Backend** | **Supabase** | DB / Realtime | **【Self-Hosted】** 議論データ、仮説データ、ログの保存。自宅サーバー（Coolify）上で運用。 |
| **Network** | **Cloudflare Tunnel** | Secure Tunneling | 自宅サーバーを安全に公開するためのトンネリング技術。ポート開放不要。 |

## **2. Infrastructure Diagram (OSS Safety)**

コードは公開（Public）し、鍵は環境変数（Private）に閉じ込める。

```
graph TD
    User((User / AI)) --> CF[Cloudflare Pages (Frontend / Astro)]

    subgraph "Public Repository (GitHub)"
        Code[Source Code]
        Config[Astro Config]
        Doc[Documentation]
    end

    subgraph "Private Environment (Secrets)"
        Env1[.env (Cloudflare)]
        Env2[.env (Home Server)]
        Keys[API Keys / Tunnel Token]
    end

    subgraph "Safe Zone (Cloud / SaaS)"
        CF -- 1. Static Content --> Edge[Edge Network]
        CF -- 2. Auth Check --> Clerk[Clerk (Identity)]
    end

    subgraph "Experimental Zone (Home Server)"
        CF -- 3. API Request (Comments/Data) --> Tunnel[Cloudflare Tunnel]
        Tunnel --> Supabase[Self-Hosted Supabase]
        Supabase --> DB[(PostgreSQL)]
    end

    Code -.-> CF
    Env1 -.-> CF
    Env2 -.-> Supabase
```

## **3. Data Separation Rules (鉄の掟)**

セキュリティ事故が発生しても「致命傷」を避けるためのデータ配置ルール。

### **A. クラウド (Clerk) に置くもの**

* ユーザーのメールアドレス
* パスワードハッシュ
* ソーシャルログイン情報 (Google/Apple tokens)
* ユーザーのアイコン画像URL

### **B. 自宅サーバー (Supabase) に置くもの**

* **公開情報のみ。**
* Clerkから発行された user_id (ランダムな文字列)
* ユーザーの表示名 (Display Name)
* プロジェクト情報、仮説、実験データ
* 議論（コメント）のテキストデータ

## **4. Resilience Strategy (上手にコケる)**

自宅サーバーは停電やメンテナンスでダウンする前提で設計する。

* **Fallback UI:** 議論セクションなどの動的パーツは、API接続に失敗した場合、「現在メンテナンス中（または実験停止中）」というメッセージを優雅に表示する。
* **Static Survival:** プロジェクトの閲覧、Aboutページ、記事の閲覧など、静的コンテンツは自宅サーバーが爆発してもCloudflare Pages上で稼働し続けること。

## **5. OSS Guidelines**

* **No Hardcoded Secrets:** APIキーや接続URLがコードに含まれていないか、コミット前に必ずチェックする（pre-commit hook等の導入推奨）。
* **Documentation:** 自宅サーバー環境を第三者が再現できるよう、docker-compose.yml などの設定ファイルも（IPやPasswordを変数化した上で）公開する。

## **6. Clerk 認証の有効化手順**

Clerkは **環境変数によるオプトイン方式** で管理されている。
キーが設定されていなければ、Clerkインテグレーションは読み込まれず、サイトは認証なしで動作する。

### 現在の状態: **無効（Disabled）**

### 有効化の手順

1. [Clerk Dashboard](https://dashboard.clerk.com) でアプリケーションを作成し、キーを取得
2. `.env` ファイルに以下を追加（`.env.example` を参照）:
   ```
   PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   ```
3. 開発サーバーを再起動（`npm run dev`）

### 仕組み

- `astro.config.mjs` が `PUBLIC_CLERK_PUBLISHABLE_KEY` の存在を確認
- 存在すれば `@clerk/astro` インテグレーションを動的にロード
- 存在しなければスキップ（エラーなし）
- `src/middleware.ts` が認証ミドルウェアを条件付きで適用

### ロール管理

Clerk の `publicMetadata` をロールの唯一の真実源（Single Source of Truth）として使用:

**利用可能なロール:**

| ロール | 英名 | 用途 |
|--------|------|------|
| システム管理者 | `admin` | 全権限（技術管理者用） |
| ボードメンバー | `board` | 議案承認、意思決定、社内通知 |
| 事務局メンバー | `office` | 法人運営、社内規程参照、勤怠 |
| 正会員 | `regular` | 研究参加、記事投稿、通知 |
| 賛助会員 | `supporter` | 閲覧、コメント、お気に入り |

**ロール設定方法:**
1. Clerk Dashboard → Users → ユーザーを選択
2. Metadata タブ → Public セクション
3. `{"role": "board"}` を追加

**実装:**
- 型定義: `src/lib/roles.ts`
- SSRページでの取得: `getRoleFromMetadata(sessionClaims?.metadata)`
- MyDeskページ: `/mydesk` でロール別のデスクを表示
