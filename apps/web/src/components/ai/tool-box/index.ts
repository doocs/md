import type { MonacoEditor } from '@md/shared'
import AIPolishButton from './ToolBoxButton.vue'
import AIPolishPopover from './ToolBoxPopover.vue'

/* ---------- 简化的组合式函数 ---------- */
function useAIPolish() {
  // 现在工具箱已移到侧边栏，不再需要复杂的位置计算和事件监听
  // 保留最基本的功能以维持兼容性

  const selectedText = ref(``)

  // 获取当前编辑器选中文本的简单函数
  function getCurrentSelection(editor: MonacoEditor.IStandaloneCodeEditor | null): string {
    try {
      if (!editor)
        return ``
      const selection = editor.getSelection()
      const model = editor.getModel()
      if (!selection || !model)
        return ``
      return model.getValueInRange(selection).trim()
    }
    catch {
      return ``
    }
  }

  /* =============== 简化的对外导出 =============== */
  return {
    selectedText,
    getCurrentSelection,
  }
}

export { AIPolishButton, AIPolishPopover, useAIPolish }
