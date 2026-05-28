<script setup lang="ts">
import { TooltipProvider } from '@/components/ui/tooltip'
import FooterLeft from './FooterLeft.vue'
import FooterRight from './FooterRight.vue'
</script>

<template>
  <footer
    class="flex select-none items-center overflow-hidden px-3 py-1 text-xs text-muted-foreground"
  >
    <TooltipProvider :delay-duration="300">
      <!-- 左侧：光标位置 & 文档切换器 & 大纲 -->
      <FooterLeft />

      <!-- 右侧：统计信息 -->
      <FooterRight />
    </TooltipProvider>
  </footer>
</template>
