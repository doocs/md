/**
 * @description: 渲染管线单测（真实跑 doocs/md 的渲染器，不 mock）
 *
 * 主题样式表用源码目录（packages/shared/src/configs/theme-css）代替打包后的 theme/，
 * 所以测试不依赖构建产物。
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(testDir, `..`, `..`, `..`)

// 必须在 import ../src/render 之前设置：模块顶层会读这个变量
process.env.MD_WECHAT_THEME_DIR = path.join(repoRoot, `packages`, `shared`, `src`, `configs`, `theme-css`)

let render: typeof import('../src/render')

beforeAll(async () => {
  render = await import(`../src/render`)
})

describe(`renderArticle`, () => {
  it(`把 Markdown 渲染成带样式的 HTML`, async () => {
    const result = await render.renderArticle({ markdown: `# 标题\n\n正文 **粗体**` })

    expect(result.html).toContain(`<style>`)
    expect(result.html).toContain(`--md-primary-color`)
    expect(result.html).toContain(`<h1`)
    expect(result.readingTime.words).toBeGreaterThan(0)
    expect(result.warnings).toEqual([])
  })

  it(`转换 callout 提示块，而不是原样输出标记`, async () => {
    const result = await render.renderArticle({ markdown: `> [!NOTE] 提示\n> 内容` })

    expect(result.html).not.toContain(`[!NOTE]`)
    expect(result.html.length).toBeGreaterThan(0)
  })

  it(`未知主题回退到默认主题并给出警告`, async () => {
    const result = await render.renderArticle({ markdown: `# 标题`, theme: `not-a-theme` })

    expect(result.warnings.join(`\n`)).toContain(`not-a-theme`)
    expect(result.html).toContain(`<style>`)
  })

  it(`透传主色与字号`, async () => {
    const result = await render.renderArticle({ markdown: `# 标题`, primaryColor: `#123456`, fontSize: `18px` })

    expect(result.html).toContain(`#123456`)
    expect(result.html).toContain(`18px`)
  })

  it(`从主题目录发现内置主题`, () => {
    expect(render.listThemes()).toEqual(expect.arrayContaining([`default`, `grace`, `simple`]))
  })
})
