import type { ComponentPropDef, CustomComponentDef } from '@md/shared'

/** Parse prop="value" / prop='value' pairs from a component usage example. */
export function parseExampleProps(example: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const m of example.matchAll(/(\w[\w-]*)=(?:"([^"]*)"|'([^']*)')/g)) {
    result[m[1]] = m[2] !== undefined ? m[2] : (m[3] ?? ``)
  }
  return result
}

/**
 * Collect attribute names already written in a tag's attribute chunk.
 * Ignores `=` that appear inside quoted values (e.g. URL query strings).
 */
export function alreadyUsedProps(attrsChunk: string): Set<string> {
  const used = new Set<string>()
  for (const m of attrsChunk.matchAll(/(\w[\w-]*)=(?:"[^"]*"|'[^']*')/g))
    used.add(m[1])
  // Incomplete attr at end: name=  /  name="partial  /  name='partial
  const incomplete = attrsChunk.match(/(?:^|\s)([A-Z_][\w-]*)\s*=\s*(?:"[^"]*|'[^']*)?$/i)
  if (incomplete)
    used.add(incomplete[1])
  return used
}

function placeholderForProp(p: ComponentPropDef): string {
  if (p.default !== undefined && p.default !== ``)
    return p.default
  if (p.type === `array`)
    return `[]`
  if (p.type === `boolean`)
    return `true`
  if (p.type === `number`)
    return `0`
  return p.name
}

/**
 * Format a prop as name="value" or name='value'.
 * The renderer only supports simple quoted strings (no escapes), so pick a quote
 * style that avoids the characters present in the value.
 */
export function formatAttr(name: string, value: string): string {
  if (value.includes(`"`) && !value.includes(`'`))
    return `${name}='${value}'`
  if (value.includes(`"`) && value.includes(`'`))
    return `${name}="${value.replace(/"/g, `'`)}"`
  return `${name}="${value}"`
}

/** Initial form values: defaults/placeholders, then overlay example props when present. */
export function getInitialPropValues(def: CustomComponentDef): Record<string, string> {
  const values: Record<string, string> = {}
  for (const p of def.props)
    values[p.name] = placeholderForProp(p)

  if (def.example) {
    const fromExample = parseExampleProps(def.example)
    Object.assign(values, fromExample)
  }
  return values
}

/**
 * Build a Markdown usage snippet.
 * - With `values`: assemble from prop defs (skip empty optional; keep empty required as placeholder).
 * - Without `values`: prefer `example`, else derive placeholders from prop types/defaults.
 */
export function buildComponentSnippet(
  def: CustomComponentDef,
  values?: Record<string, string>,
): string {
  if (values) {
    const parts: string[] = []
    for (const p of def.props) {
      const raw = values[p.name]
      const value = raw === undefined ? `` : raw
      if (value === `` && !p.required)
        continue
      parts.push(formatAttr(p.name, value === `` ? placeholderForProp(p) : value))
    }
    return `<${def.name}${parts.length ? ` ${parts.join(` `)}` : ``} />`
  }

  if (def.example)
    return def.example

  const propsStr = def.props
    .map(p => formatAttr(p.name, placeholderForProp(p)))
    .join(` `)
  return `<${def.name}${propsStr ? ` ${propsStr}` : ``} />`
}
