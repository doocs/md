import { hasValidImageSuffix, isAcceptedImageType, normalizePastedImageFile } from './validate-image'

function isPasteableImage(file: File): boolean {
  return isAcceptedImageType(file.type) || hasValidImageSuffix(file.name)
}

/** Collect image files from a paste/drop DataTransfer (items + files). */
export function collectClipboardImages(data: DataTransfer | null | undefined): File[] {
  if (!data)
    return []

  const files: File[] = []
  const seen = new Set<File>()

  const push = (file: File | null) => {
    if (!file || seen.has(file) || !isPasteableImage(file))
      return
    seen.add(file)
    files.push(normalizePastedImageFile(file))
  }

  for (const item of Array.from(data.items ?? [])) {
    if (item.kind === `file`)
      push(item.getAsFile())
  }

  for (const file of Array.from(data.files ?? []))
    push(file)

  return files
}
