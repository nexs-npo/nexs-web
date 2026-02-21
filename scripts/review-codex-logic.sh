#!/bin/bash
# review-codex-logic.sh
#
# Codex にロジック検証レビューを依頼する。
# コードが実装意図通りに動いているか、論理的な穴がないかを検証する。
# 実装中に「動作がおかしい」と感じたときに使う。
#
# 使い方: ./scripts/review-codex-logic.sh
# 作業中のブランチから brief ファイルと git diff を自動取得する。

set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD)
BRIEF_SLUG="${BRANCH//\//-}"
BRIEF_FILE="briefs/draft-${BRIEF_SLUG}.md"
DATE=$(date +%Y-%m-%d)

if [ ! -f "$BRIEF_FILE" ]; then
  echo "Error: Brief file not found: $BRIEF_FILE"
  echo "先に brief ファイルを作成してください。"
  exit 1
fi

echo "=== Logic Review ==="
echo "Branch : $BRANCH"
echo "Brief  : $BRIEF_FILE"
echo "Date   : $DATE"
echo ""

codex exec --full-auto \
"以下の作業を日本語で行ってください。

## 読むファイル・情報
1. ${BRIEF_FILE} — レビュー対象のブリーフ文書（特に直近の Implementation エントリ）
2. git diff main...HEAD の出力 — 実際の変更内容

git diff の取得コマンド: git diff main...HEAD

## あなたの役割
ロジック検証レビュー担当です。
「実装意図（Why）」と「実際のコード変更（What）」の間にギャップがないかを検証してください。

## レビューの焦点
- 実装意図とコードの実際の動作が一致しているか
- 考慮漏れのエッジケース・境界条件がないか
- 意図しない副作用が生まれていないか
- 型・戻り値・エラー伝播の扱いが意図と合っているか

## 書き方のルール
- コードの細部より「意図と実装のズレ」に集中する
- 「こう直すべき」より「この部分の意図が読み取れない」という形で指摘する
- セキュリティ上の抜けや未対応箇所の具体的な記述は避ける

## 追記方法
${BRIEF_FILE} の ## Resolution セクションの直前に、以下の形式で新しいエントリを追記してください。
既存のエントリは一切書き換えないこと。

---

## [${DATE}] Review — logic

（レビュー内容をここに記入）

*Signed: Codex ({使用しているモデルの識別子}) — ${DATE}*

---

また、ファイル冒頭の **Current state:** の行を最新状態に更新してください。"
