<script setup lang="ts">
import type {
  themeMap,
} from '@md/shared/configs'
import type { Format } from 'vue-pick-colors'
import { ALargeSmall, Code, Droplet, FileCode, ImageIcon, Palette, Pipette, RotateCcw, SquareCode, Type } from '@lucide/vue'
import {
  codeBlockThemeOptions,
} from '@md/shared/configs'
import PickColors from 'vue-pick-colors'
import { useEditorRefresh } from '@/composables/useEditorRefresh'
import { useLocalizedStyleOptions } from '@/composables/useLocalizedStyleOptions'
import { useConfirmStore } from '@/stores/confirm'
import { useCssEditorStore } from '@/stores/cssEditor'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const { asSub } = toRefs(props)
const { t } = useI18n()
const localizedStyleOptions = useLocalizedStyleOptions()

const confirmStore = useConfirmStore()
const cssEditorStore = useCssEditorStore()
const themeStore = useThemeStore()
const uiStore = useUIStore()
const { editorRefresh } = useEditorRefresh()

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
  confirmStore.confirm({
    title: t(`confirm.tip`),
    description: t(`confirm.resetStyleDescription`),
    onConfirm: () => {
      themeStore.resetStyle()
      cssEditorStore.resetCssConfig()
      themeStore.applyCurrentTheme()
      editorRefresh()
      toast.success(t(`toast.styleReset`))
    },
  })
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
      {{ t('menu.style') }}
    </MenubarSubTrigger>
    <MenubarSubContent class="min-w-56 max-h-56 overflow-auto">
      <StyleOptionMenu
        :title="t('menu.theme')"
        :options="localizedStyleOptions.themeOptions"
        :current="theme"
        :change="themeChanged"
        :icon="Palette"
      />
      <MenubarSeparator />
      <StyleOptionMenu
        :title="t('menu.font')"
        style-key="font"
        :options="localizedStyleOptions.fontFamilyOptions"
        :current="fontFamily"
        :change="fontChanged"
        :icon="Type"
      />
      <StyleOptionMenu
        :title="t('menu.fontSize')"
        style-key="fontSize"
        :options="localizedStyleOptions.fontSizeOptions"
        :current="fontSize"
        :change="sizeChanged"
        :icon="ALargeSmall"
      />
      <StyleOptionMenu
        :title="t('menu.primaryColor')"
        style-key="color"
        :options="localizedStyleOptions.colorOptions"
        :current="primaryColor"
        :change="colorChanged"
        :icon="Droplet"
      />
      <StyleOptionMenu
        :title="t('menu.codeBlockTheme')"
        :options="codeBlockThemeOptions"
        :current="codeBlockTheme"
        :change="codeBlockThemeChanged"
        :icon="Code"
      />
      <StyleOptionMenu
        :title="t('menu.legendFormat')"
        :options="localizedStyleOptions.legendOptions"
        :current="legend"
        :change="legendChanged"
        :icon="ImageIcon"
      />
      <MenubarSeparator />
      <MenubarCheckboxItem class="pl-2" @click.self.prevent="showPicker">
        <HoverCard :open-delay="100">
          <HoverCardTrigger class="w-full flex">
            <Pipette class="mr-2 h-4 w-4" />
            {{ t('menu.customPrimaryColor') }}
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
        {{ t('menu.customCss') }}
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem class="pl-2" @click="macCodeBlockChanged">
        <SquareCode class="mr-2 h-4 w-4" />
        {{ t('menu.macCodeBlock') }}
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem class="pl-2" divided @click="resetStyleConfirm">
        <RotateCcw class="mr-2 h-4 w-4" />
        {{ t('menu.reset') }}
      </MenubarCheckboxItem>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>
      {{ t('menu.style') }}
    </MenubarTrigger>
    <MenubarContent class="min-w-56" align="start">
      <StyleOptionMenu
        :title="t('menu.theme')"
        :options="localizedStyleOptions.themeOptions"
        :current="theme"
        :change="themeChanged"
        :icon="Palette"
      />
      <MenubarSeparator />
      <StyleOptionMenu
        :title="t('menu.font')"
        style-key="font"
        :options="localizedStyleOptions.fontFamilyOptions"
        :current="fontFamily"
        :change="fontChanged"
        :icon="Type"
      />
      <StyleOptionMenu
        :title="t('menu.fontSize')"
        style-key="fontSize"
        :options="localizedStyleOptions.fontSizeOptions"
        :current="fontSize"
        :change="sizeChanged"
        :icon="ALargeSmall"
      />
      <StyleOptionMenu
        :title="t('menu.primaryColor')"
        style-key="color"
        :options="localizedStyleOptions.colorOptions"
        :current="primaryColor"
        :change="colorChanged"
        :icon="Droplet"
      />
      <StyleOptionMenu
        :title="t('menu.codeBlockTheme')"
        :options="codeBlockThemeOptions"
        :current="codeBlockTheme"
        :change="codeBlockThemeChanged"
        :icon="Code"
      />
      <StyleOptionMenu
        :title="t('menu.legendFormat')"
        :options="localizedStyleOptions.legendOptions"
        :current="legend"
        :change="legendChanged"
        :icon="ImageIcon"
      />
      <MenubarSeparator />
      <MenubarCheckboxItem class="pl-2" @click.self.prevent="showPicker">
        <HoverCard :open-delay="100">
          <HoverCardTrigger class="w-full flex">
            <Pipette class="mr-2 h-4 w-4" />
            {{ t('menu.customPrimaryColor') }}
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
        {{ t('menu.customCss') }}
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem class="pl-2" @click="macCodeBlockChanged">
        <SquareCode class="mr-2 h-4 w-4" />
        {{ t('menu.macCodeBlock') }}
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem class="pl-2" divided @click="resetStyleConfirm">
        <RotateCcw class="mr-2 h-4 w-4" />
        {{ t('menu.reset') }}
      </MenubarCheckboxItem>
    </MenubarContent>
  </MenubarMenu>
</template>
