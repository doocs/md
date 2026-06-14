import type { EditorView as EditorViewType } from '@codemirror/view'
import type { ThemeName } from '@md/shared/configs'
import { colorOptions, themeOptions } from '@md/shared/configs'
import {
  formatBold,
  formatCode,
  formatItalic,
  formatLink,
  formatStrikethrough,
} from '@md/shared/editor'
import { useEditorDocumentActions } from '@/composables/useEditorDocumentActions'
import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

export type SlashCommandGroup = 'basic' | 'common' | 'edit' | 'style'

export interface SlashCommandItem {
  id: string
  label: string
  group: SlashCommandGroup
  groupLabel: string
  keywords: string[]
  icon: string
  swatch?: string
  action: (view: EditorViewType) => void
}

export const SLASH_GROUP_LABELS: Record<SlashCommandGroup, string> = {
  basic: `基础`,
  common: `常用`,
  edit: `编辑`,
  style: `样式`,
}

export const SLASH_HEADING_IDS = [`h1`, `h2`, `h3`, `h4`, `h5`, `h6`] as const
export const SLASH_BASIC_BLOCK_IDS = [`ordered-list`, `unordered-list`, `blockquote`, `divider`] as const
export const SLASH_BASIC_FORMAT_IDS = [`bold`, `italic`, `strikethrough`, `inline-code`, `link-wrap`] as const
export const SLASH_EDIT_DOC_IDS = [`format-doc`, `reset-content`, `clear-content`, `find`] as const

const HEADING_KEYWORDS: Record<number, string[]> = {
  1: [`h1`, `heading1`, `一级`, `标题`],
  2: [`h2`, `heading2`, `二级`, `标题`],
  3: [`h3`, `heading3`, `三级`, `标题`],
  4: [`h4`, `heading4`, `四级`, `标题`],
  5: [`h5`, `heading5`, `五级`, `标题`],
  6: [`h6`, `heading6`, `六级`, `标题`],
}

function insertText(view: EditorViewType, text: string, cursorOffset?: number) {
  const cursor = view.state.selection.main.head
  const offset = cursorOffset ?? text.length
  view.dispatch({
    changes: { from: cursor, to: cursor, insert: text },
    selection: { anchor: cursor + offset },
  })
  view.focus()
}

function insertCodeFence(view: EditorViewType, lang?: string) {
  const fence = lang ? `\`\`\`${lang}\n\n\`\`\`` : `\`\`\`\n\n\`\`\``
  const cursorOffset = lang ? lang.length + 4 : 4
  insertText(view, fence, cursorOffset)
}

function applyFormat(view: EditorViewType, fn: (view: EditorViewType) => void) {
  fn(view)
  view.focus()
}

function createCommand(
  partial: Omit<SlashCommandItem, 'groupLabel'> & { group: SlashCommandGroup },
): SlashCommandItem {
  return {
    ...partial,
    groupLabel: SLASH_GROUP_LABELS[partial.group],
  }
}

export function buildSlashCommands(): SlashCommandItem[] {
  const uiStore = useUIStore()
  const editorStore = useEditorStore()
  const themeStore = useThemeStore()
  const renderStore = useRenderStore()
  const { formatContent, resetContent, clearContent } = useEditorDocumentActions()

  function refreshPreview() {
    themeStore.updateCodeTheme()
    renderStore.render(editorStore.getContent())
  }

  function applyTheme(theme: ThemeName) {
    themeStore.theme = theme
    themeStore.applyCurrentTheme()
    refreshPreview()
  }

  function applyPrimaryColor(color: string) {
    themeStore.primaryColor = color
    themeStore.applyCurrentTheme()
    refreshPreview()
  }

  const headingCommands = ([1, 2, 3, 4, 5, 6] as const).map(level =>
    createCommand({
      id: `h${level}`,
      label: `H${level}`,
      group: `basic`,
      keywords: HEADING_KEYWORDS[level],
      icon: `H${level}`,
      action: view => insertText(view, `${`#`.repeat(level)} `),
    }),
  )

  const blockCommands: SlashCommandItem[] = [
    createCommand({
      id: `ordered-list`,
      label: `有序列表`,
      group: `basic`,
      keywords: [`ol`, `ordered`, `有序`, `列表`, `numbered`],
      icon: `ordered-list`,
      action: view => insertText(view, `1. `),
    }),
    createCommand({
      id: `unordered-list`,
      label: `无序列表`,
      group: `basic`,
      keywords: [`ul`, `unordered`, `无序`, `列表`, `bullet`],
      icon: `unordered-list`,
      action: view => insertText(view, `- `),
    }),
    createCommand({
      id: `blockquote`,
      label: `引用`,
      group: `basic`,
      keywords: [`quote`, `引用`, `blockquote`],
      icon: `blockquote`,
      action: view => insertText(view, `> `),
    }),
    createCommand({
      id: `divider`,
      label: `分割线`,
      group: `basic`,
      keywords: [`hr`, `divider`, `分割线`, `---`, `横线`],
      icon: `divider`,
      action: view => insertText(view, `\n---\n`),
    }),
  ]

  const formatCommands: SlashCommandItem[] = [
    createCommand({
      id: `bold`,
      label: `加粗`,
      group: `basic`,
      keywords: [`bold`, `加粗`, `jiacu`, `b`, `strong`],
      icon: `bold`,
      action: view => applyFormat(view, formatBold),
    }),
    createCommand({
      id: `italic`,
      label: `斜体`,
      group: `basic`,
      keywords: [`italic`, `斜体`, `xieti`, `i`, `em`],
      icon: `italic`,
      action: view => applyFormat(view, formatItalic),
    }),
    createCommand({
      id: `strikethrough`,
      label: `删除线`,
      group: `basic`,
      keywords: [`strike`, `strikethrough`, `删除线`, `shanchuxian`, `del`],
      icon: `strikethrough`,
      action: view => applyFormat(view, formatStrikethrough),
    }),
    createCommand({
      id: `inline-code`,
      label: `行内代码`,
      group: `basic`,
      keywords: [`inline-code`, `code`, `行内代码`, `inline`],
      icon: `code-inline`,
      action: view => applyFormat(view, formatCode),
    }),
    createCommand({
      id: `link-wrap`,
      label: `超链接`,
      group: `basic`,
      keywords: [`link-wrap`, `超链接`, `chaolianjie`, `wrap`],
      icon: `link-wrap`,
      action: view => applyFormat(view, formatLink),
    }),
  ]

  const commonCommands: SlashCommandItem[] = [
    createCommand({
      id: `code-block`,
      label: `代码块`,
      group: `common`,
      keywords: [`code`, `代码块`, `\`\`\``, `codeblock`, `fence`],
      icon: `code`,
      action: view => insertCodeFence(view),
    }),
    createCommand({
      id: `markdown`,
      label: `Markdown`,
      group: `common`,
      keywords: [`markdown`, `md`, `raw`],
      icon: `markdown`,
      action: view => insertCodeFence(view, `markdown`),
    }),
    createCommand({
      id: `formula`,
      label: `公式块`,
      group: `common`,
      keywords: [`formula`, `公式`, `math`, `latex`, `$$`, `katex`],
      icon: `formula`,
      action: () => {
        uiStore.openFormulaEditor({ value: ``, displayMode: true })
      },
    }),
    createCommand({
      id: `image`,
      label: `图片`,
      group: `common`,
      keywords: [`image`, `图片`, `img`, `photo`, `picture`],
      icon: `image`,
      action: () => {
        uiStore.toggleShowUploadImgDialog()
      },
    }),
    createCommand({
      id: `table`,
      label: `表格`,
      group: `common`,
      keywords: [`table`, `表格`, `grid`],
      icon: `table`,
      action: () => {
        uiStore.toggleShowInsertFormDialog()
      },
    }),
    createCommand({
      id: `component`,
      label: `组件`,
      group: `common`,
      keywords: [`component`, `组件`, `blocks`, `block`],
      icon: `blocks`,
      action: () => {
        uiStore.toggleShowComponentDialog()
      },
    }),
  ]

  const editCommands: SlashCommandItem[] = [
    createCommand({
      id: `format-doc`,
      label: `格式化`,
      group: `edit`,
      keywords: [`format`, `格式化`, `geshihua`, `prettier`],
      icon: `format`,
      action: async (view) => {
        await formatContent()
        view.focus()
      },
    }),
    createCommand({
      id: `reset-content`,
      label: `重置`,
      group: `edit`,
      keywords: [`reset`, `重置`, `chongzhi`, `default`],
      icon: `reset`,
      action: (view) => {
        resetContent()
        view.focus()
      },
    }),
    createCommand({
      id: `clear-content`,
      label: `清空`,
      group: `edit`,
      keywords: [`clear`, `清空`, `qingkong`, `empty`],
      icon: `clear`,
      action: (view) => {
        clearContent()
        view.focus()
      },
    }),
    createCommand({
      id: `find`,
      label: `查找`,
      group: `edit`,
      keywords: [`find`, `search`, `查找`, `chazhao`],
      icon: `find`,
      action: (view) => {
        const selection = view.state.selection.main
        const selected = view.state.doc.sliceString(selection.from, selection.to).trim()
        uiStore.openSearchTab(selected)
        view.focus()
      },
    }),
  ]

  const styleCommands: SlashCommandItem[] = [
    ...themeOptions.map(option => createCommand({
      id: `theme-${option.value}`,
      label: `主题 · ${option.label}`,
      group: `style`,
      keywords: [`theme`, `主题`, `zhuti`, option.value, option.label],
      icon: `theme`,
      action: (view) => {
        applyTheme(option.value as ThemeName)
        view.focus()
      },
    })),
    ...colorOptions.map(option => createCommand({
      id: `color-${option.value.replace('#', '')}`,
      label: `主题色 · ${option.label}`,
      group: `style`,
      keywords: [`color`, `主题色`, `zhutise`, option.label, option.value],
      icon: `color`,
      swatch: option.value,
      action: (view) => {
        applyPrimaryColor(option.value)
        view.focus()
      },
    })),
  ]

  return [
    ...headingCommands,
    ...blockCommands,
    ...formatCommands,
    ...commonCommands,
    ...editCommands,
    ...styleCommands,
  ]
}
