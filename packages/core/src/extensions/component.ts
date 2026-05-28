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
  <p style="text-align: center; font-size: 14px; color: #888; margin-top: 8px; margin-bottom: 0;">{{text}}</p>
</section>`,
    example: `<QRCodeBlock url="https://md.doocs.org" text="扫码访问" size="150" />`,
  },
  {
    id: `builtin-card`,
    name: `CardBlock`,
    description: `卡片组件，展示带标题和描述的卡片`,
    builtIn: true,
    props: [
      { name: `title`, description: `卡片标题`, required: true },
      { name: `description`, description: `卡片描述文字` },
      { name: `url`, description: `跳转链接（可选）` },
      { name: `cover`, description: `封面图片 URL（可选）` },
    ],
    template: `<section style="border: 1px solid #e8e8e8; border-radius: 8px; overflow: hidden; margin: 16px 0; background: #fff;">
  {{#if cover}}<img src="{{cover}}" alt="{{title}}" style="width: 100%; height: 160px; object-fit: cover; display: block;" />{{/if}}
  <section style="padding: 16px;">
    <p style="margin: 0 0 8px; font-size: 16px; font-weight: bold; color: #333;">{{title}}</p>
    {{#if description}}<p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">{{description}}</p>{{/if}}
    {{#if url}}<a href="{{url}}" style="display: inline-block; margin-top: 12px; font-size: 13px; color: #07c160; text-decoration: none;">阅读全文 →</a>{{/if}}
  </section>
</section>`,
    example: `<CardBlock title="Doocs 开源社区" description="低门槛、高质量的互联网技术社区" url="https://doocs.github.io" />`,
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
    <p style="margin: 0 0 4px; font-size: 15px; font-weight: bold; color: #333;">{{name}}</p>
    <p style="margin: 0; font-size: 13px; color: #888; line-height: 1.5;">{{bio}}</p>
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
      { name: `type`, description: `类型：info | success | warning | danger`, default: `info` },
      { name: `title`, description: `标题（可选）` },
      { name: `content`, description: `提示内容`, required: true },
    ],
    template: `<section style="border-left: 4px solid {{borderColor}}; background: {{bgColor}}; padding: 12px 16px; margin: 16px 0; border-radius: 0 6px 6px 0;">
  {{#if title}}<p style="margin: 0 0 6px; font-size: 14px; font-weight: bold; color: {{textColor}};">{{title}}</p>{{/if}}
  <p style="margin: 0; font-size: 14px; color: {{textColor}}; line-height: 1.6;">{{content}}</p>
</section>`,
    example: `<TipBlock type="info" title="提示" content="这是一条提示信息" />`,
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
// TipBlock 类型颜色映射
// ────────────────────────────────────────────────────────────────────────────

const TIP_COLORS: Record<string, { borderColor: string, bgColor: string, textColor: string }> = {
  info: { borderColor: `#1890ff`, bgColor: `#e6f7ff`, textColor: `#0050b3` },
  success: { borderColor: `#52c41a`, bgColor: `#f6ffed`, textColor: `#135200` },
  warning: { borderColor: `#faad14`, bgColor: `#fffbe6`, textColor: `#874d00` },
  danger: { borderColor: `#ff4d4f`, bgColor: `#fff2f0`, textColor: `#a8071a` },
}

/** 为 TipBlock 注入颜色变量 */
function injectTipColors(props: Record<string, string>): Record<string, string> {
  const type = props.type || `info`
  const colors = TIP_COLORS[type] || TIP_COLORS.info
  return { ...colors, ...props }
}

// ────────────────────────────────────────────────────────────────────────────
// 模板渲染
// ────────────────────────────────────────────────────────────────────────────

/**
 * 将组件定义和 props 渲染为 HTML 字符串。
 * 支持：
 *   - `{{propName}}` 基础占位符替换（值自动转义）
 *   - `{{#if propName}}...{{/if}}` 条件块（prop 存在且非空时显示）
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

  // 2. TipBlock 特殊处理：注入颜色变量
  const finalProps = def.name === `TipBlock` ? injectTipColors(props) : props

  let html = def.template

  // 3. 处理 {{#if prop}}...{{/if}} 条件块
  html = html.replace(/\{\{#if\s+([\w-]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
    return finalProps[key] ? content : ``
  })

  // 4. 替换 {{propName}} 占位符（转义值）；{{children}} 保留原始 HTML 不转义
  html = html.replace(/\{\{([\w-]+)\}\}/g, (_, key) => {
    if (key === `children`) {
      return finalProps[key] ?? ``
    }
    return finalProps[key] !== undefined ? escapeHtml(finalProps[key]) : ``
  })

  return html
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
  /**
   * 简单的非正则标签解析器，避免复杂 regex 的回溯问题。
   * 返回 raw（完整原始文本）、name（组件名）、propsStr（属性串）。
   */
  function parseTag(src: string) {
    // 必须以 <UppercaseLetter 开头
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
        return { raw: src.slice(0, j + 2), name, propsStr: src.slice(i, j).trim(), children: `` }
      }
      else if (ch === `>`) {
        // 开放标签结束，找对应的关闭标签
        const closeTag = `</${name}>`
        const closeIdx = src.indexOf(closeTag, j + 1)
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
          // 快速定位到第一个大写字母开头的 '<'
          const idx = src.search(/<[A-Z]/)
          return idx >= 0 ? idx : undefined
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
