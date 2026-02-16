# 開発ログ（DEV_LOG）

作業中の気づき、エラー、解決方法などを記録します。

---

## 2026-02-10

### セットアップ
- **10:XX** - 作業ブランチ `feat/content-types-organization` を作成
- **10:XX** - 作業用ディレクトリ `.work/` を作成、.gitignore に追加
- **10:XX** - PLAN.md, TASK.md, DEV_LOG.md を作成

### 設計の決定
- **シンプルな実装を採用**: 当初提案されていた「メタデータ分離型MDXパターン」ではなく、シンプルなMDX + frontmatterのアプローチを採用
- **理由**: DX原則（疎結合、メンテナンス性）との整合性、実装の複雑性回避

---

## 今後の作業ログ

### Phase 1: Content Collections定義 ✅
- **開始時刻**: 2026-02-10 午前
- **終了時刻**: 2026-02-10 午前
- **メモ**:
  - 4つの新しいコレクション（journal, announcements, documents, resolution-materials）を追加
  - Zodスキーマを定義
  - コンテンツディレクトリを作成
  - コミット: 2f13504, 6007196

### Phase 2: Keystatic設定 ✅
- **開始時刻**: 2026-02-10 午前
- **終了時刻**: 2026-02-10 午前
- **メモ**:
  - journal, announcements, resolution-materials をKeysticに追加
  - GitHub storage（branchPrefix: proposal/）を維持
  - documentsは手動管理のため、Keystaticには未追加
  - コミット: cee10c1

### Phase 3: ページ実装 ✅
- **開始時刻**: 2026-02-10 午前
- **終了時刻**: 2026-02-10 午前
- **メモ**:
  - Journal: 一覧・詳細ページ作成（コミット: 59b93f4）
  - Announcements: 一覧・詳細ページ作成、タイプ別バッジ（コミット: f8240e0）
  - Documents: 一覧（タブ切り替え）・詳細ページ（目次自動生成）作成（コミット: 80473e4）
  - Resolution Materials: 詳細ページ作成、Resolutionsページに統合（コミット: df18e16）

### Phase 4: 既存ページの更新 ✅
- **開始時刻**: 2026-02-10 午前
- **終了時刻**: 2026-02-10 午前
- **メモ**:
  - Officeページに活動日誌への入口追加（コミット: 23b4531）
  - Governanceページにドキュメントへの入口追加（Living Handbookをアクティブ化）（コミット: a36a0c7）

### Phase 5: テストとレビュー ✅
- **開始時刻**: 2026-02-10 午前
- **終了時刻**: 2026-02-10 午前
- **メモ**:
  - `npm run build` 成功
  - 警告: コレクションが空（正常、コンテンツがまだないため）
  - すべてのページが正常に生成された

---

## エラーログ

### エラー1: Docker/Coolify環境でのClerk認証ミドルウェア500エラー
- **日時**: 2026-02-10 (feat/auth-integration)
- **エラー内容**:
  - プレビューサーバー（Coolify）で `/mydesk` にアクセスすると HTTP 500 エラー
  - ローカル開発環境では正常動作
  - Docker コンテナ環境でミドルウェアが環境変数にアクセスできない

- **試行錯誤の過程**:
  1. **試行1**: `process.env` と `import.meta.env` の両方をチェック → 失敗（500エラー継続）
  2. **試行2**: `PREVIEW_MODE=true` でミドルウェア全体をスキップ → Coming Soon が表示されるが認証機能が無効
  3. **試行3**: mydesk.astro の `PREVIEW_MODE` チェックを削除 → 500エラーに戻る（`Astro.locals.auth()` が存在しない）

- **解決方法**:
  - **`clerkMiddleware` は常に実行し、`protect()` の呼び出しだけをスキップ**
  - middleware.ts で以下のように修正:
    ```typescript
    const authMiddleware = clerkEnabled
      ? clerkMiddleware((auth, context) => {
          if (!isPreview && isProtectedRoute(context.request)) {
            auth.protect();  // PREVIEW_MODE=true のときはスキップ
          }
        })
      : (_context, next) => next();
    ```
  - これにより:
    - `Astro.locals.auth()` が常に利用可能（500エラー回避）
    - PREVIEW_MODE では未認証でもページにアクセス可能（テスト用）
    - Clerk の認証機能は正常に動作

- **重要な学び**:
  - **Docker/Coolify環境では middleware で環境変数アクセスが不安定**
  - **ミドルウェア全体をスキップすると `Astro.locals.*` が利用不可になる**
  - **ミドルウェアは実行し、特定の処理だけをスキップする設計が重要**
  - 本番環境（Nginx + Node）では問題なし、プレビュー環境のみの回避策として `PREVIEW_MODE` フラグを使用

### エラー2: Clerk Development環境での外部ドメイン制限
- **日時**: 2026-02-10 (feat/auth-integration)
- **エラー内容**:
  - プレビューサーバー（pre.nexs.or.jp）で Clerk ログインモーダルが表示されない
  - ブラウザコンソールで Clerk の API リクエストが失敗
  - `POST https://sweet-jay-9.clerk.accounts.dev/v1/environment` などが失敗

- **原因**:
  - **Clerk の Development 環境では `localhost` 以外のドメインを許可する設定項目が存在しない**
  - Development keys (`pk_test_...`) は localhost 専用
  - 外部ドメイン（pre.nexs.or.jp）からのリクエストが CORS でブロックされる

- **解決方法**:
  - **Production インスタンスを作成**
  - Clerk Dashboard で以下を設定:
    1. Production インスタンス作成
    2. `pre.nexs.or.jp` を Secondary App として登録
    3. DNS 設定: CNAME レコードを追加（Clerk が指定するドメイン）
  - 環境変数を Production keys に変更:
    - `pk_test_...` → `pk_live_...`
    - `sk_test_...` → `sk_live_...`
  - Coolify で環境変数を更新し、再デプロイ

- **重要な学び**:
  - **Clerk の Development 環境は localhost 専用**（外部ドメイン設定なし）
  - **プレビュー/ステージング環境でも Production インスタンスが必要**
  - DNS 設定（CNAME）の反映には時間がかかる（数分〜数時間）
  - Production keys を使っても、テスト用のユーザー管理は可能

### エラー3: Astro + React Islands の Hydration 失敗
- **日時**: 2026-02-10 (feat/auth-integration)
- **エラー内容**:
  - Clerk ログインボタン（`SignInButton`）をクリックしても反応なし
  - Elements タブで確認すると、`<button>` タグのみで SignInButton のラッパーが存在しない
  - React の hydration が全く動いていない

- **試行錯誤の過程**:
  1. **試行1**: `client:load` を使用 → 反応なし（静的 HTML として出力）
  2. **試行2**: `client:only="react"` に変更 → 反応なし（依然として静的）
  3. **試行3**: ページソースとネットワークタブを確認 → React ファイルは読み込まれているが、LoginPrompt が静的

- **原因**:
  - **`.astro` ファイル内で React コンポーネントを import しても、Astro が静的 HTML として出力**
  - `client:load` や `client:only` ディレクティブは、React コンポーネント自体に指定する必要がある
  - `.astro` ファイル内で `<SignInButton client:only="react">` のように書いても、親が `.astro` なら静的化される

- **解決方法**:
  - **LoginPrompt を完全な React コンポーネント（.tsx）として実装**
  - `src/components/mydesk/LoginPrompt.astro` → `LoginPrompt.tsx` に変更
  - mydesk.astro から以下のように呼び出す:
    ```astro
    import LoginPrompt from '@/components/mydesk/LoginPrompt';

    {content === 'login-prompt' && <LoginPrompt client:only="react" />}
    ```
  - これにより、LoginPrompt 全体が React Island として認識され、正しく hydrate される

- **重要な学び**:
  - **Astro の React Islands は、.tsx/.jsx ファイルとして実装する必要がある**
  - **`.astro` ファイル内で React コンポーネントを使っても、デフォルトは静的 HTML**
  - **インタラクティブな React コンポーネントは .tsx で実装し、.astro から client:* で呼び出す**
  - `client:load` vs `client:only`:
    - `client:load`: SSR + クライアント hydration（初回は静的 HTML）
    - `client:only="react"`: 完全にクライアントサイドのみでレンダリング（今回はこれが正解）

### エラー4: sessionClaims に publicMetadata が含まれない
- **日時**: 2026-02-10 (feat/auth-integration)
- **エラー内容**:
  - Clerk Dashboard で publicMetadata に `{"role": "admin"}` を設定
  - ログインしても「ロール未設定」のページが表示される
  - デバッグログで確認すると、sessionClaims には標準的な JWT クレーム（sub, iss, exp など）のみで、publicMetadata が含まれていない

- **原因**:
  - **Clerk の sessionClaims にはデフォルトで publicMetadata が含まれない**
  - JWT トークンは最小限のクレームのみを含む（セキュリティとサイズの最適化）
  - メタデータを含めるには、Clerk Dashboard で Session Token Template を設定する必要がある

- **解決方法**:
  - **sessionClaims からメタデータを取得するのではなく、サーバーサイドで直接取得**
  - `clerkClient(Astro).users.getUser(userId)` でユーザー情報を取得
  - `user.publicMetadata` から role を取得
  ```typescript
  const { userId } = Astro.locals.auth();
  const user = await clerkClient(Astro).users.getUser(userId);
  const role = getRoleFromMetadata(user.publicMetadata);
  ```

- **重要な学び**:
  - **sessionClaims は JWT トークンで、サイズを最小化するため publicMetadata は含まない**
  - **メタデータが必要な場合は、サーバーサイドで clerkClient を使って取得**
  - この方法は追加の API リクエストが発生するが、最新のデータが取得できる（キャッシュ問題なし）
  - Session Token Template を使えば JWT に含めることも可能だが、トークンサイズが増加する

### エラー5: clerkClient の context エラー
- **日時**: 2026-02-10 (feat/auth-integration)
- **エラー内容**:
  - `clerkClient().users.getUser(userId)` を実行すると 500 エラー
  - サーバーログ: `TypeError: Cannot use 'in' operator to search for 'locals' in undefined`
  - エラー箇所: `getContextEnvVar` → `getSafeEnv` → `createClerkClientWithOptions`

- **原因**:
  - **`clerkClient()` は Astro の context を必要とする**
  - context がないと、環境変数や locals にアクセスできない
  - 引数なしで呼び出すと、context が undefined になり、エラーが発生

- **解決方法**:
  - **`clerkClient()` ではなく `clerkClient(Astro)` として Astro context を渡す**
  ```typescript
  // ❌ NG
  const user = await clerkClient().users.getUser(userId);

  // ✅ OK
  const user = await clerkClient(Astro).users.getUser(userId);
  ```

- **重要な学び**:
  - **Astro のページコンポーネントから clerkClient を使う場合、Astro object を渡す必要がある**
  - API routes や middleware では context が自動的に渡されるが、ページコンポーネントでは明示的に渡す必要がある
  - Astro context には locals、env、request などが含まれる

### 補足: スマホからのアクセス
- **現象**: スマホのブラウザで初回アクセス時に表示されない
- **原因**: ブラウザのキャッシュ
- **解決**: シークレットモード/プライベートブラウジングで正常動作、またはキャッシュクリア
- **教訓**: 開発中はキャッシュの影響を考慮し、シークレットモードでテストする

### エラー6: 本番環境でのポート競合（adapter mode 問題）
- **日時**: 2026-02-12 (hotfix/clerk-adapter-mode)
- **エラー内容**:
  - 本番環境デプロイ時に `Error: listen EADDRINUSE: address already in use 0.0.0.0:8080`
  - コンテナが起動できず、ヘルスチェック失敗

- **原因**:
  - adapter mode を `standalone` に変更したことで、Astro が自前でサーバー起動
  - しかし既存の `server.mjs`（Basic Auth + 静的ファイル配信）も起動しようとした
  - 両方が同じポート 8080 を取り合って競合

- **解決方法**:
  - **adapter mode を `middleware` に戻す**
  - `server.mjs` がサーバーを起動し、Astro はハンドラとして組み込まれる形に戻す
  ```typescript
  adapter: node({
    mode: 'middleware',  // server.mjs で起動
  })
  ```

- **重要な学び**:
  - **既存のインフラ（server.mjs）との互換性を考慮する**
  - `standalone` は Astro が全てを管理する場合に使う
  - `middleware` は既存のサーバー（Express/Fastify など）に組み込む場合に使う
  - 外部AI の提案を盲目的に適用せず、既存コードとの整合性を確認する

### エラー7: リダイレクトループ（isAuthenticated が undefined）
- **日時**: 2026-02-12 (hotfix/clerk-adapter-mode)
- **エラー内容**:
  - ログイン後、リダイレクトが連続して発生（ループ）
  - サーバーログ: `isAuthenticated: undefined`, `userId: 'user_xxx'`
  - ユーザーは認証済みなのに、ログインページにリダイレクトされ続ける

- **原因**:
  - **Clerk の Astro 実装では `auth()` から `isAuthenticated` が取得できない**
  - `isAuthenticated` が `undefined` なので、条件分岐で false 扱いになる
  - 認証済みなのに未認証と判定され、`redirectToSignIn()` が繰り返される

- **解決方法**:
  - **`isAuthenticated` ではなく `userId` の有無で判定**
  ```typescript
  // ❌ NG
  const { isAuthenticated } = auth();
  if (!isAuthenticated) { ... }

  // ✅ OK
  const { userId } = auth();
  if (!userId) { ... }
  ```

- **重要な学び**:
  - **公式ドキュメントの例が全てのフレームワークで同じとは限らない**
  - Astro では `userId` の有無で認証状態を判定する
  - デバッグログを追加して、実際の値を確認することが重要

### エラー8: パフォーマンス問題（getUser() の API 呼び出し）
- **日時**: 2026-02-12 (hotfix/clerk-adapter-mode)
- **現象**:
  - MyDesk ページの表示が遅い（もっさり感）
  - ページ遷移のたびに数秒かかる

- **原因**:
  - **毎回 `clerkClient(Astro).users.getUser(userId)` で API 呼び出し**
  - ネットワーク遅延が発生
  - ユーザー情報（publicMetadata）を取得するためだけに外部APIを叩いていた

- **解決方法**:
  - **Clerk Dashboard で Session Token に role を埋め込む設定**
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

- **重要な学び**:
  - **JWT トークンにカスタムクレームを埋め込むことでパフォーマンス改善**
  - Cookie サイズ制限（~4KB、実質1.2KB推奨）を考慮し、必要最小限のデータのみ埋め込む
  - セキュリティ: JWT は暗号化されていない（Base64エンコードのみ）、機密情報は入れない
  - ロール変更の反映遅延: Session Token の refresh まで古いロールが残る可能性

---

## 気づき・メモ

### Keystatic削除作業を通じた疎結合性の評価

**日時**: 2026-02-10

**評価結果: 疎結合性は非常に高い（優秀）**

#### 削除したファイル
- keystatic.config.ts
- src/pages/keystatic/[...params].astro
- src/pages/api/keystatic/[...params].ts
- astro.config.mjsのkeystatic()関数（独立したプラグイン）
- package.jsonから2パッケージ（237依存パッケージ削除）
- docs/guides/RESOLUTIONS_GUIDE.md

#### 影響を受けたファイル（修正が必要だった箇所）
1. **CLAUDE.md** - ドキュメント更新のみ（機能への影響なし）
2. **docs/02_ARCHITECTURE.md** - ドキュメント更新のみ
3. **docs/全体像.md** - ドキュメント更新のみ
4. **README.md** - ドキュメント更新のみ
5. **src/pages/governance/resolutions/index.astro** - 空状態メッセージの1行のみ修正

#### 疎結合性の評価ポイント

✅ **優れている点:**

1. **完全な機能分離**: Keystaticは独立したプラグインとして実装されていたため、削除が非常にスムーズ
   - astro.config.mjsでのkeystatic()関数は完全に独立
   - Content Collectionsは Keystatic に依存していない（Astro標準機能）
   - ページコンポーネントはContent Collectionsに依存するのみ

2. **依存関係の明確さ**:
   - Keystatic関連のコードは特定のディレクトリに集約
   - インポート文でgreｐすればすぐに影響範囲が分かる

3. **ドキュメントとコードの分離**:
   - 機能を削除してもコードは一切エラーなし
   - ドキュメント更新のみで対応完了

4. **データ層の独立性**:
   - Content Collections（`src/content/config.ts`）はKeysticに依存しない設計
   - MDXファイルは単なるファイルとして存在し、CMSツールに依存しない

⚠️ **改善の余地がある点:**

1. **空状態メッセージの hardcoding**:
   - `src/pages/governance/resolutions/index.astro` の空状態メッセージが直接Keystaticに言及
   - より一般的なメッセージにするか、設定ファイル化すべき
   - ただし、これは小さな問題（1行の修正で済んだ）

2. **ドキュメントの量**:
   - Keystaticに関するドキュメントが複数ファイルに散在
   - 集約されていればメンテナンスしやすかった
   - ただし、機能への影響はゼロ

#### 構造的な優秀さ

**なぜこれほど疎結合だったのか:**

1. **Astroのアーキテクチャ**: Content Collectionsという抽象化により、CMSツールから独立
2. **Islands Architecture**: UI層がデータ層から完全に分離
3. **プラグインシステム**: Keystaticは integrations 配列に追加するだけ（削除も同様に簡単）
4. **設定ファイルの分離**: keystatic.config.ts という独立した設定ファイル

#### 他の機能への示唆

この疎結合性は、今後他の機能を追加・削除する際の良いモデルになる：
- 機能は独立したプラグインとして実装
- データ層は標準的な抽象化（Content Collections）に依存
- UI層はデータ層のみに依存、特定のツールに依存しない

#### 電子署名システムへの示唆

今後実装予定の電子署名システムも、同様に疎結合に実装すべき：
- 独立したプラグインまたはライブラリとして
- Content Collectionsやページコンポーネントから独立
- 将来的に別の署名方式に変更しても、影響範囲を最小化

#### 結論

**疎結合性スコア: 9/10**

Keystaticの削除は非常にスムーズで、構造的な問題は一切見つからなかった。
唯一の問題は空状態メッセージの hardcoding だが、これは設計の問題ではなく実装の細部。

このプロジェクトは「WET over DRY」「疎結合」という哲学を実践できており、
機能の追加・削除が容易な優秀なアーキテクチャになっている。

### エラー9: Clerk Astro統合での useUser 非対応
- **日時**: 2026-02-15 (feat/ui-improvements)
- **エラー内容**:
  - デプロイ時に `"useUser" is not exported by "node_modules/@clerk/astro/dist/react/index.js"`
  - 開発環境では問題なかったが、本番ビルドで失敗
  - `src/components/auth/AuthStatus.tsx` で `useUser` フックを使用していた

- **原因**:
  - **`@clerk/astro/react` パッケージは `useUser` フックをエクスポートしていない**
  - 一般的な Clerk React 統合（`@clerk/clerk-react`）では `useUser` が使えるが、Astro 統合では別のAPI
  - 公式ドキュメントは React 用の例が多く、Astro 固有の制限に気づきにくい

- **解決方法**:
  - **`useUser` の代わりに `useAuth` フックを使用**
  ```typescript
  // ❌ NG (Astro では使えない)
  import { useUser } from '@clerk/astro/react';
  const { isSignedIn, isLoaded } = useUser();

  // ✅ OK (Astro で使える)
  import { useAuth } from '@clerk/astro/react';
  const { isSignedIn, isLoaded } = useAuth();
  ```
  - `useAuth` は `{ userId, isLoaded, isSignedIn }` を返し、`useUser` と同等の認証状態を取得できる

- **重要な学び**:
  - **Clerk Astro 統合は React 統合と API が異なる**
  - 使えるhook/コンポーネント: `useAuth`, `SignInButton`, `SignOutButton`, `UserButton` など
  - 使えない: `useUser`, `useSession` など（React専用）
  - Clerk のドキュメントは React が中心で、Astro 固有の制限は別途確認が必要
  - 開発環境で動いてもビルドで失敗することがある（import の検証タイミング）

---

## 2026-02-16

### Phase 0: 旧承認システム削除

- **ブランチ**: feat/digital-signature-flow
- **目的**: Git + Clerk MFAベースの旧承認システムを完全に除去し、DocuSealベースの電子署名システムに置き換える準備

#### 削除したファイル（Task 0-1）
- `src/lib/approval-types.ts`
- `src/lib/github.ts`
- `src/lib/hash.ts`
- `src/pages/api/governance/approve.ts`
- `src/pages/api/governance/approvals.ts`
- `src/pages/api/governance/audit-log.ts`
- `src/components/governance/ApprovalSection.tsx`
- `src/components/governance/AuditLogModal.tsx`
- `data/approvals/` ディレクトリ

#### 修正したファイル（Task 0-2）
- `src/pages/governance/resolutions/[slug].astro` — ApprovalSection, computeHash の除去
- `src/middleware.ts` — 承認APIルート保護の除去、createRouteMatcher の除去
- `src/content/config.ts` — resolutions スキーマから approvals フィールド除去

#### ドキュメント更新（Task 0-3）
- `CLAUDE.md` — Resolution Approval System セクション削除、Protected Routes 更新
- `.env.example` — GitHub Token セクション削除

#### 教訓
- 旧承認システムは疎結合に実装されていたため、削除がスムーズに完了
- ビルド確認で問題なし（依存関係の漏れなし）

---

## TODO（タスク外）

- [ ] トップページへの最新お知らせ表示（Phase 2）
- [ ] ドキュメント参照システムの高度な機能（必要性確認後）
- [ ] 検索機能（全コンテンツ対象）

---

## 質問・確認事項

### 質問1
- **日時**:
- **質問内容**:
- **回答**:
