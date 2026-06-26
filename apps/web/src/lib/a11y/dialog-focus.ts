import type { MaybeRefOrGetter } from 'vue'
import { computed, mergeProps, toValue, watch } from 'vue'

function isFocusablePageElement(el: Element | null): el is HTMLElement {
  return el instanceof HTMLElement && el !== document.body
}

function shouldBlurPageFocus(el: HTMLElement) {
  return !el.closest(`[role="dialog"]`)
}

function blurActivePageFocus() {
  const active = document.activeElement
  if (!isFocusablePageElement(active) || !shouldBlurPageFocus(active))
    return

  active.blur()
}

function runDeferredPageFocusBlur(run: () => void) {
  run()
  queueMicrotask(run)
  requestAnimationFrame(run)
}

/** Blur the currently focused page element (e.g. CodeMirror, menu trigger). */
export function blurRetainedPageFocus(defer = true) {
  const blur = () => blurActivePageFocus()

  if (defer)
    runDeferredPageFocusBlur(blur)
  else
    blur()
}

/** Blur focused elements outside `container` so aria-hidden ancestors do not retain focus. */
export function blurFocusedElementsOutside(container: HTMLElement) {
  const blurOutside = () => {
    const active = document.activeElement
    if (isFocusablePageElement(active) && !container.contains(active))
      active.blur()

    for (const el of document.querySelectorAll<HTMLElement>(`.cm-content`)) {
      if (!container.contains(el) && el === document.activeElement)
        el.blur()
    }
  }

  runDeferredPageFocusBlur(blurOutside)
}

/** Blur focus outside the dialog; run before any custom `open-auto-focus` handler. */
export function blurFocusOutsideDialog(event: Event) {
  const dialog = event.currentTarget
  if (dialog instanceof HTMLElement)
    blurFocusedElementsOutside(dialog)
}

/** Blur focus inside the dialog before focus is restored to the trigger. */
export function blurFocusInsideDialogOnClose(event: Event) {
  const active = document.activeElement
  if (!isFocusablePageElement(active))
    return

  const dialog = event.currentTarget
  if (dialog instanceof HTMLElement && dialog.contains(active))
    active.blur()
}

/** Blur page focus before focusing a teleported modal overlay (non-reka-ui). */
export function prepareModalOverlayFocus() {
  blurRetainedPageFocus()
}

/** Bind before forwarded props so consumer handlers run after the blur. */
export const dialogContentA11yHandlers = {
  onOpenAutoFocus: blurFocusOutsideDialog,
  onCloseAutoFocus: blurFocusInsideDialogOnClose,
}

/** Merge a11y handlers with forwarded props (Vue disallows duplicate `v-bind`). */
export function useDialogContentA11yBindings(forwarded: MaybeRefOrGetter<Record<string, unknown>>) {
  return computed(() => mergeProps(dialogContentA11yHandlers, toValue(forwarded)))
}

/** Blur editor focus as soon as a modal root opens (before aria-hidden). */
export function useModalOpenFocusBlur(open: MaybeRefOrGetter<boolean | undefined>) {
  watch(() => toValue(open), (isOpen) => {
    if (isOpen)
      blurRetainedPageFocus()
  }, { immediate: true, flush: `post` })
}
