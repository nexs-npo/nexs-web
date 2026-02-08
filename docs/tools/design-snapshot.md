# デザインスナップショットツール

## 概要

開発中のページを静的HTMLとして出力し、デザイナーやデザインAIとの共有を簡単にするツールです。

### 目的

- **最新の実装を反映**: 開発サーバーから直接キャプチャするため、常に最新のデザインを共有できる
- **デザイン編集が簡単**: スクリプトを削除し、Tailwind CDNを追加した静的HTMLなので、ブラウザでそのまま開いて編集可能
- **コラボレーション促進**: エンジニア ↔ デザイナー間でのデザイン確認・修正フローを効率化

---

## 使い方

### 1. 開発サーバーを起動

```bash
npm run dev
```

デフォルトでは `http://localhost:8080` で起動します。

### 2. スナップショットを生成

別のターミナルで以下を実行：

```bash
npm run design:snapshot
```

### 3. 出力ファイルを確認

`_design_snapshots/` ディレクトリに以下のファイルが生成されます：

```
_design_snapshots/
├── index.html      # トップページ (/)
├── lab.html        # Lab ページ (/lab/)
├── library.html    # Library ページ (/library/)
├── office.html     # Office ページ (/office/)
└── mydesk.html     # MyDesk ページ (/mydesk/)
```

---

## ワークフロー

### デザイナー・スタッフ向け

1. **開発AIにスナップショットを依頼**
   ```
   「最新のデザインスナップショットを作成してください」
   ```

2. **受け取ったHTMLファイルをブラウザで開く**
   - ダブルクリックでブラウザが開きます
   - **完全オフライン対応**: CSSはインライン化されているため、開発サーバーなしで正しく表示されます
   - Tailwind CSSはCDN経由で読み込まれます

3. **デザインを編集**
   - ブラウザのDevTools（F12）でライブ編集
   - または、エディタでHTMLを直接編集
   - Figma、Photoshop等でスクリーンショットを加工してもOK

4. **編集後のファイルまたはスクリーンショットを共有**
   ```
   「index.htmlのHeroセクションを添付の通りに変更してください」
   ```

### 開発AI向け

1. **スナップショット生成**
   ```bash
   npm run design:snapshot
   ```

2. **生成されたHTMLをスタッフに共有**

3. **編集後のファイルを受け取り、実装に反映**
   - 変更箇所を確認
   - 対応する `.astro` ファイルに実装

---

## 技術仕様

### スクリプトの動作

`scripts/snapshot.js` は以下の処理を行います：

1. **Playwright でページにアクセス**
   - Chromium ブラウザを起動
   - `http://localhost:8080`（デフォルト）にアクセス
   - ページが完全にレンダリングされるまで待機

2. **CSS を取得・インライン化**
   - ページ内のすべての `<link rel="stylesheet">` から CSS を取得
   - CSSルールを抽出してインライン化
   - これにより、オフラインでも正確なスタイルが表示される

3. **HTML を加工**
   - すべての `<script>` タグを削除（インタラクティブ要素は静的化）
   - すべての `<link rel="stylesheet">` タグを削除（インライン化したため不要）
   - インライン化した CSS を `<style>` タグとして挿入
   - `<head>` に Tailwind CSS CDN を追加（ユーティリティクラス用）

4. **整形して保存**
   - Prettier でフォーマット
   - `_design_snapshots/` に出力

### カスタマイズ

#### ポート番号を変更

デフォルトは `8080` ですが、環境変数で変更可能：

```bash
SNAPSHOT_URL=http://localhost:4321 npm run design:snapshot
```

#### ページを追加

`scripts/snapshot.js` の `PAGES` 配列にパスを追加：

```javascript
const PAGES = [
  '/',
  '/lab/',
  '/library/',
  '/office/',
  '/mydesk/',
  '/lab/shared-service/',  // 追加例
];
```

---

## トラブルシューティング

### エラー: `browserType.launch: Target page, context or browser has been closed`

**原因**: Playwright の Chromium に必要なシステムライブラリが不足している

**解決方法**:

```bash
# 推奨: Playwright の公式コマンド
npx playwright install-deps

# または: 手動でライブラリをインストール
sudo apt-get install libxcb-shm0 libx11-xcb1 libxrandr2 libxcomposite1 \
  libxcursor1 libxdamage1 libxfixes3 libgtk-3-0 libpangocairo-1.0-0 \
  libpango-1.0-0 libcairo-gobject2 libcairo2 libgdk-pixbuf-2.0-0 \
  libxrender1 libasound2 libfreetype6 libfontconfig1
```

**注意**: `sudo` を使わずに `npx playwright install-deps` だけを実行すると、ユーザーディレクトリにインストールされるため、権限エラーを回避できる場合があります。

### エラー: `Error: connect ECONNREFUSED`

**原因**: 開発サーバーが起動していない、または別のポートで起動している

**解決方法**:

1. 開発サーバーが起動しているか確認
   ```bash
   npm run dev
   ```

2. 別のポートで起動している場合は環境変数で指定
   ```bash
   SNAPSHOT_URL=http://localhost:4321 npm run design:snapshot
   ```

### スナップショットが古いページのまま

**原因**: ブラウザキャッシュまたは開発サーバーの再起動が必要

**解決方法**:

1. 開発サーバーを再起動
2. `_design_snapshots/` を削除してから再実行
   ```bash
   rm -rf _design_snapshots/
   npm run design:snapshot
   ```

---

## 関連ドキュメント

- `docs/DESIGN_WORKFLOW.md` - デザイン実装の全体ワークフロー
- `docs/04_UI_UX_GUIDELINES.md` - UI/UXデザインガイドライン
- `scripts/snapshot.js` - スクリプト本体

---

**作成日**: 2026年2月
**更新日**: 2026年2月
**ステータス**: 運用開始版
