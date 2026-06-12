/**
 * 组件暗色模式 CSS 变量注入
 *
 * 使用独立样式元素（id="md-comp-dark"），不会被 getThemeStyles() 读取，
 * 因此不会污染复制到微信公众号的 HTML 剪贴板内容。
 *
 * 暗色变量通过 .dark 选择器激活（Tailwind 暗色模式将 .dark 挂载在 <html> 上），
 * 自动覆盖 #output 预览区和组件对话框预览区，无需分别处理。
 *
 * 组件内联样式使用 var(--md-comp-xxx, lightFallback) 格式：
 *   - 编辑器暗色模式：.dark 选择器激活深色变量 → 深色显示 ✓
 *   - 复制到微信（不含此样式元素）：变量未定义 → 使用浅色回退值 ✓
 */

const COMP_DARK_VARS_CSS = `.dark {
  --md-comp-bg: #1e1e1e;
  --md-comp-bg-secondary: #2d2d2d;
  --md-comp-bg-stripe: #2a2a2a;
  --md-comp-text-primary: #e0e0e0;
  --md-comp-text-secondary: #b0b0b0;
  --md-comp-text-tertiary: #888;
  --md-comp-border-default: #404040;
  --md-comp-border-light: #333;
}`

/**
 * 初始化组件暗色模式 CSS 变量（页面加载时调用一次）。
 * 注入 <style id="md-comp-dark"> 到 <head>，通过 .dark 选择器在暗色模式自动激活。
 */
export function initComponentDarkVars(): void {
  if (typeof document === `undefined`)
    return
  if (document.getElementById(`md-comp-dark`))
    return
  const style = document.createElement(`style`)
  style.id = `md-comp-dark`
  style.textContent = COMP_DARK_VARS_CSS
  document.head.appendChild(style)
}
