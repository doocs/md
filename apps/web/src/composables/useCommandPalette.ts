import type { EditorView } from '@codemirror/view'
import { ctrlSign, shiftSign } from '@md/shared/configs'
import { useEditorDocumentActions } from '@/composables/useEditorDocumentActions'
import { t } from '@/i18n/translate'
import { isAccountUiEnabled } from '@/services/account/config'
import { isShareUiEnabled } from '@/services/share/client'
import { isSyncUiEnabled } from '@/services/sync/client'
import { useEditorStore } from '@/stores/editor'
import { useLocaleStore } from '@/stores/locale'
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
  const localeStore = useLocaleStore()
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
        id: `open-preferences`,
        label: t(`commandPalette.openPreferences`),
        group: t(`commandPalette.group.settings`),
        keywords: [`偏好`, `设置`, `preferences`, `settings`, `language`, `语言`],
        shortcut: [ctrlSign, `,`],
        action: () => {
          uiStore.toggleShowPreferencesDialog(true)
        },
      },
      {
        id: `palette-shortcuts`,
        label: t(`menu.keyboardShortcuts`),
        group: t(`commandPalette.group.help`),
        keywords: [`快捷键`, `keyboard`, `shortcut`, `帮助`],
        action: () => {
          uiStore.toggleShowKeyboardShortcutsDialog(true)
        },
      },
      {
        id: `palette-markdown-help`,
        label: t(`menu.syntaxHelp`),
        group: t(`commandPalette.group.help`),
        keywords: [`语法`, `markdown`, `帮助`, `syntax`],
        action: () => {
          uiStore.toggleShowMarkdownHelpDialog(true)
        },
      },
      {
        id: `view-edit`,
        label: t(`commandPalette.viewEdit`),
        group: t(`commandPalette.group.view`),
        keywords: [`视图`, `编辑`, `edit`, `view`],
        action: () => uiStore.setViewMode(`edit`),
      },
      {
        id: `view-split`,
        label: t(`commandPalette.viewSplit`),
        group: t(`commandPalette.group.view`),
        keywords: [`视图`, `双屏`, `split`, `view`],
        action: () => uiStore.setViewMode(`split`),
      },
      {
        id: `view-preview`,
        label: t(`commandPalette.viewPreview`),
        group: t(`commandPalette.group.view`),
        keywords: [`视图`, `预览`, `preview`, `view`],
        action: () => uiStore.setViewMode(`preview`),
      },
      {
        id: `toggle-dark`,
        label: t(`commandPalette.toggleDark`),
        group: t(`commandPalette.group.view`),
        keywords: [`深色`, `浅色`, `主题`, `dark`, `light`, `theme`],
        action: () => { uiStore.toggleDark() },
      },
      {
        id: `toggle-language`,
        label: t(`commandPalette.toggleLanguage`),
        group: t(`commandPalette.group.settings`),
        keywords: [`语言`, `中文`, `英文`, `language`, `locale`, `english`, `chinese`],
        action: () => { void localeStore.cycleLocale() },
      },
      {
        id: `toggle-style-panel`,
        label: t(`commandPalette.stylePanel`),
        group: t(`commandPalette.group.panel`),
        keywords: [`样式`, `style`, `主题`, `面板`],
        action: () => { uiStore.isOpenRightSlider = !uiStore.isOpenRightSlider },
      },
      {
        id: `toggle-post-slider`,
        label: t(`menu.contentManage`),
        group: t(`commandPalette.group.panel`),
        keywords: [`内容`, `文档`, `文章`, `posts`, `管理`],
        action: () => { uiStore.isOpenPostSlider = !uiStore.isOpenPostSlider },
      },
      {
        id: `toggle-folder-panel`,
        label: t(`menu.localFolder`),
        group: t(`commandPalette.group.panel`),
        keywords: [`文件夹`, `本地`, `folder`, `local`],
        action: () => { uiStore.isOpenFolderPanel = !uiStore.isOpenFolderPanel },
      },
      {
        id: `open-css-editor`,
        label: t(`menu.customCss`),
        group: t(`commandPalette.group.panel`),
        keywords: [`css`, `样式`, `自定义`],
        action: () => { uiStore.isShowCssEditor = true },
      },
      {
        id: `import-markdown`,
        label: t(`menu.importMarkdown`),
        group: t(`commandPalette.group.file`),
        keywords: [`导入`, `import`, `markdown`, `md`],
        action: () => { uiStore.toggleShowImportMdDialog(true) },
      },
      {
        id: `template-dialog`,
        label: t(`menu.templateManage`),
        group: t(`commandPalette.group.file`),
        keywords: [`模板`, `template`],
        action: () => { uiStore.toggleShowTemplateDialog(true) },
      },
      {
        id: `editor-state`,
        label: t(`menu.importExportConfig`),
        group: t(`commandPalette.group.file`),
        keywords: [`配置`, `导入`, `导出`, `备份`, `import`, `export`],
        action: () => { uiStore.toggleShowEditorStateDialog(true) },
      },
      {
        id: `find`,
        label: t(`menu.find`),
        group: t(`commandPalette.group.edit`),
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
        label: t(`menu.replace`),
        group: t(`commandPalette.group.edit`),
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
        label: t(`commandPalette.formatDocument`),
        group: t(`commandPalette.group.edit`),
        keywords: [`格式化`, `format`, `prettier`],
        action: async () => {
          await formatContent()
          editorStore.editor?.focus()
        },
      },
      {
        id: `insert-image`,
        label: t(`commandPalette.insertImage`),
        group: t(`commandPalette.group.insert`),
        keywords: [`图片`, `image`, `上传`, `图床`],
        action: () => { uiStore.toggleShowUploadImgDialog(true) },
      },
      {
        id: `insert-table`,
        label: t(`commandPalette.insertTable`),
        group: t(`commandPalette.group.insert`),
        keywords: [`表格`, `table`],
        action: () => { uiStore.toggleShowInsertFormDialog(true) },
      },
      {
        id: `insert-formula`,
        label: t(`commandPalette.insertFormula`),
        group: t(`commandPalette.group.insert`),
        keywords: [`公式`, `formula`, `math`, `latex`],
        action: () => uiStore.openFormulaEditor({ value: ``, displayMode: true }),
      },
      {
        id: `insert-component`,
        label: t(`commandPalette.insertComponent`),
        group: t(`commandPalette.group.insert`),
        keywords: [`组件`, `component`, `块`],
        action: () => { uiStore.toggleShowComponentDialog(true) },
      },
    ]

    if (isAccountUiEnabled()) {
      commands.push({
        id: `open-account`,
        label: t(`common.account`),
        group: t(`commandPalette.group.cloud`),
        keywords: [`账户`, `登录`, `account`, `login`],
        action: () => { uiStore.toggleShowAccountDialog(true) },
      })
    }

    if (isSyncUiEnabled()) {
      commands.push({
        id: `open-sync`,
        label: t(`menu.cloudSync`),
        group: t(`commandPalette.group.cloud`),
        keywords: [`同步`, `云`, `sync`, `cloud`],
        action: () => { uiStore.toggleShowSyncDialog(true) },
      })
    }

    if (isShareUiEnabled()) {
      commands.push({
        id: `open-share`,
        label: t(`menu.sharePreview`),
        group: t(`commandPalette.group.cloud`),
        keywords: [`分享`, `share`, `预览`],
        action: () => uiStore.openShareDialog(),
      })
    }

    return commands
  }

  const paletteShortcutLabel = `${ctrlSign} ${shiftSign} .`

  return {
    buildCommands,
    paletteShortcutLabel,
  }
}
