import { useStore } from '@/stores'
import { addPrefix, processClipboardContent } from '@/utils'
import { useClipboard } from '@vueuse/core'

export function useCopyContent() {
  const store = useStore()
  const { isDark, output, primaryColor } = storeToRefs(store)
  const { toggleDark, editorRefresh } = store

  const copyMode = useStorage(addPrefix(`copyMode`), `txt`)
  const source = ref(`")`)
  const { copy } = useClipboard({ source })

  // 复制内容
  async function handleCopyContent(mode = `html`, showTips = true) {
    let clipboardContent = ``

    await new Promise(resolve => setTimeout(resolve, 350))

    // 如果是深色模式，复制之前需要先切换到白天模式
    const isBeforeDark = isDark.value
    if (isBeforeDark) {
      toggleDark()
    }

    await nextTick()
    processClipboardContent(primaryColor.value)
    const clipboardDiv = document.getElementById(`output`)!
    clipboardDiv.focus()
    window.getSelection()!.removeAllRanges()
    const temp = clipboardDiv.innerHTML

    try {
      // 复制模式是 txt(微信公众号格式)，使用 document.createRange() 创建 Range 对象并复制内容
      if (mode === `txt`) {
        const range = document.createRange()
        range.setStartBefore(clipboardDiv.firstChild!)
        range.setEndAfter(clipboardDiv.lastChild!)
        window.getSelection()!.addRange(range)
        document.execCommand(`copy`)
        window.getSelection()!.removeAllRanges()
        clipboardContent = temp
      }
      clipboardDiv.innerHTML = output.value

      // html 模式，使用 @vueuse 的 Clipboard 模块复制内容
      if (mode === `html`) {
        await copy(temp)
        clipboardContent = temp
      }

      // 输出提示
      showTips && toast.success(
        mode === `html`
          ? `已复制 HTML 源码，请进行下一步操作。`
          : `已复制渲染后的内容到剪贴板，可直接到公众号后台粘贴。`,
      )
    }
    finally {
      if (isBeforeDark) {
        await nextTick()
        toggleDark()
      }
      editorRefresh()
    }

    return clipboardContent
  }

  return {
    copyMode,
    handleCopyContent,
  }
}
