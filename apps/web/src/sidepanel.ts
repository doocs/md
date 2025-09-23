// types/chrome.d.ts
declare namespace chrome {
  namespace runtime {
    const id: string | undefined
  }
  namespace tabs {
    interface Tab {
      id?: number
      index: number
      windowId: number
    }
    function query(queryOptions: { active: boolean, lastFocusedWindow: boolean }): Promise<[chrome.tabs.Tab]>
    function sendMessage(tabId: number, message: any): void
  }
}

const isInExtension = typeof chrome !== `undefined` && chrome.runtime && chrome.runtime.id

async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true }
  if (typeof browser !== `undefined` && browser.tabs && browser.tabs.query) {
    const [tab] = await browser.tabs.query(queryOptions)
    return tab
  }
  const [tab] = await chrome.tabs.query(queryOptions)
  return tab
}
window.addEventListener(`copyToMp`, (e) => {
  const customEvent = e as CustomEvent
  if (!isInExtension)
    return
  getCurrentTab().then((tab) => {
    chrome.tabs.sendMessage(tab.id!, {
      type: `copyToMp`,
      content: customEvent.detail.content,
    })
  })
})
