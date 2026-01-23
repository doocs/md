# MD-CLI 渲染接口文档

本文档描述了将 Markdown 文本转换为微信公众号兼容 HTML 的 API 接口。

## 接口概览

- **接口地址**: `/api/render`
- **请求方式**: `POST`
- **Content-Type**: `application/json`

## 请求参数

请求体为一个 JSON 对象，支持以下参数：

| 参数名           | 类型     | 必填   | 默认值         | 可选值/说明                                                                                                                                                  |
| :--------------- | :------- | :----- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `markdown`       | `string` | **是** | -              | 需要渲染的 Markdown 源码内容                                                                                                                                 |
| `theme`          | `string` | 否     | `'default'`    | - `'default'`: 默认主题<br>- `'grace'`: 优雅主题<br>- `'simple'`: 简约主题<br>以及其他自定义主题                                                             |
| `primaryColor`   | `string` | 否     | `'#0F4C81'`    | 任何有效的 CSS 颜色值，例如：<br>- Hex: `'#FF0000'`<br>- RGB: `'rgb(255, 0, 0)'`<br>- 颜色名: `'red'`                                                        |
| `fontFamily`     | `string` | 否     | (系统字体栈)\* | 任何有效的 CSS font-family 字符串                                                                                                                            |
| `fontSize`       | `string` | 否     | `'16px'`       | 任何有效的 CSS 字体大小单位，例如：<br>- `'14px'`, `'15px'`, `'17px'`<br>- `'1em'`, `'1.2rem'`                                                               |
| `highlightTheme` | `string` | 否     | `'github'`     | [Highlight.js](https://highlightjs.org/) 支持的所有主题名称，例如：<br>- `'github'`<br>- `'monokai'`<br>- `'dracula'`<br>- `'vs2015'`<br>- `'atom-one-dark'` |

> \*默认字体栈: `"-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif"`

## 响应结构

### 成功响应 (200 OK)

返回 JSON 对象，包含渲染后的 HTML 字符串。

```json
{
  "html": "<section class=\"...\" ..."
}
```

### 错误响应

- **400 Bad Request**: 缺少必填参数

  ```json
  {
    "error": "Markdown content is required"
  }
  ```

- **500 Internal Server Error**: 服务器内部渲染错误
  ```json
  {
    "error": "Error message details..."
  }
  ```

## 调用示例

### 使用 curl 调用

```bash
curl -X POST http://localhost:8800/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello World\n\nThis is a **markdown** text.",
    "theme": "default",
    "primaryColor": "#0F4C81",
    "fontSize": "16px",
    "highlightTheme": "github"
  }'
```

### 使用 JavaScript (Fetch) 调用

```javascript
async function renderMarkdown() {
  const response = await fetch('/api/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      markdown: '## 测试标题\n\n这是一段测试文本。',
      theme: 'default',
      primaryColor: '#ff0000',
      fontSize: '15px'
    })
  })

  const data = await response.json()
  if (response.ok) {
    console.log('Rendered HTML:', data.html)
  }
  else {
    console.error('Error:', data.error)
  }
}
```
