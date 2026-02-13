# 14. PWA Strategy

**Version:** 2.0
**Created:** 2026-02 with Claude Code (Sonnet 4.5)

このドキュメントでは、nexs-webのPWA（Progressive Web App）化戦略、実装方針、将来計画について説明します。

---

## 1. PWA Overview

### Why PWA?

本プロジェクトの開発哲学との整合性:

**Mobile First (UX 2nd Priority):**
- スマートフォンのホーム画面にインストール可能
- アプリストア不要で、Webの自由度を維持
- アプリのような体験をWeb技術で実現

**Resilience (AI-Era Architecture):**
- オフライン時も静的コンテンツ（記事、プロジェクト情報）を閲覧可能
- Self-hostedサーバーダウン時のフォールバック体験向上
- 部分障害が全体に波及しない設計

**Open Source (4th Priority):**
- PWAはWeb標準技術。誰でもForkして独自のPWAを作れる
- App Storeの審査不要で、即座にデプロイ可能
- 再現可能性の担保

### Benefits

| メリット | 説明 |
|---------|------|
| **高速表示** | キャッシュにより再訪問時の表示が劇的に高速化 |
| **オフライン対応** | ネットワーク障害時も基本機能を維持 |
| **アプリ体験** | ホーム画面から起動、全画面表示 |
| **軽量** | ネイティブアプリより小さいデータサイズ |
| **即座の更新** | アプリストア経由不要、デプロイ即反映 |

---

## 2. Implementation Status

### Phase 1: Basic PWA Support **[← 現在地]**

**完了済み:**

✅ **manifest.json の配置**
- `public/manifest.json` に PWA マニフェストを配置
- アプリ名、アイコン、テーマカラー等を定義

✅ **PWA メタタグの設定**
- `src/layouts/BaseLayout.astro` に必要なメタタグを追加
- iOS Safari、Android Chrome 両対応

✅ **PWA アイコンの準備**
- `/public/icons/` に各サイズのアイコンを配置
- サイズ: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

**現在の状態:**
- Android Chromeでインストールプロンプトが表示される
- iOS Safariで「ホーム画面に追加」可能
- Service Workerは未実装（オフラインキャッシュなし）

### Phase 2: Service Worker **[将来計画]**

**実装予定:**

⚠️ **Service Workerによるキャッシング**
- Workboxまたは手動実装
- 静的アセット（HTML, CSS, JS）のプリキャッシュ
- 動的データ（API レスポンス）のランタイムキャッシュ

⚠️ **オフライン体験の向上**
- ネットワークエラー時のフォールバックUI
- キャッシュされたデータの表示

⚠️ **バックグラウンド同期**
- オフライン時の議論投稿を、オンライン復帰時に自動送信

⚠️ **プッシュ通知**
- 新しいSignalや議論の返信時に通知（任意機能）

---

## 3. Manifest Configuration

### Current manifest.json

`public/manifest.json` の設定:

```json
{
  "name": "nexs - 次世代社会デザイン研究機構",
  "short_name": "nexs",
  "description": "AI時代の社会システムを実証・還元するリサーチコレクティブ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fafafa",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["education", "research", "social"]
}
```

### Design Decisions

| 設定項目 | 値 | 理由 |
|---------|---|------|
| **display** | `standalone` | ブラウザUIを非表示にし、アプリ体験を実現 |
| **theme_color** | `#000000` | ヘッダーの背景色と統一 |
| **background_color** | `#fafafa` | `bg-gray-50` と統一 |
| **orientation** | `portrait-primary` | モバイル縦持ちを基本とする |
| **purpose** | `maskable any` | Android Adaptive Iconsに対応 |

### PWA Meta Tags

`src/layouts/BaseLayout.astro` に実装済み:

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#000000" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

---

## 4. Caching Strategy (Phase 2 計画)

### 基本方針

**疎結合の原則に従い、静的と動的を明確に分離します。**

### Static Assets (Pre-cache on install)

**インストール時にプリキャッシュ:**
- HTML (index.html, /lab, /library, /office, /mydesk)
- CSS (Tailwind compiled output)
- JS (Astro Islands bundles)
- Icons, Fonts

**戦略:** Cache First（キャッシュ優先、ネットワークフォールバック）

### Dynamic Data (Runtime cache)

**実行時にキャッシュ:**
- Supabase API レスポンス（/rest/v1/projects, /rest/v1/discussions）
- Knowledge記事（MDX静的生成済み）

**戦略:** Network First（ネットワーク優先、キャッシュフォールバック）

### Authentication (No cache)

**キャッシュしない:**
- Clerk認証エンドポイント
- Write操作（POST/PUT/DELETE）

**戦略:** Network Only（常にネットワーク経由）

---

## 5. Service Worker Implementation (Phase 2)

### Implementation Approach

**選択肢:**
1. **Workbox（推奨）:** Googleの公式ライブラリ、設定ベースで実装
2. **手動実装:** 完全なコントロールが必要な場合

**推奨:** Workboxを使用し、設定ファイルで管理

### Code Example (手動実装の場合)

**`public/sw.js` の実装例:**

```javascript
const CACHE_NAME = 'nexs-v1';
const STATIC_CACHE = [
  '/',
  '/lab',
  '/library',
  '/office',
  '/mydesk',
  '/manifest.json'
];

// Install: 静的アセットをプリキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE);
    })
  );
});

// Fetch: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  // 認証エンドポイントはキャッシュしない
  if (event.request.url.includes('clerk')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
```

**`src/layouts/BaseLayout.astro` に登録:**

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
</script>
```

---

## 6. Offline Experience

### Fallback Strategy

**Self-hostedサーバーダウン、またはオフライン時:**

1. **静的コンテンツ:** キャッシュから表示（Knowledge記事、プロジェクト情報）
2. **動的データ:** 最後に取得したキャッシュデータを表示
3. **Write操作:** エラーメッセージ表示、または送信キュー（Background Sync使用時）

### UI Indicators

**オフライン状態の表示:**

```tsx
// src/components/OfflineBanner.tsx
export default function OfflineBanner({ isOffline }: { isOffline: boolean }) {
  if (!isOffline) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-5 py-2">
      <p className="text-xs text-yellow-900 text-center">
        ⚠️ オフラインモード - キャッシュされたデータを表示しています
      </p>
    </div>
  );
}
```

**ネットワーク状態の検出:**

```typescript
const [isOffline, setIsOffline] = useState(!navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOffline(false);
  const handleOffline = () => setIsOffline(true);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```

---

## 7. Testing & Validation

### PWA Audit Tools

**Lighthouse (Chrome DevTools):**
- PWA スコア 90+ を目標
- Installable, Offline-capable, HTTPS必須
- Performance, Accessibility も合わせて検証

**PWA Builder (Microsoft):**
- [pwabuilder.com](https://www.pwabuilder.com/) でスキャン
- manifest, service worker の検証

### Manual Testing Checklist

**Phase 1（現在）:**
- [x] Android Chromeでインストールプロンプトが表示される
- [x] iOS Safariで「ホーム画面に追加」後、アプリとして起動
- [x] スタンドアロンモードで起動（ブラウザUIなし）
- [x] テーマカラーが正しく適用される

**Phase 2（将来）:**
- [ ] 機内モードでも静的ページが表示される
- [ ] Self-hostedサーバーダウン時、優雅なフォールバックが動作
- [ ] キャッシュが適切に更新される（古いデータが残らない）
- [ ] オフライン時の投稿がオンライン復帰後に送信される（Background Sync）

---

## 8. Future Enhancements

### Push Notifications (Phase 3)

新しいSignalや議論の返信時に通知:

```javascript
// Service Worker 内
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png'
  });
});
```

**注意:** プッシュ通知は任意機能。ノイズにならないよう、ユーザーが明示的にオプトインした場合のみ有効化。

### Background Sync (Phase 3)

オフライン時の議論投稿を、オンライン復帰時に自動送信:

```javascript
// オフライン時に送信キューに追加
navigator.serviceWorker.ready.then((registration) => {
  registration.sync.register('sync-discussions');
});

// Service Worker 内で同期処理
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-discussions') {
    event.waitUntil(sendQueuedDiscussions());
  }
});
```

### Install Prompt Optimization (Phase 3)

iOS Safariユーザー向けに「ホーム画面に追加」の案内を表示:

```tsx
// src/components/InstallPrompt.tsx
// 初回訪問時、3秒後にプロンプト表示
// "共有 → ホーム画面に追加" の手順を案内
```

---

## 9. Performance Expectations

PWA化によって期待される効果:

| 指標 | Before (Web) | After (PWA) | 改善 |
|------|--------------|-------------|------|
| **初回表示** | 1.5s | 1.5s | - |
| **再訪問時** | 1.2s | **0.3s** | 75% 改善 |
| **オフライン** | ❌ エラー | ✅ キャッシュ表示 | - |
| **インストール率** | 0% | 目標 10-15% | - |

---

## 10. Philosophy Alignment

PWA化は、開発哲学と完全に一致します:

✅ **UX First (2nd Priority)** - アプリとしての体験をWeb技術で実現
✅ **AI-Era Architecture (3rd Priority)** - オフラインでも機能し続ける
✅ **Open & Reproducible (4th Priority)** - Web標準技術で、誰でも再現可能
✅ **Efficiency Trade-offs (5th Priority)** - キャッシュによる高速表示

**Zero PII Architecture との整合:**
- キャッシュには公開データのみ保存
- Clerk認証情報はキャッシュしない
- 侵害されても「公開済みデータ」のみ
