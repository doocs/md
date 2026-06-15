/** 检测 uTools 环境并标记根元素（setup 阶段同步执行，尽早生效） */
export function usePlatformEnv() {
  if (window.__MD_UTOOLS__)
    document.documentElement.classList.add(`is-utools`)
}
