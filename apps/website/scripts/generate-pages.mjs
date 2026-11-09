import { readdir, readFile } from 'node:fs/promises'
import { publicPosts, readPost } from '../src/content.js'
import { renderBlog, renderChangelog, renderCommunity, renderEcosystem, renderHome, renderPost, renderShell } from '../src/pages.js'
import { loadSiteData } from './sync-data.mjs'

const root = new URL('../', import.meta.url)

export async function generatePages({ refresh = true } = {}) {
  const [template, snapshot, filenames] = await Promise.all([
    readFile(new URL('index.html', root), 'utf8'),
    refresh ? loadSiteData() : readFile(new URL('content/data/github.json', root), 'utf8').then(JSON.parse),
    readdir(new URL('content/posts/', root)),
  ])
  const posts = publicPosts(await Promise.all(filenames.filter(name => name.endsWith('.md')).map(async name => readPost(await readFile(new URL(`content/posts/${name}`, root), 'utf8'), name))))
  const data = snapshot
  const pages = new Map()
  const add = (path, title, body, description = '微信公众号 Markdown 编辑器。写作、实时预览、自定义主题与组件，复制到微信公众号。', noindex = false) => pages.set(path, renderShell(template, body, { title, description, noindex }, data))
  add('index.html', 'MD · 微信公众号 Markdown 编辑器', renderHome(data, posts))
  add('blog/index.html', '博客 · MD', renderBlog(posts), 'MD 的版本发布、功能教程与社区更新。')
  add('changelog/index.html', '更新日志 · MD', renderChangelog(data), '分别查看 MD 主项目与 CLI 的正式发布记录。')
  add('community/index.html', '社区 · MD', renderCommunity(data), 'MD 的开源动态与贡献者。')
  add('ecosystem/index.html', '多平台工具 · MD', renderEcosystem(), '在 Web、VS Code、浏览器扩展、uTools、CLI 与 MCP 中使用 MD。')
  for (const post of posts)
    add(`blog/${post.slug}/index.html`, `${post.title} · MD`, renderPost(post, posts), post.summary)
  add('404.html', '页面未找到 · MD', '<section class="page-top not-found"><h1>页面未找到</h1><p>链接可能已经变更，可以返回首页或查看博客。</p><a class="button primary md" href="/">返回首页</a></section>', '页面未找到', true)
  return pages
}
