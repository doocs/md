export interface FormulaInput {
  latex: string
  displayMode: boolean
  sourceRaw: string | null
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, `&amp;`)
    .replace(/</g, `&lt;`)
    .replace(/>/g, `&gt;`)
    .replace(/"/g, `&quot;`)
    .replace(/'/g, `&#39;`)
}

export function unwrapFormula(text: string): FormulaInput {
  let current = text.trim()
  let displayMode = false

  let clean = true
  while (clean) {
    clean = false
    current = current.trim()

    if (current.startsWith(`$$`) && current.endsWith(`$$`) && current.length > 4) {
      current = current.slice(2, -2)
      displayMode = true
      clean = true
    }
    else if (current.startsWith(`\\[`) && current.endsWith(`\\]`)) {
      current = current.slice(2, -2)
      displayMode = true
      clean = true
    }
    else if (current.startsWith(`\\(`) && current.endsWith(`\\)`)) {
      current = current.slice(2, -2)
      displayMode = false
      clean = true
    }
    else if (current.startsWith(`$`) && current.endsWith(`$`) && current.length > 2) {
      current = current.slice(1, -1)
      displayMode = false
      clean = true
    }
  }

  return {
    latex: current.trim(),
    displayMode,
    sourceRaw: text.trim(),
  }
}

export function normalizeFormulaInput(text: string): FormulaInput {
  const trimmed = text.trim()
  if (!trimmed) {
    return { latex: ``, displayMode: false, sourceRaw: null }
  }

  const unwrapped = unwrapFormula(trimmed)
  const isWrapped = unwrapped.latex !== trimmed || unwrapped.displayMode || /^(\$\$|\\\[|\\\(|\$)/.test(trimmed)

  return {
    latex: unwrapped.latex,
    displayMode: unwrapped.displayMode || trimmed.includes(`\n`),
    sourceRaw: isWrapped ? trimmed : null,
  }
}

export function wrapFormula(latex: string, displayMode: boolean): string {
  const content = latex.trim()
  if (!content)
    return ``

  return displayMode
    ? `$$\n${content}\n$$`
    : `$${content}$`
}
