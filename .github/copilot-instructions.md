# Copilot Instructions

This repository is a pnpm monorepo containing a Vue 3 web application, a VSCode extension, and a core markdown rendering library.

## Build, Test, and Lint

### Global Commands
- **Install Dependencies:** `pnpm install`
- **Lint (ESLint + Prettier):** `pnpm run lint`
- **Type Check (Vue/TS):** `pnpm run type-check`

### Web App (@md/web)
- **Development Server:** `pnpm web dev`
- **Build for Production:** `pnpm web build`
- **Build Browser Extension:** `pnpm web ext:zip` (uses WXT)

### VSCode Extension (@md/vscode)
- **Development:** `pnpm vscode`

### CLI (@doocs/md-cli)
- **Build CLI:** `pnpm run build:cli`

## High-Level Architecture

### Monorepo Structure
- **apps/web**: The main application. Built with Vue 3, Vite, Pinia, and Tailwind CSS. It functions as both a web app and a browser extension (via WXT).
- **packages/core**: The markdown rendering engine. It wraps `marked` and implements custom extensions (Mermaid, PlantUML, Ruby, etc.) and theme injection.
- **packages/shared**: Shared utilities and configurations.
- **packages/md-cli**: A CLI wrapper that serves the built web application.

### Key Technologies
- **Frontend Framework:** Vue 3 (Composition API)
- **Build System:** Vite
- **State Management:** Pinia
- **Styling:** Tailwind CSS + Custom CSS Variables for themes.
- **Markdown Parsing:** `marked` (in `@md/core`)
- **Editor Component:** CodeMirror 6
- **Extension Framework:** WXT (Web Extension Tools)

## Key Conventions

### Development Patterns
- **Direct TypeScript Imports:** The `@md/core` and `@md/shared` packages export TypeScript source files directly (`src/index.ts`). Do not attempt to build these packages separately; they are compiled by the consumer's build tool (Vite).
- **UI Components:** The project uses Shadcn-Vue style components located in `apps/web/src/components/ui`. Prefer using these over raw HTML/CSS.
- **Store Structure:** State is divided into domain-specific Pinia stores (e.g., `useEditorStore`, `useThemeStore`, `useUiStore`) located in `apps/web/src/stores`.

### Styling & Theming
- **Theme Injection:** Theming is handled by `@md/core/src/theme`. Themes are applied by injecting CSS variables into the DOM.
- **CSS processing:** Uses PostCSS and Tailwind. Global styles are in `apps/web/src/assets`.

### Markdown Extensions
- **Implementation:** New markdown features should be implemented as extensions in `@md/core/src/extensions`.
- **Registration:** Extensions must be registered in the renderer configuration.

### Git Conventions
- **Commit Messages:** Follow Conventional Commits (`feat`, `fix`, `docs`, `chore`, etc.).
- **Branch Naming:** `feat/description`, `fix/description`.

### WeChat (公众号) 兼容性
复制到公众号后台时，CSS 通过 juice 内联。**公众号编辑器不支持以下 CSS 特性**，主题开发时必须注意：

- **`::after` / `::before` 伪元素** — 公众号会完全剥离。`content` 属性中的 unicode 转义（如 `\25A0`）会被 juice 拆成乱码。需要在 `apps/web/src/services/export/clipboard.ts` 的 `processPseudoElementsForWeChat()` 中转成真正的 HTML 元素。
- **`::first-letter` 伪元素** — 公众号不支持。需要在 `processFirstLetterForWeChat()` 中转成 `<span>` 包裹首字。
- **`display: inline-block` + `margin: auto`** — 不会水平居中。需要改成 `display: block; width: fit-content; margin-left: auto; margin-right: auto`。
- **CSS 变量（`var(--xxx)`）** — juice 的 `resolveCSSVariables: false`，不解析变量。复制流程中通过字符串替换手动处理关键变量。
- **`hsl(var(--foreground))`** — 替换为 `#3f3f3f`。

**新增主题时**，如果使用了伪元素（`::after`、`::before`、`::first-letter`），必须在 `clipboard.ts` 中添加对应的公众号兼容处理，否则复制后效果丢失。
