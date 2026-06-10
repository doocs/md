/**
 * Verify extension.js loads and activate() registers commands (vscode API mocked).
 */
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const vscodeRoot = path.resolve(__dirname, `..`)

const registered = []

const vscodeMock = {
  commands: {
    registerCommand(id, _handler) {
      registered.push(id)
      return { dispose() {} }
    },
    executeCommand() {},
  },
  window: {
    activeTextEditor: undefined,
    registerTreeDataProvider() {},
    onDidChangeActiveTextEditor() {
      return { dispose() {} }
    },
    createWebviewPanel() {
      return {
        title: ``,
        webview: { html: `` },
        onDidDispose() {},
        reveal() {},
      }
    },
    showErrorMessage() {},
  },
  EventEmitter: class {
    event = () => ({ dispose() {} })
    fire() {}
  },
  TreeItem: class {
    constructor(label, state) {
      this.label = label
      this.collapsibleState = state
    }
  },
  TreeItemCollapsibleState: { None: 0, Expanded: 1 },
  ThemeIcon: class {},
  ViewColumn: { Two: 2 },
  workspace: {
    onDidChangeTextDocument() {
      return { dispose() {} }
    },
    workspaceState: { get: () => undefined, update: () => {} },
  },
  ExtensionContext: class {},
}

const require = createRequire(import.meta.url)
const Module = require(`node:module`)
const originalLoad = Module._load
Module._load = function (request, parent, isMain) {
  if (request === `vscode`)
    return vscodeMock
  return originalLoad.call(this, request, parent, isMain)
}

const ext = require(path.join(vscodeRoot, `dist`, `extension.js`))
const context = {
  subscriptions: [],
  workspaceState: { get: () => undefined, update: async () => {} },
}
ext.activate(context)

const required = [`markdown.preview`, `markdown.toggleCiteStatus`]
for (const cmd of required) {
  if (!registered.includes(cmd)) {
    throw new Error(`Missing registered command: ${cmd}`)
  }
}

console.log(`✓ activate() registered ${registered.length} commands`)
console.log(`✓ markdown.preview is available`)
