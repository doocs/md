import type { Completion, CompletionContext, CompletionResult, CompletionSection } from '@codemirror/autocomplete'
import type { EditorView } from '@codemirror/view'
import type { CustomComponentDef } from '@md/shared'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import { Prec } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import { t } from '@/i18n/translate'
import { alreadyUsedProps, buildComponentSnippet } from '@/lib/component-snippet'

/** Match `<` + optional name prefix at end of text before cursor. */
const COMPONENT_NAME_RE = /<[A-Z]*$/i

/**
 * Match an open component tag with optional trailing partial prop name.
 * Captures: 1 = component name, 2 = attrs before current prop, 3 = partial prop being typed.
 */
const PROP_CONTEXT_RE = /<([A-Z][A-Za-z0-9]*)\b([^>]*?)\s([a-zA-Z][\w-]*)?$/

const CODE_NODE_NAMES = new Set([
  `FencedCode`,
  `CodeBlock`,
  `InlineCode`,
])

const ICON_COMPONENT = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`

const ICON_PROP = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"/><path d="M4 12h10"/><path d="M4 17h7"/></svg>`

function truncateDetail(text: string | undefined, max = 42): string | undefined {
  if (!text)
    return undefined
  const trimmed = text.trim()
  if (trimmed.length <= max)
    return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

function renderSectionHeader(section: CompletionSection): HTMLElement {
  const el = document.createElement(`li`)
  el.className = `md-completion-section`
  el.setAttribute(`aria-hidden`, `true`)
  el.textContent = section.name
  return el
}

function componentSection(): CompletionSection {
  return {
    name: t(`component.completionSectionComponents`),
    rank: 1,
    header: renderSectionHeader,
  }
}

function propSection(): CompletionSection {
  return {
    name: t(`component.completionSectionProps`),
    rank: 1,
    header: renderSectionHeader,
  }
}

/** True when cursor is inside fenced / indented / inline code. */
function inCodeContext(context: CompletionContext): boolean {
  try {
    const node = syntaxTree(context.state).resolveInner(context.pos, -1)
    for (let n: typeof node | null = node; n; n = n.parent) {
      if (CODE_NODE_NAMES.has(n.name))
        return true
    }
  }
  catch {
    // Tree may be unavailable during early updates
  }
  return false
}

function renderOptionIcon(completion: Completion): HTMLElement {
  const icon = document.createElement(`span`)
  icon.className = `md-completion-icon`
  if (completion.type === `property`) {
    icon.classList.add(`md-completion-icon--prop`)
    icon.innerHTML = ICON_PROP
    icon.title = t(`component.completionSectionProps`)
  }
  else {
    icon.classList.add(`md-completion-icon--component`)
    icon.innerHTML = ICON_COMPONENT
    icon.title = t(`component.completionSectionComponents`)
  }
  return icon
}

function applyComponentSnippet(view: EditorView, def: CustomComponentDef, from: number, to: number) {
  const insert = buildComponentSnippet(def)
  // Prefer replacing the leading `<` when present; otherwise replace the typed range only
  const start = from > 0 && view.state.doc.sliceString(from - 1, from) === `<`
    ? from - 1
    : from
  view.dispatch({
    changes: { from: start, to, insert },
    selection: { anchor: start + insert.length },
  })
}

function componentNameCompletions(
  context: CompletionContext,
  components: CustomComponentDef[],
): CompletionResult | null {
  const before = context.matchBefore(COMPONENT_NAME_RE)
  if (!before)
    return null

  const typed = before.text.slice(1) // text after `<`
  // Allow bare `<` to list all components. If a letter was typed, require PascalCase
  // (`<Q…`) so lowercase HTML tags like `<div` do not open the menu.
  if (!context.explicit && typed.length > 0 && !/^[A-Z]/.test(typed))
    return null

  // Filter against the name part only (after `<`). Including `<` in the filter
  // text makes every option fail the default fuzzy match.
  const nameFrom = before.from + 1
  const query = typed.toLowerCase()
  const section = componentSection()
  const options: Completion[] = components
    .filter(c => !query || c.name.toLowerCase().startsWith(query))
    .map(c => ({
      label: c.name,
      detail: truncateDetail(c.description),
      type: `class`,
      boost: c.builtIn ? 1 : 0,
      section,
      apply: (view, _completion, from, to) => {
        applyComponentSnippet(view, c, from, to)
      },
    }))

  if (!options.length && !context.explicit)
    return null

  return {
    from: nameFrom,
    options,
    validFor: /^[A-Z]*$/i,
  }
}

function propCompletions(
  context: CompletionContext,
  components: CustomComponentDef[],
): CompletionResult | null {
  const line = context.state.doc.lineAt(context.pos)
  const textBefore = context.state.doc.sliceString(line.from, context.pos)
  const match = textBefore.match(PROP_CONTEXT_RE)
  if (!match)
    return null

  const componentName = match[1]
  const attrsChunk = match[2] ?? ``
  const partial = match[3] ?? ``
  const def = components.find(c => c.name === componentName)
  if (!def || !def.props.length)
    return null

  // Still typing the component name (no space after name yet) — handled elsewhere
  const afterName = textBefore.slice(textBefore.indexOf(`<${componentName}`) + componentName.length + 1)
  if (!/^\s/.test(afterName) && !attrsChunk)
    return null

  const used = alreadyUsedProps(attrsChunk)
  const query = partial.toLowerCase()
  const section = propSection()
  const options: Completion[] = def.props
    .filter(p => !used.has(p.name) && (!query || p.name.toLowerCase().startsWith(query)))
    .map(p => ({
      label: p.name,
      detail: truncateDetail(p.description || p.type || `string`),
      type: `property`,
      section,
      apply: (view, _completion, from, to) => {
        const insert = `${p.name}=""`
        view.dispatch({
          changes: { from, to, insert },
          selection: { anchor: from + insert.length - 1 },
        })
      },
    }))

  if (!options.length && !context.explicit)
    return null

  const from = partial
    ? context.pos - partial.length
    : context.pos

  return {
    from,
    options,
    validFor: /^[\w-]*$/,
  }
}

export function createComponentCompletionSource(
  getComponents: () => CustomComponentDef[],
) {
  return (context: CompletionContext): CompletionResult | null => {
    if (inCodeContext(context))
      return null

    const components = getComponents()
    if (!components.length)
      return null

    return propCompletions(context, components)
      ?? componentNameCompletions(context, components)
  }
}

/**
 * CodeMirror extensions for JSX-style custom component autocomplete.
 * Uses Enter / click to accept — does not bind Tab (conflicts with markdown indent).
 *
 * Uses `override` so Markdown/HTML language completions (tags, etc.) do not mix in.
 */
export function createComponentCompletionExtension(
  getComponents: () => CustomComponentDef[],
) {
  return [
    autocompletion({
      override: [createComponentCompletionSource(getComponents)],
      defaultKeymap: false,
      activateOnTyping: true,
      icons: false,
      aboveCursor: false,
      tooltipClass: () => `md-completion-tooltip`,
      optionClass: (completion) => {
        if (completion.type === `property`)
          return `md-completion-option md-completion-option--prop`
        return `md-completion-option md-completion-option--component`
      },
      addToOptions: [{
        position: 25,
        render: completion => renderOptionIcon(completion),
      }],
    }),
    Prec.high(keymap.of(completionKeymap.filter(b => b.key !== `Tab`))),
  ]
}
