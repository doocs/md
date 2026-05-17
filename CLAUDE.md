# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指引。

## 项目概览

**doocs/md** — 一款微信 Markdown 编辑器，将 Markdown 渲染为微信公众号文章格式。支持自定义主题样式、多床、AI 助手、浏览器扩展等特性。

- **在线地址:** https://md.doocs.org
- **Node 版本:** >= 22.19.0（`.nvmrc`: v22.19.0）
- **包管理器:** pnpm（monorepo）
- **npm 镜像:** https://registry.npmmirror.com（`.npmrc`）

## Monorepo 结构

| 工作区           | 路径                  | 说明                                              |
| ---------------- | --------------------- | ------------------------------------------------- |
| `@md/web`        | `apps/web`            | 主应用，Vue 3 + 浏览器扩展（WXT: Chrome/Firefox） |
| (无名)           | `apps/vscode`         | VSCode 扩展（webpack 构建）                       |
| (无名)           | `apps/utools`         | uTools 插件打包                                   |
| `@md/core`       | `packages/core`       | 核心 Markdown 渲染引擎（marked + 自定义扩展）     |
| `@md/shared`     | `packages/shared`     | 共享工具函数、配置、类型、编辑器配置              |
| `@md/config`     | `packages/config`     | TypeScript 配置基础文件                           |
| `@doocs/md-cli`  | `packages/md-cli`     | CLI 工具（Express 服务托管构建产物）              |
| `@md/mcp-server` | `packages/mcp-server` | MCP 服务，为 AI Agent 暴露接口                    |
| (无名)           | `packages/example`    | Cloudflare Workers 示例                           |

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
pnpm mcp <cmd>        # 在 @md/mcp-server 中执行命令
```

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

- Pinia store 位于 `apps/web/src/stores/`（按领域划分：`useEditorStore`、`useThemeStore`、`useUiStore` 等）
- UI 组件遵循 Shadcn-Vue 模式，位于 `apps/web/src/components/ui`

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
   - `@codemirror/view` → `patches/@codemirror__view@6.43.0.patch`（导出 `MeasureRequest` 接口，修复 macOS 上 Alt+Shift 快捷键处理）
   - `juice` → `patches/juice@11.1.1.patch`（为 `parseCSS` 返回值增加空值检查）
3. 更新 `pnpm-workspace.yaml` 中的 `patchedDependencies` 以匹配新版本
4. 运行 `pnpm install` 重新生成 `pnpm-lock.yaml`

### 安全覆盖

`pnpm-workspace.yaml` 的 `overrides` 部分强制了存在漏洞的间接依赖的最低版本（ajv、dompurify、undici、minimatch 等）。除非上游已修复漏洞，否则不要移除这些覆盖。

### allowBuilds

`pnpm-workspace.yaml` 包含 `allowBuilds` 列表，用于需要原生构建脚本的依赖（`esbuild`、`sharp`、`keytar`、`workerd` 等）。新增需要原生构建的依赖可能需要添加到此列表。

## Git 规范

- **提交信息:** 遵循 Conventional Commits（`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`chore`）
- **分支命名:** `feat/description`、`fix/description`
