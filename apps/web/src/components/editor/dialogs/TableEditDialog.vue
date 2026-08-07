<script setup lang="ts">
import type { MarkdownTableRange, TableCellAlignment } from '@md/shared/utils/table'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Plus,
  Trash2,
  X,
} from '@lucide/vue'
import {
  buildMarkdownTable,
  createTableData,
  findMarkdownTableAt,
  parseMarkdownTable,
  relocateMarkdownTable,
  tableColumnCount,
} from '@md/shared/utils/table'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'

const { t } = useI18n()
const uiStore = useUIStore()
const editorStore = useEditorStore()

const MAX_ROWS = 50
const MAX_COLS = 12

/**
 * Size of the table when the dialog opened. Existing tables may exceed the
 * creation limits; the stepper caps gate NEW growth, never truncate data.
 */
const initialRowCount = ref(0)
const initialColCount = ref(0)
const maxRows = computed(() => Math.max(MAX_ROWS, initialRowCount.value))
const maxCols = computed(() => Math.max(MAX_COLS, initialColCount.value))

const tableRange = ref<MarkdownTableRange | null>(null)
const isEditMode = computed(() => tableRange.value !== null)

const header = ref<string[]>([])
const aligns = ref<(TableCellAlignment | null)[]>([])
const rows = ref<string[][]>([])

const gridRef = useTemplateRef<HTMLElement>(`gridRef`)

function padCells(cells: string[], cols: number): string[] {
  return Array.from({ length: cols }, (_, i) => cells[i] ?? ``)
}

function loadData(data: { header: string[], aligns: (TableCellAlignment | null)[], rows: string[][] }) {
  const cols = tableColumnCount(data)
  header.value = padCells(data.header, cols)
  aligns.value = Array.from({ length: cols }, (_, i) => data.aligns[i] ?? null)
  rows.value = data.rows.map(row => padCells(row, cols))
}

const colCount = computed<number>({
  get: () => Math.max(header.value.length, 1),
  set: (n) => {
    const target = Math.max(1, Math.min(maxCols.value, Math.floor(n) || 1))
    while (header.value.length < target) {
      header.value.push(``)
      aligns.value.push(null)
      rows.value.forEach(row => row.push(``))
    }
    header.value.length = target
    aligns.value.length = target
    rows.value.forEach(row => (row.length = target))
  },
})

const rowCount = computed<number>({
  get: () => rows.value.length,
  set: (n) => {
    const target = Math.max(1, Math.min(maxRows.value, Math.floor(n) || 1))
    while (rows.value.length < target)
      rows.value.push(Array.from<string>({ length: colCount.value }).fill(``))
    rows.value.length = target
  },
})

watch(
  () => uiStore.isShowTableEditDialog,
  async (open) => {
    if (!open)
      return

    const view = toRaw(editorStore.editor)
    const range = view
      ? findMarkdownTableAt(view.state.doc.toString(), view.state.selection.main.head)
      : null
    const parsed = range ? parseMarkdownTable(range.text) : null

    if (range && parsed) {
      tableRange.value = range
      loadData(parsed)
    }
    else {
      tableRange.value = null
      loadData(createTableData(3, 3))
    }
    initialRowCount.value = rows.value.length
    initialColCount.value = header.value.length

    await nextTick()
    gridRef.value?.querySelector<HTMLInputElement>(`input[data-r="-1"][data-c="0"]`)?.focus()
  },
  { immediate: true },
)

function addRow() {
  if (rows.value.length < maxRows.value)
    rows.value.push(Array.from<string>({ length: colCount.value }).fill(``))
}

function removeRow(index: number) {
  if (rows.value.length > 1)
    rows.value.splice(index, 1)
}

function removeCol(index: number) {
  if (colCount.value <= 1)
    return
  header.value.splice(index, 1)
  aligns.value.splice(index, 1)
  rows.value.forEach(row => row.splice(index, 1))
}

const ALIGN_CYCLE: (TableCellAlignment | null)[] = [null, `left`, `center`, `right`]
const alignIcons = { left: AlignLeft, center: AlignCenter, right: AlignRight } as const

function cycleAlign(index: number) {
  const next = ALIGN_CYCLE[(ALIGN_CYCLE.indexOf(aligns.value[index] ?? null) + 1) % ALIGN_CYCLE.length]
  aligns.value[index] = next
}

function alignIcon(index: number) {
  const align = aligns.value[index]
  return align ? alignIcons[align] : AlignJustify
}

function alignTitle(index: number) {
  const align = aligns.value[index] ?? null
  const key = align === null ? `alignDefault` : `align${align[0].toUpperCase()}${align.slice(1)}`
  return t(`tableEditor.${key}`)
}

/** Enter moves to the cell below, appending a row at the bottom. */
function onCellKeydown(event: KeyboardEvent, rowIndex: number, colIndex: number) {
  if (event.key !== `Enter` || event.isComposing)
    return
  event.preventDefault()
  const nextRow = rowIndex + 1
  if (nextRow >= rows.value.length)
    addRow()
  nextTick(() => {
    gridRef.value
      ?.querySelector<HTMLInputElement>(`input[data-r="${nextRow}"][data-c="${colIndex}"]`)
      ?.focus()
  })
}

/**
 * The document may have changed while the dialog was open (typing, cloud
 * sync); never write at the stale captured offsets. Returns null and toasts
 * when the original table can no longer be located.
 */
function resolveCurrentRange(): MarkdownTableRange | null {
  const view = toRaw(editorStore.editor)
  const stored = tableRange.value
  if (!view || !stored)
    return null
  const resolved = relocateMarkdownTable(view.state.doc.toString(), stored)
  if (resolved) {
    tableRange.value = resolved
    return resolved
  }
  toast.error(t(`tableEditor.staleError`))
  return null
}

function applyTable() {
  const view = toRaw(editorStore.editor)
  if (!view)
    return

  const markdown = buildMarkdownTable({
    header: header.value,
    aligns: aligns.value,
    rows: rows.value,
  })

  if (isEditMode.value) {
    const resolved = resolveCurrentRange()
    if (!resolved)
      return
    const { from, to, text } = resolved
    // Re-apply the original indentation so list-nested tables stay nested.
    const indent = text.match(/^ */)?.[0] ?? ``
    const inserted = indent
      ? markdown.split(`\n`).map(line => indent + line).join(`\n`)
      : markdown
    view.dispatch({
      changes: { from, to, insert: inserted },
      selection: { anchor: from + inserted.length },
    })
    toast.success(t(`tableEditor.updateSuccess`))
  }
  else {
    const selection = view.state.selection.main
    const line = view.state.doc.lineAt(selection.head)
    if (line.text.trim() === ``) {
      view.dispatch({
        changes: { from: line.from, to: line.to, insert: markdown },
        selection: { anchor: line.from + markdown.length },
      })
    }
    else {
      const insertAt = line.to
      view.dispatch({
        changes: { from: insertAt, insert: `\n\n${markdown}` },
        selection: { anchor: insertAt + 2 + markdown.length },
      })
    }
    toast.success(t(`tableEditor.insertSuccess`))
  }

  view.focus()
  uiStore.closeTableEditDialog()
}

function deleteTable() {
  const view = toRaw(editorStore.editor)
  if (!view || !tableRange.value)
    return

  const resolved = resolveCurrentRange()
  if (!resolved)
    return

  const doc = view.state.doc
  let { from } = resolved
  const { to } = resolved
  const firstLine = doc.lineAt(from)
  const lastLine = doc.lineAt(to)
  // Swallow one surrounding blank line so the deletion does not leave a
  // double blank gap when the table sat between two blank lines.
  const prevBlank = firstLine.number > 1 && doc.line(firstLine.number - 1).text.trim() === ``
  const nextBlank = lastLine.number < doc.lines && doc.line(lastLine.number + 1).text.trim() === ``
  if (prevBlank && nextBlank)
    from = doc.line(firstLine.number - 1).from

  view.dispatch({
    changes: { from, to, insert: `` },
    selection: { anchor: from },
  })
  view.focus()
  uiStore.closeTableEditDialog()
}

function onUpdate(open: boolean) {
  if (!open)
    uiStore.closeTableEditDialog()
}
</script>

<template>
  <Dialog :open="uiStore.isShowTableEditDialog" @update:open="onUpdate">
    <DialogContent class="sm:max-w-3xl max-h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>{{ isEditMode ? t('tableEditor.titleEdit') : t('tableEditor.titleCreate') }}</DialogTitle>
        <DialogDescription>
          {{ isEditMode ? t('tableEditor.descriptionEdit') : t('tableEditor.descriptionCreate') }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-wrap items-center gap-4">
        <NumberField v-model="rowCount" :min="1" :max="maxRows" class="w-32">
          <Label>{{ t('tableEditor.rows') }}</Label>
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
        <NumberField v-model="colCount" :min="1" :max="maxCols" class="w-32">
          <Label>{{ t('tableEditor.cols') }}</Label>
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>

      <div ref="gridRef" class="min-h-0 flex-1 overflow-auto rounded-md border">
        <table class="w-full border-collapse text-sm">
          <thead class="sticky top-0 bg-background">
            <tr class="border-b">
              <th class="w-8" />
              <th v-for="c in colCount" :key="c" class="group px-1 py-1.5 font-normal">
                <div class="flex items-center justify-center gap-0.5">
                  <button
                    type="button"
                    class="hover:bg-accent rounded p-1 transition-colors"
                    :title="alignTitle(c - 1)"
                    @click="cycleAlign(c - 1)"
                  >
                    <component :is="alignIcon(c - 1)" class="h-3.5 w-3.5" />
                  </button>
                  <button
                    v-if="colCount > 1"
                    type="button"
                    class="hover:bg-destructive/10 hover:text-destructive rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    :title="t('tableEditor.deleteCol')"
                    :aria-label="t('tableEditor.deleteCol')"
                    @click="removeCol(c - 1)"
                  >
                    <X class="h-3.5 w-3.5" />
                  </button>
                </div>
              </th>
            </tr>
            <tr class="border-b">
              <th />
              <td v-for="c in colCount" :key="c" class="p-1">
                <Input
                  v-model="header[c - 1]"
                  :data-r="-1"
                  :data-c="c - 1"
                  class="bg-muted/50 h-9 font-medium"
                  :placeholder="t('tableEditor.header')"
                  @keydown="onCellKeydown($event, -1, c - 1)"
                />
              </td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, r) in rows" :key="r" class="group border-b last:border-b-0">
              <td class="w-8 px-1 text-center">
                <button
                  v-if="rows.length > 1"
                  type="button"
                  class="hover:bg-destructive/10 hover:text-destructive rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  :title="t('tableEditor.deleteRow')"
                  :aria-label="t('tableEditor.deleteRow')"
                  @click="removeRow(r)"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </td>
              <td v-for="c in colCount" :key="c" class="p-1">
                <Input
                  v-model="row[c - 1]"
                  :data-r="r"
                  :data-c="c - 1"
                  class="h-9"
                  @keydown="onCellKeydown($event, r, c - 1)"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button
          type="button"
          class="text-muted-foreground hover:bg-accent hover:text-foreground flex w-full items-center justify-center gap-1 border-t border-dashed py-2 text-sm transition-colors disabled:opacity-50"
          :disabled="rows.length >= maxRows"
          @click="addRow"
        >
          <Plus class="h-4 w-4" />
          {{ t('tableEditor.addRow') }}
        </button>
      </div>

      <DialogFooter class="gap-2">
        <Button v-if="isEditMode" variant="destructive" class="mr-auto" @click="deleteTable">
          {{ t('tableEditor.deleteTable') }}
        </Button>
        <Button variant="outline" @click="uiStore.closeTableEditDialog()">
          {{ t('common.cancel') }}
        </Button>
        <Button @click="applyTable">
          {{ isEditMode ? t('tableEditor.update') : t('tableEditor.insert') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
