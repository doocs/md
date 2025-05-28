<script setup lang="ts">
import type CodeMirror from 'codemirror'
import { ChevronDown, ChevronRight, ChevronUp, Replace, ReplaceAll, X } from 'lucide-vue-next'

const props = defineProps<{
  editor: CodeMirror.EditorFromTextArea
//   showSearchTab: boolean
}>()

const showSearchTab = ref(false)

const searchWord = ref(``)
const indexOfMatch = ref(0)
const numberOfMatches = ref(0)
const showReplace = ref(false)
const replaceWord = ref(``)
const currentMatchPosition = ref<[CodeMirror.Position, CodeMirror.Position] | null>(null)

watch([searchWord, indexOfMatch], () => {
  findAllMatches()
})

watch(showSearchTab, () => {
  if (!showSearchTab.value) {
    clearAllMarks()
  }
  else {
    findAllMatches()
  }
})

function clearAllMarks() {
  const editor = props.editor
  editor.getAllMarks().forEach(mark => mark.clear())
}

function findAllMatches() {
  const editor = props.editor
  if (!editor)
    return
  if (!searchWord.value || !showSearchTab.value)
    return
  // 清除之前的高亮
  clearAllMarks()

  currentMatchPosition.value = null

  // 获取所有匹配项
  const cursor = editor.getSearchCursor(searchWord.value, undefined, true)
  let index = 0
  while (cursor.findNext()) {
    // 高亮所有匹配项
    editor.markText(
      cursor.from(),
      cursor.to(),
      { className: index === indexOfMatch.value
        ? `current-match`
        : `search-match` },
    )
    if (index === indexOfMatch.value) {
      editor.scrollIntoView(cursor.from())
      currentMatchPosition.value = [cursor.from(), cursor.to()]
    }
    index++
  }
  numberOfMatches.value = index
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
  const cursor = editor.getSearchCursor(searchWord.value, undefined, true)
  while (cursor.findNext()) {
    editor.setSelection(cursor.from(), cursor.to())
    editor.replaceSelection(replaceWord.value)
  }
  findAllMatches()
}

function handleEditorChange() {
  if (searchWord.value) {
    setTimeout(findAllMatches, 0)
  }
}

onMounted(() => {
  const editor = props.editor
  if (!editor)
    return
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
  <div v-if="showSearchTab" class="bg-background search-tab-container">
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
