<script setup lang="ts">
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
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      帮助
    </MenubarSubTrigger>
    <MenubarSubContent align="start">
      <MenubarCheckboxItem @click="openAboutDialog()">
        关于
      </MenubarCheckboxItem>
      <MenubarCheckboxItem @click="openFundDialog()">
        赞赏
      </MenubarCheckboxItem>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>帮助</MenubarTrigger>
    <MenubarContent align="start">
      <MenubarCheckboxItem @click="openAboutDialog()">
        <span>关于</span>
      </MenubarCheckboxItem>
      <MenubarCheckboxItem @click="openFundDialog()">
        <span>赞赏</span>
      </MenubarCheckboxItem>
    </MenubarContent>
  </MenubarMenu>
</template>
