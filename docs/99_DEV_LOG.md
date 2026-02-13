# 99. Development Log

**Version:** 1.0
**Created:** 2026-02 with Claude Code (Sonnet 4.5)

このドキュメントは、開発中に遭遇した重要なエラーと解決策を記録します。

---

## 記載方針

- Git履歴として残すべき重要なエラーと解決策のみを記載
- 他の開発者が同じ問題に遭遇した際の参考資料として機能
- ユーザー固有の作業ログは `.work/DEV_LOG.md` を参照

---

## Clerk認証関連のエラー

### Docker環境でのミドルウェア500エラー

**問題:**
- Docker/本番環境で認証ページにアクセスすると HTTP 500 エラー
- ローカル開発環境では正常動作
- ミドルウェアが環境変数にアクセスできない

**解決方法:**
- `clerkMiddleware` は常に実行し、`protect()` の呼び出しだけをスキップする設計に変更
- middleware.ts:
  ```typescript
  const authMiddleware = clerkEnabled
    ? clerkMiddleware((auth, context) => {
        if (!isPreview && isProtectedRoute(context.request)) {
          auth.protect();
        }
      })
    : (_context, next) => next();
  ```

**重要な学び:**
- ミドルウェア全体をスキップすると `Astro.locals.*` が利用不可になる
- ミドルウェアは実行し、特定の処理だけをスキップする設計が重要

### Clerk Development環境での外部ドメイン制限

**問題:**
- プレビュー/ステージング環境で Clerk ログインモーダルが表示されない
- Clerk の API リクエストが CORS でブロックされる

**原因:**
- Clerk の Development 環境では `localhost` 以外のドメインを許可する設定項目が存在しない
- Development keys (`pk_test_...`) は localhost 専用

**解決方法:**
- Production インスタンスを作成
- Clerk Dashboard で外部ドメインを Secondary App として登録
- DNS 設定: CNAME レコードを追加
- 環境変数を Production keys (`pk_live_...`) に変更

**重要な学び:**
- Clerk の Development 環境は localhost 専用（外部ドメイン設定なし）
- プレビュー/ステージング環境でも Production インスタンスが必要
- Production keys を使っても、テスト用のユーザー管理は可能

### clerkClient の context エラー

**問題:**
- `clerkClient().users.getUser(userId)` を実行すると 500 エラー
- エラーメッセージ: `TypeError: Cannot use 'in' operator to search for 'locals' in undefined`

**原因:**
- `clerkClient()` は Astro の context を必要とする
- 引数なしで呼び出すと、context が undefined になる

**解決方法:**
```typescript
// ❌ NG
const user = await clerkClient().users.getUser(userId);

// ✅ OK
const user = await clerkClient(Astro).users.getUser(userId);
```

**重要な学び:**
- Astro のページコンポーネントから clerkClient を使う場合、Astro object を渡す必要がある
- API routes や middleware では context が自動的に渡されるが、ページコンポーネントでは明示的に渡す必要がある

### リダイレクトループ（isAuthenticated が undefined）

**問題:**
- ログイン後、リダイレクトが連続して発生（ループ）
- サーバーログ: `isAuthenticated: undefined`, `userId: 'user_xxx'`
- ユーザーは認証済みなのに、ログインページにリダイレクトされ続ける

**原因:**
- Clerk の Astro 実装では `auth()` から `isAuthenticated` が取得できない
- `isAuthenticated` が `undefined` なので、条件分岐で false 扱いになる

**解決方法:**
```typescript
// ❌ NG
const { isAuthenticated } = auth();
if (!isAuthenticated) { ... }

// ✅ OK
const { userId } = auth();
if (!userId) { ... }
```

**重要な学び:**
- 公式ドキュメントの例が全てのフレームワークで同じとは限らない
- Astro では `userId` の有無で認証状態を判定する

### パフォーマンス問題（getUser() の API 呼び出し）

**問題:**
- 認証ページの表示が遅い
- ページ遷移のたびに数秒かかる

**原因:**
- 毎回 `clerkClient(Astro).users.getUser(userId)` で API 呼び出し
- ユーザー情報（publicMetadata）を取得するためだけに外部APIを叩いていた

**解決方法:**
- Clerk Dashboard で Session Token に role を埋め込む設定
- Configure → Sessions → Customize Session Token
- JSON: `{"role": "{{user.public_metadata.role}}"}`
- Astro 側で `sessionClaims.role` から直接取得（API 呼び出し不要）

```typescript
// ❌ 遅い
const user = await clerkClient(Astro).users.getUser(userId);
const role = getRoleFromMetadata(user.publicMetadata);

// ✅ 爆速
const role = sessionClaims?.role;
```

**重要な学び:**
- JWT トークンにカスタムクレームを埋め込むことでパフォーマンス改善
- Cookie サイズ制限（~4KB、実質1.2KB推奨）を考慮し、必要最小限のデータのみ埋め込む
- セキュリティ: JWT は暗号化されていない（Base64エンコードのみ）、機密情報は入れない

---

## Astro + React Islands関連のエラー

### Hydration 失敗

**問題:**
- Clerk ログインボタン（`SignInButton`）をクリックしても反応なし
- Elements タブで確認すると、`<button>` タグのみで SignInButton のラッパーが存在しない
- React の hydration が全く動いていない

**原因:**
- `.astro` ファイル内で React コンポーネントを import しても、Astro が静的 HTML として出力
- `client:load` や `client:only` ディレクティブは、React コンポーネント自体に指定する必要がある

**解決方法:**
- LoginPrompt を完全な React コンポーネント（.tsx）として実装
- `src/components/mydesk/LoginPrompt.astro` → `LoginPrompt.tsx` に変更
- mydesk.astro から以下のように呼び出す:
  ```astro
  import LoginPrompt from '@/components/mydesk/LoginPrompt';

  {content === 'login-prompt' && <LoginPrompt client:only="react" />}
  ```

**重要な学び:**
- Astro の React Islands は、.tsx/.jsx ファイルとして実装する必要がある
- `.astro` ファイル内で React コンポーネントを使っても、デフォルトは静的 HTML
- インタラクティブな React コンポーネントは .tsx で実装し、.astro から client:* で呼び出す
- `client:load`: SSR + クライアント hydration（初回は静的 HTML）
- `client:only="react"`: 完全にクライアントサイドのみでレンダリング

---

## デプロイ関連のエラー

### 本番環境でのポート競合（adapter mode 問題）

**問題:**
- 本番環境デプロイ時に `Error: listen EADDRINUSE: address already in use 0.0.0.0:8080`
- コンテナが起動できず、ヘルスチェック失敗

**原因:**
- adapter mode を `standalone` に変更したことで、Astro が自前でサーバー起動
- しかし既存の `server.mjs`（Basic Auth + 静的ファイル配信）も起動しようとした
- 両方が同じポート 8080 を取り合って競合

**解決方法:**
- adapter mode を `middleware` に戻す
- `server.mjs` がサーバーを起動し、Astro はハンドラとして組み込まれる形に戻す
  ```typescript
  adapter: node({
    mode: 'middleware',  // server.mjs で起動
  })
  ```

**重要な学び:**
- 既存のインフラ（server.mjs）との互換性を考慮する
- `standalone` は Astro が全てを管理する場合に使う
- `middleware` は既存のサーバー（Express/Fastify など）に組み込む場合に使う

---

## アーキテクチャの評価

### 疎結合性の検証（Keystatic削除を通じて）

**背景:**
- Keystatic（CMSツール）を完全に削除する作業を実施
- 削除によって影響を受けた範囲を検証

**削除したファイル:**
- keystatic.config.ts
- src/pages/keystatic/[...params].astro
- src/pages/api/keystatic/[...params].ts
- astro.config.mjsのkeystatic()関数
- package.jsonから2パッケージ（237依存パッケージ削除）

**影響を受けたファイル:**
1. ドキュメント更新のみ（機能への影響なし）
2. src/pages/governance/resolutions/index.astro - 空状態メッセージの1行のみ修正

**評価結果: 疎結合性は非常に高い（9/10）**

**優れている点:**
- 完全な機能分離: Keystaticは独立したプラグインとして実装
- Content Collectionsは Keystatic に依存していない（Astro標準機能）
- ページコンポーネントはContent Collectionsに依存するのみ
- データ層の独立性: MDXファイルは単なるファイルとして存在し、CMSツールに依存しない

**構造的な優秀さの理由:**
1. Astroのアーキテクチャ: Content Collectionsという抽象化により、CMSツールから独立
2. Islands Architecture: UI層がデータ層から完全に分離
3. プラグインシステム: integrations 配列に追加するだけ（削除も同様に簡単）
4. 設定ファイルの分離: keystatic.config.ts という独立した設定ファイル

**他の機能への示唆:**
- 機能は独立したプラグインとして実装
- データ層は標準的な抽象化（Content Collections）に依存
- UI層はデータ層のみに依存、特定のツールに依存しない

---

## その他のTips

### ブラウザキャッシュの影響

**現象:**
- スマホのブラウザで初回アクセス時に表示されない

**原因:**
- ブラウザのキャッシュ

**解決:**
- シークレットモード/プライベートブラウジングで正常動作
- またはキャッシュクリア

**教訓:**
- 開発中はキャッシュの影響を考慮し、シークレットモードでテストする
