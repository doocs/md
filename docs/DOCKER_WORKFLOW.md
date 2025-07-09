# Docker Workflow 使用指南

本文档说明了如何配置和使用项目的Docker构建和发布workflow，特别是针对fork仓库的配置方法。

## 📋 概述

我们的Docker workflow支持以下特性：

- ✅ **官方仓库自动构建**: `doocs/md` 仓库自动构建并推送到 `doocs/md`
- ✅ **Fork仓库支持**: fork仓库可以推送到自己的Docker Hub账户
- ✅ **灵活配置**: 通过variables和secrets控制构建行为
- ✅ **多架构支持**: 支持 AMD64 和 ARM64 架构
- ✅ **安全性**: 不会泄露官方仓库的secrets给fork仓库

## 🏢 官方仓库 (doocs/md)

官方仓库无需额外配置，workflow会自动：

- 构建多架构Docker镜像
- 推送到 Docker Hub `doocs/md` 仓库
- 使用配置的 `DOCKER_USERNAME` 和 `DOCKER_PASSWORD` secrets

## 🍴 Fork仓库配置

### 第一步：启用Docker构建

在你的fork仓库中设置以下**Repository Variable**：

```
名称: ENABLE_DOCKER_BUILD
值: true
```

**设置路径**: `Settings` → `Secrets and variables` → `Actions` → `Variables` 标签

### 第二步：配置Docker Hub凭据

设置以下**Repository Variables**和**Secrets**：

#### Variables (公开配置)

```
DOCKER_REGISTRY_USER=你的Docker Hub用户名
DOCKER_IMAGE_NAME=md              # 可选，默认为 'md'
```

#### Secrets (私密配置)

```
DOCKER_REGISTRY_TOKEN=你的Docker Hub Access Token
```

**获取Docker Hub Access Token**：

1. 登录 [Docker Hub](https://hub.docker.com/)
2. 进入 `Account Settings` → `Security` → `New Access Token`
3. 创建token并复制

### 第三步：验证配置

推送代码到main分支后，检查Actions页面：

- workflow应该成功运行
- 构建的镜像会推送到 `你的用户名/md`

## 🔧 配置示例

### 示例1：基础配置

```bash
# Repository Variables
ENABLE_DOCKER_BUILD=true
DOCKER_REGISTRY_USER=myusername

# Repository Secrets
DOCKER_REGISTRY_TOKEN=dckr_pat_xxxxxxxxxxxxx

# 结果：镜像推送到 myusername/md
```

### 示例2：自定义镜像名

```bash
# Repository Variables
ENABLE_DOCKER_BUILD=true
DOCKER_REGISTRY_USER=mycompany
DOCKER_IMAGE_NAME=markdown-editor

# Repository Secrets
DOCKER_REGISTRY_TOKEN=dckr_pat_xxxxxxxxxxxxx

# 结果：镜像推送到 mycompany/markdown-editor
```

## 🔍 Workflow执行条件

Workflow会在以下情况执行：

1. **官方仓库** (`doocs/md`): 始终执行
2. **Fork仓库**: 满足以下所有条件时执行：
   - 仓库是公开的 (private == false)
   - 设置了 `ENABLE_DOCKER_BUILD=true` variable
   - 推送到main分支或手动触发

## 🏗️ 构建输出

成功构建后，你可以使用以下命令拉取镜像：

```bash
# 官方镜像
docker pull doocs/md:latest

# Fork仓库镜像 (以用户名myusername为例)
docker pull myusername/md:latest
```

## 🛡️ 安全最佳实践

### Variables vs Secrets

- **Variables**: 用于非敏感配置（用户名、镜像名）
- **Secrets**: 用于敏感信息（Access Token、密码）

### Access Token权限

建议创建具有最小权限的Docker Hub Access Token：

- ✅ 权限：`Read, Write, Delete` 仅针对你的镜像仓库
- ❌ 避免：使用密码或具有全部权限的token

### Fork仓库注意事项

- Fork仓库的workflow无法访问原仓库的secrets
- 每个fork仓库需要配置自己的Docker Hub凭据
- 私有fork仓库默认不会执行Docker构建

## 🚀 高级用法

### 多个镜像标签

可以通过修改 `scripts/build-multiarch.sh` 脚本来支持多个标签：

```bash
# 支持的标签示例
- latest
- v1.0.0 (基于git tag)
- main-abc1234 (基于commit hash)
```

### 其他镜像仓库

虽然默认支持Docker Hub，但可以修改workflow支持其他仓库：

- GitHub Container Registry (ghcr.io)
- 阿里云容器镜像服务
- 腾讯云容器镜像服务

## ❓ 常见问题

### Q: 为什么我的fork仓库没有构建Docker镜像？

**A**: 检查以下配置：

1. 确保设置了 `ENABLE_DOCKER_BUILD=true`
2. 确保仓库是公开的
3. 确保推送到了main分支
4. 检查Actions页面的错误信息

### Q: 构建失败，显示认证错误？

**A**: 检查Docker Hub凭据：

1. 验证 `DOCKER_REGISTRY_USER` 是否正确
2. 确保 `DOCKER_REGISTRY_TOKEN` 是有效的Access Token
3. 确认token具有推送权限

### Q: 如何构建到私有Docker仓库？

**A**: 修改workflow中的registry配置，并相应更新凭据设置。

### Q: 能否禁用某个fork的Docker构建？

**A**: 可以，移除 `ENABLE_DOCKER_BUILD` variable或设置为 `false`。

## 📞 获取帮助

如果遇到问题，可以：

1. 查看Actions页面的详细日志
2. 在项目Issues中搜索相关问题
3. 提交新的Issue并提供详细的错误信息

---

✨ **贡献提醒**: 改进这个workflow也是很好的贡献方式！欢迎提交PR优化构建流程。
