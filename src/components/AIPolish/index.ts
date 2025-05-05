import type { Editor } from 'codemirror'
import AIPolishButton from './AIPolishButton.vue'
import AIPolishPopover from './AIPolishPopover.vue'

interface BtnRef {
  visible: boolean
  show: () => void
  close: () => void
}

interface PopoverRef {
  visible: boolean
  show: () => void
  close: () => void
  adjustPosition: () => void
}

function useAIPolish() {
  const AIPolishBtnRef = useTemplateRef<ComponentPublicInstance<BtnRef> >(`AIPolishBtnRef`)
  const AIPolishPopoverRef = useTemplateRef<ComponentPublicInstance<PopoverRef>>(`AIPolishPopoverRef`)

  const selectedText = ref(``)
  const position = reactive({
    top: 0,
    left: 0,
  })

  // 拖拽相关状态
  const isDragging = ref(false)
  const dragStartX = ref(0)
  const dragStartY = ref(0)
  const dragStartLeft = ref(0)
  const dragStartTop = ref(0)

  function startDrag(e: MouseEvent) {
    if (e.target !== AIPolishPopoverRef.value) {
      const header = (e.target as HTMLElement).closest(`.popover-header`)
      if (!header)
        return
    }

    isDragging.value = true
    dragStartX.value = e.clientX
    dragStartY.value = e.clientY
    dragStartLeft.value = position.left
    dragStartTop.value = position.top

    // 确保能获取到元素尺寸
    nextTick(() => {
      document.addEventListener(`mousemove`, onDrag)
      document.addEventListener(`mouseup`, stopDrag)
    })
  }

  function onDrag(e: MouseEvent) {
    if (!isDragging.value)
      return

    const deltaX = e.clientX - dragStartX.value
    const deltaY = e.clientY - dragStartY.value

    // 计算新的位置
    const newLeft = dragStartLeft.value + deltaX
    const newTop = dragStartTop.value + deltaY

    // 获取视窗尺寸和元素尺寸
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const popoverWidth = AIPolishPopoverRef.value?.$el.offsetWidth || 420 // 使用默认宽度
    const popoverHeight = AIPolishPopoverRef.value?.$el.offsetHeight || 300 // 使用默认高度

    // 添加边距，避免贴边
    const margin = 10

    // 计算最大可移动范围
    const maxLeft = viewportWidth - popoverWidth - margin
    const maxTop = viewportHeight - popoverHeight - margin

    // 边界检查，确保弹窗不会超出视窗范围
    position.left = Math.max(margin, Math.min(newLeft, maxLeft))
    position.top = Math.max(margin, Math.min(newTop, maxTop))
  }

  function stopDrag() {
    isDragging.value = false
    document.removeEventListener(`mousemove`, onDrag)
    document.removeEventListener(`mouseup`, stopDrag)
  }

  function initPolishEvent(editor: Editor) {
    editor.on(`cursorActivity`, () => {
      const text = editor?.getSelection()
      if (text && !AIPolishPopoverRef.value?.visible) {
        const to = editor?.getCursor(`to`)
        const line = editor.getLine(to.line)
        const isLineEnd = to.ch === line.length

        if (isLineEnd) {
          // 如果是行尾，使用行尾字符的坐标
          const coords = editor.charCoords({ line: to.line, ch: line.length - 1 }, `page`)
          position.left = coords.right
          position.top = coords.bottom
        }
        else {
          const coords = editor.charCoords(to, `page`)
          position.left = coords.left
          position.top = coords.bottom
        }
      }
    })

    editor.on(`mousedown`, () => {
      AIPolishBtnRef.value?.visible && AIPolishBtnRef.value?.close()
    })

    editor.getWrapperElement().addEventListener(`mouseup`, () => {
      const text = editor?.getSelection()?.trim()
      if (text) {
        selectedText.value = text
        !AIPolishPopoverRef.value?.visible && AIPolishBtnRef.value?.show()
      }
    })
  }

  async function adjustPosition() {
    await nextTick()
    if (!AIPolishPopoverRef.value)
      return

    const rect = AIPolishPopoverRef.value.$el.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const bottomSpace = windowHeight - rect.bottom

    if (bottomSpace <= 0) {
      position.top = position.top + bottomSpace - 20
    }
  }

  return {
    AIPolishBtnRef,
    AIPolishPopoverRef,
    selectedText,
    position,
    isDragging,
    startDrag,
    initPolishEvent,
    adjustPosition,
  }
}

export { AIPolishButton, AIPolishPopover, useAIPolish }
