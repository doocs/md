<script setup lang="ts">
const aboutDialogVisible = ref(false)
const fundDialogVisible = ref(false)
const aiDialogVisible = ref(false)
</script>

<template>
  <!-- 帮助菜单 -->
  <MenubarMenu>
    <MenubarTrigger>帮助</MenubarTrigger>
    <MenubarContent align="start">
      <MenubarCheckboxItem @click="aboutDialogVisible = true">
        <span>关于</span>
      </MenubarCheckboxItem>
      <MenubarCheckboxItem @click="fundDialogVisible = true">
        <span>赞赏</span>
      </MenubarCheckboxItem>
      <MenubarCheckboxItem @click="aiDialogVisible = true">
        <span>AI 助手</span>
      </MenubarCheckboxItem>
    </MenubarContent>
  </MenubarMenu>

  <!-- 各弹窗挂载 -->
  <AboutDialog :visible="aboutDialogVisible" @close="aboutDialogVisible = false" />
  <FundDialog :visible="fundDialogVisible" @close="fundDialogVisible = false" />
  <AIAssistantPanel v-model:open="aiDialogVisible" />
</template>
