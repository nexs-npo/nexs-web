# Supabase デプロイ支援プロンプト

このプロンプトを外部AI（Claude、Gemini、ChatGPTなど）に渡してください。

---

## 依頼内容

Coolify上でSupabaseをデプロイし、nexs-webプロジェクトから接続できるよう設定してください。

## 前提条件

- **デプロイ先**: Coolify（自ホストPaaS）
- **公開方法**: Cloudflare Tunnel経由でHTTPS公開
- **用途**: nexs-web（Astro製Webアプリ）のデータベースとして使用
- **データ特性**: PIIなし、公開データ + Clerk userId（不透明ID）のみ保存

## 作業手順

### 1. Supabaseのデプロイ

Coolify管理画面で以下を実施:

1. **新規サービス作成**
   - サービスタイプ: PostgreSQL（Supabaseの公式Dockerイメージ使用推奨）
   - イメージ: `supabase/postgres` または公式のSupabase Dockerスタック

2. **環境変数設定**
   - `POSTGRES_PASSWORD`: 強力なパスワードを生成
   - `JWT_SECRET`: ランダムな64文字以上の文字列を生成
   - `ANON_KEY`: Supabase CLIまたはオンラインツールで生成
   - `SERVICE_ROLE_KEY`: 同上

3. **ポート設定**
   - PostgreSQL: 5432（内部）
   - Supabase API: 8000（内部）
   - 公開用: Cloudflare Tunnelで443（HTTPS）

### 2. Cloudflare Tunnel設定

1. **Tunnel作成**
   - サブドメイン: `supabase.nexs.or.jp`（または適切なドメイン）
   - ターゲット: Coolify内部のSupabase APIポート

2. **SSL/TLS設定**
   - TLS証明書: Cloudflareが自動発行
   - Encryption mode: Full

### 3. 接続情報の取得

以下の情報を取得してユーザーに提供してください:

```bash
# Supabase接続情報
PUBLIC_SUPABASE_URL=https://supabase.nexs.or.jp
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. RLSの基本設定

Supabase管理画面（または psql）で以下を実行:

```sql
-- Row Level Security を有効化
ALTER TABLE IF EXISTS public.signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.signatures ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能（透明性）
CREATE POLICY "Anyone can read signature_requests"
  ON signature_requests FOR SELECT USING (true);

CREATE POLICY "Anyone can read signatures"
  ON signatures FOR SELECT USING (true);

-- 書き込みはサーバーサイドのみ（後でAPI経由で実装）
-- この時点では書き込みポリシーは設定しない
```

### 5. 動作確認

以下のコマンドでSupabaseが正常に動作しているか確認:

```bash
# ヘルスチェック
curl https://supabase.nexs.or.jp/health

# 匿名キーでの接続テスト
curl -X GET 'https://supabase.nexs.or.jp/rest/v1/' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## 注意事項

1. **セキュリティ**
   - `SERVICE_ROLE_KEY` は絶対に公開しない（サーバーサイドのみで使用）
   - `ANON_KEY` はフロントエンドで使用するため公開OK（RLSで保護）

2. **バックアップ**
   - Coolifyのバックアップ設定を有効化
   - PostgreSQLの日次バックアップを推奨

3. **スキーマ適用**
   - この時点ではスキーマは作成しない（後のフェーズでnexs-web側から実行）

## 期待する成果物

ユーザーに以下を提供してください:

1. **接続情報** (上記3項の形式)
2. **Supabase管理画面URL** (Coolify経由でアクセス可能なURL)
3. **デプロイ完了の確認結果** (ヘルスチェックの出力)

## 参考情報

- Supabase公式ドキュメント: https://supabase.com/docs
- Supabase Self-Hosting Guide: https://supabase.com/docs/guides/self-hosting
- Coolify公式ドキュメント: https://coolify.io/docs
