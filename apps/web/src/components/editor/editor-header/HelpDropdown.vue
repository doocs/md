<script setup lang="ts">
import { BookText, Command, Heart, HelpCircle, Keyboard, MessageSquare, Tag } from '@lucide/vue'
import { ctrlSign, shiftSign } from '@md/shared/configs'
import { useUIStore } from '@/stores/ui'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})
const { asSub } = toRefs(props)
const { t } = useI18n()
const uiStore = useUIStore()
const {
  toggleShowAboutDialog,
  toggleShowFundDialog,
  toggleShowMarkdownHelpDialog,
  toggleShowKeyboardShortcutsDialog,
  toggleShowCommandPalette,
} = uiStore
function openAboutDialog() {
  toggleShowAboutDialog(true)
}
function openFundDialog() {
  toggleShowFundDialog(true)
}
function openMarkdownHelp() {
  toggleShowMarkdownHelpDialog(true)
}
function openCommandPalette() {
  toggleShowCommandPalette(true)
}
function openKeyboardShortcuts() {
  toggleShowKeyboardShortcutsDialog(true)
}
function openFeedback() {
  window.open(`https://github.com/doocs/md/issues`, `_blank`)
}
function openReleases() {
  window.open(`https://github.com/doocs/md/releases`, `_blank`)
}
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      {{ t('menu.help') }}
    </MenubarSubTrigger>
    <MenubarSubContent class="min-w-56">
      <MenubarItem class="pr-2" @click="openCommandPalette()">
        <Command class="mr-2 h-4 w-4 shrink-0" />
        <span class="min-w-0 flex-1">{{ t('menu.commandPalette') }}</span>
        <MenubarShortcut class="shrink-0 pl-4">
          <span class="inline-flex items-center gap-0.5">
            <kbd class="bg-gray-2 px-1 dark:bg-stone-9">{{ ctrlSign }}</kbd>
            <kbd class="bg-gray-2 px-1 dark:bg-stone-9">{{ shiftSign }}</kbd>
            <kbd class="bg-gray-2 px-1 dark:bg-stone-9">P</kbd>
          </span>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="openKeyboardShortcuts()">
        <Keyboard class="mr-2 h-4 w-4" />
        {{ t('menu.keyboardShortcuts') }}
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="openMarkdownHelp()">
        <BookText class="mr-2 h-4 w-4" />
        {{ t('menu.syntaxHelp') }}
      </MenubarItem>
      <MenubarItem @click="openFeedback()">
        <MessageSquare class="mr-2 h-4 w-4" />
        {{ t('menu.feedback') }}
      </MenubarItem>
      <MenubarItem @click="openReleases()">
        <Tag class="mr-2 h-4 w-4" />
        {{ t('menu.releaseHistory') }}
      </MenubarItem>
      <MenubarItem @click="openAboutDialog()">
        <HelpCircle class="mr-2 h-4 w-4" />
        {{ t('menu.about') }}
      </MenubarItem>
      <MenubarItem @click="openFundDialog()">
        <Heart class="mr-2 h-4 w-4" />
        {{ t('menu.fund') }}
      </MenubarItem>
    </MenubarSubContent>
  </MenubarSub>
  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>{{ t('menu.help') }}</MenubarTrigger>
    <MenubarContent align="start" class="min-w-56">
      <MenubarItem class="pr-2" @click="openCommandPalette()">
        <Command class="mr-2 h-4 w-4 shrink-0" />
        <span class="min-w-0 flex-1">{{ t('menu.commandPalette') }}</span>
        <MenubarShortcut class="shrink-0 pl-4">
          <span class="inline-flex items-center gap-0.5">
            <kbd class="bg-gray-2 px-1 dark:bg-stone-9">{{ ctrlSign }}</kbd>
            <kbd class="bg-gray-2 px-1 dark:bg-stone-9">{{ shiftSign }}</kbd>
            <kbd class="bg-gray-2 px-1 dark:bg-stone-9">P</kbd>
          </span>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarItem @click="openKeyboardShortcuts()">
        <Keyboard class="mr-2 h-4 w-4" />
        {{ t('menu.keyboardShortcuts') }}
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="openMarkdownHelp()">
        <BookText class="mr-2 h-4 w-4" />
        {{ t('menu.syntaxHelp') }}
      </MenubarItem>
      <MenubarItem @click="openFeedback()">
        <MessageSquare class="mr-2 h-4 w-4" />
        {{ t('menu.feedback') }}
      </MenubarItem>
      <MenubarItem @click="openReleases()">
        <Tag class="mr-2 h-4 w-4" />
        {{ t('menu.releaseHistory') }}
      </MenubarItem>
      <MenubarItem @click="openAboutDialog()">
        <HelpCircle class="mr-2 h-4 w-4" />
        {{ t('menu.about') }}
      </MenubarItem>
      <MenubarItem @click="openFundDialog()">
        <Heart class="mr-2 h-4 w-4" />
        {{ t('menu.fund') }}
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
