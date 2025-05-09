import type { Editor } from 'codemirror'
import type { ComponentPublicInstance } from 'vue'
import { nextTick, reactive, ref, watch } from 'vue'
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
  const AIPolishBtnRef = ref<ComponentPublicInstance<BtnRef>>()
  const AIPolishPopoverRef = ref<ComponentPublicInstance<PopoverRef>>()

  const selectedText = ref(``)
  const position = reactive({ top: 0, left: 0 })

  const isDragging = ref(false)
  const dragStart = reactive({ x: 0, y: 0, left: 0, top: 0 })
  const baseMargin = 10

  function closeAll() {
    AIPolishPopoverRef.value?.close()
    AIPolishBtnRef.value?.close()
  }

  async function calcPos(left: number, top: number) {
    await nextTick()
    const popEl = AIPolishPopoverRef.value?.$el.getBoundingClientRect()
    if (!popEl)
      return

    const maxLeft = window.innerWidth - popEl.width - baseMargin
    const maxTop = window.innerHeight - popEl.height - baseMargin

    position.left = Math.min(Math.max(baseMargin, left), maxLeft)
    position.top = Math.min(Math.max(baseMargin, top), maxTop)
  }

  function startDrag(e: MouseEvent) {
    const header = (e.target as HTMLElement).closest(`.popover-header`)
    if (!header)
      return

    isDragging.value = true
    dragStart.x = e.clientX
    dragStart.y = e.clientY
    dragStart.left = position.left
    dragStart.top = position.top

    nextTick(() => {
      document.addEventListener(`mousemove`, onDrag)
      document.addEventListener(`mouseup`, stopDrag)
    })
  }

  function onDrag(e: MouseEvent) {
    if (!isDragging.value)
      return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    calcPos(dragStart.left + dx, dragStart.top + dy)
  }

  function stopDrag() {
    isDragging.value = false
    document.removeEventListener(`mousemove`, onDrag)
    document.removeEventListener(`mouseup`, stopDrag)
  }

  function initPolishEvent(editor: Editor) {
    // Hide on any new mouse down (start of selection or click)
    editor.on(`mousedown`, () => closeAll())

    // Show button after mouse up when selection is complete
    const wrapper = editor.getWrapperElement()
    wrapper.addEventListener(`mouseup`, (e) => {
      setTimeout(() => {
        const text = editor.getSelection()?.trim() || ``
        selectedText.value = text
        if (text) {
          position.left = e.clientX
          position.top = e.clientY
          AIPolishBtnRef.value?.show()
        }
        else {
          closeAll()
        }
      }, 0)
    })

    // Update content in toolbox when selection changes while visible
    editor.on(`cursorActivity`, () => {
      const text = editor.getSelection()?.trim() || ``
      if (AIPolishPopoverRef.value?.visible) {
        if (text) {
          // update selection and reposition within toolbox bounds
          selectedText.value = text
          calcPos(position.left, position.top)
        }
      }
    })

    // Handle Select-All explicitly
    editor.on(`keydown`, (_, event: KeyboardEvent) => {
      const isSelectAll = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === `a`
      if (!isSelectAll)
        return
      setTimeout(() => {
        const raw = editor.getValue() || ``
        const cleaned = raw.trim()
        if (cleaned) {
          selectedText.value = cleaned
          const rect = editor.getWrapperElement().getBoundingClientRect()
          position.left = rect.right - 50
          position.top = rect.top + rect.height / 2
          AIPolishBtnRef.value?.show()
        }
        else {
          closeAll()
        }
      }, 0)
    })
  }

  // Hide if programmatically cleared
  watch(selectedText, (val) => {
    if (!val && !AIPolishPopoverRef.value?.visible)
      closeAll()
  })

  return {
    AIPolishBtnRef,
    AIPolishPopoverRef,
    selectedText,
    position,
    isDragging,
    initPolishEvent,
    startDrag,
    closeAll,
    calcPos,
  }
}

export { AIPolishButton, AIPolishPopover, useAIPolish }
