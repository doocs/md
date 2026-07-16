import { v4 } from 'uuid'

/** Generate a RFC 4122 v4 UUID (works in non-secure HTTP contexts, unlike crypto.randomUUID). */
export function uuidv4(): string {
  return v4()
}
