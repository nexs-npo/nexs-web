# 13. UI Style Guide

**Version:** 2.0
**Created:** 2026-02 with Claude Code (Sonnet 4.5)

このドキュメントでは、nexs-webのUIデザインシステム、コンポーネントパターン、スタイル指針について説明します。

---

## 1. Design Principles

### Mobile First

**スマートフォンでの体験を最優先します。**

- 主要な操作（ナビゲーション、投稿、アクション）は画面下部（ボトムエリア）に集約
- タップ領域は最低 44x44px を確保
- 親指での操作を想定した配置（Thumb-Friendly Design）

### Clean & Focus

**思考を妨げる要素を排除します。**

- ベースは白とグレーのモノクロームパレット
- 広告、過度なアニメーション、無意味な装飾を排除
- 色は「意味（カテゴリ、ステータス）」がある場所にのみ使用

### Semantic Structure

**人間とAIの両方が理解できる構造を優先します。**

- セマンティックHTML（article, section, nav）の使用
- 明確な文章構造とヘッダー階層
- 装飾よりも構造を重視

---

## 2. Layout System

### Mobile Layout

**基本レイアウト:**
- Container: `px-5` (左右20px padding)
- Max Width: `max-w-md` (448px)
- Background: `bg-gray-50`
- Content Cards: `bg-white`

### Desktop Responsive

**Desktop（lg: 1024px以上）:**
- Container: `lg:px-8` (左右32px padding)
- Max Width: `lg:max-w-[940px]` (note.comと同じ幅)
- Center Alignment: `mx-auto`

**適用パターン:**
```astro
<div class="px-5 lg:px-8 max-w-md lg:max-w-[940px] mx-auto">
  <!-- Content -->
</div>
```

### Safe Area

- Bottom Navigation の高さ: 64px
- ページ下部には `pb-20`（80px）を設定し、Bottom Navに隠れないようにする

---

## 3. Color System

### Monochrome Base

ガバナンスページ・メインコンテンツは**グレースケール**を基本とします。

| 用途 | Tailwind Class | 説明 |
|------|---------------|------|
| **Background** | `bg-gray-50` | アプリ全体の背景 |
| **Content BG** | `bg-white` | カード、コンテンツエリア |
| **Text Main** | `text-gray-900` | 本文、見出し |
| **Text Sub** | `text-gray-600` | 補足説明、サブテキスト |
| **Text Meta** | `text-gray-400` | 日付、ラベル |
| **Border** | `border-gray-100` | カードの境界線 |
| **Divider** | `border-gray-200` | セクション区切り |

### Semantic Colors

色は**意味を持つ場所にのみ**使用します。

**Knowledge Category Badges:**
- Foundation (F): `bg-blue-50 text-blue-700 border-blue-200`
- Thesis (T): `bg-purple-50 text-purple-700 border-purple-200`
- Protocol (P): `bg-green-50 text-green-700 border-green-200`
- Evidence (E): `bg-orange-50 text-orange-700 border-orange-200`
- Update (U): `bg-gray-50 text-gray-700 border-gray-200`

**Status Indicators:**
- In Progress: `text-blue-600`
- Completed: `text-green-600`
- Planning: `text-gray-600`

**Project Theme Colors:**
- プロジェクトごとに `theme` JSONB フィールドで個別カラーを設定可能
- 例: `{"primary": "blue-500", "bg": "blue-50"}`

---

## 4. Typography

### Font Families

| 言語/用途 | フォント | 使用箇所 |
|----------|---------|---------|
| **日本語** | Noto Sans JP | 本文、見出し |
| **英語** | Inter | 本文、見出し |
| **Code/Meta** | Space Mono | 日付、ID、数値データ |

### Font Scaling

**Mobile（デフォルト）:**
- Base: `text-sm` (14px)
- Body: `text-base` (16px) ※Knowledge記事本文
- Heading 1: `text-2xl` (24px)
- Heading 2: `text-xl` (20px)

**Desktop（lg: 1024px以上）:**
- Base: `lg:text-base` (16px)
- Body: `lg:text-lg` (18px) ※Knowledge記事本文
- Heading 1: `lg:text-3xl` (30px)
- Heading 2: `lg:text-2xl` (24px)

### Line Height

- 本文: `leading-relaxed` (1.625)
- Knowledge記事: `leading-loose` (2.0) ※読みやすさ重視

---

## 5. Component Patterns

### Cards

情報の基本単位。

**スタイル:**
```css
bg-white rounded-xl border border-gray-100 shadow-sm p-5
```

**インタラクション:**
```css
active:scale-[0.98] transition-transform
```
- タップ時に軽く縮む（押し心地の実装）

### Bottom Navigation

アプリの主要導線。固定ナビゲーション。

**構成:**
- 5タブ: 研究室、書庫、nexs、事務局、マイデスク
- Position: `fixed bottom-0 left-0 right-0`
- Style: `bg-white/95 backdrop-blur-xl` （すりガラス効果）
- Border: `border-t border-gray-200`

**アクティブ状態:**
- アクティブタブ: `text-gray-900`
- 非アクティブ: `text-gray-400`
- nexsタブは常にラベル表示

**実装:**
- `src/components/BottomNav.tsx`
- `src/components/Icons.tsx`

### Page Headers

各ページ上部のヘッダー。

**スタイル:**
```astro
<header class="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-200">
  <div class="px-5 lg:px-8 h-14 flex items-center justify-between max-w-md lg:max-w-[940px] mx-auto">
    <h1 class="text-base lg:text-lg font-bold text-gray-900">{headerTitle}</h1>
  </div>
</header>
```

### Discussion Drawer (Bottom Sheet)

議論機能は別ページではなく、現在のコンテキスト（プロジェクト詳細）の上に重なる「レイヤー」として表現。

**動作:**
- 下からスライドイン
- 背景を少し残して、コンテキストを忘れないようにする
- モーダル背景: `bg-black/50 backdrop-blur-sm`

---

## 6. Motion & Transitions

### View Transitions

**Astro View Transitions API** を使用し、ページ遷移を滑らかにします。

- ブラウザのデフォルト（白画面リロード）を排除
- アプリのような体験を実現
- 実装: `src/layouts/BaseLayout.astro` の `<ViewTransitions />`

### Interactive Feedback

**控えめだが、システムが「生きている」ことを伝える動き。**

**Fade In Up:**
```css
animate-fade-in-up /* 0.4s ease-out */
```
- ページ読み込み時、コンテンツが下からフワッと浮き上がる

**Active State:**
```css
active:scale-[0.98] transition-transform
```
- タップ時のフィードバック（Cards, Buttons）

**Pulse:**
```css
animate-pulse
```
- "In Progress" などのステータスインジケーターに使用

---

## 7. Tailwind Configuration

### Custom Extensions

`tailwind.config.cjs` で定義されたカスタム設定:

**Animations:**
```javascript
animation: {
  'fade-in-up': 'fadeInUp 0.4s ease-out'
}
```

**Custom Utilities:**
- Knowledge記事用スタイル: `src/styles/global.css` の `.knowledge-content`

---

## 8. Design Tokens

将来的にデザイントークンを `src/styles/tokens.css` として定義することを推奨します。

**推奨構成:**
```css
:root {
  /* Spacing */
  --space-page-x: 1.25rem; /* 20px */
  --space-page-x-lg: 2rem; /* 32px */

  /* Container */
  --container-max-width: 28rem; /* 448px */
  --container-max-width-lg: 58.75rem; /* 940px */

  /* Colors */
  --color-bg-base: #f9fafb; /* gray-50 */
  --color-bg-content: #ffffff;
  --color-text-primary: #111827; /* gray-900 */
}
```

---

## 9. Accessibility

- **Focus State:** キーボード操作時のフォーカス状態を必ず実装
- **Touch Target:** タップ領域は最低 44x44px
- **Color Contrast:** WCAG AA準拠（テキストとBackground間で4.5:1以上）
- **Semantic HTML:** `<article>`, `<nav>`, `<section>` を適切に使用

---

## 10. Implementation Guidelines

### 新規ページ作成時のチェックリスト

- [ ] Mobile First でスタイルを実装
- [ ] Desktop responsive（`lg:` breakpoint）を追加
- [ ] Bottom Navに隠れないよう `pb-20` を設定
- [ ] View Transitions に対応（`transition:name` 属性）
- [ ] セマンティックHTMLを使用
- [ ] Tailwind utility-first で記述（カスタムCSSは最小限）

### コンポーネント作成時の原則

- **Isolation over Abstraction:** 過度な共通化を避け、各コンポーネントの独立性を保つ
- **Locality of Behavior:** コンポーネント内で完結させ、他ファイルへの依存を最小化
- **Replaceable Code:** 複雑な抽象化より、具体的で読みやすいコードを優先
