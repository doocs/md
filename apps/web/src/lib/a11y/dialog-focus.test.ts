// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import {
  blurFocusedElementsOutside,
  blurFocusInsideDialogOnClose,
  blurFocusOutsideDialog,
  blurRetainedPageFocus,
} from './dialog-focus'

function button(label: string) {
  const el = document.createElement(`button`)
  el.type = `button`
  el.textContent = label
  document.body.append(el)
  return el
}

function cmContent() {
  const el = document.createElement(`div`)
  el.className = `cm-content`
  el.setAttribute(`contenteditable`, `true`)
  document.body.append(el)
  return el
}

afterEach(() => {
  document.body.replaceChildren()
  document.body.focus()
})

describe(`blurRetainedPageFocus`, () => {
  it(`blurs the active element`, () => {
    const trigger = button(`trigger`)
    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    blurRetainedPageFocus(false)
    expect(document.activeElement).toBe(document.body)
  })

  it(`blurs focus restored after menu close`, async () => {
    const trigger = button(`trigger`)
    trigger.focus()

    blurRetainedPageFocus()
    trigger.focus()

    await new Promise<void>(resolve => queueMicrotask(() => resolve()))
    expect(document.activeElement).toBe(document.body)
  })

  it(`does not blur focus inside an open dialog`, () => {
    const dialog = document.createElement(`div`)
    dialog.setAttribute(`role`, `dialog`)
    const input = document.createElement(`input`)
    dialog.append(input)
    document.body.append(dialog)
    input.focus()

    blurRetainedPageFocus(false)
    expect(document.activeElement).toBe(input)
  })

  it(`no-ops when focus is already on body`, () => {
    document.body.focus()
    blurRetainedPageFocus(false)
    expect(document.activeElement).toBe(document.body)
  })
})

describe(`blurFocusedElementsOutside`, () => {
  it(`blurs focus outside the container`, () => {
    const dialog = document.createElement(`div`)
    const editor = cmContent()
    document.body.append(dialog)
    editor.focus()

    blurFocusedElementsOutside(dialog)
    expect(document.activeElement).toBe(document.body)
  })

  it(`blurs focus restored to a trigger outside the container`, async () => {
    const dialog = document.createElement(`div`)
    const trigger = button(`trigger`)
    document.body.append(dialog)

    blurFocusedElementsOutside(dialog)
    trigger.focus()

    await new Promise<void>(resolve => queueMicrotask(() => resolve()))
    expect(document.activeElement).toBe(document.body)
  })

  it(`does not blur focus inside the container`, () => {
    const dialog = document.createElement(`div`)
    const input = document.createElement(`input`)
    dialog.append(input)
    document.body.append(dialog)
    input.focus()

    blurFocusedElementsOutside(dialog)
    expect(document.activeElement).toBe(input)
  })

  it(`does not blur CodeMirror inside the container`, () => {
    const dialog = document.createElement(`div`)
    const editor = cmContent()
    dialog.append(editor)
    document.body.append(dialog)
    editor.focus()

    blurFocusedElementsOutside(dialog)
    expect(document.activeElement).toBe(editor)
  })
})

function dialogEvent(dialog: HTMLElement): Event {
  return { currentTarget: dialog } as unknown as Event
}

describe(`blurFocusOutsideDialog`, () => {
  it(`blurs elements outside the dialog element`, () => {
    const dialog = document.createElement(`div`)
    const trigger = button(`trigger`)
    document.body.append(dialog)
    trigger.focus()

    blurFocusOutsideDialog(dialogEvent(dialog))
    expect(document.activeElement).toBe(document.body)
  })
})

describe(`blurFocusInsideDialogOnClose`, () => {
  it(`blurs focus inside the dialog`, () => {
    const dialog = document.createElement(`div`)
    const input = document.createElement(`input`)
    dialog.append(input)
    document.body.append(dialog)
    input.focus()

    blurFocusInsideDialogOnClose(dialogEvent(dialog))
    expect(document.activeElement).toBe(document.body)
  })

  it(`does not blur focus outside the dialog`, () => {
    const dialog = document.createElement(`div`)
    const trigger = button(`trigger`)
    document.body.append(dialog)
    trigger.focus()

    blurFocusInsideDialogOnClose(dialogEvent(dialog))
    expect(document.activeElement).toBe(trigger)
  })
})
