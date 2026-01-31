# MD-CLI 渲染接口文档

本文档描述了将 Markdown 文本转换为微信公众号兼容 HTML 的 API 接口。

## 接口概览

| 接口               | 说明                                 | 返回格式 |
| ------------------ | ------------------------------------ | -------- |
| `/api/render`      | 渲染 Markdown 为 HTML 片段           | JSON     |
| `/api/render/html` | 渲染 Markdown 为完整 HTML 页面并下载 | 文件流   |

**服务地址**: `http://localhost:8800`

---

## 1. 渲染 API (`/api/render`)

将 Markdown 内容转换为 HTML 片段，返回 JSON 格式数据。

- **接口地址**: `/api/render`
- **请求方式**: `POST`
- **Content-Type**: `application/json`

### 请求参数

#### 基础参数

| 参数名           | 类型     | 必填   | 默认值         | 可选值/说明                                                                                                                                                                                                                                                                                                                      |
| :--------------- | :------- | :----- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `markdown`       | `string` | **是** | -              | 需要渲染的 Markdown 源码内容                                                                                                                                                                                                                                                                                                     |
| `path`           | `string` | 否     | -              | Markdown 文件路径（与 `markdown` 二选一）                                                                                                                                                                                                                                                                                        |
| `theme`          | `string` | 否     | `'default'`    | - `'default'`: 经典主题<br>- `'grace'`: 优雅主题<br>- `'simple'`: 简洁主题                                                                                                                                                                                                                                                       |
| `primaryColor`   | `string` | 否     | `'#0F4C81'`    | 主题色，支持任意 CSS 颜色值。预设主题色参考：<br>- 经典蓝: `'#0F4C81'`<br>- 翡翠绿: `'#009874'`<br>- 活力橘: `'#FA5151'`<br>- 柠檬黄: `'#FECE00'`<br>- 薰衣紫: `'#92617E'`<br>- 天空蓝: `'#55C9EA'`<br>- 玫瑰金: `'#B76E79'`<br>- 橄榄绿: `'#556B2F'`<br>- 石墨黑: `'#333333'`<br>- 雾烟灰: `'#A9A9A9'`<br>- 樱花粉: `'#FFB7C5'` |
| `fontFamily`     | `string` | 否     | (系统字体栈)\* | 任何有效的 CSS font-family 字符串                                                                                                                                                                                                                                                                                                |
| `fontSize`       | `string` | 否     | `'16px'`       | 任何有效的 CSS 字体大小单位，例如：<br>- `'14px'`, `'15px'`, `'17px'`<br>- `'1em'`, `'1.2rem'`                                                                                                                                                                                                                                   |
| `highlightTheme` | `string` | 否     | `'github'`     | [Highlight.js](https://highlightjs.org/) 支持的所有主题名称，例如：<br>- `'github'`<br>- `'monokai'`<br>- `'dracula'`<br>- `'vs2015'`<br>- `'atom-one-dark'`                                                                                                                                                                     |

> \*默认字体栈: `"-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif"`

#### 样式配置参数

| 参数名             | 类型      | 必填 | 默认值    | 说明                                                                                                                                                   |
| :----------------- | :-------- | :--- | :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isMacCodeBlock`   | `boolean` | 否   | `true`    | 是否显示 Mac 风格代码块（带红黄绿三个圆点）                                                                                                            |
| `isShowLineNumber` | `boolean` | 否   | `false`   | 是否显示代码块行号                                                                                                                                     |
| `legend`           | `string`  | 否   | `'alt'`   | 图注显示格式：<br>- `'alt'`: 只显示 alt<br>- `'title'`: 只显示 title<br>- `'alt-title'`: alt 优先<br>- `'title-alt'`: title 优先<br>- `'none'`: 不显示 |
| `isCiteStatus`     | `boolean` | 否   | `false`   | 是否开启微信外链接引用（在文末显示引用链接列表）                                                                                                       |
| `isCountStatus`    | `boolean` | 否   | `false`   | 是否显示字数统计和阅读时间                                                                                                                             |
| `isUseIndent`      | `boolean` | 否   | `false`   | 是否开启段落首行缩进（2em）                                                                                                                            |
| `isUseJustify`     | `boolean` | 否   | `false`   | 是否开启段落两端对齐                                                                                                                                   |
| `themeMode`        | `string`  | 否   | `'light'` | 主题模式：<br>- `'light'`: 浅色模式<br>- `'dark'`: 深色模式                                                                                            |

### 响应结构

**成功响应 (200 OK)**

```json
{
  "html": "<div class=\"preview-wrapper\" ...>...</div>"
}
```

**错误响应**

- **400 Bad Request**: 缺少必填参数或文件未找到
  ```json
  { "error": "Markdown content is required" }
  ```
  或
  ```json
  { "error": "File not found" }
  ```
- **500 Internal Server Error**: 服务器内部错误
  ```json
  { "error": "Error message details..." }
  ```

---

## 2. 渲染并下载 API (`/api/render/html`)

将 Markdown 渲染为完整的 HTML 页面文件，保存到本地 `Downloads` 目录并触发下载。

- **接口地址**: `/api/render/html`
- **请求方式**: `POST`
- **Content-Type**: `application/json`

### 请求参数

与 `/api/render` 接口相同，另外支持以下参数：

| 参数名  | 类型     | 必填 | 默认值                      | 说明                                      |
| :------ | :------- | :--- | :-------------------------- | :---------------------------------------- |
| `title` | `string` | 否   | `'Markdown Render Preview'` | HTML 页面标题，如未指定则自动从文件名提取 |

### 行为说明

1. 接收 Markdown 内容或文件路径
2. 调用 `/api/render` 的渲染逻辑生成 HTML 片段
3. 封装为完整的 HTML 文档（包含 `<html>`, `<head>`, `<body>` 和基础样式）
4. **自动保存**: 将生成的文件保存到用户的 `~/Downloads` 目录
   - 如果提供了 `path`，文件名与源文件名一致（后缀改为 `.html`）
   - 否则文件名为 `output.html`
5. **响应下载**: 返回文件下载流

### 响应结构

- **成功 (200 OK)**: 返回文件流，触发浏览器下载
- **失败 (400/500)**: 返回纯文本错误信息

---

## 调用示例

### 基础调用 - `/api/render` (curl)

```bash
curl -X POST http://localhost:8800/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello World\n\nThis is a **markdown** text.",
    "theme": "default",
    "primaryColor": "#0F4C81"
  }'
```

### 完整参数调用 - `/api/render` (curl)

```bash
curl -X POST http://localhost:8800/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# 标题\n\n**加粗**文本和`代码`\n\n> 引用块\n\n- 列表项\n\n[链接](https://example.com)",
    "theme": "grace",
    "primaryColor": "#009874",
    "fontSize": "16px",
    "highlightTheme": "github",
    "isMacCodeBlock": true,
    "isShowLineNumber": true,
    "legend": "alt",
    "isCiteStatus": true,
    "isCountStatus": true,
    "isUseIndent": true,
    "isUseJustify": false,
    "themeMode": "light"
  }'
```

### 下载 HTML 文件 - `/api/render/html` (curl)

```bash
curl -X POST http://localhost:8800/api/render/html \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# 我的文档\n\n这是正文内容...",
    "title": "我的文档",
    "theme": "grace",
    "primaryColor": "#009874",
    "isCiteStatus": true
  }' --output my-document.html
```

### 使用 JavaScript (Fetch) 调用

```javascript
// 调用 /api/render 获取 HTML 片段
async function renderMarkdown() {
  const response = await fetch('http://localhost:8800/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      markdown: '## 测试标题\n\n这是一段测试文本。\n\n[链接](https://example.com)',
      theme: 'grace',
      primaryColor: '#009874',
      fontSize: '16px',
      isCiteStatus: true,
      isCountStatus: true,
      isUseIndent: true
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

// 调用 /api/render/html 下载文件
async function downloadHtml() {
  const response = await fetch('http://localhost:8800/api/render/html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      markdown: '# 标题\n\n正文内容...',
      title: '我的文档',
      theme: 'grace'
    })
  })

  if (response.ok) {
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'output.html'
    a.click()
  }
}
```

### 使用 Python 调用

```python
import requests

# 调用 /api/render 获取 HTML 片段
def render_markdown():
    url = "http://localhost:8800/api/render"
    payload = {
        "markdown": "# 标题\n\n**加粗**文本\n\n> 引用\n\n[链接](https://example.com)",
        "theme": "grace",
        "primaryColor": "#009874",
        "isCiteStatus": True,
        "isCountStatus": True,
        "isUseIndent": True
    }

    response = requests.post(url, json=payload)

    if response.status_code == 200:
        html = response.json()["html"]
        print("渲染成功，HTML 长度:", len(html))
    else:
        print("错误:", response.json()["error"])

# 调用 /api/render/html 下载文件
def download_html():
    url = "http://localhost:8800/api/render/html"
    payload = {
        "markdown": "# 标题\n\n正文内容...",
        "title": "我的文档",
        "theme": "grace"
    }

    response = requests.post(url, json=payload)

    if response.status_code == 200:
        with open("output.html", "wb") as f:
            f.write(response.content)
        print("文件已保存")
    else:
        print("错误:", response.text)
```

---

## 启动服务

```bash
cd packages/md-cli
node index.js
```

服务默认运行在 `http://localhost:8800`。
