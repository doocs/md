<div align="center">

[![doocs-md](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/logo-2.png)](https://github.com/doocs/md)

</div>

<h1 align="center">微信 Markdown 编辑器</h1>

<div align="center">

[![status](https://img.shields.io/github/actions/workflow/status/doocs/md/deploy.yml?style=flat-square&labelColor=564341&color=42cc23)](https://github.com/doocs/md/actions) [![node](https://img.shields.io/badge/node-%3E%3D22-42cc23?style=flat-square&labelColor=564341)](https://nodejs.org/en/about/previous-releases) [![pr](https://img.shields.io/badge/prs-welcome-42cc23?style=flat-square&labelColor=564341)](https://github.com/doocs/md/pulls) [![stars](https://img.shields.io/github/stars/doocs/md?style=flat-square&labelColor=564341&color=42cc23)](https://github.com/doocs/md/stargazers) [![forks](https://img.shields.io/github/forks/doocs/md?style=flat-square&labelColor=564341&color=42cc23)](https://github.com/doocs/md)<br> [![release](https://img.shields.io/github/v/release/doocs/md?style=flat-square&labelColor=564341&color=42cc23)](https://github.com/doocs/md/releases) [![npm](https://img.shields.io/npm/v/@doocs/md-cli?style=flat-square&labelColor=564341&color=42cc23)](https://www.npmjs.com/package/@doocs/md-cli) [![docker](https://img.shields.io/badge/docker-latest-42cc23?style=flat-square&labelColor=564341)](https://hub.docker.com/r/doocs/md)

</div>

中文 | [English](./README-EN.md)

## 项目介绍

**Markdown 文档自动即时渲染为微信图文**，让你不再为公众号排版发愁。只需掌握基本的 Markdown 语法，即可生成样式简洁、美观大方的微信图文。

如果这个项目对你有帮助，欢迎点个 Star ⭐️，我们会持续维护与迭代。

## 在线编辑器

[https://md.doocs.org](https://md.doocs.org)

> 推荐使用 Chrome 浏览器以获得最佳体验。

## 为何开发这款编辑器

现有的开源微信 Markdown 编辑器普遍存在样式繁杂、排版需反复调整的问题。本项目致力于提供一个更简洁、易用的编辑器，让内容创作者专注于写作本身，而非排版细节。

欢迎随时提交 PR 参与共建，也欢迎在 [Discussions](https://github.com/doocs/md/discussions) 中分享你的想法。

## 功能特性

- 支持标准 Markdown 语法及数学公式（KaTeX）
- 支持 Mermaid 图表、PlantUML、[GFM 警告块](https://github.com/orgs/community/discussions/16925)
- 支持 Ruby 注音扩展，格式兼容 `[文字]{注音}` 与 `[文字]^(注音)`
- 代码块提供多种高亮主题，可自定义主题色与 CSS 样式
- 内置本地草稿管理，支持内容自动保存
- 支持多种图床（GitHub、阿里云、腾讯云、七牛云、MinIO、S3、Cloudflare R2 等）
- 支持文件导入与导出
- 集成主流 AI 模型（DeepSeek、OpenAI、通义千问、腾讯混元、火山方舟、302.AI 等），辅助内容创作

## 支持的图床服务

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

## 产品演示

<div align="center">

|                                       主题切换                                        |                                       图片上传                                        |
| :-----------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: |
| ![demo1](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo1.gif) | ![demo2](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo2.gif) |

|                                       样式扩展                                        |                                       一键排版                                        |
| :-----------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: |
| ![demo3](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo3.gif) | ![demo4](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/demo4.gif) |

</div>

## 开发与部署

```sh
# 安装 Node 版本
nvm i && nvm use

# 安装依赖
pnpm i

# 启动开发模式，访问 http://localhost:5173/md/
pnpm web dev

# 构建，部署在 /md 路径下
pnpm web build

# 构建，部署在根路径下
pnpm web build:h5-netlify

# Chrome 扩展开发模式
# 启动后在 chrome://extensions/ 开启开发者模式，加载 apps/web/.output/chrome-mv3-dev 目录
pnpm web ext:dev

# 打包 Chrome 扩展
pnpm web ext:zip

# 打包 Firefox 扩展，输出至 apps/web/.output/md-{version}-firefox.zip
pnpm web firefox:zip

# 打包 uTools 插件，输出至 apps/utools/release/md-utools-v{version}.zip
pnpm utools:package

# Cloudflare Workers 开发与部署
pnpm web wrangler:dev
pnpm web wrangler:deploy
```

## 私有化部署

### 方式一：npm cli

```sh
# 全局安装
npm i -g @doocs/md-cli

# 启动（默认端口 8800）
md-cli

# 指定端口启动
md-cli port=8899
```

支持的命令行参数：

- `port`：监听端口，默认 `8800`，端口被占用时自动随机选取
- `spaceId`：dcloud 服务空间配置
- `clientSecret`：dcloud 服务空间配置

### 方式二：Docker

```sh
docker run -d -p 8080:80 doocs/md:latest
```

启动后访问 http://localhost:8080 即可。Docker 镜像的更多信息，请参考 https://github.com/doocs/docker-md

## 谁在使用

请查看 [USERS.md](USERS.md)，了解使用本项目的公众号列表。

## 参与贡献

欢迎提交 PR 或 Issue，请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解贡献流程与规范。

## 支持我们

如果本项目对你有所帮助，欢迎通过以下方式支持我们持续维护。

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

## 反馈与交流

使用中遇到问题或有功能建议，欢迎在 [Issues](https://github.com/doocs/md/issues) 中反馈。也可扫码加入微信交流群，若二维码失效，请添加好友并备注 `md`。

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
