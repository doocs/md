/** Module declarations for ?raw file imports */

declare module '*.css?raw' {
  const content: string
  export default content
}

declare module '*.txt?raw' {
  const content: string
  export default content
}
