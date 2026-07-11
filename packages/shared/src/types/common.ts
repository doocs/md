import type { Token } from 'marked'
import type { ComponentRegistry } from './component'

/**
 * 渲染器选项（新主题系统）
 * 主题样式通过 CSS 注入，不再通过 JS 对象传递
 * 注意：isUseIndent 和 isUseJustify 现在通过 CSS 变量系统处理，不需要传递给渲染器
 */
export interface DiagramMessages {
  mermaidLoading: string
  /** 支持 `{detail}` 占位符 */
  mermaidError: string
  plantumlLoading: string
  plantumlError: string
  infographicLoading: string
  /** 支持 `{detail}` 占位符 */
  infographicError: string
}

export interface CountMessages {
  summary: string
}

/** 渲染管线中的通用 UI 文案（Web 端按 locale 注入） */
export interface RenderMessages {
  /** 文末引用链接标题 */
  footnoteTitle: string
  /** 未知自定义组件提示，支持 `{name}` 占位符 */
  unknownComponent: string
  /** 块级公式加载中占位 */
  katexLoading: string
}

export interface IOpts {
  legend?: string
  citeStatus?: boolean
  countStatus?: boolean
  isMacCodeBlock?: boolean
  isShowLineNumber?: boolean
  themeMode?: 'light' | 'dark'
  /** 自定义组件注册表 */
  components?: ComponentRegistry
  /** 异步图表加载/失败文案（Web 端按 locale 注入） */
  diagramMessages?: DiagramMessages
  /** 阅读时长统计文案（Web 端按 locale 注入） */
  countMessages?: CountMessages
  /** 脚注 / 未知组件 / 公式加载等文案（Web 端按 locale 注入） */
  renderMessages?: RenderMessages
}

export interface IConfigOption<VT = string> {
  label: string
  value: VT
  desc: string
}

/**
 * Options for the `markedAlert` extension.
 */
export interface AlertOptions {
  className?: string
  variants?: AlertVariantItem[]
  withoutStyle?: boolean
}

/**
 * Configuration for an alert type.
 */
export interface AlertVariantItem {
  type: string
  icon: string
  title?: string
  titleClassName?: string
}

/**
 * Represents an alert token.
 */
export interface Alert {
  type: `alert`
  meta: {
    className: string
    variant: string
    icon: string
    title: string
    titleClassName: string
  }
  raw: string
  text: string
  tokens: Token[]
}

export interface PostAccount {
  avatar?: string
  displayName: string
  home: string
  icon: string
  supportTypes?: string[]
  title: string
  type: string
  uid: string
  checked: boolean
  loggedIn?: boolean
  isChecking?: boolean
  status?: string
  error?: string
}

export interface Post {
  title: string
  desc: string
  thumb: string
  content: string
  markdown: string
  accounts: PostAccount[]
}
