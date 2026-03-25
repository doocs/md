# @md/mcp-server

MCP (Model Context Protocol) server for [doocs/md](https://github.com/doocs/md).

Exposes the `doocs/md` markdown rendering engine and AI service configuration to AI agent runtimes (Claude Desktop, Cursor, VS Code Copilot, etc.) via the standard MCP protocol over **stdio**.

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 9 (for monorepo workspace)
- Clone the monorepo and install dependencies:

```bash
git clone https://github.com/doocs/md.git
cd md
pnpm install
```

## Tools

### `render_markdown`

Convert Markdown text to styled HTML using the full doocs/md rendering pipeline.

| Parameter          | Type                               | Default     | Description                                     |
| ------------------ | ---------------------------------- | ----------- | ----------------------------------------------- |
| `markdown`         | `string`                           | —           | Markdown source text                            |
| `theme`            | `"default" \| "grace" \| "simple"` | `"default"` | Visual theme (经典 / 优雅 / 简洁)               |
| `isMacCodeBlock`   | `boolean`                          | `false`     | Render code blocks with a macOS-style title bar |
| `isShowLineNumber` | `boolean`                          | `false`     | Show line numbers in code blocks                |
| `citeStatus`       | `boolean`                          | `false`     | Convert links to footnote-style citations       |
| `countStatus`      | `boolean`                          | `false`     | Prepend a reading-time estimate                 |

Returns `{ html, frontMatter, readingTime: { words, minutes } }`.

### Other tools

| Tool                   | Description                                                                       |
| ---------------------- | --------------------------------------------------------------------------------- |
| `list_themes`          | List all available visual themes with labels and authors                          |
| `list_ai_services`     | List all built-in AI service providers with endpoints and models                  |
| `explain_extensions`   | Describe every Markdown extension beyond CommonMark (KaTeX, Mermaid, PlantUML, …) |
| `get_renderer_options` | Describe all renderer configuration options                                       |

## Setup

### VS Code (GitHub Copilot)

Add to `.vscode/mcp.json` in the project root (already included in this repo):

```json
{
  "servers": {
    "md": {
      "type": "stdio",
      "command": "node",
      "args": ["--import", "tsx/esm", "${workspaceFolder}/packages/mcp-server/src/index.ts"],
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
        "C:/path/to/md/packages/mcp-server/src/index.ts"
      ],
      "cwd": "C:/path/to/md/packages/mcp-server"
    }
  }
}
```

Replace `C:/path/to/md` with the absolute path to your cloned repository.

### Cursor

Add to `.cursor/mcp.json` at the project root:

```json
{
  "mcpServers": {
    "md": {
      "command": "node",
      "args": ["--import", "tsx/esm", "packages/mcp-server/src/index.ts"],
      "cwd": "packages/mcp-server"
    }
  }
}
```

### Windsurf / Other MCP Clients

Use the same stdio pattern:

```json
{
  "command": "node",
  "args": ["--import", "tsx/esm", "/absolute/path/to/packages/mcp-server/src/index.ts"],
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

To test manually, pipe a valid JSON-RPC `initialize` message to stdin or use [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npx @modelcontextprotocol/inspector node --import tsx/esm src/index.ts
```
