import type { LanguageFn } from 'highlight.js'
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import css from 'highlight.js/lib/languages/css'
import diff from 'highlight.js/lib/languages/diff'
import go from 'highlight.js/lib/languages/go'
import graphql from 'highlight.js/lib/languages/graphql'
import ini from 'highlight.js/lib/languages/ini'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import kotlin from 'highlight.js/lib/languages/kotlin'
import less from 'highlight.js/lib/languages/less'
import lua from 'highlight.js/lib/languages/lua'
import makefile from 'highlight.js/lib/languages/makefile'
import markdown from 'highlight.js/lib/languages/markdown'
import objectivec from 'highlight.js/lib/languages/objectivec'
import perl from 'highlight.js/lib/languages/perl'
import php from 'highlight.js/lib/languages/php'
import phpTemplate from 'highlight.js/lib/languages/php-template'
import plaintext from 'highlight.js/lib/languages/plaintext'
import python from 'highlight.js/lib/languages/python'
import pythonRepl from 'highlight.js/lib/languages/python-repl'
import r from 'highlight.js/lib/languages/r'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import scss from 'highlight.js/lib/languages/scss'
import shell from 'highlight.js/lib/languages/shell'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import vbnet from 'highlight.js/lib/languages/vbnet'
import wasm from 'highlight.js/lib/languages/wasm'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

export const COMMON_LANGUAGES: Record<string, LanguageFn> = {
  bash,
  c,
  cpp,
  csharp,
  css,
  diff,
  go,
  graphql,
  ini,
  java,
  javascript,
  json,
  kotlin,
  less,
  lua,
  makefile,
  markdown,
  objectivec,
  perl,
  php,
  'php-template': phpTemplate,
  plaintext,
  python,
  'python-repl': pythonRepl,
  r,
  ruby,
  rust,
  scss,
  shell,
  sql,
  swift,
  typescript,
  vbnet,
  wasm,
  xml,
  yaml,
}

// highlight.js CDN 配置
const HLJS_VERSION = `11.11.1`
const HLJS_CDN_BASE = `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlightjs/${HLJS_VERSION}`

// 缓存正在加载的语言
const loadingLanguages = new Map<string, Promise<void>>()

/**
 * 生成语言包的 CDN URL
 */
function grammarUrlFor(language: string): string {
  return `${HLJS_CDN_BASE}/languages/${language}.min.js`
}

/**
 * 动态加载并注册语言
 * @param language 语言名称
 * @param hljs highlight.js 实例
 */
export async function loadAndRegisterLanguage(language: string, hljs: any): Promise<void> {
  // 如果已经注册，直接返回
  if (hljs.getLanguage(language)) {
    return
  }

  // 如果正在加载，等待加载完成
  if (loadingLanguages.has(language)) {
    await loadingLanguages.get(language)
    return
  }

  // 开始加载
  const loadPromise = (async () => {
    try {
      const module = await import(/* @vite-ignore */ grammarUrlFor(language))
      hljs.registerLanguage(language, module.default)
    }
    catch (error) {
      console.warn(`Failed to load language: ${language}`, error)
      throw error
    }
    finally {
      loadingLanguages.delete(language)
    }
  })()

  loadingLanguages.set(language, loadPromise)
  await loadPromise
}

/**
 * 高亮 DOM 中待处理的代码块
 * 查找带有 data-language-pending 属性的代码块，动态加载语言后重新高亮
 * @param hljs highlight.js 实例
 * @param container 容器元素（可选，默认为 document）
 */
export function highlightPendingBlocks(hljs: any, container: Document | Element = document): void {
  const pendingBlocks = container.querySelectorAll(`code[data-language-pending]`)

  pendingBlocks.forEach((codeBlock) => {
    const language = codeBlock.getAttribute(`data-language-pending`)
    if (!language)
      return

    if (hljs.getLanguage(language)) {
      // 语言已加载，直接高亮
      codeBlock.removeAttribute(`data-language-pending`)
      hljs.highlightElement(codeBlock)
    }
    else {
      // 动态加载语言后重新高亮
      loadAndRegisterLanguage(language, hljs).then(() => {
        codeBlock.removeAttribute(`data-language-pending`)
        hljs.highlightElement(codeBlock)
      }).catch(() => {
        // 加载失败，移除标记
        codeBlock.removeAttribute(`data-language-pending`)
      })
    }
  })
}
