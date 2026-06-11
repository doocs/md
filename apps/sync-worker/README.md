# @md/sync-worker

doocs/md 的云同步后端，基于 **Cloudflare Workers + Hono + D1**，提供 GitHub 登录与文章/偏好的增量同步。

## 能力

- GitHub OAuth 登录，签发自有 JWT（HS256，有效期 30 天）
- 文章与偏好设置的增量同步（`/sync/pull`、`/sync/push`）
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
- `POST /webhooks/afdian` 爱发电订单 Webhook

## 部署步骤

### 1. 创建 D1 数据库

```bash
pnpm sync exec wrangler d1 create md-sync
```

把输出的 `database_id` 填入 [`wrangler.toml`](./wrangler.toml) 的 `database_id`。

### 2. 执行迁移

```bash
pnpm sync db:migrate:local    # 本地开发库
pnpm sync db:migrate:remote   # 生产库
```

### 3. 配置 GitHub OAuth App

在 GitHub → Settings → Developer settings → OAuth Apps 新建应用：

- **Authorization callback URL**：`https://<your-worker-domain>/auth/github/callback`
  （本地开发：`http://localhost:8787/auth/github/callback`）

### 4. 设置密钥与变量

```bash
pnpm sync exec wrangler secret put GITHUB_CLIENT_ID
pnpm sync exec wrangler secret put GITHUB_CLIENT_SECRET
pnpm sync exec wrangler secret put JWT_SECRET     # 任意高强度随机串
pnpm sync exec wrangler secret put AFDIAN_API_TOKEN
```

`APP_URL`、`AFDIAN_USER_ID` 在 [`wrangler.toml`](./wrangler.toml) 的 `[vars]` 中配置。

本地开发可复制 [`.dev.vars.example`](./.dev.vars.example) 为 `.dev.vars` 并填入密钥。

### 5. 爱发电配置

1. 在 [afdian.com 开发者后台](https://afdian.com/dashboard/dev) 配置 Webhook：
   `https://<your-worker-domain>/webhooks/afdian`
2. 创建 Pro 赞助方案（月/季/年），引导用户在付款备注填写 **GitHub 用户名**
3. 可选：在 `wrangler.toml` 设置 `AFDIAN_PRO_PLAN_IDS` 限定可开通的方案 ID

### 6. 本地运行 / 部署

```bash
pnpm sync dev      # 本地 http://localhost:8787
pnpm sync deploy   # 部署到 Cloudflare
```

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

| 能力         | 免费       | Pro         |
| ------------ | ---------- | ----------- |
| 手动同步     | ✅         | ✅          |
| 自动同步防抖 | 5 分钟     | 3 秒        |
| 同步频率上限 | 30 次/小时 | 300 次/小时 |

爱发电每赞助 1 个月 = **31 天** Pro 有效期。

## 说明与限制

- 前端约定「先 pull 再 push」，`push` 仅返回本次被接受的记录与新游标。
- 偏好设置应用到本地后需刷新页面生效（前端会给出提示），文章为即时生效。
- 同步白名单见 `apps/web/src/services/sync/settings.ts`，新增可同步项请在此维护，
  切勿加入任何密钥类字段。
