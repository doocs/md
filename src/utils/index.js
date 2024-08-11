import { prefix } from '@/config'

export function addPrefix(str) {
  return `${prefix}__${str}`
}
