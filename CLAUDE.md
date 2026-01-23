# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令 (Common Commands)

### 环境与安装

- **环境准备**: `nvm i && nvm use` (确保使用正确的 Node 版本)
- **安装依赖**: `pnpm i`

### 开发 (Development)

- **启动 Web 开发服务器**: `pnpm start` 或 `pnpm web dev` (默认端口 5173)
- **启动 CLI 开发**: `pnpm cli`
- **启动 VS Code 扩展开发**: `pnpm vscode`
- **Chrome 插件开发**: `pnpm web ext:dev`
- **Cloudflare Workers 开发**: `pnpm web wrangler:dev`

### 构建 (Build)

- **构建 Web 应用**: `pnpm web build` (输出到 `apps/web/dist`)
- **构建 CLI 工具**: `pnpm build:cli`
- **构建 Chrome 插件**: `pnpm web ext:zip`
- **构建 Firefox 扩展**: `pnpm web firefox:zip`
- **构建 uTools 插件**: `pnpm utools:package`

### 代码质量 (Code Quality)

- **Lint 代码**: `pnpm lint` (自动修复: `eslint . --fix`)
- **类型检查**: `pnpm type-check` (使用 vue-tsc)

## 架构概览 (Architecture Overview)

这是一个基于 PNPM Workspaces 的 Monorepo 项目，主要由应用程序 (`apps/`) 和共享包 (`packages/`) 组成。

### 目录结构

- **apps/**
  - `web/`: 核心 Web 编辑器应用，主要的 UI 和交互逻辑。
  - `vscode/`: VS Code 插件实现。
  - `utools/`: uTools 插件相关代码。
- **packages/**
  - `core/`: 核心逻辑库。
  - `shared/`: 跨应用共享的工具函数和类型定义。
  - `md-cli/`: 命令行工具实现 (`@doocs/md-cli`)。
  - `config/`: 共享配置文件。

### 技术栈

- **语言**: TypeScript, Vue (Web 应用)
- **包管理**: PNPM
- **构建工具**: Vite (Web), tsc (Type checking)
- **代码规范**: ESLint (@antfu/eslint-config), Prettier

## 风格指南 (Style Guidelines)

- **语言**: 与用户交流及编写文档/提交信息时请使用**简体中文**。
- **代码风格**: 遵循现有的 ESLint 配置。在提交代码前确保通过 `pnpm lint` 和 `pnpm type-check`。
- **组件**: 优先复用 `packages/shared` 中的通用逻辑。
- **提交**: 提交信息应简洁明了，建议遵循语义化提交规范 (feat, fix, docs, style, refactor, test, chore)。
