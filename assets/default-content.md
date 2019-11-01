## 文章编辑示例

### 简介
一款自动将 Markdown 文章自动渲染成微信公众号文章样式的工具。

### 功能
- 支持序号列表和圆点列表，解决了样式会被重置的问题
- 外链会自动转换为参考文献索引，并且附在文章末尾
- 支持多种字体和样式
- 支持日语注音假名、汉语拼音样式
- 支持不同于微信的代码配色方案
- 支持编辑内容自动保存、预览同步滚动等常见功能

### 关于 Markdown
1. Markdown 是一种轻量级标记语言，能将文本换成有效的 XHTML(或者HTML) 文档
2. Markdown 强大之处，在于可以用一套格式，在所有支持 Markdown 的编辑器中转换成发布样式，做到最大化兼容，不需要担心复制到不同编辑器中样式被破坏
3. 正如你右侧看到的这样，Markdown 被转换成了微信支持的样式，同样你可以在一字不改的情况下，在 Github 等平台上转换类似的样式
4. 学习 Markdown 的语法，可以查看 [Markdown 语法入门手册](https://www.w3cschool.cn/markdownyfsm/markdownyfsm-odm6256r.html)

### 图片
```
![desc](img_url)
```

### 代码块
```java
public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}
```

### 内联代码
inline code `{code: 0}`

### 表格
| Header 1 | Header 2 |
| --- | --- |
| Key 1 | Value 1 |
| Key 2 | Value 2 |
| Key 3 | Value 3 |

### 超链接
如果是公众号文章的超链接，是可以点击打开的，但其他链接都无法点击，所以这里使用类似于文献的底部引用。

例如：

- [2019 GitHub 开源贡献排行榜新鲜出炉！微软谷歌领头，阿里跻身前 12！](https://mp.weixin.qq.com/s/_q812aGD1b9QvZ2WFI0Qgw)
- [Google 搜索的即时自动补全功能究竟是如何“工作”的？](https://mp.weixin.qq.com/s/YlMISSc3Sn890BzTLytcLA)
- [厉害了，原来 Redisson 这么好用！](https://mp.weixin.qq.com/s/lpZ7eRdImy0MyTEVH68HYw)
- [一文带你搞懂 “缓存策略”](https://mp.weixin.qq.com/s/47A_iXY_nArURwUTPHr2IQ)
- [Java Getter/Setter “防坑指南”](https://mp.weixin.qq.com/s/TZqcAw7NTlcvU-p930-eHA)
- [太棒了，GitHub Review 代码能力小升级](https://mp.weixin.qq.com/s/Lok0epqn91Q51ygZo_FLkg)
- [巧用 Redis Hyperloglog，轻松统计 UV 数据](https://mp.weixin.qq.com/s/w1r-M6YVvQSfUtzO_xe44Q)
