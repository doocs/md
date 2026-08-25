import type { FrontMatterData } from '@md/shared/types/front-matter'
import { load as loadYaml } from 'js-yaml'

export interface ParsedFrontMatter {
  attributes: FrontMatterData
  body: string
}

/** CommonMark / Jekyll-style YAML fence, including optional BOM and `...` closer. */
const FRONT_MATTER_RE = /^\uFEFF?(?:---|= yaml =)[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.|= yaml =)[ \t]*(?:\r?\n|$)/

/**
 * Markdown list markers (`* item`) are YAML aliases. Blog front matter often
 * uses them as lists; rewrite only `* ` + non-space (invalid alias) to `- `.
 */
function normalizeMarkdownListMarkers(input: string): string {
  return input.replace(/(^|\n)([ \t]*)\*(?=[ \t]+\S)/g, `$1$2-`)
}

function parseYamlObject(input: string): FrontMatterData | null {
  try {
    const yaml = normalizeMarkdownListMarkers(input)
    // js-yaml 5 throws on empty input; treat it as an empty mapping.
    if (!yaml.trim())
      return {}
    const data = loadYaml(yaml)
    if (data == null || typeof data !== `object` || Array.isArray(data))
      return {}
    return data as FrontMatterData
  }
  catch {
    return null
  }
}

export function parseFrontMatter(markdownText: string): ParsedFrontMatter {
  const match = FRONT_MATTER_RE.exec(markdownText)
  if (!match) {
    return {
      attributes: {},
      body: markdownText,
    }
  }

  const attributes = parseYamlObject(match[1] ?? ``)
  if (attributes == null) {
    return {
      attributes: {},
      body: markdownText,
    }
  }

  return {
    attributes,
    body: markdownText.slice(match[0].length),
  }
}
