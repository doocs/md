<script setup>
import { nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'

import StyleOptionMenu from './StyleOptionMenu.vue'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

import { codeBlockThemeOptions, colorOptions, fontFamilyOptions, fontSizeOptions, githubConfig, legendOptions } from '@/config'
import { useStore } from '@/stores'

const store = useStore()

const {
  fontFamily,
  fontSize,
  fontColor,
  codeBlockTheme,
  legend,
  isMacCodeBlock,
  cssEditor,
} = storeToRefs(store)

const {
  resetStyleConfirm,
  fontChanged,
  sizeChanged,
  colorChanged,
  codeBlockThemeChanged,
  legendChanged,
  macCodeBlockChanged,
  toggleShowCssEditor,
} = store

const colorPicker = ref(null)

function showPicker() {
  colorPicker.value.show()
}

// 自定义CSS样式
function customStyle() {
  toggleShowCssEditor()
  nextTick(() => {
    if (!cssEditor.value) {
      cssEditor.value.refresh()
    }
  })
  setTimeout(() => {
    cssEditor.value.refresh()
  }, 50)
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      样式
      <el-icon class="ml-2">
        <ElIconArrowDown />
      </el-icon>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56">
      <StyleOptionMenu title="字体" :options="fontFamilyOptions" :current="fontFamily" :change="fontChanged" />
      <StyleOptionMenu title="字号" :options="fontSizeOptions" :current="fontSize" :change="sizeChanged" />
      <StyleOptionMenu
        title="主题色"
        :options="colorOptions"
        :current="fontColor"
        :change="colorChanged"
      />
      <StyleOptionMenu
        title="代码块主题"
        :options="codeBlockThemeOptions"
        :current="codeBlockTheme"
        :change="codeBlockThemeChanged"
      />
      <StyleOptionMenu title="图注格式" :options="legendOptions" :current="legend" :change="legendChanged" />
      <DropdownMenuSeparator />
      <DropdownMenuItem @click.self.prevent="showPicker">
        <HoverCard :open-delay="100">
          <HoverCardTrigger class="w-full flex">
            <el-icon class="mr-2 h-4 w-4" />
            自定义主题色
          </HoverCardTrigger>
          <HoverCardContent side="right" class="w-min">
            <el-color-picker
              ref="colorPicker"
              v-model="fontColor"
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
          v-model="fontColor"
          :teleported="false"
          show-alpha
          class="ml-auto"
          style="height: 2em"
          @change="colorChanged"
          @click="showPicker"
        /> -->
      </DropdownMenuItem>
      <DropdownMenuItem @click="customStyle">
        <el-icon class="mr-2 h-4 w-4" />
        自定义 CSS
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="macCodeBlockChanged">
        <el-icon class="mr-2 h-4 w-4" :class="{ 'opacity-0': !isMacCodeBlock }">
          <ElIconCheck />
        </el-icon>
        Mac 代码块
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem divided class="leading-8" @click="resetStyleConfirm">
        <el-icon class="mr-2 h-4 w-4" />
        重置
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
