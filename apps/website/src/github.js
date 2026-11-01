export function formatStars(count) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(count).toLowerCase()
}

const CACHE_KEY = 'md-website-github-repository'
const CACHE_TTL = 30 * 60 * 1000

function validStats(value) {
  return value && [value.stars, value.forks].every(count => Number.isSafeInteger(count) && count >= 0)
    && typeof value.fetchedAt === 'string' && Number.isFinite(Date.parse(value.fetchedAt))
}

export async function loadGithubRepository() {
  const now = Date.now()
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    const age = now - Date.parse(cached?.fetchedAt)
    if (validStats(cached) && age >= 0 && age < CACHE_TTL)
      return cached
  }
  catch {
    // Storage may be blocked or contain an invalid cache; still try GitHub.
  }

  try {
    const response = await fetch('https://api.github.com/repos/doocs/md', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok)
      return null

    const raw = await response.json()
    const stats = { stars: raw.stargazers_count, forks: raw.forks_count, fetchedAt: new Date().toISOString() }
    if (raw.full_name !== 'doocs/md' || !validStats(stats))
      return null
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(stats))
    }
    catch {
      // Fresh counts still work when storage is unavailable or full.
    }
    return stats
  }
  catch {
    // Keep the dated HTML snapshot when GitHub is unreachable or rate-limited.
    return null
  }
}

export async function refreshGithubStats() {
  const stats = await loadGithubRepository()
  if (!stats)
    return

  const updatedAt = new Date(stats.fetchedAt).toLocaleString('zh-CN', { hour12: false })
  const header = document.querySelector('.github-count')
  if (header) {
    header.querySelector('span').textContent = formatStars(stats.stars)
    header.setAttribute('aria-label', `GitHub · ${stats.stars.toLocaleString('en-US')} Stars · ${updatedAt} 更新`)
  }
  for (const node of document.querySelectorAll('[data-github-stars]'))
    node.textContent = stats.stars.toLocaleString('en-US')
  for (const node of document.querySelectorAll('[data-github-forks]'))
    node.textContent = stats.forks.toLocaleString('en-US')
  for (const node of document.querySelectorAll('[data-github-updated]')) {
    node.dateTime = stats.fetchedAt
    node.textContent = updatedAt
  }
  for (const node of document.querySelectorAll('[data-github-stats]'))
    node.hidden = false
}
