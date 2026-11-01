export const GITHUB_SOURCES = {
  repository: 'https://api.github.com/repos/doocs/md',
  contributors: 'https://api.github.com/repos/doocs/md/contributors?per_page=100',
  releases: 'https://api.github.com/repos/doocs/md/releases?per_page=100',
  activity: 'https://api.github.com/repos/doocs/md/commits?per_page=5',
}

export const CACHE_TTL = 6 * 60 * 60 * 1000

export function githubUrl(value, prefix = 'https://github.com/') {
  if (typeof value !== 'string' || !value.startsWith(prefix))
    throw new Error('Invalid GitHub source URL')
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password)
    throw new Error('Invalid GitHub source URL')
  return value
}

export function releaseChannel(tag) {
  if (/^v\d+\.\d+\.\d+$/.test(tag))
    return 'main'
  if (/^@doocs\/md-cli@\d+\.\d+\.\d+$/.test(tag))
    return 'cli'
  return null
}

function validDate(value) {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value)))
    throw new Error('Invalid source timestamp')
  return value
}

function validLogin(value) {
  if (typeof value !== 'string' || !/^[\w-]{1,64}(?:\[bot\])?$/.test(value))
    throw new Error('Invalid GitHub login')
  return value
}

function validAvatar(value) {
  if (typeof value !== 'string' || !/^https:\/\/avatars\.githubusercontent\.com\/(?:u|in)\/\d+(?:\?v=\d+)?$/.test(value))
    throw new Error('Invalid GitHub avatar URL')
  return value
}

export function normalizeGithubData(key, raw) {
  if (key === 'repository') {
    if (raw.full_name !== 'doocs/md' || ![raw.stargazers_count, raw.forks_count].every(n => Number.isSafeInteger(n) && n >= 0))
      throw new Error('Invalid repository data')
    return { stars: raw.stargazers_count, forks: raw.forks_count, url: githubUrl(raw.html_url) }
  }
  if (!Array.isArray(raw))
    throw new Error('Expected a GitHub list')
  if (key === 'contributors') {
    return { items: raw.filter(item => item.type === 'User' || item.type === 'Bot').map(item => ({
      login: validLogin(item.login),
      url: githubUrl(item.html_url),
      avatar: validAvatar(item.avatar_url),
    })) }
  }
  if (key === 'releases') {
    return { items: raw.filter(item => !item.draft && !item.prerelease && releaseChannel(item.tag_name)).map(item => ({
      channel: releaseChannel(item.tag_name),
      tag: item.tag_name,
      name: String(item.name || item.tag_name).slice(0, 180),
      date: validDate(item.published_at),
      url: githubUrl(item.html_url, 'https://github.com/doocs/md/releases/'),
      highlights: String(item.body || '').split('\n').filter(line => /^[-*] /.test(line)).slice(0, 6).map(line => line.replace(/^[-*] /, '').slice(0, 320)),
    })).sort((a, b) => b.date.localeCompare(a.date)) }
  }
  if (key === 'activity') {
    return { items: raw.slice(0, 5).map(item => ({
      title: String(item.commit.message).split('\n')[0].slice(0, 180),
      date: validDate(item.commit.committer.date),
      url: githubUrl(item.html_url, 'https://github.com/doocs/md/commit/'),
      author: item.author?.login ? validLogin(item.author.login) : 'doocs/md',
    })) }
  }
  throw new Error('Unknown GitHub section')
}

export async function refreshGithubData(snapshot, { fetcher = fetch, now = Date.now(), force = false, offline = false } = {}) {
  const result = { ...snapshot, schemaVersion: 1 }
  const failures = []
  await Promise.all(Object.entries(GITHUB_SOURCES).map(async ([key, source]) => {
    if (offline || (!force && snapshot[key]?.source === source && now - Date.parse(snapshot[key]?.fetchedAt) < CACHE_TTL))
      return
    try {
      const response = await fetcher(source, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: AbortSignal.timeout(5000),
      })
      if (!response.ok)
        throw new Error(`GitHub returned ${response.status}`)
      const raw = await response.json()
      if (key === 'contributors') {
        let batch = raw
        for (let page = 2; Array.isArray(batch) && batch.length === 100; page++) {
          const next = await fetcher(`${source}&page=${page}`, {
            headers: { Accept: 'application/vnd.github+json' },
            signal: AbortSignal.timeout(5000),
          })
          if (!next.ok)
            throw new Error(`GitHub returned ${next.status}`)
          batch = await next.json()
          if (!Array.isArray(batch))
            throw new Error('Expected a GitHub list')
          raw.push(...batch)
        }
      }
      const data = normalizeGithubData(key, raw)
      result[key] = { ...data, source, fetchedAt: new Date(now).toISOString() }
    }
    catch {
      failures.push(key)
    }
  }))
  return { snapshot: result, failures }
}
