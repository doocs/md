import { describe, expect, it } from 'vitest'
import { imageUploadCacheKey } from './useImageUploader'

describe(`imageUploadCacheKey`, () => {
  it(`scopes the file hash to the current image host`, () => {
    expect(imageUploadCacheKey(`s3`, `abc`)).toBe(`s3:abc`)
    expect(imageUploadCacheKey(`default`, `abc`)).not.toBe(imageUploadCacheKey(`github`, `abc`))
  })
})
