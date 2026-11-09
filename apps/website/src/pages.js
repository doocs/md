import { escapeHtml, formatDate } from './content.js'
import { formatStars } from './github.js'
import { icon } from './icons.js'

export const categories = { release: '版本发布', tutorial: '功能教程', community: '社区更新' }
export const releaseTitle = item => item.channel === 'cli' ? `CLI ${item.tag.replace('@doocs/md-cli@', '')}` : `主项目 ${item.tag}`
const link = (href, title) => `<a href="${escapeHtml(href)}">${escapeHtml(title)}</a>`
const featureVideo = (name, description, width = 2030) => `<div class="feature-player" data-feature-video><video src="/videos/${name}-dark.mp4" poster="/videos/${name}-dark.webp" width="${width}" height="1080" muted loop playsinline controls preload="none" aria-label="${description}"><a href="/videos/${name}-dark.mp4">观看${description}</a></video><div class="feature-video-controls" data-video-controls hidden><button type="button" data-video-toggle aria-label="播放演示" aria-pressed="false">${icon('play')}${icon('pause')}</button><button type="button" data-video-expand aria-label="放大查看演示">${icon('expand')}</button></div></div>`
const contributorAvatar = person => `<span class="contributor-avatar" aria-hidden="true">${escapeHtml(person.login.slice(0, 2))}${person.avatar ? `<img src="${escapeHtml(person.avatar)}" alt="" width="44" height="44" loading="lazy" decoding="async">` : ''}</span>`
const feature = (id, title, copy, visual, reverse = false, condition = '') => `<section class="feature" id="${id}"><div class="block ${reverse ? 'reversed' : ''}"><div class="visualCol"><div class="feature-stage">${visual}</div></div><div class="textCol"><h3 class="title">${title}</h3><p class="description">${copy}</p>${condition ? `<p class="condition">${condition}</p>` : ''}</div></div></section>`

const capabilities = [
  ['code', '代码、公式与图表', '代码高亮、KaTeX 公式、Mermaid、PlantUML、Infographic、Ruby 注音、目录与脚注。', '公式支持可视编辑，图表与公式在复制时进行适配。'],
  ['image', '多图床与图片处理', '粘贴、拖放上传，远程图片转存；可选图片压缩。支持 GitHub、阿里云 OSS、S3、R2 等多种图床。', '默认图床可直接使用；第三方图床需要配置凭据，部分需要代理。'],
  ['history', '文章管理与历史记录', '文章与文件夹管理，本地自动保存；查看历史内容、差异与预览，按需恢复。', '本地草稿保存在当前浏览器；历史记录最多保留 10 个快照。'],
  ['cloud', '云端保存与同步', '登录后手动同步文章与部分偏好，在不同设备间继续编辑。', '受服务配置与配额限制；自动同步暂未开放，AI 与图床密钥不随偏好同步。'],
  ['share', '导出与分享', '导出 Markdown、HTML、PDF、PNG 与分段长图；创建带密码或有效期的文章预览链接。', '分享需要登录；免费创建或更新共 2 次/UTC 日，Pro 可管理与撤销分享。'],
  ['layout', '更多写作工具', '模板、自定义组件、滑动图片、表情包、命令面板与斜杠命令；Web 界面支持四种语言。', '本地文件夹读写需要浏览器支持并授予目录访问权限。'],
]
const ecosystem = [
  ['globe', 'Web', '完整在线编辑器', 'https://md.doocs.org'],
  ['code', 'VS Code', 'Markdown 预览与排版配置', 'https://github.com/doocs/md/tree/main/apps/vscode'],
  ['extension', '浏览器扩展', 'Chrome / Firefox，辅助分发', 'https://github.com/doocs/md/tree/main/apps/web'],
  ['monitor', 'uTools', '在 uTools 中使用编辑器', 'https://github.com/doocs/md/tree/main/apps/utools'],
  ['terminal', 'CLI', '在本机启动编辑器服务', 'https://www.npmjs.com/package/@doocs/md-cli'],
  ['spark', 'MCP', '源码提供 stdio 渲染与配置工具', 'https://github.com/doocs/md/tree/main/packages/mcp-server'],
  ['cloud', 'Docker', '自部署 Web 编辑器', 'https://github.com/doocs/md#docker-部署'],
  ['github', '开源代码', '渲染引擎与完整工作区', 'https://github.com/doocs/md'],
]

export function postCard(post) {
  return `<article class="post-card" data-post-category="${post.category}"><a href="${post.href}"><div class="post-cover"><img src="${post.cover}" alt="${escapeHtml(post.coverAlt)}" loading="lazy" decoding="async" width="1280" height="800"></div><div class="post-meta">${categories[post.category]} · ${formatDate(post.date)} · ${post.minutes} 分钟阅读</div><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.summary)}</p></a><div class="post-author">${escapeHtml(post.author)}</div></article>`
}

function communityCopy(data) {
  const repository = data.repository
  return `<header class="section-header"><h2>与社区一起维护</h2><p>报告问题、分享主题、提交代码，或者完善一份教程。欢迎参与 MD 的开源建设。</p><div class="community-data" data-github-stats${repository ? '' : ' hidden'}><a href="https://github.com/doocs/md/stargazers"><strong data-github-stars>${repository ? repository.stars.toLocaleString('en-US') : ''}</strong> Stars</a><a href="https://github.com/doocs/md/forks"><strong data-github-forks>${repository ? repository.forks.toLocaleString('en-US') : ''}</strong> Forks</a></div><p class="source-note" data-github-stats${repository ? '' : ' hidden'}>${link('https://api.github.com/repos/doocs/md', 'GitHub 公开数据')} · <time data-github-updated datetime="${repository?.fetchedAt || ''}">${formatDate(repository?.fetchedAt)}</time></p></header>`
}

function contributorsSection(data) {
  return `<section class="section contributors">${communityCopy(data)}<div class="contributor-links">${(data.contributors?.items || []).map(person => `<a href="${escapeHtml(person.url)}" aria-label="@${escapeHtml(person.login)}" title="@${escapeHtml(person.login)}">${contributorAvatar(person)}</a>`).join('')}</div></section>`
}

export function renderHome(data, posts) {
  const latest = data.releases?.items[0]
  const home = `<div class="hero"><section class="hero"><div class="release"><a class="pill" href="/changelog/"><span class="tag">更新</span><span class="title">${escapeHtml(latest ? `${releaseTitle(latest)} 已发布` : '查看更新日志')}</span>${icon('arrow')}</a></div><h1 class="tagline"><span>微信公众号</span><br><span>Markdown 编辑器</span></h1><p class="description">用 Markdown 写作，实时预览文章排版。<br>调整主题与组件，复制到微信公众号。</p><div class="actions"><a class="button primary lg" href="https://md.doocs.org">打开编辑器 ${icon('arrow-up')}</a><a class="button outline lg" href="https://github.com/doocs/md">${icon('github')} GitHub</a></div><p class="hero-note"><span>免费开始</span><span>无需安装</span><span>本地自动保存</span></p><div class="hero-media"><div class="heroDemo"><a class="hero-image-link" href="https://md.doocs.org" aria-label="打开 md 编辑器"><img src="/images/home.webp" width="2696" height="1440" fetchpriority="high" decoding="async" alt="MD 编辑器的 Markdown 原文与公众号文章实时预览"></a></div></div></section></div>`
    + `<section class="section" id="features"><header class="section-header"><h2>写作与公众号排版</h2><p>从 Markdown 到文章预览，编辑内容时就能看到排版结果。</p></header><div class="blocks">${
      feature('workflow', '编写 Markdown，实时查看排版', '标题、段落、引用、代码和配图，在同一处编辑与预览。完成后点击复制，将排版结果粘贴到微信公众号后台。', featureVideo('workflow', 'Markdown 输入与实时排版操作演示'), false, '公众号后台完成发布；扩展分发需安装扩展并登录目标平台。')
    }${feature('themes', '字体、颜色与间距，由你调整', '从经典、优雅、简洁三种内置主题开始，调整字号、字体、行距和段间距。需要更细的控制时，可以编写自定义 CSS。', featureVideo('themes', '切换主题与文章样式操作演示', 2032), true, '完整主题设置请前往编辑器。')
    }${feature('market', '预览、安装与应用社区作品', '在主题与组件市场预览作品，安装后应用主题，或填写组件参数并插入文章。自己的作品也可以提交审核后发布。', featureVideo('market', '浏览主题市场与作品预览操作演示'), false, '作品发布需登录并审核；支持导出 CSS 与组件文件。')
    }${feature('ai', '用 AI 辅助文字与配图', '润色、总结、翻译、扩写或续写，把对话结果插入文章。也可以生成图片，再下载或插入正文。', featureVideo('ai', 'AI 润色生成与插入文档操作演示', 2028), true, '外部模型需配置密钥并按服务商计费；图片请及时保存。')
    }</div></section>`
    + `<section class="section" id="capabilities"><header class="section-header"><h2>完整的文章创作工具</h2><p>图文处理、技术表达、文章管理与分享，都围绕一篇文章展开。</p></header><div class="capabilities">${capabilities.map(([i, t, c, s]) => `<article class="capability">${icon(i)}<h3>${t}</h3><p>${c}</p><small>${s}</small></article>`).join('')}</div></section>`
    + `<section class="section" id="ecosystem"><header class="section-header"><h2>MD 的多平台工具</h2><p>选择适合自己的使用方式：在线写作、编辑器集成、本地运行或自部署。</p></header><div class="ecosystem">${ecosystem.map(([i, t, c, h]) => `<a href="${h}">${icon(i)}<div><h3>${t}</h3><p>${c}</p></div></a>`).join('')}</div><p class="condition">各端能力不同；CLI 启动本地编辑器，MCP 需从源码构建。</p></section>${
      contributorsSection(data)
    }<section class="section"><header class="section-header"><h2>博客</h2><p>版本发布、使用教程与社区更新。</p></header><div class="post-grid">${posts.slice(0, 2).map(postCard).join('')}</div><a class="button primary md" href="/blog/">查看全部文章 ${icon('arrow')}</a></section>`

  return home
}

export function renderBlog(posts) {
  return `<header class="page-top"><h1>博客</h1><p>版本发布、功能教程与社区更新</p></header><div class="filters" role="group" aria-label="博客分类" data-filter-controls hidden>${Object.entries({ all: '全部文章', ...categories }).map(([key, label]) => `<button data-category="${key}" aria-pressed="${key === 'all'}">${label}</button>`).join('')}</div><p class="sr-only" role="status" data-filter-status></p><div class="blog-archive"><div class="post-grid">${posts.map(postCard).join('')}</div><p data-empty hidden>这个分类暂时没有文章。</p></div>`
}

export function renderPost(post, posts) {
  const neighbors = posts.filter(item => item.slug !== post.slug && item.category === post.category).slice(0, 2)
  return `<div class="article-layout"><header class="reading-header"><a href="/blog/">返回博客</a><h1>${escapeHtml(post.title)}</h1><p>${categories[post.category]} · ${escapeHtml(post.author)} · <time datetime="${post.date}">${formatDate(post.date)}</time> · ${post.minutes} 分钟阅读${post.updated ? ` · 更新于 ${formatDate(post.updated)}` : ''}</p>${post.channel ? `<p class="release-channel">${post.channel === 'cli' ? 'CLI 独立发布' : '主项目发布'}${post.version ? ` · ${escapeHtml(post.version)}` : ''}</p>` : ''}</header><article class="reading">${post.html}${post.sources?.length ? `<footer class="article-sources"><strong>参考来源</strong><ul>${post.sources.map(source => `<li>${link(source, source.replace('https://', ''))}</li>`).join('')}</ul></footer>` : ''}<nav class="article-related" aria-label="相关文章"><a href="/blog/">全部文章</a>${neighbors.map(item => link(item.href, item.title)).join('')}</nav></article>${post.toc.length ? `<aside class="article-toc"><details open><summary>本文目录</summary><nav aria-label="文章目录">${post.toc.filter(item => item.depth <= 3).map(item => `<a href="#${item.id}" class="depth-${item.depth}">${escapeHtml(item.text)}</a>`).join('')}</nav></details></aside>` : ''}</div>`
}

export function renderChangelog(data) {
  const releases = data.releases?.items || []
  return `<header class="page-top"><h1>更新日志</h1></header><div class="filters" role="group" aria-label="发布渠道" data-filter-controls hidden>${Object.entries({ all: '全部渠道', main: '主项目', cli: 'CLI' }).map(([key, label]) => `<button data-channel="${key}" aria-pressed="${key === 'all'}">${label}</button>`).join('')}</div><p class="sr-only" role="status" data-filter-status></p><div class="change-list">${releases.map(item => `<article class="change-row" data-change-channel="${item.channel}"><time datetime="${item.date}">${formatDate(item.date)}</time><div><h2>${escapeHtml(releaseTitle(item))}</h2>${item.highlights.length ? `<ul>${item.highlights.map(text => `<li>${escapeHtml(text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*`]/g, ''))}</li>`).join('')}</ul>` : '<p class="condition">本版本的详细说明见原始发布记录。</p>'}<a href="${escapeHtml(item.url)}">查看原始发布记录 ${icon('arrow-up')}</a></div></article>`).join('') || '<p>暂时无法获取版本记录，请查看 <a href="https://github.com/doocs/md/releases">GitHub Releases</a>。</p>'}<p class="condition">${link('https://github.com/doocs/md/releases', 'GitHub Releases')}${data.releases?.fetchedAt ? ` · 数据快照 ${formatDate(data.releases.fetchedAt)}` : ''}。主项目与 CLI 按各自的标签和发布日期记录。</p><p data-empty hidden>这个渠道暂时没有发布记录。</p></div>`
}

export function renderCommunity(data) {
  return `<header class="page-top"><h1>社区</h1><p>开源动态与贡献者</p></header><section class="section community-activity"><header class="section-header"><h2>最近提交</h2><p>${link('https://github.com/doocs/md/commits/main/', '来自 GitHub 的公开提交记录')}${data.activity?.fetchedAt ? ` · 快照 ${formatDate(data.activity.fetchedAt)}` : ''}</p></header><div class="activity-list">${(data.activity?.items || []).map(item => `<article><time datetime="${item.date}">${formatDate(item.date)}</time><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a><span>${escapeHtml(item.author)}</span></article>`).join('') || '<p>暂时无法获取动态，可以直接访问 GitHub 查看。</p>'}</div></section><section class="section contributors">${communityCopy(data)}<div class="people">${(data.contributors?.items || []).map(person => `<a href="${escapeHtml(person.url)}" aria-label="@${escapeHtml(person.login)}">${contributorAvatar(person)}@${escapeHtml(person.login)}</a>`).join('')}</div><p class="condition">${link('https://github.com/doocs/md/graphs/contributors', '名单来源')}${data.contributors?.fetchedAt ? ` · 快照 ${formatDate(data.contributors.fetchedAt)}` : ''} · ${link('https://github.com/doocs/md/graphs/contributors', '完整贡献者列表')}</p><a class="button primary md" href="https://github.com/doocs/md/blob/main/CONTRIBUTING.md">参与贡献 ${icon('arrow')}</a></section>`
}

export function renderEcosystem() {
  return `<header class="page-top"><h1>多平台工具</h1><p>选择适合自己的使用方式</p></header><div class="integration-list">${ecosystem.map(([name, title, description, href]) => `<article>${icon(name)}<div><h2>${title}</h2><p>${description}</p><p class="condition">${({ 'Web': '无需安装；主要写作、排版、AI 与文章管理能力在 Web 编辑器提供。', 'VS Code': '安装 doocs.doocs-md 扩展，预览 Markdown 并配置文章样式。各端能力不完全相同。', '浏览器扩展': 'Chrome 与 Firefox 扩展基于 WXT。辅助分发需要安装对应扩展并登录目标平台。', 'uTools': '按仓库说明打包并导入 uTools。', 'CLI': '通过 npm 安装 @doocs/md-cli，启动本机编辑器服务；不是批量 Markdown 转换命令。', 'MCP': '从仓库构建运行，通过 stdio 提供 render_markdown、list_themes 等工具。当前不是已公开发布的 npm 包。', 'Docker': '按项目文档运行容器。云同步、分享、AI 与上传服务取决于部署配置。', '开源代码': 'Markdown 渲染引擎和编辑器在同一 pnpm 工作区维护。' })[title]}</p><a class="button ghost md" href="${href}">${title === 'Web' ? '打开编辑器' : '查看使用说明'} ${icon('arrow-up')}</a></div></article>`).join('')}</div>`
}

export function renderShell(template, body, metadata, data) {
  const count = data.repository?.stars
  return template
    .replaceAll('%%TITLE%%', escapeHtml(metadata.title))
    .replaceAll('%%DESCRIPTION%%', escapeHtml(metadata.description))
    .replace('%%CONTENT%%', body)
    .replace('%%ROBOTS%%', metadata.noindex ? '<meta name="robots" content="noindex">' : '')
    .replaceAll('%%GITHUB_COUNT%%', count == null ? 'GitHub' : formatStars(count))
    .replaceAll('%%GITHUB_LABEL%%', escapeHtml(count == null ? '在 GitHub 查看源码' : `GitHub · ${count.toLocaleString('en-US')} Stars · ${formatDate(data.repository.fetchedAt)} 快照`))
    .replace(/<i data-icon="([^"]+)"><\/i>/g, (_, name) => icon(name))
}
