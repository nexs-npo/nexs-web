# chore/slim-design-snapshots

**Branch:** chore/slim-design-snapshots
**Status:** draft
**Current state:** Codex によるロジックレビュー追記済み。`git diff main...HEAD` 上で `snapshot.js` の変更が確認できず、Implementation に記載された意図との対応関係は未検証のまま。
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

## Resolution
