/**
 * crypto-js compatibility layer backed by crypto-es, the maintained ESM fork
 * of the deprecated crypto-js package. crypto-es exposes the same algorithms
 * through flat named exports; this module re-shapes them into the legacy
 * crypto-js namespace so internal signers and custom upload scripts
 * (`util.CryptoJS`, see docs/custom-upload.md) keep working unchanged.
 */

type CryptoESModule = typeof import('crypto-es')

// Explicit annotation (instead of inference) keeps the declaration emit
// nameable: some crypto-es internals are not re-exported from its entrypoint.
export type CryptoJSCompat = CryptoESModule & {
  enc: {
    Hex: CryptoESModule['Hex']
    Latin1: CryptoESModule['Latin1']
    Utf8: CryptoESModule['Utf8']
    Utf16: CryptoESModule['Utf16']
    Utf16BE: CryptoESModule['Utf16BE']
    Utf16LE: CryptoESModule['Utf16LE']
    Base64: CryptoESModule['Base64']
    Base64url: CryptoESModule['Base64url']
  }
  mode: {
    CBC: CryptoESModule['CBC']
    CFB: CryptoESModule['CFB']
    CTR: CryptoESModule['CTR']
    CTRGladman: CryptoESModule['CTRGladman']
    OFB: CryptoESModule['OFB']
    ECB: CryptoESModule['ECB']
  }
  pad: {
    Pkcs7: CryptoESModule['Pkcs7']
    AnsiX923: CryptoESModule['AnsiX923']
    Iso10126: CryptoESModule['Iso10126']
    Iso97971: CryptoESModule['Iso97971']
    ZeroPadding: CryptoESModule['ZeroPadding']
    NoPadding: CryptoESModule['NoPadding']
  }
  format: {
    Hex: CryptoESModule['HexFormatter']
    OpenSSL: CryptoESModule['OpenSSLFormatter']
  }
  kdf: {
    OpenSSL: CryptoESModule['OpenSSLKdf']
  }
  x64: {
    Word: CryptoESModule['X64Word']
    WordArray: CryptoESModule['X64WordArray']
  }
  algo: {
    MD5: CryptoESModule['MD5Algo']
    SHA1: CryptoESModule['SHA1Algo']
    SHA224: CryptoESModule['SHA224Algo']
    SHA256: CryptoESModule['SHA256Algo']
    SHA384: CryptoESModule['SHA384Algo']
    SHA512: CryptoESModule['SHA512Algo']
    SHA3: CryptoESModule['SHA3Algo']
    RIPEMD160: CryptoESModule['RIPEMD160Algo']
    HMAC: CryptoESModule['HMAC']
    PBKDF2: CryptoESModule['PBKDF2Algo']
    EvpKDF: CryptoESModule['EvpKDFAlgo']
    AES: CryptoESModule['AESAlgo']
    DES: CryptoESModule['DESAlgo']
    TripleDES: CryptoESModule['TripleDESAlgo']
    Rabbit: CryptoESModule['RabbitAlgo']
    RabbitLegacy: CryptoESModule['RabbitLegacyAlgo']
    RC4: CryptoESModule['RC4Algo']
    RC4Drop: CryptoESModule['RC4DropAlgo']
    Blowfish: CryptoESModule['BlowfishAlgo']
  }
  lib: {
    Base: CryptoESModule['Base']
    WordArray: CryptoESModule['WordArray']
    BufferedBlockAlgorithm: CryptoESModule['BufferedBlockAlgorithm']
    Hasher: CryptoESModule['Hasher']
    Cipher: CryptoESModule['Cipher']
    StreamCipher: CryptoESModule['StreamCipher']
    BlockCipher: CryptoESModule['BlockCipher']
    CipherParams: CryptoESModule['CipherParams']
    SerializableCipher: CryptoESModule['SerializableCipher']
    PasswordBasedCipher: CryptoESModule['PasswordBasedCipher']
  }
}

function buildCompat(m: CryptoESModule): CryptoJSCompat {
  return {
    ...m,
    enc: {
      Hex: m.Hex,
      Latin1: m.Latin1,
      Utf8: m.Utf8,
      Utf16: m.Utf16,
      Utf16BE: m.Utf16BE,
      Utf16LE: m.Utf16LE,
      Base64: m.Base64,
      Base64url: m.Base64url,
    },
    mode: {
      CBC: m.CBC,
      CFB: m.CFB,
      CTR: m.CTR,
      CTRGladman: m.CTRGladman,
      OFB: m.OFB,
      ECB: m.ECB,
    },
    pad: {
      Pkcs7: m.Pkcs7,
      AnsiX923: m.AnsiX923,
      Iso10126: m.Iso10126,
      Iso97971: m.Iso97971,
      ZeroPadding: m.ZeroPadding,
      NoPadding: m.NoPadding,
    },
    format: {
      Hex: m.HexFormatter,
      OpenSSL: m.OpenSSLFormatter,
    },
    kdf: {
      OpenSSL: m.OpenSSLKdf,
    },
    x64: {
      Word: m.X64Word,
      WordArray: m.X64WordArray,
    },
    algo: {
      MD5: m.MD5Algo,
      SHA1: m.SHA1Algo,
      SHA224: m.SHA224Algo,
      SHA256: m.SHA256Algo,
      SHA384: m.SHA384Algo,
      SHA512: m.SHA512Algo,
      SHA3: m.SHA3Algo,
      RIPEMD160: m.RIPEMD160Algo,
      HMAC: m.HMAC,
      PBKDF2: m.PBKDF2Algo,
      EvpKDF: m.EvpKDFAlgo,
      AES: m.AESAlgo,
      DES: m.DESAlgo,
      TripleDES: m.TripleDESAlgo,
      Rabbit: m.RabbitAlgo,
      RabbitLegacy: m.RabbitLegacyAlgo,
      RC4: m.RC4Algo,
      RC4Drop: m.RC4DropAlgo,
      Blowfish: m.BlowfishAlgo,
    },
    lib: {
      Base: m.Base,
      WordArray: m.WordArray,
      BufferedBlockAlgorithm: m.BufferedBlockAlgorithm,
      Hasher: m.Hasher,
      Cipher: m.Cipher,
      StreamCipher: m.StreamCipher,
      BlockCipher: m.BlockCipher,
      CipherParams: m.CipherParams,
      SerializableCipher: m.SerializableCipher,
      PasswordBasedCipher: m.PasswordBasedCipher,
    },
  }
}

let cryptoJsPromise: Promise<CryptoJSCompat> | null = null

export function loadCryptoJS() {
  cryptoJsPromise ??= import(`crypto-es`).then(buildCompat)
  return cryptoJsPromise
}
