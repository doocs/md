const textEncoder = new TextEncoder()

function bytesToLatin1(bytes: Uint8Array): string {
  const chunk = 0x8000
  let out = ``
  for (let i = 0; i < bytes.length; i += chunk)
    out += String.fromCharCode(...bytes.subarray(i, i + chunk))
  return out
}

/**
 * Encode a JS string as a Latin-1 string of UTF-8 bytes.
 * Kept for Qiniu token signing and custom-upload `util.tokenTools` compatibility.
 */
export function utf16to8(str: string): string {
  return bytesToLatin1(textEncoder.encode(str))
}

function latin1ToBase64(str: string): string {
  return btoa(str)
}

/** URL-safe Base64 (with padding) of a Latin-1 byte string. */
export function base64encode(str: string): string {
  return safe64(latin1ToBase64(str))
}

export function safe64(base64: string): string {
  return base64.replace(/\+/g, `-`).replace(/\//g, `_`)
}
