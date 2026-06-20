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

const { t } = useI18n()

const dialogOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit(`update:open`, val),
})

const contributors = computed(() => [
  {
    name: `yanglbme`,
    imageUrl: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/support1.jpg`,
    altText: t(`fund.qrAlt1`),
  },
  {
    name: `yangfong`,
    imageUrl: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/support2.jpg`,
    altText: t(`fund.qrAlt2`),
  },
])
</script>

<template>
  <PanelDialog
    v-model:open="dialogOpen"
    :title="t('fund.title')"
    :description="t('fund.description')"
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
