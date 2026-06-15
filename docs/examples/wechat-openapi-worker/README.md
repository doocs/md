# 微信公众号 OpenAPI 代理 Worker

公众号 OpenAPI 接口代理服务示例，将请求转发至 `https://api.weixin.qq.com`。

> 此为独立示例，不在 pnpm workspace 内。生产环境请使用 `apps/web/worker/`（与主站部署集成）或 `apps/api` 的上传代理。

## 开发调试

```bash
cd docs/examples/wechat-openapi-worker
npx wrangler dev worker.js
```

## 部署

将其部署到 Cloudflare Workers 即可。
