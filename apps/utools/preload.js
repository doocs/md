(() => {
  if (typeof window === `undefined`)
    return

  window.__MD_UTOOLS__ = true

  const enter = (action) => {
    try {
      window.utools?.hideMainWindowWhenBlur(false)
      window.utools?.showMainWindow()
      window.utools?.setExpendHeight(680)
    }
    catch (error) {
      console.warn(`[md][utools] enter failed`, error)
    }

    window.postMessage({ type: `utools:enter`, payload: action })
  }

  const leave = () => {
    window.postMessage({ type: `utools:leave` })
  }

  window.utools?.onPluginEnter(enter)
  window.utools?.onPluginOut(leave)

  window.exports = {
    'wechat-md': {
      mode: `none`,
      args: {
        enter,
        leave,
      },
    },
  }
})()
