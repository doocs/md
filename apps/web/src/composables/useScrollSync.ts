import type { EditorView } from '@codemirror/view'
import type { MaybeRefOrGetter, Ref } from 'vue'

/**
 * 同步滚动：编辑器滚动时同步预览区，预览区滚动时同步编辑器。
 * 使用比例定位，避免因图片/代码块高度差异导致的偏移问题。
 */
export function useScrollSync(
  codeMirrorViewRef: MaybeRefOrGetter<EditorView | null>,
  previewContainerRef: MaybeRefOrGetter<HTMLElement | null>,
  enableScrollSync: Ref<boolean>,
) {
  // 互斥标志，防止两端互相触发无限循环
  let isSyncingFromEditor = false
  let isSyncingFromPreview = false

  function onEditorScroll() {
    if (!enableScrollSync.value || isSyncingFromPreview)
      return

    const view = toValue(codeMirrorViewRef)
    const preview = toValue(previewContainerRef)
    if (!view || !preview)
      return

    const scroller = view.scrollDOM
    const maxEditor = scroller.scrollHeight - scroller.clientHeight
    if (maxEditor <= 0)
      return

    const ratio = scroller.scrollTop / maxEditor
    const maxPreview = preview.scrollHeight - preview.clientHeight
    if (maxPreview <= 0)
      return

    isSyncingFromEditor = true
    preview.scrollTop = ratio * maxPreview
    requestAnimationFrame(() => {
      isSyncingFromEditor = false
    })
  }

  function onPreviewScroll() {
    if (!enableScrollSync.value || isSyncingFromEditor)
      return

    const view = toValue(codeMirrorViewRef)
    const preview = toValue(previewContainerRef)
    if (!view || !preview)
      return

    const scroller = view.scrollDOM
    const maxPreview = preview.scrollHeight - preview.clientHeight
    if (maxPreview <= 0)
      return

    const ratio = preview.scrollTop / maxPreview
    const maxEditor = scroller.scrollHeight - scroller.clientHeight
    if (maxEditor <= 0)
      return

    isSyncingFromPreview = true
    scroller.scrollTop = ratio * maxEditor
    requestAnimationFrame(() => {
      isSyncingFromPreview = false
    })
  }

  // 当开关或元素变化时，重新绑定/解绑监听器
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
