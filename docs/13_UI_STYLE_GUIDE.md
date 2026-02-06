# **04. UI/UX Guidelines & Design System**

**Concept:** "Mobile Research Lab"

知的でクリーンだが、実験室のような「動的な気配」を感じさせるデザイン。

## **1. Core Principles**

1. **Mobile First / Thumb Friendly:**
   * 主要な操作（ナビゲーション、投稿、アクション）は画面下部（ボトムエリア）に集約する。
   * タップ領域は最低 44x44px を確保する。
2. **View Transitions:**
   * 画面遷移はブラウザのデフォルト（白画面リロード）ではなく、AstroのView Transitionsを用いた「アプリのような滑らかな遷移」を行う。
3. **Clean & Focus:**
   * ベースは白とグレー。色は「意味（プロジェクトのカテゴリ等）」がある場所にのみ使用する。

## **2. Color Palette (Tailwind)**

### **Base Colors**

* **Background:** bg-gray-50 (App Background), bg-white (Cards/Content)
* **Text Main:** text-gray-900
* **Text Sub:** text-gray-500
* **Text Meta:** text-gray-400 (Dates, Labels)

### **Project Category Colors**

プロジェクトのカテゴリごとにテーマカラーを定数化する。

* **Shared Service:** Blue (Trust)
* **Platform:** Purple (Technology/Future)
* **Mobility:** Green (Eco/Safety)
* **Education:** Yellow or Orange (Humanity)

## **3. Component Patterns**

### **A. Cards**

情報の基本単位。

* **Style:** bg-white, rounded-xl, border border-gray-100, shadow-sm
* **Interaction:** active:scale-[0.98] transition-transform (押し心地の実装)

### **B. Bottom Navigation**

アプリの主要導線。

* **Position:** fixed bottom-0
* **Style:** bg-white/95 backdrop-blur-xl (すりガラス効果)
* **Items:** Home, Projects, Signals, About

### **C. Discussion Drawer (Bottom Sheet)**

議論機能は別ページではなく、現在のコンテキスト（プロジェクト詳細）の上に重なる「レイヤー」として表現する。

* **Behavior:** 下からスライドイン。
* **Context:** 背景（プロジェクト内容）を少し残して、何について話しているかを忘れないようにする。

## **4. Typography**

AIとの親和性と可読性を重視。

* **Main (JP):** Noto Sans JP
* **Main (EN):** Inter
* **Code / Meta:** Space Mono (日付、ID、データ数値に使用し、実験的な雰囲気を出す)

## **5. Motion & Animation**

控えめだが、システムが「生きている」ことを伝える動き。

* **Fade In Up:** ページ読み込み時、コンテンツが下からフワッと浮き上がる。
  * animate-fade-in-up (0.4s ease-out)
* **Pulse:** In Progress などのステータスインジケーターに使用。
