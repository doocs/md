import { z } from 'zod'

/** Non-empty trimmed string — yup.string().required() equivalent. */
export function requiredString(message: string) {
  return z.string().trim().min(1, message)
}

export function optionalString() {
  return z.string().optional()
}
