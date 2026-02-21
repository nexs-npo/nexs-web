#!/bin/bash
# review-codex-philosophy.sh
#
# Codex に哲学整合性レビューを依頼する。
# 実装意図が docs/01_PHILOSOPHY.md の Level 0-3 と整合しているかを検証する。
#
# 使い方: ./scripts/review-codex-philosophy.sh
# 作業中のブランチから brief ファイルを自動検出する。

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

echo "=== Philosophy Review ==="
echo "Branch : $BRANCH"
echo "Brief  : $BRIEF_FILE"
echo "Date   : $DATE"
echo ""

codex exec --full-auto \
"以下の作業を日本語で行ってください。

## 読むファイル
1. docs/01_PHILOSOPHY.md — このプロジェクトの設計原則（Level 0–3）
2. ${BRIEF_FILE} — レビュー対象のブリーフ文書

## あなたの役割
哲学整合性レビュー担当です。
直近の Implementation エントリを読み、意図が 01_PHILOSOPHY.md の原則と整合しているかを評価してください。

## レビューの焦点
- Level 0（Existence）: 攻撃面を不必要に増やしていないか、秘密情報の扱いは適切か
- Level 1（Purpose）: UXを損なっていないか、モバイルファーストの観点は守られているか
- Level 2（Method）: コンテキストの局所性は保たれているか、爆発半径は小さいか
- Level 3（Assurance）: 検証可能な形になっているか

## 書き方のルール
- コードの細部ではなく「なぜその判断を選んだか」の根拠への評価に集中する
- セキュリティ上の抜けや未対応箇所の具体的な記述は避ける
- 採用した判断を評価する。採用しなかった対策の不在を指摘しない

## 追記方法
${BRIEF_FILE} の ## Resolution セクションの直前に、以下の形式で新しいエントリを追記してください。
既存のエントリは一切書き換えないこと。

---

## [${DATE}] Review — philosophy

（レビュー内容をここに記入）

*Signed: Codex ({使用しているモデルの識別子}) — ${DATE}*

---

また、ファイル冒頭の **Current state:** の行を最新状態に更新してください。"
