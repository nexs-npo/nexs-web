# DocuSeal デプロイ支援プロンプト

このプロンプトを外部AI（Claude、Gemini、ChatGPTなど）に渡してください。

---

## 依頼内容

Coolify上でDocuSeal（OSS電子署名サービス）をデプロイし、nexs-webプロジェクトから署名機能として利用できるよう設定してください。

## 前提条件

- **デプロイ先**: Coolify（自ホストPaaS）
- **公開方法**: Cloudflare Tunnel経由でHTTPS公開（**内部アクセスのみ推奨**）
- **用途**: nexs-webの電子署名エンジンとして使用
- **データ特性**: 署名実行時に一時的にPII（氏名等）を処理するが、署名完了後はPDFのみ保持

## 作業手順

### 1. DocuSealのデプロイ

Coolify管理画面で以下を実施:

1. **新規サービス作成**
   - サービスタイプ: Docker Image
   - イメージ: `docusealco/docuseal:latest`
   - 公式GitHub: https://github.com/docusealco/docuseal

2. **環境変数設定**
   ```bash
   # データベース（DocuSeal内部でSQLiteまたはPostgreSQLを使用）
   DATABASE_URL=postgresql://user:pass@postgres:5432/docuseal
   # または SQLite（小規模運用）
   # DATABASE_URL=sqlite3:///data/docuseal.sqlite3

   # アプリケーション設定
   SECRET_KEY_BASE=<ランダムな128文字以上の文字列を生成>
   HOST=docuseal.internal.nexs.or.jp  # 内部ドメイン推奨

   # SMTP設定（署名完了通知用、オプション）
   # SMTP_ADDRESS=smtp.example.com
   # SMTP_PORT=587
   # SMTP_USERNAME=your_email@example.com
   # SMTP_PASSWORD=your_password
   ```

3. **ポート設定**
   - DocuSeal Web UI: 3000（内部）
   - 公開用: Cloudflare Tunnelで443（HTTPS）

4. **永続化ストレージ**
   - `/data` ディレクトリをボリュームマウント（テンプレート、一時ファイル保存用）

### 2. Cloudflare Tunnel設定

**セキュリティ重要**: DocuSealは内部アクセスのみに制限することを推奨

1. **オプションA: 内部アクセスのみ（推奨）**
   - Cloudflare Tunnel設定で、nexs-web のサーバーIPのみ許可
   - Access Policy: IP制限を設定
   - サブドメイン: `docuseal.internal.nexs.or.jp`

2. **オプションB: 管理画面のみ公開**
   - 管理画面: `docuseal-admin.nexs.or.jp` (Cloudflare Access認証必須)
   - API: 内部アクセスのみ

### 3. API Key の発行

DocuSeal管理画面にログイン後:

1. **初期セットアップ**
   - 管理者アカウント作成
   - 組織名: nexs (次世代社会デザイン研究機構)

2. **API Key発行**
   - Settings → API Keys
   - 新規API Key作成: `nexs-web-integration`
   - 権限: Full access（テンプレート作成、署名リクエスト、Webhook設定）

3. **Webhook Secret生成**
   - Settings → Webhooks
   - 新規Webhook設定:
     - URL: `https://nexs.or.jp/api/signing/webhook`（nexs-webのエンドポイント）
     - Events: `submission.completed`（署名完了時）
   - Webhook Secret をコピー（検証用）

### 4. 接続情報の取得

以下の情報を取得してユーザーに提供してください:

```bash
# DocuSeal接続情報
DOCUSEAL_API_URL=https://docuseal.internal.nexs.or.jp
DOCUSEAL_API_KEY=ds_api_xxxxxxxxxxxxxxxxxxxxxxxx
DOCUSEAL_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. 動作確認

以下のコマンドでDocuSealが正常に動作しているか確認:

```bash
# ヘルスチェック（管理画面にアクセス）
curl -I https://docuseal.internal.nexs.or.jp

# API接続テスト
curl -X GET 'https://docuseal.internal.nexs.or.jp/api/templates' \
  -H "X-Auth-Token: YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### 6. テンプレート作成の準備

DocuSeal管理画面で以下を確認:

1. **テンプレート管理画面の動作確認**
   - Templates → New Template
   - PDFアップロード機能が動作するか確認

2. **署名フィールドの設定確認**
   - Signature fields（署名欄）
   - Date fields（日付欄）
   - Text fields（テキスト入力欄）

## 注意事項

### セキュリティ

1. **内部アクセスのみに制限**
   - DocuSeal APIは外部公開しない（nexs-webサーバーからのみアクセス）
   - Cloudflare Accessまたはファイアウォールで保護

2. **API Keyの管理**
   - `DOCUSEAL_API_KEY` は絶対に公開しない
   - サーバーサイドの環境変数としてのみ使用

3. **Webhook署名検証**
   - `DOCUSEAL_WEBHOOK_SECRET` を使ってWebhookの送信元を検証
   - 詳細は後のフェーズで実装

### データ管理

1. **一時ファイルの保持期間**
   - 署名完了後、PDFはGoogle Driveに移動
   - DocuSeal内の一時ファイルは定期的に削除（設定で調整可能）

2. **バックアップ**
   - テンプレートファイルのバックアップを推奨
   - データベースのバックアップ（Coolify設定）

### パフォーマンス

- 小規模運用（月間数十件の署名）であればSQLiteで十分
- 将来的に増加する場合はPostgreSQLに移行

## 期待する成果物

ユーザーに以下を提供してください:

1. **接続情報** (上記4項の形式)
2. **DocuSeal管理画面URL** (Cloudflare Tunnel経由)
3. **管理画面ログイン情報** (初期管理者アカウント)
4. **デプロイ完了の確認結果** (ヘルスチェックとAPI接続テストの出力)

## 参考情報

- DocuSeal公式ドキュメント: https://www.docuseal.co/docs
- DocuSeal GitHub: https://github.com/docusealco/docuseal
- DocuSeal API リファレンス: https://www.docuseal.co/docs/api
- Coolify公式ドキュメント: https://coolify.io/docs

## トラブルシューティング

### よくある問題

1. **DocuSealが起動しない**
   - `SECRET_KEY_BASE` が正しく設定されているか確認
   - データベース接続情報を確認

2. **テンプレートアップロードができない**
   - `/data` ディレクトリの永続化設定を確認
   - ディスク容量を確認

3. **APIレスポンスがない**
   - API Keyのフォーマット確認（`X-Auth-Token` ヘッダー）
   - ファイアウォール/Access設定を確認
