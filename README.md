# nexs-web

Open-source web platform for nexs (Next Society Design Institute).

nexs（次世代社会デザイン研究機構）のWebサイトです。AI時代の社会システムを実証・還元するリサーチコレクティブのプラットフォームとして開発中です。

## Status

**開発中（MVP）** — 基本的なページ構造とガバナンス機能（議案管理）を構築している段階です。

## Setup

```bash
npm install
cp .env.example .env   # 必要に応じて値を設定
npm run dev             # http://localhost:4321
```

### Production build

```bash
npm run build
node dist/server/entry.mjs
```

Docker でのデプロイは `Dockerfile` を参照してください。

## Architecture

- **Astro 4** (hybrid mode) — 静的生成 + 必要な箇所のみ SSR
- **React** — Islands Architecture でインタラクティブコンポーネントのみ
- **Tailwind CSS** — モノクロ基調のモバイルファースト UI
- **Content Management** — AIエージェント（Claude Code、Gemini CLI）経由でMDXファイルを直接作成・編集
- **Clerk** — 認証（オプション。環境変数未設定時はスキップ）

詳細は [docs/02_ARCHITECTURE.md](./docs/02_ARCHITECTURE.md) を参照してください。

## Design principles

1. **Safety** — Zero PII: 自前サーバーに個人情報を保存しない
2. **OSS** — コードも設計判断も公開する
3. **UX** — モバイルファースト、グレースフルなフォールバック
4. **DX** — 疎結合、WET over DRY
5. **Code efficiency**

詳細は [docs/01_PHILOSOPHY.md](./docs/01_PHILOSOPHY.md) を参照してください。

## Documentation

| File | Content |
|---|---|
| [docs/00_READ_ME_FIRST.md](./docs/00_READ_ME_FIRST.md) | プロジェクト概要（AI・開発者向け） |
| [docs/01_PHILOSOPHY.md](./docs/01_PHILOSOPHY.md) | 設計哲学・意思決定の優先順位 |
| [docs/02_ARCHITECTURE.md](./docs/02_ARCHITECTURE.md) | 技術アーキテクチャ |
| [docs/04_UI_UX_GUIDELINES.md](./docs/04_UI_UX_GUIDELINES.md) | デザインシステム |

## Contributing

OSSプロジェクトとしてIssue・Pull Request を受け付けていますが、運営メンバーが少数のため十分な対応ができない場合があります。[docs/01_PHILOSOPHY.md](./docs/01_PHILOSOPHY.md) をご一読ください。

## License

[MIT](./LICENSE)
