# @md/sync-worker

doocs/md 的云同步后端，基于 **Cloudflare Workers + Hono + D1**，提供 GitHub 登录与文章/偏好的增量同步。

## 能力

- GitHub OAuth 登录，签发自有 JWT（HS256，有效期 30 天）
- 文章与偏好设置的增量同步（`/sync/pull`、`/sync/push`）
- 冲突策略：**last-write-wins**（按 `updateDatetime`），软删除墓碑保证删除可传播
- 数据范围：文章（含 history）+ 偏好白名单；**不包含图床密钥、AI 密钥**

## 数据流

```
前端 ──Bearer JWT──> Worker ──> D1 (users / documents / settings)
```

- `GET  /auth/github` 跳转 GitHub 授权
- `GET  /auth/github/callback` 回调，签发 JWT 后回跳前端（token 在 URL fragment）
- `GET  /me` 当前用户
- `GET  /sync/pull?since=<ms>` 拉取游标之后的变更
- `POST /sync/push` 推送本地变更（LWW 合并）

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
```

`APP_URL`（前端地址，CORS 白名单 + 登录回跳，多个用英文逗号分隔）在
[`wrangler.toml`](./wrangler.toml) 的 `[vars]` 中配置，例如 `https://md.doocs.org`。

### 5. 本地运行 / 部署

```bash
pnpm sync dev      # 本地 http://localhost:8787
pnpm sync deploy   # 部署到 Cloudflare
```

### 6. 前端接入

在 `apps/web/.env`（参考 [`apps/web/.env.example`](../web/.env.example)）设置：

```
VITE_SYNC_API_URL=https://<your-worker-domain>
```

前端顶栏会出现云图标入口；登录后即可手动 / 自动同步。

## 说明与限制

- 前端约定「先 pull 再 push」，`push` 仅返回本次被接受的记录与新游标。
- 偏好设置应用到本地后需刷新页面生效（前端会给出提示），文章为即时生效。
- 同步白名单见 `apps/web/src/services/sync/settings.ts`，新增可同步项请在此维护，
  切勿加入任何密钥类字段。
