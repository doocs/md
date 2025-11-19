<script setup lang="ts">
import { Heart, HelpCircle, MessageSquare, Tag } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const emit = defineEmits([`openAbout`, `openFund`])

const { asSub } = toRefs(props)

function openAboutDialog() {
  emit(`openAbout`)
}

function openFundDialog() {
  emit(`openFund`)
}

function openFeedback() {
  window.open('https://github.com/doocs/md/issues', '_blank')
}

function openReleases() {
  window.open('https://github.com/doocs/md/releases', '_blank')
}
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      帮助
    </MenubarSubTrigger>
    <MenubarSubContent align="start">
      <MenubarItem @click="openFeedback()">
        <MessageSquare class="mr-2 h-4 w-4" />
        反馈
      </MenubarItem>
      <MenubarItem @click="openReleases()">
        <Tag class="mr-2 h-4 w-4" />
        版本历史
      </MenubarItem>
      <MenubarItem @click="openAboutDialog()">
        <HelpCircle class="mr-2 h-4 w-4" />
        关于
      </MenubarItem>
      <MenubarItem @click="openFundDialog()">
        <Heart class="mr-2 h-4 w-4" />
        赞赏
      </MenubarItem>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>帮助</MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="openFeedback()">
        <MessageSquare class="mr-2 h-4 w-4" />
        反馈
      </MenubarItem>
      <MenubarItem @click="openReleases()">
        <Tag class="mr-2 h-4 w-4" />
        版本历史
      </MenubarItem>
      <MenubarItem @click="openAboutDialog()">
        <HelpCircle class="mr-2 h-4 w-4" />
        关于
      </MenubarItem>
      <MenubarItem @click="openFundDialog()">
        <Heart class="mr-2 h-4 w-4" />
        赞赏
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
