import type { Post } from '@/types/post'
import { uuidv4 } from '@md/shared/utils/uuid'
import { getDefaultContent } from '@/assets/example/default-content'
import { t } from '@/i18n/translate'
import { debounce } from '@/lib/debounce'
import { normalizePostHistory, toStoredDateTime } from '@/lib/format/datetime'
import { postSignature } from '@/lib/post-signature'
import { documentRepo, getLoadedDocuments, store } from '@/storage'
import { addPrefix } from '@/storage/prefix'
import { useEditorStore } from '@/stores/editor'

export type { Post } from '@/types/post'

function createDefaultPost(): Post {
  const content = getDefaultContent()
  return {
    id: uuidv4(),
    title: t('store.post.defaultTitle'),
    content,
    history: [
      { datetime: toStoredDateTime(), content },
    ],
    createDatetime: new Date(),
    updateDatetime: new Date(),
  }
}

function normalizePosts(raw: Post[]): Post[] {
  return raw.map((post, index) => {
    const now = Date.now()
    return {
      ...post,
      id: post.id ?? uuidv4(),
      createDatetime: new Date(post.createDatetime ?? now + index),
      updateDatetime: new Date(post.updateDatetime ?? now + index),
      history: normalizePostHistory(post.history),
    }
  })
}

/** Post list, current post, and CRUD operations. */
export const usePostStore = defineStore(`post`, () => {
  const loaded = getLoadedDocuments()
  const posts = ref<Post[]>(
    loaded?.length ? normalizePosts(loaded) : [createDefaultPost()],
  )

  const currentPostId = store.reactive(addPrefix(`current_post_id`), ``)
  const sortMode = store.reactive(addPrefix(`sort_mode`), `create-old-new`)

  let persistReady = false

  const persistAll = debounce(async (snapshot: Post[]) => {
    await documentRepo.saveAll(snapshot)
  }, 500)

  /**
   * Ids of posts changed since the last flush. A single debounced savePost
   * would drop an earlier post when two different posts change within one
   * debounce window (the shared timer keeps only the latest argument), so
   * ids are collected first and every changed post is flushed.
   */
  const dirtyPostIds = new Set<string>()

  const persistDirty = debounce(async () => {
    const ids = [...dirtyPostIds]
    dirtyPostIds.clear()
    if (ids.length === 0)
      return
    if (ids.length === 1) {
      const post = posts.value.find(p => p.id === ids[0])
      // The post may have been deleted while the debounce was pending.
      if (post)
        await documentRepo.savePost(post)
      return
    }
    await documentRepo.saveAll([...posts.value])
  }, 500)

  /** Flush immediately on delete etc. so a refresh before debounce finishes does not restore stale data. */
  async function persistImmediately(): Promise<void> {
    persistAll.cancel()
    persistDirty.cancel()
    dirtyPostIds.clear()
    await documentRepo.saveAll([...posts.value])
  }

  // Watching per-post signatures instead of a deep watch on `posts`: the
  // signature read is shallow (no traversal into history entry bodies), so
  // each editor content commit no longer deep-traverses every post. A
  // signature change at index i implies posts.value[i] changed.
  watch(
    () => posts.value.map(postSignature),
    (signatures, oldSignatures) => {
      if (!persistReady)
        return

      if (!oldSignatures || signatures.length !== oldSignatures.length) {
        persistAll([...posts.value])
        return
      }

      let changed = false
      for (let i = 0; i < signatures.length; i++) {
        if (signatures[i] !== oldSignatures[i]) {
          dirtyPostIds.add(posts.value[i].id)
          changed = true
        }
      }
      if (changed)
        persistDirty()
    },
  )

  onBeforeMount(() => {
    posts.value = normalizePosts(posts.value)

    if (!currentPostId.value || !posts.value.some(p => p.id === currentPostId.value))
      currentPostId.value = posts.value[0]?.id ?? ``

    if (!loaded?.length)
      void documentRepo.saveAll(posts.value)

    persistReady = true
  })

  onMounted(() => {
    const editorStore = useEditorStore()

    const flushToDisk = () => {
      editorStore.flushContentToPostStore()
      persistAll.flush()
      persistDirty.flush()
      void persistImmediately()
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === `hidden`)
        flushToDisk()
    }

    window.addEventListener(`pagehide`, flushToDisk)
    window.addEventListener(`beforeunload`, flushToDisk)
    document.addEventListener(`visibilitychange`, onVisibilityChange)
    onUnmounted(() => {
      window.removeEventListener(`pagehide`, flushToDisk)
      window.removeEventListener(`beforeunload`, flushToDisk)
      document.removeEventListener(`visibilitychange`, onVisibilityChange)
    })
  })

  function replacePosts(nextPosts: Post[]) {
    persistAll.cancel()
    persistDirty.cancel()
    dirtyPostIds.clear()
    posts.value = normalizePosts(nextPosts)
    void documentRepo.saveAll(posts.value)
  }

  async function replacePostsAndPersist(nextPosts: Post[]): Promise<void> {
    persistAll.cancel()
    persistDirty.cancel()
    dirtyPostIds.clear()
    posts.value = normalizePosts(nextPosts)
    await documentRepo.saveAll(posts.value)
  }

  const findIndexById = (id: string) => posts.value.findIndex(p => p.id === id)

  const currentPostIndex = computed<number>({
    get: () => findIndexById(currentPostId.value),
    set: (idx) => {
      if (idx >= 0 && idx < posts.value.length)
        currentPostId.value = posts.value[idx].id
    },
  })

  const getPostById = (id: string) => posts.value.find(p => p.id === id)
  const currentPost = computed(() => getPostById(currentPostId.value))

  const addPost = (title: string, parentId: string | null = null) => {
    const newPost: Post = {
      id: uuidv4(),
      title,
      content: `# ${title}`,
      history: [
        { datetime: toStoredDateTime(), content: `# ${title}` },
      ],
      createDatetime: new Date(),
      updateDatetime: new Date(),
      parentId,
    }
    posts.value.push(newPost)
    currentPostId.value = newPost.id
  }

  const renamePost = (id: string, title: string) => {
    const post = getPostById(id)
    if (post) {
      post.title = title
      post.updateDatetime = new Date()
    }
  }

  const delPost = (id: string, recursive: boolean = false) => {
    const post = getPostById(id)
    if (!post)
      return

    if (recursive) {
      const getChildIds = (parentId: string): string[] => {
        const children = posts.value.filter(p => p.parentId === parentId)
        return children.reduce((acc, child) => {
          return acc.concat(child.id, getChildIds(child.id))
        }, [] as string[])
      }

      const allIdsToDelete = [id, ...getChildIds(id)]
      allIdsToDelete.forEach((toDelId) => {
        const idx = findIndexById(toDelId)
        if (idx !== -1)
          posts.value.splice(idx, 1)
      })

      if (!posts.value.some(p => p.id === currentPostId.value))
        currentPostId.value = posts.value[Math.max(0, posts.value.length - 1)]?.id ?? ``

      persistImmediately()
      return
    }

    const newParentId = post.parentId ?? null
    posts.value.forEach((p) => {
      if (p.parentId === id) {
        p.parentId = newParentId
        p.updateDatetime = new Date()
      }
    })

    const idx = findIndexById(id)
    if (idx === -1)
      return

    posts.value.splice(idx, 1)
    currentPostId.value = posts.value[Math.min(idx, posts.value.length - 1)]?.id ?? ``
    persistImmediately()
  }

  const updatePostParentId = (postId: string, parentId: string | null) => {
    const post = getPostById(postId)
    if (post) {
      post.parentId = parentId
      post.updateDatetime = new Date()
    }
  }

  const updatePostContent = (id: string, content: string) => {
    const post = getPostById(id)
    if (post) {
      post.content = content
      post.updateDatetime = new Date()
    }
  }

  const collapseAllPosts = () => {
    posts.value.forEach((post) => {
      post.collapsed = true
    })
  }

  const expandAllPosts = () => {
    posts.value.forEach((post) => {
      post.collapsed = false
    })
  }

  return {
    posts,
    currentPostId,
    sortMode,
    currentPostIndex,
    currentPost,
    getPostById,
    findIndexById,
    addPost,
    renamePost,
    delPost,
    updatePostParentId,
    updatePostContent,
    collapseAllPosts,
    expandAllPosts,
    replacePosts,
    replacePostsAndPersist,
    persistImmediately,
  }
})
