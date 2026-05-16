import type { Extension } from '@codemirror/state'
import { EditorView, ViewPlugin } from '@codemirror/view'
import { vsCodeDark } from '@fsegurai/codemirror-theme-vscode-dark'
import { vsCodeLight } from '@fsegurai/codemirror-theme-vscode-light'

/**
 * Prevent CodeMirror's automatic scrollIntoView on mouse/focus events.
 *
 * Why domEventHandlers doesn't work:
 * CodeMirror's internal mousedown/focus handlers are attached in bubble phase
 * and registered first (during view construction). By the time our
 * domEventHandlers callback runs, CodeMirror has already dispatched a
 * transaction with scrollIntoView effect and scrolled the DOM.
 *
 * Solution: use capture phase listeners (third arg `true` in addEventListener)
 * which fire BEFORE CodeMirror's handlers, so we can snapshot the scroll
 * position before any scroll occurs. Then restore via queueMicrotask which
 * runs after all synchronous event processing (including CodeMirror's dispatch
 * and scroll) but before the browser paints.
 */
function preventScrollOnFocus(): Extension {
  return ViewPlugin.fromClass(class {
    view: EditorView
    private savedTop = 0
    private savedLeft = 0

    // Bound handlers for addEventListener / removeEventListener
    private onMouseDown: () => void
    private onFocusIn: () => void
    private onTouchStart: () => void

    constructor(view: EditorView) {
      this.view = view
      this.onMouseDown = this.capture.bind(this)
      this.onFocusIn = this.capture.bind(this)
      this.onTouchStart = this.capture.bind(this)

      // Capture phase: fires BEFORE CodeMirror's bubble-phase handlers
      view.scrollDOM.addEventListener(`mousedown`, this.onMouseDown, true)
      view.scrollDOM.addEventListener(`touchstart`, this.onTouchStart, true)
      // focusin bubbles (unlike focus), so we can listen on scrollDOM
      view.scrollDOM.addEventListener(`focusin`, this.onFocusIn, true)
    }

    private capture() {
      const dom = this.view.scrollDOM
      this.savedTop = dom.scrollTop
      this.savedLeft = dom.scrollLeft
      // queueMicrotask runs after all sync code (including CodeMirror's
      // dispatch + scroll) but before the next paint — the restore is invisible.
      queueMicrotask(() => {
        dom.scrollTop = this.savedTop
        dom.scrollLeft = this.savedLeft
      })
    }

    destroy() {
      this.view.scrollDOM.removeEventListener(`mousedown`, this.onMouseDown, true)
      this.view.scrollDOM.removeEventListener(`touchstart`, this.onTouchStart, true)
      this.view.scrollDOM.removeEventListener(`focusin`, this.onFocusIn, true)
    }
  })
}

const customStyles = EditorView.theme({
  // 移除聚焦时的蓝色边框
  '&.cm-focused': {
    outline: `none`,
  },
  // 防止滚动链接效应
  '.cm-scroller': {
    overscrollBehavior: `contain`,
  },
  // 装订线：垂直居中、无背景无边框无内边距
  '.cm-gutterElement': {
    display: `flex`,
    justifyContent: `right`,
    alignItems: `center`,
  },
  '&.cm-editor .cm-gutters': {
    backgroundColor: `transparent !important`,
    borderRight: `none !important`,
    padding: `0 !important`,
  },

  // 折叠装订线：固定宽度，无内边距
  '.cm-foldGutter': {
    width: `10px !important`,
    overflow: `hidden`,
  },
  '.cm-foldGutter .cm-gutterElement': {
    padding: `0 !important`,
    width: `10px !important`,
    minWidth: `unset !important`,
  },

  // 折叠图标：默认隐藏，hover 装订线时显示
  '.cm-foldGutter .cm-gutterElement span': {
    opacity: `0`,
    transition: `opacity 0.15s ease`,
  },
  '&.cm-editor .cm-gutters:hover .cm-foldGutter .cm-gutterElement span': {
    opacity: `1`,
  },
})

export function lightTheme() {
  return [vsCodeLight, customStyles, preventScrollOnFocus()]
}

export function darkTheme() {
  return [vsCodeDark, customStyles, preventScrollOnFocus()]
}

// 根据主题模式获取主题扩展
export function theme(isDark: boolean) {
  return isDark ? darkTheme() : lightTheme()
}
