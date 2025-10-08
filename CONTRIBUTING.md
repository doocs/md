# 贡献指南

感谢你对 **doocs/md** 的兴趣！我们欢迎任何形式的贡献，包括但不限于报告缺陷、改进文档、提交新特性或修复 Bug。本指南旨在帮助你快速地为项目做出贡献。

## 目录

- [贡献指南](#贡献指南)
  - [目录](#目录)
  - [前置条件](#前置条件)
  - [快速开始](#快速开始)
  - [开发流程](#开发流程)
  - [代码规范](#代码规范)
  - [提交规范](#提交规范)
    - [Branch 命名](#branch-命名)
    - [Pull Request 标题](#pull-request-标题)
  - [Pull Request 流程](#pull-request-流程)
  - [Issue 报告](#issue-报告)
  - [行为准则](#行为准则)
  - [沟通渠道](#沟通渠道)

## 前置条件

- **Node.js ≥ 22**
- **pnpm ≥ 10**

## 快速开始

该项目为 pnpm monorepo 项目，使用 pnpm 管理依赖。

项目结构如下：

```shell
- apps
  - web           # 网页及浏览器插件
  - vscode        # VSCode 插件
- packages
  - config        # 项目级别配置
  - core          # 核心 markdown 渲染器
  - shared        # 共享的配置、常量、类型和工具函数
  - example       # 公众号 openapi 接口代理服务示例
  - md-cli        # 命令行工具
```

以开发 `@md/web` 为例：

```bash
# 1. Fork 本仓库并克隆
git clone https://github.com/<你的用户名>/md.git
cd md

# 2. 配置上游仓库
git remote add upstream https://github.com/doocs/md.git

# 3. 安装依赖
pnpm install

# 4. 启动本地开发
pnpm web dev
```

## 开发流程

1. 从 `main` 分支拉取最新代码：

   ```bash
   git checkout main
   git pull upstream main
   ```

2. 基于 `main` 创建功能分支：

   ```bash
   git checkout -b feat/awesome-feature
   ```

3. 编码 & 编写/更新测试。
4. 运行检查：

   ```bash
   pnpm run lint        # ESLint + Prettier
   pnpm run type-check  # TypeScript 类型检查
   pnpm run web build       # 产物验证
   ```

5. 提交并推送：

   ```bash
   git add .
   git commit -m "feat: awesome feature"
   git push origin feat/awesome-feature
   ```

6. 在 GitHub 页面发起 **Pull Request**。

> [!TIP]
> 开发时可在 `apps/web` 目录下新建 `.env.local` 文件，配置 `VITE_LAUNCH_EDITOR` 为 `code` （默认值）或其他 [支持的编辑器](https://github.com/yyx990803/launch-editor?tab=readme-ov-file#supported-editors)，方便调试。
>
> 例如：
>
> ```
> VITE_LAUNCH_EDITOR=cursor
> ```

## 代码规范

- 遵循项目自带的 **ESLint**、**Prettier** 与 **Stylelint** 配置。
- 所有提交必须通过 `pnpm run lint` 检查，无警告、无错误。
- 推荐在 IDE 中启用 **ESLint** 与 **Prettier** 自动修复。

## 提交规范

| 类型     | 说明                       |
| -------- | -------------------------- |
| feat     | 新功能                     |
| fix      | Bug 修复                   |
| docs     | 文档变更                   |
| style    | 代码格式（不影响逻辑）     |
| refactor | 重构（非修复亦非新增功能） |
| perf     | 性能优化                   |
| test     | 测试相关                   |
| build    | 构建系统或依赖变动         |
| chore    | 其他辅助变动               |

### Branch 命名

```
feat/<简要描述>
fix/<简要描述>
docs/<简要描述>
```

### Pull Request 标题

保持与首条 commit message 一致，建议附带影响范围（Scope）与简要描述，例如：

```
feat(editor): 支持自定义快捷键
```

## Pull Request 流程

1. **描述清晰**：在 PR 模板中说明变更动机、相关 Issue、实现方案及影响范围。
2. **保持小而聚焦**：一个 PR 只做一件事，方便审阅。
3. **确保测试**：新增/变更功能需自测，确保没问题。
4. **更新文档**：公共 API 或行为变更必须同步更新文档。
5. **CI 通过**：PR 必须通过所有 CI 检查（类型、lint、单测、构建）。
6. **等待审核**：维护者会在 1～3 个工作日内回复。请耐心等待并根据建议进行修订。

## Issue 报告

- 先 **搜索** 已有 Issue，避免重复。
- 提供 **可复现仓库 / 代码片段 / 截图 / 终端输出**。
- 说明 **期望行为** 与 **实际行为**。
- 指明 **运行环境**（操作系统、浏览器、Node 版本等）。
- Bug 标签由维护者分配，请勿自行指定。

## 行为准则

我们遵循 [Contributor Covenant](https://www.contributor-covenant.org/) v2.1。
任何违反行为准则的行为都可能导致暂时或永久的禁言、封号。请保持友善。

## 沟通渠道

- **GitHub Discussions**：[https://github.com/doocs/md/discussions](https://github.com/doocs/md/discussions)
- **Issues**：仅限缺陷反馈和功能需求
- **微信群**：添加项目维护者微信，备注 `md`，拉你进群

---

❤️ 感谢每一位贡献者！让我们一起让 **doocs/md** 变得更好。
