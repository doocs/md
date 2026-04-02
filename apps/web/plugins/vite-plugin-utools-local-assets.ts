import type { Plugin } from 'vite'
import process from 'node:process'

/**
 * Vite 插件：在 uTools 构建时将远程资源替换为本地资源
 */
export function utoolsLocalAssetsPlugin(): Plugin {
  const isUTools = process.env.SERVER_ENV === `UTOOLS`

  return {
    name: `vite-plugin-utools-local-assets`,
    apply: `build`,
    transformIndexHtml: {
      order: `post`,
      handler(html) {
        if (!isUTools)
          return html

        // 替换 MathJax
        html = html.replace(
          /https:\/\/cdn-doocs\.oss-cn-shenzhen\.aliyuncs\.com\/npm\/mathjax@3\/es5\/tex-svg\.js/g,
          `./static/libs/mathjax/tex-svg.js`,
        )

        return html
      },
    },
  }
}
