# AGENTS.md

> 本文件为 AI Agent 在本仓库中工作时提供通用指引。
>
> 详细信息请参阅 [CLAUDE.md](CLAUDE.md)，其中包含项目架构、命令、依赖管理等完整说明。

## 快速开始

- **包管理器:** pnpm（不要用 npm/yarn）
- **Node 版本:** >= 22.19.0
- **安装依赖:** `pnpm install`

## 常用命令

| 命令                  | 说明                  |
| --------------------- | --------------------- |
| `pnpm web dev`        | 启动 Web 开发服务器   |
| `pnpm web build`      | 生产构建              |
| `pnpm run lint`       | ESLint 检查并自动修复 |
| `pnpm run type-check` | TypeScript 类型检查   |
| `pnpm cli <cmd>`      | 在 CLI 包中执行命令   |
| `pnpm mcp <cmd>`      | 在 MCP 服务中执行命令 |

## 关键约定

- **`@md/core` 和 `@md/shared` 直接导出 TypeScript 源码**，不要尝试预先构建它们
- 修改样式时优先使用 `apps/web/src/components/ui` 中的 Shadcn-Vue 组件
- 主题 CSS 文件在 `packages/shared/src/configs/theme-css/`
- Markdown 扩展在 `@md/core/src/extensions` 中实现
- 提交信息遵循 Conventional Commits
