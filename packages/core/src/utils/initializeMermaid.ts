export async function initializeMermaid() {
  const mermaid = await import(`mermaid`)
  mermaid.default.initialize({ startOnLoad: false })
}
