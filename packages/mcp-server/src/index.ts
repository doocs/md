#!/usr/bin/env node

import process from 'node:process'
import { serviceOptions } from '@md/shared/configs/ai-service-options'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import {
  codeBlockThemeOptions,
  colorOptions,
  fontFamilyOptions,
  fontSizeOptions,
  headingStyleOptions,
  legendOptions,
  themeOptions,
} from './config-options'

import { buildRenderedOutput } from './render-article'

const headingStyleEnum = z.enum([`default`, `color-only`, `border-bottom`, `border-left`, `custom`])

export const renderMarkdownInputSchema = {
  markdown: z.string().describe(`The Markdown source text to render.`),
  theme: z
    .enum([`default`, `grace`, `plain`, `simple`])
    .optional()
    .default(`default`)
    .describe(`Visual theme to apply. One of: default (经典), grace (优雅), plain (朴素), simple (简洁).`),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, `Must be a valid 6-digit hex color`)
    .optional()
    .default(`#0F4C81`)
    .describe(
      `Primary accent color (hex). Use list_colors to see presets. Default: #0F4C81 (经典蓝). `
      + `This color is applied via CSS variable --md-primary-color and affects headings, links, alerts, etc.`,
    ),
  fontFamily: z
    .string()
    .optional()
    .describe(`Font family stack. Use list_fonts for presets or pass any CSS font-family value.`),
  fontSize: z
    .string()
    .regex(/^\d+px$/, `Must be a pixel size like 16px`)
    .optional()
    .describe(`Base font size (e.g. 16px). Use list_font_sizes for presets.`),
  legend: z
    .enum([`title-alt`, `alt-title`, `title`, `alt`, `filename`, `none`])
    .optional()
    .default(`alt`)
    .describe(`Image caption format. Use list_legend_formats for options.`),
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
  themeMode: z
    .enum([`light`, `dark`])
    .optional()
    .default(`light`)
    .describe(`Colour mode used by diagram extensions (e.g. Mermaid, infographic).`),
  isUseIndent: z
    .boolean()
    .optional()
    .default(false)
    .describe(`Whether to indent paragraph first lines (text-indent: 2em).`),
  isUseJustify: z
    .boolean()
    .optional()
    .default(false)
    .describe(`Whether to justify paragraph text (text-align: justify).`),
  headingStyles: z
    .object({
      h1: headingStyleEnum.optional(),
      h2: headingStyleEnum.optional(),
      h3: headingStyleEnum.optional(),
      h4: headingStyleEnum.optional(),
      h5: headingStyleEnum.optional(),
      h6: headingStyleEnum.optional(),
    })
    .optional()
    .describe(`Per-level heading style presets. Use list_heading_styles for options.`),
  codeBlockTheme: z
    .enum(codeBlockThemeOptions.map(option => option.value) as [string, ...string[]])
    .optional()
    .describe(
      `Preset highlight.js theme URL for code blocks. `
      + `Use list_code_block_themes for allowed values. Defaults to the GitHub theme.`,
    ),
  customCSS: z
    .string()
    .optional()
    .describe(`Additional custom CSS appended after theme styles (highest priority).`),
}

function jsonText(data: unknown) {
  return {
    content: [{ type: `text` as const, text: JSON.stringify(data) }],
  }
}

const server = new McpServer({
  name: `md-mcp-server`,
  version: `2.1.1`,
})

server.registerTool(
  `render_markdown`,
  {
    description:
      `Render Markdown text to styled HTML using the doocs/md rendering engine. `
      + `The output is ready to be used in WeChat Official Accounts (公众号) and other platforms. `
      + `Supports standard Markdown plus: KaTeX math, Mermaid diagrams, PlantUML, footnotes, alerts, `
      + `ruby annotations, sliders, and table-of-contents.`,
    inputSchema: renderMarkdownInputSchema,
  },
  async (args) => {
    const result = await buildRenderedOutput(args)
    return jsonText(result)
  },
)

server.registerTool(
  `list_themes`,
  {
    description:
      `List all available visual themes for the doocs/md Markdown editor. `
      + `Each theme changes colours, typography, and spacing of the rendered output.`,
  },
  () => jsonText({
    themes: themeOptions.map(t => ({
      value: t.value,
      label: t.label,
      author: t.desc || `official`,
    })),
  }),
)

server.registerTool(
  `list_colors`,
  {
    description:
      `List all available primary accent colors for the doocs/md Markdown editor. `
      + `Each color is applied via CSS variable --md-primary-color and affects headings, links, alerts, etc. `
      + `You can also pass any custom hex color string directly to render_markdown.`,
  },
  () => jsonText({
    colors: colorOptions.map(c => ({
      value: c.value,
      label: c.label,
      description: c.desc,
    })),
  }),
)

server.registerTool(
  `list_fonts`,
  {
    description: `List preset font family options for render_markdown.`,
  },
  () => jsonText({
    fonts: fontFamilyOptions.map(f => ({
      label: f.label,
      value: f.value,
      description: f.desc,
    })),
  }),
)

server.registerTool(
  `list_font_sizes`,
  {
    description: `List preset font size options for render_markdown.`,
  },
  () => jsonText({
    fontSizes: fontSizeOptions.map(f => ({
      label: f.label,
      value: f.value,
      description: f.desc,
    })),
  }),
)

server.registerTool(
  `list_legend_formats`,
  {
    description: `List image caption (legend) format options for render_markdown.`,
  },
  () => jsonText({
    legendFormats: legendOptions.map(l => ({
      label: l.label,
      value: l.value,
      description: l.desc,
    })),
  }),
)

server.registerTool(
  `list_heading_styles`,
  {
    description: `List heading style presets usable in render_markdown headingStyles.`,
  },
  () => jsonText({
    headingStyles: headingStyleOptions.map(h => ({
      label: h.label,
      value: h.value,
      description: h.desc,
    })),
    levels: [`h1`, `h2`, `h3`, `h4`, `h5`, `h6`],
  }),
)

server.registerTool(
  `list_code_block_themes`,
  {
    description: `List highlight.js code block theme URLs for render_markdown.`,
  },
  () => jsonText({
    codeBlockThemes: codeBlockThemeOptions.map(t => ({
      label: t.label,
      value: t.value,
      description: t.desc,
    })),
  }),
)

server.registerTool(
  `list_ai_services`,
  {
    description:
      `List all built-in AI service providers supported by doocs/md. `
      + `Each entry includes the provider name, OpenAI-compatible endpoint URL, and available models. `
      + `Use this to help users pick the right AI service and model.`,
  },
  () => jsonText({
    services: serviceOptions.map(svc => ({
      value: svc.value,
      label: svc.label,
      endpoint: svc.endpoint,
      models: svc.models,
    })),
  }),
)

server.registerTool(
  `explain_extensions`,
  {
    description:
      `Describe all Markdown extensions supported by doocs/md beyond standard CommonMark. `
      + `Returns the extension name, a description, and a usage example for each.`,
  },
  () => jsonText({
    extensions: [
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
        description: `Styled alert/callout blocks via blockquote ([!TYPE]) or container (::: type) syntax. `
          + `An optional custom title can follow the type on the same line, e.g. "::: theorem Pythagorean Theorem" or "> [!IMPORTANT] 必读". `
          + `Built-in types carry their own color/icon — GFM: note, tip, info, important, warning, caution; `
          + `Obsidian-style: abstract, summary, tldr, todo, success, done, question, help, faq, failure, fail, missing, danger, error, bug, example, quote, cite; `
          + `Academic: theorem, lemma, corollary, proposition, definition, axiom, postulate, assumption, proof, remark. `
          + `Any other name (including non-ASCII, e.g. "::: 推论") renders with a neutral fallback style using the name as the title. `
          + `Bodies support full Markdown and KaTeX math.`,
        example: `> [!NOTE] 自定义标题\n> This is a note.\n\n::: theorem 勾股定理\n$a^2 + b^2 = c^2$\n:::\n\n::: 推论\n任意名称都会渲染为方框。\n:::`,
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
    ],
  }),
)

server.registerTool(
  `get_renderer_options`,
  {
    description:
      `Describe every configuration option accepted by the doocs/md renderer. `
      + `Use this to understand what parameters are available when calling render_markdown.`,
  },
  () => jsonText({
    options: [
      { name: `theme`, type: `'default' | 'grace' | 'plain' | 'simple'`, default: `default`, description: `Visual theme.` },
      { name: `primaryColor`, type: `string (hex)`, default: `#0F4C81`, description: `Primary accent color via --md-primary-color.` },
      { name: `fontFamily`, type: `string`, default: `system sans-serif stack`, description: `CSS font-family. See list_fonts.` },
      { name: `fontSize`, type: `string (px)`, default: `16px`, description: `Base font size. See list_font_sizes.` },
      { name: `legend`, type: `'title-alt' | 'alt-title' | 'title' | 'alt' | 'filename' | 'none'`, default: `alt`, description: `Image caption format.` },
      { name: `isMacCodeBlock`, type: `boolean`, default: false, description: `macOS-style code block title bar.` },
      { name: `isShowLineNumber`, type: `boolean`, default: false, description: `Line numbers in code blocks.` },
      { name: `citeStatus`, type: `boolean`, default: false, description: `Links as footnote-style citations.` },
      { name: `countStatus`, type: `boolean`, default: false, description: `Prepend reading-time estimate.` },
      { name: `themeMode`, type: `'light' | 'dark'`, default: `light`, description: `Diagram colour mode.` },
      { name: `isUseIndent`, type: `boolean`, default: false, description: `Paragraph first-line indent.` },
      { name: `isUseJustify`, type: `boolean`, default: false, description: `Justified paragraph text.` },
      { name: `headingStyles`, type: `object`, default: `{}`, description: `Per-level heading styles. See list_heading_styles.` },
      { name: `codeBlockTheme`, type: `preset url enum`, default: `github.min.css`, description: `highlight.js preset from list_code_block_themes.` },
      { name: `customCSS`, type: `string`, default: `''`, description: `User custom CSS appended last.` },
    ],
  }),
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  process.stderr.write(`[md-mcp-server] running on stdio\n`)
}

main().catch((err) => {
  process.stderr.write(`[md-mcp-server] fatal: ${err}\n`)
  process.exit(1)
})
