export async function initializeMermaid() {
  // 优先使用全局 CDN 的 mermaid
  if (typeof window !== `undefined` && (window as any).mermaid) {
    const mermaid = (window as any).mermaid
    mermaid.initialize({ startOnLoad: false })
  }
  else {
    // 回退到动态导入（开发环境）
    const mermaid = await import(`mermaid`)
    mermaid.default.initialize({ startOnLoad: false })
  }
}
