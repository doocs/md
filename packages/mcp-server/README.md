# @md/mcp-server

MCP (Model Context Protocol) server for [doocs/md](https://github.com/doocs/md).

Exposes the `doocs/md` markdown rendering engine and AI service configuration to AI agent runtimes (Claude Desktop, Cursor, VS Code Copilot, etc.) via the standard MCP protocol over **stdio**.

## Prerequisites

- **Node.js** ≥ 22.22.2（与 monorepo 根目录 `.nvmrc` 一致）
- **pnpm** ≥ 9（monorepo workspace）
- Clone the monorepo and install dependencies:

```bash
git clone https://github.com/doocs/md.git
cd md
pnpm install
```

## Tools

### `render_markdown`

Convert Markdown text to styled HTML using the full doocs/md rendering pipeline.

| Parameter          | Type                               | Default     | Description                                           |
| ------------------ | ---------------------------------- | ----------- | ----------------------------------------------------- |
| `markdown`         | `string`                           | —           | Markdown source text                                  |
| `theme`            | `"default" \| "grace" \| "simple"` | `"default"` | Visual theme (经典 / 优雅 / 简洁)                     |
| `primaryColor`     | `string (hex)`                     | `"#0F4C81"` | Primary accent color (see `list_colors`)              |
| `fontFamily`       | `string`                           | 无衬线预设  | Font family stack (see `list_fonts`)                  |
| `fontSize`         | `string (px)`                      | `"16px"`    | Base font size (see `list_font_sizes`)                |
| `legend`           | `string`                           | `"alt"`     | Image caption format (see `list_legend_formats`)      |
| `isMacCodeBlock`   | `boolean`                          | `false`     | Render code blocks with a macOS-style title bar       |
| `isShowLineNumber` | `boolean`                          | `false`     | Show line numbers in code blocks                      |
| `citeStatus`       | `boolean`                          | `false`     | Convert links to footnote-style citations             |
| `countStatus`      | `boolean`                          | `false`     | Prepend a reading-time estimate                       |
| `themeMode`        | `"light" \| "dark"`                | `"light"`   | Color mode for diagram extensions                     |
| `isUseIndent`      | `boolean`                          | `false`     | Indent paragraph first lines                          |
| `isUseJustify`     | `boolean`                          | `false`     | Justify paragraph text                                |
| `headingStyles`    | `object`                           | `{}`        | Per-level heading styles (see `list_heading_styles`)  |
| `codeBlockTheme`   | `string (url)`                     | GitHub 主题 | highlight.js theme URL (see `list_code_block_themes`) |
| `customCSS`        | `string`                           | `""`        | Additional custom CSS (highest priority)              |

Returns `{ html, frontMatter, readingTime: { words, minutes } }`.

### Other tools

| Tool                     | Description                                                                       |
| ------------------------ | --------------------------------------------------------------------------------- |
| `list_themes`            | List all available visual themes with labels and authors                          |
| `list_colors`            | List all available primary accent colors                                          |
| `list_fonts`             | List preset font family options                                                   |
| `list_font_sizes`        | List preset font size options                                                     |
| `list_legend_formats`    | List image caption format options                                                 |
| `list_heading_styles`    | List heading style presets                                                        |
| `list_code_block_themes` | List highlight.js code block theme URLs                                           |
| `list_ai_services`       | List all built-in AI service providers with endpoints and models                  |
| `explain_extensions`     | Describe every Markdown extension beyond CommonMark (KaTeX, Mermaid, PlantUML, …) |
| `get_renderer_options`   | Describe all renderer configuration options                                       |

## Setup

### VS Code (GitHub Copilot)

Add to `.vscode/mcp.json` in the project root (already included in this repo):

```json
{
  "servers": {
    "md": {
      "type": "stdio",
      "command": "node",
      "args": ["--import", "tsx/esm", "${workspaceFolder}/packages/mcp-server/run.mjs"],
      "cwd": "${workspaceFolder}/packages/mcp-server"
    }
  }
}
```

Then open the **MCP** panel in VS Code and start the `md` server.

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "md": {
      "command": "node",
      "args": [
        "--import",
        "tsx/esm",
        "C:/path/to/md/packages/mcp-server/run.mjs"
      ],
      "cwd": "C:/path/to/md/packages/mcp-server"
    }
  }
}
```

Replace `C:/path/to/md` with the absolute path to your cloned repository.

### Cursor

Add to `.cursor/mcp.json` at the project root (already included in this repo):

```json
{
  "mcpServers": {
    "md": {
      "command": "node",
      "args": [
        "--import",
        "tsx/esm",
        "${workspaceFolder}/packages/mcp-server/run.mjs"
      ],
      "cwd": "${workspaceFolder}/packages/mcp-server"
    }
  }
}
```

Then open **Cursor Settings → MCP** and enable the `md` server.

### Windsurf / Other MCP Clients

Use the same stdio pattern:

```json
{
  "command": "node",
  "args": ["--import", "tsx/esm", "/absolute/path/to/packages/mcp-server/run.mjs"],
  "cwd": "/absolute/path/to/packages/mcp-server"
}
```

## Example Prompts

Once the server is connected, you can ask your AI assistant:

```
使用 grace 主题将下面的 Markdown 渲染为 HTML，开启代码行号：
# Hello World
```

```
列出所有可用主题，并解释每个主题的风格特点。
```

```
render_markdown 支持哪些 Markdown 扩展？给我每个扩展的示例写法。
```

```
列出所有内置 AI 服务，帮我找一个支持 DeepSeek-V3 的接入点。
```

## Development

```bash
# Run server directly (connects to stdin/stdout — for manual testing)
pnpm --filter @md/mcp-server start

# Watch mode (auto-restart on changes)
pnpm --filter @md/mcp-server dev
```

To test manually, use [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npx @modelcontextprotocol/inspector node --import tsx/esm run.mjs
```
