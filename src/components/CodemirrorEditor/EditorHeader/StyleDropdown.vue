<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import StyleOptionMenu from './StyleOptionMenu.vue'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  codeBlockThemeOptions,
  colorOptions,
  fontFamilyOptions,
  fontSizeOptions,
  legendOptions,
  themeOptions,
} from '@/config'
import { useDisplayStore, useStore } from '@/stores'

const store = useStore()
const { toggleShowCssEditor } = useDisplayStore()

const {
  theme,
  fontFamily,
  fontSize,
  primaryColor,
  codeBlockTheme,
  legend,
  isMacCodeBlock,
  cssEditor,
} = storeToRefs(store)

const {
  resetStyleConfirm,
  themeChanged,
  fontChanged,
  sizeChanged,
  colorChanged,
  codeBlockThemeChanged,
  legendChanged,
  macCodeBlockChanged,
} = store

const colorPicker = ref<HTMLElement & { show: () => void } | null>(null)

function showPicker() {
  colorPicker.value?.show()
}

// 自定义CSS样式
function customStyle() {
  toggleShowCssEditor()
  setTimeout(() => {
    cssEditor.value!.refresh()
  }, 50)
}
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger> 样式 </MenubarTrigger>
    <MenubarContent class="w-56" align="start">
      <StyleOptionMenu
        title="主题"
        :options="themeOptions"
        :current="theme"
        :change="themeChanged"
      />
      <MenubarSeparator />
      <StyleOptionMenu
        title="字体"
        :options="fontFamilyOptions"
        :current="fontFamily"
        :change="fontChanged"
      />
      <StyleOptionMenu
        title="字号"
        :options="fontSizeOptions"
        :current="fontSize"
        :change="sizeChanged"
      />
      <StyleOptionMenu
        title="主题色"
        :options="colorOptions"
        :current="primaryColor"
        :change="colorChanged"
      />
      <StyleOptionMenu
        title="代码块主题"
        :options="codeBlockThemeOptions"
        :current="codeBlockTheme"
        :change="codeBlockThemeChanged"
      />
      <StyleOptionMenu
        title="图注格式"
        :options="legendOptions"
        :current="legend"
        :change="legendChanged"
      />
      <MenubarSeparator />
      <MenubarItem @click.self.prevent="showPicker">
        <HoverCard :open-delay="100">
          <HoverCardTrigger class="w-full flex">
            <el-icon class="mr-2 h-4 w-4" />
            自定义主题色
          </HoverCardTrigger>
          <HoverCardContent side="right" class="w-min">
            <ElColorPicker
              ref="colorPicker"
              v-model="primaryColor"
              :teleported="false"
              show-alpha
              class="ml-auto"
              style="height: 2em"
              @change="colorChanged"
              @click="showPicker"
            />
          </HoverCardContent>
        </HoverCard>
        <!-- <el-icon class="mr-2 h-4 w-4" />
        自定义主题色
        <el-color-picker
          ref="colorPicker"
          v-model="primaryColor"
          :teleported="false"
          show-alpha
          class="ml-auto"
          style="height: 2em"
          @change="colorChanged"
          @click="showPicker"
        /> -->
      </MenubarItem>
      <MenubarItem @click="customStyle">
        <el-icon class="mr-2 h-4 w-4" />
        自定义 CSS
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="macCodeBlockChanged">
        <el-icon class="mr-2 h-4 w-4" :class="{ 'opacity-0': !isMacCodeBlock }">
          <ElIconCheck />
        </el-icon>
        Mac 代码块
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem divided @click="resetStyleConfirm">
        <el-icon class="mr-2 h-4 w-4" />
        重置
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
