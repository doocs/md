<script setup lang="ts">
import type CodeMirror from 'codemirror'
import { ChevronDown, ChevronRight, ChevronUp, Replace, ReplaceAll, X } from 'lucide-vue-next'

const props = defineProps<{
  editor: CodeMirror.Editor
}>()

const showSearchTab = ref(false)

const searchWord = ref(``)
const indexOfMatch = ref(0)
const numberOfMatches = ref(0)
const showReplace = ref(false)
const replaceWord = ref(``)

const matchPositions = ref<CodeMirror.Position[][]>([])
const currentMatchPosition = computed(() => {
  if (numberOfMatches.value === 0)
    return null
  return matchPositions.value[indexOfMatch.value]
})

watch(searchWord, () => {
  indexOfMatch.value = 0
  numberOfMatches.value = 0
  matchPositions.value = []
  findAllMatches()
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
  }
})

function clearAllMarks() {
  const editor = props.editor
  editor.getAllMarks().forEach(mark => mark.clear())
}

function markMatch() {
  const editor = props.editor
  if (!editor)
    return
  clearAllMarks()
  matchPositions.value.forEach((pos, i) => {
    editor.markText(pos[0], pos[1], { className: i === indexOfMatch.value
      ? `current-match`
      : `search-match` })
  })
  if (matchPositions.value[indexOfMatch.value]?.[0])
    editor.scrollIntoView(matchPositions.value[indexOfMatch.value][0])
}

function findAllMatches() {
  const editor = props.editor
  if (!editor)
    return
  if (!searchWord.value || !showSearchTab.value)
    return

  // 获取所有匹配项
  const cursor = editor.getSearchCursor(searchWord.value, undefined, true)
  let matchCount = 0
  const _matchPositions: CodeMirror.Position[][] = []
  while (cursor.findNext()) {
    _matchPositions.push([cursor.from(), cursor.to()])
    matchCount++
  }
  matchPositions.value = _matchPositions
  numberOfMatches.value = matchCount
  if (matchCount === indexOfMatch.value) {
    indexOfMatch.value -= 1
  }
}

function nextMatch() {
  if (numberOfMatches.value === 0)
    return
  indexOfMatch.value = (indexOfMatch.value + 1) % numberOfMatches.value
}
function prevMatch() {
  if (numberOfMatches.value === 0)
    return
  indexOfMatch.value = (indexOfMatch.value - 1 + numberOfMatches.value) % numberOfMatches.value
}

function toggleShowReplace() {
  showReplace.value = !showReplace.value
}

function closeSearchTab() {
  showSearchTab.value = false
}

function handleInputKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case `ArrowUp`:
      prevMatch()
      e.preventDefault()
      break
    case `ArrowDown`:
    case `Enter`:
      if (numberOfMatches.value === 0)
        return
      nextMatch()
      e.preventDefault()
  }
}

function handleReplace() {
  if (numberOfMatches.value === 0)
    return
  const editor = props.editor
  if (!editor)
    return
  if (!currentMatchPosition.value)
    return
  editor.setSelection(currentMatchPosition.value[0], currentMatchPosition.value[1])
  props.editor.replaceSelection(replaceWord.value)
  findAllMatches()
}

function handleReplaceAll() {
  if (numberOfMatches.value === 0)
    return
  const editor = props.editor
  if (!editor)
    return
  if (!currentMatchPosition.value)
    return
  matchPositions.value.forEach((pos) => {
    editor.setSelection(pos[0], pos[1])
    editor.replaceSelection(replaceWord.value)
  })
  findAllMatches()
}

function handleEditorChange() {
  // 使用异步的方式来避免输入卡顿
  setTimeout(findAllMatches, 0)
}

onMounted(() => {
  const editor = props.editor
  editor.on(`changes`, handleEditorChange)
})
onUnmounted(() => {
  props.editor.off(`change`, handleEditorChange)
})

defineExpose({
  showSearchTab,
  handleEditorChange,
})
</script>

<!-- TODO 增加hover的说明 -->
<template>
  <div v-if="showSearchTab" class="search-tab-container bg-background">
    <div class="flex items-center justify-between gap-2 p-2" :class="showReplace ? 'h-28' : 'h-16'">
      <Button variant="ghost" class="h-[100%] w-6 flex items-center justify-center p-0" @click="toggleShowReplace">
        <component :is="showReplace ? ChevronDown : ChevronRight" class="h-4 w-4" />
      </Button>
      <div class="direction-normal flex flex-col gap-0">
        <div class="h-12 flex items-center justify-start gap-1">
          <span class="w-8 leading-10">查找</span>
          <Input v-model="searchWord" class="w-40" @keydown="handleInputKeyDown" />
          <span class="w-12 text-center">
            {{ numberOfMatches ? indexOfMatch + 1 : 0 }}/{{ numberOfMatches }}
          </span>
          <Button variant="ghost" size="xs" @click="prevMatch">
            <ChevronUp class="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="xs" @click="nextMatch">
            <ChevronDown class="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="xs" @click="closeSearchTab">
            <X class="h-4 w-4" />
          </Button>
        </div>
        <div v-if="showReplace" class="h-12 flex items-center justify-start gap-1">
          <span class="w-8 leading-10">替换</span>
          <Input v-model="replaceWord" class="w-40" />
          <Button variant="ghost" size="xs" @click="handleReplace">
            <Replace class="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="xs" @click="handleReplaceAll">
            <ReplaceAll class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang='less'>
.search-tab-container {
  touch-action: none;
  width: 406px;
  min-height: calc(24px);

  position: absolute;
  top: 60px;
  right: 0;

  border-radius: calc(var(--radius) - 2px);
  border-width: 1px;
}
</style>
