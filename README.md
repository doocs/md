<div align="center">

[![doocs-md](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/logo-2.png)](https://github.com/doocs/md)

</div>

<h1 align="center">微信 Markdown 编辑器</h1>

<div align="center">

[![status](https://img.shields.io/github/actions/workflow/status/doocs/md/deploy.yml?style=flat-square&labelColor=564341&color=42cc23)](https://github.com/doocs/md/actions) [![node](https://img.shields.io/badge/node-%3E%3D22-42cc23?style=flat-square&labelColor=564341)](https://nodejs.org/en/about/previous-releases) [![pr](https://img.shields.io/badge/prs-welcome-42cc23?style=flat-square&labelColor=564341)](https://github.com/doocs/md/pulls) [![stars](https://img.shields.io/github/stars/doocs/md?style=flat-square&labelColor=564341&color=42cc23)](https://github.com/doocs/md/stargazers) [![forks](https://img.shields.io/github/forks/doocs/md?style=flat-square&labelColor=564341&color=42cc23)](https://github.com/doocs/md)<br> [![release](https://img.shields.io/github/v/release/doocs/md?style=flat-square&labelColor=564341&color=42cc23)](https://github.com/doocs/md/releases) [![npm](https://img.shields.io/npm/v/@doocs/md-cli?style=flat-square&labelColor=564341&color=42cc23)](https://www.npmjs.com/package/@doocs/md-cli) [![docker](https://img.shields.io/badge/docker-latest-42cc23?style=flat-square&labelColor=564341)](https://hub.docker.com/r/doocs/md)

</div>

## 📝 项目介绍

**Markdown 文档自动即时渲染为微信图文**，让你不再为微信内容排版而发愁！只要你会基本的 Markdown 语法（现在有了 AI，你甚至不需要会 Markdown），就能做出一篇样式简洁而又美观大方的微信图文。

**如果这个项目对你有帮助，请给我们点个 Star ⭐️**，我们会持续更新和维护！

## 🌐 在线编辑器地址

[https://md.doocs.org](https://md.doocs.org)

> **推荐使用 Chrome 浏览器**，效果最佳。

## 🤔 为何开发这款编辑器

现有的开源微信 Markdown 编辑器样式繁杂，排版过程中往往需要额外调整，影响使用效率。为了解决这一问题，我们打造了一款更加**简洁、优雅**的编辑器，提供更流畅的排版体验。

欢迎各位朋友随时提交 PR，让这款微信 Markdown 编辑器变得更好！如果你有新的想法，也欢迎在 [💬 Discussions 讨论区](https://github.com/doocs/md/discussions)反馈。

## ✨ 功能特性

### 🎨 核心功能

- ✅ **完整 Markdown 支持** - 支持所有基础语法、数学公式
- ✅ **图表渲染** - 支持 Mermaid 图表和 [GFM 警告块](https://github.com/orgs/community/discussions/16925)
- ✅ **PlantUML 支持** - 强大的 UML 图表渲染
- ✅ **Ruby 注音扩展** - 支持 `[文字]{注音}`、`[文字]^(注音)` 格式，支持多种分隔符

### 🎯 编辑体验

- ✅ **代码高亮** - 丰富的代码块高亮主题，提升代码可读性
- ✅ **自定义样式** - 允许自定义主题色和 CSS 样式，灵活定制展示效果
- ✅ **草稿保存** - 内置本地内容管理功能，支持草稿自动保存

### 🚀 高级功能

- ✅ **多图床支持** - 提供多种图床选择，便捷的图片上传功能
- ✅ **文件管理** - 便捷的文件导入、导出功能，提升工作效率
- ✅ **AI 集成** - 集成主流 AI 模型（DeepSeek、OpenAI、通义千问、腾讯混元、火山方舟、302.AI 等），智能辅助内容创作

## 🖼️ 支持的图床服务

| #   | 图床                                                   | 使用时是否需要配置                                                         | 备注                                                                                                                   |
| --- | ------------------------------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | 默认                                                   | 否                                                                         | -                                                                                                                      |
| 2   | [GitHub](https://github.com)                           | 配置 `Repo`、`Token` 参数                                                  | [如何获取 GitHub token？](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) |
| 3   | [阿里云](https://www.aliyun.com/product/oss)           | 配置 `AccessKey ID`、`AccessKey Secret`、`Bucket`、`Region` 参数           | [如何使用阿里云 OSS？](https://help.aliyun.com/document_detail/31883.html)                                             |
| 4   | [腾讯云](https://cloud.tencent.com/act/pro/cos)        | 配置 `SecretId`、`SecretKey`、`Bucket`、`Region` 参数                      | [如何使用腾讯云 COS？](https://cloud.tencent.com/document/product/436/38484)                                           |
| 5   | [七牛云](https://www.qiniu.com/products/kodo)          | 配置 `AccessKey`、`SecretKey`、`Bucket`、`Domain`、`Region` 参数           | [如何使用七牛云 Kodo？](https://developer.qiniu.com/kodo)                                                              |
| 6   | [MinIO](https://min.io/)                               | 配置 `Endpoint`、`Port`、`UseSSL`、`Bucket`、`AccessKey`、`SecretKey` 参数 | [如何使用 MinIO？](http://docs.minio.org.cn/docs/master/)                                                              |
| 7   | [S3 协议](https://aws.amazon.com/s3/)                  | 配置 `Endpoint`、`Region`、`Bucket`、`AccessKey`、`SecretKey` 参数         | 支持 AWS S3、Oracle、DigitalOcean 等兼容 S3 的存储服务                                                                 |
| 8   | [公众号](https://mp.weixin.qq.com/)                    | 配置 `appID`、`appsecret`、`代理域名` 参数                                 | [如何使用公众号图床？](https://md-pages.doocs.org/tutorial)                                                            |
| 9   | [Cloudflare R2](https://developers.cloudflare.com/r2/) | 配置 `AccountId`、`AccessKey`、`SecretKey`、`Bucket`、`Domain` 参数        | [如何使用 S3 API 操作 R2？](https://developers.cloudflare.com/r2/api/s3/api/)                                          |
| 10  | [又拍云](https://www.upyun.com/)                       | 配置 `Bucket`、`Operator`、`Password`、`Domain` 参数                       | [如何使用 又拍云？](https://help.upyun.com/)                                                                           |
| 11  | [Telegram](https://core.telegram.org/api)              | 配置 `Bot Token`、`Chat ID` 参数                                           | [如何使用 Telegram 图床？](https://github.com/doocs/md/blob/main/docs/telegram-usage.md)                               |
| 12  | [Cloudinary](https://cloudinary.com/)                  | 配置 `Cloud Name`、`API Key`、`API Secret` 参数                            | [如何使用 Cloudinary？](https://cloudinary.com/documentation/upload_images)                                            |
| 13  | 自定义上传                                             | 是                                                                         | [如何自定义上传？](/docs/custom-upload.md)                                                                             |

## 🎬 产品演示

<div align="center">

|                                      🎨 主题切换                                      |                                      🖼️ 图片上传                                      |
| :-----------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: |
| ![demo1](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo1.gif) | ![demo2](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo2.gif) |

|                                      📝 样式扩展                                      |                                      🤖 一键排版                                      |
| :-----------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: |
| ![demo3](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo3.gif) | ![demo4](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo4.gif) |

</div>

## 🛠️ 开发与部署

```sh
# 安装 node 版本
nvm i && nvm use

# 安装依赖
pnpm i

# 启动开发模式
pnpm web dev
# 访问 http://localhost:5173/md/

# 部署在 /md 目录
pnpm web build

# 部署在根目录
pnpm web build:h5-netlify

# Chrome 插件启动及调试
pnpm web ext:dev
# 访问 chrome://extensions/ 打开开发者模式，加载已解压的扩展程序，选择 apps/web/.output/chrome-mv3-dev 目录

# Chrome 插件打包
pnpm web ext:zip

# Firefox 扩展打包(how to build Firefox addon)
pnpm web firefox:zip # output zip file at in apps/web/.output/md-{version}-firefox.zip

# uTools 插件打包
pnpm utools:package # output zip file at apps/utools/release/md-utools-v{version}.zip

# cloudflare workers
pnpm web wrangler:dev # cloudflare workers dev 模式
pnpm web wrangler:deploy # cloudflare workers 部署命令
```

## 🚀 快速搭建私有服务

### 📦 方式 1. 使用 npm cli

通过我们的 npm cli 你可以轻易搭建属于自己的微信 Markdown 编辑器。

```sh
# 安装
npm i -g @doocs/md-cli

# 启动
md-cli

# 访问
open http://127.0.0.1:8800

# 启动并指定端口
md-cli port=8899

# 访问
open http://127.0.0.1:8899
```

md-cli 支持以下命令行参数：

- `port` 指定端口号，默认 8800，如果被占用会随机使用一个新端口。
- `spaceId` dcloud 服务空间配置
- `clientSecret` dcloud 服务空间配置

### 🐳 方式 2. 使用 Docker 镜像

如果你是 Docker 用户，也可以直接使用一条命令，启动**完全属于你的、私有化运行的实例**。

```sh
docker run -d -p 8080:80 doocs/md:latest
```

容器运行起来之后，打开浏览器，访问 http://localhost:8080 即可。

关于本项目 Docker 镜像的更多详细信息，可以关注 https://github.com/doocs/docker-md

## 👥 谁在使用

请查看 [📋 USERS.md](USERS.md) 文件，了解使用本项目的公众号。

## 🤝 贡献指南

我们欢迎任何形式的贡献！请查看 [📖 CONTRIBUTING.md](./CONTRIBUTING.md) 获取提交 PR、Issue 的流程与规范。

## ☕ 支持我们

如果本项目对你有所帮助，可以通过以下方式支持我们的持续开发。

<table style="margin: 0 auto">
  <tbody>
    <tr>
      <td align="center" style="width: 260px">
        <img
          src="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/support1.jpg"
          alt="support1"
          style="width: 200px"
        /><br />
      </td>
      <td align="center" style="width: 260px">
        <img
          src="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/support2.jpg"
          alt="support2"
          style="width: 200px"
        /><br />
      </td>
    </tr>
  </tbody>
</table>

## 💬 反馈与交流

如果你在使用过程中遇到问题，或者有好的建议，欢迎在 [🐛 Issues](https://github.com/doocs/md/issues) 中反馈。你也可以加入我们的交流群，和我们一起讨论，若群二维码失效，请添加好友，备注 `md`，我们会拉你进群。

<table style="margin: 0 auto">
  <tbody>
    <tr>
      <td align="center" style="width: 260px">
        <img
          src="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/doocs-md-wechat-group.jpg"
          alt="doocs-md-wechat-group"
          style="width: 200px"
        /><br />
      </td>
      <td align="center" style="width: 260px">
        <img
          src="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/wechat-ylb.jpg"
          alt="wechat-ylb"
          style="width: 200px"
        /><br />
      </td>
    </tr>
  </tbody>
</table>
