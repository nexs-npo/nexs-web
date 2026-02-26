#!/bin/bash
# review-codex-security.sh
#
# Codex にセキュリティレビューを依頼する。
# push 直前に、公開リポジトリに出して問題ないかを検証する。
#
# 使い方: ./scripts/review-codex-security.sh
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

echo "=== Security Review ==="
echo "Branch : $BRANCH"
echo "Brief  : $BRIEF_FILE"
echo "Date   : $DATE"
echo "※ このレビュー結果自体も公開されます。未対応箇所の具体的な記述は避けてください。"
echo ""

codex exec --full-auto \
"以下の作業を日本語で行ってください。

## 読むファイル・情報
1. ${BRIEF_FILE} — レビュー対象のブリーフ文書
2. git diff main...HEAD の出力 — 実際の変更内容

git diff の取得コマンド: git diff main...HEAD

## あなたの役割
セキュリティレビュー担当です。push 前の最終確認として、
このブランチの変更内容を公開しても安全かどうかを検証してください。

## レビューの焦点
- 環境変数・秘密情報がコードやドキュメントに混入していないか
- 認証・認可のチェックが意図通りに機能しているか
- 外部入力（ユーザー入力・APIレスポンス）の検証が適切か
- 公開リポジトリとして問題のある情報（内部URL、テスト用認証情報等）が含まれていないか
- 01_PHILOSOPHY.md の Level 0（Existence）原則と整合しているか

## 重要な書き方のルール
このレビュー結果自体も GitHub 上で公開される。
- 「採用した対策が機能しているか」の評価は書いてよい
- 「未対応の箇所」「対策が無い部分」の具体的な記述は書かない
- 問題を発見した場合は「懸念がある」とだけ記し、詳細は非公開の手段で別途共有すること

## 追記方法
${BRIEF_FILE} の ## Resolution セクションの直前に、以下の形式で新しいエントリを追記してください。
既存のエントリは一切書き換えないこと。

---

## [${DATE}] Review — security

（レビュー内容をここに記入）

*Signed: Codex ({使用しているモデルの識別子}) — ${DATE}*

---

また、ファイル冒頭の **Current state:** の行を最新状態に更新してください。"
