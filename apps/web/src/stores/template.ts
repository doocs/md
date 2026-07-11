import type { CreateTemplateParams, Template, UpdateTemplateParams } from '@md/shared'
import { t } from '@/i18n/translate'
import { store } from '@/storage'
import { addPrefix } from '@/storage/prefix'

/** Markdown template CRUD. */
export const useTemplateStore = defineStore(`template`, () => {
  const templates = store.reactive<Template[]>(addPrefix(`templates`), [])

  const sortedTemplates = computed(() => {
    return [...templates.value].sort((a, b) => b.createdAt - a.createdAt)
  })

  const templateCount = computed(() => templates.value.length)

  function createTemplate(params: CreateTemplateParams): Template {
    const now = Date.now()
    const newTemplate: Template = {
      id: crypto.randomUUID(),
      name: params.name,
      content: params.content,
      description: params.description,
      tags: params.tags,
      createdAt: now,
      updatedAt: now,
    }

    templates.value.push(newTemplate)
    toast.success(t('store.template.created', { name: params.name }))
    return newTemplate
  }

  function getTemplateById(id: string): Template | undefined {
    return templates.value.find(t => t.id === id)
  }

  function updateTemplate(id: string, params: UpdateTemplateParams): boolean {
    const index = templates.value.findIndex(t => t.id === id)
    if (index === -1) {
      toast.error(t('store.template.notFound'))
      return false
    }

    templates.value[index] = {
      ...templates.value[index],
      ...params,
      updatedAt: Date.now(),
    }

    toast.success(t('store.template.updated'))
    return true
  }

  function deleteTemplate(id: string): boolean {
    const index = templates.value.findIndex(t => t.id === id)
    if (index === -1) {
      toast.error(t('store.template.notFound'))
      return false
    }

    const templateName = templates.value[index].name
    templates.value.splice(index, 1)
    toast.success(t('store.template.deleted', { name: templateName }))
    return true
  }

  function searchTemplates(keyword: string): Template[] {
    if (!keyword.trim()) {
      return sortedTemplates.value
    }

    const lowerKeyword = keyword.toLowerCase()
    return sortedTemplates.value.filter((template) => {
      return (
        template.name.toLowerCase().includes(lowerKeyword)
        || template.description?.toLowerCase().includes(lowerKeyword)
        || template.tags?.some(tag => tag.toLowerCase().includes(lowerKeyword))
      )
    })
  }

  function deleteTemplates(ids: string[]): number {
    let deletedCount = 0
    ids.forEach((id) => {
      const index = templates.value.findIndex(t => t.id === id)
      if (index !== -1) {
        templates.value.splice(index, 1)
        deletedCount++
      }
    })

    if (deletedCount > 0) {
      toast.success(t('store.template.batchDeleted', { count: deletedCount }))
    }

    return deletedCount
  }

  function clearAllTemplates(): void {
    const count = templates.value.length
    templates.value = []
    toast.success(t('store.template.allCleared', { count }))
  }

  function exportTemplates(): string {
    return JSON.stringify(templates.value, null, 2)
  }

  function importTemplates(jsonData: string): boolean {
    try {
      const importedTemplates = JSON.parse(jsonData) as Template[]

      if (!Array.isArray(importedTemplates)) {
        toast.error(t('store.template.importInvalidFormat'))
        return false
      }

      const validTemplates = importedTemplates.filter((t) => {
        return t.id && t.name && t.content && t.createdAt && t.updatedAt
      })

      if (validTemplates.length === 0) {
        toast.error(t('store.template.importNoValid'))
        return false
      }

      validTemplates.forEach((importedTemplate) => {
        const existingIndex = templates.value.findIndex(t => t.id === importedTemplate.id)
        if (existingIndex !== -1) {
          templates.value.push({
            ...importedTemplate,
            id: crypto.randomUUID(),
          })
        }
        else {
          templates.value.push(importedTemplate)
        }
      })

      toast.success(t('store.template.importSuccess', { count: validTemplates.length }))
      return true
    }
    catch (error) {
      console.error(`Import templates failed:`, error)
      toast.error(t('store.template.importParseError'))
      return false
    }
  }

  return {
    templates,
    sortedTemplates,
    templateCount,
    createTemplate,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
    searchTemplates,
    deleteTemplates,
    clearAllTemplates,
    exportTemplates,
    importTemplates,
  }
})
