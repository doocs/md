# Doocs MD 桌面端

基于 Tauri 2，直接复用 `@md/web` 的 Vue 编辑器、主题、渲染和国际化。Rust 入口只负责创建窗口及将外链交给系统浏览器，不开放文件系统或 shell 命令权限。

## 环境与命令

先安装仓库要求的 Node.js、pnpm、Rust stable，以及 [Tauri 系统依赖](https://v2.tauri.app/start/prerequisites/)：macOS 需要 Xcode Command Line Tools，Windows 需要 MSVC Build Tools 和 WebView2，Linux 需要 WebKitGTK 等开发库。

在仓库根目录运行：

```sh
pnpm install
pnpm desktop dev
```

开发模式自动启动 `http://127.0.0.1:1420` 的 Vite 服务并打开原生窗口，支持前端热更新。端口被占用会直接报错，避免加载其他服务。

```sh
# Build the frontend, check its types, compile Rust, and package for the host OS
pnpm desktop build

# Compile a debug executable without packaging
pnpm desktop tauri build --debug --no-bundle

# Run native URL protocol checks
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

安装包位于 `apps/desktop/src-tauri/target/release/bundle/`。Windows、macOS、Linux 分别在对应系统构建；本接入不包含发布签名、公证、自动更新或移动端工程。

## 集成边界

- 前端命令为 `pnpm web dev:desktop` / `pnpm web build:desktop`，采用独立的 `.env.desktop` 和根资源路径，产物写入 `apps/desktop/dist`，不覆盖 Web 的 `apps/web/dist`。桌面构建不注入 Google Analytics。
- 文章和设置继续使用 IndexedDB / localStorage，由 WebView 持久化；与普通浏览器、浏览器扩展及开发模式的数据互相独立。迁移文章可使用现有导入和导出功能；修改应用标识符会改变应用数据位置。
- 账户、云同步、分享、市场及 API 上传入口默认关闭：现有 OAuth 依赖 Web 回跳，后端也尚未放行桌面 Origin。启用前需要实现桌面登录回调并配置 CORS，不应只切换环境变量。
- AI、第三方图床、远程图片和部分公式/图表资源仍受网络与服务端 CORS 限制；本版本没有绕过 WebView 的网络安全限制，也未将所有 CDN 资源离线化。
- 外部链接使用系统浏览器，允许 `http:`、`https:`、`mailto:` 和 `tel:`。原生拖拽接管已禁用，以保留编辑器的 HTML 文件拖拽。
- 文件夹直连依赖 `showDirectoryPicker`，macOS / Linux WebView 通常不提供该 API；可先使用现有文件导入。文件导出、PDF 打印、富文本复制和图片截图仍走现有浏览器实现，需要分别在 WKWebView、WebView2、WebKitGTK 上验收，尤其是向公众号粘贴时的格式保留。

## 首次验收

1. 启动后确认编辑、预览、主题切换和四种界面语言正常。
2. 新建文章并修改内容，关闭、重启后确认文章和设置保留。
3. 导入 Markdown、拖入文件，检查 Markdown / HTML / PNG 导出与 PDF 打印。
4. 复制富文本并粘贴到公众号编辑器，确认图表、公式和图片格式。
5. 点击帮助链接，确认系统浏览器打开且编辑器窗口保留。
