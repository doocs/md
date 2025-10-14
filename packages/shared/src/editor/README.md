# CodeMirror 编辑器扩展

提供了 Markdown、JavaScript 和 CSS 编辑器的扩展集合，遵循 CodeMirror 的设计理念。

## 设计理念

- **扩展组合**：提供 `setup` 函数返回扩展数组，用户可以自由组合
- **主题分离**：主题作为独立扩展，可以动态切换
- **原生 API**：直接使用 CodeMirror 的 `EditorView` 和 `EditorState`
- **最小封装**：不隐藏 CodeMirror 的能力，保持灵活性
- **跨平台快捷键**：使用 `Mod-` 前缀（macOS 自动映射为 `Cmd`，Windows/Linux 映射为 `Ctrl`）

## 扩展说明

### Markdown Setup

`markdownSetup()` 提供轻量级的 Markdown 编辑功能：

- ✅ 历史记录（撤销/重做）
- ✅ 高亮选中匹配
- ✅ 自动闭合括号
- ✅ Markdown 语法支持
- ✅ 自动换行
- ✅ 多选支持
- ❌ 不包含行号（Markdown 通常不需要）
- ❌ 不包含代码折叠
- ❌ 不包含自动补全

### JavaScript/CSS Setup

`javascriptSetup()` 和 `cssSetup()` 基于 `basicSetup`，提供完整的代码编辑功能：

- ✅ 行号
- ✅ 代码折叠
- ✅ 自动补全
- ✅ 括号匹配
- ✅ 矩形选择
- ✅ 以及 `basicSetup` 的所有功能

## 使用示例

### Markdown 编辑器

```typescript
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, placeholder } from '@codemirror/view'
import { markdownSetup, markdownTheme } from '@md/shared/editor'

// 创建主题 Compartment 用于动态切换
const themeCompartment = new Compartment()

const state = EditorState.create({
  doc: `# Hello World`,
  extensions: [
    markdownSetup(),
    themeCompartment.of(markdownTheme(false)), // 浅色主题
    placeholder(`开始写作...`),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        console.log(update.state.doc.toString())
      }
    }),
  ],
})

const view = new EditorView({
  state,
  parent: document.getElementById(`editor`),
})

// 切换主题
view.dispatch({
  effects: themeCompartment.reconfigure(markdownTheme(true)), // 暗色主题
})

// 获取内容
const content = view.state.doc.toString()

// 设置内容
view.dispatch({
  changes: { from: 0, to: view.state.doc.length, insert: `new content` },
})

// 销毁
view.destroy()
```

### JavaScript 编辑器

```typescript
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { javascriptSetup, javascriptTheme } from '@md/shared/editor'

const themeCompartment = new Compartment()

const view = new EditorView({
  parent: document.getElementById(`editor`),
  state: EditorState.create({
    doc: `console.log("Hello")`,
    extensions: [
      javascriptSetup(),
      themeCompartment.of(javascriptTheme(false)),
    ],
  }),
})
```

### CSS 编辑器

```typescript
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { cssSetup, cssTheme } from '@md/shared/editor'

const themeCompartment = new Compartment()

const view = new EditorView({
  parent: document.getElementById(`editor`),
  state: EditorState.create({
    doc: `body { margin: 0; }`,
    extensions: [
      cssSetup(),
      themeCompartment.of(cssTheme(true)), // 暗色主题
    ],
  }),
})
```

### Vue 3 中使用

```vue
<script setup lang="ts">
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { javascriptSetup, javascriptTheme } from '@md/shared/editor'

const editorContainer = ref<HTMLDivElement>()
const view = ref<EditorView>()
const themeCompartment = new Compartment()

const isDark = computed(() => {
  return document.documentElement.classList.contains(`dark`)
})

onMounted(() => {
  view.value = new EditorView({
    parent: editorContainer.value!,
    state: EditorState.create({
      doc: `const x = 1`,
      extensions: [
        javascriptSetup(),
        themeCompartment.of(javascriptTheme(isDark.value)),
      ],
    }),
  })
})

// 监听主题变化
watch(isDark, (dark) => {
  view.value?.dispatch({
    effects: themeCompartment.reconfigure(javascriptTheme(dark)),
  })
})

onUnmounted(() => {
  view.value?.destroy()
})
</script>

<template>
  <div ref="editorContainer" />
</template>
```

## API

### Markdown

- `markdownSetup()` - 返回 Markdown 编辑器的基础扩展
- `markdownLightTheme()` - 返回浅色主题扩展
- `markdownDarkTheme()` - 返回暗色主题扩展
- `markdownTheme(isDark: boolean)` - 根据模式返回对应主题

### JavaScript

- `javascriptSetup()` - 返回 JavaScript 编辑器的基础扩展（包含 basicSetup）
- `javascriptLightTheme()` - 返回浅色主题扩展
- `javascriptDarkTheme()` - 返回暗色主题扩展
- `javascriptTheme(isDark: boolean)` - 根据模式返回对应主题

### CSS

- `cssSetup()` - 返回 CSS 编辑器的基础扩展（包含 basicSetup）
- `cssLightTheme()` - 返回浅色主题扩展
- `cssDarkTheme()` - 返回暗色主题扩展
- `cssTheme(isDark: boolean)` - 根据模式返回对应主题

## 自定义扩展

你可以轻松添加自定义扩展：

```typescript
import { indentWithTab } from '@codemirror/commands'
import { keymap } from '@codemirror/view'

const view = new EditorView({
  state: EditorState.create({
    extensions: [
      markdownSetup(),
      markdownTheme(false),
      // 添加占位符
      placeholder(`开始写作...`),
      // 添加自定义快捷键（Mod- 会自动映射为对应平台的修饰键）
      keymap.of([
        { key: `Mod-s`, run: (view) => { /* 保存 */ return true } },
        { key: `Mod-Shift-f`, run: (view) => { /* 格式化 */ return true } },
        indentWithTab,
      ]),
      // 添加自定义样式
      EditorView.theme({
        '.cm-content': {
          fontSize: `16px`,
        },
      }),
      // 添加内容变化监听
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          console.log(`内容已变化`)
        }
      }),
    ],
  }),
})
```

## 快捷键说明

CodeMirror 使用 `Mod-` 前缀来表示平台相关的修饰键：

- **macOS**: `Mod` = `Cmd` (⌘)
- **Windows/Linux**: `Mod` = `Ctrl`

常用快捷键格式：

- `Mod-s` - macOS: Cmd+S, Windows: Ctrl+S
- `Mod-Shift-f` - macOS: Cmd+Shift+F, Windows: Ctrl+Shift+F
- `Alt-Enter` - 所有平台都是 Alt+Enter

不需要手动判断平台或转换键位！
