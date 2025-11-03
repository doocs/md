import type { ThemeName } from '@md/shared/configs'
import * as vscode from 'vscode'
import { colorOptions, fontFamilyOptions, fontSizeOptions, themeOptions } from './styleChoices'

export class MarkdownTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = new vscode.EventEmitter<vscode.TreeItem | undefined>()
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event
  private currentFontSize: string
  private currentTheme: ThemeName
  private currentPrimaryColor: string
  private currentFontFamily: string
  private countStatus: boolean
  private isMacCodeBlock: boolean
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
    this.currentFontSize = this.context.workspaceState.get(`markdownPreview.fontSize`, fontSizeOptions[0].value)
    this.currentTheme = this.context.workspaceState.get(`markdownPreview.theme`, themeOptions[0].value)
    this.currentPrimaryColor = this.context.workspaceState.get(`markdownPreview.primaryColor`, colorOptions[0].value)
    this.currentFontFamily = this.context.workspaceState.get(`markdownPreview.fontFamily`, fontFamilyOptions[0].value)
    this.countStatus = this.context.workspaceState.get(`markdownPreview.countStatus`, false)
    this.isMacCodeBlock = this.context.workspaceState.get(`markdownPreview.isMacCodeBlock`, false)
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element
  }

  updateCountStatus(status: boolean): void {
    this.countStatus = status
    this.context.workspaceState.update(`markdownPreview.countStatus`, status)
    this._onDidChangeTreeData.fire(undefined)
  }

  updateMacCodeBlock(status: boolean): void {
    this.isMacCodeBlock = status
    this.context.workspaceState.update(`markdownPreview.isMacCodeBlock`, status)
    this._onDidChangeTreeData.fire(undefined)
  }

  getCurrentMacCodeBlock(): boolean {
    return this.isMacCodeBlock
  }

  getCurrentCountStatus(): boolean {
    return this.countStatus
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (!element) {
      return Promise.resolve([
        new vscode.TreeItem(`字号`, vscode.TreeItemCollapsibleState.Expanded),
        new vscode.TreeItem(`字体`, vscode.TreeItemCollapsibleState.Expanded),
        new vscode.TreeItem(`主题`, vscode.TreeItemCollapsibleState.Expanded),
        new vscode.TreeItem(`主题色`, vscode.TreeItemCollapsibleState.Expanded),
        new vscode.TreeItem(`计数状态`, vscode.TreeItemCollapsibleState.None),
        new vscode.TreeItem(`Mac代码块`, vscode.TreeItemCollapsibleState.None),
      ].map((item) => {
        if (item.label === `计数状态`) {
          item.command = {
            command: `markdown.toggleCountStatus`,
            title: `Toggle Count Status`,
            arguments: [],
          }
          if (this.countStatus) {
            item.iconPath = new vscode.ThemeIcon(`check`)
          }
        }
        else if (item.label === `Mac代码块`) {
          item.command = {
            command: `markdown.toggleMacCodeBlock`,
            title: `Toggle Mac Code Block`,
            arguments: [],
          }
          if (this.isMacCodeBlock) {
            item.iconPath = new vscode.ThemeIcon(`check`)
          }
        }
        return item
      }))
    }
    else if (element.label === `字号`) {
      return Promise.resolve(fontSizeOptions.map((option) => {
        const size = option.value
        const label = option.label
        const desc = option.desc
        const item = new vscode.TreeItem(`${label}  ${desc}`)
        item.command = {
          command: `markdown.setFontSize`,
          title: `Set Font Size`,
          arguments: [size],
        }
        if (size === this.currentFontSize) {
          item.iconPath = new vscode.ThemeIcon(`check`)
        }
        return item
      }))
    }
    else if (element.label === `字体`) {
      return Promise.resolve(fontFamilyOptions.map((option) => {
        const font = option.value
        const label = option.label
        const desc = option.desc
        const item = new vscode.TreeItem(`${label}  ${desc}`)
        item.command = {
          command: `markdown.setFontFamily`,
          title: `Set Font Family`,
          arguments: [font],
        }
        if (font === this.currentFontFamily) {
          item.iconPath = new vscode.ThemeIcon(`check`)
        }
        return item
      }))
    }
    else if (element.label === `主题`) {
      return Promise.resolve(themeOptions.map((option) => {
        const theme = option.value
        const label = option.label
        const desc = option.desc
        const item = new vscode.TreeItem(`${label}  ${desc}`)
        item.command = {
          command: `markdown.setTheme`,
          title: `Set Theme`,
          arguments: [theme],
        }
        if (theme === this.currentTheme) {
          item.iconPath = new vscode.ThemeIcon(`check`)
        }
        return item
      }))
    }
    else if (element.label === `主题色`) {
      return Promise.resolve(colorOptions.map((option) => {
        const color = option.value
        const label = option.label
        const desc = option.desc
        const item = new vscode.TreeItem(`${label}  ${desc}`)
        item.command = {
          command: `markdown.setPrimaryColor`,
          title: `Set Primary Color`,
          arguments: [color],
        }
        if (color === this.currentPrimaryColor) {
          item.iconPath = new vscode.ThemeIcon(`check`)
        }
        return item
      }))
    }
    return Promise.resolve([])
  }

  updateFontSize(size: string) {
    this.currentFontSize = size
    this.context.workspaceState.update(`markdownPreview.fontSize`, size)
    this._onDidChangeTreeData.fire(undefined)
  }

  updateTheme(theme: ThemeName) {
    this.currentTheme = theme
    this.context.workspaceState.update(`markdownPreview.theme`, theme)
    this._onDidChangeTreeData.fire(undefined)
  }

  updatePrimaryColor(color: string) {
    this.currentPrimaryColor = color
    this.context.workspaceState.update(`markdownPreview.primaryColor`, color)
    this._onDidChangeTreeData.fire(undefined)
  }

  updateFontFamily(font: string) {
    this.currentFontFamily = font
    this.context.workspaceState.update(`markdownPreview.fontFamily`, font)
    this._onDidChangeTreeData.fire(undefined)
  }

  getCurrentFontSize() {
    return this.currentFontSize
  }

  getCurrentFontSizeNumber() {
    return Number(this.currentFontSize.replace(`px`, ``))
  }

  getCurrentTheme(): ThemeName {
    return this.currentTheme
  }

  getCurrentPrimaryColor() {
    return this.currentPrimaryColor
  }

  getCurrentFontFamily() {
    return this.currentFontFamily
  }
}
