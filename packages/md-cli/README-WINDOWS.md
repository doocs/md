# MD-CLI Windows 可执行程序

一款微信 Markdown 编辑器的 Windows 桌面版，双击即可使用！

## ✨ 特性

- 🚀 **双击启动** - 无需安装 Node.js，双击 exe 文件即可运行
- 🌐 **自动打开浏览器** - 启动后自动在默认浏览器中打开编辑器
- 💾 **本地运行** - 所有数据在本地处理，安全可靠
- 📦 **单文件** - 约 50-70MB，包含所有依赖
- 🎨 **功能完整** - 支持 Markdown 语法、自定义主题、多图床、AI 助手等

## 📥 快速开始

### 方式一：直接使用（推荐）

1. 下载 `md-cli.exe` 文件
2. 双击运行 `md-cli.exe`
3. 等待浏览器自动打开编辑器界面
4. 开始编辑 Markdown！

### 方式二：命令行运行

```bash
# 基本使用
.\md-cli.exe

# 指定端口
.\md-cli.exe port=3000

# 配置云存储
.\md-cli.exe port=8800 spaceId=your_space_id clientSecret=your_secret

# 禁用自动打开浏览器
.\md-cli.exe noBrowser=true
```

## ⚙️ 配置选项

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `port` | 服务器端口 | 8800 | `port=3000` |
| `spaceId` | 云存储空间 ID | - | `spaceId=xxx` |
| `clientSecret` | 云存储密钥 | - | `clientSecret=yyy` |
| `noBrowser` | 禁用自动打开浏览器 | false | `noBrowser=true` |

## 📂 文件存储

- **上传的文件** 存储在系统临时目录: `C:\Users\你的用户名\AppData\Local\Temp\md-cli-upload\`
- **静态资源** 打包在 exe 文件中，无需额外下载

## 🔧 常见问题

### 1. 双击后闪退？

可能是端口被占用，尝试：
- 关闭占用 8800 端口的程序
- 或使用命令行指定其他端口: `.\md-cli.exe port=3000`

### 2. 浏览器没有自动打开？

- 手动访问控制台显示的链接（通常是 `http://127.0.0.1:8800`）
- 或使用命令: `.\md-cli.exe noBrowser=false`

### 3. 防火墙警告？

这是正常的，程序需要启动本地服务器，请允许访问。

### 4. Windows Defender 拦截？

- 这是因为 exe 文件未签名
- 点击"更多信息" → "仍要运行"
- 或将文件添加到信任列表

## 🛠️ 高级功能

### 云存储配置

如果需要将图片上传到云端，可以配置 unicloud 云存储：

```bash
.\md-cli.exe spaceId=your_space_id clientSecret=your_client_secret
```

### 环境变量

支持以下环境变量：

- `NO_BROWSER=true` - 禁用自动打开浏览器
- `CI=true` - CI 环境标识（自动禁用浏览器）

## 📋 系统要求

- **操作系统**: Windows 10 或更高版本
- **架构**: 64 位 (x64)
- **内存**: 建议 2GB 以上
- **磁盘空间**: 约 100MB

## 🔗 相关链接

- **官网**: https://md.doocs.org
- **GitHub**: https://github.com/doocs/md
- **问题反馈**: https://github.com/doocs/md/issues

## 📜 许可证

ISC License

---

## 🚀 开发者指南

### 从源码构建

如果你想自己构建 Windows exe 文件：

```bash
# 1. 克隆仓库
git clone https://github.com/doocs/md.git
cd md

# 2. 安装依赖
pnpm install

# 3. 构建 Windows exe
node scripts/build-windows-exe.mjs

# 构建文件位置
# packages/md-cli/build/md-cli.exe
```

### 技术栈

- **运行时**: Node.js 22
- **打包工具**: pkg
- **压缩**: Brotli
- **服务器**: Express
- **前端**: Vue 3 + Vite

### 构建配置

查看 `packages/md-cli/package.json` 中的 `pkg` 配置：

```json
{
  "pkg": {
    "assets": ["dist/**/*", "public/**/*"],
    "targets": ["node22-win-x64"],
    "outputPath": "build",
    "compress": "Brotli"
  }
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 💖 支持项目

如果这个工具对你有帮助，请给我们一个 ⭐️ Star！

---

**享受编辑 Markdown 的乐趣！** 🎉
