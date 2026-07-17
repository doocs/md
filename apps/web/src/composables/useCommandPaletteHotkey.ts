import { useUIStore } from '@/stores/ui'

/** Register global command palette shortcut Mod+Shift+. */
export function useCommandPaletteHotkey() {
  const uiStore = useUIStore()

  function onKeydown(event: KeyboardEvent) {
    if (!(event.metaKey || event.ctrlKey) || !event.shiftKey)
      return
    // Use code so Shift+. (key becomes ">") still matches the period key
    if (event.code !== `Period`)
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
