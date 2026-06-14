import type { EditorView as EditorViewType } from '@codemirror/view'
import type { SlashCommandItem } from '@/composables/slashCommands'
import { Prec } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { buildSlashCommands } from '@/composables/slashCommands'

export function useSlashCommand() {
  const visible = ref(false)
  const position = ref({ x: 0, y: 0, top: 0 })
  const filter = ref(``)
  const activeIndex = ref(0)
  const slashFrom = ref(-1)

  const allCommands = buildSlashCommands()

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
  const editCommands = computed(() => filteredCommands.value.filter(c => c.group === `edit`))
  const styleCommands = computed(() => filteredCommands.value.filter(c => c.group === `style`))

  function openMenu(view: EditorViewType, from: number) {
    const coords = view.coordsAtPos(from)
    if (!coords)
      return
    slashFrom.value = from
    filter.value = ``
    activeIndex.value = 0
    position.value = { x: coords.left, y: coords.bottom, top: coords.top }
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
        if (visible.value && update.viewportChanged && !update.docChanged) {
          closeMenu()
          return
        }

        if (!update.docChanged)
          return

        const state = update.state
        const cursor = state.selection.main.head

        if (!visible.value) {
          update.changes.iterChanges((_fromA, _toA, fromB, _toB, inserted) => {
            if (inserted.length === 1 && inserted.toString() === `/`) {
              const line = state.doc.lineAt(fromB)
              const charBefore = fromB > line.from ? state.doc.sliceString(fromB - 1, fromB) : ``
              const isAtLineStart = fromB === line.from
              const isPrecededBySpace = charBefore === ` ` || charBefore === `\t`
              if (isAtLineStart || isPrecededBySpace) {
                const view = getView()
                if (view)
                  openMenu(view, fromB)
              }
            }
          })
        }
        else {
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
    editCommands,
    styleCommands,
    allCommands,
    closeMenu,
    executeCommand,
    createExtension,
  }
}
