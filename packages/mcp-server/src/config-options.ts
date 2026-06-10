export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export type HeadingStyleType = 'default' | 'color-only' | 'border-bottom' | 'border-left' | 'custom'

/**
 * Static option lists for MCP tools.
 * Defined here (not imported from @md/shared/configs/style) because style.ts
 * pulls in theme-css with Vite ?raw imports that Node.js cannot resolve.
 */

export const colorOptions = [
  { value: `#0F4C81`, label: `经典蓝`, desc: `稳重冷静` },
  { value: `#009874`, label: `翡翠绿`, desc: `自然平衡` },
  { value: `#FA5151`, label: `活力橘`, desc: `热情活力` },
  { value: `#FECE00`, label: `柠檬黄`, desc: `明亮温暖` },
  { value: `#92617E`, label: `薰衣紫`, desc: `优雅神秘` },
  { value: `#55C9EA`, label: `天空蓝`, desc: `清爽自由` },
  { value: `#B76E79`, label: `玫瑰金`, desc: `奢华现代` },
  { value: `#556B2F`, label: `橄榄绿`, desc: `沉稳自然` },
  { value: `#333333`, label: `石墨黑`, desc: `内敛极简` },
  { value: `#A9A9A9`, label: `雾烟灰`, desc: `柔和低调` },
  { value: `#FFB7C5`, label: `樱花粉`, desc: `浪漫甜美` },
] as const

export const themeOptions = [
  { value: `default`, label: `经典`, desc: `` },
  { value: `grace`, label: `优雅`, desc: `@brzhang` },
  { value: `simple`, label: `简洁`, desc: `@okooo5km` },
] as const

export const fontFamilyOptions = [
  {
    label: `无衬线`,
    value: `-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif`,
    desc: `字体123Abc`,
  },
  {
    label: `衬线`,
    value: `Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif`,
    desc: `字体123Abc`,
  },
  {
    label: `等宽`,
    value: `Menlo, Monaco, 'Courier New', monospace`,
    desc: `字体123Abc`,
  },
] as const

export const fontSizeOptions = [
  { label: `14px`, value: `14px`, desc: `更小` },
  { label: `15px`, value: `15px`, desc: `稍小` },
  { label: `16px`, value: `16px`, desc: `推荐` },
  { label: `17px`, value: `17px`, desc: `稍大` },
  { label: `18px`, value: `18px`, desc: `更大` },
] as const

export const legendOptions = [
  { label: `title 优先`, value: `title-alt`, desc: `` },
  { label: `alt 优先`, value: `alt-title`, desc: `` },
  { label: `只显示 title`, value: `title`, desc: `` },
  { label: `只显示 alt`, value: `alt`, desc: `` },
  { label: `文件名`, value: `filename`, desc: `` },
  { label: `不显示`, value: `none`, desc: `` },
] as const

export type LegendValue = typeof legendOptions[number][`value`]

export const headingStyleOptions = [
  { label: `默认`, value: `default`, desc: `` },
  { label: `主题色文字`, value: `color-only`, desc: `` },
  { label: `下边框`, value: `border-bottom`, desc: `` },
  { label: `左边框`, value: `border-left`, desc: `` },
  { label: `自定义`, value: `custom`, desc: `` },
] as const

export type HeadingStylesInput = Partial<Record<HeadingLevel, HeadingStyleType>>

const codeBlockUrlPrefix = `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlightjs/11.11.1/styles/`

const codeBlockThemeList = [
  `github`,
  `github-dark`,
  `atom-one-light`,
  `atom-one-dark`,
  `monokai`,
  `vs`,
  `xcode`,
  `nord`,
  `tokyo-night-light`,
  `tokyo-night-dark`,
] as const

export const codeBlockThemeOptions = codeBlockThemeList.map(name => ({
  label: name,
  value: `${codeBlockUrlPrefix}${name}.min.css`,
  desc: ``,
}))

export const defaultRenderOptions = {
  theme: `default` as const,
  primaryColor: colorOptions[0].value,
  fontFamily: fontFamilyOptions[0].value,
  fontSize: fontSizeOptions[2].value,
  legend: legendOptions[3].value as LegendValue,
  codeBlockTheme: codeBlockThemeOptions[0].value,
  isMacCodeBlock: false,
  isShowLineNumber: false,
  citeStatus: false,
  countStatus: false,
  themeMode: `light` as const,
  isUseIndent: false,
  isUseJustify: false,
}
