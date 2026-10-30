export function formatStars(count) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(count).toLowerCase()
}

export async function loadGithubStars() {
  try {
    const response = await fetch('https://api.github.com/repos/doocs/md', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok)
      return null

    const { stargazers_count: count } = await response.json()
    return Number.isSafeInteger(count) && count >= 0 ? count : null
  }
  catch {
    // Keep the dated HTML snapshot when GitHub is unreachable or rate-limited.
    return null
  }
}
