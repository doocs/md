import { useFolderSourceStore } from '@/stores/folderSource'
import { usePostStore } from '@/stores/post'

/** Sync editor content changes to the open local folder file (debounced). */
export function useFolderFileSync() {
  const postStore = usePostStore()
  const folderStore = useFolderSourceStore()

  const currentFilePath = ref<string | null>(null)

  let syncTimeoutId: ReturnType<typeof setTimeout> | null = null

  const SYNC_DELAY = 1000

  function setCurrentFilePath(filePath: string | null) {
    currentFilePath.value = filePath
  }

  async function performSync(filePath: string, content: string) {
    if (!filePath) {
      return
    }

    try {
      await folderStore.writeFile(filePath, content)
    }
    catch (error: any) {
      console.error('文件同步失败:', error)
    }
  }

  function debouncedSync() {
    if (!currentFilePath.value || !postStore.currentPost) {
      return
    }

    if (syncTimeoutId) {
      clearTimeout(syncTimeoutId)
    }

    syncTimeoutId = setTimeout(() => {
      const content = postStore.currentPost?.content || ''
      performSync(currentFilePath.value!, content)
    }, SYNC_DELAY)
  }

  watch(
    () => postStore.currentPost?.content,
    () => {
      debouncedSync()
    },
    { deep: false },
  )

  watch(
    () => currentFilePath.value,
    (newPath, oldPath) => {
      if (oldPath && newPath !== oldPath && syncTimeoutId) {
        clearTimeout(syncTimeoutId)
        syncTimeoutId = null
      }
    },
  )

  onBeforeUnmount(() => {
    if (syncTimeoutId) {
      clearTimeout(syncTimeoutId)
    }
  })

  return {
    currentFilePath,
    setCurrentFilePath,
  }
}
