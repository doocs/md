# Example

## worker.js

公众号openapi接口代理服务示例，该项目将请求转发至微信公众号api。

开发调试：

```
cd example
npx wrangler dev worker.js
```
或者安装依赖后启动
```
cd example
pnpm i
pnpm dev
```

部署：

请将其部署到cloudflare workers。
