/**
 * Renderer presets for the md-wechat tools.
 *
 * Deliberately duplicated instead of imported from `@md/mcp-server` or
 * `@md/shared/configs`: those modules pull style sheets through Vite `?raw`
 * imports that a Node bundle cannot resolve. Keeping the presets local also
 * keeps this plugin independent from every other workspace package.
 */

export interface PresetOption {
  label: string
  value: string
  description?: string
}

export const colorOptions: PresetOption[] = [
  { label: `Classic blue`, value: `#0F4C81`, description: `Calm and steady` },
  { label: `Emerald`, value: `#009874`, description: `Natural balance` },
  { label: `Vibrant red`, value: `#FA5151`, description: `Energetic` },
  { label: `Lemon`, value: `#FECE00`, description: `Bright and warm` },
  { label: `Mauve`, value: `#92617E`, description: `Elegant` },
  { label: `Sky`, value: `#55C9EA`, description: `Fresh and free` },
  { label: `Rose gold`, value: `#B76E79`, description: `Modern luxury` },
  { label: `Olive`, value: `#556B2F`, description: `Grounded` },
  { label: `Graphite`, value: `#333333`, description: `Minimal` },
  { label: `Ash`, value: `#A9A9A9`, description: `Soft and quiet` },
  { label: `Sakura`, value: `#FFB7C5`, description: `Romantic` },
]

export const fontFamilyOptions: PresetOption[] = [
  {
    label: `Sans serif`,
    value: `-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif`,
    description: `System UI stack`,
  },
  {
    label: `Serif`,
    value: `Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif`,
    description: `Editorial stack`,
  },
  {
    label: `Monospace`,
    value: `Menlo, Monaco, 'Courier New', monospace`,
    description: `Code stack`,
  },
]

export const fontSizeOptions: PresetOption[] = [
  { label: `14px`, value: `14px`, description: `Smaller` },
  { label: `15px`, value: `15px`, description: `Small` },
  { label: `16px`, value: `16px`, description: `Recommended` },
  { label: `17px`, value: `17px`, description: `Large` },
  { label: `18px`, value: `18px`, description: `Larger` },
]

export const lineHeightOptions: PresetOption[] = [
  { label: `1.5`, value: `1.5`, description: `Tight` },
  { label: `1.65`, value: `1.65`, description: `Snug` },
  { label: `1.75`, value: `1.75`, description: `Recommended` },
  { label: `1.9`, value: `1.9`, description: `Loose` },
  { label: `2.05`, value: `2.05`, description: `Airy` },
]

export const blockSpacingOptions: PresetOption[] = [
  { label: `0.75x`, value: `0.75`, description: `Tight` },
  { label: `0.9x`, value: `0.9`, description: `Snug` },
  { label: `1x`, value: `1`, description: `Recommended` },
  { label: `1.15x`, value: `1.15`, description: `Loose` },
  { label: `1.35x`, value: `1.35`, description: `Airy` },
]

export const legendOptions: PresetOption[] = [
  { label: `Title first`, value: `title-alt` },
  { label: `Alt first`, value: `alt-title` },
  { label: `Title only`, value: `title` },
  { label: `Alt only`, value: `alt` },
  { label: `Filename`, value: `filename` },
  { label: `Hidden`, value: `none` },
]

export const codeBlockThemePrefix = `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlightjs/11.11.1/styles/`

export const codeBlockThemeOptions: PresetOption[] = [
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
].map(name => ({ label: name, value: `${codeBlockThemePrefix}${name}.min.css` }))

export const allowedCodeBlockThemeUrls = new Set(
  codeBlockThemeOptions.map(option => option.value),
)

export const defaultRenderOptions = {
  theme: `default`,
  primaryColor: colorOptions[0].value,
  fontFamily: fontFamilyOptions[0].value,
  fontSize: fontSizeOptions[2].value,
  lineHeight: lineHeightOptions[2].value,
  blockSpacing: blockSpacingOptions[2].value,
  linkColor: `#576b95`,
  legend: `alt`,
  isMacCodeBlock: false,
  isShowLineNumber: false,
  citeStatus: false,
  countStatus: false,
  themeMode: `light` as const,
  isUseIndent: false,
  isUseJustify: false,
}
