import type { SyncProvider, WebDAVConfig } from '../types'

/**
 * WebDAV sync provider.
 *
 * Uses standard HTTP methods (PROPFIND / GET / PUT / DELETE / MKCOL) so no
 * extra dependencies are needed – only the browser's native fetch API.
 *
 * Compatible with Nextcloud, ownCloud, Caddy + webdav middleware, nginx-dav,
 * and any RFC-4918-compliant server.
 */
export class WebDAVProvider implements SyncProvider {
  readonly id = `webdav`
  readonly name = `WebDAV`

  constructor(private readonly config: WebDAVConfig) {}

  // ──────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────

  private get baseUrl(): string {
    return this.config.url.replace(/\/$/, ``)
  }

  private get basePath(): string {
    const p = this.config.basePath ?? ``
    if (!p)
      return ``
    return p.startsWith(`/`) ? p : `/${p}`
  }

  /** Build an absolute URL for a path relative to basePath. */
  private buildUrl(path: string): string {
    const clean = path ? (path.startsWith(`/`) ? path : `/${path}`) : ``
    return `${this.baseUrl}${this.basePath}${clean}`
  }

  private get authHeader(): string {
    return `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`
  }

  private async request(
    method: string,
    url: string,
    body?: BodyInit,
    extraHeaders: Record<string, string> = {},
  ): Promise<Response> {
    return fetch(url, {
      method,
      headers: { Authorization: this.authHeader, ...extraHeaders },
      body,
    })
  }

  // ──────────────────────────────────────────────────
  // SyncProvider implementation
  // ──────────────────────────────────────────────────

  async test(): Promise<void> {
    const url = `${this.baseUrl}${this.basePath}/`
    const res = await this.request(`PROPFIND`, url, undefined, { Depth: `0` })
    if (res.status === 404 || res.status === 405) {
      // Directory missing – try to create it
      const mk = await this.request(`MKCOL`, url)
      if (!mk.ok && mk.status !== 405 && mk.status !== 301) {
        throw new Error(`WebDAV 连接失败：无法创建同步目录 (${mk.status} ${mk.statusText})`)
      }
      return
    }
    if (!res.ok && res.status !== 207) {
      throw new Error(`WebDAV 连接失败：${res.status} ${res.statusText}`)
    }
  }

  async read(path: string): Promise<string | null> {
    const res = await this.request(`GET`, this.buildUrl(path))
    if (res.status === 404)
      return null
    if (!res.ok)
      throw new Error(`WebDAV 读取失败 (${path}): ${res.status} ${res.statusText}`)
    return res.text()
  }

  async write(path: string, content: string, mimeType = `text/plain; charset=utf-8`): Promise<void> {
    // Ensure parent directory exists before writing
    const dir = path.includes(`/`) ? path.slice(0, path.lastIndexOf(`/`)) : ``
    if (dir)
      await this.ensureDir(dir)

    const res = await this.request(`PUT`, this.buildUrl(path), content, { 'Content-Type': mimeType })
    if (!res.ok && res.status !== 201 && res.status !== 204) {
      throw new Error(`WebDAV 写入失败 (${path}): ${res.status} ${res.statusText}`)
    }
  }

  async list(prefix = ``): Promise<string[]> {
    const url = `${this.buildUrl(prefix)}/`
    const xmlBody = `<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop><resourcetype/></prop></propfind>`
    const res = await this.request(`PROPFIND`, url, xmlBody, {
      'Depth': `1`,
      'Content-Type': `application/xml`,
    })
    if (res.status === 404)
      return []
    if (!res.ok && res.status !== 207) {
      throw new Error(`WebDAV 列举失败: ${res.status} ${res.statusText}`)
    }
    return this.parsePropfindHrefs(await res.text())
  }

  async delete(path: string): Promise<void> {
    const res = await this.request(`DELETE`, this.buildUrl(path))
    if (!res.ok && res.status !== 404 && res.status !== 204) {
      throw new Error(`WebDAV 删除失败 (${path}): ${res.status} ${res.statusText}`)
    }
  }

  // ──────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────

  /** Recursively ensure all segments of `dir` exist. */
  private async ensureDir(dir: string): Promise<void> {
    let current = ``
    for (const segment of dir.split(`/`).filter(Boolean)) {
      current += `/${segment}`
      const url = `${this.baseUrl}${this.basePath}${current}/`
      const check = await this.request(`PROPFIND`, url, undefined, { Depth: `0` })
      if (check.status === 404) {
        const mk = await this.request(`MKCOL`, url)
        if (!mk.ok && mk.status !== 405) {
          throw new Error(`WebDAV 创建目录失败 (${current}): ${mk.status}`)
        }
      }
    }
  }

  /**
   * Parse a PROPFIND multi-status XML body and return file paths
   * relative to this provider's basePath.
   *
   * Directories (resourcetype = collection) are excluded.
   */
  private parsePropfindHrefs(xml: string): string[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, `application/xml`)

    // Collect all namespace-aware "response" elements (DAV: namespace)
    const responses = Array.from(doc.getElementsByTagNameNS(`DAV:`, `response`))

    const paths: string[] = []
    for (const response of responses) {
      const hrefEl = response.getElementsByTagNameNS(`DAV:`, `href`)[0]
      if (!hrefEl?.textContent)
        continue
      const href = decodeURIComponent(hrefEl.textContent).replace(/\/$/, ``)

      // Derive the expected parent href so we can skip it
      const parentHref = `${this.baseUrl}${this.basePath}`.replace(/\/$/, ``)
      if (href === parentHref)
        continue

      // Skip sub-collections
      const resourceType = response.getElementsByTagNameNS(`DAV:`, `resourcetype`)[0]
      const isCollection
        = resourceType != null
          && resourceType.getElementsByTagNameNS(`DAV:`, `collection`).length > 0
      if (isCollection)
        continue

      // Strip server origin + basePath prefix → relative path
      const withoutBase = href.startsWith(this.baseUrl)
        ? href.slice(this.baseUrl.length)
        : href
      const withoutBasePath
        = this.basePath && withoutBase.startsWith(this.basePath)
          ? withoutBase.slice(this.basePath.length)
          : withoutBase
      paths.push(withoutBasePath.replace(/^\//, ``))
    }
    return paths
  }
}
