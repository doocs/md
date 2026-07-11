import type { Text } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import type { MaybeRefOrGetter, Ref } from 'vue'
import type { SourceBlock } from '@/lib/preview/scroll-sync-blocks'
import {
  mapBlockIndex,
  parseSourceBlocks,
  sourceBlockIndexForLine,
  sourceLineForBlockIndex,
} from '@/lib/preview/scroll-sync-blocks'

/**
 * Bidirectional scroll sync between editor and preview.
 *
 * Uses block-based mapping (not simple pixel ratio) so large content skew
 * between panes stays accurate:
 *   1. Split source doc into logical blocks on blank lines
 *   2. Collect matching block-level elements from preview DOM
 *   3. Map indices proportionally between panes
 *   4. Scroll to the mapped block on each side
 */
export function useScrollSync(
  codeMirrorViewRef: MaybeRefOrGetter<EditorView | null>,
  previewContainerRef: MaybeRefOrGetter<HTMLElement | null>,
  enableScrollSync: Ref<boolean>,
) {
  let isSyncingFromEditor = false
  let isSyncingFromPreview = false
  // Filter bounce scroll events via programmatic target values (not a time window):
  // Chrome/Firefox defer scroll events from scrollTop assignment to the next frame,
  // after rAF clears flags — compare positions to intercept without blocking user scroll.
  let pendingPreviewScrollTop = -1
  let pendingEditorScrollTop = -1

  let cachedDoc: Text | null = null
  let cachedSourceBlocks: SourceBlock[] | null = null

  function getSourceBlocks(doc: Text): SourceBlock[] {
    if (cachedDoc === doc && cachedSourceBlocks)
      return cachedSourceBlocks
    cachedDoc = doc
    cachedSourceBlocks = parseSourceBlocks(doc)
    return cachedSourceBlocks
  }

  let previewVersion = 0
  let cachedPreviewVersion = -1
  let cachedPreviewBlocks: HTMLElement[] = []
  let cachedPreviewOffsetTops: number[] = []
  let mutationObserver: MutationObserver | null = null

  function setupMutationObserver(preview: HTMLElement) {
    if (mutationObserver)
      return
    const output = preview.querySelector('#output')
    if (!output)
      return
    mutationObserver = new MutationObserver(() => { previewVersion++ })
    mutationObserver.observe(output, { childList: true, subtree: true })
  }

  function teardownMutationObserver() {
    mutationObserver?.disconnect()
    mutationObserver = null
  }

  function getPreviewBlockElements(preview: HTMLElement): { blocks: HTMLElement[], offsetTops: number[] } {
    // Lazy init when #output was not ready on first watchEffect run
    if (!mutationObserver)
      setupMutationObserver(preview)

    if (cachedPreviewVersion === previewVersion)
      return { blocks: cachedPreviewBlocks, offsetTops: cachedPreviewOffsetTops }

    const output = preview.querySelector('#output')
    if (!output) {
      cachedPreviewVersion = previewVersion
      cachedPreviewBlocks = []
      cachedPreviewOffsetTops = []
      return { blocks: [], offsetTops: [] }
    }

    const container = output.firstElementChild
    if (!container) {
      cachedPreviewVersion = previewVersion
      cachedPreviewBlocks = []
      cachedPreviewOffsetTops = []
      return { blocks: [], offsetTops: [] }
    }

    const blocks: HTMLElement[] = []

    for (const child of container.children) {
      const tag = child.tagName

      if (tag === 'STYLE')
        continue

      // Skip reading-time blockquote only (class-based; avoids dropping user blockquotes)
      if (tag === 'BLOCKQUOTE' && (child as HTMLElement).classList.contains('md-blockquote'))
        continue

      // Stop at footnotes (structural; no text match to avoid custom H4 conflicts)
      if (tag === 'H4' && (child as HTMLElement).dataset.heading === 'true') {
        const next = child.nextElementSibling
        if (next && (next as HTMLElement).classList.contains('footnotes'))
          break
      }
      if ((child as HTMLElement).classList.contains('footnotes'))
        break

      blocks.push(child as HTMLElement)
    }

    const previewRect = preview.getBoundingClientRect()
    const offsetTops = blocks.map(el =>
      el.getBoundingClientRect().top - previewRect.top + preview.scrollTop,
    )

    cachedPreviewVersion = previewVersion
    cachedPreviewBlocks = blocks
    cachedPreviewOffsetTops = offsetTops
    return { blocks, offsetTops }
  }

  function onEditorScroll() {
    if (!enableScrollSync.value || isSyncingFromPreview)
      return

    const view = toValue(codeMirrorViewRef)
    const preview = toValue(previewContainerRef)
    if (!view || !preview)
      return

    const scroller = view.scrollDOM
    const scrollable = scroller.scrollHeight - scroller.clientHeight
    if (scrollable <= 0)
      return

    if (pendingEditorScrollTop >= 0 && Math.abs(scroller.scrollTop - pendingEditorScrollTop) < 2) {
      pendingEditorScrollTop = -1
      return
    }
    pendingEditorScrollTop = -1

    isSyncingFromEditor = true

    if (scroller.scrollTop <= 0) {
      pendingPreviewScrollTop = 0
      preview.scrollTop = 0
      requestAnimationFrame(() => { isSyncingFromEditor = false })
      return
    }
    if (scroller.scrollTop >= scrollable) {
      const maxPreviewScrollTop = preview.scrollHeight - preview.clientHeight
      pendingPreviewScrollTop = maxPreviewScrollTop
      preview.scrollTop = maxPreviewScrollTop
      requestAnimationFrame(() => { isSyncingFromEditor = false })
      return
    }

    const sourceBlocks = getSourceBlocks(view.state.doc)
    if (sourceBlocks.length === 0) {
      isSyncingFromEditor = false
      return
    }

    const lineBlock = view.lineBlockAtHeight(scroller.scrollTop)
    const lineNo = view.state.doc.lineAt(lineBlock.from).number

    const srcIndex = sourceBlockIndexForLine(sourceBlocks, lineNo)

    const { blocks: previewBlocks, offsetTops: previewOffsetTops } = getPreviewBlockElements(preview)
    if (previewBlocks.length === 0) {
      isSyncingFromEditor = false
      return
    }

    const previewIndex = mapBlockIndex(srcIndex, sourceBlocks.length, previewBlocks.length)
    const targetIndex = Math.min(previewIndex, previewBlocks.length - 1)
    const maxPreviewScrollTop = preview.scrollHeight - preview.clientHeight
    const targetScrollTop = Math.min(previewOffsetTops[targetIndex], maxPreviewScrollTop)
    pendingPreviewScrollTop = targetScrollTop
    preview.scrollTop = targetScrollTop
    requestAnimationFrame(() => { isSyncingFromEditor = false })
  }

  function onPreviewScroll() {
    if (!enableScrollSync.value || isSyncingFromEditor)
      return

    const view = toValue(codeMirrorViewRef)
    const preview = toValue(previewContainerRef)
    if (!view || !preview)
      return

    if (pendingPreviewScrollTop >= 0 && Math.abs(preview.scrollTop - pendingPreviewScrollTop) < 2) {
      pendingPreviewScrollTop = -1
      return
    }
    pendingPreviewScrollTop = -1

    const previewScrollable = preview.scrollHeight - preview.clientHeight
    if (previewScrollable <= 0)
      return

    isSyncingFromPreview = true

    if (preview.scrollTop <= 0) {
      pendingEditorScrollTop = 0
      view.scrollDOM.scrollTop = 0
      requestAnimationFrame(() => { isSyncingFromPreview = false })
      return
    }
    if (preview.scrollTop >= previewScrollable) {
      const maxEditorScrollTop = view.scrollDOM.scrollHeight - view.scrollDOM.clientHeight
      pendingEditorScrollTop = maxEditorScrollTop
      view.scrollDOM.scrollTop = maxEditorScrollTop
      requestAnimationFrame(() => { isSyncingFromPreview = false })
      return
    }

    const { blocks: previewBlocks, offsetTops: previewOffsetTops } = getPreviewBlockElements(preview)
    if (previewBlocks.length === 0) {
      isSyncingFromPreview = false
      return
    }

    const scrollTop = preview.scrollTop
    let lo = 0
    let hi = previewOffsetTops.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (previewOffsetTops[mid] <= scrollTop)
        lo = mid
      else
        hi = mid - 1
    }
    const visibleBlockIndex = lo

    const sourceBlocks = getSourceBlocks(view.state.doc)
    if (sourceBlocks.length === 0) {
      isSyncingFromPreview = false
      return
    }

    const srcIndex = mapBlockIndex(visibleBlockIndex, previewBlocks.length, sourceBlocks.length)
    const lineNo = sourceLineForBlockIndex(sourceBlocks, srcIndex)
    const line = view.state.doc.line(lineNo)

    const blockInfo = view.lineBlockAt(line.from)
    if (blockInfo) {
      const maxEditorScrollTop = view.scrollDOM.scrollHeight - view.scrollDOM.clientHeight
      const targetScrollTop = Math.min(blockInfo.top, maxEditorScrollTop)
      pendingEditorScrollTop = targetScrollTop
      view.scrollDOM.scrollTop = targetScrollTop
    }
    requestAnimationFrame(() => { isSyncingFromPreview = false })
  }

  watchEffect((onCleanup) => {
    if (!enableScrollSync.value)
      return

    const view = toValue(codeMirrorViewRef)
    const preview = toValue(previewContainerRef)
    if (!view || !preview)
      return

    setupMutationObserver(preview)
    const scroller = view.scrollDOM
    scroller.addEventListener(`scroll`, onEditorScroll, { passive: true })
    preview.addEventListener(`scroll`, onPreviewScroll, { passive: true })

    onCleanup(() => {
      scroller.removeEventListener(`scroll`, onEditorScroll)
      preview.removeEventListener(`scroll`, onPreviewScroll)
      teardownMutationObserver()
    })
  })
}
