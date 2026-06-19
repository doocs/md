import type { EditorView } from '@codemirror/view'
import { ctrlSign, shiftSign } from '@md/shared/configs'
import { useEditorDocumentActions } from '@/composables/useEditorDocumentActions'
import { isAccountUiEnabled } from '@/services/account/config'
import { isShareUiEnabled } from '@/services/share/client'
import { isSyncUiEnabled } from '@/services/sync/client'
import { useEditorStore } from '@/stores/editor'
import { useUIStore } from '@/stores/ui'

export interface PaletteCommand {
  id: string
  label: string
  group: string
  keywords: string[]
  shortcut?: string[]
  action: () => void | Promise<void>
}

export function useCommandPalette() {
  const uiStore = useUIStore()
  const editorStore = useEditorStore()
  const { formatContent } = useEditorDocumentActions()

  function withEditor(run: (view: EditorView) => void | Promise<void>) {
    const view = editorStore.editor ? toRaw(editorStore.editor) as EditorView : null
    if (!view)
      return
    void run(view)
  }

  function buildCommands(): PaletteCommand[] {
    const commands: PaletteCommand[] = [
      {
        id: `palette-shortcuts`,
        label: `键盘快捷键`,
        group: `帮助`,
        keywords: [`快捷键`, `keyboard`, `shortcut`, `帮助`],
        action: () => {
          uiStore.toggleShowCommandPalette(false)
          uiStore.toggleShowKeyboardShortcutsDialog(true)
        },
      },
      {
        id: `palette-markdown-help`,
        label: `语法帮助`,
        group: `帮助`,
        keywords: [`语法`, `markdown`, `帮助`, `syntax`],
        action: () => {
          uiStore.toggleShowCommandPalette(false)
          uiStore.toggleShowMarkdownHelpDialog(true)
        },
      },
      {
        id: `view-edit`,
        label: `视图：编辑`,
        group: `视图`,
        keywords: [`视图`, `编辑`, `edit`, `view`],
        action: () => uiStore.setViewMode(`edit`),
      },
      {
        id: `view-split`,
        label: `视图：双屏`,
        group: `视图`,
        keywords: [`视图`, `双屏`, `split`, `view`],
        action: () => uiStore.setViewMode(`split`),
      },
      {
        id: `view-preview`,
        label: `视图：预览`,
        group: `视图`,
        keywords: [`视图`, `预览`, `preview`, `view`],
        action: () => uiStore.setViewMode(`preview`),
      },
      {
        id: `toggle-dark`,
        label: `切换深色模式`,
        group: `视图`,
        keywords: [`深色`, `浅色`, `主题`, `dark`, `light`, `theme`],
        action: () => { uiStore.toggleDark() },
      },
      {
        id: `toggle-style-panel`,
        label: `样式面板`,
        group: `面板`,
        keywords: [`样式`, `style`, `主题`, `面板`],
        action: () => { uiStore.isOpenRightSlider = !uiStore.isOpenRightSlider },
      },
      {
        id: `toggle-post-slider`,
        label: `内容管理`,
        group: `面板`,
        keywords: [`内容`, `文档`, `文章`, `posts`, `管理`],
        action: () => { uiStore.isOpenPostSlider = !uiStore.isOpenPostSlider },
      },
      {
        id: `toggle-folder-panel`,
        label: `本地文件夹`,
        group: `面板`,
        keywords: [`文件夹`, `本地`, `folder`, `local`],
        action: () => { uiStore.isOpenFolderPanel = !uiStore.isOpenFolderPanel },
      },
      {
        id: `open-css-editor`,
        label: `自定义 CSS`,
        group: `面板`,
        keywords: [`css`, `样式`, `自定义`],
        action: () => { uiStore.isShowCssEditor = true },
      },
      {
        id: `import-markdown`,
        label: `导入 Markdown`,
        group: `文件`,
        keywords: [`导入`, `import`, `markdown`, `md`],
        action: () => { uiStore.toggleShowImportMdDialog(true) },
      },
      {
        id: `template-dialog`,
        label: `模板管理`,
        group: `文件`,
        keywords: [`模板`, `template`],
        action: () => { uiStore.toggleShowTemplateDialog(true) },
      },
      {
        id: `editor-state`,
        label: `项目配置`,
        group: `文件`,
        keywords: [`配置`, `导入`, `导出`, `备份`, `settings`],
        action: () => { uiStore.toggleShowEditorStateDialog(true) },
      },
      {
        id: `find`,
        label: `查找`,
        group: `编辑`,
        keywords: [`查找`, `搜索`, `find`, `search`],
        shortcut: [ctrlSign, `F`],
        action: () => withEditor((view) => {
          const selection = view.state.selection.main
          const selected = view.state.doc.sliceString(selection.from, selection.to).trim()
          uiStore.openSearchTab(selected)
          view.focus()
        }),
      },
      {
        id: `replace`,
        label: `替换`,
        group: `编辑`,
        keywords: [`替换`, `replace`],
        shortcut: [ctrlSign, `H`],
        action: () => withEditor((view) => {
          const selection = view.state.selection.main
          const selected = view.state.doc.sliceString(selection.from, selection.to).trim()
          uiStore.openSearchTab(selected, true)
          view.focus()
        }),
      },
      {
        id: `format-doc`,
        label: `格式化文档`,
        group: `编辑`,
        keywords: [`格式化`, `format`, `prettier`],
        action: async () => {
          await formatContent()
          editorStore.editor?.focus()
        },
      },
      {
        id: `insert-image`,
        label: `插入图片`,
        group: `插入`,
        keywords: [`图片`, `image`, `上传`, `图床`],
        action: () => { uiStore.toggleShowUploadImgDialog(true) },
      },
      {
        id: `insert-table`,
        label: `插入表格`,
        group: `插入`,
        keywords: [`表格`, `table`],
        action: () => { uiStore.toggleShowInsertFormDialog(true) },
      },
      {
        id: `insert-formula`,
        label: `插入公式`,
        group: `插入`,
        keywords: [`公式`, `formula`, `math`, `latex`],
        action: () => uiStore.openFormulaEditor({ value: ``, displayMode: true }),
      },
      {
        id: `insert-component`,
        label: `插入组件`,
        group: `插入`,
        keywords: [`组件`, `component`, `块`],
        action: () => { uiStore.toggleShowComponentDialog(true) },
      },
    ]

    if (isAccountUiEnabled()) {
      commands.push({
        id: `open-account`,
        label: `账户`,
        group: `云端`,
        keywords: [`账户`, `登录`, `account`, `login`],
        action: () => { uiStore.toggleShowAccountDialog(true) },
      })
    }

    if (isSyncUiEnabled()) {
      commands.push({
        id: `open-sync`,
        label: `云同步`,
        group: `云端`,
        keywords: [`同步`, `云`, `sync`, `cloud`],
        action: () => { uiStore.toggleShowSyncDialog(true) },
      })
    }

    if (isShareUiEnabled()) {
      commands.push({
        id: `open-share`,
        label: `分享预览`,
        group: `云端`,
        keywords: [`分享`, `share`, `预览`],
        action: () => uiStore.openShareDialog(),
      })
    }

    return commands
  }

  const paletteShortcutLabel = `${ctrlSign} ${shiftSign} P`

  return {
    buildCommands,
    paletteShortcutLabel,
  }
}
