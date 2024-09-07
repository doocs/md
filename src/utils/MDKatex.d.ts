import type { MarkedExtension } from 'marked'

export interface MarkedKatexOptions {
  nonStandard?: boolean
}

export function MDKatex(options?: MarkedKatexOptions): MarkedExtension
