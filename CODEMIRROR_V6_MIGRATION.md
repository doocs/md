# CodeMirror v5 到 v6 升级指南

本文档描述了项目从 CodeMirror v5 升级到 v6 的所有变更。

## 🔄 主要变更

### 1. 依赖更新

**之前 (v5):**

```json
{
  "codemirror": "^5.65.19",
  "@types/codemirror": "^5.60.15"
}
```

**现在 (v6):**

```json
{
  "codemirror": "^6.0.1",
  "@codemirror/state": "^6.4.1",
  "@codemirror/view": "^6.26.3",
  "@codemirror/commands": "^6.3.3",
  "@codemirror/lang-markdown": "^6.2.4",
  "@codemirror/lang-css": "^6.2.1",
  "@codemirror/lang-javascript": "^6.2.2",
  "@codemirror/search": "^6.5.6",
  "@codemirror/theme-one-dark": "^6.1.2",
  "@codemirror/autocomplete": "^6.12.0"
}
```

### 2. 导入方式变更

**之前:**

```typescript
import type { Editor } from 'codemirror'
import CodeMirror, { fromTextArea } from 'codemirror'

// CSS 导入
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/xq-light.css'
import 'codemirror/theme/darcula.css'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/addon/edit/closebrackets'
```

**现在:**

```typescript
import type { V5CompatibleEditor } from '@/utils/editor'
import { createCodeMirrorV6 } from '@/utils/codemirror-v6'
// CSS 不再需要手动导入，由 v6 主题系统处理
```

### 3. 编辑器创建方式

**之前:**

```typescript
const editor = fromTextArea(textarea, {
  mode: `text/x-markdown`,
  theme: `darcula`,
  lineNumbers: false,
  lineWrapping: true,
  styleActiveLine: true,
  autoCloseBrackets: true,
  extraKeys: {/* ... */},
  undoDepth: 200,
})
```

**现在:**

```typescript
const editor = createCodeMirrorV6(
  container, // HTMLElement 容器
  initialValue, // 初始内容
  isDark, // 是否暗色主题
  extraKeys, // 快捷键配置
  onChange // 内容变化回调
)
```

### 4. API 兼容性

项目中创建了 `V5CompatibleEditor` 接口来保持 API 兼容性：

```typescript
interface V5CompatibleEditor {
  getValue: () => string
  setValue: (content: string) => void
  getSelection: () => string
  replaceSelection: (text: string) => void
  getCursor: (which?: string) => { line: number, ch: number }
  setCursor: (line: number | { line: number, ch: number }, ch?: number) => void
  // ... 更多兼容方法
}
```

### 5. 事件系统变更

**之前:**

```typescript
editor.on(`change`, (editor) => {
  // 处理变化
})

editor.on(`paste`, (editor, event) => {
  // 处理粘贴
})
```

**现在:**

```typescript
// 通过 onChange 回调处理变化
const editor = createCodeMirrorV6(container, ``, false, {}, (value) => {
  // 处理变化
})

// 事件监听通过 DOM 处理
editor.dom.addEventListener(`paste`, (event) => {
  // 处理粘贴
})
```

### 6. 主题系统

v6 使用全新的主题系统：

- 内置浅色主题：自定义的 `lightTheme`
- 暗色主题：使用 `@codemirror/theme-one-dark`
- 语法高亮：通过 `HighlightStyle.define()` 自定义

### 7. CSS 类名变更

**v5 类名 → v6 类名:**

- `.CodeMirror` → `.cm-editor`
- `.CodeMirror-scroll` → `.cm-scroller`
- `.CodeMirror-wrap` → `.cm-content`

## 🔧 影响的文件

### 核心文件

- `apps/web/package.json` - 依赖更新
- `apps/web/src/main.ts` - 移除 v5 导入
- `apps/web/src/utils/codemirror-v6.ts` - 新建 v6 配置
- `apps/web/src/utils/editor.ts` - 添加兼容层
- `apps/web/src/assets/less/theme.less` - CSS 兼容

### 组件文件

- `apps/web/src/views/CodemirrorEditor.vue` - 主编辑器
- `apps/web/src/stores/index.ts` - Store 中的编辑器
- `apps/web/src/components/ai/tool-box/index.ts` - AI 工具
- `apps/web/src/components/ui/search-tab/SearchTab.vue` - 搜索组件
- `apps/web/src/components/editor/CustomUploadForm.vue` - 自定义上传

## ⚠️ 注意事项

1. **搜索功能**：SearchTab.vue 需要进一步适配 v6 的搜索 API
2. **快捷键**：extraKeys 的转换可能需要调整
3. **扩展功能**：一些 v5 的 addons 需要找到 v6 的对应实现
4. **性能**：v6 性能更好，但初始化方式不同

## 🚀 升级步骤

1. 更新 package.json 依赖
2. 安装新的 CodeMirror v6 包
3. 更新导入语句
4. 替换编辑器创建代码
5. 更新 CSS 样式
6. 测试所有编辑器功能
7. 修复兼容性问题

## � 已修复的运行时问题

### 1. 滚动同步错误

**问题**: `Cannot read properties of null (reading 'scrollHeight')`
**原因**: CodeMirror v6 使用新的 CSS 类名 `.cm-scroller` 而不是 v5 的 `.CodeMirror-scroll`
**解决方案**:

- 更新滚动查找逻辑，优先使用 v6 类名，回退到 v5 类名
- 添加空值检查和错误处理

### 2. 键盘事件错误

**问题**: `Cannot read properties of undefined (reading 'ctrlKey')`
**原因**: CodeMirror v6 的事件系统与 v5 不同，事件参数传递方式改变
**解决方案**:

- 更新兼容层的事件处理逻辑
- 确保键盘事件正确传递 `(editor, event)` 参数格式
- 添加事件参数验证

## �📝 待办事项

- [x] 修复滚动同步功能
- [x] 修复键盘事件处理
- [ ] 完善搜索功能的 v6 适配
- [ ] 测试所有快捷键功能
- [ ] 优化主题切换性能
- [ ] 添加更多 v6 特性（如折叠、linting 等）
- [ ] 性能测试和优化
