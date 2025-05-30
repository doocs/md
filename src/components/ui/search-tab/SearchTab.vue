<script setup lang="ts">
import type CodeMirror from 'codemirror'
import {
  BoxSelect,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Replace,
  ReplaceAll,
  X,
} from 'lucide-vue-next'

/* -------------------------------------------------------------------------- */
/* Props & Refs                                                               */
/* -------------------------------------------------------------------------- */
const props = defineProps<{ editor: CodeMirror.Editor }>()

const showSearchTab = ref(false)
const showReplace = ref(false)

const searchWord = ref(``)
const replaceWord = ref(``)
const indexOfMatch = ref(0)

const searchInSelection = ref(false)
let selectionSnapshot: { from: CodeMirror.Position, to: CodeMirror.Position }[] = []

/* -------------------------------------------------------------------------- */
/* Match Information                                                          */
/* -------------------------------------------------------------------------- */
const matchPositions = ref<CodeMirror.Position[][]>([])
const numberOfMatches = computed(() => matchPositions.value.length)
const hasMatches = computed(() => numberOfMatches.value > 0)
const currentMatchPos = computed(() =>
  hasMatches.value ? matchPositions.value[indexOfMatch.value] : null,
)

/* -------------------------------------------------------------------------- */
/* Selection State (for button disabling)                                     */
/* -------------------------------------------------------------------------- */
const hasSelection = ref(false)
function updateHasSelection() {
  hasSelection.value = props.editor
    .listSelections()
    .some(sel =>
      sel.anchor.line !== sel.head.line || sel.anchor.ch !== sel.head.ch,
    )
}

/* -------------------------------------------------------------------------- */
/* Watchers                                                                   */
/* -------------------------------------------------------------------------- */
watch(searchWord, () => {
  useDebounceFn(() => {
    if (!searchWord.value) {
      matchPositions.value = []
      clearAllMarks()
    }
    else {
      indexOfMatch.value = 0
      findAllMatches()
    }
  }, 300)()
})

watch([indexOfMatch, matchPositions], markMatch)

watch(showSearchTab, () => {
  showSearchTab.value ? markMatch() : clearAllMarks()
})

watch(searchInSelection, () => {
  indexOfMatch.value = 0
  findAllMatches()
})

/* -------------------------------------------------------------------------- */
/* Lifecycle Hooks                                                            */
/* -------------------------------------------------------------------------- */
onMounted(() => {
  const ed = props.editor

  ed.on(`changes`, () => {
    useDebounceFn(findAllMatches, 300)()
  })

  ed.on(`cursorActivity`, updateHasSelection)

  updateHasSelection()
})

onUnmounted(() => {
  const ed = props.editor

  ed.off(`changes`, findAllMatches)
  ed.off(`cursorActivity`, updateHasSelection)
})

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function clearAllMarks() {
  props.editor.getAllMarks().forEach(mark => mark.clear())
}

function markMatch() {
  const ed = props.editor

  clearAllMarks()

  matchPositions.value.forEach((pos, i) => {
    ed.markText(pos[0], pos[1], {
      className: i === indexOfMatch.value ? `current-match` : `search-match`,
    })
  })

  if (currentMatchPos.value) {
    ed.scrollIntoView(currentMatchPos.value[0])
  }
}

function isBeforeOrEqual(
  a: CodeMirror.Position,
  b: CodeMirror.Position,
) {
  return (
    a.line < b.line
    || (a.line === b.line && a.ch <= b.ch)
  )
}

/* -------------------------------------------------------------------------- */
/* Search Logic                                                               */
/* -------------------------------------------------------------------------- */
function findAllMatches() {
  const ed = props.editor

  if (!searchWord.value || !showSearchTab.value)
    return

  const results: CodeMirror.Position[][] = []
  const ranges = searchInSelection.value ? selectionSnapshot : []

  if (ranges.length) {
    ranges.forEach((range) => {
      const cur = ed.getSearchCursor(searchWord.value, range.from, true)

      while (cur.findNext()) {
        if (!isBeforeOrEqual(cur.to(), range.to))
          break
        results.push([cur.from(), cur.to()])
      }
    })
  }
  else {
    const cur = ed.getSearchCursor(searchWord.value, undefined, true)
    while (cur.findNext()) {
      results.push([cur.from(), cur.to()])
    }
  }

  matchPositions.value = results

  if (indexOfMatch.value >= results.length) {
    indexOfMatch.value = results.length - 1
  }
}

/* -------------------------------------------------------------------------- */
/* Selection-Search Mode                                                      */
/* -------------------------------------------------------------------------- */
function toggleSearchInSelection() {
  // 无选区且尝试开启 → 忽略
  if (!hasSelection.value && !searchInSelection.value)
    return

  searchInSelection.value = !searchInSelection.value

  if (searchInSelection.value) {
    // 记录当前选区快照
    selectionSnapshot = props.editor.listSelections().map((sel) => {
      const from = sel.anchor < sel.head ? sel.anchor : sel.head
      const to = sel.anchor < sel.head ? sel.head : sel.anchor
      return { from, to }
    })
  }
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */
function nextMatch() {
  if (!hasMatches.value)
    return
  indexOfMatch.value = (indexOfMatch.value + 1) % numberOfMatches.value
}

function prevMatch() {
  if (!hasMatches.value)
    return
  indexOfMatch.value
    = (indexOfMatch.value - 1 + numberOfMatches.value) % numberOfMatches.value
}

/* -------------------------------------------------------------------------- */
/* Replace                                                                    */
/* -------------------------------------------------------------------------- */
function handleReplace() {
  if (!currentMatchPos.value)
    return

  const [from, to] = currentMatchPos.value
  props.editor.replaceRange(replaceWord.value, from, to)

  findAllMatches()
}

function handleReplaceAll() {
  if (!matchPositions.value.length)
    return

  // 倒序替换，防止坐标偏移
  for (let i = matchPositions.value.length - 1; i >= 0; i--) {
    const [from, to] = matchPositions.value[i]
    props.editor.replaceRange(replaceWord.value, from, to)
  }

  findAllMatches()
}

/* -------------------------------------------------------------------------- */
/* Misc UI Actions                                                            */
/* -------------------------------------------------------------------------- */
function toggleShowReplace() {
  showReplace.value = !showReplace.value
}

function closeSearchTab() {
  showSearchTab.value = false
}

function handleSearchKey(e: KeyboardEvent) {
  if (e.key === `Enter`) {
    nextMatch()
    e.preventDefault()
  }
}

function handleReplaceKey(e: KeyboardEvent) {
  if (e.key === `Enter`) {
    handleReplace()
    e.preventDefault()
  }
}

/* -------------------------------------------------------------------------- */
/* Expose                                                                     */
/* -------------------------------------------------------------------------- */
defineExpose({ showSearchTab })
</script>

<template>
  <Transition name="slide-down">
    <div
      v-if="showSearchTab"
      class="bg-background absolute right-0 top-0 z-50 min-w-[300px] w-fit flex gap-1 border rounded-lg px-2 py-1 shadow-md transition-all"
      :class="showReplace ? 'items-start' : 'items-center'"
    >
      <!-- 折叠 / 展开 -->
      <Button
        variant="ghost"
        class="h-7 w-5 p-0"
        aria-label="切换替换"
        title="切换替换"
        @click="toggleShowReplace"
      >
        <component
          :is="showReplace ? ChevronDown : ChevronRight"
          class="h-3.5 w-3.5"
        />
      </Button>

      <!-- 主体 -->
      <div class="flex flex-col gap-0.5">
        <!-- 查找行 -->
        <div class="flex items-center gap-1">
          <Input
            v-model="searchWord"
            placeholder="查找"
            class="h-7 w-40 text-sm"
            @keydown="handleSearchKey"
          />

          <!-- 仅选区查找 -->
          <Button
            variant="ghost"
            size="xs"
            class="h-6 w-6 p-0"
            :class="searchInSelection ? 'bg-muted opacity-70' : ''"
            :disabled="!hasSelection && !searchInSelection"
            aria-label="仅在选区查找"
            title="仅在选区查找"
            @click="toggleSearchInSelection"
          >
            <BoxSelect class="h-3 w-3" />
          </Button>

          <!-- 命中计数 -->
          <span class="w-10 select-none text-center text-xs">
            {{ hasMatches ? indexOfMatch + 1 : 0 }} / {{ numberOfMatches }}
          </span>

          <!-- 上下导航 -->
          <Button
            variant="ghost"
            size="xs"
            class="h-6 w-6 p-0"
            :disabled="!hasMatches"
            aria-label="上一处"
            title="上一处"
            @click="prevMatch"
          >
            <ChevronUp class="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="xs"
            class="h-6 w-6 p-0"
            :disabled="!hasMatches"
            aria-label="下一处"
            title="下一处"
            @click="nextMatch"
          >
            <ChevronDown class="h-3 w-3" />
          </Button>

          <!-- 关闭 -->
          <Button
            variant="ghost"
            size="xs"
            class="h-6 w-6 p-0"
            aria-label="关闭"
            title="关闭"
            @click="closeSearchTab"
          >
            <X class="h-3 w-3" />
          </Button>
        </div>

        <!-- 替换行 -->
        <div v-if="showReplace" class="flex items-center gap-1">
          <Input
            v-model="replaceWord"
            placeholder="替换"
            class="h-7 w-40 text-sm"
            @keydown="handleReplaceKey"
          />

          <Button
            variant="ghost"
            size="xs"
            class="h-6 w-6 p-0"
            :disabled="!hasMatches"
            aria-label="替换"
            title="替换"
            @click="handleReplace"
          >
            <Replace class="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="xs"
            class="h-6 w-6 p-0"
            :disabled="!hasMatches"
            aria-label="全部替换"
            title="全部替换"
            @click="handleReplaceAll"
          >
            <ReplaceAll class="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="less">
.slide-down-enter-active,
.slide-down-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
