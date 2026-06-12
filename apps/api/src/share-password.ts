import type { Env } from './types'
import { sign, verify } from 'hono/jwt'

const PBKDF2_ITERATIONS = 100_000
const GENERATED_PASSWORD_LENGTH = 8
const GENERATED_ALPHABET = `ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789`
const MIN_PASSWORD_LENGTH = 4
const MAX_PASSWORD_LENGTH = 64
const SHARE_ACCESS_MAX_AGE_SEC = 60 * 60 * 24

interface ShareAccessPayload {
  sub: string
  typ: `share_access`
  exp: number
}

function toBase64(bytes: Uint8Array): string {
  let binary = ``
  for (const byte of bytes)
    binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++)
    bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function shareAccessCookieName(shareId: string): string {
  return `md_share_${shareId}`
}

export function shareAccessCookiePath(shareId: string): string {
  return `/s/${shareId}`
}

export function generateSharePassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(GENERATED_PASSWORD_LENGTH))
  let password = ``
  for (let i = 0; i < GENERATED_PASSWORD_LENGTH; i++)
    password += GENERATED_ALPHABET[bytes[i]! % GENERATED_ALPHABET.length]
  return password
}

export function parseSharePasswordMode(value: unknown): `none` | `custom` | `auto` | null {
  if (value === `none` || value === `custom` || value === `auto`)
    return value
  return null
}

export function parseCustomPassword(value: unknown): string | null {
  if (typeof value !== `string`)
    return null
  const password = value.trim()
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH)
    return null
  return password
}

export async function hashSharePassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    `raw`,
    new TextEncoder().encode(password),
    `PBKDF2`,
    false,
    [`deriveBits`],
  )
  const hash = await crypto.subtle.deriveBits(
    {
      name: `PBKDF2`,
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: `SHA-256`,
    },
    keyMaterial,
    256,
  )

  return `pbkdf2:${PBKDF2_ITERATIONS}:${toBase64(salt)}:${toBase64(new Uint8Array(hash))}`
}

export async function verifySharePassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(`:`)
  if (parts.length !== 4 || parts[0] !== `pbkdf2`)
    return false

  const iterations = Number(parts[1])
  if (!Number.isFinite(iterations) || iterations <= 0)
    return false

  let salt: Uint8Array
  let expected: Uint8Array
  try {
    salt = fromBase64(parts[2]!)
    expected = fromBase64(parts[3]!)
  }
  catch {
    return false
  }

  const keyMaterial = await crypto.subtle.importKey(
    `raw`,
    new TextEncoder().encode(password),
    `PBKDF2`,
    false,
    [`deriveBits`],
  )
  const hash = await crypto.subtle.deriveBits(
    {
      name: `PBKDF2`,
      salt,
      iterations,
      hash: `SHA-256`,
    },
    keyMaterial,
    expected.byteLength * 8,
  )

  const actual = new Uint8Array(hash)
  if (actual.length !== expected.length)
    return false

  let diff = 0
  for (let i = 0; i < actual.length; i++)
    diff |= actual[i]! ^ expected[i]!
  return diff === 0
}

export async function issueShareAccessToken(
  env: Env,
  shareId: string,
  shareExpiresAt: number | null,
): Promise<string> {
  const shareExpirySec = shareExpiresAt != null
    ? Math.floor(shareExpiresAt / 1000)
    : Math.floor(Date.now() / 1000) + SHARE_ACCESS_MAX_AGE_SEC
  const exp = Math.min(
    shareExpirySec,
    Math.floor(Date.now() / 1000) + SHARE_ACCESS_MAX_AGE_SEC,
  )

  return sign({ sub: shareId, typ: `share_access`, exp }, env.JWT_SECRET, `HS256`)
}

export async function verifyShareAccessToken(
  env: Env,
  shareId: string,
  token: string,
): Promise<boolean> {
  try {
    const payload = (await verify(token, env.JWT_SECRET, `HS256`)) as unknown as ShareAccessPayload
    return payload?.typ === `share_access` && payload.sub === shareId
  }
  catch {
    return false
  }
}
