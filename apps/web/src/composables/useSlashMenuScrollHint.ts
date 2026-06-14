import type { Ref } from 'vue'

const SCROLL_HINT_THRESHOLD = 8

export function useSlashMenuScrollHint(options: {
  visible: Ref<boolean>
  scrollRef: Ref<HTMLElement | null>
  menuRef: Ref<HTMLElement | null>
  filter: Ref<string>
  filteredCommandsLength: Ref<number>
  activeIndex: Ref<number>
}) {
  const canScrollDown = ref(false)

  let scrollContentObserver: ResizeObserver | null = null

  function updateScrollHint() {
    const el = options.scrollRef.value
    if (!el) {
      canScrollDown.value = false
      return
    }
    canScrollDown.value = el.scrollHeight - el.scrollTop - el.clientHeight > SCROLL_HINT_THRESHOLD
  }

  function bindScrollContentObserver() {
    unbindScrollContentObserver()
    nextTick(() => {
      const el = options.scrollRef.value
      if (!el)
        return
      scrollContentObserver = new ResizeObserver(() => updateScrollHint())
      scrollContentObserver.observe(el)
      updateScrollHint()
    })
  }

  function unbindScrollContentObserver() {
    scrollContentObserver?.disconnect()
    scrollContentObserver = null
  }

  function scrollActiveIntoView() {
    nextTick(() => {
      const el = options.menuRef.value?.querySelector(`[data-active="true"]`)
      el?.scrollIntoView({ block: `nearest` })
      updateScrollHint()
    })
  }

  watch(
    () => [options.filter.value, options.filteredCommandsLength.value, options.activeIndex.value] as const,
    () => {
      if (options.visible.value)
        nextTick(updateScrollHint)
    },
  )

  onUnmounted(unbindScrollContentObserver)

  return {
    canScrollDown,
    updateScrollHint,
    scrollActiveIntoView,
    bindScrollContentObserver,
    unbindScrollContentObserver,
  }
}
