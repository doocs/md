import { marked } from 'marked'
import * as vscode from 'vscode'
import { themeMap } from '../../config/theme'
import { css2json, customCssWithTemplate, customizeTheme, modifyHtmlContent } from '../../utils/css-helper'
import { initRenderer } from '../../utils/renderer'
import { css } from './css'
import { MarkdownTreeDataProvider } from './treeDataProvider'

let activePanel: vscode.WebviewPanel | undefined

export function activate(context: vscode.ExtensionContext) {
  // 注册TreeDataProvider
  const treeDataProvider = new MarkdownTreeDataProvider(context)
  vscode.window.registerTreeDataProvider(`markdown.preview.view`, treeDataProvider)

  // 注册样式设置的命令
  context.subscriptions.push(
    vscode.commands.registerCommand(`markdown.setFontSize`, (size: string) => {
      treeDataProvider.updateFontSize(size)
      // 这里可以添加实际修改预览字体大小的逻辑
      vscode.window.showInformationMessage(`Font size set to ${size}`)
    }),
    vscode.commands.registerCommand(`markdown.setTheme`, (theme: keyof typeof themeMap) => {
      treeDataProvider.updateTheme(theme)
    }),
    vscode.commands.registerCommand(`markdown.setPrimaryColor`, (color: string) => {
      treeDataProvider.updatePrimaryColor(color)
    }),
    vscode.commands.registerCommand(`markdown.setFontFamily`, (font: string) => {
      treeDataProvider.updateFontFamily(font)
    }),
  )

  // 注册命令
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

    // 创建并显示新的webview面板
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

    // 面板关闭时清除引用
    panel.onDidDispose(() => {
      activePanel = undefined
    })

    treeDataProvider.onDidChangeTreeData(updateWebview)
    function updateWebview() {
      if (!editor)
        return
      const renderer = initRenderer({
        theme: customCssWithTemplate(
          css2json(``),
          treeDataProvider.getCurrentPrimaryColor(),
          customizeTheme(themeMap[treeDataProvider.getCurrentTheme()], {
            fontSize: treeDataProvider.getCurrentFontSizeNumber(),
            color: treeDataProvider.getCurrentPrimaryColor(),
          }),
        ),
        fonts: treeDataProvider.getCurrentFontFamily(),
        size: treeDataProvider.getCurrentFontSize(),
        isUseIndent: false,
      })
      const documentText = editor.document.getText()
      const html = marked.parse(documentText) as string
      const modifiedHtml = modifyHtmlContent(html, renderer)
      panel.webview.html = wrapHtmlTag(modifiedHtml, css)
    }

    // 初始渲染
    updateWebview()

    // 监听文档变化
    const changeSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document === editor.document) {
        updateWebview()
      }
    })

    // 面板关闭时取消订阅
    panel.onDidDispose(() => {
      changeSubscription.dispose()
    })
  })

  context.subscriptions.push(disposable)

  // 当打开Markdown文件时，在状态栏显示预览按钮
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor && editor.document.languageId === `markdown`) {
      vscode.commands.executeCommand(`setContext`, `markdownFileActive`, true)
    }
    else {
      vscode.commands.executeCommand(`setContext`, `markdownFileActive`, false)
    }
  })

  const disposable1 = vscode.commands.registerCommand(
    `helloworld-web-sample.helloWorld`,
    () => {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage(`114514`)
    },
  )

  context.subscriptions.push(disposable1)
}

function wrapHtmlTag(html: string, css: string) {
  return `<html><head><meta charset="utf-8" /><style>${css}</style></head><body><div style="width: 375px; margin: auto;padding:20px;background:white;position: relative;min-height: 100%;margin: 0 auto;padding: 20px;font-size: 14px;box-sizing: border-box;outline: none;transition: all 300ms ease-in-out;word-wrap: break-word;">${html}</div></body></html>`
}
