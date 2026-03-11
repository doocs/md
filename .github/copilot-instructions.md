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
