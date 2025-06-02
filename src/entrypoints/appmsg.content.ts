import { defineContentScript, injectScript } from '#imports'

export default defineContentScript({
  matches: [`https://mp.weixin.qq.com/cgi-bin/appmsg*`],
  async main() {
    await injectScript(`/injected.js`, {
      keepInDom: true,
    })
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === `copyToMp`) {
        window.dispatchEvent(new CustomEvent(`copyToMp`, {
          detail: {
            content: message.content,
          },
        }))
        return Promise.resolve(true)
      }
      return true
    })
  },
})
