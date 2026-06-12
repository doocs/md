# @md/api

doocs/md 的后端 API，基于 **Cloudflare Workers + Hono + D1**，提供 GitHub 账户登录、文章/偏好的增量云同步与 Pro 计费。

## 能力

- GitHub OAuth 登录，签发自有 JWT（HS256，有效期 30 天）
- 文章与偏好设置的增量同步（`/sync/pull`、`/sync/push`）
- **预览分享**：登录用户可将编辑器预览快照发布为只读链接（`/share` → `GET /s/:id`），支持访问密码，默认 1 天过期
- **免费 / Pro 套餐**：Pro 支持更高同步频率；免费版限 30 次/小时，Pro 限 300 次/小时
- **爱发电 Pro 开通**：Webhook 自动激活 + 订单号手动激活
- 冲突策略：**last-write-wins**（按 `updateDatetime`），软删除墓碑保证删除可传播
- 数据范围：文章（含 history）+ 偏好白名单；**不包含图床密钥、AI 密钥**

## 数据流

```
前端 ──Bearer JWT──> Worker ──> D1 (users / documents / settings)
爱发电 ──Webhook──> Worker ──> 更新 users.plan
```

- `GET  /auth/github` 跳转 GitHub 授权
- `GET  /auth/github/callback` 回调，签发 JWT 后回跳前端（token 在 URL fragment）
- `GET  /me` 当前用户（含 `plan`、`planExpiresAt`）
- `GET  /sync/pull?since=<ms>` 拉取游标之后的变更
- `POST /sync/push` 推送本地变更（LWW 合并）
- `POST /sync/activate` 用爱发电订单号激活 Pro（需登录）
- `POST /share` 创建/更新预览分享（需登录；按 `user_id + post_id` 去重）
- `GET  /s/:shareId` 只读分享页（有密码时需先解锁）
- `POST /s/:shareId/unlock` 校验分享密码并写入访问 Cookie
- `POST /webhooks/afdian` 爱发电订单 Webhook

## 部署步骤

### 1. 创建 D1 数据库

```bash
pnpm api exec wrangler d1 create md-sync
```

把输出的 `database_id` 填入 [`wrangler.toml`](./wrangler.toml) 的 `database_id`。

### 2. 执行迁移

```bash
pnpm api db:migrate:local    # 本地开发库
pnpm api db:migrate:remote   # 生产库
```

### 3. 配置 GitHub OAuth App

在 GitHub → Settings → Developer settings → OAuth Apps 新建应用：

- **Authorization callback URL**：`https://<your-worker-domain>/auth/github/callback`
  （本地开发：`http://localhost:8787/auth/github/callback`）

### 4. 设置密钥与变量

```bash
pnpm api exec wrangler secret put GITHUB_CLIENT_ID
pnpm api exec wrangler secret put GITHUB_CLIENT_SECRET
pnpm api exec wrangler secret put JWT_SECRET     # 任意高强度随机串
pnpm api exec wrangler secret put AFDIAN_API_TOKEN
pnpm api exec wrangler secret put AFDIAN_WEBHOOK_TOKEN  # 可选：Webhook 路径密钥
```

`APP_URL`、`AFDIAN_USER_ID` 在 [`wrangler.toml`](./wrangler.toml) 的 `[vars]` 中配置。

本地开发可复制 [`.dev.vars.example`](./.dev.vars.example) 为 `.dev.vars` 并填入密钥。

### 5. 爱发电配置

1. 在 [afdian.com 开发者后台](https://afdian.com/dashboard/dev) 配置 Webhook：
   `https://<your-worker-domain>/webhooks/afdian`
   若设置了 `AFDIAN_WEBHOOK_TOKEN`，地址改为 `https://<your-worker-domain>/webhooks/afdian/<token>`
2. 创建 Pro 赞助方案（月/季/年），引导用户在付款备注填写 **GitHub 用户名**
3. 可选：在 `wrangler.toml` 设置 `AFDIAN_PRO_PLAN_IDS` 限定可开通的方案 ID

> **安全说明**：本服务代码公开托管，Webhook 回调内容**不可信任**。Worker 收到回调后
> 只取订单号，再用爱发电 Open API 反查真实订单（以服务端返回为准）后才开通 Pro，
> 因此伪造回调无法骗取 Pro。建议同时设置 `AFDIAN_WEBHOOK_TOKEN` 作为路径密钥，
> 防止公开端点被刷量、空耗爱发电 API 配额。

### 6. 本地运行 / 部署

```bash
pnpm api dev      # 本地 http://localhost:8787
pnpm api deploy   # 部署到 Cloudflare
```

> **Worker 改名迁移（md-sync → md-api）**：本服务的 Cloudflare worker 名已由 `md-sync` 更名为 `md-api`。
> 若你此前部署过 `md-sync`，首次 `pnpm api deploy` 会创建全新的 `md-api` worker，需要在新 worker 上**重新设置所有 secret**
> （见上方第 4 步），自定义域名 `md-api.doocs.org` 会指向新 worker；确认无误后可在 Cloudflare 控制台删除旧的 `md-sync` worker。
> D1 数据库（资源名仍为 `md-sync`）按 `database_id` 绑定，数据不受影响。

### 7. 前端接入

在 `apps/web/.env`（参考 [`apps/web/.env.example`](../web/.env.example)）设置：

```
VITE_SYNC_API_URL=https://<your-worker-domain>
VITE_AFDIAN_PAGE_URL=https://ifdian.net/a/doocs
VITE_AFDIAN_ORDER_BASE=https://ifdian.net
```

官方 Pro 方案 plan_id（已写入 `wrangler.toml` 的 `AFDIAN_PRO_PLAN_IDS`）：

| 档位 | plan_id                            |
| ---- | ---------------------------------- |
| 月付 | `81efdc48655711f18b6d52540025c377` |
| 季付 | `ced9acca655a11f1a7cc52540025c377` |
| 年付 | `df5084a2655a11f1bea45254001e7c00` |

## 套餐说明

| 能力              | 免费       | Pro           |
| ----------------- | ---------- | ------------- |
| 手动同步          | ✅         | ✅            |
| 自动同步          | —          | 编辑后约 3 秒 |
| 同步频率上限      | 30 次/小时 | 300 次/小时   |
| 分享（新建/更新） | 2 次/天    | 不限          |

爱发电每赞助 1 个月 = **31 天** Pro 有效期。

## 说明与限制

- 前端约定「先 pull 再 push」，`push` 仅返回本次被接受的记录与新游标。
- 偏好设置应用到本地后需刷新页面生效（前端会给出提示），文章为即时生效。
- 同步白名单见 `apps/web/src/services/sync/settings.ts`，新增可同步项请在此维护，
  切勿加入任何密钥类字段。
