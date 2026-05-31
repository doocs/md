import type { GitHubSyncConfig, SyncProvider } from '../types'

interface GitHubContentItem {
  name: string
  path: string
  sha: string
  type: `file` | `dir`
  content?: string // base64, only present for single-file responses
  encoding?: string
}

/**
 * GitHub Contents API sync provider.
 *
 * Stores sync data inside a GitHub repository using the REST API.
 * Ideal for users who already host their projects on GitHub and want
 * version-controlled document/config backup at zero extra cost.
 *
 * Rate limits: 5 000 requests / hour with a personal access token.
 *
 * Required token scopes: `repo` (or `public_repo` for public repos).
 */
export class GitHubSyncProvider implements SyncProvider {
  readonly id = `github`
  readonly name = `GitHub`

  private readonly owner: string
  private readonly repo: string
  private readonly branch: string
  private readonly accessToken: string
  private readonly basePath: string

  constructor(config: GitHubSyncConfig) {
    const normalized = config.repo
      .replace(/^https?:\/\/github\.com\//, ``)
      .replace(/\.git$/, ``)
      .split(`/`)
    this.owner = normalized[0] ?? ``
    this.repo = normalized[1] ?? ``
    this.branch = config.branch || `main`
    this.accessToken = config.accessToken
    this.basePath = (config.path ?? `md-sync`).replace(/^\/|\/$/g, ``)
  }

  // ──────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────

  /** Build a repository-relative path (basePath/path). */
  private buildPath(path: string): string {
    const clean = path.replace(/^\//, ``)
    return this.basePath ? `${this.basePath}/${clean}` : clean
  }

  private stripBase(fullPath: string): string {
    const prefix = this.basePath ? `${this.basePath}/` : ``
    return prefix && fullPath.startsWith(prefix) ? fullPath.slice(prefix.length) : fullPath
  }

  private async apiRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`
    const res = await fetch(url, {
      method,
      headers: {
        'Authorization': `token ${this.accessToken}`,
        'Content-Type': `application/json`,
        'Accept': `application/vnd.github.v3+json`,
        'X-GitHub-Api-Version': `2022-11-28`,
      },
      body: body != null ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string }
      throw new Error(`GitHub API ${method} /${path}: ${res.status} ${err.message ?? res.statusText}`)
    }
    return res.json() as Promise<T>
  }

  /** Fetch the SHA of an existing file (needed for updates). Returns null for new files. */
  private async getFileSha(ghPath: string): Promise<string | null> {
    try {
      const data = await this.apiRequest<GitHubContentItem>(`GET`, `${ghPath}?ref=${this.branch}`)
      return data.sha
    }
    catch {
      return null
    }
  }

  // ──────────────────────────────────────────────────
  // SyncProvider implementation
  // ──────────────────────────────────────────────────

  async test(): Promise<void> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}`
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${this.accessToken}`,
        Accept: `application/vnd.github.v3+json`,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { message?: string }
      throw new Error(`GitHub 连接失败: ${res.status} ${err.message ?? ``}`)
    }
  }

  async read(path: string): Promise<string | null> {
    try {
      const ghPath = this.buildPath(path)
      const data = await this.apiRequest<GitHubContentItem>(`GET`, `${ghPath}?ref=${this.branch}`)
      // Content is base64-encoded with possible newlines
      return decodeURIComponent(
        Array.from(atob(data.content!.replace(/\n/g, ``)))
          .map(c => `%${c.charCodeAt(0).toString(16).padStart(2, `0`)}`)
          .join(``),
      )
    }
    catch (e: any) {
      if (/404|Not Found/.test(e?.message ?? ``))
        return null
      throw e
    }
  }

  async write(path: string, content: string, _mimeType?: string): Promise<void> {
    const ghPath = this.buildPath(path)
    // Encode content to base64 (UTF-8 safe)
    const encoded = btoa(
      encodeURIComponent(content).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(Number.parseInt(p1, 16))),
    )
    const sha = await this.getFileSha(ghPath)
    await this.apiRequest(`PUT`, ghPath, {
      message: `sync: update ${path}`,
      content: encoded,
      branch: this.branch,
      ...(sha ? { sha } : {}),
    })
  }

  async list(prefix = ``): Promise<string[]> {
    const ghPath = this.buildPath(prefix)
    try {
      const data = await this.apiRequest<GitHubContentItem[]>(
        `GET`,
        `${ghPath}?ref=${this.branch}`,
      )
      if (!Array.isArray(data))
        return []
      return data
        .filter(f => f.type === `file`)
        .map(f => this.stripBase(f.path))
    }
    catch {
      return []
    }
  }

  async delete(path: string): Promise<void> {
    const ghPath = this.buildPath(path)
    const sha = await this.getFileSha(`${ghPath}?ref=${this.branch}`)
    if (!sha)
      return // Already gone
    await this.apiRequest(`DELETE`, ghPath, {
      message: `sync: delete ${path}`,
      sha,
      branch: this.branch,
    })
  }
}
