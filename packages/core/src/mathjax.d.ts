/**
 * 类型声明：MathJax 全局变量
 * MathJax 通过 <script> 标签加载到 window 上，无官方 TypeScript 声明
 */

interface MathJaxDocument {
  firstChild: SVGElement & { style: CSSStyleDeclaration & Record<string, string | null> }
}

interface MathJaxGlobal {
  texReset: () => void
  tex2svg: (tex: string, options?: { display?: boolean }) => MathJaxDocument
}

interface Window {
  MathJax: MathJaxGlobal
}
