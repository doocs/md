/** Blur focus on triggers outside the dialog so aria-hidden ancestors do not retain focus. */
export function blurFocusOutsideDialog(event: Event) {
  const active = document.activeElement
  const dialog = event.currentTarget
  if (active instanceof HTMLElement && dialog instanceof HTMLElement && !dialog.contains(active))
    active.blur()
}

export function blurFocusInsideDialogOnClose(event: Event) {
  const active = document.activeElement
  if (!(active instanceof HTMLElement) || active === document.body)
    return

  const dialog = event.currentTarget
  if (dialog instanceof HTMLElement && dialog.contains(active))
    active.blur()
}
