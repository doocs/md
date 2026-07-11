import { useUIStore } from '@/stores/ui'

/** Register global preferences shortcut Mod+, */
export function usePreferencesHotkey() {
  const uiStore = useUIStore()

  function onKeydown(event: KeyboardEvent) {
    if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.altKey)
      return
    if (event.key !== `,`)
      return

    event.preventDefault()
    uiStore.toggleShowPreferencesDialog(true)
  }

  onMounted(() => {
    document.addEventListener(`keydown`, onKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener(`keydown`, onKeydown)
  })
}
