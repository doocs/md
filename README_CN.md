# 微信 Markdown 编辑器
[![github](https://badgen.net/badge/⭐/GitHub/cyan)](https://github.com/yanglbme/wxmd-editor) [![gitee](https://badgen.net/badge/⭐/Gitee/cyan)](https://gitee.com/yanglbme/wxmd-editor) [![license](https://badgen.net/github/license/yanglbme/wxmd-editor)](./LICENSE)

本项目克隆自 https://github.com/zkqiang/wechat-mdeditor ，感谢 [zkqiang](https://github.com/zkqiang) 定义的基础 CSS 样式。

英文文档请看 [README](README.md)。

## 在线编辑器
- GitHub Page：https://yanglbme.github.io/wxmd-editor
- Gitee Page：https://yanglbme.gitee.io/wxmd-editor

注：对于国内（中国）的朋友，访问 Gitee Page 速度会相对快一些。

## 为什么要二次改造？
每个人的审美都不一样，我希望能在基础 CSS 样式的基础上进行改造，定义一款自己喜欢的微信 Markdown 编辑器。

## 如何扩展样式？
- 首先在 [`assets/scripts/themes/`](assets/scripts/themes/) 文件夹下添加一个 js 文件作为扩展的主题样式，如 `pink.js`，内容的格式与其他主题保持一致，let 变量命名为 `pinkTheme`。
- 然后在 [`assets/scripts/editor.js`](assets/scripts/editor.js) 中，找到变量 [`themeOption`](assets/scripts/editor.js#L29)，添加一个选项（建议将 author 设置为色值的十六进制），如：
  ```javascript
  themeOption: [
    { label: '橘红', value: 'orange', author: '#ff5f2e' },
    { label: '淡绿', value: 'lightgreen', author: '#42b983'},
    { label: '暗青', value: 'darkcyan', author: '#008b8b'},
    { label: '粉色', value: 'pink', author: '#ff1cae'},
  ],
  ```
  接着在下方的 [`styleThemes`](assets/scripts/editor.js#L34) 中添加 一个 pink 主题，如：
  ```javascript
  styleThemes: {
    orange: orangeTheme,
    lightgreen: lightgreenTheme,
    darkcyan: darkcyanTheme,
    pink: pinkTheme,
  },
  ```
- 最后在 [`index.html`](index.html#L131) 文件末尾引入 pink.js 文件，如：
  ```javascript
  <script src="assets/scripts/themes/orange.js"></script>
  <script src="assets/scripts/themes/lightgreen.js"></script>
  <script src="assets/scripts/themes/darkcyan.js"></script>
  <script src="assets/scripts/themes/pink.js"></script>
  ```

## 我的公众号
可以用微信扫码关注我的公众号“Doocs开源社区”，原创技术文章第一时间推送。

<div style="text-align:center;">
  <img src="./assets/images/qrcode.jpg" width="200px;"/>
</div>