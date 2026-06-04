import type { ComponentRegistry, CreateComponentParams, CustomComponentDef, UpdateComponentParams } from '@md/shared'
import { BUILT_IN_COMPONENTS, getBuiltInRegistry } from '@md/core'
import { v4 as uuidv4 } from 'uuid'
import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'

/**
 * 自定义组件管理 Store
 *
 * 用户可定义 JSX 风格的组件，在 Markdown 中使用：
 *   <QRCodeBlock url="https://example.com" text="扫码访问" />
 *
 * 内置组件随系统提供，用户组件持久化到 localStorage。
 * 合并后的注册表传递给渲染器使用。
 */
export const useCustomComponentStore = defineStore(`customComponent`, () => {
  // ==================== 状态 ====================

  /** 用户自定义组件列表（持久化） */
  const userComponents = store.reactive<CustomComponentDef[]>(addPrefix(`custom_components`), [])

  // ==================== 计算属性 ====================

  /** 内置组件列表（只读） */
  const builtInComponents = computed(() => BUILT_IN_COMPONENTS)

  /** 所有组件（内置 + 用户，用户组件可覆盖内置组件名） */
  const allComponents = computed<CustomComponentDef[]>(() => {
    const builtInMap = new Map(BUILT_IN_COMPONENTS.map(c => [c.name, c]))
    // 用户组件覆盖同名内置组件
    for (const c of userComponents.value) {
      builtInMap.set(c.name, c)
    }
    return [...builtInMap.values()]
  })

  /** 渲染器使用的注册表 */
  const registry = computed<ComponentRegistry>(() => {
    const base = getBuiltInRegistry()
    for (const c of userComponents.value) {
      base[c.name] = c
    }
    return base
  })

  // ==================== 方法 ====================

  /**
   * 创建新的用户组件
   */
  function createComponent(params: CreateComponentParams): CustomComponentDef {
    const now = Date.now()
    const def: CustomComponentDef = {
      id: uuidv4(),
      name: params.name,
      description: params.description,
      template: params.template,
      props: params.props,
      createdAt: now,
      updatedAt: now,
    }
    userComponents.value.push(def)
    toast.success(`组件「${params.name}」创建成功`)
    return def
  }

  /**
   * 更新用户组件
   */
  function updateComponent(id: string, params: UpdateComponentParams): boolean {
    const idx = userComponents.value.findIndex(c => c.id === id)
    if (idx === -1) {
      toast.error(`组件不存在`)
      return false
    }
    userComponents.value[idx] = {
      ...userComponents.value[idx],
      ...params,
      updatedAt: Date.now(),
    }
    toast.success(`组件已更新`)
    return true
  }

  /**
   * 删除用户组件（不能删除内置组件）
   */
  function deleteComponent(id: string): boolean {
    const idx = userComponents.value.findIndex(c => c.id === id)
    if (idx === -1) {
      toast.error(`组件不存在`)
      return false
    }
    const name = userComponents.value[idx].name
    userComponents.value.splice(idx, 1)
    toast.success(`组件「${name}」已删除`)
    return true
  }

  /**
   * 根据 ID 查找用户组件
   */
  function getComponentById(id: string): CustomComponentDef | undefined {
    return userComponents.value.find(c => c.id === id)
  }

  /**
   * 生成该组件的 Markdown 使用示例字符串
   * 优先使用 example 字段；否则自动构造，根据 prop.type 生成合适的占位值
   */
  function buildSnippet(def: CustomComponentDef): string {
    if (def.example)
      return def.example
    const propsStr = def.props
      .map((p) => {
        let placeholder: string
        if (p.default !== undefined && p.default !== ``)
          placeholder = p.default
        else if (p.type === `array`)
          placeholder = `[]`
        else if (p.type === `boolean`)
          placeholder = `true`
        else if (p.type === `number`)
          placeholder = `0`
        else
          placeholder = p.name
        return `${p.name}="${placeholder}"`
      })
      .join(` `)
    return `<${def.name}${propsStr ? ` ${propsStr}` : ``} />`
  }

  return {
    // State
    userComponents,
    // Computed
    builtInComponents,
    allComponents,
    registry,
    // Actions
    createComponent,
    updateComponent,
    deleteComponent,
    getComponentById,
    buildSnippet,
  }
})
