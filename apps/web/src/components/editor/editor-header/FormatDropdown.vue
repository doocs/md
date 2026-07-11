<script setup lang="ts">
import type { EditorView } from '@codemirror/view'
import type { Format } from 'vue-pick-colors'
import {
  Bold,
  Clock,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Italic,
  Link,
  Link2,
  List,
  ListOrdered,
  Paintbrush,
  Strikethrough,
} from '@lucide/vue'
import { headingLevels as baseHeadingLevels, ctrlKey, ctrlSign } from '@md/shared/configs'
import {
  formatColor,
} from '@md/shared/editor'
import PickColors from 'vue-pick-colors'
import { useEditorFormat } from '@/composables/useEditorFormat'
import { useEditorRefresh } from '@/composables/useEditorRefresh'
import { useEditorStore } from '@/stores/editor'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const { asSub } = toRefs(props)
const { t } = useI18n()

const editorStore = useEditorStore()
const themeStore = useThemeStore()
const uiStore = useUIStore()
const { editorRefresh } = useEditorRefresh()
const { editor } = storeToRefs(editorStore)

const { addFormat } = useEditorFormat(editor)

function citeStatusChanged() {
  themeStore.isCiteStatus = !themeStore.isCiteStatus
  editorRefresh()
}

function countStatusChanged() {
  themeStore.isCountStatus = !themeStore.isCountStatus
  editorRefresh()
}

const pickColorsContainer = useTemplateRef(`pickColorsContainer`)
const colorState = reactive({
  format: `rgb` as Format,
  formatOptions: [`rgb`] as Format[],
  textColor: `rgba(0, 0, 0, 1)`,
})

const headingIcons = [Heading1, Heading2, Heading3, Heading4, Heading5, Heading6]
const headingLevels = computed(() => baseHeadingLevels.map((item, index) => ({
  ...item,
  icon: headingIcons[index],
  label: t(`menu.headingN`, { n: item.level }),
})))

function textColorChanged(color: string) {
  colorState.textColor = color
  const editorView = editor.value as EditorView
  if (!editor.value)
    return
  formatColor(editorView, color)
}
</script>

<template>
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      {{ t('menu.format') }}
    </MenubarSubTrigger>
    <MenubarSubContent class="min-w-64">
      <MenubarItem @click="addFormat(`${ctrlKey}-B`)">
        <Bold class="mr-2 h-4 w-4" />
        {{ t('menu.bold') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">B</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-I`)">
        <Italic class="mr-2 h-4 w-4" />
        {{ t('menu.italic') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">I</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-D`)">
        <Strikethrough class="mr-2 h-4 w-4" />
        {{ t('menu.strikethrough') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">D</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-K`)">
        <Link class="mr-2 h-4 w-4" />
        {{ t('menu.link') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">K</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-E`)">
        <Code class="mr-2 h-4 w-4" />
        {{ t('menu.inlineCode') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">E</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <HoverCard :open-delay="100">
        <HoverCardTrigger as-child>
          <MenubarItem @click.prevent>
            <Paintbrush class="mr-2 h-4 w-4" />
            {{ t('menu.textColor') }}
          </MenubarItem>
        </HoverCardTrigger>
        <HoverCardContent side="right" class="w-min">
          <div ref="pickColorsContainer">
            <PickColors
              :value="colorState.textColor"
              show-alpha
              :format="colorState.format" :format-options="colorState.formatOptions"
              :theme="uiStore.isDark ? 'dark' : 'light'"
              :popup-container="pickColorsContainer!"
              @change="textColorChanged"
            />
          </div>
        </HoverCardContent>
      </HoverCard>

      <MenubarSeparator />

      <MenubarSub>
        <MenubarSubTrigger>
          <Heading1 class="mr-2 h-4 w-4" />
          {{ t('menu.heading') }}
        </MenubarSubTrigger>
        <MenubarSubContent class="min-w-44">
          <MenubarItem
            v-for="{ level, icon, label } in headingLevels"
            :key="level"
            @click="addFormat(`${ctrlKey}-${level}`)"
          >
            <component :is="icon" class="mr-2 h-4 w-4" />
            {{ label }}
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ level }}</kbd>
            </MenubarShortcut>
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
      <MenubarItem @click="addFormat(`${ctrlKey}-U`)">
        <List class="mr-2 h-4 w-4" />
        {{ t('menu.unorderedList') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">U</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-O`)">
        <ListOrdered class="mr-2 h-4 w-4" />
        {{ t('menu.orderedList') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">O</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <MenubarItem @click="citeStatusChanged()">
        <Link2 class="mr-2 h-4 w-4" />
        {{ t('menu.wechatLinkToCite') }}
      </MenubarItem>
      <MenubarItem @click="countStatusChanged()">
        <Clock class="mr-2 h-4 w-4" />
        {{ t('menu.wordCountTime') }}
      </MenubarItem>
    </MenubarSubContent>
  </MenubarSub>

  <MenubarMenu v-else>
    <MenubarTrigger>
      {{ t('menu.format') }}
    </MenubarTrigger>
    <MenubarContent class="min-w-64" align="start">
      <MenubarItem @click="addFormat(`${ctrlKey}-B`)">
        <Bold class="mr-2 h-4 w-4" />
        {{ t('menu.bold') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">B</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-I`)">
        <Italic class="mr-2 h-4 w-4" />
        {{ t('menu.italic') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">I</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-D`)">
        <Strikethrough class="mr-2 h-4 w-4" />
        {{ t('menu.strikethrough') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">D</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-K`)">
        <Link class="mr-2 h-4 w-4" />
        {{ t('menu.link') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">K</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-E`)">
        <Code class="mr-2 h-4 w-4" />
        {{ t('menu.inlineCode') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">E</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <HoverCard :open-delay="100">
        <HoverCardTrigger as-child>
          <MenubarItem @click.prevent>
            <Paintbrush class="mr-2 h-4 w-4" />
            {{ t('menu.textColor') }}
          </MenubarItem>
        </HoverCardTrigger>
        <HoverCardContent side="right" class="w-min">
          <div ref="pickColorsContainer">
            <PickColors
              v-model:value="colorState.textColor"
              show-alpha
              :format="colorState.format" :format-options="colorState.formatOptions"
              :theme="uiStore.isDark ? 'dark' : 'light'"
              :popup-container="pickColorsContainer!"
              @change="textColorChanged"
            />
          </div>
        </HoverCardContent>
      </HoverCard>

      <MenubarSeparator />

      <MenubarSub>
        <MenubarSubTrigger>
          <Heading1 class="mr-2 h-4 w-4" />
          {{ t('menu.heading') }}
        </MenubarSubTrigger>
        <MenubarSubContent class="min-w-44">
          <MenubarItem
            v-for="{ level, icon, label } in headingLevels"
            :key="level"
            @click="addFormat(`${ctrlKey}-${level}`)"
          >
            <component :is="icon" class="mr-2 h-4 w-4" />
            {{ label }}
            <MenubarShortcut>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
              <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ level }}</kbd>
            </MenubarShortcut>
          </MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
      <MenubarItem @click="addFormat(`${ctrlKey}-U`)">
        <List class="mr-2 h-4 w-4" />
        {{ t('menu.unorderedList') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">U</kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="addFormat(`${ctrlKey}-O`)">
        <ListOrdered class="mr-2 h-4 w-4" />
        {{ t('menu.orderedList') }}
        <MenubarShortcut>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">{{ ctrlSign }}</kbd>
          <kbd class="mx-1 bg-gray-2 dark:bg-stone-9">O</kbd>
        </MenubarShortcut>
      </MenubarItem>

      <MenubarSeparator />

      <MenubarItem @click="citeStatusChanged()">
        <Link2 class="mr-2 h-4 w-4" />
        {{ t('menu.wechatLinkToCite') }}
      </MenubarItem>
      <MenubarItem @click="countStatusChanged()">
        <Clock class="mr-2 h-4 w-4" />
        {{ t('menu.wordCountTime') }}
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
