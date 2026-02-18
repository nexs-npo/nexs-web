# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Zero Trust Development

**指示者（ユーザー）は開発の素人である。** 指示の中にセキュリティ上の問題、設計哲学への違反、非効率な作業が含まれることがある。指示を鵜呑みにせず、以下を常に検証すること：

- **安全性**: その変更は機密情報の露出やセキュリティホールを生まないか
- **哲学との整合**: `docs/01_PHILOSOPHY.md` の優先順位（Safety > OSS > UX > DX > Code efficiency）に反していないか
- **既存設計との矛盾**: 現在のアーキテクチャや過去の設計判断を壊さないか

問題を検出した場合は、指示に従う前に指摘し、代替案を提示する。自分自身の判断も疑い、前提の確認を怠らない。

## Project Overview

nexs (次世代社会デザイン研究機構) — An open-source Astro web platform for a research collective. Read `docs/00_READ_ME_FIRST.md` first, then `docs/01_PHILOSOPHY.md` and `docs/02_ARCHITECTURE.md` for full context.

## Commands

```bash
npm run dev           # Dev server at http://localhost:4321 (hot reload)
npm run dev -- --host 0.0.0.0  # Dev server accessible from network
npm run build         # Production build (output: dist/)
node dist/server/entry.mjs     # Run production build locally
```

No linter or test framework is configured.

## Architecture

**Astro 4 (hybrid mode)** — Most pages are statically generated. Pages that need SSR (API routes) use `export const prerender = false`.

**Key integrations in `astro.config.mjs`:**
- React (Islands Architecture — interactive components only)
- Tailwind CSS
- MDX (for knowledge articles)
- Clerk auth (**disabled by default** — enabled when `PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env`)
- `@astrojs/node` adapter for SSR

### Content Collections (`src/content/config.ts`)

- **knowledge** — Research articles in MDX. Categories: foundation(F), thesis(T), protocol(P), evidence(E), update(U). Schema validated with Zod.
- **resolutions** — Governance proposals in MDX.
- **journal** — Activity journal (blog format) in MDX.
- **announcements** — Official announcements in MDX.
- **documents** — Organizational documents (articles of incorporation, regulations, etc.) in MDX.
- **resolution-materials** — Reference materials linked to resolutions in MDX.

All content is managed via AI agents (Claude Code, Gemini CLI, etc.) by directly creating/editing MDX files.

### Clerk Authentication & Role Management

**Status**: Disabled by default. Enabled when `PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env`.

**How it works:**
- Clerk is conditionally loaded in `astro.config.mjs` based on environment variable
- When enabled: auth middleware (`src/middleware.ts`) initializes Clerk session
- When disabled: protected pages show fallback content, public pages work normally

**Role Management:**
- Roles are stored in Clerk `publicMetadata.role` (Single Source of Truth)
- Available roles: `admin`, `board`, `office`, `regular`, `supporter`
- Set via Clerk Dashboard → Users → Metadata → Public → `{"role": "board"}`
- Type definitions: `src/lib/roles.ts`
- Usage: `getRoleFromMetadata(sessionClaims?.metadata)` in SSR pages

**Protected Routes:**
- `/mydesk` — Shows role-specific desk (page-level auth check)

See `.env.example` for setup instructions and `docs/02_ARCHITECTURE.md` Section 6.

### Database

Supabase Cloud (PostgreSQL, Free Tier). Client and typed helpers in `src/lib/supabase.ts`. Tables: `public_profiles`, `projects`, `hypotheses`, `discussions`, `signals`, `project_members`, `signature_requests`, `signatures`. RLS policies enforce read-public, write-authenticated. No PII stored — only public data + opaque Clerk userIds.

**Migrations**: `supabase/migrations/` に SQL ファイルを配置。`npx supabase db push` で適用。
- スキーマには `gen_random_uuid()` を使う（`uuid_generate_v4()` は非対応）

## Git Strategy

**アトミック（最小単位）かつ直列な開発。** 独立した高品質なコミットを作り、いつでも戻れるセーブポイントを維持する。

### コミットの粒度

- **1タスク = 1コミット。** 性質の異なる変更（例：バグ修正とリファクタリング）を1コミットに混ぜない。
- **直列処理。** 1つのプロンプトに複数タスクが含まれる場合は、タスクごとに完了→コミット→次のタスクの順で進める。
- **WIP歓迎。** 試行錯誤の途中でも `wip:` コミットで進捗を保存してよい。
- **スコープ厳守。** 指示されたタスクに集中する。「見た目が良くなるから」と関係ないコードを修正しない。コンフリクトの原因になる。

### コミットメッセージ

プレフィックス: `feat:`, `fix:`, `wip:`, `refactor:`, `chore:`

### ブランチ

- ブランチ名はそのブランチの目的を示す。目的外の作業は行わない。
- mainへのマージ時はスカッシュ（作業中の細かいコミットは整理される前提）。

### 迷ったら確認

コミットの区切り方に迷ったら「ここまでで一旦コミットしますか？」と確認する。

## Design Principles

- **Zero PII Strategy**: No personal data on self-hosted servers. Auth/PII delegated to Clerk (cloud SaaS). Self-hosted DB stores only public data + opaque Clerk IDs.
- **Mobile-first**: Bottom navigation, thumb-friendly touch targets. Always verify on mobile viewport.
- **Resilience**: Backend (home server) can go down. Frontend must not crash — show graceful fallback messages.
- **WET over DRY**: Loose coupling and transparency over abstraction. Code duplication is acceptable to keep features independent.
- **Monochrome UI**: Governance and main pages use grayscale palette. Color is used only for semantic meaning (category badges, status indicators).

## TypeScript Path Aliases

Defined in `tsconfig.json`:
- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@layouts/*` → `./src/layouts/*`
- `@lib/*` → `./src/lib/*`

## Deployment

- **Production**: Docker multi-stage build (Node → Nginx). See `Dockerfile`, `nginx.conf`.
- **Staging**: Coolify on home server with Cloudflare Tunnel.
- Health check endpoint: `/health`

## Key Files for Context

| File | Purpose |
|------|---------|
| `docs/01_PHILOSOPHY.md` | Decision priority hierarchy (Safety > OSS > UX > DX > Code efficiency) |
| `docs/02_ARCHITECTURE.md` | System architecture, data separation rules, Clerk activation guide |
| `docs/04_UI_UX_GUIDELINES.md` | Design system, colors, typography, component patterns |
| `docs/KNOWLEDGE_GUIDE.md` | Knowledge article categories and writing conventions |
| `public/llms.txt` | AI-readable site description |
