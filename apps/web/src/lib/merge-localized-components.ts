import type { CustomComponentDef } from '@md/shared'

/** Built-ins (localized) + user components; user overrides built-in by name. */
export function mergeLocalizedComponents(
  localizedBuiltins: CustomComponentDef[],
  userComponents: CustomComponentDef[],
): CustomComponentDef[] {
  const map = new Map(localizedBuiltins.map(c => [c.name, c]))
  for (const c of userComponents) {
    const existing = map.get(c.name)
    if (existing?.hidden || existing?.inline)
      continue
    map.set(c.name, c)
  }
  return [...map.values()]
}
