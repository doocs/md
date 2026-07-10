import type { ComponentRegistry, CustomComponentDef } from '@md/shared/types'
import type { MarkedExtension } from 'marked'
import { escapeHtml, unescapeHtml } from '../utils/basicHelpers'

// ────────────────────────────────────────────────────────────────────────────
// 内置组件定义
// ────────────────────────────────────────────────────────────────────────────

export const BUILT_IN_COMPONENTS: CustomComponentDef[] = [
  {
    id: `builtin-mp-profile`,
    name: `MpProfile`,
    description: `公众号名片组件，展示微信公众号名片`,
    builtIn: true,
    props: [
      { name: `mpId`, description: `公众号 ID`, required: true },
      { name: `nickname`, description: `公众号名称`, required: true },
      { name: `headimg`, description: `公众号头像 URL` },
      { name: `signature`, description: `公众号简介` },
      { name: `serviceType`, description: `账号类型（1=公众号，2=服务号）`, default: `1` },
      { name: `verifyStatus`, description: `认证状态（0=无，1=个人，2=企业）`, default: `0` },
    ],
    template: `<section class="mp_profile_iframe_wrp custom_select_card_wrp" nodeleaf="">
  <mp-common-profile class="mpprofile js_uneditable custom_select_card mp_profile_iframe" data-pluginname="mpprofile" data-id="{{mpId}}" data-nickname="{{nickname}}" data-headimg="{{headimg}}" data-signature="{{signature}}" data-service_type="{{serviceType}}" data-verify_status="{{verifyStatus}}"></mp-common-profile>
  <br class="ProseMirror-trailingBreak">
</section>`,
    example: `<MpProfile mpId="MzIxNjA5ODQ0OQ==" nickname="Doocs" headimg="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/mp-logo.png" signature="GitHub 开源组织" serviceType="1" verifyStatus="1" />`,
  },
  {
    id: `builtin-qrcode`,
    name: `QRCodeBlock`,
    description: `二维码组件，将 URL 渲染为可扫描的二维码图片`,
    builtIn: true,
    props: [
      { name: `url`, description: `二维码内容（URL）`, required: true },
      { name: `text`, description: `二维码下方提示文字`, default: `扫码访问` },
      { name: `size`, description: `二维码尺寸（px）`, default: `150` },
    ],
    template: `<section style="text-align: center; margin: 20px auto; padding: 16px 0;">
  <img
    src="https://api.qrserver.com/v1/create-qr-code/?size={{size}}x{{size}}&data={{url}}"
    alt="QR Code"
    style="width: {{size}}px; height: {{size}}px; display: block; margin: 0 auto; border-radius: 4px;"
  />
  <p style="text-align: center; font-size: 14px; color: {{_textTertiary_}}; margin-top: 8px; margin-bottom: 0;">{{text}}</p>
</section>`,
    example: `<QRCodeBlock url="https://md.doocs.org" text="扫码访问" size="150" />`,
  },
  {
    id: `builtin-author`,
    name: `AuthorBlock`,
    description: `作者信息组件，展示作者头像、名称和简介`,
    builtIn: true,
    props: [
      { name: `name`, description: `作者名称`, required: true },
      { name: `avatar`, description: `头像图片 URL` },
      { name: `bio`, description: `作者简介` },
    ],
    template: `<section style="display: table; width: 100%; padding: 16px 0; margin: 16px 0; box-sizing: border-box;">
  <section style="display: table-cell; vertical-align: middle; width: 64px;">
    <img src="{{avatar}}" alt="{{name}}" style="width: 56px; height: 56px; border-radius: 50%; display: block;" />
  </section>
  <section style="display: table-cell; vertical-align: middle; padding-left: 12px;">
    <p style="margin: 0 0 4px; font-size: 15px; font-weight: bold; color: {{_textPrimary_}};">{{name}}</p>
    <p style="margin: 0; font-size: 13px; color: {{_textTertiary_}}; line-height: 1.5;">{{bio}}</p>
  </section>
</section>`,
    example: `<AuthorBlock name="yanglbme" avatar="https://avatars.githubusercontent.com/u/21008209?v=4" bio="Creator of Doocs" />`,
  },
  {
    id: `builtin-tip`,
    name: `TipBlock`,
    description: `提示框组件，高亮展示小贴士或注意事项`,
    builtIn: true,
    props: [
      { name: `type`, description: `类型：info、success、warning、danger`, default: `info` },
      { name: `title`, description: `标题（可选）` },
      { name: `content`, description: `提示内容`, required: true },
    ],
    template: `<section style="border-left: 4px solid {{borderColor}}; background: {{bgColor}}; padding: 12px 16px; margin: 16px 0; border-radius: 0 6px 6px 0;">
  {{#if title}}<p style="margin: 0 0 6px; font-size: 14px; font-weight: bold; color: {{textColor}};">{{title}}</p>{{/if}}
  <p style="margin: 0; font-size: 14px; color: {{textColor}}; line-height: 1.6;">{{content}}</p>
</section>`,
    example: `<TipBlock type="info" title="提示" content="这是一条提示信息" />`,
  },
  {
    id: `builtin-table`,
    name: `TableBlock`,
    description: `表格组件，用 JSON 数组渲染样式化表格，支持斑马纹`,
    builtIn: true,
    props: [
      { name: `headers`, description: `列标题 JSON 字符串数组`, required: true, type: `array` },
      { name: `rows`, description: `数据行 JSON 二维数组`, required: true, type: `array` },
      { name: `striped`, description: `斑马纹行（true/false）`, default: `true` },
      { name: `caption`, description: `表格标题（可选）` },
    ],
    template: ``,
    example: `<TableBlock headers='["名称","版本","状态"]' rows='[["Vue","3.x","✅ 稳定"],["Vite","8.x","✅ 稳定"],["pnpm","10.x","✅ 稳定"]]' caption="技术栈清单" />`,
  },
  {
    id: `builtin-info-grid`,
    name: `InfoGrid`,
    description: `信息网格组件，以多列展示键值对信息`,
    builtIn: true,
    props: [
      { name: `items`, description: `JSON 数组，每项含 label、value 字段`, required: true, type: `array` },
      { name: `cols`, description: `列数（1-3）`, default: `2` },
    ],
    template: ``,
    example: `<InfoGrid items='[{"label":"作者","value":"yanglbme"},{"label":"版本","value":"v1.0"},{"label":"许可证","value":"MIT"},{"label":"语言","value":"TypeScript"}]' cols="2" />`,
  },
  {
    id: `builtin-badge-group`,
    name: `BadgeGroup`,
    description: `标签组组件，展示一组彩色标签`,
    builtIn: true,
    props: [
      { name: `tags`, description: `JSON 字符串数组，标签列表`, required: true, type: `array` },
      { name: `color`, description: `标签主色调（hex）`, default: `#07c160` },
    ],
    template: `<section style="display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0;">
{{#each tags}}<span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 13px; font-weight: 500; background: {{color}}1a; color: {{color}}; border: 1px solid {{color}}40;">{{item}}</span>{{/each}}
</section>`,
    example: `<BadgeGroup tags='["Vue 3","TypeScript","Vite","Tailwind CSS"]' color="#07c160" />`,
  },
]

// ────────────────────────────────────────────────────────────────────────────
// 属性解析
// ────────────────────────────────────────────────────────────────────────────

/** 将 prop 字符串解析为 key->value 映射 */
function parseProps(propsStr: string): Record<string, string> {
  const result: Record<string, string> = {}
  // 支持 key="value" 和 key='value'
  for (const m of propsStr.matchAll(/(\w[\w-]*)=(?:"([^"]*)"|'([^']*)')/g)) {
    result[m[1]] = unescapeHtml(m[2] !== undefined ? m[2] : (m[3] ?? ``))
  }
  return result
}

// ────────────────────────────────────────────────────────────────────────────
// 特殊渲染器（内置组件专用，处理 JSON 数组等复杂逻辑）
// ────────────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────
// CSS 变量与调色板（light 模式回退值，深色通过外部注入覆盖）
// ────────────────────────────────────────────────────────────────────────────

/** CSS 变量名→light 回退值的简写，注入为模板变量（下划线前缀防止与用户 prop 冲突） */
function injectPaletteVars(props: Record<string, string>): Record<string, string> {
  return {
    _bgPrimary_: `var(--md-comp-bg, #fff)`,
    _bgSecondary_: `var(--md-comp-bg-secondary, #f5f5f5)`,
    _bgStripe_: `var(--md-comp-bg-stripe, #fafafa)`,
    _textPrimary_: `var(--md-comp-text-primary, #333)`,
    _textSecondary_: `var(--md-comp-text-secondary, #666)`,
    _textTertiary_: `var(--md-comp-text-tertiary, #999)`,
    _borderDefault_: `var(--md-comp-border-default, #e0e0e0)`,
    _borderLight_: `var(--md-comp-border-light, #eee)`,
    ...props,
  }
}

/** CSS 变量简写对象，供特殊渲染器直接内联 */
const CV = {
  bg: `var(--md-comp-bg, #fff)`,
  bgSec: `var(--md-comp-bg-secondary, #f5f5f5)`,
  bgStripe: `var(--md-comp-bg-stripe, #fafafa)`,
  txtP: `var(--md-comp-text-primary, #333)`,
  txtS: `var(--md-comp-text-secondary, #666)`,
  txtT: `var(--md-comp-text-tertiary, #999)`,
  border: `var(--md-comp-border-default, #e0e0e0)`,
  borderL: `var(--md-comp-border-light, #eee)`,
}

// ────────────────────────────────────────────────────────────────────────────
// 特殊渲染器（内置组件专用，处理 JSON 数组等复杂逻辑）
// ────────────────────────────────────────────────────────────────────────────

function renderTableBlock(props: Record<string, string>): string {
  let headers: string[] = []
  let rows: string[][] = []
  try { headers = JSON.parse(props.headers || `[]`) }
  catch { headers = [] }
  try {
    const rawRows = JSON.parse(props.rows || `[]`)
    rows = Array.isArray(rawRows) ? rawRows : []
  }
  catch { rows = [] }

  const striped = props.striped !== `false`
  const caption = props.caption || ``

  const thStyle = `padding: 8px 12px; text-align: left; font-weight: 600; font-size: 13px; color: ${CV.txtS}; background: ${CV.bgSec}; border-bottom: 2px solid ${CV.border};`
  const tdStyle = `padding: 8px 12px; font-size: 13px; color: ${CV.txtP}; border-bottom: 1px solid ${CV.borderL};`

  let html = `<section style="overflow-x: auto; margin: 16px 0;">\n`
  html += `  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">\n`
  if (caption) {
    html += `    <caption style="font-size: 13px; color: ${CV.txtS}; margin-bottom: 8px; text-align: left; caption-side: top;">${escapeHtml(caption)}</caption>\n`
  }
  if (headers.length > 0) {
    html += `    <thead>\n      <tr>\n`
    for (const h of headers) {
      html += `        <th style="${thStyle}">${escapeHtml(String(h))}</th>\n`
    }
    html += `      </tr>\n    </thead>\n`
  }
  html += `    <tbody>\n`
  for (let i = 0; i < rows.length; i++) {
    const row = Array.isArray(rows[i]) ? rows[i] : []
    const rowStyle = striped && i % 2 === 1 ? ` style="background: ${CV.bgStripe};"` : ``
    html += `      <tr${rowStyle}>\n`
    for (const cell of row) {
      html += `        <td style="${tdStyle}">${escapeHtml(String(cell))}</td>\n`
    }
    html += `      </tr>\n`
  }
  html += `    </tbody>\n  </table>\n</section>`
  return html
}

function renderInfoGrid(props: Record<string, string>): string {
  let items: Array<{ label?: string, value?: string }> = []
  try { items = JSON.parse(props.items || `[]`) }
  catch { items = [] }
  const cols = Math.min(Math.max(Number(props.cols) || 2, 1), 3)
  const colWidth = `${Math.floor(100 / cols)}%`

  let html = `<section style="margin: 16px 0; border: 1px solid ${CV.borderL}; border-radius: 8px; overflow: hidden; background: ${CV.bg};">\n`
  html += `  <section style="display: table; width: 100%; border-collapse: collapse;">\n`
  for (let r = 0; r < items.length; r += cols) {
    html += `    <section style="display: table-row;">\n`
    for (let c = 0; c < cols; c++) {
      const item = items[r + c]
      const borderBottom = r + cols < items.length ? `1px solid ${CV.borderL}` : `none`
      const borderRight = c < cols - 1 ? `1px solid ${CV.borderL}` : `none`
      html += `      <section style="display: table-cell; width: ${colWidth}; padding: 10px 14px; border-bottom: ${borderBottom}; border-right: ${borderRight}; vertical-align: top; box-sizing: border-box;">\n`
      if (item) {
        html += `        <p style="margin: 0 0 2px; font-size: 11px; color: ${CV.txtT}; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(item.label || ``)}</p>\n`
        html += `        <p style="margin: 0; font-size: 14px; font-weight: 500; color: ${CV.txtP};">${escapeHtml(item.value || ``)}</p>\n`
      }
      html += `      </section>\n`
    }
    html += `    </section>\n`
  }
  html += `  </section>\n</section>`
  return html
}

/** 特殊渲染器注册表 */
const SPECIAL_RENDERERS: Record<string, (props: Record<string, string>) => string> = {
  TableBlock: renderTableBlock,
  InfoGrid: renderInfoGrid,
}

// ────────────────────────────────────────────────────────────────────────────
// TipBlock 类型颜色映射
// ────────────────────────────────────────────────────────────────────────────

const TIP_COLORS: Record<string, { borderColor: string, bgColor: string, textColor: string }> = {
  info: { borderColor: `#1890ff`, bgColor: `#e6f7ff`, textColor: `#0050b3` },
  success: { borderColor: `#52c41a`, bgColor: `#f6ffed`, textColor: `#135200` },
  warning: { borderColor: `#faad14`, bgColor: `#fffbe6`, textColor: `#874d00` },
  danger: { borderColor: `#ff4d4f`, bgColor: `#fff2f0`, textColor: `#a8071a` },
}

function injectTipColors(props: Record<string, string>): Record<string, string> {
  const type = props.type || `info`
  const colors = TIP_COLORS[type] || TIP_COLORS.info
  return { ...colors, ...props }
}

// ────────────────────────────────────────────────────────────────────────────
// 模板渲染引擎
// ────────────────────────────────────────────────────────────────────────────

/**
 * 递归处理模板字符串，支持：
 *   - `{{#each arrayProp}}...{{item}}...{{item.key}}...{{@index}}...{{/each}}`
 *   - `{{#if prop}}...{{#else}}...{{/if}}`
 *   - `{{#unless prop}}...{{/unless}}`
 *   - `{{propName}}` 基础替换（自动 HTML 转义）
 *   - `{{children}}` 保留原始 HTML 不转义
 */
function processTemplate(html: string, props: Record<string, string>): string {
  // 1. {{#each}} 循环（非贪婪；循环体内部通过递归支持嵌套的 #if/#unless，但不支持 #each 嵌套）
  html = html.replace(/\{\{#each\s+([\w-]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, propKey, body) => {
    let items: unknown[]
    try { items = JSON.parse(props[propKey] || `[]`) }
    catch { items = [] }
    if (!Array.isArray(items))
      return ``

    return items.map((item, index) => {
      let itemBody = body
      itemBody = itemBody.replace(/\{\{@index\}\}/g, String(index))
      if (typeof item === `object` && item !== null) {
        const obj = item as Record<string, unknown>
        itemBody = itemBody.replace(/\{\{item\.([\w-]+)\}\}/g, (_: string, key: string) => {
          return obj[key] !== undefined ? escapeHtml(String(obj[key])) : ``
        })
      }
      else {
        itemBody = itemBody.replace(/\{\{item\}\}/g, escapeHtml(String(item ?? ``)))
      }
      // 递归处理循环体内的 #if/#unless/prop 替换
      return processTemplate(itemBody, props)
    }).join(``)
  })

  // 2. {{#if prop}}...{{#else}}...{{/if}}
  html = html.replace(/\{\{#if\s+([\w-]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
    const elseIdx = content.indexOf(`{{#else}}`)
    if (elseIdx >= 0) {
      return props[key] ? content.slice(0, elseIdx) : content.slice(elseIdx + 9)
    }
    return props[key] ? content : ``
  })

  // 3. {{#unless prop}}...{{/unless}}
  html = html.replace(/\{\{#unless\s+([\w-]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g, (_, key, content) => {
    return !props[key] ? content : ``
  })

  // 4. {{propName}} 替换；{{children}} 不转义
  html = html.replace(/\{\{([\w-]+)\}\}/g, (_, key) => {
    if (key === `children`)
      return props[key] ?? ``
    return props[key] !== undefined ? escapeHtml(props[key]) : ``
  })

  return html
}

/**
 * 将组件定义和 props 渲染为 HTML 字符串。
 * 优先使用 SPECIAL_RENDERERS，否则走 processTemplate 模板引擎。
 * 颜色通过 CSS 自定义属性适配暗色模式，回退值为 light 模式颜色。
 */
function renderTemplate(def: CustomComponentDef, rawProps: Record<string, string>): string {
  // 1. 合并默认值
  const props: Record<string, string> = {}
  for (const propDef of def.props) {
    if (propDef.default !== undefined) {
      props[propDef.name] = propDef.default
    }
  }
  Object.assign(props, rawProps)

  // 2. 特殊渲染器（TableBlock / InfoGrid）
  const specialRenderer = SPECIAL_RENDERERS[def.name]
  if (specialRenderer) {
    return specialRenderer(props)
  }

  // 3. 注入调色板变量 + TipBlock 颜色
  const propsWithPalette = injectPaletteVars(
    def.name === `TipBlock` ? injectTipColors(props) : props,
  )

  return processTemplate(def.template, propsWithPalette)
}

/**
 * 预览组件渲染结果（供编辑器 UI 实时预览使用）
 */
export function previewComponent(
  def: CustomComponentDef,
  propsOverride?: Record<string, string>,
): string {
  return renderTemplate(def, propsOverride ?? {})
}

// ────────────────────────────────────────────────────────────────────────────
// 可变注册表（通过 setComponentRegistry 在渲染时更新）
// ────────────────────────────────────────────────────────────────────────────

let _registry: ComponentRegistry = {}

/** 更新当前渲染使用的组件注册表 */
export function setComponentRegistry(registry: ComponentRegistry): void {
  _registry = registry
}

/** 获取内置组件注册表 */
export function getBuiltInRegistry(): ComponentRegistry {
  const reg: ComponentRegistry = {}
  for (const c of BUILT_IN_COMPONENTS) {
    reg[c.name] = c
  }
  return reg
}

// ────────────────────────────────────────────────────────────────────────────
// Marked 扩展
// ────────────────────────────────────────────────────────────────────────────

/**
 * marked 扩展：解析 JSX 风格的自定义组件语法
 *
 * 支持：
 *   自闭合：  <ComponentName prop="value" />
 *   开闭合：  <ComponentName prop="value">children</ComponentName>
 *
 * 组件名必须以大写字母开头（PascalCase）以与普通 HTML 标签区分。
 */
export function markedComponent(getRegistry?: () => ComponentRegistry): MarkedExtension {
  function resolveRegistry(): ComponentRegistry {
    return getRegistry ? getRegistry() : _registry
  }

  function findLineEnd(src: string, from: number): number {
    const newlineIdx = src.indexOf(`\n`, from)
    return newlineIdx >= 0 ? newlineIdx : src.length
  }

  function hasOnlyWhitespaceToLineEnd(src: string, from: number): boolean {
    return src.slice(from, findLineEnd(src, from)).trim() === ``
  }

  function findComponentStart(src: string): number | undefined {
    let offset = 0
    let fenceChar = ``
    let fenceLength = 0

    for (const line of src.split(`\n`)) {
      const fenceMatch = line.match(/^ {0,3}([`~]{3,})/)

      if (fenceChar) {
        if (fenceMatch && fenceMatch[1][0] === fenceChar && fenceMatch[1].length >= fenceLength) {
          fenceChar = ``
          fenceLength = 0
        }
      }
      else if (fenceMatch) {
        fenceChar = fenceMatch[1][0]
        fenceLength = fenceMatch[1].length
      }
      else if (line[0] === `<` && line[1] >= `A` && line[1] <= `Z`) {
        return offset
      }

      offset += line.length + 1
    }

    return undefined
  }

  /**
   * 简单的非正则标签解析器，避免复杂 regex 的回溯问题。
   * 返回 raw（完整原始文本）、name（组件名）、propsStr（属性串）。
   */
  function parseTag(src: string) {
    // 必须以 <UppercaseLetter 开头

    function findClosingTag(src: string, name: string, from: number): number {
      const closeTag = `</${name}>`
      let lineStart = from
      let fenceChar = ``
      let fenceLength = 0

      while (lineStart <= src.length) {
        const lineEnd = findLineEnd(src, lineStart)
        const line = src.slice(lineStart, lineEnd)
        const fenceMatch = line.match(/^ {0,3}([`~]{3,})/)

        if (fenceChar) {
          if (fenceMatch && fenceMatch[1][0] === fenceChar && fenceMatch[1].length >= fenceLength) {
            fenceChar = ``
            fenceLength = 0
          }
        }
        else if (fenceMatch) {
          fenceChar = fenceMatch[1][0]
          fenceLength = fenceMatch[1].length
        }
        else {
          const leadingWhitespace = line.match(/^\s*/)?.[0].length ?? 0
          if (line.slice(leadingWhitespace).startsWith(closeTag)
            && line.slice(leadingWhitespace + closeTag.length).trim() === ``) {
            return lineStart + leadingWhitespace
          }
        }

        if (lineEnd === src.length)
          break

        lineStart = lineEnd + 1
      }

      return -1
    }

    if (src[0] !== `<` || src[1] < `A` || src[1] > `Z`)
      return null

    // 提取组件名
    let i = 1
    while (i < src.length && /\w/.test(src[i])) i++
    const name = src.slice(1, i)
    if (!name)
      return null

    // 扫描开始标签内容，正确处理引号内的 > 字符
    let inQuote = ``
    let j = i
    while (j < src.length) {
      const ch = src[j]
      if (inQuote) {
        if (ch === inQuote)
          inQuote = ``
      }
      else if (ch === `"` || ch === `'`) {
        inQuote = ch
      }
      else if (ch === `/` && src[j + 1] === `>`) {
        // 自闭合标签结束
        if (!hasOnlyWhitespaceToLineEnd(src, j + 2))
          return null
        return { raw: src.slice(0, j + 2), name, propsStr: src.slice(i, j).trim(), children: `` }
      }
      else if (ch === `>`) {
        const lineEnd = findLineEnd(src, j + 1)
        const closeTag = `</${name}>`

        // 支持同一行内自洽的开闭合标签，但不接受标签后混入其他 Markdown 语法。
        const inlineCloseIdx = src.indexOf(closeTag, j + 1)
        if (inlineCloseIdx >= 0 && inlineCloseIdx < lineEnd) {
          if (src.slice(inlineCloseIdx + closeTag.length, lineEnd).trim() !== ``)
            return null

          const children = src.slice(j + 1, inlineCloseIdx)
          return { raw: src.slice(0, inlineCloseIdx + closeTag.length), name, propsStr: src.slice(i, j).trim(), children }
        }

        if (!hasOnlyWhitespaceToLineEnd(src, j + 1))
          return null

        // 多行组件要求关闭标签位于独立行，且跳过 fenced code 中的同名文本。
        const closeIdx = findClosingTag(src, name, lineEnd === src.length ? lineEnd : lineEnd + 1)
        if (closeIdx < 0)
          return null
        const children = src.slice(j + 1, closeIdx)
        return { raw: src.slice(0, closeIdx + closeTag.length), name, propsStr: src.slice(i, j).trim(), children }
      }
      j++
    }
    return null
  }

  return {
    extensions: [
      {
        name: `mdComponent`,
        level: `block`,

        start(src: string) {
          return findComponentStart(src)
        },

        tokenizer(src: string) {
          const tag = parseTag(src)
          if (!tag)
            return undefined
          return {
            type: `mdComponent`,
            raw: tag.raw,
            name: tag.name,
            propsStr: tag.propsStr,
            children: tag.children,
          }
        },

        renderer(token) {
          const { name, propsStr, children } = token as unknown as { name: string, propsStr: string, children: string }
          const def = resolveRegistry()[name]
          if (!def) {
            // 未知组件，保留原始文本并给出提示
            return `<p style="color:#f00;font-size:12px;">[未知组件: ${name}]</p>\n`
          }
          const props = parseProps(propsStr)
          // 将内部子内容作为保留的 children prop 传入（原始 HTML，不转义）
          if (children && props.children === undefined) {
            props.children = children
          }
          return `${renderTemplate(def, props)}\n`
        },
      },
    ],
  }
}
