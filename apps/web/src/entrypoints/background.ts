import { browser, defineBackground } from '#imports'
import { detectInitialLocale } from '@/i18n/detect'
import deDE from '@/i18n/messages/de-DE/store'
import enUS from '@/i18n/messages/en-US/store'
import esES from '@/i18n/messages/es-ES/store'
import frFR from '@/i18n/messages/fr-FR/store'
import jaJP from '@/i18n/messages/ja-JP/store'
import ptBR from '@/i18n/messages/pt-BR/store'
import ruRU from '@/i18n/messages/ru-RU/store'
import zhCN from '@/i18n/messages/zh-CN/store'
import zhTW from '@/i18n/messages/zh-TW/store'

const EXTENSION_TITLE_BY_LOCALE = {
  'zh-CN': zhCN.store.extension.editorTitle,
  'zh-TW': zhTW.store.extension.editorTitle,
  'en-US': enUS.store.extension.editorTitle,
  'ja-JP': jaJP.store.extension.editorTitle,
  'es-ES': esES.store.extension.editorTitle,
  'fr-FR': frFR.store.extension.editorTitle,
  'de-DE': deDE.store.extension.editorTitle,
  'ru-RU': ruRU.store.extension.editorTitle,
  'pt-BR': ptBR.store.extension.editorTitle,
} as const

function getExtensionTitle(): string {
  return EXTENSION_TITLE_BY_LOCALE[detectInitialLocale()]
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
