# doocs-md VS Code Extension

为 doocs-md 提供的 VS Code 扩展，支持在编辑器内实时预览 Markdown 渲染为微信图文的效果。

## 功能特性

- 侧边栏预览配置（字号、字体、主题、主题色）
- 支持微信图文特有的样式渲染
- 字数统计开关（`countStatus`）
- Mac 风格代码块开关（`isMacCodeBlock`）
- 微信外链转引用开关（`citeStatus`）
- 编辑器标题栏一键打开预览面板

## 使用方法

1. 在仓库根目录执行 `pnpm install`
2. 打开任意 `.md` 文件
3. 点击活动栏 **Markdown Preview** 图标，在侧边栏调整渲染选项
4. 点击编辑器标题栏预览按钮，或运行命令 `Markdown Preview: Open Markdown Preview`

## 命令

| 命令                          | 说明                   |
| ----------------------------- | ---------------------- |
| `markdown.preview`            | 打开 Markdown 预览面板 |
| `markdown.setFontFamily`      | 设置预览字体           |
| `markdown.setFontSize`        | 设置预览字号           |
| `markdown.setTheme`           | 设置预览主题           |
| `markdown.setPrimaryColor`    | 设置主题色             |
| `markdown.toggleCountStatus`  | 切换字数统计显示       |
| `markdown.toggleMacCodeBlock` | 切换 Mac 风格代码块    |
| `markdown.toggleCiteStatus`   | 切换微信外链转引用     |

## 与主项目的关系

本扩展是 [doocs-md](https://github.com/doocs/md) 的配套工具，使用 `@md/core` 渲染引擎，确保预览效果与 Web 版微信图文一致。

## 开发

- **Node.js ≥ 22**
- 在 monorepo 根目录安装依赖：`pnpm install`

```sh
# 在仓库根目录
pnpm vscode watch      # webpack 监听编译
pnpm vscode build      # 生产构建
pnpm vscode test       # 渲染路径 smoke test
pnpm vscode package    # 打包 .vsix
```

### F5 调试

**推荐打开 monorepo 根目录 `D:\repo\md`**（根目录 `.vscode/launch.json` 已配置好）。

1. `pnpm install` && `pnpm vscode build`（首次或改 webpack 配置后）
2. 按 `F5` 选择 **Run Extension**
3. 在弹出的 **`[Extension Development Host]` 新窗口** 中打开 `.md` 文件
4. 运行 `Open Markdown Preview` 或点击标题栏预览按钮

改代码时另开终端跑 `pnpm vscode watch`，改完后在 Extension Development Host 窗口 `Developer: Reload Window`。

### 常见问题

**`command 'markdown.preview' not found`** 或 **`no data provider registered`**

- 在 **Extension Development Host 新窗口** 操作，不是原调试窗口
- 先 **关闭所有正在调试的扩展窗口**，再重新 `pnpm vscode build`（避免 `extension.js` 被占用）
- F5 后运行 `pnpm vscode test` 确认构建与预览路径正常
- 若看不到 `activate` 日志，说明扩展加载失败，把完整错误贴出来

### 手动验证清单

- [ ] 侧边栏「Preview」树视图正常加载（无 data provider 报错）
- [ ] 切换主题/字号后预览实时更新
- [ ] 开启「微信外链转引用」后，外链显示 `[n]` 上标
- [ ] 开启「计数状态」后预览顶部显示阅读统计
- [ ] 开启「Mac 代码块」后代码块样式变化
