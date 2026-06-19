import { altSign, ctrlSign, shiftSign } from '@md/shared/configs'

export interface ShortcutItem {
  label: string
  keys: string[]
}

export interface ShortcutCategory {
  title: string
  items: ShortcutItem[]
}

function mod(...keys: string[]) {
  return [ctrlSign, ...keys]
}

export const KEYBOARD_SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: `通用`,
    items: [
      { label: `命令面板`, keys: mod(shiftSign, `P`) },
      { label: `斜杠命令`, keys: [`/`] },
      { label: `关闭搜索面板`, keys: [`Esc`] },
    ],
  },
  {
    title: `编辑`,
    items: [
      { label: `撤销`, keys: mod(`Z`) },
      { label: `重做`, keys: mod(`Y`) },
      { label: `复制`, keys: mod(`C`) },
      { label: `粘贴`, keys: mod(`V`) },
      { label: `查找`, keys: mod(`F`) },
      { label: `替换`, keys: mod(`H`) },
      { label: `格式化`, keys: [altSign, shiftSign, `F`] },
    ],
  },
  {
    title: `格式`,
    items: [
      { label: `加粗`, keys: mod(`B`) },
      { label: `斜体`, keys: mod(`I`) },
      { label: `删除线`, keys: mod(`D`) },
      { label: `超链接`, keys: mod(`K`) },
      { label: `行内代码`, keys: mod(`E`) },
      { label: `标题 1`, keys: mod(`1`) },
      { label: `标题 2`, keys: mod(`2`) },
      { label: `标题 3`, keys: mod(`3`) },
      { label: `标题 4`, keys: mod(`4`) },
      { label: `标题 5`, keys: mod(`5`) },
      { label: `标题 6`, keys: mod(`6`) },
      { label: `无序列表`, keys: mod(`U`) },
      { label: `有序列表`, keys: mod(`O`) },
    ],
  },
]
