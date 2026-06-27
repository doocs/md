# 金山文档对接功能文档（迁移用）

> 本文档整理 md2wechat-web 项目中金山文档（KDocs）对接的完整技术细节，用于迁移到其他平台。

---

## 1. 架构概览

```
浏览器 (localStorage 配置)
  ↓ POST /api/fetch-data {token, webhook, sheetId}
Netlify Function (fetch-data.js)  ← 服务端代理（解决 CORS）
  ↓ POST webhook URL + AirScript-Token header
金山文档 AirScript 后台 (云端脚本)
  ↓ 查询多维表格数据
返回 records[] → 浏览器缓存 → 模板渲染 → Markdown → 微信 HTML
```

**关键特点**：无服务端状态，所有配置存 localStorage，Netlify Function 仅做代理转发。

---

## 2. 配置参数

| 参数 | localStorage Key | 默认值 | 说明 |
|---|---|---|---|
| AirScript Token | `kdocs_token` | 无 | 金山文档脚本管理中的认证 Token |
| Webhook URL | `kdocs_webhook` | （见下方示例） | 金山文档脚本管理中的云端 webhook，每个文件不同 |
| 数据表 ID | `kdocs_sheet_id` | `8` | 多维表格中的表 ID（案例数据总台账） |

**Webhook URL 示例**（特定文件地址，迁移时需替换）：
```
https://www.kdocs.cn/api/v3/ide/file/csgbbXAoJgsU/script/V2-1pOgfYHUM3Jga7Fiaty27R/sync_task
```

---

## 3. API 接口

### 3.1 获取记录（getRecords）

**请求**：
```
POST <webhook_url>
Headers:
  AirScript-Token: <token>
  Content-Type: application/json
Body:
{
  "Context": {
    "argv": {
      "type": "getRecords",
      "sheetID": 8,
      "data": {
        "filter": {}
      }
    }
  }
}
```

**响应**（多种格式兼容）：
```json
{
  "success": true,
  "records": [
    {
      "id": "rec_xxx",
      "fields": {
        "案例标题": "郭某某诉邓某某离婚纠纷案",
        "案例类型": "离婚纠纷",
        "我方角色": "被告代理律师",
        "承办律师": "何官益、谢洁",
        "案件结果": "...",
        "案件详情": "..."
      }
    }
  ],
  "fields": ["案例标题", "案例类型", "我方角色", "承办律师", ...]
}
```

**响应解析逻辑**（4 级兼容）：
```javascript
const data = resp.data?.result?.data
  || resp.data
  || resp.data?.records
  || resp.records;
```

### 3.2 其他支持的操作

| 操作 | type | 说明 |
|---|---|---|
| 获取记录 | `getRecords` | 分页查询，支持筛选 |
| 搜索记录 | `searchRecords` | 关键词搜索 |
| 创建记录 | `createRecords` | 批量插入 |
| 更新记录 | `updateRecords` | 按 ID 更新 |
| 删除记录 | `deleteRecords` | 按 ID 删除 |
| 获取单条 | `getRecord` | 按 ID 查询 |
| 上传附件 | `createRecordsWithAttachment` | 带附件创建 |
| 获取附件 URL | `getAttachmentURL` | 获取附件下载链接 |

**请求格式统一**：
```json
{
  "Context": {
    "argv": {
      "type": "<操作类型>",
      "sheetID": <表ID>,
      "data": { ... }
    }
  }
}
```

---

## 4. 数据流

```
1. 用户配置 Token/Webhook/SheetId → localStorage
2. 点击"数据导入" → fetchRecords()
3. POST /api/fetch-data → Netlify Function 代理
4. Function 转发到金山文档 webhook（带 AirScript-Token）
5. 返回 records[] → 内存缓存 (cachedRecords)
6. 侧边栏渲染记录列表（支持搜索/筛选/拖拽排序）
7. 用户选择记录 → 应用模板 → 生成 Markdown
8. Markdown 写入编辑器 → 实时转换为微信 HTML
```

---

## 5. 模板系统

### 5.1 模板语法

用 `【字段名】` 作为占位符，生成时替换为记录的实际值。

### 5.2 预设模板

**default（案例分析）**：
```markdown
# 【案例标题】

## 案件概述
- **案例类型**：【案例类型】
- **我方角色**：【我方角色】
- **承办律师**：【承办律师】

## 案件详情
【案件详情】

## 案件结果
【案件结果】
```

**brief（案例简报）**：
```markdown
## 【案例标题】
**类型**：【案例类型】 | **角色**：【我方角色】
**结果**：【案件结果】
```

**compile（案例汇编）**：
```markdown
---
title: 广东岭南律师事务所婚姻家事团队案例汇编
subtitle: 婚姻家事法律服务的专业实践与典型成果
---

## 导语
（自动生成）

## 典型性代表业绩
（按类型分组，每条记录生成一个案例条目）
```

### 5.3 模板功能

- **斜杠命令**：输入 `/` 弹出字段列表，选择插入 `【字段名】`
- **拖拽插入**：从字段列表拖拽到模板编辑器
- **实时预览**：编辑模板时实时预览渲染效果
- **持久化**：模板保存到 localStorage

---

## 6. AI 润色

### 6.1 支持的 AI 供应商

| 供应商 | 默认 Base URL | 默认模型 |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| SiliconFlow | `https://api.siliconflow.cn/v1` | `Qwen/Qwen2.5-7B-Instruct` |
| MiniMax | `https://api.minimax.chat/v1` | `MiniMax-Text-01` |
| 小米 MiLM | `https://api.xiaomi.com/v1` | `MiLM-7B` |

### 6.2 调用方式

OpenAI 兼容的 `chat/completions` 接口：

```javascript
POST <base_url>/chat/completions
Headers:
  Authorization: Bearer <api_key>
  Content-Type: application/json
Body:
{
  "model": "<model>",
  "messages": [
    { "role": "system", "content": "你是一位专业的法律文书编辑..." },
    { "role": "user", "content": "<模板渲染后的 Markdown>" }
  ]
}
```

### 6.3 AI 润色流程

1. 用户选择记录 → 应用模板生成 Markdown
2. 逐条记录调用 AI API（顺序执行，避免并发）
3. AI 返回润色后的 Markdown
4. 合并所有润色结果 → 写入编辑器

---

## 7. 服务端代理

### `src/functions/fetch-data.js`

Netlify Function，职责单一：代理浏览器到金山文档的请求。金山文档 webhook 不支持 CORS，浏览器直接请求会被拦截，Netlify Function 做服务端转发。

```javascript
// 核心逻辑
const resp = await fetch(webhook, {
  method: 'POST',
  headers: {
    'AirScript-Token': token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    Context: {
      argv: {
        type: 'getRecords',
        sheetID: parseInt(sheetId) || 8,
        data: { filter },
      },
    },
  }),
});
```

---

## 8. 分享链接功能

### 8.1 架构

```
用户点击"生成分享链接"
  ↓ POST /api/convert {markdown, theme, save: true}
Netlify Function (convert.js)
  ↓ 转换 Markdown → HTML
  ↓ nanoid(8) 生成短 ID
  ↓ Netlify Blobs 存储 {id: html}
  ↓ 返回 {id, html, theme}
浏览器打开 /s/<id>
  ↓ GET /s/:id → share.js
  ↓ Netlify Blobs 查询 id → 返回 HTML
直接渲染文章页面
```

### 8.2 API

**创建分享**：
```
POST /api/convert
Body: { markdown: "...", theme: "default", save: true }
Response: { id: "a1b2c3d4", html: "...", theme: "default" }
```

**访问分享**：
```
GET /s/a1b2c3d4
Response: HTML（完整文章页面，可直接渲染）
```

### 8.3 存储

使用 Netlify Blobs（`getStore('articles')`），以 nanoid 为 key，HTML 为 value。无过期时间，持久存储。

---

## 9. 迁移注意事项

1. **AirScript Token**：用户需要在金山文档脚本管理中获取，迁移后需重新配置
2. **Webhook URL**：每个金山文档文件的 webhook URL 不同，迁移后需更新
3. **Sheet ID**：多维表格中的表 ID，需确认目标表格的 ID
4. **字段映射**：模板中的 `【字段名】` 需与目标表格的字段名一致
5. **CORS 代理**：如果新平台不支持服务端函数，需要其他方式解决跨域
6. **AI API**：OpenAI 兼容接口，迁移时保持 `chat/completions` 格式即可
7. **分享存储**：需替换 Netlify Blobs 为数据库/对象存储

---

## 10. 相关文件索引

| 文件 | 说明 |
|---|---|
| `src/functions/fetch-data.js` | Netlify Function 代理（KDocs 数据） |
| `src/functions/convert.js` | POST /api/convert，转换 + 分享存储 |
| `src/functions/share.js` | GET /s/:id，分享链接读取 |
| `src/site/js/settings.js` | 配置 UI（Token/Webhook/SheetId/AI） |
| `src/site/js/sidebar.js` | 数据获取、模板、AI 润色核心逻辑 |
| `src/site/js/constants.js` | localStorage Keys、AI 供应商预设 |
| `src/site/js/dom.js` | DOM 元素引用 |
| `docs/金山文档/金山文档云端对接接口.js` | AirScript 后台完整代码（1202 行） |
| `docs/金山文档/金山文档请求端调用示例.js` | 客户端调用示例 |
| `docs/金山文档/诉讼案件要素.xlsx` | 字段结构参考 |
