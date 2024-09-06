import type { KatexOptions } from 'katex'
import type { MarkedExtension } from 'marked'

export interface MarkedKatexOptions extends KatexOptions {
  nonStandard?: boolean
}

export function MDKatex(options?: MarkedKatexOptions): MarkedExtension
