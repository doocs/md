import { isCollabUiEnabled } from '@/services/collab/client'

/** 处理协作深链：?collab_invite=TOKEN 或 ?collab=DOCUMENT_ID */
export function useCollabBootstrap() {
  const authStore = useAuthStore()
  const collabStore = useCollabStore()
  const uiStore = useUIStore()

  onMounted(async () => {
    if (!isCollabUiEnabled())
      return

    const params = new URLSearchParams(window.location.search)
    const inviteToken = params.get(`collab_invite`)
    const collabId = params.get(`collab`)

    const cleanUrl = () => {
      params.delete(`collab_invite`)
      params.delete(`collab`)
      const newSearch = params.toString()
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : ``) + window.location.hash
      window.history.replaceState({}, ``, newUrl)
    }

    if (inviteToken) {
      cleanUrl()
      if (!authStore.isLoggedIn) {
        uiStore.pendingCollabInviteToken = inviteToken
        uiStore.toggleShowAccountDialog(true)
        return
      }
      try {
        const documentId = await collabStore.acceptInvite(inviteToken)
        await collabStore.openDocument(documentId)
        toast.success(`已加入协作文档`)
      }
      catch (e) {
        toast.error(`加入协作失败：${e instanceof Error ? e.message : String(e)}`)
      }
      return
    }

    if (collabId) {
      cleanUrl()
      if (!authStore.isLoggedIn) {
        uiStore.pendingCollabDocumentId = collabId
        uiStore.toggleShowAccountDialog(true)
        return
      }
      try {
        await collabStore.openDocument(collabId)
      }
      catch (e) {
        toast.error(`打开协作失败：${e instanceof Error ? e.message : String(e)}`)
      }
    }
  })

  watch(() => authStore.isLoggedIn, async (loggedIn) => {
    if (!loggedIn || !isCollabUiEnabled())
      return

    const inviteToken = uiStore.pendingCollabInviteToken
    const collabId = uiStore.pendingCollabDocumentId

    if (inviteToken) {
      uiStore.pendingCollabInviteToken = null
      try {
        const documentId = await collabStore.acceptInvite(inviteToken)
        await collabStore.openDocument(documentId)
        toast.success(`已加入协作文档`)
      }
      catch (e) {
        toast.error(`加入协作失败：${e instanceof Error ? e.message : String(e)}`)
      }
    }
    else if (collabId) {
      uiStore.pendingCollabDocumentId = null
      try {
        await collabStore.openDocument(collabId)
      }
      catch (e) {
        toast.error(`打开协作失败：${e instanceof Error ? e.message : String(e)}`)
      }
    }
  })
}
