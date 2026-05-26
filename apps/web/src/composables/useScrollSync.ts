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
  // 预览块元素提取（缓存以 #output 的 innerHTML 为 key）
  // ============================================================
  let cachedPreviewContent: string | null = null
  let cachedPreviewBlocks: HTMLElement[] | null = null

  function getPreviewBlockElements(preview: HTMLElement): HTMLElement[] {
    const output = preview.querySelector('#output')
    if (!output)
      return []

    // 使用 innerHTML 作为缓存 key
    const content = output.innerHTML
    if (cachedPreviewContent === content && cachedPreviewBlocks)
      return cachedPreviewBlocks

    const container = output.firstElementChild
    if (!container) {
      cachedPreviewContent = content
      cachedPreviewBlocks = []
      return []
    }

    const blocks: HTMLElement[] = []
    let skippedReadingTimeBlockquote = false

    for (const child of container.children) {
      const tag = child.tagName

      if (tag === 'STYLE')
        continue

      // 跳过阅读时间 blockquote（第一个 blockquote）
      if (tag === 'BLOCKQUOTE' && !skippedReadingTimeBlockquote) {
        skippedReadingTimeBlockquote = true
        continue
      }

      // 遇到「引用链接」标题说明进入脚注区域，停止收集
      if (tag === 'H4') {
        const text = (child as HTMLElement).textContent?.trim()
        if (text === '引用链接')
          break
      }

      blocks.push(child as HTMLElement)
    }

    cachedPreviewContent = content
    cachedPreviewBlocks = blocks
    return blocks
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
    if (scroller.scrollHeight - scroller.clientHeight <= 0)
      return

    const sourceBlocks = getSourceBlocks(view.state.doc)
    if (sourceBlocks.length === 0)
      return

    // 找到编辑器顶部可见行号
    const lineBlock = view.lineBlockAtHeight(scroller.scrollTop)
    const lineNo = view.state.doc.lineAt(lineBlock.from).number

    const srcIndex = sourceBlockIndexForLine(sourceBlocks, lineNo)

    // 获取预览块并映射
    const previewBlocks = getPreviewBlockElements(preview)
    if (previewBlocks.length === 0)
      return

    const previewIndex = mapBlockIndex(srcIndex, sourceBlocks.length, previewBlocks.length)
    const targetEl = previewBlocks[Math.min(previewIndex, previewBlocks.length - 1)]

    isSyncingFromEditor = true
    const previewRect = preview.getBoundingClientRect()
    const targetRect = targetEl.getBoundingClientRect()
    preview.scrollTop += targetRect.top - previewRect.top
    requestAnimationFrame(() => {
      isSyncingFromEditor = false
    })
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

    if (preview.scrollHeight - preview.clientHeight <= 0)
      return

    const previewBlocks = getPreviewBlockElements(preview)
    if (previewBlocks.length === 0)
      return

    // 找到预览区顶部第一个可见的块
    const previewRect = preview.getBoundingClientRect()
    let visibleBlockIndex = -1
    for (let i = 0; i < previewBlocks.length; i++) {
      const rect = previewBlocks[i].getBoundingClientRect()
      if (rect.bottom > previewRect.top) {
        visibleBlockIndex = i
        break
      }
    }
    if (visibleBlockIndex === -1)
      visibleBlockIndex = previewBlocks.length - 1

    const sourceBlocks = getSourceBlocks(view.state.doc)
    if (sourceBlocks.length === 0)
      return

    const srcIndex = mapBlockIndex(visibleBlockIndex, previewBlocks.length, sourceBlocks.length)
    const lineNo = sourceLineForBlockIndex(sourceBlocks, srcIndex)
    const line = view.state.doc.line(lineNo)

    isSyncingFromPreview = true
    const blockInfo = view.lineBlockAt(line.from)
    if (blockInfo) {
      view.scrollDOM.scrollTop = blockInfo.top
    }
    requestAnimationFrame(() => {
      isSyncingFromPreview = false
    })
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

    const scroller = view.scrollDOM
    scroller.addEventListener(`scroll`, onEditorScroll, { passive: true })
    preview.addEventListener(`scroll`, onPreviewScroll, { passive: true })

    onCleanup(() => {
      scroller.removeEventListener(`scroll`, onEditorScroll)
      preview.removeEventListener(`scroll`, onPreviewScroll)
    })
  })
}
