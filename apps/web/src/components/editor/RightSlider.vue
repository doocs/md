<script setup lang="ts">
import type {
  HeadingLevel,
  HeadingStyleType,
  themeMap,
} from '@md/shared/configs'
import type { Format } from 'vue-pick-colors'
import { X } from '@lucide/vue'
import {
  codeBlockThemeOptions,
  colorOptions,
  fontFamilyOptions,
  fontSizeOptions,
  headingLevelOptions,
  headingStyleOptions,
  legendOptions,
  themeOptions,
} from '@md/shared/configs'
import PickColors from 'vue-pick-colors'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useEditorRefresh } from '@/composables/useEditorRefresh'
import { useCollabStore } from '@/stores/collab'
import { useConfirmStore } from '@/stores/confirm'
import { useCssEditorStore } from '@/stores/cssEditor'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const confirmStore = useConfirmStore()
const collabStore = useCollabStore()
const { isReadOnly: isCollabReadOnly } = storeToRefs(collabStore)
const cssEditorStore = useCssEditorStore()
const uiStore = useUIStore()
const themeStore = useThemeStore()
const {
  theme,
  fontFamily,
  fontSize,
  primaryColor,
  codeBlockTheme,
  legend,
  isMacCodeBlock,
  isShowLineNumber,
  isCiteStatus,
  isUseIndent,
  isUseJustify,
} = storeToRefs(themeStore)

const { scheduleEditorRefresh, editorRefresh } = useEditorRefresh()

// 标题样式选择器状态
const selectedHeadingLevel = ref<HeadingLevel>(`h2`)
const selectedHeadingStyle = computed({
  get: () => themeStore.getHeadingStyle(selectedHeadingLevel.value),
  set: (val: HeadingStyleType) => {
    themeStore.setHeadingStyle(selectedHeadingLevel.value, val)
    if (val === `custom`) {
      // 打开 CSS 编辑器并滚动到对应标题区域
      uiStore.isShowCssEditor = true
      // 等待 CSS 编辑器打开后再滚动
      nextTick(() => {
        setTimeout(() => {
          cssEditorStore.scrollToHeading(selectedHeadingLevel.value)
        }, 100)
      })
    }
    // 无论选择预设还是自定义，都立即应用主题，确保标题样式及时恢复/更新
    themeStore.applyCurrentTheme()
    scheduleEditorRefresh()
  },
})

const { isMobile, isOpenRightSlider, isDark } = storeToRefs(uiStore)

// Theme change handlers
function themeChanged(newTheme: keyof typeof themeMap) {
  themeStore.theme = newTheme
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  scheduleEditorRefresh()
}

function fontChanged(fonts: string) {
  themeStore.fontFamily = fonts
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  scheduleEditorRefresh()
}

function sizeChanged(size: string) {
  themeStore.fontSize = size
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  scheduleEditorRefresh()
}

function colorChanged(newColor: string) {
  themeStore.primaryColor = newColor
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  scheduleEditorRefresh()
}

function codeBlockThemeChanged(newTheme: unknown) {
  if (typeof newTheme !== 'string')
    return
  themeStore.codeBlockTheme = newTheme
  scheduleEditorRefresh()
}

function legendChanged(newVal: string) {
  themeStore.legend = newVal
  scheduleEditorRefresh()
}

function macCodeBlockChanged() {
  themeStore.isMacCodeBlock = !themeStore.isMacCodeBlock
  scheduleEditorRefresh()
}

function showLineNumberChanged() {
  themeStore.isShowLineNumber = !themeStore.isShowLineNumber
  scheduleEditorRefresh()
}

function citeStatusChanged() {
  themeStore.isCiteStatus = !themeStore.isCiteStatus
  scheduleEditorRefresh()
}

function useIndentChanged() {
  themeStore.isUseIndent = !themeStore.isUseIndent
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  scheduleEditorRefresh()
}

function useJustifyChanged() {
  themeStore.isUseJustify = !themeStore.isUseJustify
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  scheduleEditorRefresh()
}

function setMacCodeBlock(checked: boolean) {
  if (checked !== isMacCodeBlock.value)
    macCodeBlockChanged()
}

function setShowLineNumber(checked: boolean) {
  if (checked !== isShowLineNumber.value)
    showLineNumberChanged()
}

function setCiteStatus(checked: boolean) {
  if (checked !== isCiteStatus.value)
    citeStatusChanged()
}

function setUseIndent(checked: boolean) {
  if (checked !== isUseIndent.value)
    useIndentChanged()
}

function setUseJustify(checked: boolean) {
  if (checked !== isUseJustify.value)
    useJustifyChanged()
}

function resetStyleConfirm() {
  confirmStore.confirm({
    title: '提示',
    description: '此操作将丢失本地自定义样式，是否继续？',
    onConfirm: () => {
      themeStore.resetStyle()
      cssEditorStore.resetCssConfig()
      themeStore.applyCurrentTheme()
      editorRefresh()
      toast.success(`样式已重置`)
    },
  })
}

// 控制是否启用动画
const enableAnimation = ref(false)

// 监听 RightSlider 开关状态变化
watch(isOpenRightSlider, () => {
  if (isMobile.value) {
    // 在移动端，用户操作时启用动画
    enableAnimation.value = true
  }
})

// 监听设备类型变化，重置动画状态
watch(isMobile, () => {
  enableAnimation.value = false
})

const pickColorsContainer = useTemplateRef<HTMLElement | undefined>(`pickColorsContainer`)
const format = ref<Format>(`rgb`)
const formatOptions = ref<Format[]>([`rgb`, `hex`, `hsl`, `hsv`])
</script>

<template>
  <!-- 移动端遮罩层 -->
  <div
    v-if="isMobile && isOpenRightSlider"
    class="fixed inset-0 bg-black/50 z-40"
    @click="isOpenRightSlider = false"
  />

  <div
    class="h-full overflow-hidden"
    :class="{
      'fixed top-0 right-0 w-full h-full z-55 bg-background border-l shadow-lg mobile-right-drawer': isMobile,
      'animate': isMobile && enableAnimation,
    }"
    :style="isMobile ? { transform: isOpenRightSlider ? 'translateX(0)' : 'translateX(100%)' } : undefined"
  >
    <div
      class="h-full space-y-4 overflow-auto p-4"
      :class="{ 'pt-0': isMobile, 'pointer-events-none opacity-60': isCollabReadOnly }"
    >
      <!-- 移动端标题栏 -->
      <div v-if="isMobile" class="sticky top-0 z-10 -mx-4 mb-4 border-b bg-background px-4 pb-3 pt-[max(0.5rem,env(safe-area-inset-top,0px))]">
        <div aria-hidden="true" class="mx-auto mb-2 h-1 w-10 rounded-full bg-muted-foreground/25" />
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">
            样式设置
          </h2>
          <Button variant="ghost" size="sm" @click="isOpenRightSlider = false">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div class="space-y-2">
        <h2 class="text-sm font-medium">
          主题
        </h2>
        <div class="grid grid-cols-3 justify-items-center gap-2">
          <Button
            v-for="{ label, value } in themeOptions" :key="value" class="w-full" variant="outline" :class="{
              'border-primary ring-1 ring-primary/20 border-2': theme === value,
            }" @click="themeChanged(value)"
          >
            {{ label }}
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2 class="text-sm font-medium">
          字体
        </h2>
        <div class="grid grid-cols-3 justify-items-center gap-2">
          <Button
            v-for="{ label, value } in fontFamilyOptions" :key="value" variant="outline" class="w-full"
            :class="{ 'border-primary ring-1 ring-primary/20 border-2': fontFamily === value }" @click="fontChanged(value)"
          >
            {{ label }}
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2 class="text-sm font-medium">
          字号
        </h2>
        <div class="grid grid-cols-5 justify-items-center gap-2">
          <Button
            v-for="{ value, desc } in fontSizeOptions" :key="value" variant="outline" class="w-full" :class="{
              'border-primary ring-1 ring-primary/20 border-2': fontSize === value,
            }" @click="sizeChanged(value)"
          >
            {{ desc }}
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2 class="text-sm font-medium">
          主题色
        </h2>
        <div class="grid grid-cols-3 justify-items-center gap-2">
          <Button
            v-for="{ label, value } in colorOptions" :key="value" class="w-full" variant="outline" :class="{
              'border-primary ring-1 ring-primary/20 border-2': primaryColor === value,
            }" @click="colorChanged(value)"
          >
            <span
              class="mr-2 inline-block h-4 w-4 rounded-full" :style="{
                background: value,
              }"
            />
            {{ label }}
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2 class="text-sm font-medium">
          自定义主题色
        </h2>
        <div ref="pickColorsContainer">
          <PickColors
            v-if="pickColorsContainer" v-model:value="primaryColor" show-alpha :format="format"
            :format-options="formatOptions" :theme="isDark ? 'dark' : 'light'"
            :popup-container="pickColorsContainer" @change="colorChanged"
          />
        </div>
      </div>
      <div class="space-y-2">
        <h2 class="text-sm font-medium">
          标题样式
        </h2>
        <div class="flex gap-2">
          <Select v-model="selectedHeadingLevel">
            <SelectTrigger class="w-[120px]">
              <SelectValue placeholder="选择标题" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="{ label, value } in headingLevelOptions" :key="value" :value="value">
                {{ label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="selectedHeadingStyle">
            <SelectTrigger class="flex-1">
              <SelectValue placeholder="选择样式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="{ label, value } in headingStyleOptions" :key="value" :value="value">
                {{ label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div class="space-y-2">
        <h2 class="text-sm font-medium">
          代码块主题
        </h2>
        <Select v-model="codeBlockTheme" @update:model-value="codeBlockThemeChanged">
          <SelectTrigger>
            <SelectValue placeholder="Select a code block theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="{ label, value } in codeBlockThemeOptions" :key="label" :value="value">
              {{ label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="space-y-2">
        <h2 class="text-sm font-medium">
          图注格式
        </h2>
        <div class="grid grid-cols-3 justify-items-center gap-2">
          <Button
            v-for="{ label, value } in legendOptions" :key="value" class="w-full" variant="outline" :class="{
              'border-primary ring-1 ring-primary/20 border-2': legend === value,
            }" @click="legendChanged(value)"
          >
            {{ label }}
          </Button>
        </div>
      </div>
      <div class="flex items-center justify-between gap-3">
        <Label for="mac-code-block" class="text-sm">Mac 代码块</Label>
        <Switch id="mac-code-block" :model-value="isMacCodeBlock" @update:model-value="setMacCodeBlock" />
      </div>
      <div class="flex items-center justify-between gap-3">
        <Label for="show-line-number" class="text-sm">代码块行号</Label>
        <Switch id="show-line-number" :model-value="isShowLineNumber" @update:model-value="setShowLineNumber" />
      </div>
      <div class="flex items-center justify-between gap-3">
        <Label for="cite-status" class="text-sm">微信外链转底部引用</Label>
        <Switch id="cite-status" :model-value="isCiteStatus" @update:model-value="setCiteStatus" />
      </div>
      <div class="flex items-center justify-between gap-3">
        <Label for="use-indent" class="text-sm">段落首行缩进</Label>
        <Switch id="use-indent" :model-value="isUseIndent" @update:model-value="setUseIndent" />
      </div>
      <div class="flex items-center justify-between gap-3">
        <Label for="use-justify" class="text-sm">段落两端对齐</Label>
        <Switch id="use-justify" :model-value="isUseJustify" @update:model-value="setUseJustify" />
      </div>
      <div class="space-y-2">
        <h2 class="text-sm font-medium">
          样式配置
        </h2>
        <Button variant="destructive" @click="resetStyleConfirm">
          重置
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 移动端右侧栏动画 - 只有添加了 animate 类才启用 */
.mobile-right-drawer.animate {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
