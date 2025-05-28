<script setup lang="ts">
import type CodeMirror from 'codemirror'
import { ChevronDown, ChevronRight, ChevronUp, Replace, ReplaceAll, X } from 'lucide-vue-next'

const props = defineProps<{
  editor: CodeMirror.Editor
}>()

const showSearchTab = ref(false)

const searchWord = ref(``)
const indexOfMatch = ref(0)
const showReplace = ref(false)
const replaceWord = ref(``)

const matchPositions = ref<CodeMirror.Position[][]>([])
const numberOfMatches = computed(() => {
  return matchPositions.value.length
})

const currentMatchPosition = computed(() => {
  if (numberOfMatches.value === 0)
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

function handleSearchInputKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case `Enter`:
      if (numberOfMatches.value === 0)
        return
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
  const debouncedSearch = useDebounceFn(findAllMatches, 300)
  debouncedSearch()
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

<template>
  <div v-if="showSearchTab" class="bg-background fixed right-0 top-15 z-50 w-[406px] flex items-center justify-between gap-2 border rounded-t-lg p-2 shadow-lg" :class="showReplace ? 'h-28' : 'h-16'">
    <Button variant="ghost" title="切换替换" aria-label="切换替换" class="h-[100%] w-6 flex items-center justify-center p-0" @click="toggleShowReplace">
      <component :is="showReplace ? ChevronDown : ChevronRight" class="h-4 w-4" />
    </Button>
    <div class="direction-normal flex flex-col gap-0">
      <div class="h-12 flex items-center justify-start gap-1">
        <span class="w-8 leading-10">查找</span>
        <Input v-model="searchWord" class="w-40" @keydown="handleSearchInputKeyDown" />
        <span class="w-12 text-center">
          {{ numberOfMatches ? indexOfMatch + 1 : 0 }}/{{ numberOfMatches }}
        </span>
        <Button variant="ghost" size="xs" title="上一处" aria-label="上一处" class="h-8 w-8 p-0" @click="prevMatch">
          <ChevronUp class="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="xs" title="下一处" aria-label="下一处" class="h-8 w-8 p-0" @click="nextMatch">
          <ChevronDown class="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="xs" title="关闭" aria-label="关闭" class="h-8 w-8 p-0" @click="closeSearchTab">
          <X class="h-4 w-4" />
        </Button>
      </div>
      <div v-if="showReplace" class="h-12 flex items-center justify-start gap-1">
        <span class="w-8 leading-10">替换</span>
        <Input v-model="replaceWord" class="w-40" @keydown="handleReplaceInputKeyDown" />
        <Button variant="ghost" size="xs" title="替换" aria-label="替换" class="h-8 w-8 p-0" @click="handleReplace">
          <Replace class="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="xs" title="全部替换" aria-label="全部替换" class="h-8 w-8 p-0" @click="handleReplaceAll">
          <ReplaceAll class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped lang='less'>
</style>
