<script setup lang="ts">
const aboutDialogVisible = ref(false)
const fundDialogVisible = ref(false)
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger>
      帮助
    </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarCheckboxItem @click="aboutDialogVisible = true">
        <span>关于</span>
      </MenubarCheckboxItem>
      <MenubarCheckboxItem @click="fundDialogVisible = true">
        <span>赞赏</span>
      </MenubarCheckboxItem>
    </MenubarContent>
  </MenubarMenu>

  <AboutDialog :visible="aboutDialogVisible" @close="aboutDialogVisible = false" />
  <FundDialog :visible="fundDialogVisible" @close="fundDialogVisible = false" />
</template>
