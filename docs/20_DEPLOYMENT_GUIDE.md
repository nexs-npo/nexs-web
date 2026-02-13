# 20. Deployment Guide

**Version:** 2.0
**Created:** 2026-02 with Claude Code (Sonnet 4.5)

> ⚠️ **注意:** このドキュメントは**Phase 1（Self-Hosted with Coolify）**のデプロイ手順を記載しています。Phase 2（Cloud Migration）への移行時には、デプロイ方法が大きく変更される可能性があります。詳細は `11_SYSTEM_ARCHITECTURE.md` を参照してください。

このドキュメントでは、nexs-webの現在のデプロイ方法、環境設定、運用手順について説明します。

---

## 1. Deployment Overview

### Current Deployment Strategy (Phase 1)

**環境:**
- **PaaS:** Coolify（Self-hosted）
- **Infrastructure:** Docker + Nginx
- **Network:** Cloudflare Tunnel経由で公開
- **Location:** 自宅サーバー

**特徴:**
- 低コスト運用
- 完全なコントロール
- 実験的機能の柔軟な実装

**制約:**
- 可用性は自宅回線・電源に依存
- スケーラビリティに限界

### Future Migration (Phase 2) **[計画]**

**予定環境:**
- **Frontend:** Cloudflare Pages / Vercel / Netlify
- **Database:** Supabase Cloud / 外部PostgreSQL
- **CDN:** グローバルエッジネットワーク

**移行理由:**
- 高可用性の実現
- グローバルスケール対応
- 運用負荷の軽減

---

## 2. Docker Deployment

### Prerequisites

- Docker 20.x 以上
- Docker Compose 2.x 以上
- Git

### 環境変数の準備

`.env` ファイルを作成:

```bash
PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

**重要:** `.env` ファイルは `.gitignore` に含まれていることを確認してください。

### ビルド＆起動

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

### 動作確認

```bash
# ヘルスチェック
curl http://localhost:8080/health
# Expected: "healthy"

# サイト表示
open http://localhost:8080
```

### 本番環境での直接ビルド

```bash
# イメージビルド（環境変数をビルド引数として渡す）
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

## 3. Coolify Deployment (Phase 1 推奨)

### Coolifyとは

**Coolify**は、セルフホスト可能なVercel/Netlify代替ツールです。

- GitリポジトリからDockerコンテナを自動ビルド・デプロイ
- Web UIで簡単に管理
- 自宅サーバーやVPS上で動作

### セットアップ手順

**Step 1: GitHubリポジトリの連携**

1. Coolify ダッシュボードにログイン
2. **New Project** → **Git Repository** を選択
3. GitHubリポジトリを選択
4. ブランチを選択（例: `main` または `develop`）

**Step 2: ビルド設定**

| 設定項目 | 値 |
|---------|---|
| **Build Pack** | Dockerfile |
| **Dockerfile Path** | `./Dockerfile` |
| **Port** | 8080 |
| **Health Check Path** | `/health` |

**Step 3: 環境変数の設定**

Coolify の Environment Variables セクションで以下を設定:

| Key | Value | Build Time | Runtime |
|-----|-------|------------|---------|
| `PUBLIC_SUPABASE_URL` | `https://your-supabase.co` | ✅ | ❌ |
| `PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | ✅ | ❌ |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_xxxxx` | ✅ | ❌ |
| `CLERK_SECRET_KEY` | `sk_test_xxxxx` | ✅ | ❌ |

**重要:** これらはビルド時環境変数なので、"Build Time" にチェックを入れてください。

**Step 4: デプロイ**

1. **Deploy** ボタンをクリック
2. ビルドログをリアルタイムで確認
3. デプロイ完了後、CoolifyがURLを発行

**Step 5: 自動デプロイ（CI/CD）**

**Webhook の設定:**

1. Coolify → Settings → Webhooks
2. **Generate Webhook URL** をクリック
3. GitHubリポジトリ → Settings → Webhooks → Add webhook
4. Payload URL に Coolify の Webhook URL を貼り付け
5. Trigger: "Push events" を選択
6. Active にチェック → Add webhook

これで、`main` ブランチへのプッシュで自動デプロイされます。

### トラブルシューティング

**npm ci が失敗する（package-lock.json がない）:**

```bash
# Error: The `npm ci` command can only install with an existing package-lock.json
```

解決方法:
```bash
# ローカルで package-lock.json を生成
npm install

# Git にコミット
git add package-lock.json
git commit -m "chore: Add package-lock.json for reproducible builds"
git push
```

Dockerfileは自動的に `npm install` にフォールバックしますが、再現性のため `package-lock.json` のコミットを推奨します。

**ビルドが失敗する（環境変数が設定されていない）:**

- 環境変数が "Build Time" に設定されているか確認
- Coolify のログで Missing environment variables エラーを確認

**ヘルスチェックが失敗する:**

```bash
# コンテナ内でヘルスチェックを手動実行
docker exec nexs-web wget -O- http://localhost:8080/health
```

- Nginx が正常に起動しているか確認
- ポート8080が正しく公開されているか確認

---

## 4. Cloudflare Tunnel Setup

### Tunnelの設定

**目的:** 自宅サーバーをポート開放せずに安全に公開

**手順:**

1. [Cloudflare Zero Trust](https://one.dash.cloudflare.com) にログイン
2. Access → Tunnels → Create a tunnel
3. トンネル名を設定（例: `nexs-web`）
4. Connector をインストール（Dockerまたはバイナリ）

```bash
docker run cloudflare/cloudflared:latest tunnel \
  --no-autoupdate run --token <YOUR_TOKEN>
```

5. Public Hostname を設定:
   - Subdomain: `www` または空欄
   - Domain: `yourdomain.com`
   - Service: `http://localhost:8080`

6. これで `https://yourdomain.com` でサイトにアクセス可能

### ドメイン設定

**DNS設定（Cloudflare）:**
- Tunnelを作成すると、自動的にCNAMEレコードが追加される
- SSL/TLS設定: Full (strict) を推奨

---

## 5. Security Checklist

デプロイ前に必ず確認:

- [ ] `.env` ファイルが `.gitignore` に含まれている
- [ ] Secrets（APIキー）がコードにハードコードされていない
- [ ] Dockerイメージに `.env` が含まれていない（`.dockerignore` で除外）
- [ ] HTTPS が有効になっている
- [ ] Clerk の Production Keys を使用（Test Keys ではない）
- [ ] Supabase の RLS ポリシーが有効
- [ ] Cloudflare Tunnel が安定稼働している（systemd 等で自動起動設定）
- [ ] Content Security Policy が適切に設定されている（`nginx.conf`）
- [ ] 非rootユーザーでコンテナが実行されている（Dockerfile で設定済み）

---

## 6. Monitoring & Logs

### Docker ログ確認

```bash
# リアルタイムログ
docker-compose logs -f web

# 直近100行
docker-compose logs --tail=100 web

# エラーログのみ
docker-compose logs web | grep -i error
```

### Nginx アクセスログ

```bash
# コンテナ内のログファイル
docker exec nexs-web cat /var/log/nginx/access.log
docker exec nexs-web cat /var/log/nginx/error.log
```

### ヘルスチェック

```bash
# Docker Compose
docker-compose ps

# 手動ヘルスチェック
curl http://localhost:8080/health
# Expected: "healthy"
```

### Coolify ダッシュボード

- ビルドログ、デプロイ履歴、リソース使用状況を確認可能
- アラート設定で障害時に通知

---

## 7. Rollback Strategy

### イメージのタグ付け

```bash
# バージョンタグでビルド
docker build -t nexs-web:v1.0.0 .
docker build -t nexs-web:latest .

# レジストリにプッシュ（オプション）
docker tag nexs-web:v1.0.0 registry.example.com/nexs-web:v1.0.0
docker push registry.example.com/nexs-web:v1.0.0
```

### ロールバック

```bash
# 前のバージョンに戻す
docker stop nexs-web
docker rm nexs-web
docker run -d --name nexs-web -p 8080:8080 nexs-web:v0.9.0
```

**Coolifyの場合:**
- ダッシュボードから以前のデプロイメントを選択して再デプロイ

---

## 8. Performance Optimization

### Dockerイメージサイズの削減

**現在の構成:**
- Builder stage: ~500MB (Node.js)
- Production stage: ~30MB (Nginx + static files)

**さらなる最適化:**

`.dockerignore` に追加:
```
docs/
mockups/
*.md
!README.md
.git/
.github/
```

### Nginx設定の最適化

`nginx.conf` で実装済み:
- Gzip圧縮有効化
- 静的ファイルのキャッシュ設定
- HTTP/2対応

---

## 9. Future Enhancements (Phase 2)

### Cloud Deployment

**Cloudflare Pages（計画）:**

1. Cloudflare Dashboard → Pages → Create a project
2. GitHub リポジトリを接続
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
4. 環境変数を設定
5. Deploy

**メリット:**
- グローバルCDN
- 無料枠が充実
- 自動スケーリング
- 高可用性

### CDN Strategy

**Phase 2でのキャッシュ戦略:**
- HTML: 1時間キャッシュ
- CSS/JS: 1年キャッシュ（ハッシュ付きファイル名）
- 画像: 1年キャッシュ

### Kubernetes Deployment（将来検討）

スケールが必要になった場合:
- Kubernetes へのマイグレーション
- 水平スケーリング
- ロードバランシング

---

## 10. Summary

### 現在のデプロイフロー（Phase 1）

| 環境 | デプロイ方法 | URL例 |
|------|-------------|-------|
| **開発** | `npm run dev` | `http://localhost:4321` |
| **本番** | Coolify (Docker) + Cloudflare Tunnel | `https://yourdomain.com` |

### ベストプラクティス

1. 環境変数は絶対にコミットしない
2. ヘルスチェックを必ず設定
3. ログを定期的に確認
4. バージョンタグでイメージ管理
5. ロールバック手順を事前に確認
6. Cloudflare Tunnel の安定稼働を監視

### Phase 2 移行時の注意

Cloud環境への移行時には、以下の変更が予想されます:
- デプロイ方法の大幅な変更
- 環境変数の設定方法の変更
- CI/CDパイプラインの再構築
- ドメイン設定の変更

詳細は `11_SYSTEM_ARCHITECTURE.md` Section 4 を参照してください。
