import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { requiredString, toTypedSchema } from './form-schema'

describe(`toTypedSchema`, () => {
  const schema = toTypedSchema(z.object({
    repo: requiredString(`repo required`),
    token: requiredString(`token required`),
  }))

  it(`is a vee-validate typed schema`, () => {
    expect(schema.__type).toBe(`VVTypedSchema`)
    expect(typeof schema.parse).toBe(`function`)
  })

  it(`returns field errors instead of throwing on empty values`, async () => {
    const result = await schema.parse(undefined as never)
    expect(result.errors.map(error => error.path)).toEqual(expect.arrayContaining([`repo`, `token`]))
  })

  it(`maps a blurred empty required field`, async () => {
    const result = await schema.parse({ repo: ``, token: `ok` })
    expect(result.errors).toEqual([{ path: `repo`, errors: [`repo required`] }])
  })

  it(`returns parsed values when valid`, async () => {
    const result = await schema.parse({ repo: ` doocs/md `, token: `abc` })
    expect(result.errors).toEqual([])
    expect(result.value).toEqual({ repo: `doocs/md`, token: `abc` })
  })
})
