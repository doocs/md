interface Window {
  __MP_Editor_JSAPI__: {
    invoke: (params: {
      apiName: string
      apiParam: any
      sucCb: (res: any) => void
      errCb: (err: any) => void
    }) => void
  }

  // File System Access API
  showDirectoryPicker: (options?: {
    mode?: 'read' | 'readwrite'
    startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos'
  }) => Promise<FileSystemDirectoryHandle>
}

// Extend FileSystemDirectoryHandle with full File System Access API methods
interface FileSystemDirectoryHandle {
  // Permission management
  requestPermission: (descriptor?: { mode?: 'read' | 'readwrite' }) => Promise<PermissionState>

  // Directory operations
  getDirectoryHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemDirectoryHandle>
  getFileHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemFileHandle>
  removeEntry: (name: string, options?: { recursive?: boolean }) => Promise<void>

  // Resolve path
  resolve: (fileSystemHandle: FileSystemHandle) => Promise<string[] | null>

  // Async iteration
  values: () => AsyncIterableIterator<FileSystemHandle>
  [Symbol.asyncIterator]: () => AsyncIterableIterator<FileSystemHandle>
}
