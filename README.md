<div align="center">

[![doocs-md](./public/assets/images/logo-2.png)](https://github.com/doocs/md)

</div>

<h1 align="center">微信 Markdown 编辑器</h1>

<div align="center">

[![sync status](https://github.com/doocs/md/workflows/Sync/badge.svg)](https://github.com/doocs/md/actions) [![deploy status](https://github.com/doocs/md/workflows/Build%20and%20Deploy/badge.svg)](https://github.com/doocs/md/actions) [![prettier status](https://github.com/doocs/md/workflows/Prettier/badge.svg)](https://github.com/doocs/md/actions) [![users](https://badgen.net/badge/Who's/using/green)](../../issues) [![PRs Welcome](https://badgen.net/badge/PRs/welcome/green)](../../pulls)<br> [![github](https://badgen.net/badge/⭐/GitHub/blue)](https://github.com/doocs/md) [![gitee](https://badgen.net/badge/⭐/Gitee/blue)](https://gitee.com/doocs/md) [![license](https://badgen.net/github/license/doocs/md)](./LICENSE) [![release](https://img.shields.io/github/v/release/doocs/md.svg)](../../releases)

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

欢迎各位朋友随时提交 PR，让这款微信 Markdown 编辑器变得更好！如果你有新的想法，也欢迎在 Issues 区反馈。

## 功能特性

- [x] 支持自定义 CSS 样式
- [x] 支持 Markdown 所有基础语法
- [x] 支持浅色、暗黑两种主题模式
- [x] 支持 <kbd>Ctrl</kbd> + <kbd>F</kbd> 快速格式化文档
- [x] 支持色盘取色，快速替换文章整体色调
- [x] 支持多图上传，可自定义配置图床
- [x] 支持在编辑框右键弹出功能选项卡

## 目前支持哪些图床

| #   | 图床        | 使用时是否需要配置                                                 | 备注                                                                                                                   |
| --- | ----------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | 默认图床    | 否                                                                 | -                                                                                                                      |
| 2   | GitHub 图床 | 配置 `Repo`、`Token` 参数                                          | [如何获取 GitHub token？](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) |
| 3   | Gitee 图床  | 配置 `Repo`、`Token` 参数                                          | 不支持上传超过 1MB 的图片                                                                                              |
| 4   | 阿里云 OSS  | 配置 `AccessKey ID`、`AccessKey Secret`、`Bucket`、`Region` 等参数 | [如何使用阿里云 OSS？](https://help.aliyun.com/document_detail/31883.html)                                             |
| 5   | 腾讯云 COS  | 配置 `SecretId`、`SecretKey`、`Bucket`、`Region` 等参数            | [如何使用腾讯云 COS？](https://cloud.tencent.com/document/product/436/38484)                                           |
| 6   | 七牛云 Kodo | 配置 `AccessKey`、`SecretKey`、`Bucket`、`Domain`、`Region` 等参数 | [如何使用七牛云 Kodo？](https://developer.qiniu.com/kodo)                                                              |

![select-and-change-color-theme](./public/assets/images/select-and-change-color-theme.gif)

![copy-and-paste](./public/assets/images/copy-and-paste.gif)

![custom](./public/assets/images/custom.gif)

![doocs-md-upload-image](./public/assets/images/doocs-md-upload-image.gif)

## 谁在使用

<table>
  <tr>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/RNKDCK2KoyeuMeEs6GUrow">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/0-Doocs%E5%BC%80%E6%BA%90%E7%A4%BE%E5%8C%BA.png" style="width: 40px;"><br>
        <sub>Doocs开源社区</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/FpGIX9viQR6Z9iSCEPH86g">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/1-%E6%8E%98%E5%A2%93%E4%BA%BA%E7%9A%84%E5%B0%8F%E9%93%B2%E5%AD%90.jpg" style="width: 40px;"><br>
        <sub>掘墓人的小铲子</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/yB3ZH3jmcF_LbzuKmnR9BQ">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/2-%E5%85%A8%E7%BD%91%E9%87%8D%E7%82%B9.png" style="width: 40px;"><br>
        <sub>全网重点</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/oc5Z2t9ykbu_Dezjnw5mfQ">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/3-%E7%88%B1%E7%A0%81%E5%A3%AB%E7%9A%84%E5%86%85%E5%BF%83%E7%8B%AC%E7%99%BD.png" style="width: 40px;"><br>
        <sub>爱码士的内心独白</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/SFde8OsZ8FzNGMHwpmDtrg">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/4-%E4%B9%90%E7%8E%A9nodejsnpm%E5%B7%A5%E5%85%B7%E5%BA%93.jpg" style="width: 40px;"><br>
        <sub>乐玩nodejs npm工具库</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/7UG24ZugfI5ZnhUpo8vfvQ">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/5-%E7%AE%80%E9%9D%99%E6%85%A2.jpg" style="width: 40px;"><br>
        <sub>简静慢</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/qefHCmToAdowBz2JwBn_ug">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/6-0%E5%8A%A01.jpg" style="width: 40px;"><br>
        <sub>0加1</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/7bfpKACg7HP-PhBrkpM9IQ">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/14-%E7%BC%96%E7%A8%8B%E5%9B%BE%E8%A7%A3.png" style="width: 40px;"><br>
        <sub>编程图解</sub>
      </a>
    </td>
  </tr>
  <tr>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/bnlWqzCarDlR4F27HHXNUg">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/7-%E7%A0%81%E4%BA%91Gitee.jpg" style="width: 40px;"><br>
        <sub>码云Gitee</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/CVqmcu_OGG8TQO4FViAQ3w">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/8-%E5%A5%BD%E9%85%B8%E4%B8%80%E6%9F%A0%E6%AA%AC.jpg" style="width: 40px;"><br>
        <sub>好酸一柠檬</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/leDCdpvnfk8eZRPRRHwg5w">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/9-%E4%B8%8D%E7%9F%A5%E6%89%80%E4%BA%91Hub.png" style="width: 40px;"><br>
        <sub>不知所云Hub</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/c9ZXxQHCrKz1FP1Zbh1S1w">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/10-%E4%BC%9A%E6%B3%BD%E7%99%BE%E5%AE%B6.jpg" style="width: 40px;"><br>
        <sub>会泽百家</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/MV8ch6qlSsamSaBOhWr9kg">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/11-%E5%B9%B3%E5%87%A1%E8%80%8C%E8%AF%97%E6%84%8F.jpg" style="width: 40px;"><br>
        <sub>平凡而诗意</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/bWPKO-S3TNLsCgzwspHCTg">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/12-%E6%B2%BB%E6%81%92%E8%AF%B4%E8%AF%B4.jpg" style="width: 40px;"><br>
        <sub>治恒说说</sub>
      </a>
    </td>
    <td align="center" style="width: 60px;">
      <a href="https://mp.weixin.qq.com/s/AHHrxu7aIYBpvn3PpVHE_Q">
        <img src="https://gitee.com/yanglbme/resource/raw/master/doocs-md/13-%E6%9F%AF%E5%AE%81%E7%94%B3%E7%9A%84%E5%8F%99%E4%BA%8B%E5%B1%8B.jpg" style="width: 40px;"><br>
        <sub>柯宁申的叙事屋</sub>
      </a>
    </td>
  </tr>
</table>

注：如果你使用了本 Markdown 编辑器进行文章排版，并且希望在本项目 README 中展示你的公众号，请到 [#5](https://github.com/doocs/md/issues/5) 留言。

## 项目许可证

[本项目没有任何限制，Just Do What The F\*ck You Want。](LICENSE)

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
