import { themeMap } from '../../config/theme'
import { css2json, customCssWithTemplate, customizeTheme } from '../../utils/css-helper'
import { initRenderer } from '../../utils/renderer'

const hardCode = {
  getCurrentTab: `/**
 * 按 Alt/Option + Shift + F 可格式化
 * 如需使用主题色，请使用 var(--md-primary-color) 代替颜色值
 * 如：color: var(--md-primary-color);
 *
 * 召集令：如果你有好看的主题样式，欢迎分享，让更多人能够使用到你的主题。
 * 提交区：https://github.com/doocs/md/discussions/426
 */
/* 顶层容器样式 */
container {
}
/* 一级标题样式 */
h1 {
}
/* 二级标题样式 */
h2 {
}
/* 三级标题样式 */
h3 {
}
/* 四级标题样式 */
h4 {
}
/* 五级标题样式 */
h5 {
}
/* 六级标题样式 */
h6 {
}
/* 图片样式 */
image {
}
/* 引用样式 */
blockquote {
}
/* 引用段落样式 */
blockquote_p {
}
/* 段落样式 */
p {
}
/* 分割线样式 */
hr {
}
/* 行内代码样式 */
codespan {
}
/* 斜体样式 */
em {
}
/* 粗体样式 */
strong {
}
/* 链接样式 */
link {
}
/* 微信链接样式 */
wx_link {
}
/* 有序列表样式 */
ol {
}
/* 无序列表样式 */
ul {
}
/* 列表项样式 */
listitem {
}
/* 代码块样式 */
code {
}
/* 代码块外层样式 */
code_pre {
}
/* 行内公式样式 */
inline_katex {
}
/* 公式块样式 */
block_katex {
}
/* GFM note 样式 */
blockquote_note {
}
/* GFM tip 样式 */
blockquote_tip {
}
/* GFM important 样式 */
blockquote_important {
}
/* GFM warning 样式 */
blockquote_warning {
}
/* GFM caution 样式 */
blockquote_caution {
}
/* GFM 通用标题 */
blockquote_title {
}
/* GFM note 标题 */
blockquote_title_note {
}
/* GFM tip 标题 */
blockquote_title_tip {
}
/* GFM important 标题 */
blockquote_title_important {
}
/* GFM warning 标题 */
blockquote_title_warning {
}
/* GFM caution 标题 */
blockquote_title_caution {
}
/* GFM note 段落样式 */
blockquote_p_note {
}
/* GFM tip 段落样式 */
blockquote_p_tip {
}
/* GFM important 段落样式 */
blockquote_p_important {
}
/* GFM warning 段落样式 */
blockquote_p_warning {
}
/* GFM caution 段落样式 */
blockquote_p_caution {
}
`,
  primaryColor: `#FA5151`,
  fontSizeNumber: 14,
  fontSize: `14px`,
  theme: `grace` as const,
  isUseIndent: false,
  fontFamily: `Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif`,
}

export function getRenderer() {
  const renderer = initRenderer({
    theme: customCssWithTemplate(
      css2json(hardCode.getCurrentTab),
      hardCode.primaryColor,
      customizeTheme(themeMap[hardCode.theme], {
        fontSize: hardCode.fontSizeNumber,
        color: hardCode.primaryColor,
      }),
    ),
    fonts: hardCode.fontFamily,
    size: hardCode.fontSize,
    isUseIndent: hardCode.isUseIndent,
  })
  return renderer
}
