import type { TypedSchema, TypedSchemaError } from 'vee-validate'
import type { ZodType } from 'zod'
import { z } from 'zod'

/** Reject empty or whitespace-only strings after trim (also stores the trimmed value). */
export function requiredString(message: string) {
  return z.string().trim().min(1, message)
}

export function optionalString() {
  return z.string().optional()
}

/**
 * vee-validate only treats `{ parse, __type: 'VVTypedSchema' }` as a form schema.
 * Raw Zod `.parse()` is not that contract and will not show field errors on blur.
 */
export function toTypedSchema<T extends ZodType>(zodSchema: T): TypedSchema<z.input<T>, z.output<T>> {
  return {
    __type: `VVTypedSchema`,
    async parse(value) {
      const result = await zodSchema.safeParseAsync(isPlainObject(value) ? value : {})
      if (result.success) {
        return {
          value: result.data,
          errors: [] as TypedSchemaError[],
        }
      }

      const errors: Record<string, TypedSchemaError> = {}
      for (const issue of result.error.issues) {
        const path = issue.path.map(String).join(`.`)
        if (!errors[path])
          errors[path] = { path, errors: [] }
        errors[path].errors.push(issue.message)
      }

      return { errors: Object.values(errors) }
    },
    cast(values) {
      return { ...(isPlainObject(values) ? values : {}) } as z.input<T>
    },
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === `object` && !Array.isArray(value)
}
