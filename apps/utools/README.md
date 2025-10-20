# uTools 插件打包指引

该目录包含将微信 Markdown 编辑器打包为 [uTools](https://u.tools) 插件所需的脚本与配置。

## 快速开始

```sh
pnpm utools:package
```

该命令将完成以下动作：

1. **下载本地资源**：下载 MathJax、Mermaid、WeChat Sync 等库文件到 `apps/web/public/static/libs`（仅 uTools 打包需要，已添加到 `.gitignore`）。
2. 调用 `pnpm --filter @md/web run build:utools` 构建前端资源至 `apps/utools/dist`，该构建将自动使用相对路径，确保在 uTools 的 `file://` 协议下能够正常加载。构建过程中会自动将远程 CDN 资源替换为本地资源路径。
3. 将仓库根目录的版本号写入 `apps/utools/plugin.json`，保持与主项目同步。
4. 从 `public/mpmd/icon-256.png` 拷贝插件图标至 `apps/utools/logo.png`。
5. 生成形如 `apps/utools/release/md-utools-vX.Y.Z.zip` 的安装包，可直接导入到 uTools。

> 注意：命令执行前请确认已安装 pnpm 10+ 与 Node.js 22+，并在仓库根目录执行 `pnpm install` 安装依赖。

## 本地资源说明

uTools 审核要求插件不能加载远程资源。打包时会自动下载以下库文件到本地（这些文件不会提交到 Git 仓库）：

- **MathJax** - 数学公式渲染库
- **Mermaid** - 流程图渲染库
- **WeChat Sync** - 文章同步脚本

构建时，Vite 插件会自动将 HTML 中的 CDN 链接替换为本地资源路径，确保插件可以离线运行。

### 手动下载资源

如需单独下载资源文件：

```sh
node scripts/download-utools-libs.mjs
```

## 手动导入调试

1. 运行 `pnpm --filter @md/web run build:utools`。
2. 打开 uTools，进入插件面板中的「开发者工具」。
3. 选择「载入本地插件」，指向 `apps/utools` 目录即可。

## 目录说明

- `plugin.json`：uTools 插件的清单文件。
- `preload.js`：在 uTools 渲染进程和 Web 前端之间建立通信的脚本，用于处理插件唤起事件。
- `package.json`：将此目录标记为 CommonJS 模块以兼容 uTools。
- `dist/`：由 Vite 构建输出的静态资源目录。
- `release/`：运行打包命令后生成的插件安装包。
