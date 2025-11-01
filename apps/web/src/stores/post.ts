import { v4 as uuid } from 'uuid'
import DEFAULT_CONTENT from '@/assets/example/markdown.md?raw'
import { addPrefix, useStorage } from '@/utils'

/**
 * Post 结构接口
 */
export interface Post {
  id: string
  title: string
  content: string
  history: {
    datetime: string
    content: string
  }[]
  createDatetime: Date
  updateDatetime: Date
  // 父标签
  parentId?: string | null
  // 展开状态
  collapsed?: boolean
}

/**
 * 文章管理 Store
 * 负责管理文章列表、当前文章、文章 CRUD 操作
 */
export const usePostStore = defineStore(`post`, () => {
  // 内容列表
  const posts = useStorage<Post[]>(addPrefix(`posts`), [
    {
      id: uuid(),
      title: `内容1`,
      content: DEFAULT_CONTENT,
      history: [
        { datetime: new Date().toLocaleString(`zh-cn`), content: DEFAULT_CONTENT },
      ],
      createDatetime: new Date(),
      updateDatetime: new Date(),
    },
  ])

  // 当前文章 ID
  const currentPostId = useStorage(addPrefix(`current_post_id`), ``)

  // 预备弃用的旧字段（用于迁移）
  const editorContent = useStorage(`__editor_content`, DEFAULT_CONTENT)

  // 在补齐 id 后，若 currentPostId 无效 ➜ 自动指向第一篇
  onBeforeMount(() => {
    posts.value = posts.value.map((post, index) => {
      const now = Date.now()
      return {
        ...post,
        id: post.id ?? uuid(),
        createDatetime: post.createDatetime ?? new Date(now + index),
        updateDatetime: post.updateDatetime ?? new Date(now + index),
      }
    })

    // 兼容：如果本地没有 currentPostId，或指向的文章已不存在
    if (!currentPostId.value || !posts.value.some(p => p.id === currentPostId.value)) {
      currentPostId.value = posts.value[0]?.id ?? ``
    }
  })

  // 根据 id 找索引
  const findIndexById = (id: string) => posts.value.findIndex(p => p.id === id)

  // computed: 让旧代码还能用 index，但底层映射 id
  const currentPostIndex = computed<number>({
    get: () => findIndexById(currentPostId.value),
    set: (idx) => {
      if (idx >= 0 && idx < posts.value.length) {
        currentPostId.value = posts.value[idx].id
      }
    },
  })

  // 获取 Post
  const getPostById = (id: string) => posts.value.find(p => p.id === id)

  // 获取当前文章
  const currentPost = computed(() => getPostById(currentPostId.value))

  // 添加文章
  const addPost = (title: string, parentId: string | null = null) => {
    const newPost: Post = {
      id: uuid(),
      title,
      content: `# ${title}`,
      history: [
        { datetime: new Date().toLocaleString(`zh-cn`), content: `# ${title}` },
      ],
      createDatetime: new Date(),
      updateDatetime: new Date(),
      parentId,
    }
    posts.value.push(newPost)
    currentPostId.value = newPost.id
  }

  // 重命名文章
  const renamePost = (id: string, title: string) => {
    const post = getPostById(id)
    if (post) {
      post.title = title
      post.updateDatetime = new Date()
    }
  }

  // 删除文章
  const delPost = (id: string) => {
    const idx = findIndexById(id)
    if (idx === -1)
      return

    posts.value.splice(idx, 1)
    currentPostId.value = posts.value[Math.min(idx, posts.value.length - 1)]?.id ?? ``
  }

  // 更新文章父 ID
  const updatePostParentId = (postId: string, parentId: string | null) => {
    const post = getPostById(postId)
    if (post) {
      post.parentId = parentId
      post.updateDatetime = new Date()
    }
  }

  // 更新文章内容
  const updatePostContent = (id: string, content: string) => {
    const post = getPostById(id)
    if (post) {
      post.content = content
      post.updateDatetime = new Date()
    }
  }

  // 收起所有文章
  const collapseAllPosts = () => {
    posts.value.forEach((post) => {
      post.collapsed = true
    })
  }

  // 展开所有文章
  const expandAllPosts = () => {
    posts.value.forEach((post) => {
      post.collapsed = false
    })
  }

  // 迁移阶段，兼容之前的方案
  onMounted(() => {
    if (editorContent.value !== DEFAULT_CONTENT) {
      const post = getPostById(currentPostId.value)
      if (post) {
        post.content = editorContent.value
      }
      editorContent.value = DEFAULT_CONTENT
    }
  })

  return {
    // State
    posts,
    currentPostId,
    currentPostIndex,
    currentPost,

    // Getters
    getPostById,
    findIndexById,

    // Actions
    addPost,
    renamePost,
    delPost,
    updatePostParentId,
    updatePostContent,
    collapseAllPosts,
    expandAllPosts,
  }
})
