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
 * Empty/invalid current falls back to the initial 1.0.0.
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
