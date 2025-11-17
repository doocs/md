import type { ThemeName } from '@md/shared'
import { initRenderer } from '@md/core/renderer'
import { generateCSSVariables } from '@md/core/theme'
import { modifyHtmlContent } from '@md/core/utils'
import { baseCSSContent, themeMap } from '@md/shared'
import * as vscode from 'vscode'
import { css } from './css'
import { MarkdownTreeDataProvider } from './treeDataProvider'

let activePanel: vscode.WebviewPanel | undefined

export function activate(context: vscode.ExtensionContext) {
  // Register TreeDataProvider
  const treeDataProvider = new MarkdownTreeDataProvider(context)
  vscode.window.registerTreeDataProvider(`markdown.preview.view`, treeDataProvider)

  // Command for registering style settings
  context.subscriptions.push(
    vscode.commands.registerCommand(`markdown.setFontSize`, (size: string) => {
      treeDataProvider.updateFontSize(size)
    }),
    vscode.commands.registerCommand(`markdown.setTheme`, (theme: ThemeName) => {
      treeDataProvider.updateTheme(theme)
    }),
    vscode.commands.registerCommand(`markdown.setPrimaryColor`, (color: string) => {
      treeDataProvider.updatePrimaryColor(color)
    }),
    vscode.commands.registerCommand(`markdown.setFontFamily`, (font: string) => {
      treeDataProvider.updateFontFamily(font)
    }),
    vscode.commands.registerCommand(`markdown.toggleCountStatus`, () => {
      treeDataProvider.updateCountStatus(!treeDataProvider.getCurrentCountStatus())
    }),
    vscode.commands.registerCommand(`markdown.toggleMacCodeBlock`, () => {
      treeDataProvider.updateMacCodeBlock(!treeDataProvider.getCurrentMacCodeBlock())
    }),
  )

  const disposable = vscode.commands.registerCommand(`markdown.preview`, () => {
    const editor = vscode.window.activeTextEditor
    if (!editor || editor.document.languageId !== `markdown`) {
      return
    }

    // 如果已有面板且未关闭，则直接显示
    if (activePanel) {
      activePanel.reveal(vscode.ViewColumn.Two)
      return
    }

    // Create and display a new webview panel
    const panel = vscode.window.createWebviewPanel(
      `markdownPreview`, // 视图类型
      `Markdown Preview - ${editor.document.fileName}`, // 面板标题
      vscode.ViewColumn.Two, // 在第二栏显示
      {
        enableScripts: true, // 启用JS
        retainContextWhenHidden: true, // 保持状态
      },
    )

    activePanel = panel

    panel.onDidDispose(() => {
      activePanel = undefined
    })

    treeDataProvider.onDidChangeTreeData(updateWebview)
    function updateWebview() {
      if (!editor)
        return

      // 使用新主题系统
      const renderer = initRenderer({
        countStatus: treeDataProvider.getCurrentCountStatus(),
        isMacCodeBlock: treeDataProvider.getCurrentMacCodeBlock(),
        legend: `none`,
      })

      const markdownContent = editor.document.getText()
      const html = modifyHtmlContent(markdownContent, renderer)

      // 生成主题 CSS
      const variables = generateCSSVariables({
        primaryColor: treeDataProvider.getCurrentPrimaryColor(),
        fontFamily: treeDataProvider.getCurrentFontFamily(),
        fontSize: treeDataProvider.getCurrentFontSize(),
        isUseIndent: false,
        isUseJustify: false,
      })

      const themeCSS = themeMap[treeDataProvider.getCurrentTheme() as ThemeName]
      const completeCss = `${variables}\n\n${baseCSSContent}\n\n${themeCSS}\n\n${css}`

      panel.webview.html = wrapHtmlTag(html, completeCss)
    }

    // render first webview
    updateWebview()

    // Monitor the changes of documents
    const changeSubscription = vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
      if (e.document === editor.document) {
        updateWebview()
      }
    })

    // Cancel the subscription when the panel is closed
    panel.onDidDispose(() => {
      changeSubscription.dispose()
    })
  })

  context.subscriptions.push(disposable)

  // When the Markdown file is opened, the preview button is displayed in the status bar.
  vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
    if (editor && editor.document.languageId === `markdown`) {
      vscode.commands.executeCommand(`setContext`, `markdownFileActive`, true)
    }
    else {
      vscode.commands.executeCommand(`setContext`, `markdownFileActive`, false)
    }
  })
}

function wrapHtmlTag(html: string, css: string) {
  return `<html><head><meta charset="utf-8" /><style>${css}</style></head><body><div style="width: 375px; margin: auto;padding:20px;background:white;position: relative;min-height: 100%;margin: 0 auto;padding: 20px;font-size: 14px;box-sizing: border-box;outline: none;transition: all 300ms ease-in-out;word-wrap: break-word;">${html}</div></body></html>`
}
