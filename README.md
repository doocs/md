<div align="center">

[![multipost-md](./src/assets/images/favicon.png)](https://github.com/leaper-one/multipost-wechat-markdown-editor)

</div>

# MultiPost - Markdown 编辑器

> 适配 MultiPost 文章同步助手

本项目基于 [doocs/md](https://github.com/doocs/md) 进行改造，特此感谢！

## 项目介绍

Markdown 文档自动即时渲染为微信图文，让你不再为微信内容排版而发愁！只要你会基本的 Markdown 语法，就能做出一篇样式简洁而又美观大方的微信图文。

结合 [MultiPost 浏览器扩展](https://github.com/leaper-one/MultiPost-Extension)，你可以将编辑好的文章一键同步发布到知乎、微博、小红书、抖音等多个主流内容平台，极大提升内容创作效率。

## 在线编辑器地址

- [https://md.multipost.app](https://md.multipost.app)

注：推荐使用 Chrome 浏览器，效果最佳。

## 功能特性

- [x] 支持 Markdown 所有基础语法、数学公式
- [x] 提供对 Mermaid 图表的渲染和 [GFM 警告块](https://github.com/orgs/community/discussions/16925)的支持
- [x] 丰富的代码块高亮主题，提升代码可读性
- [x] 允许自定义主题色和 CSS 样式，灵活定制展示效果
- [x] 提供多图上传功能，并可自定义配置图床
- [x] 便捷的文件导入、导出功能，提升工作效率
- [x] 内置本地内容管理功能，支持草稿自动保存
- [x] 通过 [MultiPost 扩展](https://github.com/leaper-one/MultiPost-Extension) 支持一键发布到知乎、微博、小红书等多个平台

## 如何开发和部署

```sh
# 安装依赖
npm i

# 启动开发模式
npm start

# 部署在 /md 目录
npm run build
# 访问 http://127.0.0.1:9000/md

# 部署在根目录
npm run build:h5-netlify
# 访问 http://127.0.0.1:9000/
```

## 快速搭建私有服务

### 方式 1. 使用 npm cli

通过我们的 npm cli 你可以轻易搭建属于自己的微信 Markdown 编辑器。

```sh
# 安装
npm i -g @doocs/md-cli

# 启动
md-cli

# 访问
open http://127.0.0.1:8800/md/

# 启动并指定端口
md-cli port=8899

# 访问
open http://127.0.0.1:8899/md/
```

md-cli 支持以下命令行参数：

- `port` 指定端口号，默认 8800，如果被占用会随机使用一个新端口。
- `spaceId` dcloud 服务空间配置
- `clientSecret` dcloud 服务空间配置

### 方式 2. 使用 Docker 镜像

如果你是 Docker 用户，也可以直接使用一条命令，启动完全属于你的、私有化运行的实例。

```sh
docker run -d -p 8080:80 doocs/md:latest
```

容器运行起来之后，打开浏览器，访问 http://localhost:8080 即可。
