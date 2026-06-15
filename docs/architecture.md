# 架构概览

本文档简述 doocs/md 的核心模块与数据流，供贡献者快速定位代码。

## Monorepo 结构

| 包           | 路径              | 职责                                              |
| ------------ | ----------------- | ------------------------------------------------- |
| `@md/web`    | `apps/web`        | Vue 3 主应用、浏览器扩展（WXT）                   |
| `@md/core`   | `packages/core`   | Markdown → HTML 渲染引擎                          |
| `@md/shared` | `packages/shared` | 配置、类型、编辑器 CodeMirror 封装                |
| `@md/api`    | `apps/api`        | 账户、云同步、默认图床（Cloudflare Workers + D1） |

## 渲染管线

```
Markdown 原文
  → @md/core (marked + 自定义扩展)
  → juice 内联 CSS（微信兼容）
  → isomorphic-dompurify 净化
  → 注入主题 CSS 变量 (@md/core/theme)
  → HTML 输出（预览 / 复制到公众号）
```

Web 端入口：

1. `useRenderStore`（`apps/web/src/stores/render.ts`）调用 `initRenderer` / `renderMarkdown`
2. `useThemeStore` 通过 `applyTheme` 将主题 CSS 写入 `<style>` 标签
3. 编辑器内容变更经 debounce 后触发 `render()`

扩展列表见 `packages/core/src/extensions/`（Mermaid、PlantUML、KaTeX、Ruby、alert、脚注等）。

## 状态管理（Web）

Pinia stores 按领域划分：

- `useEditorStore` — 编辑器实例与文档内容
- `useThemeStore` — 主题与样式（含 per-theme 配置持久化）
- `useRenderStore` — 渲染结果与目录标题
- `useUIStore` — 布局、对话框、视图模式

样式变更后通过 `useEditorRefresh()`（`apps/web/src/composables/useEditorRefresh.ts`）触发预览重渲染。

## 云同步

- **白名单**：`apps/web/src/services/sync/settings.ts` 中的 `SYNC_SETTING_KEYS`
- **合并策略**：LWW，元数据存于 `sync_settings_meta`
- **热更新**：远端设置应用后由 `hydrateSyncedSettings`（`services/sync/hydrate.ts`）写入 Store，无需刷新页面
- **用户说明**：见 [cloud-sync.md](./cloud-sync.md)

## 本地存储

- 通用偏好：`store.reactive()` / `LocalStorageEngine`（`utils/storage.ts`）
- 同步与配额安全：`utils/localStorageSafe.ts`（配额满时 toast 提示）

## 构建

- Web：Vite 8，`manualChunks` 拆分 codemirror、katex、highlight 等
- VSCode 扩展：webpack，预览渲染复用 `@md/core`（见 `apps/vscode/src/previewRenderer.ts`）
- Core / Shared：**直接导出 TypeScript 源码**，由消费方构建工具编译
