# 架构概览

本文档简述 doocs/md 的核心模块与数据流，供贡献者快速定位代码。

## Monorepo 结构

| 包               | 路径                  | 职责                                                                                    |
| ---------------- | --------------------- | --------------------------------------------------------------------------------------- |
| `@md/web`        | `apps/web`            | Vue 3 主应用、WXT 浏览器扩展（Chrome/Firefox）、CF Workers 部署                         |
| `@md/api`        | `apps/api`            | 账户、云同步、计费、上传代理、分享链接、主题/组件市场（Cloudflare Workers + Hono + D1） |
| `doocs-md`       | `apps/vscode`         | VS Code 扩展（webpack 构建，marketplace ID 为 `doocs.doocs-md`）                        |
| `@md/utools`     | `apps/utools`         | uTools 插件打包壳（构建产物来自 `@md/web`）                                             |
| `@md/core`       | `packages/core`       | Markdown → HTML 渲染引擎                                                                |
| `@md/shared`     | `packages/shared`     | 配置、类型、CodeMirror 编辑器封装、主题 CSS                                             |
| `@md/config`     | `packages/config`     | 共享 TypeScript 配置                                                                    |
| `@doocs/md-cli`  | `packages/md-cli`     | 已发布 npm CLI（Express 静态服务）                                                      |
| `@md/mcp-server` | `packages/mcp-server` | MCP 服务（`render_markdown` 等工具）                                                    |

独立示例（不在 pnpm workspace 内）：

| 示例              | 路径                                   | 说明                    |
| ----------------- | -------------------------------------- | ----------------------- |
| 微信 OpenAPI 代理 | `docs/examples/wechat-openapi-worker/` | 最小 CF Worker 转发示例 |

### 依赖关系

```
apps (web / vscode / mcp-server)
  └── @md/core
        └── @md/shared
              └── @md/config (dev)
```

`@md/core` 与 `@md/shared` **直接导出 TypeScript 源码**，由消费方构建工具（Vite / webpack）编译。

## 渲染管线

```
Markdown 原文
  → @md/core (marked + 自定义扩展)
  → isomorphic-dompurify 净化
  → 注入主题 CSS 变量 (@md/core/theme)
  → HTML 输出（预览）
  → juice 内联 CSS（仅复制到微信时，在 `@md/web` 导出层）
  → 剪贴板 HTML（公众号）
```

Web 端入口：

1. `useRenderStore`（`apps/web/src/stores/render.ts`）调用 `initRenderer` / `renderMarkdown`
2. `useThemeStore` 通过 `applyTheme` 将主题 CSS 写入 `<style>` 标签
3. 编辑器内容变更经 debounce 后触发 `render()`

扩展列表见 `packages/core/src/extensions/`（Mermaid、PlantUML、KaTeX、Ruby、alert、脚注等）。

## Web 应用目录约定（`apps/web/src`）

| 目录                 | 职责                                                                    |
| -------------------- | ----------------------------------------------------------------------- |
| `i18n/`              | vue-i18n 配置、locale 检测、按领域拆分的 message 模块                   |
| `stores/`            | Pinia 全局状态，按领域划分                                              |
| `composables/`       | 跨组件复用的响应式逻辑                                                  |
| `services/`          | 外部 API 与领域服务（account / sync / share / upload / export）         |
| `storage/`           | IndexedDB 抽象层、键前缀与安全读写                                      |
| `lib/`               | 纯函数与浏览器辅助（bootstrap / browser / format / markdown / preview） |
| `components/ui/`     | Shadcn-Vue 设计系统（无业务逻辑）                                       |
| `components/editor/` | 编辑器主界面                                                            |
| `components/ai/`     | AI 相关 UI                                                              |
| `components/shared/` | 跨 feature 通用组件                                                     |
| `entrypoints/`       | WXT 浏览器扩展入口                                                      |

## 状态管理（Web）

Pinia stores 按领域划分：

- `useEditorStore` — 编辑器实例与文档内容
- `useThemeStore` — 主题与样式（含 per-theme 配置持久化）
- `useRenderStore` — 渲染结果与目录标题
- `useUIStore` — 布局、对话框、视图模式
- `useLocaleStore` — 界面语言（zh-CN / zh-TW / en-US / ja-JP），同步 `document.title` 与 i18n 实例
- `useSyncStore` / `useAuthStore` — 云同步与账户
- `useMarketplaceStore` — 主题/组件市场目录、安装与发布
- `useConfirmStore` — 全局确认对话框（`components/shared/confirm-dialog/`）

样式变更后通过 `useEditorRefresh()`（`apps/web/src/composables/useEditorRefresh.ts`）触发预览重渲染。

## 云同步

- **白名单**：`apps/web/src/services/sync/settings.ts` 中的 `SYNC_SETTING_KEYS`（含 `marketplace_installed_themes` / `marketplace_installed_components`）
- **合并策略**：LWW，元数据存于 `sync_settings_meta`
- **热更新**：远端设置应用后由 `hydrateSyncedSettings`（`services/sync/hydrate.ts`）写入 Store（含 `locale`），无需刷新页面
- **用户说明**：见 [cloud-sync.md](./cloud-sync.md)

## 主题 / 组件市场

- **API**：`/marketplace/*`（公开浏览；登录发布；`ADMIN_GITHUB_LOGINS` 审核）
- **主题包**：安装后以 `mp:<uuid>` 作为独立主题出现在主题选择器；CSS 经 `applyTheme({ themeCSS })` 动态注入
- **组件包**：安装后写入 `custom_components` 注册表
- **Web UI**：`MarketplaceDialog`（文件菜单 / 右侧主题栏 / 组件对话框入口）

## 本地存储

- **IndexedDB**（`apps/web/src/storage/`）：文章正文、偏好设置、图床/AI 密钥、缓存分层存储
- **StorageEngine 抽象**（`storage/manager.ts`）：`store.reactive()` / `store.getJSON()` 统一入口
- **文章持久化**：`documentRepo` 按篇读写，避免整包 JSON 写入
- **云同步元数据**：`services/sync/settings.ts` 通过 `store` 读写设置白名单
- **配额提示**：`storage/quota.ts`（IndexedDB 配额远大于 localStorage，保留 toast 兜底）

### 启动顺序

1. `main.ts` → `bootstrap()`（`apps/web/src/bootstrap.ts`）
2. `initComponentDarkVars()` + `setupComponents()`
3. `await initStorage()`（迁移 localStorage、预加载 KV 缓存、加载文档）
4. `setupI18n(detectInitialLocale())` + `setAppI18n()`，注册 vue-i18n 插件
5. `createApp`、Pinia、`useLocaleStore()` 并挂载
6. `App.vue` 中 `usePlatformEnv()`、`useAccountSyncBootstrap()`、`useDeepLinkImport()` 完成账户与深链引导

### 国际化（i18n）

- **范围**：`apps/web` 主应用 UI；扩展 popup / background 部分文案。VS Code、uTools、CLI、MCP 无 i18n。
- **入口**：`apps/web/src/i18n/`（`detect.ts`、`translate.ts`、`messages/`）
- **偏好**：`PreferencesDialog`（文件菜单或 `Ctrl+,`）→ General → Language
- **动态 UI**：命令面板、快捷键列表、Slash 命令、CodeMirror placeholder 等在 `locale` 变化时重建；Store 内 toast 使用 `@/i18n/translate` 的 `t()`

## 构建

- Web：Vite 8，`manualChunks` 拆分 codemirror、katex、highlight 等
- VSCode 扩展：webpack，预览渲染复用 `@md/core`（见 `apps/vscode/src/previewRenderer.ts`）
- 浏览器扩展：WXT，`src/entrypoints/` 为入口
- Core / Shared：**直接导出 TypeScript 源码**，由消费方构建工具编译

## 静态资源

Web 应用静态资源统一放在 `apps/web/public/`（如 `mpmd/` 图标）。根目录不再有 `public/` 副本。
