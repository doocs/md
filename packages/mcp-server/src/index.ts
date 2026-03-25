#!/usr/bin/env node
/**
 * @md MCP Server
 *
 * Exposes the doocs/md markdown rendering engine and AI service configuration
 * to AI agents via the Model Context Protocol (MCP).
 *
 * Tools provided:
 *   - render_markdown        Convert Markdown text to styled HTML
 *   - list_themes            List all available visual themes
 *   - list_ai_services       List all built-in AI service providers
 *   - explain_extensions     Describe supported Markdown extensions
 *   - get_renderer_options   Describe all renderer configuration options
 */

import process from 'node:process'
import { initRenderer } from '@md/core/renderer'
import { postProcessHtml, renderMarkdown } from '@md/core/utils'
import { serviceOptions } from '@md/shared/configs/ai-service-options'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

// Theme metadata – kept in sync with @md/shared/configs/theme.ts
const themeOptions = [
  { value: `default`, label: `经典`, desc: `` },
  { value: `grace`, label: `优雅`, desc: `@brzhang` },
  { value: `simple`, label: `简洁`, desc: `@okooo5km` },
] as const

// ---------------------------------------------------------------------------
// Server initialisation
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: `md-mcp-server`,
  version: `2.1.0`,
})

// ---------------------------------------------------------------------------
// Tool: render_markdown
// ---------------------------------------------------------------------------

server.registerTool(
  `render_markdown`,
  {
    description:
      `Render Markdown text to styled HTML using the doocs/md rendering engine. `
      + `The output is ready to be used in WeChat Official Accounts (公众号) and other platforms. `
      + `Supports standard Markdown plus: KaTeX math, Mermaid diagrams, PlantUML, footnotes, alerts, `
      + `ruby annotations, sliders, and table-of-contents.`,
    inputSchema: {
      markdown: z.string().describe(`The Markdown source text to render.`),
      theme: z
        .enum([`default`, `grace`, `simple`])
        .optional()
        .default(`default`)
        .describe(`Visual theme to apply. One of: default (经典), grace (优雅), simple (简洁).`),
      isMacCodeBlock: z
        .boolean()
        .optional()
        .default(false)
        .describe(`Whether to render code blocks with a macOS-style title bar.`),
      isShowLineNumber: z
        .boolean()
        .optional()
        .default(false)
        .describe(`Whether to show line numbers in code blocks.`),
      citeStatus: z
        .boolean()
        .optional()
        .default(false)
        .describe(`Whether to render links as bottom citations (footnote style).`),
      countStatus: z
        .boolean()
        .optional()
        .default(false)
        .describe(`Whether to prepend a reading-time estimate to the document.`),
    },
  },
  (args) => {
    const renderer = initRenderer({
      isMacCodeBlock: args.isMacCodeBlock,
      isShowLineNumber: args.isShowLineNumber,
      citeStatus: args.citeStatus,
      countStatus: args.countStatus,
    })

    const { html: baseHtml, readingTime } = renderMarkdown(args.markdown, renderer)
    const processedHtml = postProcessHtml(baseHtml, readingTime, renderer)
    const containerHtml = renderer.createContainer(processedHtml)

    const { yamlData } = renderer.parseFrontMatterAndContent(args.markdown)

    return {
      content: [
        {
          type: `text`,
          text: JSON.stringify({
            html: containerHtml,
            frontMatter: yamlData,
            readingTime: {
              words: readingTime.words,
              minutes: readingTime.minutes,
            },
          }),
        },
      ],
    }
  },
)

// ---------------------------------------------------------------------------
// Tool: list_themes
// ---------------------------------------------------------------------------

server.registerTool(
  `list_themes`,
  {
    description:
      `List all available visual themes for the doocs/md Markdown editor. `
      + `Each theme changes colours, typography, and spacing of the rendered output.`,
  },
  () => {
    const themes = themeOptions.map(t => ({
      value: t.value,
      label: t.label,
      author: t.desc || `official`,
    }))

    return {
      content: [
        {
          type: `text`,
          text: JSON.stringify({ themes }),
        },
      ],
    }
  },
)

// ---------------------------------------------------------------------------
// Tool: list_ai_services
// ---------------------------------------------------------------------------

server.registerTool(
  `list_ai_services`,
  {
    description:
      `List all built-in AI service providers supported by doocs/md. `
      + `Each entry includes the provider name, OpenAI-compatible endpoint URL, and available models. `
      + `Use this to help users pick the right AI service and model.`,
  },
  () => {
    const services = serviceOptions.map(svc => ({
      value: svc.value,
      label: svc.label,
      endpoint: svc.endpoint,
      models: svc.models,
    }))

    return {
      content: [
        {
          type: `text`,
          text: JSON.stringify({ services }),
        },
      ],
    }
  },
)

// ---------------------------------------------------------------------------
// Tool: explain_extensions
// ---------------------------------------------------------------------------

server.registerTool(
  `explain_extensions`,
  {
    description:
      `Describe all Markdown extensions supported by doocs/md beyond standard CommonMark. `
      + `Returns the extension name, a description, and a usage example for each.`,
  },
  () => {
    const extensions = [
      {
        name: `KaTeX Math`,
        description: `Inline and block LaTeX math expressions rendered via KaTeX.`,
        inlineExample: `$E = mc^2$`,
        blockExample: `$$\n\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}\n$$`,
      },
      {
        name: `Mermaid Diagrams`,
        description: `Sequence, flowchart, Gantt, class, and other diagrams via Mermaid.js.`,
        example: `\`\`\`mermaid\ngraph TD\n  A --> B\n\`\`\``,
      },
      {
        name: `PlantUML`,
        description: `UML diagrams rendered via PlantUML (output as inline SVG).`,
        example: `\`\`\`plantuml\n@startuml\nAlice -> Bob: hello\n@enduml\n\`\`\``,
      },
      {
        name: `Callout Alerts`,
        description: `Styled alert/callout blocks. Supported types: note, tip, warning, caution, important.`,
        example: `> [!NOTE]\n> This is a note.`,
      },
      {
        name: `Footnotes`,
        description: `Standard Markdown footnotes collected and rendered at the document bottom.`,
        example: `Some text[^1]\n\n[^1]: footnote body`,
      },
      {
        name: `Ruby Annotations`,
        description: `East Asian ruby (furigana) annotations above text.`,
        example: `{漢字|かんじ}`,
      },
      {
        name: `Table of Contents`,
        description: `Auto-generated TOC inserted with the [toc] marker.`,
        example: `[toc]`,
      },
      {
        name: `Infographic`,
        description: `Styled infographic blocks powered by @antv/infographic.`,
        example: `\`\`\`infographic\n...\n\`\`\``,
      },
      {
        name: `Markup Highlighting`,
        description: `Inline ==highlighted== text.`,
        example: `==highlighted text==`,
      },
      {
        name: `Slider`,
        description: `Horizontal scroll slider blocks for narrow viewports.`,
        example: `<<< slide content >>>`,
      },
    ]

    return {
      content: [
        {
          type: `text`,
          text: JSON.stringify({ extensions }),
        },
      ],
    }
  },
)

// ---------------------------------------------------------------------------
// Tool: get_renderer_options
// ---------------------------------------------------------------------------

server.registerTool(
  `get_renderer_options`,
  {
    description:
      `Describe every configuration option accepted by the doocs/md renderer. `
      + `Use this to understand what parameters are available when calling render_markdown.`,
  },
  () => {
    const options = [
      {
        name: `isMacCodeBlock`,
        type: `boolean`,
        default: false,
        description: `Render code blocks with a macOS-style traffic-light title bar.`,
      },
      {
        name: `isShowLineNumber`,
        type: `boolean`,
        default: false,
        description: `Show line numbers inside code blocks.`,
      },
      {
        name: `citeStatus`,
        type: `boolean`,
        default: false,
        description: `Convert hyperlinks to inline citations with footnote-style references at the bottom.`,
      },
      {
        name: `countStatus`,
        type: `boolean`,
        default: false,
        description: `Prepend a reading-time estimate (word count + minutes) before the document body.`,
      },
      {
        name: `themeMode`,
        type: `'light' | 'dark'`,
        default: `light`,
        description: `Colour mode used by diagram extensions (e.g. Mermaid, infographic).`,
      },
    ]

    return {
      content: [
        {
          type: `text`,
          text: JSON.stringify({ options }),
        },
      ],
    }
  },
)

// ---------------------------------------------------------------------------
// Start server on stdio
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  // MCP servers must not write anything to stdout except JSON-RPC messages.
  process.stderr.write(`[md-mcp-server] running on stdio\n`)
}

main().catch((err) => {
  process.stderr.write(`[md-mcp-server] fatal: ${err}\n`)
  process.exit(1)
})
