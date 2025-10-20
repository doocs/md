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

        // 替换 favicon
        html = html.replace(
          /https:\/\/cdn-doocs\.oss-cn-shenzhen\.aliyuncs\.com\/gh\/doocs\/md\/images\/favicon\.png/g,
          `./src/assets/images/favicon.png`,
        )

        // 替换 apple-touch-icon
        html = html.replace(
          /https:\/\/cdn-doocs\.oss-cn-shenzhen\.aliyuncs\.com\/gh\/doocs\/md\/images\/1648303220922-7e14aefa-816e-44c1-8604-ade709ca1c69\.png/g,
          `./src/assets/images/favicon.png`,
        )

        // 替换 MathJax
        html = html.replace(
          /https:\/\/cdn-doocs\.oss-cn-shenzhen\.aliyuncs\.com\/npm\/mathjax@3\/es5\/tex-svg\.js/g,
          `./static/libs/mathjax/tex-svg.js`,
        )

        // 替换 Mermaid
        html = html.replace(
          /https:\/\/cdn-doocs\.oss-cn-shenzhen\.aliyuncs\.com\/npm\/mermaid@11\/dist\/mermaid\.min\.js/g,
          `./static/libs/mermaid/mermaid.min.js`,
        )

        // 替换 WeChat Sync
        html = html.replace(
          /https:\/\/cdn-doocs\.oss-cn-shenzhen\.aliyuncs\.com\/gh\/wechatsync\/article-syncjs@latest\/dist\/main\.js/g,
          `./static/libs/article-syncjs/main.js`,
        )

        return html
      },
    },
  }
}
