import { hasValidImageSuffix, isAcceptedImageType, normalizePastedImageFile } from './validate-image'

function isPasteableImage(file: File): boolean {
  return isAcceptedImageType(file.type) || hasValidImageSuffix(file.name)
}

function collectImageFiles(candidates: Array<File | null>): File[] {
  const files: File[] = []
  for (const file of candidates) {
    if (!file || !isPasteableImage(file))
      continue
    files.push(normalizePastedImageFile(file))
  }
  return files
}

/**
 * Collect image files from a paste/drop DataTransfer.
 * `items` and `files` often describe the same clipboard image as different
 * File objects, so files are used only when items contain no image.
 */
export function collectClipboardImages(data: DataTransfer | null | undefined): File[] {
  if (!data)
    return []

  const fromItems = collectImageFiles(
    Array.from(data.items ?? []).map(item => item.kind === `file` ? item.getAsFile() : null),
  )
  if (fromItems.length > 0)
    return fromItems

  return collectImageFiles(Array.from(data.files ?? []))
}
