import { formatStars, loadGithubStars } from './github.js'
import { applyDemoView, applyPreviewTheme, nextAppearance } from './theme.js'

loadGithubStars().then((count) => {
  if (count === null)
    return

  for (const link of document.querySelectorAll('[data-github-stars]')) {
    link.querySelector('.star-count').textContent = formatStars(count)
    link.setAttribute('aria-label', `在 GitHub 查看 md，${count.toLocaleString('en-US')} Stars`)
    link.title = `GitHub · ${count.toLocaleString('en-US')} Stars`
  }
})

const appearance = document.querySelector('#appearance')
function setAppearance(theme) {
  document.documentElement.dataset.theme = theme
  appearance.setAttribute('aria-pressed', String(theme === 'light'))
  appearance.setAttribute('aria-label', theme === 'light' ? '切换深色外观' : '切换浅色外观')
  appearance.title = appearance.getAttribute('aria-label')
  document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#ffffff' : '#080b11'
}
setAppearance(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
appearance.addEventListener('click', () => {
  const theme = nextAppearance(document.documentElement.dataset.theme)
  setAppearance(theme)
  try {
    localStorage.setItem('md-website-appearance', theme)
  }
  catch {
    // Appearance still works when browser storage is blocked.
  }
})

const preview = document.querySelector('#article-preview')
const themeButtons = document.querySelectorAll('[data-preview-theme]')
for (const button of themeButtons) {
  button.addEventListener('click', () => {
    applyPreviewTheme(preview, themeButtons, button.dataset.previewTheme)
    document.querySelector('#preview-theme-name').textContent = button.textContent.trim()
  })
}

const editor = document.querySelector('.editor-body')
const viewButtons = document.querySelectorAll('[data-demo-view]')
for (const button of viewButtons) {
  button.addEventListener('click', () => {
    applyDemoView(editor, viewButtons, button.dataset.demoView)
  })
}

const menu = document.querySelector('#mobile-menu')
const menuTrigger = menu.querySelector('summary')
menu.addEventListener('toggle', () => {
  menuTrigger.setAttribute('aria-label', menu.open ? '关闭导航菜单' : '打开导航菜单')
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false
    menuTrigger.focus()
  }
})
document.addEventListener('click', (event) => {
  if (menu.open && !menu.contains(event.target))
    menu.open = false
})
for (const link of menu.querySelectorAll('a')) {
  link.addEventListener('click', () => {
    menu.open = false
  })
}
