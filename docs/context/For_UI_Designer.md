# Context for UI Component Creator: nexs-web

**Ver 3.0 | 2026-01-28**
**Target Audience:** `docs/design-components/` 配下に、人間やAIが後で編集・活用するための「デザインコンポーネント（モックアップ）」を作成するAI。

---

## 1. あなたのミッション (Objective)
あなたの仕事は、単に見た目が綺麗なHTMLを作ることではありません。
**後続の作業者（開発AIや人間）が、安心して編集・実装できる「高機能な仕様書ファイル（HTML形式）」を作成することです。**

作成されたファイルは、そのままプロジェクトの資産（デザインカンプ兼仕様書）となります。

---

## 2. 必須構成要素 (Structure Requirements)
作成するHTMLファイルには、必ず以下の要素を含めてください。

### 🅰️ ファイルヘッダー（最重要）
ファイル冒頭に、以下の情報を含むコメントブロックを必ず記述してください。

*   **対応ファイル:** このデザインがどの実装ファイル（例: `src/pages/index.astro`）に対応するか。
*   **変更履歴:** 誰が、いつ、何を意図して変更したか。
*   **編集ガイド:** 「どこを変えてよくて、どこを変えてはいけないか（構造維持のため）」のルール。

**良いヘッダーの例:**
```html
<!--
  Design Component: Projects Page
  対応する実装ファイル: src/pages/projects.astro

  【このファイルについて】
  このコンポーネントは Projects ページのデザインリファレンスです。
  スタッフがこれを編集し、開発AIが参照して実装します。

  【変更履歴】
    - 2026-01-26: プロジェクト説明文の文字サイズを text-xs から text-sm に変更
    - 2026-01-28: カテゴリタグの色を統一

  【編集ガイド】
  ✏️ 変更OK:
    - テキスト内容、画像URL
    - 色（Tailwindクラス）
    - リストアイテムの増減

  🔒 変更NG:
    - カード全体のHTML構造
    - セクションの並び順
    - 固定ヘッダー・フッター
-->
```

### 🅱️ 実行環境 (Setup)
ファイル単体でブラウザで開いても正しく表示されるよう、Tailwind CSS (CDN) を読み込んでください。
複雑な `tailwind.config` を書く必要はありません。標準クラスで表現することを優先してください。

```html
<script src="https://cdn.tailwindcss.com"></script>
<!-- アイコンが必要な場合のみ -->
<script src="https://unpkg.com/lucide@latest"></script>
```

### 🅲 コンテンツ (Body)
*   **アノテーション:** 変更可能な箇所には `<!-- EDITABLE -->` とコメントを入れるか、直感的にわかるようにしてください。
*   **モバイルファースト:** 幅375px程度のスマホ表示を基準にレイアウトしてください。

---

## 3. デザインルール (Design Rules)
**"Mobile Research Lab"** コンセプトに基づき、以下のルールを守ってください。

### 🎨 Colors & Typography
*   **Base:** `bg-gray-50`, `text-gray-900`
*   **Font:** Noto Sans JP + Inter
*   **Rules:** 装飾目的で色を使わない。「意味」がある場所にのみ色を使う（ステータス、カテゴリ等）。

### 🧩 Component Snippets
実装時は以下のクラス構成を参考にしてください（強制ではありません）。

*   **Card:** `bg-white rounded-xl shadow-sm border border-gray-100 p-5`
*   **Primary Button:** `bg-black text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2`
*   **Text:** 本文は `text-sm` (14px) が基本。補足は `text-xs` (12px)。

---

## 4. 品質チェックリスト
出力前に以下を確認してください。

1.  [ ] ファイル冒頭のコメントに「変更履歴」と「編集ガイド」はあるか？
2.  [ ] ダブルクリックするだけでブラウザで正しく表示されるか？
3.  [ ] スマホサイズ（幅を狭めた状態）で崩れていないか？
4.  [ ] 複雑すぎるTailwind設定（カスタムクラス等）を使っていないか？（標準クラス推奨）
