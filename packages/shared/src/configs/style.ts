import type { IConfigOption } from '../types'
import type { ThemeName } from './theme-css'
import { themeOptions } from './theme'

export const fontFamilyOptions: IConfigOption[] = [
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
]

export const fontSizeOptions: IConfigOption[] = [
  {
    label: `14px`,
    value: `14px`,
    desc: `更小`,
  },
  {
    label: `15px`,
    value: `15px`,
    desc: `稍小`,
  },
  {
    label: `16px`,
    value: `16px`,
    desc: `推荐`,
  },
  {
    label: `17px`,
    value: `17px`,
    desc: `稍大`,
  },
  {
    label: `18px`,
    value: `18px`,
    desc: `更大`,
  },
]

export const colorOptions: IConfigOption[] = [
  {
    label: `克莱因蓝`,
    value: `#002FA7`,
    desc: `深邃纯粹`,
  },
  {
    label: `薄荷绿`,
    value: `#3DB89F`,
    desc: `清新治愈`,
  },
  {
    label: `活力橘`,
    value: `#FF6B35`,
    desc: `热情活力`,
  },
  {
    label: `蜜糖黄`,
    value: `#E0A800`,
    desc: `明亮温暖`,
  },
  {
    label: `薰衣紫`,
    value: `#9B8EC8`,
    desc: `优雅神秘`,
  },
  {
    label: `天空蓝`,
    value: `#3498DB`,
    desc: `清爽自由`,
  },
  {
    label: `玫瑰金`,
    value: `#C08081`,
    desc: `柔和奢华`,
  },
  {
    label: `橄榄绿`,
    value: `#6B8E23`,
    desc: `沉稳自然`,
  },
  {
    label: `石墨黑`,
    value: `#333333`,
    desc: `内敛极简`,
  },
  {
    label: `莫兰迪灰`,
    value: `#8E8E8E`,
    desc: `高级灰调`,
  },
  {
    label: `樱花粉`,
    value: `#E8728A`,
    desc: `浪漫甜美`,
  },
]

export const backgroundOptions: IConfigOption[] = [
  {
    label: `白色`,
    value: `#ffffff`,
    desc: `默认`,
  },
  {
    label: `暖白`,
    value: `#faf8f5`,
    desc: `护眼纸张`,
  },
  {
    label: `浅灰`,
    value: `#f5f5f5`,
    desc: `柔和底色`,
  },
  {
    label: `米白`,
    value: `#fdfcfb`,
    desc: `杂志质感`,
  },
  {
    label: `浅蓝`,
    value: `#f0f7ff`,
    desc: `清新`,
  },
  {
    label: `浅绿`,
    value: `#f0f9f4`,
    desc: `自然`,
  },
  {
    label: `深色`,
    value: `#1a1b26`,
    desc: `暗夜模式`,
  },
]

export const backgroundPatternOptions: IConfigOption[] = [
  {
    label: `无`,
    value: `none`,
    desc: `纯色`,
  },
  {
    label: `方格`,
    value: `grid`,
    desc: `坐标纸`,
  },
  {
    label: `星点`,
    value: `dots`,
    desc: `Claude 风格`,
  },
  {
    label: `横线`,
    value: `lines`,
    desc: `信纸`,
  },
  {
    label: `竖线`,
    value: `vlines`,
    desc: `笔记本`,
  },
]

export const widthOptions: IConfigOption[] = [
  {
    label: `移动端`,
    value: `w-[375px]`,
    desc: `固定`,
  },
  {
    label: `电脑端`,
    value: `w-full`,
    desc: `适应`,
  },
]

const codeBlockUrlPrefix = `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlightjs/11.11.1/styles/`
const codeBlockThemeList = [
  `1c-light`,
  `a11y-dark`,
  `a11y-light`,
  `agate`,
  `an-old-hope`,
  `androidstudio`,
  `arduino-light`,
  `arta`,
  `ascetic`,
  `atom-one-dark-reasonable`,
  `atom-one-dark`,
  `atom-one-light`,
  `brown-paper`,
  `codepen-embed`,
  `color-brewer`,
  `dark`,
  `default`,
  `devibeans`,
  `docco`,
  `far`,
  `felipec`,
  `foundation`,
  `github-dark-dimmed`,
  `github-dark`,
  `github`,
  `gml`,
  `googlecode`,
  `gradient-dark`,
  `gradient-light`,
  `grayscale`,
  `hybrid`,
  `idea`,
  `intellij-light`,
  `ir-black`,
  `isbl-editor-dark`,
  `isbl-editor-light`,
  `kimbie-dark`,
  `kimbie-light`,
  `lightfair`,
  `lioshi`,
  `magula`,
  `mono-blue`,
  `monokai-sublime`,
  `monokai`,
  `night-owl`,
  `nnfx-dark`,
  `nnfx-light`,
  `nord`,
  `obsidian`,
  `panda-syntax-dark`,
  `panda-syntax-light`,
  `paraiso-dark`,
  `paraiso-light`,
  `pojoaque`,
  `purebasic`,
  `qtcreator-dark`,
  `qtcreator-light`,
  `rainbow`,
  `routeros`,
  `school-book`,
  `shades-of-purple`,
  `srcery`,
  `stackoverflow-dark`,
  `stackoverflow-light`,
  `sunburst`,
  `tokyo-night-dark`,
  `tokyo-night-light`,
  `tomorrow-night-blue`,
  `tomorrow-night-bright`,
  `vs`,
  `vs2015`,
  `xcode`,
  `xt256`,
]

export const codeBlockThemeOptions: IConfigOption[] = codeBlockThemeList.map(codeBlockTheme => ({
  label: codeBlockTheme,
  value: `${codeBlockUrlPrefix}${codeBlockTheme}.min.css`,
  desc: ``,
}))

export const headingLevelOptions: IConfigOption[] = [
  { label: `一级标题`, value: `h1`, desc: `` },
  { label: `二级标题`, value: `h2`, desc: `` },
  { label: `三级标题`, value: `h3`, desc: `` },
  { label: `四级标题`, value: `h4`, desc: `` },
  { label: `五级标题`, value: `h5`, desc: `` },
  { label: `六级标题`, value: `h6`, desc: `` },
]

export const headingStyleOptions: IConfigOption[] = [
  { label: `默认`, value: `default`, desc: `` },
  { label: `主题色文字`, value: `color-only`, desc: `` },
  { label: `下边框`, value: `border-bottom`, desc: `` },
  { label: `左边框`, value: `border-left`, desc: `` },
  { label: `自定义`, value: `custom`, desc: `` },
]

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export type HeadingStyleType = 'default' | 'color-only' | 'border-bottom' | 'border-left' | 'custom'

export type HeadingStyles = {
  [K in HeadingLevel]?: HeadingStyleType
}

export const defaultHeadingStyles: HeadingStyles = {}

export const legendOptions: IConfigOption[] = [
  {
    label: `title 优先`,
    value: `title-alt`,
    desc: ``,
  },
  {
    label: `alt 优先`,
    value: `alt-title`,
    desc: ``,
  },
  {
    label: `只显示 title`,
    value: `title`,
    desc: ``,
  },
  {
    label: `只显示 alt`,
    value: `alt`,
    desc: ``,
  },
  {
    label: `文件名`,
    value: `filename`,
    desc: ``,
  },
  {
    label: `不显示`,
    value: `none`,
    desc: ``,
  },
]

export const defaultStyleConfig = {
  isCiteStatus: false,
  isMacCodeBlock: true,
  isShowLineNumber: false,
  isCountStatus: false,
  theme: themeOptions[0].value,
  fontFamily: fontFamilyOptions[0].value,
  fontSize: fontSizeOptions[2].value,
  primaryColor: colorOptions[0].value,
  backgroundColor: `#ffffff`,
  backgroundPattern: `none`,
  codeBlockTheme: codeBlockThemeOptions[23].value,
  legend: legendOptions[3].value,
  headingStyles: defaultHeadingStyles as HeadingStyles,
}

export interface PerThemeSettings {
  primaryColor: string
  fontFamily: string
  fontSize: string
  backgroundColor: string
  backgroundPattern: string
  codeBlockTheme: string
  headingStyles: HeadingStyles
  isShowLineNumber: boolean
  isMacCodeBlock: boolean
}

/**
 * 每个主题的推荐默认配置
 * 切换主题时自动加载对应配置，确保风格统一
 */
export const perThemeDefaults: PerThemeSettingsMap = {
  default: {
    primaryColor: `#0a3a66`,
    fontFamily: fontFamilyOptions[0].value,
    fontSize: `16px`,
    backgroundColor: `#ffffff`,
    backgroundPattern: `none`,
    codeBlockTheme: codeBlockThemeOptions[23].value,
    headingStyles: {},
    isShowLineNumber: false,
    isMacCodeBlock: true,
  },
  grace: {
    primaryColor: `#6d4560`,
    fontFamily: fontFamilyOptions[0].value,
    fontSize: `16px`,
    backgroundColor: `#ffffff`,
    backgroundPattern: `none`,
    codeBlockTheme: codeBlockThemeOptions[23].value,
    headingStyles: {},
    isShowLineNumber: false,
    isMacCodeBlock: true,
  },
  simple: {
    primaryColor: `#222222`,
    fontFamily: fontFamilyOptions[0].value,
    fontSize: `16px`,
    backgroundColor: `#ffffff`,
    backgroundPattern: `none`,
    codeBlockTheme: codeBlockThemeOptions[23].value,
    headingStyles: {},
    isShowLineNumber: false,
    isMacCodeBlock: true,
  },
  ink: {
    primaryColor: `#333333`,
    fontFamily: fontFamilyOptions[1].value,
    fontSize: `16px`,
    backgroundColor: `#faf8f5`,
    backgroundPattern: `none`,
    codeBlockTheme: codeBlockThemeOptions[23].value,
    headingStyles: {},
    isShowLineNumber: false,
    isMacCodeBlock: true,
  },
  newspaper: {
    primaryColor: `#0F4C81`,
    fontFamily: fontFamilyOptions[0].value,
    fontSize: `16px`,
    backgroundColor: `#f5f5f5`,
    backgroundPattern: `grid`,
    codeBlockTheme: codeBlockThemeOptions[23].value,
    headingStyles: {},
    isShowLineNumber: false,
    isMacCodeBlock: true,
  },
}

export function defaultPerThemeSettings(themeName?: ThemeName): PerThemeSettings {
  const base: PerThemeSettings = {
    primaryColor: defaultStyleConfig.primaryColor,
    fontFamily: defaultStyleConfig.fontFamily,
    fontSize: defaultStyleConfig.fontSize,
    backgroundColor: defaultStyleConfig.backgroundColor,
    backgroundPattern: defaultStyleConfig.backgroundPattern,
    codeBlockTheme: defaultStyleConfig.codeBlockTheme,
    headingStyles: { ...defaultStyleConfig.headingStyles },
    isShowLineNumber: defaultStyleConfig.isShowLineNumber,
    isMacCodeBlock: defaultStyleConfig.isMacCodeBlock,
  }
  if (!themeName) {
    return base
  }
  const overrides = perThemeDefaults[themeName]
  return overrides ? { ...base, ...overrides } : base
}

export type PerThemeSettingsMap = Partial<Record<ThemeName, PerThemeSettings>>
