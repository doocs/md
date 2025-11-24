import type { CreateTemplateParams, Template, UpdateTemplateParams } from '@md/shared'
import { v4 as uuidv4 } from 'uuid'
import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'

/**
 * 模板管理 Store
 * 负责管理 Markdown 模板的增删改查
 */
export const useTemplateStore = defineStore(`template`, () => {
  // ==================== 状态 ====================
  // 模板列表 - 使用响应式存储，自动持久化到 localStorage
  const templates = store.reactive<Template[]>(addPrefix(`templates`), [])

  // ==================== 计算属性 ====================
  // 按创建时间倒序排列的模板列表
  const sortedTemplates = computed(() => {
    return [...templates.value].sort((a, b) => b.createdAt - a.createdAt)
  })

  // 模板总数
  const templateCount = computed(() => templates.value.length)

  // ==================== 方法 ====================
  /**
   * 创建新模板
   */
  function createTemplate(params: CreateTemplateParams): Template {
    const now = Date.now()
    const newTemplate: Template = {
      id: uuidv4(),
      name: params.name,
      content: params.content,
      description: params.description,
      tags: params.tags,
      createdAt: now,
      updatedAt: now,
    }

    templates.value.push(newTemplate)
    toast.success(`模板「${params.name}」创建成功`)
    return newTemplate
  }

  /**
   * 根据 ID 获取模板
   */
  function getTemplateById(id: string): Template | undefined {
    return templates.value.find(t => t.id === id)
  }

  /**
   * 更新模板
   */
  function updateTemplate(id: string, params: UpdateTemplateParams): boolean {
    const index = templates.value.findIndex(t => t.id === id)
    if (index === -1) {
      toast.error(`模板不存在`)
      return false
    }

    templates.value[index] = {
      ...templates.value[index],
      ...params,
      updatedAt: Date.now(),
    }

    toast.success(`模板已更新`)
    return true
  }

  /**
   * 删除模板
   */
  function deleteTemplate(id: string): boolean {
    const index = templates.value.findIndex(t => t.id === id)
    if (index === -1) {
      toast.error(`模板不存在`)
      return false
    }

    const templateName = templates.value[index].name
    templates.value.splice(index, 1)
    toast.success(`模板「${templateName}」已删除`)
    return true
  }

  /**
   * 根据名称搜索模板
   */
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

  /**
   * 批量删除模板
   */
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
      toast.success(`已删除 ${deletedCount} 个模板`)
    }

    return deletedCount
  }

  /**
   * 清空所有模板
   */
  function clearAllTemplates(): void {
    const count = templates.value.length
    templates.value = []
    toast.success(`已清空所有模板（共 ${count} 个）`)
  }

  /**
   * 导出所有模板为 JSON
   */
  function exportTemplates(): string {
    return JSON.stringify(templates.value, null, 2)
  }

  /**
   * 从 JSON 导入模板
   */
  function importTemplates(jsonData: string): boolean {
    try {
      const importedTemplates = JSON.parse(jsonData) as Template[]

      if (!Array.isArray(importedTemplates)) {
        toast.error(`导入失败：数据格式不正确`)
        return false
      }

      // 验证每个模板的必需字段
      const validTemplates = importedTemplates.filter((t) => {
        return t.id && t.name && t.content && t.createdAt && t.updatedAt
      })

      if (validTemplates.length === 0) {
        toast.error(`导入失败：没有有效的模板数据`)
        return false
      }

      // 合并模板（避免 ID 重复）
      validTemplates.forEach((importedTemplate) => {
        const existingIndex = templates.value.findIndex(t => t.id === importedTemplate.id)
        if (existingIndex !== -1) {
          // ID 重复，生成新 ID
          templates.value.push({
            ...importedTemplate,
            id: uuidv4(),
          })
        }
        else {
          templates.value.push(importedTemplate)
        }
      })

      toast.success(`成功导入 ${validTemplates.length} 个模板`)
      return true
    }
    catch (error) {
      console.error(`Import templates failed:`, error)
      toast.error(`导入失败：数据解析错误`)
      return false
    }
  }

  return {
    // 状态
    templates,

    // 计算属性
    sortedTemplates,
    templateCount,

    // 方法
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
