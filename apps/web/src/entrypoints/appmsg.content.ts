import { defineContentScript, injectScript } from '#imports'

export default defineContentScript({
  matches: [`https://mp.weixin.qq.com/cgi-bin/appmsg*`],
  async main() {
    await injectScript(`/injected.js`, {
      keepInDom: true,
    })
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === `copyToMp`) {
        const customEventData = { type: `copyToMp`, content: message.content }
        window.postMessage(customEventData)
        return Promise.resolve(true)
      }
      return true
    })
  },
})
