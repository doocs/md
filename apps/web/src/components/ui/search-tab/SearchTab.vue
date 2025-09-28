<script setup lang="ts">
import type { EditorView } from '@codemirror/view'
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
  // CodeMirror v6 使用不同的标记系统，这里为空实现
  // 实际的标记清理需要使用 v6 的 decoration 系统
}

function markMatch() {
  clearAllMarks()
  // CodeMirror v6 的标记系统需要使用 decoration，这里为简化实现
  // 实际项目中可能需要实现完整的搜索高亮功能

  // 滚动到当前匹配位置
  if (matchPositions.value[indexOfMatch.value]?.[0]) {
    const pos = matchPositions.value[indexOfMatch.value][0]
    const docLine = props.editorView.state.doc.line(pos.line + 1)
    const offset = docLine.from + pos.ch
    props.editorView.dispatch({
      selection: { anchor: offset },
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

onMounted(() => {
  // CodeMirror v6 使用不同的事件系统
  // 这里可以使用 EditorView.updateListener 或者其他方式监听变化
  // 为简化，这里暂时不实现自动更新搜索结果
})
onUnmounted(() => {
  // 清理工作
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
