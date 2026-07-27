<script setup lang="ts">
import { ArrowUpFromLine } from '@lucide/vue'
import { useThrottleFn } from '@vueuse/core'

type Target = HTMLElement | Window | null

const props = defineProps<{
  left?: number
  top?: number
  right?: number
  bottom?: number
  visibilityHeight?: number
  target?: string
  onClick?: (e: MouseEvent) => void
}>()

const { t } = useI18n()
const visibilityHeight = ref(props.visibilityHeight ?? 400)
const visible = ref(false)

const target = ref<Target>(null)

function scrollToTop(e: MouseEvent) {
  target.value?.scrollTo({ top: 0, left: 0, behavior: `smooth` })
  props.onClick?.(e)
}

const throttledScroll = useThrottleFn((el: Target) => {
  if (el instanceof HTMLElement) {
    visible.value = el.scrollTop > visibilityHeight.value
  }
  else {
    visible.value = window.scrollY > visibilityHeight.value
  }
}, 200, true, true)

function handleScroll() {
  throttledScroll(target.value)
}

onMounted(() => {
  if (props.target) {
    target.value = document.getElementById(props.target)
  }
  else {
    target.value = window
  }

  target.value?.addEventListener(`scroll`, handleScroll)
})

onUnmounted(() => {
  target.value?.removeEventListener(`scroll`, handleScroll)
})
</script>

<template>
  <Transition name="back-top">
    <Button
      v-if="visible"
      variant="outline"
      size="icon"
      class="absolute z-50 rounded-full border bg-background/90 text-foreground/80 shadow-md backdrop-blur-sm hover:bg-background hover:text-foreground hover:shadow-lg"
      :style="{ left: `${left}px`, top: `${top}px`, right: `${right}px`, bottom: `${bottom}px` }"
      :aria-label="t('common.backToTop')"
      :title="t('common.backToTop')"
      @click="scrollToTop"
    >
      <ArrowUpFromLine class="size-5" />
    </Button>
  </Transition>
</template>

<style scoped>
.back-top-enter-active,
.back-top-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.back-top-enter-from,
.back-top-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
