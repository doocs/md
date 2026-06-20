<script setup lang="ts">
import { Heart } from '@lucide/vue'
import { computed } from 'vue'
import PanelDialog from '@/components/shared/panel-dialog/PanelDialog.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const dialogOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit(`update:open`, val),
})

const contributors = [
  {
    name: `yanglbme`,
    imageUrl: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/support1.jpg`,
    altText: `赞赏二维码 1`,
  },
  {
    name: `yangfong`,
    imageUrl: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/support2.jpg`,
    altText: `赞赏二维码 2`,
  },
]
</script>

<template>
  <PanelDialog
    v-model:open="dialogOpen"
    title="赞赏"
    description="若觉得项目不错，可以通过以下方式支持我们～"
    :icon="Heart"
  >
    <div class="px-4 py-4 sm:px-6">
      <div class="grid grid-cols-2 gap-4">
        <div v-for="contributor in contributors" :key="contributor.name" class="text-center">
          <img
            :src="contributor.imageUrl"
            :alt="contributor.altText"
            class="mx-auto w-full max-w-[200px] rounded-xl ring-1 ring-border"
          >
        </div>
      </div>
    </div>
  </PanelDialog>
</template>
