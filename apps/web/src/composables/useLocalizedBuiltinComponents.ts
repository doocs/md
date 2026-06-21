import type { CustomComponentDef } from '@md/shared'
import type { AppLocale } from '@/i18n/types'
import { BUILT_IN_COMPONENTS } from '@md/core'
import { getBuiltinComponentExample } from '@/i18n/builtin-component-examples'

type Translate = (key: string) => string
type TranslateExists = (key: string) => boolean

function localizeBuiltinComponent(
  def: CustomComponentDef,
  locale: AppLocale,
  t: Translate,
  te: TranslateExists,
): CustomComponentDef {
  const baseKey = `component.builtinComponents.${def.name}`

  const props = def.props.map((prop) => {
    const propKey = `${baseKey}.props.${prop.name}`
    const defaultKey = `${baseKey}.propDefaults.${prop.name}`
    return {
      ...prop,
      description: te(propKey) ? t(propKey) : prop.description,
      default: te(defaultKey) ? t(defaultKey) : prop.default,
    }
  })

  return {
    ...def,
    description: te(`${baseKey}.description`) ? t(`${baseKey}.description`) : def.description,
    props,
    example: getBuiltinComponentExample(locale, def.name, def.example),
  }
}

export function createLocalizedBuiltinComponents(
  locale: AppLocale,
  t: Translate,
  te: TranslateExists,
): CustomComponentDef[] {
  return BUILT_IN_COMPONENTS.map(def => localizeBuiltinComponent(def, locale, t, te))
}

export function useLocalizedBuiltinComponents() {
  const { t, te, locale } = useI18n()

  return computed(() => createLocalizedBuiltinComponents(locale.value as AppLocale, t, te))
}
