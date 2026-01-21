# Design Components

nexs のデザイン実装用、スタンドアロン HTML コンポーネント集です。

## 📖 はじめに

このフォルダ内のHTMLファイルは、**スタッフがデザインを編集** → **開発AIが参照して実装** するワークフローの中核です。

**目的：** 複雑なリポジトリ構造に触れず、シンプルなHTMLを編集することで、デザインの意図を明確に伝える

---

## 🗂️ コンポーネント一覧

| ファイル | ページ | 対応する実装 | 主な学習対象 | 難度 |
|---|---|---|---|---|
| **about.html** | About | src/pages/about.astro | Hero、Process Cycle（4ステップ）、Values セクション | ⭐ 初級 |
| **signals.html** | Signals | src/pages/signals.astro | ソートボタン、Signal カード、カウント表示 | ⭐⭐ 中級 |
| **knowledge.html** | Knowledge | src/pages/knowledge.astro | カテゴリフィルター、動的表示切り替え | ⭐⭐ 中級 |
| **projects.html** | Projects | src/pages/projects.astro | セクション分け、プロジェクトカード | ⭐ 初級 |

---

## 🚀 使い方

### 1️⃣ ファイルを開く

ブラウザで対応するHTMLを開きます：

```
File → Open → docs/design-components/about.html
```

または、このフォルダを Web サーバーで起動：

```bash
python -m http.server 8000
# ブラウザで http://localhost:8000/design-components/about.html
```

### 2️⃣ DevTools で確認しながら編集

**F12** キーで DevTools を開きます。

```
【確認方法】
1. 要素を右クリック → 「検査」を選択
2. HTML構造と class 名を確認
3. 色を変えたければ class 名を修正
   例：bg-gray-50 → bg-white
4. テキストを変更したければ内容を編集
```

### 3️⃣ ファイルを保存

編集後、**Ctrl+S** または **Cmd+S** で保存します。

### 4️⃣ 確認・報告

スクリーンショットを撮って、開発AIに報告します：

```
【コンポーネント更新報告】
ページ: About
変更内容:
  - 背景色を gray-50 → white に変更
  - Process Cycle のステップ番号のサイズを調整

修正ファイル: docs/design-components/about.html
```

---

## ✏️ 編集ルール

### 各ファイルの先頭に書かれてます

```html
<!--
  Design Component: [ページ名]
  対応する実装ファイル: [Astroファイル]

  【編集ガイド】
  ✏️ 変更OK: ...
  🔒 変更NG: ...
-->
```

### 共通ルール

#### ✏️ 絶対に変更してOK な項目

- **テキスト内容**（見出し、説明文、ボタンラベル）
- **色**（class 値：bg-gray-*, text-gray-* など）
- **サイズ**（text-sm, text-lg など）
- **セクション内の要素の微調整**

#### 🔒 絶対に変更してはいけない項目

- **HTML全体の構造**（div の階層、section の削除など）
- **フッターナビゲーション**（全ページ共通なので固定）
- **Header要素**
- **class="animate-fade-in-up"** など、アニメーション定義
- **data-category** など、JavaScriptが依存している属性

---

## 🎨 Tailwind CSS クラス早見表

デザイン編集で使われる主要なクラス：

### 色（モノトーンのみ）

```css
bg-white       /* 白背景 */
bg-gray-50     /* 薄いグレー背景 */
bg-gray-100    /* グレー背景 */
text-gray-900  /* 濃いグレーテキスト */
text-gray-600  /* 中グレーテキスト */
text-gray-500  /* 薄いグレーテキスト */
border-gray-200 /* グレー枠線 */
```

### サイズ

```css
text-xs   /* 超小 (12px) */
text-sm   /* 小 (14px) */
text-base /* 標準 (16px) */
text-lg   /* 大 (18px) */
text-2xl  /* 超大 */
```

### 余白

```css
p-4     /* padding: 16px */
mb-4    /* margin-bottom: 16px */
px-5    /* 左右 padding: 20px */
space-y-3 /* 子要素間に 12px 間隔 */
```

### その他

```css
rounded-lg      /* 角を丸くする */
border          /* 枠線追加 */
shadow-sm       /* 薄い影 */
hover:shadow-md /* ホバー時に影が濃くなる */
```

詳細は [Tailwind CSS 公式ドキュメント](https://tailwindcss.com) を参照。

---

## 🤖 開発AI向け実装ガイド

### 確認すべきポイント

1. **コンポーネントの見た目確認**
   - ブラウザで docs/design-components/ を見る

2. **先頭メタデータの確認**
   - 対応する実装ファイル
   - 編集ガイド（変更OK/NG）

3. **DESIGN_WORKFLOW.md の確認**
   - 特に「コンポーネント間の統一性」チェック

4. **実装後のテスト**
   ```bash
   npm run build
   ブラウザで実装ファイルを見て、コンポーネントと見た目が一致しているか確認
   ```

---

## ❓ よくある質問

### Q. HTMLを直接編集していいの？

**A.** はい。このフォルダのHTMLは「学習・リファレンス用」なので、自由に編集してOK。

ただし、実装前に必ず以下を確認：
- 各ファイルの先頭コメント（編集ガイド）
- DESIGN_WORKFLOW.md の確認ポイント

### Q. JavaScriptを変更したい

**A.** 基本的にNG。フィルター機能など、JavaScriptが含まれている場合は、開発AIに相談してから変更してください。

### Q. 新しいセクションを追加したい

**A.** まずは KNOWLEDGE_GUIDE.md と DESIGN_WORKFLOW.md を読んで、それでも必要なら開発AIに相談してください。

### Q. ページ全体をリデザインしたい

**A.** その場合も DESIGN_WORKFLOW.md の「Rule 2」を参照。スタッフと開発AIで相談してから進めてください。

---

## 📋 チェックリスト（スタッフ向け）

コンポーネントを編集したら、以下を確認してから報告します：

- [ ] ブラウザで見た目を確認した
- [ ] 各ファイルの先頭コメントで「変更OK」な項目を編集した
- [ ] テキスト、色、サイズ以外は変更していない
- [ ] HTML構造は変えていない
- [ ] フッターナビゲーションは変更していない
- [ ] スクリーンショットを撮った
- [ ] 開発AIに「コンポーネント更新」を報告した

---

## 📞 トラブル対応

### ブラウザで表示されない

```
→ Tailwind CDN が読み込まれているか確認
  <script src="https://cdn.tailwindcss.com"></script>
  が <head> にあるか確認
```

### JavaScript が動作しない

```
→ ブラウザのコンソール（F12 → Console）でエラーを確認
  特に data-category 属性や class 名の変更に注意
```

### 見た目が崩れた

```
→ class 名を誤って変更していないか確認
  元のコードを参照して修正してください
```

---

**最終更新：** 2026年1月
**バージョン：** 1.0
