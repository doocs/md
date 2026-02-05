const isMac = /Mac/i.test(navigator.userAgent)

export const ctrlKey = `Mod`
export const altKey = `Alt`
export const shiftKey = `Shift`

export const ctrlSign = isMac ? `⌘` : `Ctrl`
export const altSign = isMac ? `⌥` : `Alt`
export const shiftSign = isMac ? `⇧` : `Shift`

export const headingLevels = [
  { level: 1, label: '标题 1' },
  { level: 2, label: '标题 2' },
  { level: 3, label: '标题 3' },
  { level: 4, label: '标题 4' },
  { level: 5, label: '标题 5' },
  { level: 6, label: '标题 6' },
]
