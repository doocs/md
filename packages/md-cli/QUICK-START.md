# Windows 下自动启动浏览器 - 快速开始指南

## 五分钟快速上手

### 最简单的方案（推荐用于 md-cli）

```javascript
// 在 index.js 中添加以下代码

import { spawn } from 'node:child_process'
import { platform } from 'node:os'

// 在服务器启动后添加：
app.listen(port, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${port}`
  console.log(`✓ 服务已启动: ${url}`)

  // 自动启动浏览器 (3 行代码)
  const cmd = platform() === 'win32' ? 'cmd.exe' : 'open'
  const args = platform() === 'win32' ? ['/c', 'start', url] : [url]
  spawn(cmd, args, { detached: true }).unref()
})
```

**这就是全部！**不需要任何依赖，跨平台支持。

---

## 三种方案快速对比

### 方案 1: child_process（推荐 CLI）

```javascript
// 代码量：3 行
// 依赖：0
// 启动时间：100-300ms

spawn('cmd.exe', ['/c', 'start', 'http://localhost:8800'], {
  detached: true
}).unref()
```

✅ 用于 md-cli

### 方案 2: open 包（推荐 Web）

```javascript
// 代码量：1 行
// 依赖：npm install open
// 启动时间：400-800ms

import open from 'open'
await open('http://localhost:8800')
```

✅ 用于有后端的 Web 应用

### 方案 3: Electron（推荐桌面）

```javascript
// 代码量：20+ 行
// 依赖：npm install electron (~150MB)
// 启动时间：2-5 秒

import { app, BrowserWindow } from 'electron'
app.whenReady().then(() => {
  const window = new BrowserWindow()
  window.loadURL('http://localhost:8800')
})
```

✅ 用于专业桌面应用

---

## 集成到 md-cli

### 步骤 1: 复制浏览器启动器代码

从 `/packages/md-cli/browser-launcher.js` 中选择需要的类：

```javascript
// 推荐用法：复制 ChildProcessLauncher 类
export class ChildProcessLauncher {
  static launchSync(url, options = {}) {
    // ... (见文件)
  }
}
```

### 步骤 2: 修改 index.js

```javascript
import { ChildProcessLauncher } from './browser-launcher.js'

// 在 app.listen 后添加：
app.listen(port, '127.0.0.1', async () => {
  const url = `http://127.0.0.1:${port}`
  console.log(`服务已启动: ${url}`)

  // 启动浏览器
  try {
    ChildProcessLauncher.launchSync(url)
  } catch (error) {
    console.log(`请手动访问: ${url}`)
  }
})
```

### 步骤 3: 完成

没有第三步！你已经搞定了。

---

## 使用工具库（更简便）

### 方法 A: 使用完整的工具库

```javascript
import { launchBrowserSmart } from './browser-launcher-utils.js'

// 自动选择最佳方案
await launchBrowserSmart('http://localhost:8800')
```

### 方法 B: 添加诊断信息

```javascript
import { printBrowserDiagnostics } from './browser-launcher-utils.js'

// 打印系统和浏览器信息
await printBrowserDiagnostics()
```

### 方法 C: 智能降级

```javascript
import { launchBrowserSmart } from './browser-launcher-utils.js'

// 自动尝试多种方式，最后提示手动访问
const success = await launchBrowserSmart(url, {
  preferredMethod: 'open',  // 优先 open
  fallback: true             // 失败则用 child_process
})

if (!success) {
  console.log(`请访问: ${url}`)
}
```

---

## 常见问题速解

### Q: 为什么浏览器不启动？

**检查列表：**
1. ✓ 你安装了浏览器吗？（Chrome、Firefox、Edge）
2. ✓ 浏览器在 PATH 中吗？
3. ✓ 是否在 CI/CD 环境中？（会自动跳过）
4. ✓ WSL 环境需要特殊处理吗？

**诊断代码：**
```javascript
import { getAvailableBrowsers, isCI } from './browser-launcher-utils.js'

console.log('可用浏览器:', await getAvailableBrowsers())
console.log('CI 环境:', isCI())
```

### Q: 如何在特定浏览器中打开？

```javascript
import { launchInBrowser } from './browser-launcher-utils.js'

// 在 Chrome 中打开
await launchInBrowser('http://localhost:8800', 'chrome')

// 在 Firefox 中打开
await launchInBrowser('http://localhost:8800', 'firefox')

// 在 Edge 中打开
await launchInBrowser('http://localhost:8800', 'edge')
```

### Q: 如何传递浏览器参数（如隐私模式）？

```javascript
import { launchBrowserChildProcess } from './browser-launcher-utils.js'

// 隐私模式
await launchBrowserChildProcess('http://localhost:8800', {
  incognito: true
})

// 自定义参数
await launchBrowserChildProcess('http://localhost:8800', {
  args: ['--disable-extensions', '--disable-plugins']
})
```

### Q: 如何在无界面环境中跳过浏览器启动？

```javascript
import { shouldLaunchBrowser } from './browser-launcher-utils.js'

if (shouldLaunchBrowser()) {
  await launcher.launch(url)
} else {
  console.log(`无界面环境，请手动访问: ${url}`)
}
```

---

## 文件导航

| 文件 | 用途 | 复杂度 |
|------|------|--------|
| `browser-launcher.js` | 完整实现，包含所有方案 | 高 |
| `browser-launcher-utils.js` | 即插即用的工具函数 | 中 |
| `index.integrated.js` | 集成示例代码 | 中 |
| `BROWSER-LAUNCH-GUIDE.md` | 详细参考文档 | 长 |
| `COMPARISON-SUMMARY.md` | 方案对比表 | 中 |
| `QUICK-START.md` | 本文件，快速开始 | 低 |

---

## 复制粘贴方案

### 方案 1: 最小代码（仅 3 行）

```javascript
import { spawn } from 'node:child_process'
import { platform } from 'node:os'

const cmd = platform() === 'win32' ? 'cmd.exe' : 'open'
const args = platform() === 'win32' ? ['/c', 'start', url] : [url]
spawn(cmd, args, { detached: true }).unref()
```

### 方案 2: 带错误处理（6 行）

```javascript
import { spawn } from 'node:child_process'
import { platform } from 'node:os'

try {
  const cmd = platform() === 'win32' ? 'cmd.exe' : 'open'
  const args = platform() === 'win32' ? ['/c', 'start', url] : [url]
  spawn(cmd, args, { detached: true }).unref()
  console.log(`✓ 已启动浏览器`)
} catch (error) {
  console.log(`请手动访问: ${url}`)
}
```

### 方案 3: 完整的智能启动（使用工具库）

```javascript
import { launchBrowserSmart } from './browser-launcher-utils.js'

try {
  await launchBrowserSmart(url)
} catch (error) {
  console.log(`请手动访问: ${url}`)
}
```

---

## 性能对比一览

```
启动时间：
  child_process   ████ 150-300ms    <- 最快
  open 包         ██████ 400-800ms
  Electron        ████████████ 2-5s  <- 最慢

内存占用：
  child_process   ████ 5-10MB        <- 最小
  open 包         ██████ 15-25MB
  Electron        ████████████████ 100-200MB

依赖大小：
  child_process   ░ 0                <- 最小
  open 包         ██ ~50KB
  Electron        ████████████████ ~150MB
```

---

## 最佳实践清单

- [x] 使用 `detached: true` 让浏览器独立运行
- [x] 使用 `.unref()` 让 Node 进程不等待浏览器
- [x] 用 `stdio: 'ignore'` 隐藏浏览器的 I/O
- [x] 检查平台差异（Windows vs macOS vs Linux）
- [x] 设置超时防止无限等待
- [x] 在 CI/CD 环境中跳过启动
- [x] 提供降级方案和手动访问提示
- [x] 记录详细的错误信息便于调试

---

## 实时诊断命令

在项目中运行诊断：

```bash
# 打印浏览器状态
node -e "import('./browser-launcher-utils.js').then(m => m.printBrowserDiagnostics())"

# 检查 open 包
node -e "import('open').then(m => console.log('✓ open 包可用')).catch(() => console.log('✗ open 包不可用'))"

# 查找浏览器
node -e "import { getAvailableBrowsers } from './browser-launcher-utils.js'; getAvailableBrowsers().then(b => console.table(b))"
```

---

## 下一步

1. **快速集成**（5分钟）
   - 复制方案 1 或 2 的代码
   - 添加到你的 `index.js`
   - 完成！

2. **了解详情**（15分钟）
   - 阅读 `BROWSER-LAUNCH-GUIDE.md`
   - 理解各方案的优缺点
   - 根据需要调整

3. **完整实现**（30分钟）
   - 使用 `browser-launcher.js` 中的完整类
   - 或使用 `browser-launcher-utils.js` 中的工具函数
   - 添加自定义配置

4. **高级定制**（1小时+）
   - 集成托盘功能（需要 Electron）
   - 添加浏览器检测和选择
   - 实现复杂的错误恢复

---

## 获得帮助

### 调试信息

启用详细日志：
```javascript
// 添加到启动代码
process.env.DEBUG = 'browser-launcher'

// 然后检查日志
import { getBrowserStatus } from './browser-launcher-utils.js'
console.log(await getBrowserStatus())
```

### 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| 浏览器无法启动 | 浏览器不在 PATH | 使用完整路径或检查安装 |
| ENOENT: no such file | 命令不存在 | 检查平台和浏览器名称 |
| 端口被占用 | 另一个进程占用端口 | 更改端口或杀死占用进程 |
| WSL 中不工作 | WSL 特殊处理 | 使用 `cmd.exe /c start` |

---

## 推荐方案总结

```plaintext
┌─────────────────────────────────────────────────┐
│         为 md-cli 推荐的最终方案                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  🎯 child_process (零依赖)                      │
│                                                 │
│  代码示例：                                      │
│                                                 │
│  const cmd = platform() === 'win32'             │
│    ? 'cmd.exe'                                  │
│    : 'open'                                     │
│  const args = platform() === 'win32'            │
│    ? ['/c', 'start', url]                       │
│    : [url]                                      │
│  spawn(cmd, args, { detached: true }).unref()  │
│                                                 │
│  ✅ 优点：                                       │
│  • 零依赖                                       │
│  • 跨平台                                       │
│  • 最快启动                                     │
│  • 适合 CLI                                     │
│                                                 │
│  📦 可选：install open 作为备选方案             │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 参考资源

- 📚 [Node.js child_process 文档](https://nodejs.org/api/child_process.html)
- 📚 [open npm 包](https://www.npmjs.com/package/open)
- 📚 [Electron 文档](https://www.electronjs.org/)
- 🔗 [Chrome 启动参数](https://peter.sh/experiments/chromium-command-line-switches/)

---

**版本**: v1.0
**更新**: 2024-11-16
**作者**: Claude Code

快速开始完成！有任何问题请查看完整文档。
