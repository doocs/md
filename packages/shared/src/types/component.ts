/**
 * 自定义组件系统类型定义
 *
 * 允许用户在 Markdown 中使用 JSX 风格的自定义组件：
 *   <QRCodeBlock url="https://example.com" text="扫码访问" />
 */

/** 组件 Prop 定义 */
export interface ComponentPropDef {
  /** Prop 名称 */
  name: string
  /** Prop 描述（用于编辑器提示） */
  description?: string
  /** 默认值 */
  default?: string
  /** 是否必填 */
  required?: boolean
}

/** 组件定义 */
export interface CustomComponentDef {
  /** 唯一 ID */
  id: string
  /** 组件名称，必须为 PascalCase，如 QRCodeBlock */
  name: string
  /** 组件描述 */
  description?: string
  /**
   * HTML 模板，使用 {{propName}} 作为 prop 占位符
   * @example `<img src="https://api.qrserver.com/v1/create-qr-code/?data={{url}}" />`
   */
  template: string
  /** Prop 列表 */
  props: ComponentPropDef[]
  /** 是否为内置组件（内置组件不可删除，但可覆盖） */
  builtIn?: boolean
  /** 创建时间戳 */
  createdAt?: number
  /** 最后更新时间戳 */
  updatedAt?: number
}

/** 组件注册表：组件名 -> 组件定义 */
export type ComponentRegistry = Record<string, CustomComponentDef>

/** 创建组件的参数 */
export interface CreateComponentParams {
  name: string
  description?: string
  template: string
  props: ComponentPropDef[]
}

/** 更新组件的参数 */
export interface UpdateComponentParams {
  name?: string
  description?: string
  template?: string
  props?: ComponentPropDef[]
}
