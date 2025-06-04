import { browser, defineBackground } from '#imports'

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

    const MP_EDITOR_PAGE_REGEX = /https:\/\/mp.weixin.qq.com\/cgi-bin\/appmsg\?t=.*/
    browser.tabs.onUpdated.addListener(async (tabId, _info, tab) => {
      if (!tab.url)
        return
      if (typeof browser.sidePanel === `undefined`)
        return
      const url = new URL(tab.url)
      if (MP_EDITOR_PAGE_REGEX.test(url.href)) {
        await browser.sidePanel.setOptions({
          tabId,
          path: `sidepanel.html`,
          enabled: true,
        })
      }
      else {
        // Disables the side panel on all other sites
        await browser.sidePanel.setOptions({
          tabId,
          enabled: false,
        })
      }
    })
    browser.runtime.onInstalled.addListener(() => {
      if (typeof browser.sidePanel === `undefined`)
        return
      browser.contextMenus.create({
        id: `openSidePanel`,
        title: `MD 公众号编辑器`,
        documentUrlPatterns: [`https://mp.weixin.qq.com/cgi-bin/appmsg*`],
        contexts: [`all`],
      })
    })

    browser.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === `openSidePanel`) {
        browser.sidePanel.open({ tabId: tab!.id! })
      }
    })
  },
})
