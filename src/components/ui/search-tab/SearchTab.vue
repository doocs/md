<script setup lang="ts">
import type CodeMirror from 'codemirror'
import { ChevronDown, ChevronRight, ChevronUp, X } from 'lucide-vue-next'

import 'codemirror/addon/search/search.js' // 搜索功能
import 'codemirror/addon/search/searchcursor.js'

const props = defineProps<{
  editor: CodeMirror.EditorFromTextArea
  showSearchTab: boolean
}>()

const searchWord = ref(``)
const indexOfMatch = ref(0)
const numberOfMatches = ref(0)
const showReplace = ref(false)
const replaceWord = ref(``)

watch([searchWord, indexOfMatch], () => {
  const editor = props.editor
  if (!editor || !searchWord.value)
    return

  // 清除之前的高亮
  editor.getAllMarks().forEach(mark => mark.clear())

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
    if (index === indexOfMatch.value)
      editor.scrollIntoView(cursor.from())
    index++
  }
  numberOfMatches.value = index
})

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
  const editor = props.editor
  if (!editor)
    return
  editor.focus()
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
</script>

<!-- TODO 增加hover的说明 -->
<template>
  <div class="search-tab-container bg-background">
    <div class="flex items-center justify-between gap-2 p-2" :class="showReplace ? 'h-30' : 'h-16'">
      <Button variant="ghost" class="h-[100%] w-6 flex items-center justify-center p-0" @click="toggleShowReplace">
        <component :is="showReplace ? ChevronDown : ChevronRight" class="h-4 w-4" />
      </Button>
      <div class="direction-normal flex flex-col gap-2">
        <div class="h-12 flex items-center gap-1">
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
        <div v-if="showReplace" class="h-12 flex items-center gap-1">
          <span class="w-8 leading-10">替换</span>
          <Input v-model="replaceWord" class="w-40" />
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
