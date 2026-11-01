import { setupFeatureVideos } from './feature-video.js'
import { refreshGithubStats } from './github.js'
import { icon } from './icons.js'
import { getActiveSection } from './navigation.js'
import { setupScrollMotion } from './scroll-motion.js'
import { nextAppearance } from './theme.js'

setupFeatureVideos()
void refreshGithubStats()

for (const node of document.querySelectorAll('[data-icon]:empty'))
  node.outerHTML = icon(node.dataset.icon)
for (const control of document.querySelectorAll('[data-client-control], [data-filter-controls]'))
  control.hidden = false

const appearance = document.querySelector('#appearance')
function updateAppearance(theme) {
  document.documentElement.dataset.theme = theme
  appearance.setAttribute('aria-pressed', String(theme === 'dark'))
  appearance.setAttribute('aria-label', theme === 'dark' ? '切换浅色模式' : '切换深色模式')
  appearance.title = appearance.getAttribute('aria-label')
  appearance.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon')
  document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#ffffff' : '#030712'
}
updateAppearance(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
appearance.addEventListener('click', () => {
  const theme = nextAppearance(document.documentElement.dataset.theme)
  updateAppearance(theme)
  try {
    localStorage.setItem('md-website-appearance', theme)
    const url = new URL(location.href)
    url.searchParams.delete('theme')
    history.replaceState(null, '', url)
  }
  catch {
    // Appearance still switches when browser storage is unavailable.
  }
})

const menu = document.querySelector('#mobile-nav')
const trigger = document.querySelector('#mobile-toggle')
function closeMenu(restoreFocus = false) {
  menu.hidden = true
  trigger.setAttribute('aria-expanded', 'false')
  trigger.setAttribute('aria-label', '打开导航')
  if (restoreFocus)
    trigger.focus()
}
trigger.addEventListener('click', () => {
  const open = menu.hidden
  menu.hidden = !open
  trigger.setAttribute('aria-expanded', String(open))
  trigger.setAttribute('aria-label', open ? '关闭导航' : '打开导航')
})
for (const anchor of menu.querySelectorAll('a'))
  anchor.addEventListener('click', () => closeMenu())
document.addEventListener('click', (event) => {
  if (!menu.hidden && !document.querySelector('.site-header').contains(event.target))
    closeMenu()
  for (const details of document.querySelectorAll('.nav-menu[open]')) {
    if (!details.contains(event.target))
      details.open = false
  }
})
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape')
    return
  if (!menu.hidden)
    closeMenu(true)
  for (const details of document.querySelectorAll('.nav-menu[open]')) {
    if (details.contains(document.activeElement))
      details.querySelector('summary').focus()
    details.open = false
  }
})
matchMedia('(min-width:1024px)').addEventListener('change', (event) => {
  if (event.matches && !menu.hidden) {
    closeMenu()
    document.querySelector('.brand').focus()
  }
})

const header = document.querySelector('.siteHeader')
const sections = [...document.querySelectorAll('main section[id]')]
const navLinks = document.querySelectorAll('.desktop-nav a, #mobile-nav a')
const updateScrollMotion = setupScrollMotion()
let navigationFrame
function updateNavigation() {
  header.classList.toggle('border', scrollY > 20)
  const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 2
  const section = getActiveSection(sections, header.offsetHeight + 32, atEnd)
  for (const anchor of navLinks) {
    const target = new URL(anchor.href)
    const current = target.pathname === location.pathname && (target.hash ? target.hash === `#${section}` : target.pathname !== '/')
    if (current)
      anchor.setAttribute('aria-current', target.hash ? 'location' : 'page')
    else
      anchor.removeAttribute('aria-current')
  }
  updateScrollMotion()
}
function scheduleNavigation() {
  cancelAnimationFrame(navigationFrame)
  navigationFrame = requestAnimationFrame(updateNavigation)
}
addEventListener('scroll', scheduleNavigation, { passive: true })
addEventListener('resize', scheduleNavigation)
updateNavigation()

for (const [key, selector, rowKey] of [['category', '[data-post-category]', 'postCategory'], ['channel', '[data-change-channel]', 'changeChannel']]) {
  const buttons = [...document.querySelectorAll(`[data-${key}]`)]
  if (!buttons.length)
    continue
  const rows = [...document.querySelectorAll(selector)]
  function filter(value, announce) {
    let count = 0
    for (const button of buttons)
      button.setAttribute('aria-pressed', String(button.dataset[key] === value))
    for (const row of rows) {
      row.hidden = value !== 'all' && row.dataset[rowKey] !== value
      if (!row.hidden)
        count++
    }
    document.querySelector('[data-empty]').hidden = count > 0
    if (announce)
      document.querySelector('[data-filter-status]').textContent = `显示 ${count} 条记录`
  }
  const initial = new URLSearchParams(location.search).get(key)
  filter(buttons.some(button => button.dataset[key] === initial) ? initial : 'all', false)
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const value = button.dataset[key]
      filter(value, true)
      const url = new URL(location.href)
      if (value === 'all')
        url.searchParams.delete(key)
      else
        url.searchParams.set(key, value)
      history.replaceState(null, '', url)
    })
  }
}
