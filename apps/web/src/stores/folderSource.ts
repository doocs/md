/**
 * 文件系统节点接口
 */
export interface FileSystemNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileSystemNode[]
  handle?: FileSystemFileHandle | FileSystemDirectoryHandle
}

/**
 * 运行时文件夹信息（包含 handle，仅在内存中）
 */
interface RuntimeFolderInfo {
  id: string
  name: string
  handle: FileSystemDirectoryHandle
}

/**
 * 本地文件夹源 Store
 * 负责管理本地文件夹的访问、文件树结构和文件读写
 */
export const useFolderSourceStore = defineStore(`folderSource`, () => {
  // 内存中的运行时文件夹信息（不持久化）
  const runtimeFolderMap = new Map<string, RuntimeFolderInfo>()

  // 当前激活的文件夹 ID（不持久化）
  const currentFolderId = ref<string | null>(null)

  // 当前文件夹的文件树（不持久化，因为包含不可序列化的 handle）
  const fileTree = ref<FileSystemNode[]>([])

  // 选中的文件路径
  const selectedFilePath = ref<string>(``)

  // 是否正在加载
  const isLoading = ref(false)

  // 加载错误信息
  const loadError = ref<string>(``)

  // 当前运行时文件夹
  const currentRuntimeFolder = computed(() => {
    if (!currentFolderId.value)
      return null
    return runtimeFolderMap.get(currentFolderId.value) || null
  })

  // 兼容旧代码的属性
  const folderHandles = computed(() => {
    return Array.from(runtimeFolderMap.values()).map(folder => ({
      id: folder.id,
      name: folder.name,
      handle: folder.handle,
      permission: true,
    }))
  })

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

  // 兼容：savedFolders 返回空数组
  const savedFolders = ref<any[]>([])

  // 检查浏览器是否支持 File System Access API
  const isFileSystemAPISupported = computed(() => {
    return typeof window !== `undefined` && `showDirectoryPicker` in window
  })

  /**
   * 选择并打开本地文件夹
   */
  async function selectFolder() {
    if (!isFileSystemAPISupported.value) {
      toast.error(`您的浏览器不支持 File System Access API`)
      return
    }

    try {
      isLoading.value = true
      loadError.value = ``

      const handle = await window.showDirectoryPicker({
        mode: `readwrite`,
        startIn: `documents`,
      })

      // 请求权限
      const permission = await handle.requestPermission({ mode: `readwrite` })
      if (permission !== `granted`) {
        toast.error(`未授予文件夹访问权限`)
        return
      }

      // 检查是否已经打开过这个文件夹
      let folderId: string
      const existingFolder = Array.from(runtimeFolderMap.values()).find(f => f.name === handle.name)

      if (existingFolder) {
        folderId = existingFolder.id
        // 更新 handle
        existingFolder.handle = handle
      }
      else {
        // 创建新文件夹信息
        folderId = generateFolderId()
        const folderInfo: RuntimeFolderInfo = {
          id: folderId,
          name: handle.name,
          handle,
        }
        runtimeFolderMap.set(folderId, folderInfo)
      }

      currentFolderId.value = folderId

      // 加载文件树
      await loadFileTree(handle)

      toast.success(`文件夹「${handle.name}」已打开`)
    }
    catch (error: any) {
      if (error.name === `AbortError`) {
        // 用户取消了选择
        return
      }
      loadError.value = error.message || `打开文件夹失败`
      toast.error(`打开文件夹失败: ${error.message}`)
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 关闭当前文件夹
   */
  function closeFolder() {
    currentFolderId.value = null
    fileTree.value = []
    selectedFilePath.value = ``
  }

  /**
   * 从列表中移除文件夹
   */
  function removeFolder(folderId: string) {
    runtimeFolderMap.delete(folderId)

    // 如果关闭的是当前文件夹，清空当前状态
    if (currentFolderId.value === folderId) {
      closeFolder()
    }
  }

  /**
   * 加载文件树
   */
  async function loadFileTree(handle: FileSystemDirectoryHandle): Promise<void> {
    try {
      const tree = await buildFileTree(handle, handle.name)
      fileTree.value = [tree]
    }
    catch (error: any) {
      loadError.value = error.message || `加载文件树失败`
      throw error
    }
  }

  /**
   * 递归构建文件树
   */
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
          // 只添加 Markdown 文件
          if (entry.name.toLowerCase().endsWith(`.md`)) {
            node.children!.push({
              name: entry.name,
              path: entryPath,
              type: `file`,
              handle: entry,
            })
          }
        }
        else if (entry.kind === `directory`) {
          // 递归处理子目录
          const childNode = await buildFileTree(entry, entryPath)
          node.children!.push(childNode)
        }
      }

      // 排序：目录在前，文件在后，按名称排序
      node.children!.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === `directory` ? -1 : 1
        }
        return a.name.localeCompare(b.name, `zh-CN`)
      })
    }
    catch (error: any) {
      console.error(`读取目录失败: ${path}`, error)
    }

    return node
  }

  /**
   * 读取文件内容
   */
  async function readFile(filePath: string): Promise<string> {
    if (!currentRuntimeFolder.value) {
      throw new Error(`未选择文件夹`)
    }

    try {
      // 直接从文件树中查找节点
      const node = findNodeByPath(fileTree.value, filePath)
      if (!node) {
        throw new Error(`文件不存在: ${filePath}`)
      }

      if (node.type !== `file`) {
        throw new Error(`不是文件: ${filePath}`)
      }

      // 使用节点中存储的文件句柄
      const fileHandle = node.handle as FileSystemFileHandle
      const file = await fileHandle.getFile()
      return await file.text()
    }
    catch (error: any) {
      toast.error(`读取文件失败: ${error.message}`)
      throw error
    }
  }

  /**
   * 写入文件内容
   */
  async function writeFile(filePath: string, content: string): Promise<void> {
    if (!currentRuntimeFolder.value) {
      throw new Error(`未选择文件夹`)
    }

    try {
      // 解析路径，找到对应的目录句柄
      const pathParts = filePath.split(`/`).slice(1) // 移除第一部分（文件夹名）
      let currentHandle = currentRuntimeFolder.value.handle as FileSystemDirectoryHandle

      // 遍历路径，创建不存在的目录
      for (let i = 0; i < pathParts.length - 1; i++) {
        const dirName = pathParts[i]
        try {
          currentHandle = await currentHandle.getDirectoryHandle(dirName)
        }
        catch {
          // 目录不存在，创建它
          currentHandle = await currentHandle.getDirectoryHandle(dirName, { create: true })
        }
      }

      // 获取或创建文件句柄
      const fileName = pathParts[pathParts.length - 1]
      const fileHandle = await currentHandle.getFileHandle(fileName, { create: true })

      // 写入内容
      const writable = await fileHandle.createWritable()
      await writable.write(content)
      await writable.close()

      toast.success(`文件已保存`)
    }
    catch (error: any) {
      toast.error(`保存文件失败: ${error.message}`)
      throw error
    }
  }

  /**
   * 在文件树中查找节点
   */
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

  /**
   * 获取所有 Markdown 文件列表
   */
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

  /**
   * 生成文件夹 ID
   */
  function generateFolderId(): string {
    return `folder_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }

  return {
    // State
    folderHandles, // 兼容旧代码
    currentFolderHandle, // 兼容旧代码
    savedFolders,
    fileTree,
    selectedFilePath,
    isLoading,
    loadError,

    // Computed
    isFileSystemAPISupported,

    // Actions
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
