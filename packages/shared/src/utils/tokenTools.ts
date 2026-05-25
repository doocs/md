export function utf16to8(str: string) {
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

const base64EncodeChars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_`

export function base64encode(str: string) {
  let out = ``
  let i = 0
  const len = str.length

  while (i < len) {
    const c1 = str.charCodeAt(i++) & 0xFF

    if (i === len) {
      out += base64EncodeChars.charAt(c1 >> 2)
      out += base64EncodeChars.charAt((c1 & 0x3) << 4)
      out += `==`
      break
    }

    const c2 = str.charCodeAt(i++)

    if (i === len) {
      out += base64EncodeChars.charAt(c1 >> 2)
      out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4))
      out += base64EncodeChars.charAt((c2 & 0xF) << 2)
      out += `=`
      break
    }

    const c3 = str.charCodeAt(i++)

    out += base64EncodeChars.charAt(c1 >> 2)
    out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4))
    out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6))
    out += base64EncodeChars.charAt(c3 & 0x3F)
  }

  return out
}

export function safe64(base64: string) {
  base64 = base64.replace(/\+/g, `-`)
  base64 = base64.replace(/\//g, `_`)
  return base64
}
