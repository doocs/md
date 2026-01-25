import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initRenderer } from '@md/core/renderer'
import { modifyHtmlContent } from '@md/core/utils'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to shared theme-css folder
// Structure: packages/mcp-server/src/index.ts -> packages/shared/src/configs/theme-css
const SHARED_THEME_PATH = path.resolve(__dirname, '../../shared/src/configs/theme-css')

async function getThemeCss(theme: string = 'default') {
  const filename = `${theme}.css`
  const filePath = path.join(SHARED_THEME_PATH, filename)
  const baseFilePath = path.join(SHARED_THEME_PATH, 'base.css')

  try {
    const [themeCss, baseCss] = await Promise.all([
      fs.readFile(filePath, 'utf-8'),
      fs.readFile(baseFilePath, 'utf-8'),
    ])
    return `${baseCss}\n${themeCss}`
  }
  catch (e) {
    if (theme !== 'default') {
      return getThemeCss('default')
    }
    console.error(`Failed to load theme CSS from ${filePath}`, e)
    return ''
  }
}

async function listThemes() {
  try {
    const files = await fs.readdir(SHARED_THEME_PATH)
    return files
      .filter((f: string) => f.endsWith('.css') && f !== 'base.css')
      .map((f: string) => f.replace('.css', ''))
  }
  catch (e) {
    console.error(`Failed to list themes from ${SHARED_THEME_PATH}`, e)
    return ['default']
  }
}

const server = new McpServer({
  name: 'doocs-md-mcp-server',
  version: '1.0.0',
})

server.registerTool(
  'render_markdown',
  {
    description: 'Render markdown to HTML with theme',
    inputSchema: z.object({
      markdown: z.string(),
      theme: z.string().optional().default('default'),
    }),
  },
  async ({ markdown, theme }) => {
    const renderer = initRenderer({})

    let html = modifyHtmlContent(markdown, renderer)

    // Inject CSS
    const css = await getThemeCss(theme)
    if (css) {
      // Simple injection, in a real app this might be more sophisticated
      html = `<style>\n${css}\n</style>\n<div class="preview-wrapper" id="preview">\n${html}\n</div>`
    }

    return {
      content: [{ type: 'text', text: html }],
    }
  },
)

server.registerTool(
  'list_themes',
  {
    description: 'List available themes',
  },
  async () => {
    const themes = await listThemes()
    return {
      content: [{ type: 'text', text: JSON.stringify(themes) }],
    }
  },
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch(console.error)
