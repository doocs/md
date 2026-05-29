import type { Text } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import type { MaybeRefOrGetter, Ref } from 'vue'

interface SourceBlock {
  startLine: number
  endLine: number
}

/**
 * 同步滚动：编辑器滚动时同步预览区，预览区滚动时同步编辑器。
 *
 * 使用基于块的映射（而非简单的像素比例），解决两端内容量差异巨大时
 * 同步不准的问题。核心思路：
 *   1. 源文档按空行分隔为逻辑"块"
 *   2. 预览 DOM 中提取对应的块级元素
 *   3. 通过比例索引映射两端
 *   4. 滚动时定位到对应块
 */
export function useScrollSync(
  codeMirrorViewRef: MaybeRefOrGetter<EditorView | null>,
  previewContainerRef: MaybeRefOrGetter<HTMLElement | null>,
  enableScrollSync: Ref<boolean>,
) {
  let isSyncingFromEditor = false
  let isSyncingFromPreview = false

  // ── Echo-prevention: two complementary guards ────────────────────────────
  //
  // When we programmatically change scrollTop on one side to mirror the other,
  // the browser fires a "echo" scroll event on that element which must not
  // trigger a reverse sync (that would cause an infinite feedback loop).
  //
  // Guard 1 – boolean flag + double-RAF reset
  //   Chrome fires the echo synchronously (same call-stack), so the flag is
  //   still true when the echo fires → blocked.  Firefox follows the spec and
  //   queues the echo as a task.  The browser's rendering step (double-RAF)
  //   runs *before* that task queue entry, so we need two frames to keep the
  //   flag raised long enough.
  //
  // Guard 2 – last-set position tracker
  //   Some Firefox versions also emit a secondary "layout-adjustment" scroll
  //   event from CodeMirror's virtual-rendering pass that can arrive after
  //   the double-RAF resets the flag.  We record the exact scrollTop we wrote
  //   and reject any incoming scroll event within ±1.5 px of that value.
  // ─────────────────────────────────────────────────────────────────────────
  let lastSetPreviewScrollTop: number | null = null
  let lastSetEditorScrollTop: number | null = null

  function resetAfterTwoFrames(fn: () => void) {
    requestAnimationFrame(() => requestAnimationFrame(fn))
  }

  // ============================================================
  // 源文档块解析（缓存以文档对象为 key）
  // ============================================================
  let cachedDoc: Text | null = null
  let cachedSourceBlocks: SourceBlock[] | null = null

  function parseSourceBlocks(doc: Text): SourceBlock[] {
    const blocks: SourceBlock[] = []
    let blockStart = -1

    for (let i = 1; i <= doc.lines; i++) {
      const isEmpty = doc.line(i).text.trim() === ''
      if (!isEmpty && blockStart === -1) {
        blockStart = i
      }
      else if (isEmpty && blockStart !== -1) {
        blocks.push({ startLine: blockStart, endLine: i - 1 })
        blockStart = -1
      }
    }
    if (blockStart !== -1) {
      blocks.push({ startLine: blockStart, endLine: doc.lines })
    }
    return blocks
  }

  function getSourceBlocks(doc: Text): SourceBlock[] {
    if (cachedDoc === doc && cachedSourceBlocks)
      return cachedSourceBlocks
    cachedDoc = doc
    cachedSourceBlocks = parseSourceBlocks(doc)
    return cachedSourceBlocks
  }

  // ============================================================
  // 预览块元素提取（用 MutationObserver + 版本号代替 innerHTML 缓存 key）
  // ============================================================
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
    // 懒初始化：若 watchEffect 首次运行时 #output 尚未就绪，在此补偿
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

      // 仅跳过阅读时间 blockquote（通过 class 判断，避免误删用户正文首个引用块）
      if (tag === 'BLOCKQUOTE' && (child as HTMLElement).classList.contains('md-blockquote'))
        continue

      // 遇到脚注区域停止收集（结构特征判断，不依赖文本，避免与用户自定义 H4 冲突）
      if (tag === 'H4' && (child as HTMLElement).dataset.heading === 'true') {
        const next = child.nextElementSibling
        if (next && (next as HTMLElement).classList.contains('footnotes'))
          break
      }
      if ((child as HTMLElement).classList.contains('footnotes'))
        break

      blocks.push(child as HTMLElement)
    }

    // 批量计算各块相对 preview 容器的偏移量，仅在内容变化时执行（非每次滚动）
    const previewRect = preview.getBoundingClientRect()
    const offsetTops = blocks.map(el =>
      el.getBoundingClientRect().top - previewRect.top + preview.scrollTop,
    )

    cachedPreviewVersion = previewVersion
    cachedPreviewBlocks = blocks
    cachedPreviewOffsetTops = offsetTops
    return { blocks, offsetTops }
  }

  // ============================================================
  // 映射辅助
  // ============================================================
  function sourceBlockIndexForLine(
    sourceBlocks: SourceBlock[],
    lineNo: number,
  ): number {
    for (let i = sourceBlocks.length - 1; i >= 0; i--) {
      if (sourceBlocks[i].startLine <= lineNo)
        return i
    }
    return 0
  }

  function sourceLineForBlockIndex(
    sourceBlocks: SourceBlock[],
    blockIndex: number,
  ): number {
    if (sourceBlocks.length === 0)
      return 1
    const idx = Math.min(blockIndex, sourceBlocks.length - 1)
    return sourceBlocks[idx].startLine
  }

  /**
   * 按比例将源块索引映射到预览块索引。
   * 用 Math.round 使映射更精准。
   */
  function mapBlockIndex(
    index: number,
    sourceTotal: number,
    targetTotal: number,
  ): number {
    if (sourceTotal <= 1 || targetTotal <= 1)
      return Math.round((index / Math.max(sourceTotal - 1, 1)) * Math.max(targetTotal - 1, 1))
    return Math.round((index / (sourceTotal - 1)) * (targetTotal - 1))
  }

  // ============================================================
  // 编辑器 → 预览
  // ============================================================
  function onEditorScroll() {
    if (!enableScrollSync.value || isSyncingFromPreview)
      return

    const view = toValue(codeMirrorViewRef)
    const preview = toValue(previewContainerRef)
    if (!view || !preview)
      return

    const scroller = view.scrollDOM

    // Guard 2: catch delayed echo / CodeMirror adjustment events (Firefox)
    if (lastSetEditorScrollTop !== null) {
      if (Math.abs(scroller.scrollTop - lastSetEditorScrollTop) < 1.5)
        return
      // User scrolled to a genuinely different position — clear stale tracker.
      lastSetEditorScrollTop = null
    }

    const scrollable = scroller.scrollHeight - scroller.clientHeight
    if (scrollable <= 0)
      return

    isSyncingFromEditor = true

    // 边缘吸附：滚到顶 / 底时直接强制对齐，避免块映射偏差
    if (scroller.scrollTop <= 0) {
      lastSetPreviewScrollTop = 0
      preview.scrollTop = 0
      resetAfterTwoFrames(() => { isSyncingFromEditor = false; lastSetPreviewScrollTop = null })
      return
    }
    if (scroller.scrollTop >= scrollable) {
      const t = preview.scrollHeight
      lastSetPreviewScrollTop = t
      preview.scrollTop = t
      resetAfterTwoFrames(() => { isSyncingFromEditor = false; lastSetPreviewScrollTop = null })
      return
    }

    const sourceBlocks = getSourceBlocks(view.state.doc)
    if (sourceBlocks.length === 0) {
      isSyncingFromEditor = false
      return
    }

    // 找到编辑器顶部可见行号
    const lineBlock = view.lineBlockAtHeight(scroller.scrollTop)
    const lineNo = view.state.doc.lineAt(lineBlock.from).number

    const srcIndex = sourceBlockIndexForLine(sourceBlocks, lineNo)

    // 获取预览块并映射
    const { blocks: previewBlocks, offsetTops: previewOffsetTops } = getPreviewBlockElements(preview)
    if (previewBlocks.length === 0) {
      isSyncingFromEditor = false
      return
    }

    const previewIndex = mapBlockIndex(srcIndex, sourceBlocks.length, previewBlocks.length)
    const targetIndex = Math.min(previewIndex, previewBlocks.length - 1)
    const targetScrollTop = previewOffsetTops[targetIndex]
    lastSetPreviewScrollTop = targetScrollTop
    preview.scrollTop = targetScrollTop
    resetAfterTwoFrames(() => { isSyncingFromEditor = false; lastSetPreviewScrollTop = null })
  }

  // ============================================================
  // 预览 → 编辑器
  // ============================================================
  function onPreviewScroll() {
    if (!enableScrollSync.value || isSyncingFromEditor)
      return

    const view = toValue(codeMirrorViewRef)
    const preview = toValue(previewContainerRef)
    if (!view || !preview)
      return

    // Guard 2: catch delayed echo / CodeMirror adjustment events (Firefox)
    if (lastSetPreviewScrollTop !== null) {
      if (Math.abs(preview.scrollTop - lastSetPreviewScrollTop) < 1.5)
        return
      lastSetPreviewScrollTop = null
    }

    const previewScrollable = preview.scrollHeight - preview.clientHeight
    if (previewScrollable <= 0)
      return

    isSyncingFromPreview = true

    // 边缘吸附：滚到顶 / 底时直接强制对齐，避免块映射偏差
    if (preview.scrollTop <= 0) {
      lastSetEditorScrollTop = 0
      view.scrollDOM.scrollTop = 0
      resetAfterTwoFrames(() => { isSyncingFromPreview = false; lastSetEditorScrollTop = null })
      return
    }
    if (preview.scrollTop >= previewScrollable) {
      const t = view.scrollDOM.scrollHeight
      lastSetEditorScrollTop = t
      view.scrollDOM.scrollTop = t
      resetAfterTwoFrames(() => { isSyncingFromPreview = false; lastSetEditorScrollTop = null })
      return
    }

    const { blocks: previewBlocks, offsetTops: previewOffsetTops } = getPreviewBlockElements(preview)
    if (previewBlocks.length === 0) {
      isSyncingFromPreview = false
      return
    }

    // 二分查找：找最后一个 offsetTop ≤ scrollTop 的块（顶部可见块），避免 O(n) 强制布局
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
      lastSetEditorScrollTop = blockInfo.top
      view.scrollDOM.scrollTop = blockInfo.top
    }
    resetAfterTwoFrames(() => { isSyncingFromPreview = false; lastSetEditorScrollTop = null })
  }

  // ============================================================
  // 绑定/解绑事件
  // ============================================================
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
