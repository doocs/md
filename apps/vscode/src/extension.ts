import type { ThemeName } from '@md/shared/configs'
import type { PreviewOptions } from './previewRenderer'
import { createRequire } from 'node:module'
import * as vscode from 'vscode'
import { MarkdownTreeDataProvider } from './treeDataProvider'

const requirePreview = createRequire(__filename)

type PreviewRendererModule = typeof import('./previewRenderer')

let activePanel: vscode.WebviewPanel | undefined
let activePreviewEditor: vscode.TextEditor | undefined
let refreshActivePanel: (() => void) | undefined
let previewModule: PreviewRendererModule | undefined

function loadPreviewRenderer(): PreviewRendererModule {
  if (!previewModule) {
    // Separate webpack entry — loaded only when preview opens.
    previewModule = requirePreview(`./previewRenderer`) as PreviewRendererModule
  }
  return previewModule
}

function updateMarkdownFileContext(editor: vscode.TextEditor | undefined) {
  const isMarkdown = editor?.document.languageId === `markdown`
  vscode.commands.executeCommand(`setContext`, `markdownFileActive`, Boolean(isMarkdown))
}

export function activate(context: vscode.ExtensionContext) {
  // Register sidebar FIRST — must complete before any heavy renderer import.
  const treeDataProvider = new MarkdownTreeDataProvider(context)

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(`markdown.preview.view`, treeDataProvider),
    treeDataProvider.onDidChangeTreeData(() => {
      refreshActivePanel?.()
    }),
  )

  updateMarkdownFileContext(vscode.window.activeTextEditor)

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
    vscode.commands.registerCommand(`markdown.toggleCiteStatus`, () => {
      treeDataProvider.updateCiteStatus(!treeDataProvider.getCurrentCiteStatus())
    }),
  )

  const disposable = vscode.commands.registerCommand(`markdown.preview`, () => {
    const editor = vscode.window.activeTextEditor
    if (!editor || editor.document.languageId !== `markdown`) {
      return
    }

    if (activePanel) {
      activePreviewEditor = editor
      activePanel.title = `Markdown Preview - ${editor.document.fileName}`
      refreshActivePanel?.()
      activePanel.reveal(vscode.ViewColumn.Two)
      return
    }

    const panel = vscode.window.createWebviewPanel(
      `markdownPreview`,
      `Markdown Preview - ${editor.document.fileName}`,
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    )

    activePanel = panel
    activePreviewEditor = editor

    panel.onDidDispose(() => {
      if (activePanel === panel) {
        activePanel = undefined
        activePreviewEditor = undefined
        refreshActivePanel = undefined
      }
    })

    async function updateWebview() {
      const previewEditor = activePreviewEditor
      if (!previewEditor || previewEditor.document.languageId !== `markdown`)
        return

      try {
        panel.title = `Markdown Preview - ${previewEditor.document.fileName}`

        const { buildPreviewHtml } = loadPreviewRenderer()
        panel.webview.html = buildPreviewHtml({
          markdown: previewEditor.document.getText(),
          primaryColor: treeDataProvider.getCurrentPrimaryColor(),
          fontFamily: treeDataProvider.getCurrentFontFamily(),
          fontSize: treeDataProvider.getCurrentFontSize(),
          theme: treeDataProvider.getCurrentTheme(),
          countStatus: treeDataProvider.getCurrentCountStatus(),
          isMacCodeBlock: treeDataProvider.getCurrentMacCodeBlock(),
          citeStatus: treeDataProvider.getCurrentCiteStatus(),
        } satisfies PreviewOptions)
      }
      catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        vscode.window.showErrorMessage(`Markdown preview failed: ${message}`)
        console.error(`[doocs-md] preview error:`, error)
      }
    }

    refreshActivePanel = () => { void updateWebview() }

    void updateWebview()

    const changeSubscription = vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
      if (activePreviewEditor && e.document === activePreviewEditor.document) {
        void updateWebview()
      }
    })

    panel.onDidDispose(() => {
      changeSubscription.dispose()
    })
  })

  context.subscriptions.push(disposable)

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateMarkdownFileContext),
  )
}
