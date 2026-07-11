export interface Template {
  id: string
  name: string
  content: string
  description?: string
  createdAt: number
  updatedAt: number
  tags?: string[]
}

export interface CreateTemplateParams {
  name: string
  content: string
  description?: string
  tags?: string[]
}

export interface UpdateTemplateParams {
  name?: string
  content?: string
  description?: string
  tags?: string[]
}
