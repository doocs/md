import { describe, expect, it } from 'vitest'
import { loadCryptoJS } from './crypto-js-compat'

describe(`crypto-js compatibility layer`, () => {
  it(`computes MD5 as hex by default (RFC 1321 vector)`, async () => {
    const CryptoJS = await loadCryptoJS()
    expect(CryptoJS.MD5(`abc`).toString()).toBe(`900150983cd24fb0d6963f7d28e17f72`)
  })

  it(`computes SHA1 as hex by default (FIPS 180 vector)`, async () => {
    const CryptoJS = await loadCryptoJS()
    expect(CryptoJS.SHA1(`abc`).toString()).toBe(`a9993e364706816aba3e25717850c26c9cd0d89d`)
  })

  it(`computes HmacSHA1 and encodes via the enc.Base64 namespace`, async () => {
    const CryptoJS = await loadCryptoJS()
    const hash = CryptoJS.HmacSHA1(`The quick brown fox jumps over the lazy dog`, `key`)
    expect(hash.toString()).toBe(`de7c9b85b8b78aa6bc8a7a36f70a90701c9db4d9`)
    expect(hash.toString(CryptoJS.enc.Base64)).toBe(`3nybhbi3iqa8ino29wqQcBydtNk=`)
  })

  it(`round-trips strings through enc.Utf8`, async () => {
    const CryptoJS = await loadCryptoJS()
    const words = CryptoJS.enc.Utf8.parse(`你好, world`)
    expect(words.toString(CryptoJS.enc.Utf8)).toBe(`你好, world`)
  })

  it(`round-trips AES encrypt/decrypt like crypto-js`, async () => {
    const CryptoJS = await loadCryptoJS()
    const ciphertext = CryptoJS.AES.encrypt(`secret message`, `passphrase`).toString()
    const plaintext = CryptoJS.AES.decrypt(ciphertext, `passphrase`).toString(CryptoJS.enc.Utf8)
    expect(plaintext).toBe(`secret message`)
  })

  it(`caches the module so repeated loads return the same object`, async () => {
    const [a, b] = await Promise.all([loadCryptoJS(), loadCryptoJS()])
    expect(a).toBe(b)
  })
})
