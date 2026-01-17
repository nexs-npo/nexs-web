# **07. Deployment Guide**

nexs Webサイトのデプロイメント手順（Coolify、Docker、Cloudflare Pages）

---

## **1. Docker Deployment (Local / Production)**

### **Prerequisites**

- Docker 20.x or higher
- Docker Compose 2.x or higher

### **環境変数の準備**

`.env` ファイルを作成:

```bash
PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

### **ビルド＆起動**

```bash
# イメージのビルド
docker-compose build

# コンテナ起動
docker-compose up -d

# ログ確認
docker-compose logs -f web

# 停止
docker-compose down
```

### **動作確認**

```bash
# ヘルスチェック
curl http://localhost:8080/health

# サイト表示
open http://localhost:8080
```

### **本番環境での直接ビルド**

```bash
# イメージビルド
docker build \
  --build-arg PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL \
  --build-arg PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY \
  --build-arg PUBLIC_CLERK_PUBLISHABLE_KEY=$PUBLIC_CLERK_PUBLISHABLE_KEY \
  -t nexs-web:latest .

# コンテナ起動
docker run -d \
  --name nexs-web \
  -p 8080:8080 \
  --restart unless-stopped \
  nexs-web:latest
```

---

## **2. Coolify Deployment (Staging)**

### **Coolify とは**

Coolify は、セルフホスト可能なVercel/Netlify代替ツールです。GitリポジトリからDockerコンテナを自動ビルド・デプロイします。

### **ステップ1: GitHubリポジトリの連携**

1. Coolify ダッシュボードにログイン
2. **New Project** → **Git Repository** を選択
3. GitHubリポジトリ `nexs-org/nexs-web` を選択
4. ブランチを選択（例: `main` または `develop`）

### **ステップ2: ビルド設定**

**Build Pack:** Dockerfile

**Dockerfile Path:** `./Dockerfile`

**Port:** 8080

**Health Check Path:** `/health`

### **ステップ3: 環境変数の設定**

Coolify の Environment Variables セクションで以下を設定:

| Key | Value | Build Time | Runtime |
|-----|-------|------------|---------|
| `PUBLIC_SUPABASE_URL` | `https://your-supabase.co` | ✅ | ❌ |
| `PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | ✅ | ❌ |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_xxxxx` | ✅ | ❌ |

**重要:** これらはビルド時環境変数なので、"Build Time" にチェックを入れてください。

### **ステップ4: デプロイ**

1. **Deploy** ボタンをクリック
2. ビルドログをリアルタイムで確認
3. デプロイ完了後、CoolifyがURLを発行（例: `https://nexs-web-xyz.coolify.io`）

### **ステップ5: 自動デプロイ（CI/CD）**

**Webhook の設定:**

1. Coolify → Settings → Webhooks
2. **Generate Webhook URL** をクリック
3. GitHubリポジトリ → Settings → Webhooks → Add webhook
4. Payload URL に Coolify の Webhook URL を貼り付け
5. Trigger: "Push events" を選択
6. Active にチェック → Add webhook

これで、`main` ブランチへのプッシュで自動デプロイされます。

### **トラブルシューティング**

#### ビルドが失敗する

```bash
# Coolify のログを確認
# Error: Missing environment variables
```

→ 環境変数が "Build Time" に設定されているか確認

#### ヘルスチェックが失敗する

```bash
# コンテナ内でヘルスチェックを手動実行
docker exec nexs-web wget -O- http://localhost:8080/health
```

→ Nginx が正常に起動しているか確認

---

## **3. Cloudflare Pages Deployment (Alternative)**

Docker を使わずに Cloudflare Pages で直接ホストすることも可能です。

### **ステップ1: Cloudflare Pages プロジェクト作成**

1. Cloudflare Dashboard → Pages → Create a project
2. GitHub リポジトリを接続
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`

### **ステップ2: 環境変数の設定**

Settings → Environment variables で以下を追加:

```
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_ANON_KEY
PUBLIC_CLERK_PUBLISHABLE_KEY
```

### **ステップ3: デプロイ**

- Save and Deploy
- 自動的に `https://nexs-web.pages.dev` が発行される
- カスタムドメイン（`nexs.jp`）を設定可能

### **メリット・デメリット**

| | Cloudflare Pages | Coolify (Docker) |
|---|------------------|------------------|
| **無料枠** | ✅ 無制限 | ❌ サーバー費用 |
| **速度** | ✅ グローバルCDN | ⚠️ サーバー次第 |
| **カスタマイズ** | ⚠️ 制限あり | ✅ 完全制御 |
| **セルフホスト** | ❌ | ✅ |
| **学習コスト** | 低 | 中 |

**推奨構成:**

- **本番環境:** Cloudflare Pages（高速・無料・グローバルCDN）
- **ステージング:** Coolify（自宅サーバー、実験的機能のテスト）

---

## **4. セキュリティチェックリスト**

デプロイ前に必ず確認:

- [ ] `.env` ファイルが `.gitignore` に含まれている
- [ ] Secrets（APIキー）がコードにハードコードされていない
- [ ] Dockerイメージに `.env` が含まれていない（`.dockerignore` で除外）
- [ ] HTTPS が有効になっている
- [ ] Content Security Policy が適切に設定されている（`nginx.conf`）
- [ ] 非rootユーザーでコンテナが実行されている（Dockerfile で設定済み）

---

## **5. モニタリング＆ログ**

### **Docker ログ確認**

```bash
# リアルタイムログ
docker-compose logs -f web

# 直近100行
docker-compose logs --tail=100 web

# エラーログのみ
docker-compose logs web | grep -i error
```

### **Nginx アクセスログ**

```bash
# コンテナ内のログファイル
docker exec nexs-web cat /var/log/nginx/access.log
docker exec nexs-web cat /var/log/nginx/error.log
```

### **ヘルスチェック**

```bash
# Docker Compose
docker-compose ps

# 手動ヘルスチェック
curl http://localhost:8080/health
# Expected: "healthy"
```

---

## **6. スケーリング**

### **水平スケーリング（複数コンテナ）**

```yaml
# docker-compose.yml
services:
  web:
    # ... existing config
    deploy:
      replicas: 3

  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - web
```

### **Kubernetes デプロイ（将来的）**

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexs-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nexs-web
  template:
    metadata:
      labels:
        app: nexs-web
    spec:
      containers:
      - name: nexs-web
        image: nexs-web:latest
        ports:
        - containerPort: 8080
        env:
        - name: PUBLIC_SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: nexs-secrets
              key: supabase-url
```

---

## **7. バックアップ＆ロールバック**

### **イメージのタグ付け**

```bash
# バージョンタグでビルド
docker build -t nexs-web:v1.0.0 .
docker build -t nexs-web:latest .

# レジストリにプッシュ
docker tag nexs-web:v1.0.0 registry.example.com/nexs-web:v1.0.0
docker push registry.example.com/nexs-web:v1.0.0
```

### **ロールバック**

```bash
# 前のバージョンに戻す
docker pull registry.example.com/nexs-web:v0.9.0
docker stop nexs-web
docker rm nexs-web
docker run -d --name nexs-web -p 8080:8080 registry.example.com/nexs-web:v0.9.0
```

---

## **8. パフォーマンス最適化**

### **Dockerイメージサイズの削減**

現在の構成:
- Builder stage: ~500MB (Node.js)
- Production stage: ~30MB (Nginx + static files)

さらなる最適化:

```dockerfile
# .dockerignore に追加
docs/
mockups/
*.md
!README.md
```

### **CDN キャッシュ戦略**

Cloudflare Pages を使用する場合:
- HTML: 1時間キャッシュ
- CSS/JS: 1年キャッシュ（ハッシュ付きファイル名のため）
- 画像: 1年キャッシュ

---

## **まとめ**

| 環境 | 推奨デプロイ方法 | URL例 |
|------|-----------------|-------|
| **開発** | `npm run dev` | `http://localhost:4321` |
| **ステージング** | Coolify (Docker) | `https://staging.nexs.jp` |
| **本番** | Cloudflare Pages or Docker | `https://nexs.jp` |

**ベストプラクティス:**
1. ステージング環境で十分にテスト
2. 環境変数は絶対にコミットしない
3. ヘルスチェックを必ず設定
4. ログを定期的に確認
5. バージョンタグでイメージ管理
