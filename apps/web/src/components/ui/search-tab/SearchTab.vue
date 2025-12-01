<script setup lang="ts">
import type { DecorationSet } from '@codemirror/view'
import { StateEffect, StateField } from '@codemirror/state'
import { Decoration, EditorView } from '@codemirror/view'
import { CaseSensitive, ChevronDown, ChevronRight, ChevronUp, Regex, Replace, ReplaceAll, WholeWord, X } from 'lucide-vue-next'

const props = defineProps<{
  editorView: EditorView
}>()

const showSearchTab = ref(false)
const searchInputRef = ref<{ focus: () => void, select: () => void } | null>(null)

const searchWord = ref(``)
const isRegex = ref(false)
const isCaseSensitive = ref(false)
const findInSelection = ref(false)
const indexOfMatch = ref(0)
const showReplace = ref(false)
const replaceWord = ref(``)
const selectionRange = ref<{ from: number, to: number } | null>(null)

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

watch([searchWord, isRegex, isCaseSensitive, findInSelection], () => {
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
    findInSelection.value = false
    selectionRange.value = null
  }
  else {
    // 如果有选中文本，自动启用 find in selection
    const selection = props.editorView.state.selection.main
    if (!selection.empty) {
      findInSelection.value = true
      selectionRange.value = { from: selection.from, to: selection.to }
    }
    markMatch()
    // 等待DOM更新后聚焦输入框，但不触发编辑器失焦
    await nextTick()
    // 使用 setTimeout 确保编辑器的选区不会因为输入框聚焦而丢失
    setTimeout(() => {
      searchInputRef.value?.focus()
      searchInputRef.value?.select()
    }, 0)
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

  // 确定搜索范围
  let searchFrom = 0
  let searchTo = props.editorView.state.doc.length
  if (findInSelection.value && selectionRange.value) {
    searchFrom = selectionRange.value.from
    searchTo = selectionRange.value.to
  }

  const content = props.editorView.state.sliceDoc(searchFrom, searchTo)
  const searchTerm = searchWord.value
  const _matchPositions: Array<Array<{ line: number, ch: number }>> = []

  if (searchTerm) {
    if (isRegex.value) {
      try {
        const flags = `gm${isCaseSensitive.value ? `` : `i`}`
        const regex = new RegExp(searchTerm, flags)
        let match
        // eslint-disable-next-line no-cond-assign
        while ((match = regex.exec(content)) !== null) {
          if (match[0].length === 0) {
            regex.lastIndex++
            continue
          }
          const startPos = match.index + searchFrom
          const endPos = match.index + match[0].length + searchFrom

          const startLineObj = props.editorView.state.doc.lineAt(startPos)
          const endLineObj = props.editorView.state.doc.lineAt(endPos)

          _matchPositions.push([
            { line: startLineObj.number - 1, ch: startPos - startLineObj.from },
            { line: endLineObj.number - 1, ch: endPos - endLineObj.from },
          ])
        }
      }
      catch (e) {
        console.warn(`Invalid Regex`, e)
      }
    }
    else {
      const lines = content.split(`\n`)
      const searchTermForCompare = isCaseSensitive.value ? searchTerm : searchTerm.toLowerCase()

      lines.forEach((line, lineIndex) => {
        const lineForCompare = isCaseSensitive.value ? line : line.toLowerCase()
        let startIndex = 0
        let index = lineForCompare.indexOf(searchTermForCompare, startIndex)

        while (index !== -1) {
          const actualLineObj = props.editorView.state.doc.lineAt(searchFrom)
          const actualLineNumber = actualLineObj.number - 1 + lineIndex

          _matchPositions.push([
            { line: actualLineNumber, ch: index },
            { line: actualLineNumber, ch: index + searchTerm.length },
          ])
          startIndex = index + 1
          index = lineForCompare.indexOf(searchTermForCompare, startIndex)
        }
      })
    }
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

function toggleRegex() {
  isRegex.value = !isRegex.value
}

function toggleCaseSensitive() {
  isCaseSensitive.value = !isCaseSensitive.value
}

function toggleFindInSelection() {
  if (!findInSelection.value) {
    // 启用时，保存当前选区
    const selection = props.editorView.state.selection.main
    if (!selection.empty) {
      selectionRange.value = { from: selection.from, to: selection.to }
    }
    else {
      // 如果没有选区，使用整个文档
      selectionRange.value = { from: 0, to: props.editorView.state.doc.length }
    }
  }
  else {
    // 禁用时，清除选区
    selectionRange.value = null
  }
  findInSelection.value = !findInSelection.value
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

  let insertText = replaceWord.value
  if (isRegex.value) {
    try {
      const matchedText = props.editorView.state.sliceDoc(fromPos, toPos)
      insertText = matchedText.replace(new RegExp(searchWord.value, `gm`), replaceWord.value)
    }
    catch (e) {
      console.warn(`Invalid Regex Replacement`, e)
    }
  }

  props.editorView.dispatch({
    changes: { from: fromPos, to: toPos, insert: insertText },
    selection: { anchor: fromPos + insertText.length },
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

    let insertText = replaceWord.value
    if (isRegex.value) {
      try {
        const matchedText = props.editorView.state.sliceDoc(fromPos, toPos)
        insertText = matchedText.replace(new RegExp(searchWord.value, `gm`), replaceWord.value)
      }
      catch (e) {
        console.warn(`Invalid Regex Replacement`, e)
      }
    }

    return { from: fromPos, to: toPos, insert: insertText }
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
    setTimeout(() => {
      searchInputRef.value?.focus()
      searchInputRef.value?.select()
    }, 0)
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
    setTimeout(() => {
      searchInputRef.value?.focus()
      searchInputRef.value?.select()
    }, 0)
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
          <Button
            variant="ghost"
            size="xs"
            title="区分大小写"
            aria-label="区分大小写"
            class="h-6 w-6 p-0"
            :class="{ 'bg-accent': isCaseSensitive }"
            @click="toggleCaseSensitive"
          >
            <CaseSensitive class="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            title="正则表达式"
            aria-label="正则表达式"
            class="h-6 w-6 p-0"
            :class="{ 'bg-accent': isRegex }"
            @click="toggleRegex"
          >
            <Regex class="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            title="在选区内查找"
            aria-label="在选区内查找"
            class="h-6 w-6 p-0"
            :class="{ 'bg-accent': findInSelection }"
            @click="toggleFindInSelection"
          >
            <WholeWord class="h-3 w-3" />
          </Button>
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
