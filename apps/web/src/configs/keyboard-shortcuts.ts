import { altSign, ctrlSign, shiftSign } from '@md/shared/configs'
import { t } from '@/i18n/translate'

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

export function buildKeyboardShortcutCategories(): ShortcutCategory[] {
  return [
    {
      title: t(`keyboard.category.general`),
      items: [
        { label: t(`menu.commandPalette`), keys: mod(shiftSign, `P`) },
        { label: t(`menu.preferences`), keys: mod(`,`) },
        { label: t(`keyboard.slashCommand`), keys: [`/`] },
        { label: t(`keyboard.closeSearchPanel`), keys: [`Esc`] },
      ],
    },
    {
      title: t(`keyboard.category.edit`),
      items: [
        { label: t(`menu.undo`), keys: mod(`Z`) },
        { label: t(`menu.redo`), keys: mod(`Y`) },
        { label: t(`menu.copy`), keys: mod(`C`) },
        { label: t(`menu.paste`), keys: mod(`V`) },
        { label: t(`menu.find`), keys: mod(`F`) },
        { label: t(`menu.replace`), keys: mod(`H`) },
        { label: t(`keyboard.goToLine`), keys: mod(`G`) },
        { label: t(`menu.formatContent`), keys: [altSign, shiftSign, `F`] },
      ],
    },
    {
      title: t(`keyboard.category.navigation`),
      items: [
        { label: t(`keyboard.previousHeading`), keys: mod(altSign, `↑`) },
        { label: t(`keyboard.nextHeading`), keys: mod(altSign, `↓`) },
        { label: t(`keyboard.outlineNavigate`), keys: [`↑`, `↓`, `Enter`, `Esc`] },
      ],
    },
    {
      title: t(`keyboard.category.format`),
      items: [
        { label: t(`menu.bold`), keys: mod(`B`) },
        { label: t(`menu.italic`), keys: mod(`I`) },
        { label: t(`menu.strikethrough`), keys: mod(`D`) },
        { label: t(`menu.link`), keys: mod(`K`) },
        { label: t(`menu.inlineCode`), keys: mod(`E`) },
        { label: t(`menu.headingN`, { n: 1 }), keys: mod(`1`) },
        { label: t(`menu.headingN`, { n: 2 }), keys: mod(`2`) },
        { label: t(`menu.headingN`, { n: 3 }), keys: mod(`3`) },
        { label: t(`menu.headingN`, { n: 4 }), keys: mod(`4`) },
        { label: t(`menu.headingN`, { n: 5 }), keys: mod(`5`) },
        { label: t(`menu.headingN`, { n: 6 }), keys: mod(`6`) },
        { label: t(`menu.unorderedList`), keys: mod(`U`) },
        { label: t(`menu.orderedList`), keys: mod(`O`) },
      ],
    },
  ]
}
