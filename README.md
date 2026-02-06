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
- **Keystatic** — Governance 議案の CMS（GitHub storage + `proposal/` branch prefix）
- **Clerk** — 認証（オプション。環境変数未設定時はスキップ）

詳細は [docs/11_SYSTEM_ARCHITECTURE.md](./docs/11_SYSTEM_ARCHITECTURE.md) を参照してください。

## Design principles

1. **Open Source** — 透明性による信頼。コードも設計判断も公開する
2. **Attack Surface Minimization** — 構造的な安全。個人情報を持たず、攻撃面を最小化する
3. **AI-Collaborative DX** — AIが迷わない構造。疎結合と局所性を優先する
4. **UX** — モバイルファースト、速度優先、ノイズ排除
5. **Efficiency Trade-offs** — 持続可能性のための冗長性を許容する

詳細は [docs/01_PHILOSOPHY.md](./docs/01_PHILOSOPHY.md) を参照してください。

## Documentation

| File | Content |
|---|---|
| [docs/00_READ_ME_FIRST.md](./docs/00_READ_ME_FIRST.md) | プロジェクト概要（AI・開発者向け） |
| [docs/01_PHILOSOPHY.md](./docs/01_PHILOSOPHY.md) | 設計哲学・意思決定の優先順位 |
| [docs/11_SYSTEM_ARCHITECTURE.md](./docs/11_SYSTEM_ARCHITECTURE.md) | 技術アーキテクチャ |
| [docs/13_UI_STYLE_GUIDE.md](./docs/13_UI_STYLE_GUIDE.md) | デザインシステム |

## Contributing

Issue・Pull Request を歓迎します。コードを書く前に [docs/01_PHILOSOPHY.md](./docs/01_PHILOSOPHY.md) を読んでください。

## License

[MIT](./LICENSE)
