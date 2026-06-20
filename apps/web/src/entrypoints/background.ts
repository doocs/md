import { browser, defineBackground } from '#imports'
import enUS from '@/i18n/messages/en-US/store'
import zhCN from '@/i18n/messages/zh-CN/store'

function getExtensionTitle(): string {
  try {
    const stored = localStorage.getItem(`locale`)
    if (stored === `en-US`)
      return enUS.extension.editorTitle
  }
  catch {
    // ignore
  }
  return zhCN.extension.editorTitle
}

export default defineBackground({
  type: `module`,
  main() {
    browser.runtime.onInstalled.addListener((detail) => {
      if (import.meta.env.COMMAND === `serve`) {
        browser.runtime.openOptionsPage()
        return
      }
      if (detail.reason === `install`) {
        browser.tabs.create({ url: `https://md-pages.doocs.org/welcome` })
      }
      else if (detail.reason === `update`) {
        browser.runtime.openOptionsPage()
      }
    })

    browser.runtime.onInstalled.addListener(() => {
      if (typeof browser.sidePanel === `undefined`)
        return
      browser.contextMenus.create({
        id: `openSidePanel`,
        title: getExtensionTitle(),
        documentUrlPatterns: [`https://mp.weixin.qq.com/cgi-bin/appmsg*`],
        contexts: [`all`],
      })
    })

    browser.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === `openSidePanel` && tab?.id)
        browser.sidePanel.open({ tabId: tab.id })
    })
  },
})
