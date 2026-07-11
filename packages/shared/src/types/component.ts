/**
 * Custom component system types.
 *
 * Users can embed JSX-style components in Markdown, e.g.:
 *   <QRCodeBlock url="https://example.com" text="Scan to visit" />
 */

export type ComponentPropType = 'string' | 'number' | 'boolean' | 'array'

export interface ComponentPropDef {
  name: string
  /** Shown in editor hints */
  description?: string
  default?: string
  required?: boolean
  type?: ComponentPropType
}

export interface CustomComponentDef {
  id: string
  /** PascalCase component name, e.g. QRCodeBlock */
  name: string
  description?: string
  /**
   * HTML template with {{propName}} placeholders
   * @example `<img src="https://api.qrserver.com/v1/create-qr-code/?data={{url}}" />`
   */
  template: string
  props: ComponentPropDef[]
  /** Built-in components cannot be deleted but may be overridden */
  builtIn?: boolean
  /** UI example; preferred over auto-generated snippet */
  example?: string
  createdAt?: number
  updatedAt?: number
}

export type ComponentRegistry = Record<string, CustomComponentDef>

export interface CreateComponentParams {
  name: string
  description?: string
  template: string
  props: ComponentPropDef[]
}

export interface UpdateComponentParams {
  name?: string
  description?: string
  template?: string
  props?: ComponentPropDef[]
}
