# uTools 插件打包指引

该目录包含将微信 Markdown 编辑器打包为 [uTools](https://u.tools) 插件所需的脚本与配置。

## 快速开始

```sh
pnpm utools:package
```

该命令将完成以下动作：

1. 调用 `pnpm --filter @md/web run build:utools` 构建前端资源至 `apps/utools/dist`，该构建将自动使用相对路径，确保在 uTools 的 `file://` 协议下能够正常加载。
2. 将仓库根目录的版本号写入 `apps/utools/plugin.json`，保持与主项目同步。
3. 从 `public/mpmd/icon-256.png` 拷贝插件图标至 `apps/utools/logo.png`。
4. 生成形如 `apps/utools/release/md-utools-vX.Y.Z.zip` 的安装包，可直接导入到 uTools。

> 注意：命令执行前请确认已安装 pnpm 10+ 与 Node.js 22+，并在仓库根目录执行 `pnpm install` 安装依赖。

## 手动导入调试

1. 运行 `pnpm --filter @md/web run build:utools`。
2. 打开 uTools，进入插件面板中的「开发者工具」。
3. 选择「载入本地插件」，指向 `apps/utools` 目录即可。

## 目录说明

- `plugin.json`：uTools 插件的清单文件。
- `preload.js`：在 uTools 渲染进程和 Web 前端之间建立通信的脚本，用于处理插件唤起事件。
- `dist/`：由 Vite 构建输出的静态资源目录。
- `release/`：运行打包命令后生成的插件安装包。
