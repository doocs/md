# @md/shared

跨应用共享的配置、类型、工具与 CodeMirror 编辑器封装。

## 导出

| 路径                   | 说明                                   |
| ---------------------- | -------------------------------------- |
| `@md/shared`           | 主入口                                 |
| `@md/shared/configs`   | 主题、字体、颜色等默认配置与选项列表   |
| `@md/shared/constants` | 常量                                   |
| `@md/shared/types`     | 共享 TypeScript 类型                   |
| `@md/shared/utils`     | fetch、tokenTools 等工具               |
| `@md/shared/editor`    | CodeMirror 6 setup、格式化命令、快捷键 |

## 主要配置（`configs`）

- `themeOptions` / `defaultStyleConfig` — 主题名与默认样式
- `defaultPerThemeSettings` — 每个主题的独立配置结构
- `fontFamilyOptions` / `fontSizeOptions` / `colorOptions` — 样式面板选项
- `ctrlKey` / `ctrlSign` — 平台相关快捷键展示

主题 CSS 源文件位于 `src/configs/theme-css/`（如 `default.css`、`grace.css`）。

## 编辑器（`editor`）

Web 与 VSCode 扩展共用 CodeMirror 配置：

```ts
import { applyHeading, formatBold, markdownSetup, theme } from '@md/shared/editor'
```

## 消费方

- `apps/web` — 主编辑器 UI
- `apps/vscode` — VSCode 预览侧边栏
- `packages/core` — 渲染相关类型与工具

## 相关文档

- [架构概览](../../docs/architecture.md)
- [AGENTS.md](../../AGENTS.md)
