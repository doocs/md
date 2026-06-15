# @md/core

Markdown 渲染引擎：将 Markdown 转为适合微信公众号的 HTML。

## 导出

| 路径                  | 说明                                                      |
| --------------------- | --------------------------------------------------------- |
| `@md/core`            | 主入口：`initRenderer`、`renderMarkdown`、`applyTheme` 等 |
| `@md/core/renderer`   | 渲染器实现                                                |
| `@md/core/extensions` | marked 扩展（Mermaid、KaTeX、alert 等）                   |
| `@md/core/utils`      | `postProcessHtml`、`renderMarkdown` 辅助                  |
| `@md/core/theme`      | 主题注入与 CSS 变量                                       |

## 基本用法

```ts
import { initRenderer, renderMarkdown } from '@md/core'
import { postProcessHtml } from '@md/core/utils'

const renderer = initRenderer({
  isMacCodeBlock: true,
  isShowLineNumber: true,
})

const html = postProcessHtml(renderMarkdown(renderer, markdown))
```

主题样式需配合 `@md/core/theme` 的 `applyTheme` 或 Web 端 `useThemeStore.applyCurrentTheme()` 注入 CSS。

## 扩展

扩展位于 `src/extensions/`，在 `renderer-impl.ts` 中注册。新增扩展时：

1. 在 `src/extensions/` 实现 marked 扩展
2. 在 `src/extensions/index.ts` 导出
3. 在 `initRenderer` 中注册

## 依赖说明

- **marked** — Markdown 解析
- **highlight.js** — 代码高亮
- **mermaid / @antv/infographic** — 图表（按需加载仍建议在消费方做 code-splitting）
- **isomorphic-dompurify** — HTML 净化
- **juice** — CSS 内联（在 `postProcessHtml` 流程中使用）

## 相关文档

- [架构概览](../../docs/architecture.md)
- [AGENTS.md](../../AGENTS.md)
