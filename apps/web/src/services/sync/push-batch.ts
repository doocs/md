/** Keep in sync with `SYNC_PUSH_LIMITS` in apps/api/src/sync-limits.ts */
export const SYNC_PUSH_DOCUMENT_BATCH = 100
export const SYNC_PUSH_SETTING_BATCH = 80
export const SYNC_PUSH_MAX_REQUEST_BYTES = 8 * 1024 * 1024

const textEncoder = new TextEncoder()

export function utf8JsonBytes(value: unknown): number {
  return textEncoder.encode(JSON.stringify(value)).length
}

export function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0)
    return items.length ? [items] : []
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size)
    chunks.push(items.slice(i, i + size))
  return chunks
}

function fitsRequestBudget<D, S>(
  documents: D[],
  settings: S[],
  maxRequestBytes: number,
): boolean {
  return utf8JsonBytes({ documents, settings }) <= maxRequestBytes
}

export function buildPushBatches<D, S>(
  documents: D[],
  settings: S[],
  documentBatchSize = SYNC_PUSH_DOCUMENT_BATCH,
  settingBatchSize = SYNC_PUSH_SETTING_BATCH,
  maxRequestBytes = SYNC_PUSH_MAX_REQUEST_BYTES,
): { documents: D[], settings: S[] }[] {
  if (documents.length === 0 && settings.length === 0)
    return []

  const batches: { documents: D[], settings: S[] }[] = []
  let docIndex = 0
  let settingIndex = 0

  while (docIndex < documents.length || settingIndex < settings.length) {
    const batchDocuments: D[] = []
    const batchSettings: S[] = []

    while (docIndex < documents.length && batchDocuments.length < documentBatchSize) {
      const nextDocuments = [...batchDocuments, documents[docIndex]!]
      if (!fitsRequestBudget(nextDocuments, batchSettings, maxRequestBytes))
        break
      batchDocuments.push(documents[docIndex]!)
      docIndex++
    }

    while (settingIndex < settings.length && batchSettings.length < settingBatchSize) {
      const nextSettings = [...batchSettings, settings[settingIndex]!]
      if (!fitsRequestBudget(batchDocuments, nextSettings, maxRequestBytes))
        break
      batchSettings.push(settings[settingIndex]!)
      settingIndex++
    }

    if (batchDocuments.length === 0 && batchSettings.length === 0) {
      if (docIndex < documents.length)
        batchDocuments.push(documents[docIndex++]!)
      else
        batchSettings.push(settings[settingIndex++]!)
    }

    batches.push({ documents: batchDocuments, settings: batchSettings })
  }

  return batches
}
