# @doocs/pdf-cli

**Stirling PDF CLI** — 102 个命令覆盖全部 Stirling-PDF API 端点，通过自托管服务器操作 PDF 文件。

> 基于 [Stirling-PDF](https://github.com/Stirling-Tools/Stirling-PDF) 开源项目的 API，使用 Node.js + commander 实现。

## 安装

```bash
# 在 doocs/md monorepo 中
pnpm install

# 直接使用
node packages/pdf-cli/index.js health

# 或全局链接
cd packages/pdf-cli && npm link
pdf-cli health
```

## 配置

```bash
# 环境变量
export STIRLING_PDF_URL=https://your-stirling-pdf.example.com
export STIRLING_PDF_API_KEY=your-api-key

# 或命令行参数
pdf-cli --url https://... --key xxx health
```

默认服务器：`https://pdf.tc.abp.top`，认证通过 `X-API-KEY` Header。

## 命令一览

### 合并拆分
| 命令 | 说明 |
|------|------|
| `merge <files...> -o <out>` | 合并多个 PDF |
| `split pages <file> -o <out>` | 逐页拆分 |
| `split range <file> --ranges "1-3,5" -o <out>` | 按页码范围拆分 |
| `split size <file> --size 10MB -o <out>` | 按文件大小拆分 |
| `split chapters <file> -o <out>` | 按章节拆分 |
| `split sections <file> -o <out>` | 按节拆分 |
| `split poster <file> -o <out>` | 海报打印拆分 |

### 格式转换 (PDF → X)
| 命令 | 说明 |
|------|------|
| `convert to-img <file> -o <dir> [--format png] [--dpi 300]` | PDF → 图片 |
| `convert to-html <file> -o <out>` | PDF → HTML |
| `convert to-text <file>` | 提取文本 |
| `convert to-word <file> -o <out>` | PDF → DOCX |
| `convert to-pptx <file> -o <out>` | PDF → PPTX |
| `convert to-xlsx <file> -o <out>` | PDF → XLSX |
| `convert to-csv <file> -o <out>` | PDF 表格 → CSV |
| `convert to-xml <file> -o <out>` | PDF → XML |
| `convert to-epub <file> -o <out>` | PDF → EPUB |
| `convert to-pdfa <file> -o <out>` | PDF → PDF/A |
| `convert to-cbr/cbz <file> -o <out>` | PDF → 漫画格式 |
| `convert to-video <file> -o <out>` | PDF → 视频 |
| `convert to-vector <file> -o <out>` | PDF → SVG/DXF |
| `convert to-json <file> -o <out>` | PDF → JSON |

### 格式转换 (X → PDF)
| 命令 | 说明 |
|------|------|
| `convert from-img <files...> -o <out>` | 图片 → PDF |
| `convert from-html <file> -o <out>` | HTML → PDF |
| `convert from-url <url> -o <out>` | 网页 → PDF |
| `convert from-markdown <file> -o <out>` | Markdown → PDF |
| `convert from-svg <file> -o <out>` | SVG → PDF |
| `convert from-ebook <file> -o <out>` | 电子书 → PDF |
| `convert from-email <file> -o <out>` | EML → PDF |
| `convert to-pdf <file> -o <out>` | 任意文件 → PDF |

### 页面操作
| 命令 | 说明 |
|------|------|
| `page rotate <file> -o <out> --angle 90` | 旋转 |
| `page scale <file> -o <out> --factor 1.5` | 缩放 |
| `page crop <file> -o <out>` | 裁剪 |
| `page remove <file> -o <out> --ranges "1,3"` | 删除页 |
| `page rearrange <file> -o <out> --order "3,1,2"` | 重排 |
| `page remove-blanks <file> -o <out>` | 删空白页 |
| `page single <file> -o <out>` | 合并为单页 |
| `page nup <file> -o <out> --rows 2 --cols 3` | N-up 布局 |
| `page booklet <file> -o <out>` | 小册子 |
| `page poster <file> -o <out>` | 海报模式 |

### 安全
| 命令 | 说明 |
|------|------|
| `security lock <file> -o <out> --password xxx` | 加密 |
| `security unlock <file> -o <out> --password xxx` | 解密 |
| `security sign <file> -o <out> --cert cert.p12` | 数字签名 |
| `security sanitize <file> -o <out>` | 清理危险元素 |
| `security redact <file> -o <out> --text "敏感词"` | 涂黑文本 |
| `security validate <file>` | 验证签名 |
| `security verify <file>` | 验证完整性 |

### 信息
| 命令 | 说明 |
|------|------|
| `info all <file>` | 完整信息 |
| `info basic/security/fonts/pages/dimensions/annotations <file>` | 分类信息 |
| `metadata set <file> -o <out> --title "..." --author "..."` | 编辑元数据 |

### 其他
OCR、表单、附件、水印、页码、印章、叠加、过滤器、自动重命名、修复等共 30+ 命令。

## Agent 模式

```bash
# 全局 --json 输出机器可读 JSON
pdf-cli --json info pages document.pdf
pdf-cli --json merge a.pdf b.pdf -o merged.pdf
```

## 依赖

- `commander` — CLI 框架
- `form-data` — multipart 上传
- `node-fetch` — HTTP 客户端
