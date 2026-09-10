# Copilot Instructions

This repository is a pnpm monorepo for **doocs/md**, a WeChat Markdown editor. Canonical agent guidance lives in [AGENTS.md](../AGENTS.md); keep this file aligned with it.

- **Node:** `>=22.22.2` (`.nvmrc`: v22.22.2)
- **Package manager:** pnpm (`packageManager` in the root `package.json`)
- **npm registry:** https://registry.npmmirror.com (`.npmrc`)

## Build, Test, and Lint

### Global Commands

- **Install:** `pnpm install`
- **Lint (ESLint + Prettier):** `pnpm run lint`
- **Type Check:** `pnpm run type-check`
- **Tests:** `pnpm run test` (`@md/shared`, `@md/core`, `@md/web`, `@md/api`)

### Web App (`@md/web`)

- **Development Server:** `pnpm web dev`
- **Production Build:** `pnpm web build`
- **Browser Extension:** `pnpm web ext:zip` (WXT; Chrome) / `pnpm web firefox:zip`

### Other Workspaces

- **API (`@md/api`):** `pnpm api dev` / `pnpm api test`
- **VS Code (`doocs-md`):** `pnpm vscode compile` / `pnpm vscode package`
- **CLI (`@doocs/md-cli`):** `pnpm run build:cli`
- **MCP (`@md/mcp-server`):** `pnpm mcp dev`
- **uTools (`@md/utools`):** `pnpm utools:package`

## High-Level Architecture

### Monorepo Structure

- **`apps/web`**: Vue 3 + Vite + Pinia + Tailwind CSS 4. Web app and browser extension (WXT).
- **`apps/api`**: Cloudflare Workers + Hono + D1 (auth, cloud sync, billing, upload, share, marketplace, emoji).
- **`apps/vscode`**: VS Code extension (webpack). Marketplace ID: `doocs.doocs-md`.
- **`apps/utools`**: uTools plugin packaging shell (artifacts from `@md/web`).
- **`packages/core`**: Markdown renderer (`marked` + custom extensions, theme CSS variables).
- **`packages/shared`**: Shared config, types, CodeMirror wrapper, theme CSS.
- **`packages/config`**: Shared TypeScript config.
- **`packages/md-cli`**: Published npm CLI that serves the built web app.
- **`packages/mcp-server`**: MCP tools (`render_markdown`, `list_themes`, `list_colors`).
- **`docs/examples/wechat-openapi-worker/`**: standalone WeChat OpenAPI proxy (not in the pnpm workspace).

Details: [docs/architecture.md](../docs/architecture.md).

### Key Technologies

- **Frontend:** Vue 3 (Composition API), Pinia, Tailwind CSS 4 + PostCSS
- **Editor:** CodeMirror 6
- **Markdown:** `marked` in `@md/core`; `juice` inlines CSS for WeChat paste; `isomorphic-dompurify` sanitizes output
- **Web build:** Vite 8; extension build: WXT
- **API:** Hono on Cloudflare Workers, D1
- **i18n (web only):** `vue-i18n` — zh-CN, zh-TW, en-US, ja-JP

## Key Conventions

### Development Patterns

- **`@md/core` and `@md/shared` export TypeScript source** (`src/index.ts`). Do not pre-build them; consumers (Vite/webpack) compile them.
- **UI:** Shadcn-Vue components in `apps/web/src/components/ui`. Prefer these over raw HTML/CSS.
- **Stores:** Domain Pinia stores in `apps/web/src/stores` (`useEditorStore`, `useThemeStore`, `useUIStore`, `useLocaleStore`, …).
- **Comments:** English only. Explain non-obvious why / constraints; do not narrate the next line. Do not rewrite user-facing i18n copy unless asked.

### Internationalization (`@md/web`)

- Messages: `apps/web/src/i18n/messages/{zh-CN,zh-TW,en-US,ja-JP}/`
- Components: `useI18n()` + `t('key')`. Stores/utils: `@/i18n/translate`.
- New user-visible strings must be added in all four locales. VS Code, uTools, CLI, and MCP are not localized.

### Styling & Theming

- Theme injection: `@md/core/src/theme` (CSS variables).
- Theme CSS sources: `packages/shared/src/configs/theme-css/` (`default.css`, `grace.css`, `simple.css`).

### Markdown Extensions

- Implement new Markdown features as extensions in `packages/core/src/extensions`.
- Register them in the renderer configuration.

### Dependencies

- Shared toolchain versions live in `pnpm-workspace.yaml` `catalog`; workspace packages use `"catalog:"`.
- Root `package.json` is publishable (`private: false`) — use plain semver there, not `catalog:`.
- Prettier is pinned to **2.8.8**. Do not remove security `overrides` unless upstream fixed the CVE.
- If a patched dependency is upgraded, update the matching file in `patches/` and `patchedDependencies`.

### Git Conventions

- **Commit messages and PR titles:** Conventional Commits, **English** (`feat`, `fix`, `docs`, `chore`, …).
- **Branches:** `feat/description`, `fix/description`, `docs/description`; other types use `<type>/`.
- Never commit on `main`. Follow `.github/pull_request_template.md` when opening a PR.

### Agent Skills

Canonical workflows: `.agents/skills/` (`git-commit`, `create-pr`, `wechat-svg`). Claude Code discovers them via git symlinks under `.claude/skills/`.
