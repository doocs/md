(() => {
  if (typeof window === `undefined`)
    return

  // 标识当前环境为 uTools
  window.__MD_UTOOLS__ = true

  /**
   * 安全调用 uTools API 方法
   * @param {string} method - 方法名
   * @param {...any} args - 方法参数
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
   * 插件进入回调
   * @param {object} action - 插件动作参数
   */
  const enter = (action) => {
    // 配置 uTools 窗口行为
    safeCall(`hideMainWindowWhenBlur`, false)
    safeCall(`showMainWindow`)
    safeCall(`setExpendHeight`, 680)

    // 通知前端应用
    window.postMessage({ type: `utools:enter`, payload: action }, `*`)
  }

  /**
   * 插件退出回调
   */
  const leave = () => {
    window.postMessage({ type: `utools:leave` }, `*`)
  }

  // 注册生命周期回调
  safeCall(`onPluginEnter`, enter)
  safeCall(`onPluginOut`, leave)

  // 导出插件配置
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
