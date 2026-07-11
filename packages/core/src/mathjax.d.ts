/**
 * MathJax global on window (loaded via <script>; no official TypeScript types).
 */

interface MathJaxDocument {
  firstChild: SVGElement & { style: CSSStyleDeclaration & Record<string, string | null> }
}

interface MathJaxGlobal {
  texReset: () => void
  tex2svg: (tex: string, options?: { display?: boolean }) => MathJaxDocument
  startup?: {
    promise: Promise<void>
  }
}

interface Window {
  MathJax: MathJaxGlobal
  __MD_UTOOLS__?: boolean
}
