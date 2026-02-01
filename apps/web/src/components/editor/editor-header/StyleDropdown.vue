<script setup lang="ts">
import type {
  themeMap,
} from '@md/shared/configs'
import type { Format } from 'vue-pick-colors'
import {
  codeBlockThemeOptions,
  colorOptions,
  fontFamilyOptions,
  fontSizeOptions,
  legendOptions,
  themeOptions,
} from '@md/shared/configs'
import { ALargeSmall, Code, Droplet, FileCode, ImageIcon, Palette, Pipette, RotateCcw, SquareCode, Type } from 'lucide-vue-next'
import PickColors from 'vue-pick-colors'
import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const { asSub } = toRefs(props)

const themeStore = useThemeStore()
const uiStore = useUIStore()
const editorStore = useEditorStore()
const renderStore = useRenderStore()

const { toggleShowCssEditor } = uiStore

const {
  theme,
  fontFamily,
  fontSize,
  primaryColor,
  codeBlockTheme,
  legend,
} = storeToRefs(themeStore)

const { isDark } = storeToRefs(uiStore)

// Editor refresh function - triggers re-render with current theme settings
function editorRefresh() {
  themeStore.updateCodeTheme()

  const raw = editorStore.getContent()
  renderStore.render(raw)
}

// Theme change handlers
function themeChanged(newTheme: keyof typeof themeMap) {
  themeStore.theme = newTheme
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  editorRefresh()
}

function fontChanged(fonts: string) {
  themeStore.fontFamily = fonts
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  editorRefresh()
}

function sizeChanged(size: string) {
  themeStore.fontSize = size
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  editorRefresh()
}

function colorChanged(newColor: string) {
  themeStore.primaryColor = newColor
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  editorRefresh()
}

function codeBlockThemeChanged(newTheme: string) {
  themeStore.codeBlockTheme = newTheme
  editorRefresh()
}

function legendChanged(newVal: string) {
  themeStore.legend = newVal
  editorRefresh()
}

function macCodeBlockChanged() {
  themeStore.isMacCodeBlock = !themeStore.isMacCodeBlock
  editorRefresh()
}

function resetStyleConfirm() {
  uiStore.isOpenConfirmDialog = true
}

const colorPicker = ref<HTMLElement & { show: () => void } | null>(null)

function showPicker() {
  colorPicker.value?.show()
}

// 自定义CSS样式
function customStyle() {
  toggleShowCssEditor()
}

const pickColorsContainer = useTemplateRef(`pickColorsContainer`)
const format = ref<Format>(`rgb`)
const formatOptions = ref<Format[]>([`rgb`, `hex`, `hsl`, `hsv`])
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      样式
    </MenubarSubTrigger>
    <MenubarSubContent class="w-56">
      <StyleOptionMenu
        title="主题"
        :options="themeOptions"
        :current="theme"
        :change="themeChanged"
        :icon="Palette"
      />
      <MenubarSeparator />
      <StyleOptionMenu
        title="字体"
        :options="fontFamilyOptions"
        :current="fontFamily"
        :change="fontChanged"
        :icon="Type"
      />
      <StyleOptionMenu
        title="字号"
        :options="fontSizeOptions"
        :current="fontSize"
        :change="sizeChanged"
        :icon="ALargeSmall"
      />
      <StyleOptionMenu
        title="主题色"
        :options="colorOptions"
        :current="primaryColor"
        :change="colorChanged"
        :icon="Droplet"
      />
      <StyleOptionMenu
        title="代码块主题"
        :options="codeBlockThemeOptions"
        :current="codeBlockTheme"
        :change="codeBlockThemeChanged"
        :icon="Code"
      />
      <StyleOptionMenu
        title="图注格式"
        :options="legendOptions"
        :current="legend"
        :change="legendChanged"
        :icon="ImageIcon"
      />
      <MenubarSeparator />
      <MenubarCheckboxItem class="pl-2" @click.self.prevent="showPicker">
        <HoverCard :open-delay="100">
          <HoverCardTrigger class="w-full flex">
            <Pipette class="mr-2 h-4 w-4" />
            自定义主题色
          </HoverCardTrigger>
          <HoverCardContent side="right" class="w-min">
            <div ref="pickColorsContainer">
              <PickColors
                v-model:value="primaryColor"
                show-alpha
                :format="format" :format-options="formatOptions"
                :theme="isDark ? 'dark' : 'light'"
                :popup-container="pickColorsContainer!"
                @change="colorChanged"
              />
            </div>
          </HoverCardContent>
        </HoverCard>
      </MenubarCheckboxItem>
      <MenubarCheckboxItem class="pl-2" @click="customStyle">
        <FileCode class="mr-2 h-4 w-4" />
        自定义 CSS
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem class="pl-2" @click="macCodeBlockChanged">
        <SquareCode class="mr-2 h-4 w-4" />
        Mac 代码块
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem class="pl-2" divided @click="resetStyleConfirm">
        <RotateCcw class="mr-2 h-4 w-4" />
        重置
      </MenubarCheckboxItem>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>
      样式
    </MenubarTrigger>
    <MenubarContent class="w-56" align="start">
      <StyleOptionMenu
        title="主题"
        :options="themeOptions"
        :current="theme"
        :change="themeChanged"
        :icon="Palette"
      />
      <MenubarSeparator />
      <StyleOptionMenu
        title="字体"
        :options="fontFamilyOptions"
        :current="fontFamily"
        :change="fontChanged"
        :icon="Type"
      />
      <StyleOptionMenu
        title="字号"
        :options="fontSizeOptions"
        :current="fontSize"
        :change="sizeChanged"
        :icon="ALargeSmall"
      />
      <StyleOptionMenu
        title="主题色"
        :options="colorOptions"
        :current="primaryColor"
        :change="colorChanged"
        :icon="Droplet"
      />
      <StyleOptionMenu
        title="代码块主题"
        :options="codeBlockThemeOptions"
        :current="codeBlockTheme"
        :change="codeBlockThemeChanged"
        :icon="Code"
      />
      <StyleOptionMenu
        title="图注格式"
        :options="legendOptions"
        :current="legend"
        :change="legendChanged"
        :icon="ImageIcon"
      />
      <MenubarSeparator />
      <MenubarCheckboxItem class="pl-2" @click.self.prevent="showPicker">
        <HoverCard :open-delay="100">
          <HoverCardTrigger class="w-full flex">
            <Pipette class="mr-2 h-4 w-4" />
            自定义主题色
          </HoverCardTrigger>
          <HoverCardContent side="right" class="w-min">
            <div ref="pickColorsContainer">
              <PickColors
                v-model:value="primaryColor"
                show-alpha
                :format="format" :format-options="formatOptions"
                :theme="isDark ? 'dark' : 'light'"
                :popup-container="pickColorsContainer!"
                @change="colorChanged"
              />
            </div>
          </HoverCardContent>
        </HoverCard>
      </MenubarCheckboxItem>
      <MenubarCheckboxItem class="pl-2" @click="customStyle">
        <FileCode class="mr-2 h-4 w-4" />
        自定义 CSS
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem class="pl-2" @click="macCodeBlockChanged">
        <SquareCode class="mr-2 h-4 w-4" />
        Mac 代码块
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem class="pl-2" divided @click="resetStyleConfirm">
        <RotateCcw class="mr-2 h-4 w-4" />
        重置
      </MenubarCheckboxItem>
    </MenubarContent>
  </MenubarMenu>
</template>
