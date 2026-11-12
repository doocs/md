import type { CoseApi } from './cose'

export {}

declare global {
  interface Window {
    __MD_UTOOLS__?: boolean
    $cose?: CoseApi
    syncPost?: (data: { thumb: string, title: string, desc: string, content: string }) => void

    __MP_Editor_JSAPI__: {
      invoke: (params: {
        apiName: string
        apiParam: Record<string, unknown>
        sucCb: (res?: unknown) => void
        errCb: (err?: unknown) => void
      }) => void
    }

    showDirectoryPicker: (options?: {
      mode?: `read` | `readwrite`
      startIn?: `desktop` | `documents` | `downloads` | `music` | `pictures` | `videos`
    }) => Promise<FileSystemDirectoryHandle>
  }

  interface FileSystemDirectoryHandle {
    requestPermission: (descriptor?: { mode?: `read` | `readwrite` }) => Promise<PermissionState>
    getDirectoryHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemDirectoryHandle>
    getFileHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemFileHandle>
    removeEntry: (name: string, options?: { recursive?: boolean }) => Promise<void>
    resolve: (fileSystemHandle: FileSystemHandle) => Promise<string[] | null>
    values: () => AsyncIterableIterator<FileSystemHandle>
    [Symbol.asyncIterator]: () => AsyncIterableIterator<FileSystemHandle>
  }
}
