# 文档存储配置说明

## 概述

文档存储功能允许您将 Markdown 文档保存在不同的存储平台，包括：

- **LocalStorage**：浏览器本地存储（默认）
- **WebDAV**：支持 WebDAV 协议的云存储服务（如坚果云、Nextcloud）
- **腾讯云 COS**：腾讯云对象存储服务

## 使用方法

### 打开文档存储配置

1. 点击顶部菜单栏的「文件」
2. 选择「文档存储配置」

### 配置存储平台

#### 1. LocalStorage（默认）

- 无需配置
- 数据保存在浏览器本地
- ⚠️ 清除浏览器数据会导致文档丢失

#### 2. WebDAV

**配置参数：**

- **WebDAV 地址**：WebDAV 服务器地址
  - 示例：`https://dav.jianguoyun.com/dav/`
- **用户名**：WebDAV 账号用户名
- **密码**：WebDAV 账号密码或应用密码
- **存储路径**：文档存储的目录路径（可选）
  - 默认：`/md-documents`

**坚果云配置示例：**

1. 登录坚果云网页版
2. 进入「账户信息」→「安全选项」→「第三方应用管理」
3. 生成应用密码
4. 填写配置：
   - WebDAV 地址：`https://dav.jianguoyun.com/dav/`
   - 用户名：你的坚果云邮箱
   - 密码：生成的应用密码

#### 3. 腾讯云 COS

**配置参数：**

- **SecretId**：腾讯云 API 密钥 ID
- **SecretKey**：腾讯云 API 密钥
- **Bucket**：存储桶名称
- **Region**：存储桶所在区域
  - 示例：`ap-guangzhou`
- **存储路径**：文档存储的目录（可选）
  - 默认：`md-documents`

**获取腾讯云密钥：**

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 访问 [API 密钥管理](https://console.cloud.tencent.com/cam/capi)
3. 创建或查看 SecretId 和 SecretKey

### 切换存储平台

1. 在「存储设置」标签页选择目标存储平台
2. 系统会提示确认切换
3. 确认后，当前所有文档数据会自动同步到新平台

⚠️ **注意**：切换前请确保已正确配置目标平台的参数

### 数据同步

在「同步管理」标签页，您可以：

- **同步到云端**：将本地数据（文档+配置）手动同步到云端存储
- **从云端加载**：从云端加载数据（文档+配置）覆盖本地数据（⚠️ 会覆盖本地所有文档和配置）

**同步的配置包括：**

1. **图床配置**
   - GitHub、阿里云 OSS、腾讯云 COS、七牛云、MinIO、Telegram、公众号、Cloudflare R2、又拍云、Cloudinary 等
   - 当前选中的图床类型 (`imgHost`)
   - 图片压缩设置 (`useCompression`)

2. **主题和样式配置**
   - 主题 (`theme`)
   - 字体家族 (`fontFamily`)
   - 字体大小 (`fontSize`)
   - 主色调 (`primaryColor`)
   - 代码块主题 (`codeBlockTheme`)
   - 图注格式 (`legend`)
   - Mac 代码块样式 (`isMacCodeBlock`)
   - 代码行号显示 (`isShowLineNumber`)
   - 引用状态 (`isCiteStatus`)
   - 字数统计 (`isCountStatus`)
   - 段落缩进 (`isUseIndent`)
   - 两端对齐 (`isUseJustify`)
   - 预览宽度 (`previewWidth`)

3. **UI 界面配置**
   - 编辑器位置 (`isEditOnLeft`)
   - AI 工具箱显示 (`showAIToolbox`)
   - 右侧滑块状态 (`isOpenRightSlider`)
   - 文章列表滑块状态 (`isOpenPostSlider`)
   - 浮动目录固定 (`isPinFloatingToc`)
   - CSS 编辑器显示 (`isShowCssEditor`)

4. **CSS 编辑器配置**
   - 自定义 CSS 方案 (`cssContentConfig`)

5. **其他配置**
   - 自定义上传表单 (`formCustomConfig`)
   - 文档存储配置 (`webdavDocConfig`, `cosDocConfig`, `docStorageType`)
   - 复制模式 (`copyMode`)
   - 排序模式 (`sortMode`)

**注意：** 文档内容 (`posts`) 和当前文档 ID (`currentPostId`) 通过文档存储系统单独管理，不在配置同步中。

### 测试连接

在配置云端存储后，可以点击「测试连接」按钮验证配置是否正确。

## 自动保存

文档和配置会在以下情况自动保存到配置的存储平台：

- **文档自动保存**：编辑文档内容时、添加/删除/重命名文档时、切换当前文档时
- **配置自动保存**：通过 `store.reactive()` 的配置会自动保存到 localStorage
- **手动同步**：使用「同步到云端」功能将所有配置上传到云端存储

**重要提示**：
- Store 状态（如主题、CSS 配置等）通过 `store.reactive()` 自动保存到 localStorage
- 同步到云端时，会读取所有 Store 的**当前运行时状态**，确保最新的配置被上传
- 修改 CSS 自定义面板等配置后，点击「同步到云端」即可保存到云端

## 常见问题

**Q: 切换存储平台后，原平台的数据会丢失吗？**

A: 不会。切换时会将当前数据同步到新平台，但原平台的数据仍然保留。

**Q: 如何备份文档？**

A: 可以通过以下方式备份：
1. 切换到云端存储平台（WebDAV 或 COS）
2. 使用「文件」→「导出 .md」导出单个文档
3. 使用「导入/导出项目配置」备份完整配置和数据

**Q: WebDAV 连接失败怎么办？**

A: 请检查：
1. WebDAV 地址是否正确（注意 https/http）
2. 用户名和密码是否正确
3. 是否使用了应用密码（如坚果云）
4. 网络连接是否正常

**Q: 多设备如何同步？**

A: 
1. 在第一台设备上配置云端存储（WebDAV 或 COS）
2. 点击「同步到云端」上传文档和配置
3. 在其他设备上使用相同的云端存储配置
4. 使用「从云端加载」获取文档和配置数据
5. 刷新页面以应用配置
6. 之后编辑会自动同步到云端

⚠️ **注意**：从云端加载配置后需要刷新页面才能生效

## 技术说明

### 存储结构

云端存储会创建以下文件：

- `documents.json`：包含所有文档的数据
- `current.txt`：当前选中的文档 ID
- `config.json`：项目配置数据（图床配置等）

### 数据格式

```json
[
  {
    "id": "uuid",
    "title": "文档标题",
    "content": "文档内容",
    "history": [...],
    "createDatetime": "2024-01-01T00:00:00.000Z",
    "updateDatetime": "2024-01-01T00:00:00.000Z",
    "parentId": null,
    "collapsed": false
  }
]
```

## 隐私和安全

- 所有数据传输使用 HTTPS 加密
- API 密钥仅保存在浏览器本地存储
- 不会上传数据到第三方服务器
- 建议定期备份重要文档
