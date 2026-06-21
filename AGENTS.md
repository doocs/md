# Agent Instructions

本文件为 AI Agent（Claude Code、OpenCode、Cursor、Copilot 等）在本仓库中工作时提供统一入口。

## 项目概览

**doocs/md** — 一款微信 Markdown 编辑器，将 Markdown 渲染为微信公众号文章格式。支持自定义主题样式、多图床、AI 助手、浏览器扩展、**简体中文 / English 界面**等特性。

- **在线地址:** https://md.doocs.org
- **Node 版本:** >= 22.22.2（`.nvmrc`: v22.22.2）
- **包管理器:** pnpm（monorepo）
- **npm 镜像:** https://registry.npmmirror.com（`.npmrc`）

## Monorepo 结构

| 工作区           | 路径                  | 说明                                                                 |
| ---------------- | --------------------- | -------------------------------------------------------------------- |
| `@md/web`        | `apps/web`            | 主应用，Vue 3 + 浏览器扩展（WXT: Chrome/Firefox）                    |
| `doocs-md`       | `apps/vscode`         | VS Code 扩展（webpack 构建，marketplace ID: `doocs.doocs-md`）       |
| `@md/utools`     | `apps/utools`         | uTools 插件打包                                                      |
| `@md/core`       | `packages/core`       | 核心 Markdown 渲染引擎（marked + 自定义扩展）                        |
| `@md/shared`     | `packages/shared`     | 共享工具函数、配置、类型、编辑器配置                                 |
| `@md/config`     | `packages/config`     | TypeScript 配置基础文件                                              |
| `@doocs/md-cli`  | `packages/md-cli`     | CLI 工具（Express 服务托管构建产物）                                 |
| `@md/mcp-server` | `packages/mcp-server` | MCP 服务，为 AI Agent 暴露接口                                       |
| `@md/api`        | `apps/api`            | 后端 API：账户登录 + 云同步 + 计费（Cloudflare Workers + Hono + D1） |

独立示例（不在 workspace 内）：`docs/examples/wechat-openapi-worker/` — 微信公众号 OpenAPI 代理 Worker。

## 常用命令

### 根目录

```bash
pnpm install          # 安装所有依赖
pnpm start            # 等同于 `pnpm web dev`
pnpm run lint         # ESLint --fix 全项目检查
pnpm run type-check   # vue-tsc 类型检查
pnpm run build:cli    # 构建 web + 复制到 md-cli + npm pack
pnpm run release:cli  # 通过 scripts/release.js 发布 CLI
pnpm utools:package   # 打包 uTools 插件
pnpm run inspector    # node-modules-inspector 查看依赖树
pnpm link-claude-skills  # 链接 .claude/skills → .agents/skills
```

### Web 应用 (`@md/web`)

```bash
pnpm web dev          # 启动 Vite 开发服务器
pnpm web build        # 生产构建 + 类型检查
pnpm web build:h5-netlify   # 构建用于 Netlify 根目录部署
pnpm web build:analyze      # 构建并生成 rollup-plugin-visualizer 分析
pnpm web ext:dev      # WXT Chrome 扩展开发模式
pnpm web ext:zip      # 打包 Chrome 扩展
pnpm web firefox:dev  # WXT Firefox 扩展开发模式
pnpm web firefox:zip  # 打包 Firefox 扩展
pnpm web wrangler:dev    # Cloudflare Workers 开发
pnpm web wrangler:deploy   # Cloudflare Workers 部署
```

### VSCode 扩展

```bash
pnpm vscode compile   # webpack 编译
pnpm vscode watch     # webpack 监听
pnpm vscode build     # 生产 webpack 构建
pnpm vscode package   # vsce 打包
```

### CLI & MCP

```bash
pnpm cli <cmd>        # 在 @doocs/md-cli 中执行命令
pnpm mcp <cmd>        # 在 @md/mcp-server 中执行命令（render_markdown 等 MCP 工具）
pnpm mcp dev          # MCP Server 监听模式
```

`@md/mcp-server` 通过 stdio 暴露 `render_markdown`、`list_themes`、`list_colors` 等工具，配置见 [packages/mcp-server/README.md](./packages/mcp-server/README.md)、[`.vscode/mcp.json`](./.vscode/mcp.json) 与 [`.cursor/mcp.json`](./.cursor/mcp.json)。

## 架构

### 渲染管线

1. `@md/core` 封装 `marked`，实现自定义扩展（Mermaid、PlantUML、Ruby、KaTeX、TOC、alert 块、infographic、slider、markup、脚注）
2. `juice` 内联 CSS 以兼容微信
3. `isomorphic-dompurify` 净化输出
4. 主题系统（`@md/core/src/theme/`）注入 CSS 变量

### 构建系统

- **`@md/core` 和 `@md/shared` 直接导出 TypeScript 源码**（不预构建）。由消费方的构建工具（Vite/webpack）编译。
- Web 应用使用 Vite 8，VSCode 扩展使用 webpack，浏览器扩展使用 WXT

### 样式与主题

- Web 应用使用 Tailwind CSS 4 + PostCSS
- 主题 CSS 文件位于 `packages/shared/src/configs/theme-css/`（default.css、grace.css、simple.css）
- 部分主题文件使用 Less

### 状态管理

- Pinia store 位于 `apps/web/src/stores/`（按领域划分：`useEditorStore`、`useThemeStore`、`useUiStore`、`useLocaleStore` 等）
- UI 组件遵循 Shadcn-Vue 模式，位于 `apps/web/src/components/ui`
- 跨 feature 通用组件位于 `apps/web/src/components/shared`
- 架构详情见 [docs/architecture.md](./docs/architecture.md)

### 国际化（i18n，`@md/web`）

Web 主应用与部分浏览器扩展 UI 支持 **zh-CN**、**en-US**；VS Code 扩展、uTools、CLI、MCP **未**国际化。

- **库**：`vue-i18n`（composition API，`legacy: false`），在 `apps/web/vite.config.ts` 中通过 `unplugin-auto-import` 自动导入 `useI18n`
- **文案**：`apps/web/src/i18n/messages/{zh-CN,en-US}/`（`common`、`editor`、`dialog`、`store`、`ai`、`upload`、`chrome`）
- **组件内**：`useI18n()` + `t('key')`；**Store / 工具函数**：`@/i18n/translate` 的 `t()` / `getLocale()` / `formatLocalDateTime()`
- **语言状态**：`useLocaleStore`（持久化 key：`locale`）；用户可在 **偏好设置**（`Ctrl+,`）→ General 切换
- **启动**：`await initStorage()` → `setupI18n(detectInitialLocale())` → Pinia → `useLocaleStore()`（见 `apps/web/src/bootstrap.ts`）；`index.html` 启动屏从 `localStorage` 读取 locale
- **云同步**：`locale` 在 `SYNC_SETTING_KEYS` 中，远端应用后由 `hydrateSyncedSettings` 热更新
- **约定**：新增用户可见文案须同时维护 zh-CN 与 en-US；在 computed 中调用 `t()` 且需随语言切换更新时，应依赖 `locale`（例如 `void locale.value`）

## Lint 与格式化

- **ESLint:** `@antfu/eslint-config` + Vue + TypeScript + formatter
- **Prettier:** 固定版本 `2.8.8`（通过 `pnpm-workspace.yaml` 的 `overrides` 强制）
- **Pre-commit 钩子:** `lint-staged` 对所有文件执行 `eslint --fix`
- 规则：不使用分号，关闭 `no-unused-vars`、`no-console`、`no-debugger`

## 依赖管理

这是一个 pnpm monorepo，`pnpm-workspace.yaml` 中包含大量安全覆盖（overrides）。

### 升级依赖

1. **Prettier 必须固定在 `2.8.8`** — 通过 `pnpm-workspace.yaml` 的 `overrides.prettier` 强制
2. **Patch 文件：** 如果打了 patch 的依赖升级了，必须同步更新 `patches/` 中对应的 patch 文件：
   - `@codemirror/view` → `patches/@codemirror__view@6.43.1.patch`（导出 `MeasureRequest` 接口，修复 macOS 上 Alt+Shift 快捷键处理）
   - `juice` → `patches/juice@12.1.0.patch`（为 `parseCSS` 返回值增加空值检查）
3. 更新 `pnpm-workspace.yaml` 中的 `patchedDependencies` 以匹配新版本
4. 运行 `pnpm install` 重新生成 `pnpm-lock.yaml`

### 安全覆盖

`pnpm-workspace.yaml` 的 `overrides` 部分强制了存在漏洞的间接依赖的最低版本（ajv、dompurify、undici、minimatch 等）。除非上游已修复漏洞，否则不要移除这些覆盖。

### allowBuilds

`pnpm-workspace.yaml` 包含 `allowBuilds` 列表，用于需要原生构建脚本的依赖（`esbuild`、`sharp`、`keytar`、`workerd` 等）。新增需要原生构建的依赖可能需要添加到此列表。

## Git 规范

- **提交信息:** 遵循 Conventional Commits（`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`chore`），**一律使用英文**
- **分支命名:** `feat/description`、`fix/description`

## Skills

Reusable workflows live in [`.agents/skills/`](./.agents/skills/) (canonical). Claude Code reads the same files via `.claude/skills` → `.agents/skills`.

After clone, create the link once:

```bash
# macOS / Linux / Git Bash
./scripts/link-claude-skills.sh

# Windows PowerShell
./scripts/link-claude-skills.ps1
```

| Skill        | When to use                                                                     |
| ------------ | ------------------------------------------------------------------------------- |
| `git-commit` | Commit changes with Conventional Commits (`/git-commit` or "commit my changes") |
| `create-pr`  | Create a GitHub pull request (`/create-pr` or "open a PR")                      |

Invoke manually: `/skill-name` in Cursor or Claude Code; OpenCode uses the `skill` tool.
