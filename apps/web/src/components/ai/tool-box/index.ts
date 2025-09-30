import type { ComponentPublicInstance } from 'vue'
import { StateEffect } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import AIPolishButton from './ToolBoxButton.vue'
import AIPolishPopover from './ToolBoxPopover.vue'

/* ---------- 组件引用类型 ---------- */
interface BtnRef {
  visible: boolean
  show: () => void
  close: () => void
}
interface PopoverRef {
  visible: boolean
  show: () => void
  close: () => void
  recalcPos: () => void
}

/* ---------- 主组合式函数 ---------- */
function useAIPolish() {
  /* refs/状态 */
  const AIPolishBtnRef = ref<ComponentPublicInstance<BtnRef>>()
  const AIPolishPopoverRef = ref<ComponentPublicInstance<PopoverRef>>()

  const selectedText = ref(``)
  const position = reactive({ top: 0, left: 0 })

  /* 拖拽相关 */
  const isDragging = ref(false)
  const dragStart = reactive({ x: 0, y: 0, left: 0, top: 0 })
  const baseMargin = 10

  /* =============== 辅助关闭方法 =============== */
  /** 只隐藏按钮 */
  function closeBtn() {
    AIPolishBtnRef.value?.close?.()
  }
  /** 同时隐藏按钮和 Popover */
  function closeAll() {
    closeBtn()
    AIPolishPopoverRef.value?.close?.()
  }

  /* 计算/限制弹层位置 */
  async function calcPos(left: number, top: number) {
    await nextTick()
    const popEl = AIPolishPopoverRef.value?.$el?.getBoundingClientRect()
    if (!popEl)
      return
    position.left = Math.min(
      Math.max(baseMargin, left),
      window.innerWidth - popEl.width - baseMargin,
    )
    position.top = Math.min(
      Math.max(baseMargin, top),
      window.innerHeight - popEl.height - baseMargin,
    )
  }

  /* =============== 拖拽处理 =============== */
  function startDrag(e: MouseEvent) {
    const header = (e.target as HTMLElement).closest(`.popover-header`)
    if (!header)
      return

    isDragging.value = true
    dragStart.x = e.clientX
    dragStart.y = e.clientY
    dragStart.left = position.left
    dragStart.top = position.top

    document.addEventListener(`mousemove`, onDrag)
    document.addEventListener(`mouseup`, stopDrag)
  }
  function onDrag(e: MouseEvent) {
    if (!isDragging.value)
      return
    calcPos(
      dragStart.left + (e.clientX - dragStart.x),
      dragStart.top + (e.clientY - dragStart.y),
    )
  }
  function stopDrag() {
    isDragging.value = false
    document.removeEventListener(`mousemove`, onDrag)
    document.removeEventListener(`mouseup`, stopDrag)
  }

  /* =============== CodeMirror 事件注入 =============== */
  function initPolishEvent(editorView: EditorView) {
    /* 1. 鼠标抬起：根据选区显示按钮 */
    editorView.dom.addEventListener(`mouseup`, (e: MouseEvent) => {
      setTimeout(() => {
        const selection = editorView.state.selection.main
        const text = editorView.state.doc.sliceString(selection.from, selection.to)?.trim() ?? ``
        selectedText.value = text
        if (text) {
          position.left = e.clientX
          position.top = e.clientY
          AIPolishBtnRef.value?.show?.()
        }
        else {
          closeAll()
        }
      }, 0)
    })

    /* 2. 光标移动：使用 CodeMirror v6 扩展监听选区变化 */
    const cursorActivity = EditorView.updateListener.of((update) => {
      if (update.selectionSet && AIPolishPopoverRef.value?.visible) {
        const sel = update.state.selection.main
        const text = update.state.sliceDoc(sel.from, sel.to).trim()
        if (text) {
          selectedText.value = text
          calcPos(position.left, position.top)
        }
      }

      /* 3. 内容变动：只隐藏按钮，不动 Popover */
      if (update.docChanged) {
        closeBtn()
      }
    })

    // 动态添加扩展到已有编辑器
    editorView.dispatch({
      effects: StateEffect.appendConfig.of(cursorActivity),
    })

    /* 4. 键盘事件：Select-All 例外，其余隐藏按钮 */
    editorView.dom.addEventListener(`keydown`, (event: KeyboardEvent) => {
      if (!event)
        return

      const isSelectAll
        = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === `a`

      if (isSelectAll) {
        setTimeout(() => {
          const raw = editorView.state.doc.toString() ?? ``
          const cleaned = raw.trim()
          if (cleaned) {
            selectedText.value = cleaned
            const rect = editorView.dom.getBoundingClientRect()
            position.left = rect.right - 50
            position.top = rect.top + rect.height / 2
            AIPolishBtnRef.value?.show?.()
          }
          else {
            closeAll()
          }
        }, 0)
      }
      else {
        /* 普通输入：同样只隐藏按钮 */
        closeBtn()
      }
    })
  }

  /* 选区被程序性清空时同步关闭按钮（Popover 已关则也关） */
  watch(selectedText, (v) => {
    if (!v) {
      if (AIPolishPopoverRef.value?.visible) {
        closeBtn()
      }
      else {
        closeAll()
      }
    }
  })

  /* 暴露给外部在尺寸变化时重算位置 */
  function recalcPos() {
    calcPos(position.left, position.top)
  }

  /* =============== 对外导出 =============== */
  return {
    AIPolishBtnRef,
    AIPolishPopoverRef,
    selectedText,
    position,
    isDragging,
    initPolishEvent,
    startDrag,
    closeBtn,
    closeAll,
    recalcPos,
  }
}

export { AIPolishButton, AIPolishPopover, useAIPolish }
