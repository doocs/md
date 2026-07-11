/** Manages the injected theme <style> element */

export class ThemeInjector {
  private styleElement: HTMLStyleElement | null = null
  private readonly styleId = `md-theme`

  inject(cssContent: string): void {
    if (!this.styleElement) {
      this.styleElement = document.createElement(`style`)
      this.styleElement.id = this.styleId
      document.head.appendChild(this.styleElement)
    }
    this.styleElement.textContent = cssContent
  }

  remove(): void {
    if (this.styleElement) {
      this.styleElement.remove()
      this.styleElement = null
    }
  }

  isInjected(): boolean {
    return this.styleElement !== null
  }
}

let injectorInstance: ThemeInjector | null = null

export function getThemeInjector(): ThemeInjector {
  if (!injectorInstance) {
    injectorInstance = new ThemeInjector()
  }
  return injectorInstance
}
