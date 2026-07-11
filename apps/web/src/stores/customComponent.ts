import type { ComponentRegistry, CreateComponentParams, CustomComponentDef, UpdateComponentParams } from '@md/shared'
import { BUILT_IN_COMPONENTS, getBuiltInRegistry } from '@md/core'
import { t } from '@/i18n/translate'
import { buildComponentSnippet } from '@/lib/component-snippet'
import { store } from '@/storage'
import { addPrefix } from '@/storage/prefix'

/**
 * Custom component store.
 *
 * Users define JSX-style components for Markdown, e.g.:
 *   <QRCodeBlock url="https://example.com" text="Scan to visit" />
 *
 * Built-in components ship with the app; user components persist to localStorage.
 * The merged registry is passed to the renderer.
 */
export const useCustomComponentStore = defineStore(`customComponent`, () => {
  const userComponents = store.reactive<CustomComponentDef[]>(addPrefix(`custom_components`), [])

  const builtInComponents = computed(() => BUILT_IN_COMPONENTS)

  const allComponents = computed<CustomComponentDef[]>(() => {
    const builtInMap = new Map(BUILT_IN_COMPONENTS.map(c => [c.name, c]))
    for (const c of userComponents.value) {
      builtInMap.set(c.name, c)
    }
    return [...builtInMap.values()]
  })

  const registry = computed<ComponentRegistry>(() => {
    const base = getBuiltInRegistry()
    for (const c of userComponents.value) {
      base[c.name] = c
    }
    return base
  })

  function createComponent(params: CreateComponentParams): CustomComponentDef {
    const now = Date.now()
    const def: CustomComponentDef = {
      id: crypto.randomUUID(),
      name: params.name,
      description: params.description,
      template: params.template,
      props: params.props,
      createdAt: now,
      updatedAt: now,
    }
    userComponents.value.push(def)
    toast.success(t('store.component.created', { name: params.name }))
    return def
  }

  function updateComponent(id: string, params: UpdateComponentParams): boolean {
    const idx = userComponents.value.findIndex(c => c.id === id)
    if (idx === -1) {
      toast.error(t('store.component.notFound'))
      return false
    }
    userComponents.value[idx] = {
      ...userComponents.value[idx],
      ...params,
      updatedAt: Date.now(),
    }
    toast.success(t('store.component.updated'))
    return true
  }

  function deleteComponent(id: string): boolean {
    const idx = userComponents.value.findIndex(c => c.id === id)
    if (idx === -1) {
      toast.error(t('store.component.notFound'))
      return false
    }
    const name = userComponents.value[idx].name
    userComponents.value.splice(idx, 1)
    toast.success(t('store.component.deleted', { name }))
    return true
  }

  function getComponentById(id: string): CustomComponentDef | undefined {
    return userComponents.value.find(c => c.id === id)
  }

  /** Build a Markdown usage snippet; uses `example` when set, otherwise derives placeholders from prop types. */
  function buildSnippet(def: CustomComponentDef, values?: Record<string, string>): string {
    return buildComponentSnippet(def, values)
  }

  return {
    userComponents,
    builtInComponents,
    allComponents,
    registry,
    createComponent,
    updateComponent,
    deleteComponent,
    getComponentById,
    buildSnippet,
  }
})
