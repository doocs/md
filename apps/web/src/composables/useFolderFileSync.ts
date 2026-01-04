import { useFolderSourceStore } from '@/stores/folderSource'
import { usePostStore } from '@/stores/post'

/**
 * 文件夹文件同步 Composable
 * 监听编辑器内容变化，实时同步到本地文件夹
 */
export function useFolderFileSync() {
  const postStore = usePostStore()
  const folderStore = useFolderSourceStore()

  // 当前打开的文件路径
  const currentFilePath = ref<string | null>(null)

  // 防抖定时器
  let syncTimeoutId: ReturnType<typeof setTimeout> | null = null

  // 同步延迟（毫秒）
  const SYNC_DELAY = 1000

  /**
   * 设置当前文件路径
   */
  function setCurrentFilePath(filePath: string | null) {
    currentFilePath.value = filePath
  }

  /**
   * 执行同步
   */
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

  /**
   * 防抖同步
   */
  function debouncedSync() {
    if (!currentFilePath.value || !postStore.currentPost) {
      return
    }

    // 清除之前的定时器
    if (syncTimeoutId) {
      clearTimeout(syncTimeoutId)
    }

    // 设置新的定时器
    syncTimeoutId = setTimeout(() => {
      const content = postStore.currentPost?.content || ''
      performSync(currentFilePath.value!, content)
    }, SYNC_DELAY)
  }

  /**
   * 监听当前文章内容变化
   */
  watch(
    () => postStore.currentPost?.content,
    () => {
      debouncedSync()
    },
    { deep: false },
  )

  /**
   * 当切换文件时，同步旧文件
   */
  watch(
    () => currentFilePath.value,
    (newPath, oldPath) => {
      // 如果从一个文件切换到另一个文件，先同步旧文件
      if (oldPath && newPath !== oldPath && syncTimeoutId) {
        clearTimeout(syncTimeoutId)
        syncTimeoutId = null
      }
    },
  )

  /**
   * 清理
   */
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
