/**
 * 类型声明：支持 ?raw 后缀的文件导入
 */

declare module '*.css?raw' {
  const content: string
  export default content
}

declare module '*.txt?raw' {
  const content: string
  export default content
}
