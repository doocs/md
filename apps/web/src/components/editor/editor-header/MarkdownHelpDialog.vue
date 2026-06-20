<script setup lang="ts">
import type { Component } from 'vue'
import { BookOpen, Code2, FileText, FunctionSquare, PieChart } from '@lucide/vue'
import { computed, ref } from 'vue'
import PanelDialog from '@/components/shared/panel-dialog/PanelDialog.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

interface SyntaxItem {
  name: string
  syntax: string
  example?: string
  tip?: string
}

interface SyntaxCategory {
  id: string
  label: string
  icon: Component
  items: SyntaxItem[]
}

const { t, tm } = useI18n()

const dialogOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit(`update:open`, val),
})

const activeTab = ref(`basic`)
const copiedSyntax = ref<string | null>(null)

const syntaxCategoryIds = [`basic`, `code`, `math`, `diagram`, `other`] as const
const syntaxIcons: Record<string, Component> = {
  basic: FileText,
  code: Code2,
  math: FunctionSquare,
  diagram: PieChart,
  other: BookOpen,
}

const syntaxCategories = computed<SyntaxCategory[]>(() =>
  syntaxCategoryIds.map(id => ({
    id,
    label: t(`markdownHelp.tabs.${id}`),
    icon: syntaxIcons[id],
    items: tm(`markdownHelp.syntax.${id}`) as SyntaxItem[],
  })),
)

async function copySyntax(syntax: string) {
  try {
    await navigator.clipboard.writeText(syntax)
    copiedSyntax.value = syntax
    window.setTimeout(() => {
      if (copiedSyntax.value === syntax)
        copiedSyntax.value = null
    }, 1500)
    toast.success(t(`common.copiedToClipboard`))
  }
  catch {
    toast.error(t(`common.copyFailed`))
  }
}
</script>

<template>
  <PanelDialog
    v-model:open="dialogOpen"
    :title="t('markdownHelp.title')"
    :description="t('markdownHelp.description')"
    :icon="BookOpen"
    size="2xl"
  >
    <div class="px-4 py-4 sm:px-6">
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid h-auto w-full grid-cols-5">
          <TabsTrigger
            v-for="cat in syntaxCategories"
            :key="cat.id"
            :value="cat.id"
            class="!flex-col !items-center !justify-center gap-1 px-2 py-2 [&>span]:flex [&>span]:flex-col [&>span]:items-center [&>span]:justify-center"
          >
            <component :is="cat.icon" class="size-4" />
            <span class="text-xs whitespace-normal">{{ cat.label }}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          v-for="cat in syntaxCategories"
          :key="cat.id"
          :value="cat.id"
          class="mt-4 max-h-[min(50vh,24rem)] space-y-3 overflow-y-auto"
        >
          <div
            v-for="item in cat.items"
            :key="item.name"
            class="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent/50"
            :class="copiedSyntax === item.syntax ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : ''"
            @click="copySyntax(item.syntax)"
          >
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-medium">{{ item.name }}</span>
              <span class="text-xs text-muted-foreground">
                {{ copiedSyntax === item.syntax ? t('common.copied') : t('markdownHelp.clickToCopy') }}
              </span>
            </div>
            <pre class="overflow-x-auto rounded bg-muted/50 p-2 font-mono text-xs">{{ item.syntax }}</pre>
            <div v-if="item.tip" class="mt-2 text-xs text-muted-foreground">
              {{ item.tip }}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </PanelDialog>
</template>
