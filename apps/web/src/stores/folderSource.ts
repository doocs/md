import { t } from '@/i18n/translate'

export interface FileSystemNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileSystemNode[]
  handle?: FileSystemFileHandle | FileSystemDirectoryHandle
}

/** Runtime folder info (includes handle; kept in memory only). */
interface RuntimeFolderInfo {
  id: string
  name: string
  handle: FileSystemDirectoryHandle
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error)
    return error.message
  return String(error)
}

function getErrorName(error: unknown): string {
  if (error instanceof Error)
    return error.name
  return `UnknownError`
}

/** Local folder source: File System Access API, file tree, read/write. */
export const useFolderSourceStore = defineStore(`folderSource`, () => {
  const runtimeFolderMap = new Map<string, RuntimeFolderInfo>()

  const currentFolderId = ref<string | null>(null)

  // Not persisted: tree nodes hold non-serializable handles
  const fileTree = ref<FileSystemNode[]>([])

  const selectedFilePath = ref<string>(``)

  const isLoading = ref(false)

  const loadError = ref<string>(``)

  const currentRuntimeFolder = computed(() => {
    if (!currentFolderId.value)
      return null
    return runtimeFolderMap.get(currentFolderId.value) || null
  })

  /** @deprecated Legacy shape for older callers */
  const folderHandles = computed(() => {
    return Array.from(runtimeFolderMap.values()).map(folder => ({
      id: folder.id,
      name: folder.name,
      handle: folder.handle,
      permission: true,
    }))
  })

  /** @deprecated Legacy shape for older callers */
  const currentFolderHandle = computed(() => {
    if (!currentRuntimeFolder.value)
      return null
    return {
      id: currentRuntimeFolder.value.id,
      name: currentRuntimeFolder.value.name,
      handle: currentRuntimeFolder.value.handle,
      permission: true,
    }
  })

  /** @deprecated Always returns []; folders are not persisted */
  const savedFolders = ref<any[]>([])

  const isFileSystemAPISupported = computed(() => {
    return typeof window !== `undefined` && `showDirectoryPicker` in window
  })

  async function selectFolder() {
    if (!isFileSystemAPISupported.value) {
      toast.error(t('store.folder.apiNotSupported'))
      return
    }

    try {
      isLoading.value = true
      loadError.value = ``

      const handle = await window.showDirectoryPicker({
        mode: `readwrite`,
        startIn: `documents`,
      })

      const permission = await handle.requestPermission({ mode: `readwrite` })
      if (permission !== `granted`) {
        toast.error(t('store.folder.permissionDenied'))
        return
      }

      let folderId: string
      const existingFolder = Array.from(runtimeFolderMap.values()).find(f => f.name === handle.name)

      if (existingFolder) {
        folderId = existingFolder.id
        existingFolder.handle = handle
      }
      else {
        folderId = generateFolderId()
        const folderInfo: RuntimeFolderInfo = {
          id: folderId,
          name: handle.name,
          handle,
        }
        runtimeFolderMap.set(folderId, folderInfo)
      }

      currentFolderId.value = folderId

      await loadFileTree(handle)

      toast.success(t('store.folder.opened', { name: handle.name }))
    }
    catch (error: unknown) {
      if (getErrorName(error) === `AbortError`) {
        return
      }
      const msg = getErrorMessage(error)
      loadError.value = msg
      toast.error(t('store.folder.openFailed', { message: msg }))
    }
    finally {
      isLoading.value = false
    }
  }

  function closeFolder() {
    if (currentFolderId.value) {
      runtimeFolderMap.delete(currentFolderId.value)
    }
    currentFolderId.value = null
    fileTree.value = []
    selectedFilePath.value = ``
  }

  function removeFolder(folderId: string) {
    runtimeFolderMap.delete(folderId)

    if (currentFolderId.value === folderId) {
      closeFolder()
    }
  }

  async function loadFileTree(handle: FileSystemDirectoryHandle): Promise<void> {
    try {
      const tree = await buildFileTree(handle, handle.name)
      fileTree.value = [tree]
    }
    catch (error: unknown) {
      loadError.value = getErrorMessage(error)
      throw error
    }
  }

  async function buildFileTree(
    handle: FileSystemDirectoryHandle,
    path: string,
  ): Promise<FileSystemNode> {
    const node: FileSystemNode = {
      name: handle.name,
      path,
      type: `directory`,
      children: [],
      handle,
    }

    try {
      for await (const entry of handle.values()) {
        const entryPath = `${path}/${entry.name}`
        if (entry.kind === `file`) {
          if (entry.name.toLowerCase().endsWith(`.md`)) {
            node.children!.push({
              name: entry.name,
              path: entryPath,
              type: `file`,
              handle: entry as FileSystemFileHandle,
            })
          }
        }
        else if (entry.kind === `directory`) {
          const childNode = await buildFileTree(entry as FileSystemDirectoryHandle, entryPath)
          node.children!.push(childNode)
        }
      }

      // Directories first, then files, sorted by name
      node.children!.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === `directory` ? -1 : 1
        }
        return a.name.localeCompare(b.name, `zh-CN`)
      })
    }
    catch (error: unknown) {
      console.error(`Failed to read directory: ${path}`, getErrorMessage(error))
    }

    return node
  }

  async function readFile(filePath: string): Promise<string> {
    if (!currentRuntimeFolder.value) {
      throw new Error(t('store.folder.noFolderSelected'))
    }

    try {
      const node = findNodeByPath(fileTree.value, filePath)
      if (!node) {
        throw new Error(t('store.folder.fileNotFound', { path: filePath }))
      }

      if (node.type !== `file`) {
        throw new Error(t('store.folder.notAFile', { path: filePath }))
      }

      const fileHandle = node.handle as FileSystemFileHandle
      const file = await fileHandle.getFile()
      return await file.text()
    }
    catch (error: unknown) {
      toast.error(t('store.folder.readFailed', { message: getErrorMessage(error) }))
      throw error
    }
  }

  async function writeFile(filePath: string, content: string): Promise<void> {
    if (!currentRuntimeFolder.value) {
      throw new Error(t('store.folder.noFolderSelected'))
    }

    try {
      const pathParts = filePath.split(`/`).slice(1) // drop root folder segment
      let currentHandle = currentRuntimeFolder.value.handle as FileSystemDirectoryHandle

      for (let i = 0; i < pathParts.length - 1; i++) {
        const dirName = pathParts[i]
        try {
          currentHandle = await currentHandle.getDirectoryHandle(dirName)
        }
        catch {
          currentHandle = await currentHandle.getDirectoryHandle(dirName, { create: true })
        }
      }

      const fileName = pathParts[pathParts.length - 1]
      const fileHandle = await currentHandle.getFileHandle(fileName, { create: true })

      const writable = await fileHandle.createWritable()
      await writable.write(content)
      await writable.close()
    }
    catch (error: unknown) {
      console.error(`Failed to save file: ${getErrorMessage(error)}`)
      throw error
    }
  }

  function findNodeByPath(nodes: FileSystemNode[], path: string): FileSystemNode | null {
    for (const node of nodes) {
      if (node.path === path) {
        return node
      }
      if (node.children) {
        const found = findNodeByPath(node.children, path)
        if (found)
          return found
      }
    }
    return null
  }

  function getAllMarkdownFiles(nodes: FileSystemNode[] = fileTree.value): FileSystemNode[] {
    const files: FileSystemNode[] = []
    for (const node of nodes) {
      if (node.type === `file`) {
        files.push(node)
      }
      if (node.children) {
        files.push(...getAllMarkdownFiles(node.children))
      }
    }
    return files
  }

  function generateFolderId(): string {
    return `folder_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }

  return {
    folderHandles,
    currentFolderHandle,
    savedFolders,
    fileTree,
    selectedFilePath,
    isLoading,
    loadError,
    isFileSystemAPISupported,
    selectFolder,
    closeFolder,
    removeFolder,
    loadFileTree,
    readFile,
    writeFile,
    findNodeByPath,
    getAllMarkdownFiles,
  }
})
