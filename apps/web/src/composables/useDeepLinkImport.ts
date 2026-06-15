export function useDeepLinkImport() {
  const uiStore = useUIStore()

  onMounted(() => {
    const params = new URLSearchParams(window.location.search)
    const openUrl = params.get(`open`)
    if (!openUrl || !URL.canParse(openUrl) || !/^https?:\/\//i.test(openUrl))
      return

    uiStore.importMdOpenUrl = openUrl
    uiStore.isShowImportMdDialog = true
    params.delete(`open`)
    const newSearch = params.toString()
    const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : ``) + window.location.hash
    window.history.replaceState({}, ``, newUrl)
  })
}
