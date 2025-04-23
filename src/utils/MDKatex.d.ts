import type { MarkedExtension } from 'marked'

export interface MarkedKatexOptions {
  nonStandard?: boolean
}

export function MDKatex(options: MarkedKatexOptions, inlineStyle: string, blockStyle: string): MarkedExtension
