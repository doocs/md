<div align="center">

[![doocs-md](https://cdn.jsdelivr.net/gh/doocs/md/public/assets/images/logo-2.png)](https://github.com/doocs/md)

</div>

<h1 align="center">微信 Markdown 编辑器</h1>

<div align="center">

[![sync status](https://github.com/doocs/md/workflows/Sync/badge.svg)](https://github.com/doocs/md/actions) [![deploy status](https://github.com/doocs/md/workflows/Build%20and%20Deploy/badge.svg)](https://github.com/doocs/md/actions) [![prettier status](https://github.com/doocs/md/workflows/Prettier/badge.svg)](https://github.com/doocs/md/actions) [![users](https://badgen.net/badge/Who's/using/green)](#谁在使用) [![PRs Welcome](https://badgen.net/badge/PRs/welcome/green)](../../pulls)<br> [![github](https://badgen.net/badge/⭐/GitHub/blue)](https://github.com/doocs/md) [![gitee](https://badgen.net/badge/⭐/Gitee/blue)](https://gitee.com/doocs/md) [![license](https://badgen.net/github/license/doocs/md)](./LICENSE) [![release](https://img.shields.io/github/v/release/doocs/md.svg)](../../releases)

</div>

## 项目介绍

> 本项目基于 [wechat-format](https://github.com/lyricat/wechat-format) 进行二次开发，感谢 [lyricat](https://github.com/lyricat) 的创意和贡献！

Markdown 文档自动即时渲染为微信图文，让你不再为微信文章排版而发愁！只要你会基本的 Markdown 语法，就能做出一篇样式简洁而又美观大方的微信图文。

## 在线编辑器地址

- Netlify: https://mdhere.netlify.app
- Gitee Pages：https://doocs.gitee.io/md
- GitHub Pages：https://doocs.github.io/md

注：推荐使用 Chrome 浏览器，效果最佳。另外，对于国内（中国）的朋友，访问 [Gitee Pages](https://doocs.gitee.io/md) 速度会相对快一些。

## 为何二次开发

现有的开源微信 Markdown 编辑器，样式繁杂，也不符合我个人的审美需求。在我使用它们进行文章排版的时候，经常还要自己做一些改动，费时费力，因此动手做了二次开发。

欢迎各位朋友随时提交 PR，让这款微信 Markdown 编辑器变得更好！如果你有新的想法，也欢迎在 [Discussions 讨论区](https://github.com/doocs/md/discussions)反馈。

## 如何开发和部署
``` sh
# 安装依赖
npm i

# 启动开发模式
npm run serve

# 输出部署版本
npm run build
```

## 测试
``` sh
# 启动接口服务
npm run mm

# 编译到 dist/md
npm run build
# 访问 http://127.0.0.1:9000/md

# 编译到 dist
npm run build:h5-netlify
# 访问 http://127.0.0.1:9000/
```

## 功能特性

- [x] 支持自定义 CSS 样式
- [x] 支持 Markdown 所有基础语法
- [x] 支持浅色、暗黑两种主题模式
- [x] 支持 <kbd>Ctrl</kbd> + <kbd>F</kbd> 快速格式化文档
- [x] 支持色盘取色，快速替换文章整体色调
- [x] 支持多图上传，可自定义配置图床
- [x] 支持在编辑框右键弹出功能选项卡

## 目前支持哪些图床

| #   | 图床                                            | 使用时是否需要配置                                               | 备注                                                                                                                   |
| --- | ----------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | 默认                                            | 否                                                               | -                                                                                                                      |
| 2   | [Gitee](https://gitee.com)                      | 配置 `Repo`、`Token` 参数                                        | 图片超过 1MB 无法正常展示                                                                                              |
| 3   | [GitHub](https://github.com)                    | 配置 `Repo`、`Token` 参数                                        | [如何获取 GitHub token？](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) |
| 4   | [阿里云](https://www.aliyun.com/product/oss)    | 配置 `AccessKey ID`、`AccessKey Secret`、`Bucket`、`Region` 参数 | [如何使用阿里云 OSS？](https://help.aliyun.com/document_detail/31883.html)                                             |
| 5   | [腾讯云](https://cloud.tencent.com/act/pro/cos) | 配置 `SecretId`、`SecretKey`、`Bucket`、`Region` 参数            | [如何使用腾讯云 COS？](https://cloud.tencent.com/document/product/436/38484)                                           |
| 6   | [七牛云](https://www.qiniu.com/products/kodo)   | 配置 `AccessKey`、`SecretKey`、`Bucket`、`Domain`、`Region` 参数 | [如何使用七牛云 Kodo？](https://developer.qiniu.com/kodo)                                                              |

![select-and-change-color-theme](https://doocs.oss-cn-shenzhen.aliyuncs.com/img//1606034542281-a8c99fa7-c11e-4e43-98da-e36012f54dc8.gif)

![copy-and-paste](https://doocs.oss-cn-shenzhen.aliyuncs.com/img//1606034542372-59707c83-2caf-4a96-9bb6-c4effaecf731.gif)

![custom](https://doocs.oss-cn-shenzhen.aliyuncs.com/img//1606034542180-4d1c48b1-75f6-4794-95f7-e3b877c2b6a2.gif)

![doocs-md-upload-image](https://doocs.oss-cn-shenzhen.aliyuncs.com/img//1606034542512-0769a336-b9eb-4d58-83c1-29db7b54f71b.gif)

## 注意事项

如果你使用了某些浏览器脚本修改了网页背景色，可能导致渲染后的文章出现背景色分块的现象，详见 [#63](https://github.com/doocs/md/issues/63)。

## 谁在使用

<table>
  <tr>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/RNKDCK2KoyeuMeEs6GUrow">
        <img src="https://cdn.jsdelivr.net/gh/filess/img12@main/2021/05/30/1622376190215-de85712d-d167-4adf-98c8-44f4540b3b5a.png" style="width: 40px;"><br>
        <sub>Doocs开源社区</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/FpGIX9viQR6Z9iSCEPH86g">
        <img src="https://cdn.jsdelivr.net/gh/filess/img17@main/2021/05/30/1622376213480-29314621-97bb-4129-9636-1d5eb955cf67.jpg" style="width: 40px;"><br>
        <sub>掘墓人的小铲子</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/yB3ZH3jmcF_LbzuKmnR9BQ">
        <img src="https://cdn.jsdelivr.net/gh/filess/img5@main/2021/05/30/1622376230945-7f633309-64c9-4d30-a6e9-46246b891f81.png" style="width: 40px;"><br>
        <sub>全网重点</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/oc5Z2t9ykbu_Dezjnw5mfQ">
        <img src="https://cdn.jsdelivr.net/gh/filess/img7@main/2021/05/30/1622376248105-64954bc0-c016-494d-a6bc-e22862ca9903.png" style="width: 40px;"><br>
        <sub>爱码士的内心独白</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/SFde8OsZ8FzNGMHwpmDtrg">
        <img src="https://cdn.jsdelivr.net/gh/filess/img9@main/2021/05/30/1622376309125-2056ab90-48bf-472a-9662-84b8041eace3.jpg" style="width: 40px;"><br>
        <sub>乐玩nodejs npm工具库</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/7UG24ZugfI5ZnhUpo8vfvQ">
        <img src="https://cdn.jsdelivr.net/gh/filess/img17@main/2021/05/30/1622376325266-0974cef0-2599-47c2-a808-5e05f12f6968.jpg" style="width: 40px;"><br>
        <sub>简静慢</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/qefHCmToAdowBz2JwBn_ug">
        <img src="https://cdn.jsdelivr.net/gh/filess/img15@main/2021/05/30/1622376339100-62825d0c-c189-4c9b-8961-af04dcbceed6.jpg" style="width: 40px;"><br>
        <sub>0加1</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/7bfpKACg7HP-PhBrkpM9IQ">
        <img src="https://cdn.jsdelivr.net/gh/filess/img0@main/2021/05/30/1622376358002-7950cb87-bb47-48ea-a6bb-2f47bb612a27.png" style="width: 40px;"><br>
        <sub>编程图解</sub>
      </a>
    </td>
  </tr>
  <tr>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/bnlWqzCarDlR4F27HHXNUg">
        <img src="https://cdn.jsdelivr.net/gh/filess/img6@main/2021/05/30/1622376372458-db221d88-b014-4331-98a5-47bc06055b1a.jpg" style="width: 40px;"><br>
        <sub>码云Gitee</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/CVqmcu_OGG8TQO4FViAQ3w">
        <img src="https://cdn.jsdelivr.net/gh/filess/img10@main/2021/05/30/1622376386410-6c603364-5660-42ad-8360-59ced1af49ac.jpg" style="width: 40px;"><br>
        <sub>好酸一柠檬</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/leDCdpvnfk8eZRPRRHwg5w">
        <img src="https://cdn.jsdelivr.net/gh/filess/img9@main/2021/05/30/1622376400386-b7409a18-cfd3-4490-a4b1-f3a38d7cc0ea.png" style="width: 40px;"><br>
        <sub>不知所云Hub</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/c9ZXxQHCrKz1FP1Zbh1S1w">
        <img src="https://cdn.jsdelivr.net/gh/filess/img15@main/2021/05/30/1622376417767-e56e3700-3d69-434b-8711-e432568c4cd7.jpg" style="width: 40px;"><br>
        <sub>会泽百家</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/MV8ch6qlSsamSaBOhWr9kg">
        <img src="https://cdn.jsdelivr.net/gh/filess/img2@main/2021/05/30/1622376434055-690c88cd-6155-470e-a2e1-7ad765443bd1.jpg" style="width: 40px;"><br>
        <sub>平凡而诗意</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/bWPKO-S3TNLsCgzwspHCTg">
        <img src="https://cdn.jsdelivr.net/gh/filess/img3@main/2021/05/30/1622376446363-4ab382c8-58e8-4b76-a4c2-a02855d13bc4.jpg" style="width: 40px;"><br>
        <sub>治恒说说</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/AHHrxu7aIYBpvn3PpVHE_Q">
        <img src="https://cdn.jsdelivr.net/gh/filess/img6@main/2021/05/30/1622376461115-5c402ef3-54d2-437b-b89e-8c815342f03b.jpg" style="width: 40px;"><br>
        <sub>柯宁申的叙事屋</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/6BO977YG5e_4qYxL4oVQJw">
        <img src="https://cdn.jsdelivr.net/gh/filess/img4@main/2021/05/30/1622376477265-591e7c45-5ed1-4557-9ff5-c4744a888319.jpg" style="width: 40px;"><br>
        <sub>我的 Beta 世界</sub>
      </a>
    </td>
  </tr>
  <tr>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/udU2ZICg60HbspgWTQdYpg">
        <img src="https://cdn.jsdelivr.net/gh/filess/img2@main/2021/08/22/1629604090568-c1b0d718-a0ca-4b25-983d-73591bbc5556.png" style="width: 40px;"><br>
        <sub>ApachePulsar</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/fqNxIRxTkn6QEPmi4atW9w">
        <img src="https://cdn.jsdelivr.net/gh/filess/img17@main/2021/05/30/1622376563848-671dbd2e-7b86-460a-b2c4-e2a1e0c5a92d.jpg" style="width: 40px;"><br>
        <sub>生化环材</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/VUlOBFA93eiqZ5ZYGmXzmQ">
        <img src="https://cdn.jsdelivr.net/gh/filess/img7@main/2021/05/30/1622376717389-3a6a7a2d-9903-4aa8-9fd7-08ef28b6cbc3.jpg" style="width: 40px;"><br>
        <sub>秀宇笔记</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/UU3cH8LvpO_3aeAkkYvZZQ">
        <img src="https://cdn.jsdelivr.net/gh/filess/img4@main/2021/08/22/1629605202587-a69e9e86-5078-4faf-8de1-1f273ee0421d.jpg" style="width: 40px;"><br>
        <sub>IT王小二</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/49wUuhOEYG-OZPbFc6_NrQ">
        <img src="https://cdn.jsdelivr.net/gh/filess/img13@main/2021/08/22/1629605348059-33be5c96-3a99-43cf-bf49-e0d2a79e3b53.jpg" style="width: 40px;"><br>
        <sub>小二来碗饭</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/YDUZ0t_spzeqXiE_Idv3OA">
        <img src="https://cdn.jsdelivr.net/gh/filess/img6@main/2021/08/22/1629605468074-9e37a662-29b7-409c-a295-2420e9e82ff2.jpg" style="width: 40px;"><br>
        <sub>青年技术宅</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/oinGHCmer1vNE6Hg2OsH1g">
        <img src="https://cdn.jsdelivr.net/gh/filess/img6@main/2021/08/22/1629605628076-2f06908d-ccdb-44ad-ab2e-06645534dbbc.jpg" style="width: 40px;"><br>
        <sub>路引科研</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/ap_JhwgmfxgqFAIcTF3nKQ">
        <img src="https://cdn.jsdelivr.net/gh/filess/img8@main/2021/08/22/1629605991393-9a362483-60ff-4b36-ad4c-901c33d743a4.jpg" style="width: 40px;"><br>
        <sub>凯文有事找你</sub>
      </a>
    </td>
  </tr>
  <tr>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/itkJtMY-1IkZjIn5fWtShw">
        <img src="https://cdn.jsdelivr.net/gh/filess/img16@main/2021/09/01/1630509994812-dea5c24f-fdca-42e0-b6cf-adab8f5ed889.jpg" style="width: 40px;"><br>
        <sub>软件部落库</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/_44Ya309DeQzemXLnJUNdQ">
        <img src="https://cdn.jsdelivr.net/gh/filess/img4@main/2021/09/18/1631947087260-320f3919-f9fa-4c25-8fc1-5020b892f338.jpg" style="width: 40px;"><br>
        <sub>网文小密圈</sub>
      </a>
    </td>
  </tr>
</table>

注：如果你使用了本 Markdown 编辑器进行文章排版，并且希望在本项目 README 中展示你的公众号，请到 [#5](https://github.com/doocs/md/discussions/5) 留言。

## 项目许可证

[本项目没有任何限制，Just Do What The F\*ck You Want。](LICENSE)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdoocs%2Fmd.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdoocs%2Fmd?ref=badge_large)

---

## Doocs 社区优质项目

Doocs 技术社区，致力于打造一个内容完整、持续成长的互联网开发者学习生态圈！以下是 Doocs 旗下的一些优秀项目，欢迎各位开发者朋友持续保持关注。

| #   | 项目                                                              | 描述                                                                                             | 热度                                                                                                                            |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | [advanced-java](https://github.com/doocs/advanced-java)           | 互联网 Java 工程师进阶知识完全扫盲：涵盖高并发、分布式、高可用、微服务、海量数据处理等领域知识。 | ![](https://badgen.net/github/stars/doocs/advanced-java) <br>![](https://badgen.net/github/forks/doocs/advanced-java)           |
| 2   | [leetcode](https://github.com/doocs/leetcode)                     | 多种编程语言实现 LeetCode、《剑指 Offer（第 2 版）》、《程序员面试金典（第 6 版）》题解。        | ![](https://badgen.net/github/stars/doocs/leetcode) <br>![](https://badgen.net/github/forks/doocs/leetcode)                     |
| 3   | [source-code-hunter](https://github.com/doocs/source-code-hunter) | 互联网常用组件框架源码分析。                                                                     | ![](https://badgen.net/github/stars/doocs/source-code-hunter) <br>![](https://badgen.net/github/forks/doocs/source-code-hunter) |
| 4   | [jvm](https://github.com/doocs/jvm)                               | Java 虚拟机底层原理知识总结。                                                                    | ![](https://badgen.net/github/stars/doocs/jvm) <br>![](https://badgen.net/github/forks/doocs/jvm)                               |
| 5   | [coding-interview](https://github.com/doocs/coding-interview)     | 代码面试题集，包括《剑指 Offer》、《编程之美》等。                                               | ![](https://badgen.net/github/stars/doocs/coding-interview) <br>![](https://badgen.net/github/forks/doocs/coding-interview)     |
| 6   | [md](https://github.com/doocs/md)                                 | 一款高度简洁的微信 Markdown 编辑器。                                                             | ![](https://badgen.net/github/stars/doocs/md) <br>![](https://badgen.net/github/forks/doocs/md)                                 |
| 7   | [technical-books](https://github.com/doocs/technical-books)       | 值得一看的技术书籍列表。                                                                         | ![](https://badgen.net/github/stars/doocs/technical-books) <br>![](https://badgen.net/github/forks/doocs/technical-books)       |

## 贡献者

感谢以下所有朋友对 [Doocs 技术社区](https://github.com/doocs) 所做出的贡献，[参与项目维护请戳这儿](https://doocs.github.io/#/?id=how-to-join)。

<!-- ALL-CONTRIBUTORS-LIST: START - Do not remove or modify this section -->

<a href="https://opencollective.com/doocs/contributors.svg?width=890&button=true"><img src="https://opencollective.com/doocs/contributors.svg?width=890&button=false" /></a>

<!-- ALL-CONTRIBUTORS-LIST: END -->
