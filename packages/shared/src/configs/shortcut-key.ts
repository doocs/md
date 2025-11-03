const isMac = /Mac/i.test(navigator.userAgent)

export const ctrlKey = `Mod`
export const altKey = `Alt`
export const shiftKey = `Shift`

export const ctrlSign = isMac ? `⌘` : `Ctrl`
export const altSign = isMac ? `⌥` : `Alt`
export const shiftSign = isMac ? `⇧` : `Shift`
