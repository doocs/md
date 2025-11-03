import { initRenderer } from '@md/core'
import { themeMap } from '@md/shared/configs'
import { css2json, customCssWithTemplate, customizeTheme, postProcessHtml, renderMarkdown } from '@/utils'
import { useThemeStore } from './theme'

/**
 * 渲染 Store
 * 负责 Markdown 渲染、HTML 输出、标题提取等
 */
export const useRenderStore = defineStore(`render`, () => {
  // 输出的 HTML
  const output = ref(``)

  // 阅读时间统计
  const readingTime = reactive({
    chars: 0,
    words: 0,
    minutes: 0,
  })

  // 文章标题列表（用于生成目录）
  const titleList = ref<{
    url: string
    title: string
    level: number
  }[]>([])

  // 渲染器实例（延迟初始化）
  let renderer: ReturnType<typeof initRenderer> | null = null

  // 初始化渲染器
  const initRendererInstance = (cssContent: string, theme: any, fonts: string, size: string, options: any) => {
    const fontSize = Number(size.replace(`px`, ``))
    const themeConfig = customCssWithTemplate(
      css2json(cssContent),
      options.primaryColor,
      customizeTheme(theme, { fontSize, color: options.primaryColor }),
    )

    renderer = initRenderer({
      theme: themeConfig,
      fonts,
      size,
      isUseIndent: options.isUseIndent,
      isUseJustify: options.isUseJustify,
      isMacCodeBlock: options.isMacCodeBlock,
      isShowLineNumber: options.isShowLineNumber,
    })

    return renderer
  }

  // 获取渲染器
  const getRenderer = () => renderer

  // 获取主题配置
  const getTheme = (cssContent: string, theme: any, size: string, color: string) => {
    const fontSize = Number(size.replace(`px`, ``))
    return customCssWithTemplate(
      css2json(cssContent),
      color,
      customizeTheme(theme, { fontSize, color }),
    )
  }

  // 提取标题
  const extractTitles = () => {
    const div = document.createElement(`div`)
    div.innerHTML = output.value
    const list = div.querySelectorAll<HTMLElement>(`[data-heading]`)

    titleList.value = []
    let i = 0
    for (const item of list) {
      item.setAttribute(`id`, `${i}`)
      titleList.value.push({
        url: `#${i}`,
        title: `${item.textContent}`,
        level: Number(item.tagName.slice(1)),
      })
      i++
    }
    output.value = div.innerHTML
  }

  // 渲染内容
  const render = (content: string, options: any) => {
    if (!renderer) {
      throw new Error(`Renderer not initialized. Call initRendererInstance first.`)
    }

    // 重置渲染器配置
    renderer.reset({
      citeStatus: options.isCiteStatus,
      legend: options.legend,
      isUseIndent: options.isUseIndent,
      isUseJustify: options.isUseJustify,
      countStatus: options.isCountStatus,
      isMacCodeBlock: options.isMacCodeBlock,
      isShowLineNumber: options.isShowLineNumber,
    })

    // 渲染 Markdown
    const { html: baseHtml, readingTime: readingTimeResult } = renderMarkdown(content, renderer)

    // 更新统计信息
    readingTime.chars = content.length
    readingTime.words = readingTimeResult.words
    readingTime.minutes = Math.ceil(readingTimeResult.minutes)

    // 后处理 HTML
    output.value = postProcessHtml(baseHtml, readingTimeResult, renderer)

    // 提取标题
    extractTitles()

    return output.value
  }

  // 更新主题
  const updateTheme = (cssContent: string, theme: any, fonts: string, size: string, color: string) => {
    if (!renderer)
      return

    const newTheme = getTheme(cssContent, theme, size, color)
    renderer.setOptions({
      theme: newTheme,
      fonts,
      size,
    })
  }

  // 更新 CSS（兼容旧接口）
  const updateCss = (cssContent: string) => {
    if (!renderer)
      return

    const themeStore = useThemeStore()
    const themeKey = themeStore.theme as keyof typeof themeMap
    const newTheme = getTheme(
      cssContent,
      themeMap[themeKey], // 使用 themeMap 将字符串转换为主题对象
      themeStore.fontSize,
      themeStore.primaryColor,
    )
    renderer.setOptions({
      theme: newTheme,
    })
  }

  return {
    // State
    output,
    readingTime,
    titleList,

    // Actions
    initRendererInstance,
    getRenderer,
    render,
    updateTheme,
    updateCss,
    getTheme,
  }
})
