# **05. Environment Setup Guide**

第三者が本プロジェクトをForkし、自分の環境で再現するための手順書。

## **1. 必要なアカウント・サービス**

### **A. Clerk (Authentication SaaS)**

**目的:** ユーザー認証とPII（個人情報）の管理

**手順:**
1. [Clerk Dashboard](https://dashboard.clerk.com) にサインアップ
2. 新しいアプリケーションを作成
3. Authentication → Email/Password を有効化（またはGoogle/Apple OAuth）
4. API Keys から以下を取得：
   - `Publishable Key` → `.env` の `PUBLIC_CLERK_PUBLISHABLE_KEY` に設定
   - `Secret Key` → `.env` の `CLERK_SECRET_KEY` に設定

**重要設定:**
- JWT Template: Supabase用のカスタムテンプレートを作成（後述）
- Webhooks: ユーザー作成時に Supabase へ `public_profiles` を同期（オプション）

---

### **B. Supabase (Self-Hosted on Coolify)**

**目的:** 議論データ、プロジェクト情報の保存（PII不要なデータのみ）

**オプション1: Self-Hosted（推奨）**

1. [Coolify](https://coolify.io) をインストール（または任意のDockerホスト）
2. Supabase の公式 Docker Compose をデプロイ:
   ```bash
   git clone https://github.com/supabase/supabase
   cd supabase/docker
   cp .env.example .env
   # .env を編集（パスワード等を設定）
   docker-compose up -d
   ```
3. Cloudflare Tunnel で公開（次項参照）
4. Supabase Dashboard (ポート3000) にアクセスし、以下を取得：
   - `API URL` → `.env` の `PUBLIC_SUPABASE_URL` に設定
   - `anon key` → `.env` の `PUBLIC_SUPABASE_ANON_KEY` に設定
   - `service_role key` → `.env` の `SUPABASE_SERVICE_ROLE_KEY` に設定

**オプション2: Supabase Cloud（簡易版）**

1. [Supabase Cloud](https://supabase.com) でプロジェクト作成
2. Settings → API から同様にキーを取得
3. **注意:** PII を扱わないため、Cloudでも問題ないが、本プロジェクトの思想は Self-Hosted 推奨

---

### **C. Cloudflare Tunnel (Self-Hosted を安全に公開)**

**目的:** 自宅サーバー（Supabase）をポート開放せずに公開

**手順:**
1. [Cloudflare Zero Trust](https://one.dash.cloudflare.com) にログイン
2. Access → Tunnels → Create a tunnel
3. トンネル名を設定（例: `nexs-supabase`）
4. Connector をインストール（Dockerまたはバイナリ）
   ```bash
   docker run cloudflare/cloudflared:latest tunnel --no-autoupdate run --token <YOUR_TOKEN>
   ```
5. Public Hostname を設定:
   - Subdomain: `supabase`
   - Domain: `yourdomain.com`
   - Service: `http://localhost:8000` (Supabase Kong API Gateway)
6. これで `https://supabase.yourdomain.com` で Supabase にアクセス可能

---

### **D. Cloudflare Pages (Frontend Hosting)**

**目的:** Astro 静的サイトのデプロイ

**手順:**
1. GitHub リポジトリと Cloudflare Pages を連携
2. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `20`
3. Environment variables に Clerk と Supabase の `PUBLIC_*` キーを設定
4. Deploy → 自動的にデプロイ開始

---

## **2. データベースのセットアップ**

### **マイグレーション実行**

Supabase Dashboard → SQL Editor で以下を実行:

```bash
# ローカル開発の場合
supabase/migrations/001_initial_schema.sql の内容をコピペして実行

# または Supabase CLI 使用
supabase db push
```

### **Row Level Security (RLS) の有効化**

マイグレーションファイルに含まれていますが、手動確認する場合:

1. Supabase Dashboard → Authentication → Policies
2. 各テーブルで RLS が有効になっていることを確認
3. ポリシー一覧:
   - `public_profiles`: SELECT (全員), INSERT/UPDATE (認証済み)
   - `projects`: SELECT (全員), INSERT/UPDATE (admin/researcher のみ)
   - `discussions`: SELECT (全員), INSERT (認証済み), UPDATE (自分の投稿のみ)

---

## **3. Clerk ↔ Supabase 連携設定**

### **Clerk JWT Template 作成**

Clerk Dashboard → JWT Templates → New Template → Supabase

```json
{
  "aud": "authenticated",
  "exp": "{{user.expiresAt}}",
  "sub": "{{user.id}}",
  "email": "{{user.primaryEmailAddress}}",
  "role": "authenticated",
  "app_metadata": {
    "provider": "clerk"
  }
}
```

### **Supabase 側の JWT Secret 設定**

Supabase の `.env` ファイルで:
```bash
JWT_SECRET=<Clerk の JWKS URL から取得したシークレット>
```

または、Supabase Dashboard → Settings → API → JWT Settings で設定

---

## **4. 開発環境のセットアップ**

### **必要なツール**

- Node.js 20.x 以上
- npm または pnpm
- Git

### **セットアップコマンド**

```bash
# リポジトリのクローン
git clone https://github.com/your-org/nexs-web.git
cd nexs-web

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env を編集して実際の値を入力

# 開発サーバーの起動
npm run dev
```

---

## **5. トラブルシューティング**

### **Clerk ログインができない**

- `PUBLIC_CLERK_PUBLISHABLE_KEY` が正しく設定されているか確認
- Clerk Dashboard で Allowed Origins に `http://localhost:4321` を追加

### **Supabase に接続できない**

- Cloudflare Tunnel が起動しているか確認
- `PUBLIC_SUPABASE_URL` が正しいか確認
- ブラウザの Console で CORS エラーが出ていないか確認
  - Supabase Dashboard → Settings → API → CORS で `*` または開発URLを追加

### **RLS でデータが取得できない**

- Clerk JWT が正しく Supabase に渡されているか確認
- Supabase Dashboard → Authentication → Users で JWT payload を確認
- ポリシーが正しく設定されているか SQL で確認

---

## **6. 本番デプロイ時のチェックリスト**

- [ ] `.env` ファイルが `.gitignore` に含まれている
- [ ] Cloudflare Pages の Environment Variables が全て設定済み
- [ ] Supabase の RLS ポリシーが有効
- [ ] Cloudflare Tunnel が安定稼働している（systemd 等で自動起動設定）
- [ ] Clerk の Production Keys を使用（Test Keys ではない）
- [ ] HTTPS で全ての通信が暗号化されている
- [ ] CSP (Content Security Policy) ヘッダーの設定（Cloudflare Pages）
