import type { FrontMatterData } from '@md/shared/types/front-matter'
import { load as loadYaml } from 'js-yaml'

export interface ParsedFrontMatter {
  attributes: FrontMatterData
  body: string
}

/** CommonMark / Jekyll-style YAML fence, including optional BOM and `...` closer. */
const FRONT_MATTER_RE = /^\uFEFF?(?:---|= yaml =)[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.|= yaml =)[ \t]*(?:\r?\n|$)/

function parseYamlObject(input: string): FrontMatterData {
  const data = loadYaml(input)
  if (data == null || typeof data !== `object` || Array.isArray(data))
    return {}
  return data as FrontMatterData
}

export function parseFrontMatter(markdownText: string): ParsedFrontMatter {
  const match = FRONT_MATTER_RE.exec(markdownText)
  if (!match) {
    return {
      attributes: {},
      body: markdownText,
    }
  }

  return {
    attributes: parseYamlObject(match[1] ?? ``),
    body: markdownText.slice(match[0].length),
  }
}
