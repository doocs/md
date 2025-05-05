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
  recalcPos: () => void
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

  const baseMargin = 10

  // 统一的位置计算函数
  async function calcPos(targetLeft: number, targetTop: number) {
    await nextTick()
    if (!AIPolishPopoverRef.value)
      return
    const popover = AIPolishPopoverRef.value?.$el.getBoundingClientRect()
    const vW = window.innerWidth
    const vH = window.innerHeight
    const pW = popover.width
    const pH = popover.height

    // 计算最大可移动范围
    const maxLeft = vW - pW - baseMargin
    const maxTop = vH - pH - baseMargin

    // 边界检查，确保弹窗不会超出视窗范围
    position.left = Math.max(baseMargin, Math.min(targetLeft, maxLeft))
    position.top = Math.max(baseMargin, Math.min(targetTop, maxTop))
  }

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

    calcPos(newLeft, newTop)
  }

  function stopDrag() {
    isDragging.value = false
    document.removeEventListener(`mousemove`, onDrag)
    document.removeEventListener(`mouseup`, stopDrag)
  }

  function initPolishEvent(editor: Editor) {
    editor.on(`mousedown`, () => {
      try {
        AIPolishBtnRef.value?.visible && AIPolishBtnRef.value?.close()
      }
      catch (error) {
        console.error(`Error handling mousedown:`, error)
      }
    })

    editor.getWrapperElement().addEventListener(`mouseup`, (e) => {
      try {
        const text = editor?.getSelection()
        if (text && text.length > 0) { // 确保有选中内容
          selectedText.value = text.trim()
          // 获取鼠标位置
          if (!AIPolishPopoverRef.value?.visible) {
            position.left = e.clientX
            position.top = e.clientY
            AIPolishBtnRef.value?.show()
          }
        }
      }
      catch (error) {
        console.error(`Error handling selection:`, error)
      }
    })

    // 添加 ctrl+a 事件监听
    editor.on(`keydown`, (_, event) => {
      if (event.ctrlKey && event.key.toLowerCase() === `a`) {
        try {
          const wrapper = editor.getWrapperElement()
          const rect = wrapper.getBoundingClientRect()

          // 设置位置在编辑器右侧中间
          const targetLeft = rect.right - 50 // 50px 是按钮的宽度，可以根据实际情况调整
          const targetTop = rect.top + (rect.height / 2)

          position.left = targetLeft
          position.top = targetTop
          // 获取选中的文本
          const text = editor.getValue()
          if (text && text.length > 0) {
            selectedText.value = text.trim()
            AIPolishBtnRef.value?.show()
          }
        }
        catch (error) {
          console.error(`Error handling ctrl+a:`, error)
        }
      }
    })
  }

  function recalcPos() {
    calcPos(position.left, position.top)
  }

  return {
    AIPolishBtnRef,
    AIPolishPopoverRef,
    selectedText,
    position,
    isDragging,
    startDrag,
    initPolishEvent,
    recalcPos,
  }
}

export { AIPolishButton, AIPolishPopover, useAIPolish }
