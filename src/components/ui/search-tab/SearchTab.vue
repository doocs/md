<script setup lang="ts">
import type CodeMirror from 'codemirror'
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-vue-next'

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
</script>

<template>
  <div class="bg-background search-tab-container">
    <div class="flex items-center justify-between gap-2 p-2" :class="showReplace ? 'h-32' : 'h-16'">
      <Button variant="ghost" class="h-[100%] w-6 flex items-center justify-center p-0" @click="toggleShowReplace">
        <component :is="showReplace ? ChevronDown : ChevronRight" class="h-4 w-4" />
      </Button>
      <div class="direction-normal flex flex-col gap-2 p-2">
        <div class="flex flex-row items-center gap-1">
          <span class="leading-10">查找</span>
          <Input v-model="searchWord" class="flex-1" />
          {{ numberOfMatches ? indexOfMatch + 1 : 0 }}/{{ numberOfMatches }}
          <Button variant="ghost" size="xs" @click="prevMatch">
            <ChevronUp class="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="xs" @click="nextMatch">
            <ChevronDown class="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="xs" @click="closeSearchTab">
            <ChevronDown class="h-4 w-4" />
          </Button>
        </div>
        <div v-if="showReplace" class="flex flex-row gap-1">
          <span class="leading-10">替换</span>
          <Input v-model="replaceWord" class="flex-1" />
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
