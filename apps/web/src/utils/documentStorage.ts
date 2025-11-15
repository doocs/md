/**
 * 文档存储抽象层
 * 支持多种存储平台：localStorage、WebDAV、腾讯云COS等
 */

import COS from 'cos-js-sdk-v5'
import { store } from './storage'

/**
 * 文档数据结构
 */
export interface DocumentData {
  id: string
  title: string
  content: string
  history: {
    datetime: string
    content: string
  }[]
  createDatetime: Date
  updateDatetime: Date
  parentId?: string | null
  collapsed?: boolean
}

/**
 * 项目配置数据结构
 * 与 EditorStateDialog 的导入/导出配置保持一致
 */
export interface ProjectConfig {
  // ========== 图床配置 ==========
  githubConfig?: any
  aliOSSConfig?: any
  txCOSConfig?: any
  qiniuConfig?: any
  minioConfig?: any
  telegramConfig?: any
  mpConfig?: any
  r2Config?: any
  upyunConfig?: any
  cloudinaryConfig?: any
  imgHost?: string
  useCompression?: boolean

  // ========== 文档存储配置 ==========
  webdavDocConfig?: any
  cosDocConfig?: any
  docStorageType?: string

  // ========== 自定义表单配置 ==========
  formCustomConfig?: any

  // ========== UI Store 状态 ==========
  isDark?: boolean
  isEditOnLeft?: boolean
  isOpenRightSlider?: boolean
  isOpenPostSlider?: boolean
  showAIToolbox?: boolean

  // ========== Theme Store 状态 ==========
  theme?: string
  fontFamily?: string
  fontSize?: string
  primaryColor?: string
  codeBlockTheme?: string
  legend?: string
  isMacCodeBlock?: boolean
  isShowLineNumber?: boolean
  isCiteStatus?: boolean
  isCountStatus?: boolean
  isUseIndent?: boolean
  isUseJustify?: boolean

  // ========== CSS Editor Store 状态 ==========
  cssContentConfig?: any

  // ========== Post Store 状态 ==========
  currentPostIndex?: number

  // ========== 其他配置 ==========
  copyMode?: string
  sortMode?: string

  // 支持其他未知配置
  [key: string]: any
}

/**
 * 文档存储引擎接口
 */
export interface DocumentStorageEngine {
  /**
   * 获取所有文档
   */
  getDocuments: () => Promise<DocumentData[]>

  /**
   * 保存所有文档
   */
  saveDocuments: (documents: DocumentData[]) => Promise<void>

  /**
   * 获取当前文档ID
   */
  getCurrentDocumentId: () => Promise<string | null>

  /**
   * 保存当前文档ID
   */
  saveCurrentDocumentId: (id: string) => Promise<void>

  /**
   * 获取项目配置
   */
  getProjectConfig: () => Promise<ProjectConfig | null>

  /**
   * 保存项目配置
   */
  saveProjectConfig: (config: ProjectConfig) => Promise<void>

  /**
   * 检查连接状态
   */
  checkConnection?: () => Promise<boolean>
}

/**
 * LocalStorage 存储引擎
 */
export class LocalStorageDocumentEngine implements DocumentStorageEngine {
  private readonly DOCUMENTS_KEY = `md__posts`
  private readonly CURRENT_ID_KEY = `md__current_post_id`

  async getDocuments(): Promise<DocumentData[]> {
    return await store.getJSON<DocumentData[]>(this.DOCUMENTS_KEY, [])
  }

  async saveDocuments(documents: DocumentData[]): Promise<void> {
    await store.setJSON(this.DOCUMENTS_KEY, documents)
  }

  async getCurrentDocumentId(): Promise<string | null> {
    return await store.get(this.CURRENT_ID_KEY)
  }

  async saveCurrentDocumentId(id: string): Promise<void> {
    await store.set(this.CURRENT_ID_KEY, id)
  }

  async getProjectConfig(): Promise<ProjectConfig | null> {
    try {
      // 动态导入 Store 以获取当前运行时状态
      const { useUIStore } = await import('@/stores/ui')
      const { useThemeStore } = await import('@/stores/theme')
      const { useCssEditorStore } = await import('@/stores/cssEditor')
      const { usePostStore } = await import('@/stores/post')

      const uiStore = useUIStore()
      const themeStore = useThemeStore()
      const cssEditorStore = useCssEditorStore()
      const postStore = usePostStore()

      const config: ProjectConfig = {
        // ========== 图床配置 ==========
        githubConfig: await store.getJSON(`githubConfig`, null),
        aliOSSConfig: await store.getJSON(`aliOSSConfig`, null),
        txCOSConfig: await store.getJSON(`txCOSConfig`, null),
        qiniuConfig: await store.getJSON(`qiniuConfig`, null),
        minioConfig: await store.getJSON(`minioConfig`, null),
        telegramConfig: await store.getJSON(`telegramConfig`, null),
        mpConfig: await store.getJSON(`mpConfig`, null),
        r2Config: await store.getJSON(`r2Config`, null),
        upyunConfig: await store.getJSON(`upyunConfig`, null),
        cloudinaryConfig: await store.getJSON(`cloudinaryConfig`, null),
        imgHost: await store.get(`imgHost`) || undefined,
        useCompression: (await store.getJSON(`useCompression`, null)) ?? undefined,

        // ========== 文档存储配置 ==========
        webdavDocConfig: await store.getJSON(`webdavDocConfig`, null),
        cosDocConfig: await store.getJSON(`cosDocConfig`, null),
        docStorageType: (await store.get(`docStorageType`)) || undefined,

        // ========== 自定义表单配置 ==========
        formCustomConfig: await store.getJSON(`formCustomConfig`, null),

        // ========== UI Store 状态（运行时值）==========
        isDark: uiStore.isDark,
        isEditOnLeft: uiStore.isEditOnLeft,
        isOpenRightSlider: uiStore.isOpenRightSlider,
        isOpenPostSlider: uiStore.isOpenPostSlider,
        showAIToolbox: uiStore.showAIToolbox,

        // ========== Theme Store 状态（运行时值）==========
        theme: themeStore.theme,
        fontFamily: themeStore.fontFamily,
        fontSize: themeStore.fontSize,
        primaryColor: themeStore.primaryColor,
        codeBlockTheme: themeStore.codeBlockTheme,
        legend: themeStore.legend,
        isMacCodeBlock: themeStore.isMacCodeBlock,
        isShowLineNumber: themeStore.isShowLineNumber,
        isCiteStatus: themeStore.isCiteStatus,
        isCountStatus: themeStore.isCountStatus,
        isUseIndent: themeStore.isUseIndent,
        isUseJustify: themeStore.isUseJustify,

        // ========== CSS Editor Store 状态（运行时值）==========
        cssContentConfig: cssEditorStore.cssContentConfig,

        // ========== Post Store 状态 ==========
        currentPostIndex: postStore.currentPostIndex,

        // ========== 其他配置 ==========
        copyMode: (await store.getJSON(`MD__copyMode`, null)) ?? undefined,
        sortMode: (await store.getJSON(`MD__sort_mode`, null)) ?? undefined,
      }

      // 过滤掉 null 值
      const filteredConfig: ProjectConfig = {}
      for (const [key, value] of Object.entries(config)) {
        if (value !== null && value !== undefined) {
          filteredConfig[key] = value
        }
      }

      console.log('LocalStorage getProjectConfig:', filteredConfig)
      return Object.keys(filteredConfig).length > 0 ? filteredConfig : null
    }
    catch (error) {
      console.error('Failed to get project config:', error)
      return null
    }
  }

  async saveProjectConfig(config: ProjectConfig): Promise<void> {
    console.log('LocalStorage saveProjectConfig:', config)

    try {
      // 先保存图床配置和其他非 Store 配置到 localStorage
      const configsToSave: Record<string, any> = {}
      const storeConfigs: Record<string, any> = {}

      for (const [key, value] of Object.entries(config)) {
        if (value === undefined || value === null)
          continue

        // 分类：Store 配置 vs localStorage 配置
        const isStoreConfig = [
          'isDark',
          'isEditOnLeft',
          'isOpenRightSlider',
          'isOpenPostSlider',
          'showAIToolbox',
          'theme',
          'fontFamily',
          'fontSize',
          'primaryColor',
          'codeBlockTheme',
          'legend',
          'isMacCodeBlock',
          'isShowLineNumber',
          'isCiteStatus',
          'isCountStatus',
          'isUseIndent',
          'isUseJustify',
          'cssContentConfig',
          'currentPostIndex',
        ].includes(key)

        if (isStoreConfig) {
          storeConfigs[key] = value
        }
        else {
          configsToSave[key] = value
        }
      }

      // 1. 先保存图床配置等到 localStorage
      for (const [key, value] of Object.entries(configsToSave)) {
        if (typeof value === 'string') {
          await store.set(key, value)
        }
        else {
          await store.setJSON(key, value)
        }
      }
      console.log('图床配置已保存:', Object.keys(configsToSave))

      // 2. 再更新 Store（这会触发 store.reactive 自动保存）
      if (Object.keys(storeConfigs).length > 0) {
        const { useUIStore } = await import('@/stores/ui')
        const { useThemeStore } = await import('@/stores/theme')
        const { useCssEditorStore } = await import('@/stores/cssEditor')
        const { usePostStore } = await import('@/stores/post')

        const uiStore = useUIStore()
        const themeStore = useThemeStore()
        const cssEditorStore = useCssEditorStore()
        const postStore = usePostStore()

        for (const [key, value] of Object.entries(storeConfigs)) {
          // UI Store 状态
          if (key === 'isDark') {
            uiStore.isDark = value
          }
          else if (key === 'isEditOnLeft') {
            uiStore.isEditOnLeft = value
          }
          else if (key === 'isOpenRightSlider') {
            uiStore.isOpenRightSlider = value
          }
          else if (key === 'isOpenPostSlider') {
            uiStore.isOpenPostSlider = value
          }
          else if (key === 'showAIToolbox') {
            uiStore.showAIToolbox = value
          }

          // Theme Store 状态
          else if (key === 'theme') {
            themeStore.theme = value
          }
          else if (key === 'fontFamily') {
            themeStore.fontFamily = value
          }
          else if (key === 'fontSize') {
            themeStore.fontSize = value
          }
          else if (key === 'primaryColor') {
            themeStore.primaryColor = value
          }
          else if (key === 'codeBlockTheme') {
            themeStore.codeBlockTheme = value
          }
          else if (key === 'legend') {
            themeStore.legend = value
          }
          else if (key === 'isMacCodeBlock') {
            themeStore.isMacCodeBlock = value
          }
          else if (key === 'isShowLineNumber') {
            themeStore.isShowLineNumber = value
          }
          else if (key === 'isCiteStatus') {
            themeStore.isCiteStatus = value
          }
          else if (key === 'isCountStatus') {
            themeStore.isCountStatus = value
          }
          else if (key === 'isUseIndent') {
            themeStore.isUseIndent = value
          }
          else if (key === 'isUseJustify') {
            themeStore.isUseJustify = value
          }

          // CSS Editor Store 状态
          else if (key === 'cssContentConfig') {
            console.log('正在更新 cssContentConfig:', value)
            cssEditorStore.cssContentConfig = value
          }

          // Post Store 状态
          else if (key === 'currentPostIndex') {
            postStore.currentPostIndex = value
          }
        }
        console.log('Store 配置已更新:', Object.keys(storeConfigs))
      }

      console.log('✅ 所有配置保存完成')
    }
    catch (error) {
      console.error('Failed to save project config:', error)
      throw error
    }
  }

  async checkConnection(): Promise<boolean> {
    return true
  }
}

/**
 * WebDAV 存储引擎
 */
export class WebDAVDocumentEngine implements DocumentStorageEngine {
  private config: {
    url: string
    username: string
    password: string
    path: string
  }

  private configLoaded = false

  constructor() {
    this.config = { url: ``, username: ``, password: ``, path: `/md-documents` }
  }

  private async ensureConfig() {
    if (this.configLoaded) {
      return
    }
    const config = await store.getJSON(`webdavDocConfig`, this.config)
    this.config = config || this.config
    this.configLoaded = true
  }

  async getDocuments(): Promise<DocumentData[]> {
    await this.ensureConfig()

    try {
      const url = `${this.config.url}${this.config.path}/documents.json`
      console.log('WebDAV GET:', url)

      const response = await fetch(url, {
        method: `GET`,
        headers: {
          Authorization: `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return []
        }
        throw new Error(`Failed to fetch documents: ${response.statusText}`)
      }

      return await response.json()
    }
    catch (error) {
      console.error(`WebDAV getDocuments error:`, error)
      return []
    }
  }

  async saveDocuments(documents: DocumentData[]): Promise<void> {
    await this.ensureConfig()

    const content = JSON.stringify(documents, null, 2)
    const url = `${this.config.url}${this.config.path}/documents.json`
    console.log('WebDAV PUT:', url)

    const response = await fetch(url, {
      method: `PUT`,
      headers: {
        'Authorization': `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
        'Content-Type': `application/json`,
      },
      body: content,
    })

    if (!response.ok) {
      throw new Error(`Failed to save documents: ${response.statusText}`)
    }
  }

  async getCurrentDocumentId(): Promise<string | null> {
    await this.ensureConfig()

    try {
      const url = `${this.config.url}${this.config.path}/current.txt`
      const response = await fetch(url, {
        method: `GET`,
        headers: {
          Authorization: `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
        },
      })

      if (!response.ok) {
        return null
      }

      return await response.text()
    }
    catch {
      return null
    }
  }

  async saveCurrentDocumentId(id: string): Promise<void> {
    await this.ensureConfig()

    const url = `${this.config.url}${this.config.path}/current.txt`
    await fetch(url, {
      method: `PUT`,
      headers: {
        'Authorization': `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
        'Content-Type': `text/plain`,
      },
      body: id,
    })
  }

  async getProjectConfig(): Promise<ProjectConfig | null> {
    await this.ensureConfig()

    try {
      const url = `${this.config.url}${this.config.path}/config.json`
      console.log('WebDAV GET config:', url)

      const response = await fetch(url, {
        method: `GET`,
        headers: {
          Authorization: `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.log('WebDAV config.json not found (404)')
          return null
        }
        throw new Error(`Failed to fetch config: ${response.statusText}`)
      }

      const config = await response.json()
      console.log('WebDAV GET config success:', config)
      return config
    }
    catch (error) {
      console.error(`WebDAV getProjectConfig error:`, error)
      return null
    }
  }

  async saveProjectConfig(config: ProjectConfig): Promise<void> {
    await this.ensureConfig()

    const content = JSON.stringify(config, null, 2)
    const url = `${this.config.url}${this.config.path}/config.json`
    console.log('WebDAV PUT config:', url, config)

    const response = await fetch(url, {
      method: `PUT`,
      headers: {
        'Authorization': `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
        'Content-Type': `application/json`,
      },
      body: content,
    })

    if (!response.ok) {
      throw new Error(`Failed to save config: ${response.statusText}`)
    }
  }

  async checkConnection(): Promise<boolean> {
    await this.ensureConfig()

    try {
      const response = await fetch(this.config.url, {
        method: `OPTIONS`,
        headers: {
          Authorization: `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
        },
      })
      return response.ok
    }
    catch {
      return false
    }
  }
}

/**
 * 腾讯云 COS 存储引擎
 */
export class COSDocumentEngine implements DocumentStorageEngine {
  private config: {
    secretId: string
    secretKey: string
    bucket: string
    region: string
    path: string
  }

  private cos: any
  private configLoaded = false

  constructor() {
    this.config = { secretId: ``, secretKey: ``, bucket: ``, region: ``, path: `md-documents` }
  }

  private async ensureConfig() {
    if (this.configLoaded) {
      return
    }
    const config = await store.getJSON(`cosDocConfig`, this.config)
    this.config = config || this.config
    this.initCOS()
    this.configLoaded = true
  }

  private initCOS() {
    if (this.config.secretId && this.config.secretKey) {
      this.cos = new COS({
        SecretId: this.config.secretId,
        SecretKey: this.config.secretKey,
      })
    }
  }

  async getDocuments(): Promise<DocumentData[]> {
    await this.ensureConfig()

    if (!this.cos) {
      throw new Error(`COS not initialized`)
    }

    return new Promise((resolve, reject) => {
      this.cos.getObject(
        {
          Bucket: this.config.bucket,
          Region: this.config.region,
          Key: `${this.config.path}/documents.json`,
        },
        (err: any, data: any) => {
          if (err) {
            if (err.statusCode === 404) {
              resolve([])
            }
            else {
              reject(err)
            }
          }
          else {
            try {
              const documents = JSON.parse(data.Body)
              resolve(documents)
            }
            catch (parseError) {
              reject(parseError)
            }
          }
        },
      )
    })
  }

  async saveDocuments(documents: DocumentData[]): Promise<void> {
    await this.ensureConfig()

    if (!this.cos) {
      throw new Error(`COS not initialized`)
    }

    const content = JSON.stringify(documents, null, 2)

    return new Promise((resolve, reject) => {
      this.cos.putObject(
        {
          Bucket: this.config.bucket,
          Region: this.config.region,
          Key: `${this.config.path}/documents.json`,
          Body: content,
          ContentType: `application/json`,
        },
        (err: any) => {
          if (err) {
            reject(err)
          }
          else {
            resolve()
          }
        },
      )
    })
  }

  async getCurrentDocumentId(): Promise<string | null> {
    await this.ensureConfig()

    if (!this.cos) {
      return null
    }

    return new Promise((resolve) => {
      this.cos.getObject(
        {
          Bucket: this.config.bucket,
          Region: this.config.region,
          Key: `${this.config.path}/current.txt`,
        },
        (err: any, data: any) => {
          if (err) {
            resolve(null)
          }
          else {
            resolve(data.Body)
          }
        },
      )
    })
  }

  async saveCurrentDocumentId(id: string): Promise<void> {
    await this.ensureConfig()

    if (!this.cos) {
      throw new Error(`COS not initialized`)
    }

    return new Promise((resolve, reject) => {
      this.cos.putObject(
        {
          Bucket: this.config.bucket,
          Region: this.config.region,
          Key: `${this.config.path}/current.txt`,
          Body: id,
          ContentType: `text/plain`,
        },
        (err: any) => {
          if (err) {
            reject(err)
          }
          else {
            resolve()
          }
        },
      )
    })
  }

  async getProjectConfig(): Promise<ProjectConfig | null> {
    await this.ensureConfig()

    if (!this.cos) {
      return null
    }

    return new Promise((resolve) => {
      this.cos.getObject(
        {
          Bucket: this.config.bucket,
          Region: this.config.region,
          Key: `${this.config.path}/config.json`,
        },
        (err: any, data: any) => {
          if (err) {
            if (err.statusCode === 404) {
              console.log('COS config.json not found (404)')
              resolve(null)
            }
            else {
              console.error(`COS getProjectConfig error:`, err)
              resolve(null)
            }
          }
          else {
            try {
              const config = JSON.parse(data.Body)
              console.log('COS GET config success:', config)
              resolve(config)
            }
            catch (parseError) {
              console.error(`COS config parse error:`, parseError)
              resolve(null)
            }
          }
        },
      )
    })
  }

  async saveProjectConfig(config: ProjectConfig): Promise<void> {
    await this.ensureConfig()

    if (!this.cos) {
      throw new Error(`COS not initialized`)
    }

    const content = JSON.stringify(config, null, 2)

    return new Promise((resolve, reject) => {
      this.cos.putObject(
        {
          Bucket: this.config.bucket,
          Region: this.config.region,
          Key: `${this.config.path}/config.json`,
          Body: content,
          ContentType: `application/json`,
        },
        (err: any) => {
          if (err) {
            reject(err)
          }
          else {
            resolve()
          }
        },
      )
    })
  }

  async checkConnection(): Promise<boolean> {
    await this.ensureConfig()

    if (!this.cos) {
      return false
    }

    return new Promise((resolve) => {
      this.cos.headBucket(
        {
          Bucket: this.config.bucket,
          Region: this.config.region,
        },
        (err: any) => {
          resolve(!err)
        },
      )
    })
  }
}

/**
 * 文档存储管理器
 */
class DocumentStorageManager {
  private engine: DocumentStorageEngine = new LocalStorageDocumentEngine()
  private currentType: string = `localStorage`

  /**
   * 初始化存储引擎
   */
  async init() {
    const storageType = await store.get(`docStorageType`) || `localStorage`
    await this.setStorageType(storageType)
  }

  /**
   * 设置存储类型
   */
  async setStorageType(type: string) {
    this.currentType = type
    await store.set(`docStorageType`, type)

    switch (type) {
      case `webdav`:
        this.engine = new WebDAVDocumentEngine()
        break
      case `cos`:
        this.engine = new COSDocumentEngine()
        break
      case `localStorage`:
      default:
        this.engine = new LocalStorageDocumentEngine()
        break
    }
  }

  /**
   * 获取当前存储类型
   */
  getCurrentType(): string {
    return this.currentType
  }

  /**
   * 获取当前引擎
   */
  getEngine(): DocumentStorageEngine {
    return this.engine
  }

  /**
   * 获取所有文档
   */
  async getDocuments(): Promise<DocumentData[]> {
    return this.engine.getDocuments()
  }

  /**
   * 保存所有文档
   */
  async saveDocuments(documents: DocumentData[]): Promise<void> {
    return this.engine.saveDocuments(documents)
  }

  /**
   * 获取当前文档ID
   */
  async getCurrentDocumentId(): Promise<string | null> {
    return this.engine.getCurrentDocumentId()
  }

  /**
   * 保存当前文档ID
   */
  async saveCurrentDocumentId(id: string): Promise<void> {
    return this.engine.saveCurrentDocumentId(id)
  }

  /**
   * 获取项目配置
   */
  async getProjectConfig(): Promise<ProjectConfig | null> {
    return this.engine.getProjectConfig()
  }

  /**
   * 保存项目配置
   */
  async saveProjectConfig(config: ProjectConfig): Promise<void> {
    return this.engine.saveProjectConfig(config)
  }

  /**
   * 检查连接状态
   */
  async checkConnection(): Promise<boolean> {
    if (this.engine.checkConnection) {
      return this.engine.checkConnection()
    }
    return true
  }

  /**
   * 同步数据到新的存储平台（包括文档和配置）
   */
  async syncToNewStorage(newType: string, documents: DocumentData[], currentId: string): Promise<void> {
    const oldType = this.currentType

    // 先从当前存储获取配置
    const config = await this.getProjectConfig()

    // 切换到新存储
    await this.setStorageType(newType)

    try {
      // 保存文档数据
      await this.saveDocuments(documents)
      await this.saveCurrentDocumentId(currentId)

      // 保存配置数据
      if (config) {
        await this.saveProjectConfig(config)
      }
    }
    catch (error) {
      // 同步失败，回滚到原来的存储
      await this.setStorageType(oldType)
      throw error
    }
  }

  /**
   * 从远程下载数据到本地（包括文档和配置）
   */
  async downloadFromRemote(): Promise<{
    documents: DocumentData[]
    currentId: string | null
    config: ProjectConfig | null
  }> {
    const documents = await this.getDocuments()
    const currentId = await this.getCurrentDocumentId()
    const config = await this.getProjectConfig()

    return { documents, currentId, config }
  }

  /**
   * 上传本地数据到远程（包括文档和配置）
   */
  async uploadToRemote(documents: DocumentData[], currentId: string, config?: ProjectConfig): Promise<void> {
    await this.saveDocuments(documents)
    await this.saveCurrentDocumentId(currentId)

    if (config) {
      await this.saveProjectConfig(config)
    }
  }
}

/**
 * 全局文档存储实例
 */
export const documentStorage = new DocumentStorageManager()
