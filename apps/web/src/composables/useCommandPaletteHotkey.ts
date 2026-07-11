import { useUIStore } from '@/stores/ui'

/** Register global command palette shortcut Mod+Shift+P */
export function useCommandPaletteHotkey() {
  const uiStore = useUIStore()

  function onKeydown(event: KeyboardEvent) {
    if (!(event.metaKey || event.ctrlKey) || !event.shiftKey)
      return
    if (event.key.toLowerCase() !== `p`)
      return

    event.preventDefault()
    uiStore.toggleShowCommandPalette(true)
  }

  onMounted(() => {
    document.addEventListener(`keydown`, onKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener(`keydown`, onKeydown)
  })
}
