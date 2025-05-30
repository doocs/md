import { marked } from 'marked'
import * as vscode from 'vscode'
import { modifyHtmlContent } from '../../platform/md2html'

export function activate(context: vscode.ExtensionContext) {
  // 注册命令
  const disposable = vscode.commands.registerCommand(`markdown.preview`, () => {
    // 创建并显示新的webview面板
    const panel = vscode.window.createWebviewPanel(
      `markdownPreview`, // 视图类型
      `Markdown Preview`, // 面板标题
      vscode.ViewColumn.Two, // 在第二栏显示
      {
        enableScripts: true, // 启用JS
      },
    )

    // 获取当前活动的Markdown编辑器
    const editor = vscode.window.activeTextEditor
    if (editor && editor.document.languageId === `markdown`) {
      // 设置webview内容为当前Markdown内容

      const documentText = editor.document.getText()
      const html = marked.parse(documentText) as string
      const modifiedHtml = modifyHtmlContent(html)

      panel.webview.html = wrapHtmlTag(modifiedHtml)
    }
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
}

function wrapHtmlTag(html: string) {
  return `<html><head><meta charset="utf-8" /></head><body><div style="width: 375px; margin: auto;padding:20px;background:white;position: relative;min-height: 100%;margin: 0 auto;padding: 20px;font-size: 14px;box-sizing: border-box;outline: none;transition: all 300ms ease-in-out;word-wrap: break-word;">${html}</div></body></html>`
}
