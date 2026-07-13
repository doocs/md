import type {
  MarketplaceItemType,
  PublishComponentRequest,
  PublishThemeRequest,
  UpdateMarketplaceItemRequest,
} from './marketplace-types'

export const MAX_THEME_CSS_BYTES = 200 * 1024
export const MAX_COMPONENT_JSON_BYTES = 50 * 1024
export const MAX_SAMPLE_MARKDOWN_BYTES = 32 * 1024
export const MAX_NAME_LENGTH = 64
export const MAX_SLUG_LENGTH = 48
export const MAX_DESCRIPTION_LENGTH = 2000
export const MAX_VERSION_LENGTH = 32
export const MAX_COVER_URL_LENGTH = 512
export const MAX_REJECT_REASON_LENGTH = 500

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/
const PASCAL_CASE_RE = /^[A-Z][A-Za-z0-9]*$/
const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

const DANGEROUS_TAG_RE = /<\s*(?:\/\s*)?(?:script|iframe|object|embed|link|meta|base|form)\b/i
const EVENT_HANDLER_RE = /\son[a-z]+\s*=/i
const JS_URL_RE = /(?:href|src|action)\s*=\s*(?:["']\s*)?javascript:/i
const CSS_IMPORT_RE = /@import\b/i
const CSS_EXTERNAL_URL_RE = /url\s*\(\s*(?:["']\s*)?https?:\/\//i

export interface ValidateOk<T> { ok: true, value: T }
export interface ValidateErr { ok: false, error: string }
export type ValidateResult<T> = ValidateOk<T> | ValidateErr

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

function trimString(value: unknown, max: number): string | null {
  if (typeof value !== `string`)
    return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > max)
    return null
  return trimmed
}

function optionalTrimString(value: unknown, max: number): string | null | undefined {
  if (value === undefined)
    return undefined
  if (value === null || value === ``)
    return null
  return trimString(value, max)
}

export function parseSlug(value: unknown): string | null {
  const slug = trimString(value, MAX_SLUG_LENGTH)
  if (!slug || !SLUG_RE.test(slug))
    return null
  return slug
}

export const INITIAL_MARKETPLACE_VERSION = `1.0.0`

interface VersionTriple {
  major: number
  minor: number
  patch: number
}

function parseVersionTriple(version: string): VersionTriple {
  const raw = version.trim().replace(/^v/i, ``).split(`-`)[0] ?? ``
  const parts = raw.split(`.`).map(part => Number(part))
  return {
    major: Number.isFinite(parts[0]) ? Math.max(0, Math.floor(parts[0]!)) : 1,
    minor: Number.isFinite(parts[1]) ? Math.max(0, Math.floor(parts[1]!)) : 0,
    patch: Number.isFinite(parts[2]) ? Math.max(0, Math.floor(parts[2]!)) : 0,
  }
}

/** Carry when a segment reaches 10 (1.0.9 → 1.1.0, 1.9.9 → 2.0.0). */
function normalizeVersionTriple(triple: VersionTriple): VersionTriple {
  let { major, minor, patch } = triple
  while (patch >= 10) {
    patch -= 10
    minor += 1
  }
  while (minor >= 10) {
    minor -= 10
    major += 1
  }
  return { major, minor, patch }
}

function formatVersionTriple(triple: VersionTriple): string {
  const n = normalizeVersionTriple(triple)
  return `${n.major}.${n.minor}.${n.patch}`
}

/**
 * Auto-increment marketplace version by 0.0.1 with base-10 carry.
 * Starts from 1.0.0 when current is empty/invalid.
 */
export function bumpMarketplaceVersion(current?: string | null): string {
  if (!current?.trim())
    return INITIAL_MARKETPLACE_VERSION
  const base = normalizeVersionTriple(parseVersionTriple(current))
  return formatVersionTriple({
    major: base.major,
    minor: base.minor,
    patch: base.patch + 1,
  })
}

/**
 * Compare marketplace versions (major.minor.patch).
 * @returns negative if a < b, 0 if equal, positive if a > b
 */
export function compareMarketplaceVersions(a: string, b: string): number {
  const pa = normalizeVersionTriple(parseVersionTriple(a))
  const pb = normalizeVersionTriple(parseVersionTriple(b))
  if (pa.major !== pb.major)
    return pa.major - pb.major
  if (pa.minor !== pb.minor)
    return pa.minor - pb.minor
  return pa.patch - pb.patch
}

function parsePrimaryColor(value: unknown): string | null | undefined {
  if (value === undefined)
    return undefined
  if (value === null || value === ``)
    return null
  const color = trimString(value, 16)
  if (!color || !HEX_COLOR_RE.test(color))
    return null
  return color
}

function parseCoverUrl(value: unknown): string | null | undefined {
  const cover = optionalTrimString(value, MAX_COVER_URL_LENGTH)
  if (cover === undefined || cover === null)
    return cover
  try {
    const url = new URL(cover)
    if (url.protocol !== `https:` && url.protocol !== `http:`)
      return null
    return cover
  }
  catch {
    return null
  }
}

export function validateThemeCss(css: string): ValidateResult<string> {
  if (byteLength(css) > MAX_THEME_CSS_BYTES)
    return { ok: false, error: `payload_too_large` }
  if (CSS_IMPORT_RE.test(css))
    return { ok: false, error: `css_import_forbidden` }
  if (CSS_EXTERNAL_URL_RE.test(css))
    return { ok: false, error: `css_external_url_forbidden` }
  return { ok: true, value: css }
}

/** Empty / null → null (system default). Oversized → error. */
export function parseSampleMarkdown(value: unknown): ValidateResult<string | null> | { ok: true, value: undefined } {
  if (value === undefined)
    return { ok: true, value: undefined }
  if (value === null || value === ``)
    return { ok: true, value: null }
  if (typeof value !== `string`)
    return { ok: false, error: `invalid_sample_markdown` }
  if (byteLength(value) > MAX_SAMPLE_MARKDOWN_BYTES)
    return { ok: false, error: `payload_too_large` }
  const trimmed = value.trim()
  return { ok: true, value: trimmed || null }
}

function isPropDef(input: unknown): boolean {
  if (!input || typeof input !== `object`)
    return false
  const prop = input as Record<string, unknown>
  if (typeof prop.name !== `string` || !prop.name.trim())
    return false
  if (prop.type !== undefined
    && prop.type !== `string`
    && prop.type !== `number`
    && prop.type !== `boolean`
    && prop.type !== `array`) {
    return false
  }
  return true
}

export function validateComponentPayload(
  component: PublishComponentRequest[`component`],
): ValidateResult<string> {
  const name = trimString(component.name, MAX_NAME_LENGTH)
  if (!name || !PASCAL_CASE_RE.test(name))
    return { ok: false, error: `invalid_component_name` }

  const template = typeof component.template === `string` ? component.template : ``
  if (!template.trim())
    return { ok: false, error: `invalid_component_template` }

  if (DANGEROUS_TAG_RE.test(template) || EVENT_HANDLER_RE.test(template) || JS_URL_RE.test(template))
    return { ok: false, error: `unsafe_component_template` }

  if (!Array.isArray(component.props) || !component.props.every(isPropDef))
    return { ok: false, error: `invalid_component_props` }

  const payload = JSON.stringify({
    name,
    description: typeof component.description === `string`
      ? component.description.trim().slice(0, MAX_DESCRIPTION_LENGTH)
      : ``,
    template,
    props: component.props,
    example: typeof component.example === `string` ? component.example : undefined,
  })

  if (byteLength(payload) > MAX_COMPONENT_JSON_BYTES)
    return { ok: false, error: `payload_too_large` }

  return { ok: true, value: payload }
}

export interface NormalizedPublish {
  slug: string
  name: string
  description: string
  version: string
  coverUrl: string | null
  primaryColor: string | null
  sampleMarkdown: string | null
  payload: string
  type: MarketplaceItemType
}

export function validatePublishTheme(body: unknown): ValidateResult<NormalizedPublish> {
  if (!body || typeof body !== `object`)
    return { ok: false, error: `invalid_body` }

  const raw = body as PublishThemeRequest
  const slug = parseSlug(raw.slug)
  if (!slug)
    return { ok: false, error: `invalid_slug` }

  const name = trimString(raw.name, MAX_NAME_LENGTH)
  if (!name)
    return { ok: false, error: `invalid_name` }

  const description = typeof raw.description === `string`
    ? raw.description.trim().slice(0, MAX_DESCRIPTION_LENGTH)
    : ``

  const coverUrl = parseCoverUrl(raw.coverUrl)
  if (coverUrl === null && raw.coverUrl != null && raw.coverUrl !== ``)
    return { ok: false, error: `invalid_cover_url` }

  const primaryColor = parsePrimaryColor(raw.primaryColor)
  if (primaryColor === null && raw.primaryColor != null && raw.primaryColor !== ``)
    return { ok: false, error: `invalid_primary_color` }

  const sampleResult = parseSampleMarkdown(raw.sampleMarkdown)
  if (!sampleResult.ok)
    return sampleResult
  const sampleMarkdown = sampleResult.value === undefined ? null : sampleResult.value

  if (typeof raw.css !== `string` || !raw.css.trim())
    return { ok: false, error: `invalid_css` }

  const cssResult = validateThemeCss(raw.css)
  if (!cssResult.ok)
    return cssResult

  return {
    ok: true,
    value: {
      type: `theme`,
      slug,
      name,
      description,
      version: INITIAL_MARKETPLACE_VERSION,
      coverUrl: coverUrl ?? null,
      primaryColor: primaryColor ?? null,
      sampleMarkdown,
      payload: cssResult.value,
    },
  }
}

export function validatePublishComponent(body: unknown): ValidateResult<NormalizedPublish> {
  if (!body || typeof body !== `object`)
    return { ok: false, error: `invalid_body` }

  const raw = body as PublishComponentRequest
  const slug = parseSlug(raw.slug)
  if (!slug)
    return { ok: false, error: `invalid_slug` }

  const name = trimString(raw.name, MAX_NAME_LENGTH)
  if (!name)
    return { ok: false, error: `invalid_name` }

  const description = typeof raw.description === `string`
    ? raw.description.trim().slice(0, MAX_DESCRIPTION_LENGTH)
    : ``

  const coverUrl = parseCoverUrl(raw.coverUrl)
  if (coverUrl === null && raw.coverUrl != null && raw.coverUrl !== ``)
    return { ok: false, error: `invalid_cover_url` }

  if (!raw.component || typeof raw.component !== `object`)
    return { ok: false, error: `invalid_component` }

  const payloadResult = validateComponentPayload(raw.component)
  if (!payloadResult.ok)
    return payloadResult

  return {
    ok: true,
    value: {
      type: `component`,
      slug,
      name,
      description,
      version: INITIAL_MARKETPLACE_VERSION,
      coverUrl: coverUrl ?? null,
      primaryColor: null,
      sampleMarkdown: null,
      payload: payloadResult.value,
    },
  }
}

export interface NormalizedUpdate {
  name?: string
  description?: string
  version?: string
  coverUrl?: string | null
  primaryColor?: string | null
  sampleMarkdown?: string | null
  payload?: string
}

export function validateUpdate(
  type: MarketplaceItemType,
  body: unknown,
  options?: { currentVersion?: string },
): ValidateResult<NormalizedUpdate> {
  if (!body || typeof body !== `object`)
    return { ok: false, error: `invalid_body` }

  const raw = body as UpdateMarketplaceItemRequest
  const result: NormalizedUpdate = {}

  if (raw.name !== undefined) {
    const name = trimString(raw.name, MAX_NAME_LENGTH)
    if (!name)
      return { ok: false, error: `invalid_name` }
    result.name = name
  }

  if (raw.description !== undefined) {
    if (typeof raw.description !== `string`)
      return { ok: false, error: `invalid_description` }
    result.description = raw.description.trim().slice(0, MAX_DESCRIPTION_LENGTH)
  }

  // Client-supplied version is ignored; server always auto-bumps on update.
  if (options?.currentVersion != null)
    result.version = bumpMarketplaceVersion(options.currentVersion)

  if (raw.coverUrl !== undefined) {
    const coverUrl = parseCoverUrl(raw.coverUrl)
    if (coverUrl === null && raw.coverUrl != null && raw.coverUrl !== ``)
      return { ok: false, error: `invalid_cover_url` }
    result.coverUrl = coverUrl ?? null
  }

  if (type === `theme`) {
    if (raw.primaryColor !== undefined) {
      const primaryColor = parsePrimaryColor(raw.primaryColor)
      if (primaryColor === null && raw.primaryColor != null && raw.primaryColor !== ``)
        return { ok: false, error: `invalid_primary_color` }
      result.primaryColor = primaryColor ?? null
    }
    if (raw.sampleMarkdown !== undefined) {
      const sampleResult = parseSampleMarkdown(raw.sampleMarkdown)
      if (!sampleResult.ok)
        return sampleResult
      if (sampleResult.value !== undefined)
        result.sampleMarkdown = sampleResult.value
    }
    if (raw.css !== undefined) {
      if (typeof raw.css !== `string` || !raw.css.trim())
        return { ok: false, error: `invalid_css` }
      const cssResult = validateThemeCss(raw.css)
      if (!cssResult.ok)
        return cssResult
      result.payload = cssResult.value
    }
  }
  else if (raw.component !== undefined) {
    if (!raw.component || typeof raw.component !== `object`)
      return { ok: false, error: `invalid_component` }
    const payloadResult = validateComponentPayload(raw.component)
    if (!payloadResult.ok)
      return payloadResult
    result.payload = payloadResult.value
  }

  const keys = Object.keys(result).filter(key => key !== `version`)
  if (keys.length === 0 && result.version === undefined)
    return { ok: false, error: `empty_update` }
  if (keys.length === 0)
    return { ok: false, error: `empty_update` }

  return { ok: true, value: result }
}

export function parseRejectReason(value: unknown): string | null {
  if (value === undefined || value === null || value === ``)
    return null
  if (typeof value !== `string`)
    return null
  return value.trim().slice(0, MAX_REJECT_REASON_LENGTH) || null
}
