<script setup lang="ts">
import { ExternalLink, HelpCircle } from '@lucide/vue'
import { computed } from 'vue'
import CloudPanelDialog from '@/components/editor/editor-header/cloud-panel/CloudPanelDialog.vue'
import { Button } from '@/components/ui/button'

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

const links = [
  { label: `GitHub 仓库`, url: `https://github.com/doocs/md` },
  { label: `Gitee 仓库`, url: `https://gitee.com/doocs/md` },
  { label: `GitCode 仓库`, url: `https://gitcode.com/doocs/md` },
]

function onRedirect(url: string) {
  window.open(url, `_blank`, `noopener,noreferrer`)
}
</script>

<template>
  <CloudPanelDialog
    v-model:open="dialogOpen"
    title="关于"
    description="一款高度简洁的微信 Markdown 编辑器"
    :icon="HelpCircle"
  >
    <div class="space-y-4 px-4 py-6 text-center sm:px-6">
      <p class="text-sm text-muted-foreground">
        扫码关注公众号 Doocs，原创技术内容第一时间推送！
      </p>
      <img
        class="mx-auto max-w-[200px] rounded-lg ring-1 ring-border"
        src="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/1648303220922-7e14aefa-816e-44c1-8604-ade709ca1c69.png"
        alt="Doocs Markdown 编辑器"
      >
    </div>

    <template #footer>
      <div class="flex flex-wrap gap-2 border-t px-4 py-4 sm:justify-center sm:px-6">
        <Button
          v-for="link in links"
          :key="link.url"
          variant="outline"
          class="h-10 flex-1 gap-2 sm:flex-none"
          @click="onRedirect(link.url)"
        >
          <ExternalLink class="size-4" />
          {{ link.label }}
        </Button>
      </div>
    </template>
  </CloudPanelDialog>
</template>
