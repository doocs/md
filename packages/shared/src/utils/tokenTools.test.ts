import { describe, expect, it } from 'vitest'
import { base64encode, safe64, utf16to8 } from './tokenTools'

/** Previous hand-rolled impl — tests must stay byte-identical for Qiniu tokens. */
function legacyUtf16to8(str: string) {
  let out = ``
  const len = str.length

  for (let i = 0; i < len; i++) {
    const c = str.charCodeAt(i)

    if (c >= 0x0001 && c <= 0x007F) {
      out += str.charAt(i)
    }
    else if (c > 0x07FF) {
      out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F))
      out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F))
      out += String.fromCharCode(0x80 | (c & 0x3F))
    }
    else {
      out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F))
      out += String.fromCharCode(0x80 | (c & 0x3F))
    }
  }

  return out
}

const legacyBase64EncodeChars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_`

function legacyBase64encode(str: string) {
  let out = ``
  let i = 0
  const len = str.length

  while (i < len) {
    const c1 = str.charCodeAt(i++) & 0xFF

    if (i === len) {
      out += legacyBase64EncodeChars.charAt(c1 >> 2)
      out += legacyBase64EncodeChars.charAt((c1 & 0x3) << 4)
      out += `==`
      break
    }

    const c2 = str.charCodeAt(i++)

    if (i === len) {
      out += legacyBase64EncodeChars.charAt(c1 >> 2)
      out += legacyBase64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4))
      out += legacyBase64EncodeChars.charAt((c2 & 0xF) << 2)
      out += `=`
      break
    }

    const c3 = str.charCodeAt(i++)

    out += legacyBase64EncodeChars.charAt(c1 >> 2)
    out += legacyBase64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4))
    out += legacyBase64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6))
    out += legacyBase64EncodeChars.charAt(c3 & 0x3F)
  }

  return out
}

describe(`tokenTools`, () => {
  const samples = [
    `hello`,
    `{"scope":"bucket","deadline":123}`,
    `中文政策`,
    ``,
  ]

  it(`utf16to8 matches the legacy encoder`, () => {
    for (const sample of samples)
      expect(utf16to8(sample)).toBe(legacyUtf16to8(sample))
  })

  it(`base64encode matches the legacy URL-safe encoder`, () => {
    for (const sample of samples) {
      const latin1 = utf16to8(sample)
      expect(base64encode(latin1)).toBe(legacyBase64encode(latin1))
    }
  })

  it(`safe64 rewrites standard Base64 alphabet`, () => {
    expect(safe64(`ab+c/d==`)).toBe(`ab-c_d==`)
  })

  it(`encodes supplementary-plane characters as UTF-8 (not CESU-8)`, () => {
    expect([...utf16to8(`😀`)].map(ch => ch.charCodeAt(0))).toEqual([0xF0, 0x9F, 0x98, 0x80])
  })
})
