<script setup lang="ts">
import type { DecorationSet } from '@codemirror/view'
import { StateEffect, StateField } from '@codemirror/state'
import { Decoration, EditorView } from '@codemirror/view'
import { ChevronDown, ChevronRight, ChevronUp, Replace, ReplaceAll, X } from 'lucide-vue-next'

const props = defineProps<{
  editorView: EditorView
}>()

const showSearchTab = ref(false)
const searchInputRef = ref<{ focus: () => void, select: () => void } | null>(null)

const searchWord = ref(``)
const indexOfMatch = ref(0)
const showReplace = ref(false)
const replaceWord = ref(``)

const matchPositions = ref<Array<Array<{ line: number, ch: number }>>>([])
const numberOfMatches = computed(() => {
  return matchPositions.value.length
})

const currentMatchPosition = computed(() => {
  if (!checkMatchNumber())
    return null
  return matchPositions.value[indexOfMatch.value]
})

// 定义高亮样式的 StateEffect
const setSearchHighlights = StateEffect.define<DecorationSet>()

// 创建搜索高亮的 StateField（需要在编辑器初始化时添加）
const searchHighlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(highlights, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setSearchHighlights)) {
        return effect.value
      }
    }
    return highlights
  },
  provide: f => EditorView.decorations.from(f),
})

// 在组件挂载时动态添加 searchHighlightField
onMounted(() => {
  // 检查编辑器是否已经有这个 field
  if (!props.editorView.state.field(searchHighlightField, false)) {
    // 动态添加 extension
    props.editorView.dispatch({
      effects: StateEffect.appendConfig.of(searchHighlightField),
    })
  }
})

watch(searchWord, () => {
  const debouncedSearch = useDebounceFn(() => {
    matchPositions.value = []

    if (searchWord.value === ``) {
      clearAllMarks()
    }
    else {
      indexOfMatch.value = 0
      findAllMatches()
    }
  }, 300)

  debouncedSearch()
})

watch([indexOfMatch, matchPositions], () => {
  markMatch()
})

watch(showSearchTab, async () => {
  if (!showSearchTab.value) {
    clearAllMarks()
  }
  else {
    markMatch()
    // 等待DOM更新后聚焦输入框
    await nextTick()
    searchInputRef.value?.focus()
    searchInputRef.value?.select()
  }
})

function clearAllMarks() {
  // 清除所有搜索高亮
  props.editorView.dispatch({
    effects: setSearchHighlights.of(Decoration.none),
  })
}

function markMatch() {
  // 清除旧的高亮
  const decorations: any[] = []

  // 为所有匹配项添加高亮装饰
  matchPositions.value.forEach((match, idx) => {
    const from = match[0]
    const to = match[1]
    const fromLine = props.editorView.state.doc.line(from.line + 1)
    const toLine = props.editorView.state.doc.line(to.line + 1)
    const fromPos = fromLine.from + from.ch
    const toPos = toLine.from + to.ch

    // 当前选中的匹配项使用不同的样式
    const isCurrentMatch = idx === indexOfMatch.value
    const mark = Decoration.mark({
      class: isCurrentMatch ? `cm-searchMatch-selected` : `cm-searchMatch`,
    })

    decorations.push(mark.range(fromPos, toPos))
  })

  // 应用装饰
  const decorationSet = Decoration.set(decorations, true)
  props.editorView.dispatch({
    effects: setSearchHighlights.of(decorationSet),
  })

  // 滚动到当前匹配位置
  if (matchPositions.value[indexOfMatch.value]?.[0]) {
    const pos = matchPositions.value[indexOfMatch.value][0]
    const docLine = props.editorView.state.doc.line(pos.line + 1)
    const offset = docLine.from + pos.ch
    props.editorView.dispatch({
      selection: { anchor: offset, head: offset },
      scrollIntoView: true,
    })
  }
}

function findAllMatches() {
  if (!searchWord.value || !showSearchTab.value)
    return

  // 使用 v6 的方式搜索文本
  const content = props.editorView.state.doc.toString()
  const searchTerm = searchWord.value
  const _matchPositions: Array<Array<{ line: number, ch: number }>> = []

  if (searchTerm) {
    const lines = content.split(`\n`)
    lines.forEach((line, lineIndex) => {
      let startIndex = 0
      let index = line.toLowerCase().indexOf(searchTerm.toLowerCase(), startIndex)

      while (index !== -1) {
        _matchPositions.push([
          { line: lineIndex, ch: index },
          { line: lineIndex, ch: index + searchTerm.length },
        ])
        startIndex = index + 1
        index = line.toLowerCase().indexOf(searchTerm.toLowerCase(), startIndex)
      }
    })
  }

  matchPositions.value = _matchPositions
  if (matchPositions.value.length > 0 && indexOfMatch.value >= matchPositions.value.length) {
    indexOfMatch.value = matchPositions.value.length - 1
  }
}

function nextMatch() {
  if (!checkMatchNumber())
    return
  indexOfMatch.value = (indexOfMatch.value + 1) % numberOfMatches.value
}
function prevMatch() {
  if (!checkMatchNumber())
    return
  indexOfMatch.value = (indexOfMatch.value - 1 + numberOfMatches.value) % numberOfMatches.value
}

function toggleShowReplace() {
  showReplace.value = !showReplace.value
}

function closeSearchTab() {
  showSearchTab.value = false
}

function handleSearchInputKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case `Enter`:
      nextMatch()
      e.preventDefault()
  }
}

function handleReplaceInputKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case `Enter`:
      handleReplace()
      e.preventDefault()
  }
}

function handleReplace() {
  if (!checkMatchNumber())
    return
  if (!currentMatchPosition.value)
    return

  const from = currentMatchPosition.value[0]
  const to = currentMatchPosition.value[1]
  const fromLine = props.editorView.state.doc.line(from.line + 1)
  const toLine = props.editorView.state.doc.line(to.line + 1)
  const fromPos = fromLine.from + from.ch
  const toPos = toLine.from + to.ch

  props.editorView.dispatch({
    changes: { from: fromPos, to: toPos, insert: replaceWord.value },
    selection: { anchor: fromPos + replaceWord.value.length },
  })
  findAllMatches()
}

function handleReplaceAll() {
  if (!checkMatchNumber())
    return
  if (!currentMatchPosition.value)
    return

  // 从后往前替换，避免位置偏移
  const sortedPositions = [...matchPositions.value].sort((a, b) => {
    if (a[0].line !== b[0].line) {
      return b[0].line - a[0].line
    }
    return b[0].ch - a[0].ch
  })

  const changes = sortedPositions.map((pos: any) => {
    const from = pos[0]
    const to = pos[1]
    const fromLine = props.editorView.state.doc.line(from.line + 1)
    const toLine = props.editorView.state.doc.line(to.line + 1)
    const fromPos = fromLine.from + from.ch
    const toPos = toLine.from + to.ch

    return { from: fromPos, to: toPos, insert: replaceWord.value }
  })

  props.editorView.dispatch({ changes })
  findAllMatches()
}

// function handleEditorChange() {
//   const debouncedSearch = useDebounceFn(findAllMatches, 300)
//   debouncedSearch()
// }

function setSearchWord(word: string) {
  searchWord.value = word
  if (!showSearchTab.value) {
    showSearchTab.value = true
  }
  else {
    nextTick(() => {
      searchInputRef.value?.focus()
      searchInputRef.value?.select()
    })
  }
}

/**
 * 打开搜索面板并展开替换功能
 */
function setSearchWithReplace(word: string) {
  searchWord.value = word
  showReplace.value = true
  if (!showSearchTab.value) {
    showSearchTab.value = true
  }
  else {
    nextTick(() => {
      searchInputRef.value?.focus()
      searchInputRef.value?.select()
    })
  }
}

onUnmounted(() => {
  // 清理搜索高亮
  clearAllMarks()
})

/**
 * 检查是否有匹配项
 * 返回 false 表示没有匹配项
 * 返回 true 表示有匹配项
 */
function checkMatchNumber(): boolean {
  return numberOfMatches.value > 0
}

defineExpose({
  showSearchTab,
  searchWord,
  setSearchWord,
  setSearchWithReplace,
  showReplace,
})
</script>

<template>
  <Transition name="slide-down">
    <div
      v-if="showSearchTab"
      class="bg-background absolute right-0 top-0 z-50 min-w-[300px] w-fit flex gap-1 border rounded-lg px-2 py-1 shadow-md transition-all"
      :class="showReplace ? 'items-start' : 'items-center'"
    >
      <!-- 折叠/展开按钮 -->
      <Button
        variant="ghost"
        title="切换替换"
        aria-label="切换替换"
        class="h-7 w-5 flex items-center justify-center p-0"
        @click="toggleShowReplace"
      >
        <component :is="showReplace ? ChevronDown : ChevronRight" class="h-3.5 w-3.5" />
      </Button>

      <!-- 查找 / 替换主体 -->
      <div class="flex flex-col gap-0.5">
        <!-- 查找行 -->
        <div class="flex items-center gap-1">
          <Input
            ref="searchInputRef"
            v-model="searchWord"
            placeholder="查找"
            class="h-7 w-40 text-sm"
            @keydown="handleSearchInputKeyDown"
          />
          <span class="w-10 select-none text-center text-xs">
            {{ numberOfMatches ? indexOfMatch + 1 : 0 }}/{{ numberOfMatches }}
          </span>
          <Button
            variant="ghost"
            size="xs"
            title="上一处"
            aria-label="上一处"
            class="h-6 w-6 p-0"
            @click="prevMatch"
          >
            <ChevronUp class="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            title="下一处"
            aria-label="下一处"
            class="h-6 w-6 p-0"
            @click="nextMatch"
          >
            <ChevronDown class="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            title="关闭"
            aria-label="关闭"
            class="h-6 w-6 p-0"
            @click="closeSearchTab"
          >
            <X class="h-3 w-3" />
          </Button>
        </div>

        <!-- 替换行（可折叠） -->
        <div v-if="showReplace" class="flex items-center gap-1">
          <Input
            v-model="replaceWord"
            placeholder="替换"
            class="h-7 w-40 text-sm"
            @keydown="handleReplaceInputKeyDown"
          />
          <Button
            variant="ghost"
            size="xs"
            title="替换"
            aria-label="替换"
            class="h-6 w-6 p-0"
            @click="handleReplace"
          >
            <Replace class="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            title="全部替换"
            aria-label="全部替换"
            class="h-6 w-6 p-0"
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

<style lang="less">
/* 搜索匹配项高亮样式（全局，不使用 scoped） */
.cm-searchMatch {
  background-color: rgba(255, 237, 100, 0.4);
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(255, 193, 7, 0.3);
}

.cm-searchMatch-selected {
  background-color: rgba(255, 152, 0, 0.6);
  border-radius: 2px;
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.8);
  font-weight: 500;
}

/* 暗色主题适配 */
.dark .cm-searchMatch {
  background-color: rgba(255, 235, 59, 0.3);
  box-shadow: 0 0 0 1px rgba(255, 235, 59, 0.4);
}

.dark .cm-searchMatch-selected {
  background-color: rgba(255, 152, 0, 0.5);
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.7);
}
</style>
