import DEFAULT_CONTENT from '@/assets/example/markdown.md?raw'
import { useEditorStore } from '@/stores/editor'
import { usePostStore } from '@/stores/post'

export function useEditorDocumentActions() {
  const editorStore = useEditorStore()
  const postStore = usePostStore()

  async function formatContent() {
    const doc = await editorStore.formatContent()
    if (doc && postStore.currentPost)
      postStore.updatePostContent(postStore.currentPostId, doc)
    return doc
  }

  function resetContent() {
    editorStore.importContent(DEFAULT_CONTENT)
    toast.success(`内容已重置`)
  }

  function clearContent() {
    editorStore.clearContent()
  }

  return {
    formatContent,
    resetContent,
    clearContent,
  }
}
