<div align="center">

[![doocs-md](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/logo-2.png)](https://github.com/doocs/md)

</div>

<h1 align="center">微信 Markdown 编辑器</h1>

<div align="center">

[![status](https://img.shields.io/github/actions/workflow/status/doocs/md/deploy.yml?style=flat-square&labelColor=564341&color=42cc23)](https://github.com/doocs/md/actions) [![node](https://img.shields.io/badge/node-%3E%3D20-42cc23?style=flat-square&labelColor=564341)](https://nodejs.org/en/about/previous-releases) [![pr](https://img.shields.io/badge/prs-welcome-42cc23?style=flat-square&labelColor=564341)](https://github.com/doocs/md/pulls) [![stars](https://img.shields.io/github/stars/doocs/md?style=flat-square&labelColor=564341&color=42cc23)](https://github.com/doocs/md/stargazers) [![forks](https://img.shields.io/github/forks/doocs/md?style=flat-square&labelColor=564341&color=42cc23)](https://github.com/doocs/md)<br> [![release](https://img.shields.io/github/v/release/doocs/md?style=flat-square&labelColor=564341&color=42cc23)](https://github.com/doocs/md/releases) [![npm](https://img.shields.io/npm/v/@doocs/md-cli?style=flat-square&labelColor=564341&color=42cc23)](https://www.npmjs.com/package/@doocs/md-cli) [![docker](https://img.shields.io/badge/docker-latest-42cc23?style=flat-square&labelColor=564341)](https://hub.docker.com/r/doocs/md)

</div>

## 项目介绍

Markdown 文档自动即时渲染为微信图文，让你不再为微信内容排版而发愁！只要你会基本的 Markdown 语法，就能做出一篇样式简洁而又美观大方的微信图文。

欢迎给项目点个 ⭐️，我们会持续更新和维护。

## 在线编辑器地址

[https://md.doocs.org](https://md.doocs.org)

注：推荐使用 Chrome 浏览器，效果最佳。

## 为何开发这款编辑器

现有的开源微信 Markdown 编辑器样式繁杂，排版过程中往往需要额外调整，影响使用效率。为了解决这一问题，我们打造了一款更加简洁、优雅的编辑器，提供更流畅的排版体验。

欢迎各位朋友随时提交 PR，让这款微信 Markdown 编辑器变得更好！如果你有新的想法，也欢迎在 [Discussions 讨论区](https://github.com/doocs/md/discussions)反馈。

注：我们项目最新版本基于 Vue3 开发，基于 Vue2 的旧版本已经不再维护，如果你需要 Vue2 版本，请切换到 [1.x](https://github.com/doocs/md/tree/1.x) 分支。

## 功能特性

- [x] 支持 Markdown 所有基础语法、数学公式
- [x] 提供对 Mermaid 图表的渲染和 [GFM 警告块](https://github.com/orgs/community/discussions/16925)的支持
- [x] 丰富的代码块高亮主题，提升代码可读性
- [x] 允许自定义主题色和 CSS 样式，灵活定制展示效果
- [x] 提供多图上传功能，并可自定义配置图床
- [x] 便捷的文件导入、导出功能，提升工作效率
- [x] 内置本地内容管理功能，支持草稿自动保存
- [x] 集成主流 AI 模型（如 DeekSeek、OpenAI、通义千问、腾讯混元、火山方舟 等等），辅助内容创作

## 目前支持哪些图床

| #   | 图床                                                   | 使用时是否需要配置                                                         | 备注                                                                                                                   |
| --- | ------------------------------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | 默认                                                   | 否                                                                         | -                                                                                                                      |
| 2   | [GitHub](https://github.com)                           | 配置 `Repo`、`Token` 参数                                                  | [如何获取 GitHub token？](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) |
| 3   | [阿里云](https://www.aliyun.com/product/oss)           | 配置 `AccessKey ID`、`AccessKey Secret`、`Bucket`、`Region` 参数           | [如何使用阿里云 OSS？](https://help.aliyun.com/document_detail/31883.html)                                             |
| 4   | [腾讯云](https://cloud.tencent.com/act/pro/cos)        | 配置 `SecretId`、`SecretKey`、`Bucket`、`Region` 参数                      | [如何使用腾讯云 COS？](https://cloud.tencent.com/document/product/436/38484)                                           |
| 5   | [七牛云](https://www.qiniu.com/products/kodo)          | 配置 `AccessKey`、`SecretKey`、`Bucket`、`Domain`、`Region` 参数           | [如何使用七牛云 Kodo？](https://developer.qiniu.com/kodo)                                                              |
| 6   | [MinIO](https://min.io/)                               | 配置 `Endpoint`、`Port`、`UseSSL`、`Bucket`、`AccessKey`、`SecretKey` 参数 | [如何使用 MinIO？](http://docs.minio.org.cn/docs/master/)                                                              |
| 7   | [公众号](https://mp.weixin.qq.com/)                    | 配置 `appID`、`appsecret`、`代理域名` 参数                                 | [如何使用公众号图床？](https://md-pages.doocs.org/tutorial)                                                            |
| 8   | [Cloudflare R2](https://developers.cloudflare.com/r2/) | 配置 `AccountId`、`AccessKey`、`SecretKey`、`Bucket`、`Domain` 参数        | [如何使用 S3 API 操作 R2？](https://developers.cloudflare.com/r2/api/s3/api/)                                          |
| 9   | [又拍云](https://www.upyun.com/)                       | 配置 `Bucket`、`Operator`、`Password`、`Domain` 参数                       | [如何使用 又拍云](https://help.upyun.com/)                                                                             |
| 10  | 自定义上传                                             | 是                                                                         | [如何自定义上传？](#自定义上传逻辑)                                                                                    |

![demo1](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo1.gif)

![demo2](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo2.gif)

![demo3](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo3.gif)

![demo4](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo4.gif)

## 注意事项

1. 如果你使用了某些浏览器脚本修改了网页背景色，可能导致渲染后的内容出现背景色分块的现象，详见 [#63](https://github.com/doocs/md/issues/63)。
2. 某些浏览器插件，会对内容样式造成破坏。现象是：复制粘贴到公众号后台内容，点击保存时，样式丢失，详见 [#151](https://github.com/doocs/md/issues/151)。

## 自定义上传逻辑

在工具上没有提供预定义图床的情况下，你只需要自定义上传逻辑即可，这对于例如你不方便使用公共图床，而是使用自己的上传服务时非常有用。

你只需要在给定的函数中更改上传代码即可，为了方便，这个函数提供了可能使用的一些参数：

示例代码：

```js
const { file, util, okCb, errCb } = CUSTOM_ARG
const param = new FormData()
param.append(`file`, file)
util.axios
  .post(`http://127.0.0.1:9000/upload`, param, {
    headers: { 'Content-Type': `multipart/form-data` },
  })
  .then((res) => {
    okCb(res.url)
  })
  .catch((err) => {
    errCb(err)
  })

// 提供的可用参数:
// CUSTOM_ARG = {
//   content, // 待上传图片的 base64
//   file, // 待上传图片的 file 对象
//   util: {
//     axios, // axios 实例
//     CryptoJS, // 加密库
//     OSS, // tiny-oss
//     COS, // cos-js-sdk-v5
//     Buffer, // buffer-from
//     uuidv4, // uuid
//     qiniu, // qiniu-js
//     tokenTools, // 一些编码转换函数
//     getDir, // 获取 年/月/日 形式的目录
//     getDateFilename, // 根据文件名获取它以 时间戳+uuid 的形式
//   },
//   okCb: resolve, // 重要！上传成功后给此回调传 url 即可
//   errCb: reject, // 上传失败调用的函数
// }
```

如果你创建了适用于其他第三方图床的上传代码，我们非常欢迎你分享它。

## 如何开发和部署

```sh
# 安装 node 版本
nvm i && nvm use

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

关于本项目 Docker 镜像的更多详细信息，可以关注 https://github.com/doocs/docker-md

## 谁在使用

请查看 [USERS.md](USERS.md) 文件，了解使用本项目的公众号。

## 支持我们

如果本项目对你有所帮助，可以通过以下方式支持我们：

<table style="margin: 0 auto">
  <tbody>
    <tr>
      <td align="center" style="width: 260px">
        <img
          src="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/support1.jpg"
          style="width: 200px"
        /><br />
      </td>
      <td align="center" style="width: 260px">
        <img
          src="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/support2.jpg"
          style="width: 200px"
        /><br />
      </td>
    </tr>
  </tbody>
</table>
