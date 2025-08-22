# Example

## worker.js

公众号 openapi 接口代理服务示例，该项目将请求转发至微信公众号 api。

开发调试：

```bash
cd packages/example
npx wrangler dev worker.js
```

或者安装依赖后启动

```bash
cd packages/example
pnpm i
pnpm dev
```

部署：

请将其部署到 cloudflare workers。
