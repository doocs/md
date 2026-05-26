import type { EditorView as EditorViewType } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { useUIStore } from '@/stores/ui'

export interface SlashCommandItem {
  id: string
  label: string
  group: 'basic' | 'common'
  groupLabel: string
  keywords: string[]
  icon: string
  action: (view: EditorViewType) => void
}

function insertText(view: EditorViewType, text: string, cursorOffset?: number) {
  const cursor = view.state.selection.main.head
  const offset = cursorOffset !== undefined ? cursorOffset : text.length
  view.dispatch({
    changes: { from: cursor, to: cursor, insert: text },
    selection: { anchor: cursor + offset },
  })
  view.focus()
}

export function useSlashCommand() {
  const uiStore = useUIStore()

  const visible = ref(false)
  const position = ref({ x: 0, y: 0 })
  const filter = ref(``)
  const activeIndex = ref(0)
  const slashFrom = ref(-1)

  const allCommands: SlashCommandItem[] = [
    // ────── 基础 ──────
    {
      id: `h1`,
      label: `H1`,
      group: `basic`,
      groupLabel: `基础`,
      keywords: [`h1`, `heading1`, `一级`, `标题`],
      icon: `H1`,
      action: view => insertText(view, `# `),
    },
    {
      id: `h2`,
      label: `H2`,
      group: `basic`,
      groupLabel: `基础`,
      keywords: [`h2`, `heading2`, `二级`, `标题`],
      icon: `H2`,
      action: view => insertText(view, `## `),
    },
    {
      id: `h3`,
      label: `H3`,
      group: `basic`,
      groupLabel: `基础`,
      keywords: [`h3`, `heading3`, `三级`, `标题`],
      icon: `H3`,
      action: view => insertText(view, `### `),
    },
    {
      id: `h4`,
      label: `H4`,
      group: `basic`,
      groupLabel: `基础`,
      keywords: [`h4`, `heading4`, `四级`, `标题`],
      icon: `H4`,
      action: view => insertText(view, `#### `),
    },
    {
      id: `h5`,
      label: `H5`,
      group: `basic`,
      groupLabel: `基础`,
      keywords: [`h5`, `heading5`, `五级`, `标题`],
      icon: `H5`,
      action: view => insertText(view, `##### `),
    },
    {
      id: `h6`,
      label: `H6`,
      group: `basic`,
      groupLabel: `基础`,
      keywords: [`h6`, `heading6`, `六级`, `标题`],
      icon: `H6`,
      action: view => insertText(view, `###### `),
    },
    {
      id: `ordered-list`,
      label: `有序列表`,
      group: `basic`,
      groupLabel: `基础`,
      keywords: [`ol`, `ordered`, `有序`, `列表`, `numbered`],
      icon: `ordered-list`,
      action: view => insertText(view, `1. `),
    },
    {
      id: `unordered-list`,
      label: `无序列表`,
      group: `basic`,
      groupLabel: `基础`,
      keywords: [`ul`, `unordered`, `无序`, `列表`, `bullet`],
      icon: `unordered-list`,
      action: view => insertText(view, `- `),
    },
    {
      id: `blockquote`,
      label: `引用`,
      group: `basic`,
      groupLabel: `基础`,
      keywords: [`quote`, `引用`, `blockquote`],
      icon: `blockquote`,
      action: view => insertText(view, `> `),
    },
    {
      id: `divider`,
      label: `分割线`,
      group: `basic`,
      groupLabel: `基础`,
      keywords: [`hr`, `divider`, `分割线`, `---`, `横线`],
      icon: `divider`,
      action: view => insertText(view, `\n---\n`),
    },
    // ────── 常用 ──────
    {
      id: `link`,
      label: `链接`,
      group: `common`,
      groupLabel: `常用`,
      keywords: [`link`, `链接`, `url`, `href`, `a`],
      icon: `link`,
      action: (view) => {
        // Insert [文字](链接) with cursor selecting "文字"
        const text = `[链接文字](https://)`
        const cursor = view.state.selection.main.head
        view.dispatch({
          changes: { from: cursor, to: cursor, insert: text },
          selection: { anchor: cursor + 1, head: cursor + 5 },
        })
        view.focus()
      },
    },
    {
      id: `code-block`,
      label: `代码块`,
      group: `common`,
      groupLabel: `常用`,
      keywords: [`code`, `代码块`, `\`\`\``, `codeblock`, `fence`],
      icon: `code`,
      action: (view) => {
        const text = `\`\`\`\n\n\`\`\``
        const cursor = view.state.selection.main.head
        view.dispatch({
          changes: { from: cursor, to: cursor, insert: text },
          selection: { anchor: cursor + 4 },
        })
        view.focus()
      },
    },
    {
      id: `markdown`,
      label: `Markdown`,
      group: `common`,
      groupLabel: `常用`,
      keywords: [`markdown`, `md`, `raw`],
      icon: `markdown`,
      action: (view) => {
        const text = `\`\`\`markdown\n\n\`\`\``
        const cursor = view.state.selection.main.head
        view.dispatch({
          changes: { from: cursor, to: cursor, insert: text },
          selection: { anchor: cursor + 12 },
        })
        view.focus()
      },
    },
    {
      id: `formula`,
      label: `公式块`,
      group: `common`,
      groupLabel: `常用`,
      keywords: [`formula`, `公式`, `math`, `latex`, `$$`, `katex`],
      icon: `formula`,
      action: () => {
        uiStore.openFormulaEditor({ value: ``, displayMode: true })
      },
    },
    {
      id: `image`,
      label: `图片`,
      group: `common`,
      groupLabel: `常用`,
      keywords: [`image`, `图片`, `img`, `photo`, `picture`],
      icon: `image`,
      action: () => {
        uiStore.toggleShowUploadImgDialog()
      },
    },
    {
      id: `table`,
      label: `表格`,
      group: `common`,
      groupLabel: `常用`,
      keywords: [`table`, `表格`, `grid`],
      icon: `table`,
      action: () => {
        uiStore.toggleShowInsertFormDialog()
      },
    },
  ]

  const filteredCommands = computed(() => {
    const f = filter.value.toLowerCase().trim()
    if (!f)
      return allCommands
    return allCommands.filter(
      cmd =>
        cmd.label.toLowerCase().includes(f)
        || cmd.id.toLowerCase().includes(f)
        || cmd.keywords.some(k => k.toLowerCase().includes(f)),
    )
  })

  const basicCommands = computed(() => filteredCommands.value.filter(c => c.group === `basic`))
  const commonCommands = computed(() => filteredCommands.value.filter(c => c.group === `common`))

  function openMenu(view: EditorViewType, from: number) {
    const coords = view.coordsAtPos(from)
    if (!coords)
      return
    slashFrom.value = from
    filter.value = ``
    activeIndex.value = 0
    position.value = { x: coords.left, y: coords.bottom }
    visible.value = true
  }

  function closeMenu() {
    visible.value = false
    filter.value = ``
    slashFrom.value = -1
  }

  function executeCommand(view: EditorViewType, command: SlashCommandItem) {
    const from = slashFrom.value
    if (from < 0)
      return
    const cursor = view.state.selection.main.head
    // Remove the "/" + filter text before executing
    view.dispatch({
      changes: { from, to: cursor, insert: `` },
    })
    closeMenu()
    command.action(view)
  }

  function selectNext() {
    const total = filteredCommands.value.length
    if (total === 0)
      return
    activeIndex.value = (activeIndex.value + 1) % total
  }

  function selectPrev() {
    const total = filteredCommands.value.length
    if (total === 0)
      return
    activeIndex.value = (activeIndex.value - 1 + total) % total
  }

  function createExtension(getView: () => EditorViewType | null) {
    return [
      EditorView.updateListener.of((update) => {
        if (!update.docChanged)
          return

        const state = update.state
        const cursor = state.selection.main.head

        if (!visible.value) {
          // Check if "/" was just typed at the cursor position
          update.changes.iterChanges((_fromA, _toA, fromB, _toB, inserted) => {
            if (inserted.length === 1 && inserted.toString() === `/`) {
              // Only trigger slash command when:
              // - at start of line, or
              // - preceded by whitespace/newline
              const line = state.doc.lineAt(fromB)
              const charBefore = fromB > line.from ? state.doc.sliceString(fromB - 1, fromB) : ``
              const isAtLineStart = fromB === line.from
              const isPrecededBySpace = charBefore === ` ` || charBefore === ``
              if (isAtLineStart || isPrecededBySpace) {
                const view = getView()
                if (view)
                  openMenu(view, fromB)
              }
            }
          })
        }
        else {
          // Menu is visible — update filter based on text between slashFrom and cursor
          const from = slashFrom.value
          if (from < 0 || cursor < from) {
            closeMenu()
            return
          }
          const text = state.doc.sliceString(from, cursor)
          if (!text.startsWith(`/`)) {
            closeMenu()
            return
          }
          filter.value = text.slice(1)
          activeIndex.value = 0
          if (filteredCommands.value.length === 0)
            closeMenu()
        }
      }),

      // High-priority keymap to intercept navigation when menu is visible
      Prec.highest(
        keymap.of([
          {
            key: `ArrowDown`,
            run: () => {
              if (!visible.value)
                return false
              selectNext()
              return true
            },
          },
          {
            key: `ArrowUp`,
            run: () => {
              if (!visible.value)
                return false
              selectPrev()
              return true
            },
          },
          {
            key: `Enter`,
            run: (view) => {
              if (!visible.value)
                return false
              const cmd = filteredCommands.value[activeIndex.value]
              if (cmd)
                executeCommand(view, cmd)
              else
                closeMenu()
              return true
            },
          },
          {
            key: `Escape`,
            run: () => {
              if (!visible.value)
                return false
              closeMenu()
              return true
            },
          },
        ]),
      ),
    ]
  }

  return {
    visible,
    position,
    filter,
    activeIndex,
    filteredCommands,
    basicCommands,
    commonCommands,
    allCommands,
    closeMenu,
    executeCommand,
    createExtension,
  }
}
