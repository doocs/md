# 在 DeepSeek Harness 里用 doocs/md 写公众号（apps/dsh）

这个目录是 doocs/md 的 **DeepSeek Harness 插件**，装好以后：

- **侧边栏「doocs/md」**：点开就是完整的 md 编辑器（`apps/web` 的原样构建产物，嵌在同源 iframe 里），主题、代码高亮、一键复制到公众号全部保持上游行为；
- **Agent 工具**：`md_wechat_render` / `md_wechat_options`，让 Agent 直接产出公众号 HTML。

和之前 `dsh-md` 那个插件的区别：**这里不额外维护一份上游源码**。插件就住在本仓库的 `apps/dsh`，编辑器和渲染引擎都在构建时从 `apps/web`、`packages/*` 取，所以上游修 bug、加特性后，`git pull` + 一条命令就能更新，没有第二份代码要合并。

## 命令总览

| 想做的事                               | 命令                                 |
| -------------------------------------- | ------------------------------------ |
| 本地验证（构建 + 自检 + 单测，不安装） | `pnpm dsh:check`                     |
| 只跑单元测试                           | `pnpm dsh:test`                      |
| 本地安装到自己的 DSH（自动装好）       | `pnpm dsh:install`                   |
| 打一个 zip 发给别人                    | `pnpm dsh:pack`                      |
| 构建 npm 发布用的 `dist/`              | `pnpm run build:dsh`                 |
| 上游改了 `apps/web`，强制重建编辑器    | `pnpm dsh:editor`                    |
| 类型检查（编辑器报红时用）             | `pnpm --dir apps/dsh run type-check` |

全部在仓库根执行。

## 单元测试

```bash
pnpm dsh:test        # 3 个测试文件 / 21 个用例，约 1 秒
```

不依赖构建产物（主题用 `packages/shared/src/configs/theme-css`，编辑器用 `test/fixtures/editor`），覆盖：

| 文件                  | 覆盖内容                                                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `test/render.test.ts` | 真实跑 md 渲染器：`<style>` 注入、主色/字号透传、callout 转换、未知主题回退+警告、主题发现                                                     |
| `test/server.test.ts` | 编辑器入口 200 + 站点前缀、静态资源类型与长缓存、404、路径穿越、405；渲染接口的鉴权拒绝/放行、HTML 输出、非法 JSON、空 markdown、405、未知接口 |
| `test/client.test.ts` | 用 `vm` 跑 `client.js`：模块 id 等于包名、注册 `main` 与 `sidebar.panellist`、两者 key/id 一致                                                 |

当下这条边界问题的回归用例就在 `server.test.ts`：「编辑器入口返回 HTML 且带站点前缀」——它同时钉住了「编辑器必须挂在自己的 `/md-wechat` 前缀内部」这件事。

## 1. 验证有没有报错：`pnpm dsh:check`

不安装、不碰 profile，按顺序做四件事，任何一步失败就报错停下：

1. 构建编辑器 `apps/web` → `apps/dsh/build/editor`（有缓存则复用，秒级）
2. 构建插件 `src/` → `apps/dsh/dist`（自包含 `index.js`）
3. 自检：不启动 DSH，直接加载产物、注册工具、渲染样例，并用 `vm` 跑一遍 `client.js` 确认侧边栏/主面板都注册了
4. 路由自检：用假的 req/res 打一遍 `/md-wechat/editor/`、静态资源、404、路径穿越、API 鉴权

## 2. 本地使用：`pnpm dsh:install`

在 `dsh:check` 的基础上，自动调用 DSH 自带的 CLI 把插件装进当前 profile：

```text
> 1/4 编辑器（apps/web → build/editor，有缓存则复用）
  312 个文件 · 13.2 MB · 复用缓存
> 2/4 构建插件（源码 -> apps\dsh\dist）
  版本 2.1.0 · index.js 10.8 MB · 主题 base.css, default.css, grace.css, simple.css
> 3/4 自检（不依赖 DSH，先在这里把错误挡住）
  工具 md_wechat_render, md_wechat_options · 样例渲染 15.9 KB
> 4/4 安装到 DSH（profile: desktop，CLI 来自：运行中的 DSH 进程）
✔ 已装好
  bundle:   已加入 dsh.profile.bundles
```

装好后：

- **刷新页面（Ctrl+R）** → 左侧边栏出现「doocs/md」图标，点开是完整编辑器；
- 也可以直接跟 Agent 说「用 md 把这份 Markdown 排成公众号文章」。

变体：

```bash
node apps/dsh/scripts/install.mjs --editor       # 强制重建编辑器（上游 apps/web 有改动时）
node apps/dsh/scripts/install.mjs --no-build     # 跳过构建，只重装现有产物
node apps/dsh/scripts/install.mjs --profile web  # 装到别的 profile
node apps/dsh/scripts/install.mjs --cli "D:\...\resources\runtime\cli\bin\dsh.cmd"
```

> **Host 代码改了要重启一次 DSH。** 浏览器半片刷新页面就会重载，但 Host 半片（工具、`/md-wechat-*` 路由）同一个路径覆盖安装时可能命中模块缓存；重启是最稳的。

## 3. 发给别人：`pnpm dsh:pack`

产物两个：

| 路径                                     | 用途                             |
| ---------------------------------------- | -------------------------------- |
| `apps/dsh/dist/`                         | 本机安装用（`dsh:install` 装它） |
| `apps/dsh/release/md-wechat-v<版本>.zip` | 发给别人（约 7 MB）              |

打包时会做可移植性校验，不满足直接失败：

- **没有本机绝对路径**，也没有 `link:` / `file:` 本地依赖；
- **没有 `node_modules`**、没有运行时依赖 —— 对方不用 `pnpm install`、不用联网；
- 清单结构完整：入口、`client.js`、`cordis.patch.yml`、图标、locale、`editor/**`。

对方安装：解压 →「插件」→「添加插件」选目录 → 刷新页面 → 侧边栏出现入口。

## 4. 发布到 npm：`@doocs/dsh-md`

版本写在 `apps/dsh/package.json`，不跟仓库根的版本走。用户侧边栏看到的是 **doocs/md**，npm 包名是 `@doocs/dsh-md`。

```bash
dsh plugin --profile desktop add @doocs/dsh-md
```

发版和 `@doocs/md-cli` 走同一条 changesets 流水线（`.github/workflows/release-cli.yml`）：

1. 改动需要发版时，`pnpm changeset` 选 `@doocs/dsh-md`，把生成的 `.changeset/*.md` 一并提交。
2. 合并到 `main` 后，workflow 开版本 PR，把 `apps/dsh/package.json` 从 `0.0.0` 起按 changeset 递增，并写 `CHANGELOG.md`。
3. 版本 PR 合并后，workflow 先 `pnpm run build:dsh`（编辑器 + `apps/dsh/dist`），再把 `dist/` 发到 npm。`publishConfig.directory` 是 `dist`，所以发出去的是构建产物，不是源码。
4. 第一次发布前，npm 的 `@doocs` 组织要允许这条 GitHub workflow 创建 `@doocs/dsh-md`（和 `@doocs/md-cli` 同一套 OIDC）。

本地开发仍然用 `pnpm dsh:install`，它链接本仓库的 `apps/dsh/dist`。包名从 `@local/md-wechat` 换过来时，安装脚本会先卸掉旧包。

npm 页面上的说明是 `README.npm.md`（构建时复制成 `dist/README.md`）。本文件是仓库里的开发说明。

## 面板里是什么

面板外壳是插件的（标题 + 「刷新」按钮），里面是同源 iframe：

```text
GET /md-wechat/editor/            → apps/web 的构建产物（index.html 等 312 个文件）
GET /md-wechat/editor/static/...  → 哈希静态资源（长缓存）
```

编辑器本身不做任何改动：主题、排版规则、代码高亮、复制/导出流程都是上游原样。构建时只有三处差异（都在 `scripts/build-editor.mjs` 里）：

1. 站点前缀改成 `/md-wechat/editor/`；
2. `SERVER_ENV=UTOOLS`：关掉上游统计插件，并让上游把 MathJax 下载成本地文件；
3. 把 bundle 里残留的 MathJax CDN 地址改成本地路径，离线也能渲染公式。

因此 `pnpm dsh:editor` 首次运行需要联网（下载 MathJax，约 2 MB），之后有缓存。

## Agent 工具

| 工具                | 说明                                                                              |
| ------------------- | --------------------------------------------------------------------------------- |
| `md_wechat_render`  | 传 `markdown`；`output` 指定 HTML 输出路径（省略则直接返回 HTML）；其余为样式参数 |
| `md_wechat_options` | 列出主题、主色、字体、字号、行高、块间距、图注格式、代码块主题                    |

例：「用 grace 主题、主色 #009874、行高 1.9，把下面内容渲染到 out/weekly.html」。

## 前提条件

- Node ≥ 22.22.2，且仓库根执行过 `pnpm install`
- 已安装 DeepSeek Harness（Desktop 版）

`dsh` CLI 不在 PATH 上，安装脚本会自动找：`--cli` → `DSH_CLI` → PATH → `DSH_NODE_EXECUTABLE` → `DSH_INSTALL_DIR` → 运行中的 DSH 进程 → 卸载注册表 → 常见安装目录。装在非常规位置又没开着 DSH 时，用 `--cli` 指一下即可。

## 出问题了看这里

| 现象                                     | 原因与处理                                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 侧边栏没有新图标                         | 先刷新页面；还是没有就重启 DSH（客户端半片在页面加载时接入）                                             |
| 面板里提示「编辑器没加载出来」/ 接口 404 | Host 半片还是旧模块：重启 DSH。另外确认 `apps/dsh/dist/editor/index.html` 存在（缺就 `pnpm dsh:editor`） |
| `pnpm dsh:editor` 卡住或失败             | 首次要联网下载 MathJax；确认能访问 doocs CDN，或先 `pnpm install`                                        |
| 编辑器里公式/图表不渲染                  | 检查 `/md-wechat/editor/static/libs/mathjax/tex-svg.js` 是否 200；图表走上游逻辑，需要联网加载对应库     |
| 编辑器里报 `TS2591` 之类                 | 这里不是编辑器问题，见下一行                                                                             |
| 代码编辑器报红（找不到 `node:fs`）       | 跑 `pnpm --dir apps/dsh run type-check` 确认代码本身没问题，然后在 IDE 里重启 TS 服务                    |
| `pnpm dsh:install` 找不到 dsh CLI        | 用 `--cli` 指定（见「前提条件」）                                                                        |
| `pnpm dsh:pack` 报「产物不可移植」       | 分发物里混进了本机路径或本地依赖，按提示的文件改                                                         |

## 我们改了上游哪些东西（合并时注意）

| 位置                  | 改动                                                               |
| --------------------- | ------------------------------------------------------------------ |
| `apps/dsh/`（新目录） | 插件全部代码、脚本、文档                                           |
| 根 `package.json`     | `scripts` 里有 `dsh:*`，以及 `build:dsh`（npm 发布前构建 `dist/`） |

其余上游文件一行没动；`apps/dsh` 用到的都是仓库既有依赖（vite、esbuild、@md/core），所以 `pnpm-lock.yaml` 不会多出依赖。上游更新后：

```bash
git pull upstream main     # 冲突基本只在根 package.json 的 scripts，保留两边即可
pnpm install
pnpm dsh:install           # 自动重建编辑器与插件并装好
```

## 需要跟上游一起维护的地方

| 位置                       | 说明                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/build-editor.mjs` | 编辑器构建参数（前缀、`SERVER_ENV`、MathJax 本地化）。上游若改 vite 配置或产物结构，改这里                                            |
| `src/render.ts`            | 渲染管线适配层，等价于 `packages/mcp-server/src/render-article.ts`；上游改 `initRenderer` / `postProcessHtml` / `processCSS` 时跟着改 |
| `src/presets.ts`           | 配色、字体、行高、代码块主题等预设（主题名单不在这里，运行时从 `theme/*.css` 自动发现）                                               |
| `scripts/lib/build.mjs`    | 打包与可移植性校验；上游挪了 `theme-css` 或 `mcp-server` 时改锚点                                                                     |

## 已知限制

- 工具侧（`md_wechat_render`）产出的 HTML 里，KaTeX 与 Mermaid/PlantUML 仍是编辑器复制前的中间态（`katex-pending` / `loading`），需要浏览器补一步；**编辑器面板里不受影响**，公式和图表正常显示。
- 编辑器与插件是同一进程内服务，首次调用工具要把 10 MB 左右 bundle 读进内存（jsdom、mermaid、infographic 是大头）。
- 面板没有做主题同步：编辑器跟随它自己的深浅色设置（默认跟随系统）。

## 目录结构

```text
apps/dsh/
├── package.json            # @doocs/dsh-md，版本与 publishConfig.directory
├── README.npm.md           # 发布到 npm / 插件页的说明（构建时变成 dist/README.md）
├── cordis.patch.yml        # 告诉 DSH 把这个插件插进配置
├── client.js               # 浏览器半片：侧边栏入口 + 编辑器面板
├── locale/{en,zh}.json     # 插件页标题与描述
├── icon.svg                # 插件图标
├── tsconfig.json           # 类型检查（含 src 与 scripts）
├── build/editor/           # 编辑器构建产物（gitignore，打包时进 dist）
├── src/
│   ├── index.ts            # 注册工具 + 挂 HTTP 路由
│   ├── server.ts           # 编辑器静态站点 + /md-wechat/api/*
│   ├── render.ts           # 渲染管线适配层
│   └── presets.ts          # 预设常量
└── scripts/
    ├── build-editor.mjs    # apps/web → build/editor
    ├── install.mjs         # 构建 + 自检 + 自动安装
    ├── pack.mjs            # 构建 + 自检 + 可移植性校验 + zip
    ├── check-routes.mjs    # 假 req/res 跑一遍路由
    ├── smoke.mjs           # 工具与客户端半片自检
    ├── build.mjs           # 只构建插件
    └── lib/{build,zip}.mjs # esbuild 打包 / 零依赖 zip
```

## 已验证

在 doocs/md `2.1.0` + DeepSeek Harness（desktop profile）上：

- `pnpm dsh:check`：编辑器构建、插件构建、工具自检、客户端半片注册、路由自检全通过；
- `pnpm dsh:pack`：可移植性校验通过，zip 约 7 MB，325 个文件；
- `pnpm dsh:install`：自动写入 profile 依赖与 `dsh.profile.bundles`；
- 路由自检实测：编辑器入口 200 且带前缀、本地 MathJax 2.1 MB 可访问、穿越请求 404、未授权 API 403。
