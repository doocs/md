import type { Ref } from 'vue'

const MENU_WIDTH = 260
const MENU_GAP = 6
const MENU_PADDING = 8
const MENU_HEIGHT_DEFAULT = 380
const MENU_HEIGHT_FILTER = 320

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function useSlashMenuPosition(options: {
  visible: Ref<boolean>
  position: Ref<{ x: number, y: number, top: number }>
  filter: Ref<string>
  containerEl: Ref<HTMLElement | null>
  menuRef: Ref<HTMLElement | null>
  isFiltering: Ref<boolean>
}) {
  const adjustedPosition = ref({ x: 0, y: 0 })

  let resizeObserver: ResizeObserver | null = null

  function updateAdjustedPosition() {
    const container = options.containerEl.value
    if (!container) {
      adjustedPosition.value = { x: options.position.value.x, y: options.position.value.y }
      return
    }

    const bounds = container.getBoundingClientRect()
    const menuWidth = options.menuRef.value?.offsetWidth ?? MENU_WIDTH
    const menuHeight = options.menuRef.value?.offsetHeight
      ?? (options.isFiltering.value ? MENU_HEIGHT_FILTER : MENU_HEIGHT_DEFAULT)

    let relX = options.position.value.x - bounds.left
    const cursorBottom = options.position.value.y - bounds.top
    const cursorTop = options.position.value.top - bounds.top

    relX = clamp(relX, MENU_PADDING, bounds.width - menuWidth - MENU_PADDING)

    const spaceBelow = bounds.height - cursorBottom - MENU_PADDING
    const spaceAbove = cursorTop - MENU_PADDING

    let relY: number
    if (spaceBelow >= menuHeight)
      relY = cursorBottom + MENU_GAP
    else if (spaceAbove >= menuHeight)
      relY = cursorTop - menuHeight - MENU_GAP
    else
      relY = clamp(cursorBottom + MENU_GAP, MENU_PADDING, bounds.height - menuHeight - MENU_PADDING)

    adjustedPosition.value = { x: relX, y: relY }
  }

  function bindContainerObserver() {
    unbindContainerObserver()
    if (!options.containerEl.value)
      return
    resizeObserver = new ResizeObserver(() => updateAdjustedPosition())
    resizeObserver.observe(options.containerEl.value)
  }

  function unbindContainerObserver() {
    resizeObserver?.disconnect()
    resizeObserver = null
  }

  watch(
    () => [
      options.visible.value,
      options.position.value.x,
      options.position.value.y,
      options.position.value.top,
      options.filter.value,
      options.containerEl.value,
    ] as const,
    () => {
      if (!options.visible.value)
        return
      nextTick(updateAdjustedPosition)
    },
  )

  onUnmounted(unbindContainerObserver)

  return {
    adjustedPosition,
    updateAdjustedPosition,
    bindContainerObserver,
    unbindContainerObserver,
  }
}
