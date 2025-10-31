/**
 * 主题样式注入器
 * 负责管理动态注入的 <style> 标签
 */

/**
 * 主题样式注入器类
 */
export class ThemeInjector {
  private styleElement: HTMLStyleElement | null = null
  private readonly styleId = `md-theme`

  /**
   * 注入或更新主题样式
   * @param cssContent - CSS 内容
   */
  inject(cssContent: string): void {
    if (!this.styleElement) {
      this.styleElement = document.createElement(`style`)
      this.styleElement.id = this.styleId
      document.head.appendChild(this.styleElement)
    }
    this.styleElement.textContent = cssContent
  }

  /**
   * 移除主题样式
   */
  remove(): void {
    if (this.styleElement) {
      this.styleElement.remove()
      this.styleElement = null
    }
  }

  /**
   * 检查是否已注入
   */
  isInjected(): boolean {
    return this.styleElement !== null
  }
}

// 单例模式
let injectorInstance: ThemeInjector | null = null

/**
 * 获取主题注入器单例
 */
export function getThemeInjector(): ThemeInjector {
  if (!injectorInstance) {
    injectorInstance = new ThemeInjector()
  }
  return injectorInstance
}
