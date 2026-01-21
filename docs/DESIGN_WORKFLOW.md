# nexs デザイン実装ワークフロー

このドキュメントは、**デザインチーム（スタッフ）** と **開発AI** が連携してページをデザイン・実装するための標準プロセスです。

---

## 📌 ワークフロー全体の流れ

```
┌─────────────────────┐
│ 1. デザイン編集     │  スタッフが docs/design-components/ 内の
│    （スタッフ）     │  HTMLファイルを編集
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ 2. 実装指示         │  スタッフが開発AIに
│    （スタッフ）     │  「●●を更新しました」と報告
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ 3. 参照・確認       │  開発AIが更新されたコンポーネントを確認
│    （開発AI）       │  実装ファイルに反映
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ 4. テスト・マージ   │  build & push
│    （開発AI）       │
└─────────────────────┘
```

---

## 👥 デザインチーム（スタッフ）の作業

### 開始前に読むこと

- `docs/design-components/README.md` - コンポーネント一覧
- 対応するコンポーネントHTMLファイルの先頭コメント - 編集ガイド

### 作業フロー

#### Step 1: ファイルを開く

```
docs/design-components/ 内の対応するHTMLをブラウザで開く

例）
- About ページを変更したい → about.html を開く
- Signals ページを変更したい → signals.html を開く
```

#### Step 2: DevTools で確認

```
F12 キーを押して DevTools を開き、
HTML構造とCSSの class を確認しながら編集してください。

特に重要：
- class="text-sm" → フォントサイズ
- class="bg-gray-50" → 背景色
- class="rounded-lg" → 角の丸さ
など、Tailwindのクラス名を理解しておくと便利です。
```

#### Step 3: 編集してみる

**変更OK な例：**
```html
<!-- Before -->
<h1 class="text-4xl">社会課題に、科学する。</h1>

<!-- After（テキスト変更OK） -->
<h1 class="text-4xl">AI時代の社会課題を解く。</h1>

<!-- Before -->
<div class="bg-gray-50">...</div>

<!-- After（色変更OK） -->
<div class="bg-white">...</div>
```

**変更NG な例：**
```html
<!-- NG: HTML構造を変える -->
<section>
  <div>...</div>  <!-- 親の div を削除、レイアウト破壊 -->
</section>

<!-- NG: class="animate-fade-in-up" など、アニメーション定義は変えない -->
```

詳細は各ファイルの先頭コメントを参照してください。

#### Step 4: スクリーンショットと一緒に報告

修正したら、以下をSlack/メールで開発AIに報告します：

```
【コンポーネント更新報告】
ページ: About ページ
変更内容:
  - Hero セクションのテキストを修正
  - Values セクションの背景色を white に変更

修正ファイル: docs/design-components/about.html
スクリーンショット: [添付]
```

---

## 🤖 開発AI（実装者）の作業

### 実装前に確認すること

1. **コンポーネントを確認**
   ```
   $ ブラウザで docs/design-components/[ページ名].html を開く
   ```

2. **先頭のメタデータコメントを読む**
   ```html
   <!--
     Design Component: [ページ名]
     対応する実装ファイル: [Astroファイルパス]

     【編集ガイド】
     ✏️ 変更OK: ...
     🔒 変更NG: ...
   -->
   ```

3. **DESIGN_WORKFLOW.md の「コンポーネント間の統一性」チェック**

### 実装時の確認ポイント

#### Point 1: デザインコンポーネントと実装ファイルの対応確認

| コンポーネント | 実装ファイル | 確認項目 |
|---|---|---|
| about.html | src/pages/about.astro | Hero、Process Cycle、Values の構造 |
| signals.html | src/pages/signals.astro | ソートボタン、Signal カード |
| knowledge.html | src/pages/knowledge.astro | フィルター、Knowledge アイテム |
| projects.html | src/pages/projects.astro | セクション分け、Project カード |

#### Point 2: コンポーネント間の統一性

**確認すべき共通要素：**

- **背景色**：全ページ `bg-white`（gray-50 ではなく）
- **モノトーン配色**：gray-900, gray-800, ... gray-100 のみ
- **フッターナビゲーション**：全ページ共通 - 変更しない
- **ボタンスタイル**：同じ目的なら同じ class を使用
- **テキストサイズ**：見出し、本文で一貫性

**チェックリスト：**
```
□ すべてのページが bg-white になっている（gray-50 になっていないか）
□ カラーは gray系のみ（blue, green, red等 がないか）
□ フッターナビゲーションは全ページ同じ
□ テキストサイズが各ページで統一されている
□ ボタンやタグのスタイルが統一されている
```

#### Point 3: レスポンシブ対応

- コンポーネントはモバイルサイズ（max-w-md）で設計
- 実装時も同じ制約を守る
- `px-5 max-w-md mx-auto` のパターンを継承

#### Point 4: インタラクティブ要素の動作確認

Knowledge ページ、Signals ページなど、JavaScript を含むコンポーネントは：
- ブラウザで実際に動作確認
- フィルター、ソート等が正しく動く
- 対応する Astro 実装でも同じ動作をする

### 実装後のチェック

```bash
# 1. Build テスト
npm run build

# 2. 視認確認
ブラウザで http://localhost:3000/about/ (等) を開く

# 3. デザインコンポーネントとの比較
docs/design-components/about.html との見た目を比較
```

---

## 🎨 デザイン実装のルール

### Rule 1: 常にデザインコンポーネントから始める

```
❌ やってはいけない：
   既存の Astro ファイルを直接編集して「これくらいなら」と進める

✅ 正しい方法：
   1. docs/design-components/[ページ].html で新しい見た目を作る
   2. スタッフが確認 OK を出す
   3. それを参照して Astro ファイルを実装
```

### Rule 2: 構造の大きな変更は別途相談

デザインコンポーネントの編集ガイルで NG になっていることは変更しない。

もし大きな構造変更が必要な場合：
1. スタッフに相談
2. デザインコンポーネントを先に更新
3. その後、実装を進める

### Rule 3: テキスト内容は参考値

デザインコンポーネントのテキストは「配置の確認用」の場合が多い。
実装時には適切な内容に修正してOK。

```html
<!-- デザインコンポーネント（参考） -->
<h3>サンプルタイトル</h3>

<!-- 実装時（OK） -->
<h3>実装プロジェクトの名前</h3>
```

### Rule 4: class 名は Tailwind のみ

inline style や id を追加しない。
すべて class ベースで実装。

```html
<!-- ✅ OK -->
<div class="text-sm font-bold text-gray-900">...</div>

<!-- ❌ NG -->
<div class="text-sm font-bold text-gray-900" style="margin: 10px;">...</div>
```

---

## 📂 ファイル場所と役割

```
docs/
├── KNOWLEDGE_GUIDE.md
│   → Knowledge の 5-category 構造ガイド
│
├── DESIGN_WORKFLOW.md
│   → 【このファイル】ワークフロー説明
│
├── design-components/
│   ├── README.md
│   │   → コンポーネント一覧と使い方
│   │
│   ├── index.html
│   │   → コンポーネント集のランディング
│   │
│   ├── about.html
│   ├── signals.html
│   ├── knowledge.html
│   └── projects.html
│       → 各ページのデザインリファレンス
│
src/pages/
├── about.astro
├── signals.astro
├── knowledge.astro
└── projects.astro
    → 実装ファイル（design-components の HTML から参照される）
```

---

## 🚀 今後のワークフロー改善

以下は、実装を通じて決めること：

- デザイン変更の「確認フロー」（誰が最終確認するか）
- 「修正完了」の定義（Build 成功？ 見た目確認？）
- コンポーネント更新の「頻度」（毎回？ まとめて？）
- エラーが出たときの「報告フォーマット」

---

**作成日：** 2026年1月
**ステータス：** 運用開始版
**次回更新：** ワークフロー実行を通じてルール改善
