# 把一个 Web 应用包装成 DSH 插件：清单、菜单、路由与工程化

这份文档来自 `apps/dsh`（doocs/md 的公众号编辑器插件）的实战，目标读者是「要在新仓库里包一个 DSH 插件」的人。
所有结论都对着 **DSH 0.2.2-rc.5（Desktop）** 实测过，标注了「实测」的条目是我们踩过坑的地方。

---

## 0. 先决定形态：三种插件

| 形态                                 | 组成                                             | 适合                              |
| ------------------------------------ | ------------------------------------------------ | --------------------------------- |
| **纯工具插件**（Host only）          | `index.js` 注册 `ctx.tools`                      | 给 Agent 提供能力，不需要界面     |
| **带界面插件**（Host + Client）      | 再加 `client.js` + `dsh.client` 清单 + HTTP 路由 | 侧边栏入口、面板、嵌入式 Web 应用 |
| **纯配置插件**（configuration only） | 只有 patch（如 MCP 桥）                          | 接一个现成服务                    |

只在「给 Agent 用」时，**不要**加界面：工具不出现于侧边栏是设计如此，不是 bug。

---

## 1. 一个 bundle 的最小骨架

### 1.1 `package.json`

```jsonc
{
  "name": "@local/my-plugin", // 客户端模块 id 必须等于它（实测）
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./index.js",
    "./client": "./client.js", // 有界面才需要
    "./locale/*.json": "./locale/*.json",
    "./icon": "./icon.svg"
  },
  "files": ["index.js", "client.js", "locale/*.json", "cordis.patch.yml", "icon.svg", "README.md"],
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": { // 有界面才需要
      "platform": "web",
      "immediately": true,
      "inject": ["@deepseek-ai/dsh-client-runtime"]
    }
  }
}
```

要求：**零运行时依赖**最省心（对方不用 `pnpm install`、不联网）。有依赖就老老实实写，并保证安装方机器能装。

### 1.2 `cordis.patch.yml`

```yaml
- insert:
    - id: my-plugin # row id，全局唯一；与包名分开规划
      name: '@local/my-plugin'
```

### 1.3 Host 入口 `index.js`

```js
export const name = 'my-plugin' // 建议与 row id 一致
export const inject = ['tools'] // 硬依赖：注入了才激活

export function apply(ctx) {
  ctx.tools.register({ /* name, description, parameters, output, execute */ })

  // 可选依赖（如 webServer）必须用 ctx.inject，不能用 ctx.get（见 §3.1）
  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(() => webCtx.webServer.register({ kind: 'prefix', path: '/my-plugin', handler }), 'my-plugin: routes')
  })
}
```

要点：

- `ctx.tools.register(...)` 返回 disposer；习惯上把资源登记在 `ctx.effect(...)` 里，卸载即清理。
- 别在 `apply` 里做重活；大模块用动态 `import()` 延迟加载（我们 10.8 MB 的渲染 bundle 是模块顶层常量，加载慢但可控）。
- **不要**自己往 session log 里塞新事件类型（重放会拒绝），要状态就用 storage / projection。

### 1.4 Client 入口 `client.js`

```js
window.__ModuleLoader__.load({
  id: `@local/my-plugin`, // 必须等于 package.json 的 name（实测）
  factory(require) {
    const React = require(`react`) // 由宿主模块表提供，不要自己装 React
    const h = React.createElement

    function Panel() { return h(`div`, null, `hello`) }
    function Icon({ size = 20, active = false }) { /* 内联 SVG */ }

    return {
      inject: [`slots`],
      apply(ctx) {
        ctx.slots.inject(`main`, () => ctx.slots.register({ name: `main`, key: `my-plugin` }, Panel))
        ctx.slots.inject(`sidebar.panellist`, () =>
          ctx.slots.register({ name: `sidebar.panellist`, id: `my-plugin`, order: 7, label: () => `我的插件` }, Icon))
      },
    }
  },
})
```

Client 侧可用符号只有：`React`、`host.call(method, args)`（与本包 Host 半片的私有 RPC）、`styles.insert(css)`、`ctx`（受限 Context）、`console`。
**不要** `require('@deepseek-ai/dsh-client-ui-*')` 之类的宿主 UI 包，也不要改 `document.body` 或替换应用根。

### 1.5 展示元数据

- `locale/en.json`、`locale/zh.json`：`meta.title`、`meta.description`（写明能力与限制）；可选 `meta.detail` 指向**只含一张图**的文档。
- `icon.svg`：`36×36` viewBox、只画内容不画底块、`currentColor`、无 `<text>`/`<style>`/脚本/`foreignObject`、渲染后不透明区域透明干净、≤ 256 KiB。
- 不声明 `meta.detail` 时，插件页回落到包的 `README.md`，所以 `README.md` 也值得写。

---

## 2. 菜单（侧边栏）：两个 slot 必须成对

实测契约（`Slots.listSubTree`）：

| slot                | 类型              | 注册字段                 | 渲染                              |
| ------------------- | ----------------- | ------------------------ | --------------------------------- |
| `sidebar.panellist` | list（全局图标）  | `{ id, order?, label? }` | 图标组件，收到 `{ size, active }` |
| `main`              | keyed（中央面板） | `{ key }`                | 面板组件                          |

硬规则：

1. **`main.key` 必须等于 `sidebar.panellist.id`**，否则点图标切不过去（我们的单测直接断言这一点）。
2. **id 要用自己的**：复用宿主已经占用的 id 会替换那个 cell；`main` 的 `conversation` 是保留 key。
3. `label` 用 thunk `() => t('title')`，语言切换时 owner 每次投影都会重读。
4. 图标别画底块/背景，宿主会给 tile；`active` 状态用透明度或颜色区分，不要改尺寸。
5. 侧边栏是「最左侧那排图标」，不是对话列表；第一次上线要提醒用户**刷新页面**才会出现。
6. 多面板插件用多个 id，不要一个面板里塞 tab 冒充菜单。

调试决策树（实测有效）：

- 图标不出现 → 看 `Slots.listSubTree` 的 `sidebar.panellist` occupants 里有没有你的 id；没有就是 `client.js` 没注册 / 模块 id 不对 / `dsh.client` 清单缺失 / 页面没刷新。
- 图标有、点了空白 → `main` 的 key 与 id 不一致。
- 面板渲染报错 → 组件抛异常会让该 slot 变空，先在浏览器 console 看 `slot entry crashed`。

---

## 3. 路由：三个最容易翻车的点

### 3.1 必须用 `ctx.inject(['webServer'], cb)`，不要用 `ctx.get`

```js
function apply(ctx) {
  // ❌ 挂载时服务可能还没就绪 → 拿到 undefined → 永久跳过 → 线上 404
  const webServer = ctx.get('webServer')
  if (!webServer)
    return

  // ✅ inject 会等依赖可用再执行（实测把 404 修好了）
  ctx.inject(['webServer'], (webCtx) => {
    const { webServer } = webCtx
    webCtx.effect(() => webServer.register({ kind: 'prefix', path: '/my-plugin', handler }), 'my-plugin: routes')
  })
}
```

`ctx.get` 只反映“当下”，没有重试；`inject` 才是依赖声明。

### 3.2 prefix 按**路径段边界**匹配

注册 `/my-plugin` 时：

- ✅ 匹配 `/my-plugin`、`/my-plugin/`、`/my-plugin/api/...`
- ❌ 不匹配 `/my-plugin-editor`、`/my-pluginfoo`

所以子站点只有两条正路：

- 放在前缀**内部**（推荐）：`/my-plugin/editor/` —— 构建时把站点 base 改成它；
- 或者**单独**注册一条 `/my-plugin-editor` 的 prefix 路由。

别指望「注册一个短前缀，再在 handler 里按路径分发」来兜住 `/my-plugin-editor` —— 那条请求根本进不来（我们因此排查了三轮）。

### 3.3 静态站点要自己写全

```js
async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD')
    return sendJson(res, 405, { error: '只支持 GET/HEAD' })

  const pathname = new URL(req.url ?? '/', 'http://127.0.0.1').pathname
  let relative = decodeURIComponent(pathname.slice(PREFIX.length))
  relative = path.posix.normalize(relative).replace(/^\/+/, '')
  if (relative.startsWith('..'))
    return sendJson(res, 404, { error: '资源不存在' }) // 防穿越

  const target = path.join(ROOT, relative)
  if (target !== ROOT && !target.startsWith(ROOT + path.sep))
    return sendJson(res, 404, { error: '资源不存在' })

  // 目录 → index.html；无扩展名 → SPA 回落 index.html；其余 404
  // content-type 按扩展名，hashed 静态资源给 immutable，入口页 no-cache
}
```

清单：mime 表、`index.html` 回落、`..`/编码穿越防护、方法限制、长缓存策略、错误不泄漏绝对路径。
静态资源可以不鉴权（同源 iframe 天然带 cookie），但**数据接口必须鉴权**。

### 3.4 数据接口鉴权

```js
function authorize(ctx, req, res) {
  const connection = ctx.get('connection')
  if (typeof connection?.requestRejection !== 'function')
    return sendJson(res, 403, { error: '未授权' })
  const rejection = connection.requestRejection({ headers: req.headers }) // 401 等
  if (rejection)
    return sendJson(res, rejection, { error: '未授权' })
}
```

再补：请求体上限（我们 2 MB）、非法 JSON → 400、业务异常 → 500、方法不对 → 405、未知路径 → 404。

### 3.5 用「状态码 + body」区分故障（实测）

| 现象                    | 含义                                           |
| ----------------------- | ---------------------------------------------- |
| 404，**空 body**        | 没进你的代码：前缀不匹配 / 路由没注册          |
| 404，**你的 JSON body** | 进了 handler，是路径或产物问题                 |
| 401，**你的 JSON body** | 路由正常，被鉴权拒（浏览器里带 cookie 就通）   |
| 500                     | handler 抛了：看产物目录是否存在、渲染是否报错 |

把这段「探测三条路由并打印状态码+字节数」写成脚本（`scripts/probe.mjs`），比翻日志快一个数量级。

---

## 4. 安装、热更新与分发

### 4.1 本地安装

DSH 自带 CLI 不在 PATH：`<安装目录>/resources/runtime/cli/bin/dsh.cmd`（macOS 是 `.../bin/dsh`）。

```bash
dsh plugin --profile <profile> add <插件目录>      # 写依赖 + 同步 dsh.profile.bundles
dsh plugin --profile <profile> remove <包名>
```

自动安装脚本要做：CLI 多路探测（`--cli` → `DSH_CLI` → PATH → `DSH_NODE_EXECUTABLE` → `DSH_INSTALL_DIR` → 运行中的进程 → 卸载注册表 → 常见目录）、只在已安装时才 `remove`（否则 pnpm 会报 `ERR_PNPM_CANNOT_REMOVE_MISSING_DEPS` 吓用户一跳）。

### 4.2 热更新：Host 改动必须重启

- **Client 半片**（`client.js`、静态资源）改完 → 刷新页面即可。
- **Host 半片**（工具、路由、`index.js`）改完 → 同路径覆盖安装会命中模块缓存，**必须重启 DSH**（官方文档也这么说）。安装脚本收尾要明确提示，别让用户以为是 bug。
- 排查时如果动过「插件关/开」：`set_bundle false` 会在 `~/.dsh/profiles/<p>/cordis.patch.yml` 留一条 `- id: <row>\n  disabled: true`，而后续 enable 未必清掉（实测踩过）。插件“消失”时先看这个文件。

### 4.3 分发物必须可移植

对方拿到的是目录/zip，不是你的机器。打包时自动校验：

- 文本文件里不出现本机仓库绝对路径（比对本机路径字符串，别用泛化盘符正则 —— 压缩后的 JS 里 `e:/i`、`n:/\n/` 会误报）；
- `package.json` / yaml 里不出现 `link:` / `file:` 本地依赖；
- 不包含 `node_modules`；
- 清单 `files` 覆盖所有运行时资源（含子站点、locale、图标、patch）。

安装方式：解压 → 插件页「添加插件」选目录。zip 只是归档，不是安装格式。

### 4.4 体积与缓存

- 大产物（编辑器、渲染引擎）单独放 `build/` 缓存目录，打包时复制进 `dist/`，不要每次重建；缓存要能自校验（前缀变了就重建）。
- 打包用零依赖实现（自己写 zip / 用仓库已有工具），别让 `pnpm dsh:pack` 依赖某个只在开发机存在的包。

---

## 5. 工程化：自检 ≠ 单测（这次的教训）

我们踩的坑典型：自检脚本直接调 handler（假 req/res）全绿，但真实 host 的**前缀匹配**没覆盖，线上 404 三轮才好。

建议至少三层：

| 层       | 做法                                                                             | 挡住什么                  |
| -------- | -------------------------------------------------------------------------------- | ------------------------- |
| 构建自检 | 直接 `import` 构建产物，注册到假 ctx，跑一次真实业务（如渲染一篇样例）           | 打包坏了、依赖漏了        |
| 路由自检 | 假 `req/res` 打一遍：入口 200、静态 200、404、穿越、鉴权 403、405、非法 JSON 400 | handler 逻辑与路径拼接    |
| 单元测试 | vitest：渲染断言、HTTP 断言、`vm` 跑 `client.js` 断言 slot 注册与 key/id 一致    | 回归（尤其菜单/路由契约） |

关键技巧：

- **让测试摆脱构建产物**：目录用环境变量注入（如 `MYPLUGIN_THEME_DIR`、`MYPLUGIN_EDITOR_DIR`），测试指向源码目录或 `test/fixtures`。
- 插件没有自己的 `node_modules` 时，vitest 可以从别的 workspace 包解析后启动（`createRequire` + `vitest.mjs`），配置里用 `resolve.alias` 指向上游源码。
- `tsconfig` 用 `types: ["node"]` + `allowJs/checkJs` 把 `scripts/*.mjs` 一起查，否则 JSDoc 缺类型不会报。
- 客户端半片用 `node:vm` + 最小 React 桩测注册逻辑，不需要浏览器。

---

## 6. 仓库形态：独立仓库 vs 宿主仓库子目录

|          | 独立仓库（自己拷贝上游源码） | 宿主仓库子目录（我们选的）                           |
| -------- | ---------------------------- | ---------------------------------------------------- |
| 上游更新 | 要手动同步两份代码，冲突多   | `git pull` 即可，构建时直接读上游源码                |
| 冲突面   | 大                           | 只可能落在根 `package.json` 的 scripts 几行          |
| 构建     | 自包含                       | 依赖宿主已有的 `node_modules`（vite/esbuild/上游包） |
| 分发     | 产物自带一切                 | 产物自带一切（构建期依赖不随包）                     |

放在宿主仓库时的原则：

1. **只新增一个目录**，其余上游文件不动（脚本几行是唯一例外，冲突时保留两边）；
2. 构建阶段从上游取源码（`apps/web`、`packages/*`），**不 vendor**；
3. 大产物进 `.gitignore`，克隆后一条命令重建；
4. CI/验收用同一套命令：`check`（构建+自检+单测）、`pack`（可移植 zip）、`install`（装进本地 profile）。

---

## 7. 新仓库开张 checklist

**开工前**

- [ ] 定名：包名、row id、路由前缀、侧边栏 id —— 四者一次规划好，前缀别当别人前缀的子串
- [ ] 定形态：纯工具 / 带界面 / 纯配置
- [ ] 定数据通道：HTTP 路由（推荐）还是 `host.call`
- [ ] 想清楚「上游更新时谁负责什么」

**骨架**

- [ ] `package.json`（exports/files/dsh.bundle/dsh.client）
- [ ] `cordis.patch.yml`（`insert` 一行）
- [ ] `index.js`：`name`/`inject`/`apply`，资源都进 `ctx.effect`
- [ ] `client.js`：id = 包名，`inject: ['slots']`，`sidebar.panellist` + `main` 成对
- [ ] `locale/{en,zh}.json`、`icon.svg`、`README.md`
- [ ] `tsconfig.json`（`types: ["node"]`，含 scripts）

**路由**

- [ ] `ctx.inject(['webServer'], ...)` 注册
- [ ] 子站点放在前缀内部；静态站点写全 mime/回落/穿越/缓存
- [ ] 数据接口鉴权 + 体积上限 + 错误码
- [ ] `scripts/probe.mjs`：三条路由打印状态码与字节数

**工程化**

- [ ] `scripts/{build,pack,install,probe}.mjs`
- [ ] 可移植性校验（无本机路径、无 link/file、无 node_modules）
- [ ] 单测三层（渲染/HTTP/client 注册）
- [ ] 根脚本：`dsh:check` / `dsh:test` / `dsh:pack` / `dsh:install`
- [ ] README 写清：怎么验证、怎么装、怎么发、Host 改动要重启、常见故障表

**上线验收**

- [ ] `check` 全绿
- [ ] `install` 后**重启 DSH**，刷新页面，侧边栏出现入口
- [ ] 点开面板能用；再点「刷新」能重载
- [ ] Agent 工具可调用（新会话里试一次）
- [ ] `pack` 产物解压到别处（或另一台机器）能装、能用
- [ ] `probe` 三条路由状态符合预期（200/200/401）

---

## 8. 常见故障对照表（都实测过）

| 现象                                                       | 最可能原因                                        | 处理                                                      |
| ---------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------- |
| 侧边栏没有入口                                             | client 半片没注册 / id 不对 / 页面没刷新          | 看 occupants；刷新页面                                    |
| 图标有、面板空白                                           | `main.key` ≠ sidebar `id`                         | 改一致                                                    |
| 面板里 iframe 白屏                                         | 站点的 `base` 与路由前缀不一致                    | 构建时 `--base=/前缀/`                                    |
| 路由 404 且空 body                                         | 前缀不匹配 / 路由没注册（`ctx.get` 竞态）         | 用 `ctx.inject`；前缀放进边界内                           |
| 路由 401 有 JSON                                           | 鉴权拒绝                                          | 浏览器里带 cookie 访问；探测脚本加同源头也没用            |
| 路由 500                                                   | handler 抛错：产物目录不存在、渲染失败            | 看自检输出与产物路径                                      |
| 装完一切照旧（旧代码）                                     | Host 模块缓存                                     | 重启 DSH；检查 `cordis.patch.yml` 有没有 `disabled: true` |
| `pnpm ... remove` 报 `ERR_PNPM_CANNOT_REMOVE_MISSING_DEPS` | 未安装就 remove                                   | 脚本先查 profile 依赖再 remove                            |
| 打包后对方装不上                                           | 产物里有绝对路径 / 本地 link 依赖 / 缺 files 条目 | 打包时自动校验并失败                                      |

---

## 9. 规模参考（一次真实测量）

| 项                                                       | 数值                                 |
| -------------------------------------------------------- | ------------------------------------ |
| Host bundle（含 md 渲染管线：jsdom/mermaid/infographic） | 10.8 MB（压缩留空行注释，minify 后） |
| 编辑器子站点（`apps/web` 构建产物）                      | 13.2 MB / 312 文件                   |
| 分发包                                                   | 24.1 MB / 325 文件，zip 7.0 MB       |
| 编辑器构建                                               | 冷启动 ~90 s，缓存命中 ~3 s          |
| 插件单测                                                 | 3 文件 / 21 用例 / ~1 s              |

体积大的核心原因：Node 侧渲染需要 DOM（jsdom）与图表库。如果你的插件只是薄壳（转发请求 / 渲染静态站点），完全可以做到几百 KB。
