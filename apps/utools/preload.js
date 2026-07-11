(() => {
  if (typeof window === `undefined`)
    return

  window.__MD_UTOOLS__ = true

  /**
   * Safely invoke a uTools API method.
   * @param {string} method - Method name
   * @param {...any} args - Method arguments
   */
  const safeCall = (method, ...args) => {
    try {
      if (typeof window.utools?.[method] === `function`) {
        window.utools[method](...args)
      }
    }
    catch (error) {
      console.warn(`[md][utools] ${method} failed:`, error)
    }
  }

  /**
   * Plugin enter callback.
   * @param {object} action - Plugin action payload
   */
  const enter = (action) => {
    // Configure uTools window behavior
    safeCall(`hideMainWindowWhenBlur`, false)
    safeCall(`showMainWindow`)
    safeCall(`setExpendHeight`, 680)

    window.postMessage({ type: `utools:enter`, payload: action }, `*`)
  }

  /**
   * Plugin leave callback.
   */
  const leave = () => {
    window.postMessage({ type: `utools:leave` }, `*`)
  }

  safeCall(`onPluginEnter`, enter)
  safeCall(`onPluginOut`, leave)

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
