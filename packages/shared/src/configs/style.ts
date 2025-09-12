import type { IConfigOption } from '../types'
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
    label: `经典蓝`,
    value: `#0F4C81`,
    desc: `稳重冷静`,
  },
  {
    label: `翡翠绿`,
    value: `#009874`,
    desc: `自然平衡`,
  },
  {
    label: `活力橘`,
    value: `#FA5151`,
    desc: `热情活力`,
  },
  {
    label: `柠檬黄`,
    value: `#FECE00`,
    desc: `明亮温暖`,
  },
  {
    label: `薰衣紫`,
    value: `#92617E`,
    desc: `优雅神秘`,
  },
  {
    label: `天空蓝`,
    value: `#55C9EA`,
    desc: `清爽自由`,
  },
  {
    label: `玫瑰金`,
    value: `#B76E79`,
    desc: `奢华现代`,
  },
  {
    label: `橄榄绿`,
    value: `#556B2F`,
    desc: `沉稳自然`,
  },
  {
    label: `石墨黑`,
    value: `#333333`,
    desc: `内敛极简`,
  },
  {
    label: `雾烟灰`,
    value: `#A9A9A9`,
    desc: `柔和低调`,
  },
  {
    label: `樱花粉`,
    value: `#FFB7C5`,
    desc: `浪漫甜美`,
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
  codeBlockTheme: codeBlockThemeOptions[23].value,
  legend: legendOptions[3].value,
}
