export const themes = ['blue', 'teal', 'purple']

export function nextAppearance(current) {
  return current === 'light' ? 'dark' : 'light'
}

export function applyPreviewTheme(preview, buttons, theme) {
  if (!themes.includes(theme))
    return

  preview.dataset.theme = theme
  for (const button of buttons)
    button.setAttribute('aria-pressed', String(button.dataset.previewTheme === theme))
}

export function applyDemoView(editor, buttons, view) {
  if (view !== 'source' && view !== 'preview')
    return

  editor.dataset.view = view
  for (const button of buttons)
    button.setAttribute('aria-pressed', String(button.dataset.demoView === view))
}
