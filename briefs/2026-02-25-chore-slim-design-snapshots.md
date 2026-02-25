# chore/slim-design-snapshots

**Branch:** chore/slim-design-snapshots
**Status:** completed
**Current state:** Resolution 記入・クローズ。Codex の3指摘はいずれもドキュメントの説明不足と運用上の注意事項として処理。コード変更なし。
**Date:** 2026-02-25

## [2026-02-25] Task

`scripts/snapshot.js` が吐き出すHTMLスナップショットのCSSが膨大で扱いづらい。Tailwindのユーティリティクラス全量がインライン展開されており、AIエージェントがHTMLを読む際に構造が見えにくくなっている。CSSを削減して、スナップショットをコンパクトかつ実用的に保ってほしい。ファイルはGit管理対象なので作業ブランチを切ること。

*Signed: shin (human) — 2026-02-25*

## [2026-02-25] Implementation

### なぜ Vite 生成の `<style>` タグを丸ごと削除したか

Astro + Vite の開発サーバーは、Tailwind のユーティリティクラス全量を `<style data-vite-dev-id="...global.css">` タグとしてHTMLに埋め込む。これがスナップショットを数千行に膨らませていた主因。

代替として Tailwind CDN を使う方針を選んだ理由：
- スナップショットの目的は「HTMLの構造を読むこと」であり、ピクセル完全な再現は必須でない
- CDN はユーティリティクラスを網羅するため、見た目の大半は保持できる
- `$('style[data-vite-dev-id]').remove()` という一行で確実に取り除ける

却下した代替案：
- **外部CSSをそのままインライン維持**: 元々の巨大CSSが残るので本末転倒
- **PurgeCSS で使用クラスのみ抽出**: ビルドパイプラインへの依存が増え、スナップショットスクリプトの責務が肥大化する

### フォント再現の段階的対処

削除後に発生した問題と対処の順序：

1. **Google Fonts が消えた** → `<link rel="stylesheet">` で明示的に追加（`@import` が `data-vite-dev-id` タグの中にあったため）
2. **`body` のフォント指定が消えた** → 小さなインライン `<style>` で `body { font-family: 'Inter', 'Noto Sans JP', sans-serif }` を追加
3. **`font-sans` クラスが CDN のデフォルトスタックに解決される** → `tailwind.config` を CDN スクリプトの直後に渡すことで、プロジェクトのフォント設定を CDN に伝達

前提条件：この方法はフォント設定が `tailwind.config.mjs` に `theme.extend.fontFamily` として定義されている限り有効。フォント設定が変わったら `snapshot.js` の config も連動して更新が必要。

トレードオフ：完全な CSS 再現ではないため、カスタムアニメーション（`animate-fade-in-up`）や `@layer components` のカスタムクラス（`.card`, `.btn-primary`）は再現されない。スナップショットの用途（構造把握・AIによる参照）には許容範囲と判断。

*Signed: Claude Code (claude-sonnet-4-6) — 2026-02-25*

## [2026-02-25] Review — logic

`git diff main...HEAD` では、Implementation で言及されている `scripts/snapshot.js` の変更（`style[data-vite-dev-id]` の除去、Tailwind CDN 注入、フォント設定の補完）を確認できませんでした。  
このため、「スナップショットを軽量化しつつ実用的な見た目を維持する」という実装意図（Why）と、実際のコード変更（What）の対応関係が差分上で読み取れない状態です。

また、Implementation は「フォント設定が `tailwind.config.mjs` と連動していること」を成立条件として明示していますが、`main...HEAD` の範囲ではその連動を担保する変更点も確認できず、前提条件がコードとして維持されているか判断できません。

現時点で読み取れる事実として、差分の主対象はドキュメント更新とレビュー支援スクリプト追加であり、当該 Implementation の技術的判断を裏づける実装差分が同じ比較軸に存在していないため、意図と実装の整合は「一致」ではなく「判定不能」です。

*Signed: Codex (gpt-5-codex) — 2026-02-25*

## [2026-02-25] Review — logic

Implementation では「`style[data-vite-dev-id]` を除去して Tailwind CDN で置き換える」という意図が中心に説明されていますが、実コードはこれに加えて `script` 全削除と `link[rel="stylesheet"]` 全削除を先に実行しています。  
このため、軽量化の意図が「Vite 由来の肥大 CSS の抑制」なのか、「スタイル資産全般をいったん切り離す」なのか、削減スコープの意図が差分だけでは判別しづらい状態です。

また、Implementation は「`tailwind.config.mjs` のフォント設定と連動すること」を成立条件として述べていますが、差分上の `snapshot.js` はフォント定義をスクリプト内に固定値で記述しており、`tailwind.config.mjs` との同期をコード上で直接保証する構造にはなっていません。  
この点は、前提条件が「実装により担保される条件」なのか「運用で維持する条件」なのかが読み取りづらく、意図（Why）と実装の責務境界が曖昧に見えます。

さらに、Implementation 側で許容するとした非再現要素（カスタムアニメーション・`@layer components`）に対して、差分では `link rel="stylesheet"` の一律除去が加わっているため、ページごとの追加スタイル資産がある場合の挙動境界が明示されていません。  
結果として「どこまで見た目維持を期待する設計か」の期待値が、説明文と実装挙動の間で読み取りづらいままです。

*Signed: Codex (gpt-5-codex) — 2026-02-25*

## Resolution

Codex による2回のロジックレビューに対し、以下の判断を下す。

**点1（削除スコープの曖昧さ）**: コードは意図通り。`<script>` 全削除はスナップショットに JS が不要なため当然の選択、`<link rel="stylesheet">` 全削除は Tailwind CDN への差し替えに必要な前処理。brief の Implementation でその説明が不足していたが、コード上の問題はない。

**点2（tailwind.config.mjs との連動）**: フォント定義のハードコードは意図的なトレードオフ。`tailwind.config.mjs` を動的に読み込む実装はスクリプトの責務を肥大化させるため採用しない。`tailwind.config.mjs` のフォント設定を変更した際は `snapshot.js` も連動して更新する、という運用上の注意事項として受け入れる。

**点3（ページ固有スタイルの境界）**: `PAGES` 配列の対象ページはすべて共通の Astro レイアウトを使用しており、ページ固有の外部スタイルシートは存在しない。実害なし、対応不要。

3点いずれもコードの修正は不要。ドキュメント上の説明不足と運用上の注意事項として処理しクローズとする。

*Signed: shin (human) + Claude Code (claude-sonnet-4-6) — 2026-02-25*
