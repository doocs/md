import { useFolderSourceStore } from '@/stores/folderSource'

/**
 * Resolve an image path relative to the markdown file currently open in the
 * local folder, returning a `Blob` (or `null` if the file cannot be reached).
 *
 * Why: when a user opens a `.md` file from a local folder, image sources like
 * `![cover](images/foo.jpg)` or `![cover](./images/foo.jpg)` live in the same
 * folder. We need to look them up via the saved `FileSystemDirectoryHandle`
 * so the preview can render them without depending on the document origin.
 *
 * Strategy:
 *   - `mdFilePath` is the tree path of the current `.md` file (e.g. `my-folder/docs/intro.md`).
 *   - `relImagePath` is the value inside the markdown `![]()` (e.g. `images/foo.jpg`).
 *   - We strip the root folder segment, walk the directory handle, and read
 *     the file. Path is normalized so `../` is honored.
 */
export async function getFileBlobByRelativePath(
  mdFilePath: string,
  relImagePath: string,
): Promise<Blob | null> {
  const folderStore = useFolderSourceStore()
  const runtime = folderStore.currentRuntimeFolder
  if (!runtime) {
    return null
  }

  const mdDirParts = mdFilePath.split(`/`)
  // Drop the root folder segment (same convention as `writeFile` in folderSource).
  const mdDirSegments = mdDirParts.slice(1, -1)
  const imgSegments = normalizePath(relImagePath)

  if (!imgSegments.length) {
    return null
  }

  const walkSegments = [...mdDirSegments, ...imgSegments.slice(0, -1)]
  let dirHandle: FileSystemDirectoryHandle = runtime.handle
  for (const seg of walkSegments) {
    try {
      dirHandle = await dirHandle.getDirectoryHandle(seg)
    }
    catch {
      return null
    }
  }

  const fileName = imgSegments[imgSegments.length - 1]
  try {
    const fileHandle = await dirHandle.getFileHandle(fileName)
    return await fileHandle.getFile()
  }
  catch {
    return null
  }
}

/**
 * Normalize a relative or absolute-looking path into an array of segments.
 * Empty segments and `.` are dropped; `..` pops the previous segment if any.
 *
 * Each `/`-separated segment is percent-decoded individually. Decoding the
 * whole path at once would treat `%2F` as a path separator, which is never
 * the intent inside a single markdown `![]()` segment.
 */
function normalizePath(raw: string): string[] {
  const parts = raw
    .replace(/\\/g, `/`)
    .split(`/`)
    .map(decodeSegment)
    .filter(p => p && p !== `.`)

  const out: string[] = []
  for (const p of parts) {
    if (p === `..`) {
      out.pop()
    }
    else {
      out.push(p)
    }
  }
  return out
}

/**
 * Percent-decode a single path segment. Run after the path is split on `/`,
 * which lets `..` travel as literal characters rather than being decoded into
 * navigation. A malformed `%XX` sequence leaves the segment unchanged so a
 * single typo only fails the file lookup, never the render.
 */
function decodeSegment(seg: string): string {
  if (seg === `..` || seg === `.`)
    return seg
  try {
    return decodeURIComponent(seg)
  }
  catch {
    return seg
  }
}
