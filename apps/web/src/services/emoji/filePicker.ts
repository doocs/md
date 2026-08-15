import type { EmojiFile, EmojiPack } from '@md/shared/types/emoji'

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|svg)$/i

export interface EmojiImportResult {
  packs: EmojiPack[]
  /** id -> original Blob, for persisting into IDB cache. */
  blobs: Map<string, Blob>
}

export function isFileSystemAPISupported(): boolean {
  return typeof window !== `undefined` && `showDirectoryPicker` in window
}

/** sha256 of a Blob. Uses `crypto.subtle.digest` (browser). */
export async function sha256OfBlob(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer()
  const hash = await crypto.subtle.digest(`SHA-256`, buf)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, `0`)).join(``)
}

export function isImageFile(name: string): boolean {
  return IMAGE_EXT.test(name)
}

async function probeImage(file: File): Promise<{ width?: number, height?: number }> {
  if (typeof createImageBitmap !== `function` && !file.type.startsWith(`image/`))
    return {}
  try {
    const bitmap = await createImageBitmap(file)
    const w = bitmap.width
    const h = bitmap.height
    bitmap.close?.()
    return { width: w, height: h }
  }
  catch {
    return {}
  }
}

async function fileToEmojiFile(file: File, blobs: Map<string, Blob>): Promise<EmojiFile> {
  const id = await sha256OfBlob(file)
  blobs.set(id, file)
  const dims = await probeImage(file)
  return {
    id,
    name: file.name,
    mimeType: file.type || guessMime(file.name),
    size: file.size,
    ...dims,
  }
}

function guessMime(name: string): string {
  const ext = name.split(`.`).pop()?.toLowerCase()
  switch (ext) {
    case `png`: return `image/png`
    case `jpg`:
    case `jpeg`: return `image/jpeg`
    case `gif`: return `image/gif`
    case `webp`: return `image/webp`
    case `bmp`: return `image/bmp`
    case `svg`: return `image/svg+xml`
    default: return `application/octet-stream`
  }
}

// ---------- FileSystem Access API path ----------

async function walkDirForImages(
  handle: FileSystemDirectoryHandle,
  basePath: string,
): Promise<{ file: File, virtualPath: string }[]> {
  const out: { file: File, virtualPath: string }[] = []
  for await (const child of handle.values()) {
    if (child.kind === `file` && isImageFile(child.name)) {
      const file = await (child as FileSystemFileHandle).getFile()
      out.push({ file, virtualPath: `${basePath}/${child.name}` })
    }
    else if (child.kind === `directory`) {
      const nested = await walkDirForImages(child as FileSystemDirectoryHandle, `${basePath}/${child.name}`)
      out.push(...nested)
    }
  }
  return out
}

async function handleToPack(
  handle: FileSystemDirectoryHandle,
  blobs: Map<string, Blob>,
  parentPath = ``,
): Promise<EmojiPack> {
  const files = await walkDirForImages(handle, handle.name)
  const items = await Promise.all(files.map(async ({ file }) => fileToEmojiFile(file, blobs)))
  return {
    id: `${handle.name}-${Date.now()}`,
    name: handle.name,
    source: `directory-handle`,
    sourcePath: parentPath ? `${parentPath}/${handle.name}` : handle.name,
    createdAt: Date.now(),
    files: items.sort((a, b) => a.name.localeCompare(b.name)),
  }
}

async function pickDirectoryWithHandles(): Promise<EmojiImportResult> {
  if (!isFileSystemAPISupported()) {
    throw new Error(`FileSystem Access API not supported in this browser`)
  }
  const root: FileSystemDirectoryHandle = await window.showDirectoryPicker({ mode: `read`, startIn: `documents` })
  const blobs = new Map<string, Blob>()

  const directImages: FileSystemFileHandle[] = []
  const subdirs: FileSystemDirectoryHandle[] = []
  for await (const child of root.values()) {
    if (child.kind === `file` && isImageFile(child.name))
      directImages.push(child as FileSystemFileHandle)
    else if (child.kind === `directory`)
      subdirs.push(child as FileSystemDirectoryHandle)
  }

  if (directImages.length > 0) {
    return { packs: [await handleToPack(root, blobs)], blobs }
  }
  const packs = (await Promise.all(subdirs.map(d => handleToPack(d, blobs, root.name))))
    .filter(p => p.files.length > 0)
  return { packs, blobs }
}

// ---------- webkitdirectory fallback ----------

function pickDirectoryWithWebkit(): Promise<EmojiImportResult> {
  return new Promise((resolve, reject) => {
    const input = document.createElement(`input`)
    input.type = `file`
    ;(input as HTMLInputElement & { webkitdirectory: boolean }).webkitdirectory = true
    input.multiple = true
    input.style.display = `none`
    document.body.appendChild(input)

    const cleanup = () => {
      input.remove()
    }

    input.addEventListener(`change`, async () => {
      cleanup()
      const fileList = input.files
      if (!fileList || fileList.length === 0) {
        resolve({ packs: [], blobs: new Map() })
        return
      }
      try {
        const groups = new Map<string, File[]>()
        for (const f of Array.from(fileList)) {
          if (!isImageFile(f.name))
            continue
          const rel = (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name
          const top = rel.split(`/`)[0] || f.name
          if (!groups.has(top))
            groups.set(top, [])
          groups.get(top)!.push(f)
        }
        const blobs = new Map<string, Blob>()
        const packs: EmojiPack[] = []
        for (const [top, files] of groups) {
          const items = await Promise.all(files.map(f => fileToEmojiFile(f, blobs)))
          packs.push({
            id: `${top}-${Date.now()}`,
            name: top,
            source: `webkitdirectory`,
            createdAt: Date.now(),
            files: items.sort((a, b) => a.name.localeCompare(b.name)),
          })
        }
        resolve({ packs, blobs })
      }
      catch (err) {
        reject(err)
      }
    })

    input.click()
  })
}

// ---------- Entry point ----------

export async function pickEmojiPacks(): Promise<EmojiImportResult> {
  if (isFileSystemAPISupported()) {
    try {
      return await pickDirectoryWithHandles()
    }
    catch (err) {
      if ((err as Error).name === `AbortError`)
        return { packs: [], blobs: new Map() }
      console.warn(`[emoji] FS Access picker failed, falling back to webkitdirectory:`, err)
    }
  }
  return pickDirectoryWithWebkit()
}

/** Build a single pack from a flat FileList (single-pack import). */
export async function importSinglePack(files: FileList): Promise<EmojiImportResult> {
  const filtered = Array.from(files).filter(f => isImageFile(f.name))
  if (filtered.length === 0) {
    throw new Error(`No image files found in selection`)
  }
  const blobs = new Map<string, Blob>()
  const items = await Promise.all(filtered.map(f => fileToEmojiFile(f, blobs)))
  return {
    packs: [{
      id: `pack-${Date.now()}`,
      name: filtered[0]!.name.replace(IMAGE_EXT, ``) || `pack`,
      source: `webkitdirectory`,
      createdAt: Date.now(),
      files: items.sort((a, b) => a.name.localeCompare(b.name)),
    }],
    blobs,
  }
}
