import type { InjectionKey, Ref } from 'vue'

export type PostSliderMenuKey = 'header' | string | null

export interface PostSliderMenuContext {
  openMenuKey: Ref<PostSliderMenuKey>
  setOpenMenuKey: (key: PostSliderMenuKey) => void
  closeMenu: () => void
}

export const postSliderMenuKey: InjectionKey<PostSliderMenuContext> = Symbol(`postSliderMenu`)

export const postSliderMobileMenuClass
  = `z-[60] w-[min(12rem,calc(100vw-2rem))] max-h-[min(60dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-5rem))] overflow-x-hidden overflow-y-auto overscroll-contain`

export const postSliderMobileMenuCollisionPadding = {
  top: 72,
  bottom: 96,
  left: 16,
  right: 16,
} as const

export function getPostSliderDropdownContentProps(isMobile: boolean, desktopClass = `w-40`) {
  return {
    sideOffset: 8,
    collisionPadding: isMobile ? postSliderMobileMenuCollisionPadding : 8,
    class: isMobile ? postSliderMobileMenuClass : desktopClass,
  } as const
}

export function providePostSliderMenu() {
  const openMenuKey = ref<PostSliderMenuKey>(null)
  const setOpenMenuKey = (key: PostSliderMenuKey) => {
    openMenuKey.value = key
  }
  const closeMenu = () => {
    openMenuKey.value = null
  }
  const ctx = { openMenuKey, setOpenMenuKey, closeMenu }
  provide(postSliderMenuKey, ctx)
  return ctx
}

export function usePostSliderMenu() {
  const ctx = inject(postSliderMenuKey)
  if (!ctx)
    throw new Error(`usePostSliderMenu must be used within PostSlider`)
  return ctx
}

export function updatePostSliderMenuOpen(
  ctx: PostSliderMenuContext,
  key: Exclude<PostSliderMenuKey, null>,
  open: boolean,
) {
  if (open)
    ctx.setOpenMenuKey(key)
  else if (ctx.openMenuKey.value === key)
    ctx.closeMenu()
}
