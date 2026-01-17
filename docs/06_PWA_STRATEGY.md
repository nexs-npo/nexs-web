# **06. Progressive Web App (PWA) Strategy**

「実験室をポケットに」- モバイルファーストを極限まで推し進めるPWA化戦略。

## **1. PWA 化の目的**

### **Why PWA?**

本プロジェクトのコアバリューとの整合性:

1. **Mobile First (UX 3rd Priority)**
   - スマートフォンのホーム画面にインストール可能
   - アプリストア不要で、Web の自由度を維持

2. **Resilience (DX 4th Priority)**
   - オフライン時も静的コンテンツ（プロジェクト情報、About）を閲覧可能
   - 自宅サーバーダウン時のフォールバック体験向上

3. **Open Source (2nd Priority)**
   - PWA は Web 標準技術。誰でも Fork して独自の PWA を作れる
   - App Store の審査不要で、即座にデプロイ可能

---

## **2. 実装方針**

### **A. Core Features**

| 機能 | 実装 | 優先度 |
|------|------|--------|
| **App Install** | Web App Manifest | **必須** |
| **Offline Fallback** | Service Worker (Workbox) | **必須** |
| **Static Caching** | Pre-cache HTML/CSS/JS | **必須** |
| **Dynamic Caching** | Runtime cache for API | 推奨 |
| **Push Notifications** | Web Push API | 将来検討 |
| **Background Sync** | 議論投稿の遅延送信 | 将来検討 |

### **B. Caching Strategy**

**疎結合の原則に従い、静的と動的を明確に分離する。**

```
Static Assets (Pre-cache on install):
  - HTML (index.html, /projects/*, /about)
  - CSS (Tailwind compiled output)
  - JS (Astro Islands bundles)
  - Icons, Fonts

Dynamic Data (Network First, fallback to cache):
  - Supabase API (/api/projects, /api/discussions)
  - Signals (/api/signals)

Always Network (No cache):
  - Clerk Authentication
  - Write operations (POST/PUT)
```

---

## **3. Manifest Configuration**

### **`public/manifest.json`**

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
  "categories": ["education", "research", "social"],
  "screenshots": [
    {
      "src": "/screenshots/mobile-home.png",
      "sizes": "750x1334",
      "type": "image/png"
    }
  ]
}
```

### **Design Notes**

- **theme_color: #000000** - ヘッダーの黒背景と統一
- **background_color: #fafafa** - bg-gray-50 と統一
- **maskable icons** - Android の Adaptive Icons に対応
- **screenshots** - PWA インストールプロンプトで表示される

---

## **4. Service Worker Strategy**

### **使用ツール: Workbox (Google製)**

Astro での実装:

```bash
npm install @astrojs/pwa
```

### **`astro.config.mjs`**

```javascript
import { defineConfig } from 'astro/config';
import pwa from '@astrojs/pwa';

export default defineConfig({
  integrations: [
    pwa({
      mode: 'production',
      base: '/',
      scope: '/',
      includeAssets: ['fonts/**/*', 'icons/**/*'],
      registerType: 'autoUpdate',
      manifest: {
        // manifest.json の内容を参照
      },
      workbox: {
        navigateFallback: '/',
        globPatterns: ['**/*.{css,js,html,svg,png,woff,woff2}'],
        runtimeCaching: [
          // Static HTML pages
          {
            urlPattern: /^https:\/\/nexs\.jp\/(about|projects)?$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pages-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1週間
              }
            }
          },
          // Supabase API (Network First)
          {
            urlPattern: /^https:\/\/supabase\.yourdomain\.com\/rest\/v1\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5分
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Clerk (Always Network - 認証データはキャッシュしない)
          {
            urlPattern: /^https:\/\/.*\.clerk\.accounts\.dev\/.*/,
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ]
});
```

---

## **5. Offline Fallback UI**

### **実装パターン**

自宅サーバーがダウン、またはユーザーがオフラインの場合:

```typescript
// src/lib/api.ts
export async function fetchProjects() {
  try {
    const response = await fetch(`${PUBLIC_SUPABASE_URL}/rest/v1/projects`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (error) {
    // Service Worker のキャッシュから取得を試みる
    const cachedData = await caches.match('/api/projects');
    if (cachedData) {
      return await cachedData.json();
    }
    // キャッシュもない場合は空配列 + エラーメッセージ
    return { data: [], error: 'オフラインのため、最新情報を取得できません' };
  }
}
```

### **UI での表示**

```tsx
// src/components/OfflineBanner.tsx
export default function OfflineBanner({ isOffline }) {
  if (!isOffline) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-100 px-4 py-2">
      <p className="text-xs text-yellow-900 text-center">
        ⚠️ オフラインモード - キャッシュされたデータを表示しています
      </p>
    </div>
  );
}
```

---

## **6. Install Prompt (A2HS)**

### **Add to Home Screen の促進**

iOS Safari と Android Chrome で異なる挙動:

**Android Chrome:**
- 自動的に「ホーム画面に追加」プロンプトが表示される（条件を満たせば）
- カスタムプロンプトの実装も可能

**iOS Safari:**
- 自動プロンプトなし
- ユーザーに「共有 → ホーム画面に追加」を案内する必要あり

### **実装例（初回訪問時のモーダル）**

```tsx
// src/components/InstallPrompt.tsx
export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // PWA未インストール かつ 初回訪問
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasSeenPrompt = localStorage.getItem('install-prompt-seen');

    if (!isStandalone && !hasSeenPrompt) {
      setTimeout(() => setShowPrompt(true), 3000);
    }
  }, []);

  const handleInstall = () => {
    localStorage.setItem('install-prompt-seen', 'true');
    // Android: deferredPrompt.prompt() を呼ぶ
    // iOS: 案内モーダルを表示
  };

  return showPrompt ? (
    <div className="fixed bottom-20 inset-x-4 bg-black text-white p-4 rounded-xl shadow-2xl z-50">
      <p className="text-sm font-bold mb-2">nexs をインストール</p>
      <p className="text-xs opacity-80 mb-3">ホーム画面から素早くアクセスできます</p>
      <button onClick={handleInstall} className="...">今すぐインストール</button>
    </div>
  ) : null;
}
```

---

## **7. Performance Metrics**

PWA化によって期待される効果:

| 指標 | Before (Web) | After (PWA) | 改善 |
|------|--------------|-------------|------|
| **初回表示** | 1.5s | 1.5s | - |
| **再訪問時** | 1.2s | **0.3s** | 75% 改善 |
| **オフライン** | ❌ エラー | ✅ キャッシュ表示 | - |
| **インストール率** | 0% | 目標 15% | - |

---

## **8. Testing & Validation**

### **PWA Audit Tools**

1. **Lighthouse (Chrome DevTools)**
   - PWA スコア 90+ を目標
   - Installable, Offline-capable, HTTPS 必須

2. **PWA Builder (Microsoft)**
   - [pwabuilder.com](https://www.pwabuilder.com/) でスキャン
   - manifest, service worker の検証

### **手動テスト項目**

- [ ] Android Chrome でインストールプロンプトが表示される
- [ ] iOS Safari で「ホーム画面に追加」後、アプリとして起動
- [ ] 機内モードでも静的ページが表示される
- [ ] 自宅サーバーダウン時、優雅なフォールバックが動作
- [ ] キャッシュが適切に更新される（古いデータが残らない）

---

## **9. Future Enhancements**

### **Phase 2: Push Notifications**

新しい Signal や議論の返信時に通知:

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

### **Phase 3: Background Sync**

オフライン時の議論投稿を、オンライン復帰時に自動送信:

```javascript
navigator.serviceWorker.ready.then((registration) => {
  registration.sync.register('sync-discussions');
});
```

---

## **10. Philosophy Alignment**

PWA化は、以下の価値観と完全に一致する:

✅ **Mobile First (UX)** - アプリとしての体験を Web 技術で実現
✅ **Resilience (DX)** - オフラインでも機能し続ける
✅ **Open Source** - Web 標準技術で、誰でも再現可能
✅ **Performance (UX)** - キャッシュによる爆速表示

「社会をデザインする、柔らかな実験場」を、ユーザーのポケットに届ける。
