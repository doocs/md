import { prefix } from '@md/shared/configs'

export function addPrefix(str: string) {
  return `${prefix}__${str}`
}
