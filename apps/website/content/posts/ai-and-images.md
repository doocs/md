---
title: AI 辅助写作与文章配图
summary: 润色、翻译、总结或续写，将结果插入正文；生成图片后及时下载或转存。
author: MD 文档
category: tutorial
date: 2026-10-31
cover: /images/ai-light.webp
coverAlt: MD 实际 AI 对话窗口中的润色、翻译和总结入口
sources:
  - https://github.com/doocs/md/tree/main/apps/web/src/components/ai
  - https://github.com/doocs/md/blob/main/docs/custom-upload.md
---

MD 提供文本辅助、对话和图片生成入口。AI 结果需要由作者检查，再用于文章。

## 处理文字

文本辅助可以用于润色、总结、纠错、翻译、扩写、续写和自定义指令。也可以在对话中引用文章内容，再将需要的结果插入正文。

![MD 实际 AI 对话窗口](/images/ai-light.webp)

## 选择服务与模型

编辑器包含默认 AI 服务配置，可用性和额度取决于服务端。自选服务通常需要配置 API 地址、模型与密钥，费用由对应服务提供方决定。

本地或自部署场景中，AI 是否可用同样取决于相关服务配置。不要把默认入口理解为无限额度承诺。

## 生成和插入图片

生成图片后，可以下载到本地或插入文章。图片地址可能存在有效期，准备发布或长期保存时，应及时下载或转存到自己的图床。

## 上传与压缩

图片支持粘贴、拖放、本地文件上传和远程转存，也可开启压缩。默认图床可直接使用；GitHub、阿里云 OSS、腾讯云 COS、七牛、MinIO、S3、R2 等第三方图床需要各自的配置。

上传前确认所选图床和代理可用。AI、图床的密钥不会随云端偏好同步；更换设备时需要分别配置。
