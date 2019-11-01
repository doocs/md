# 公众号 Markdown 编辑器

### 简介

这款编辑器可以将 Markdown 转换成微信公众号编辑器的样式，只需将 MD 文档复制到左侧栏，再在右侧栏顶部"点击复制"，右侧预览内容就可被复制到公众号后台。

这让你在公众号创作时，把更多的时间专注于文章本身，而不是繁琐地调整文章样式。


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

## 更多样式

### 注音符号

[注音符号 W3C 定义](http://www.w3.org/TR/ruby/)。

支持日语注音假名、汉语拼音。

用法有以下几种：

* 世界{せかい}
* 小夜時雨{さ・よ・しぐれ}
* 食べる{たべる}
* 丧心病狂{gàn・de・piào・liang}

### 图片

接下来是一张图片。你可以用自己图床，也可以上传到微信媒体库再把图片 URL
粘贴回来，或者编辑好以后，在公众号里插入图片。

![这里可以写图片描述](https://static.zkqiang.cn/images/20191019181145.JPG-slim)

如果使用图床链接的话，有可能复制后图片不能被上传，需要手动在微信重新上传替换。

### 代码块

代码高亮使用了 Github 配色方案，后续会加入更多配色。

**注意：由于微信编辑器限制，复制后若在微信编辑器中点击代码块，会被微信自动重置后它的配色，只能重新再复制**

```cpp
#include <stdio.h>

const int MAX = 10;
int cache[MAX] = {0};

int fib(int x) {
  if (x == 1) return 1;
  if (x == 0) return 0;
  if (cache[x] == 0) {
    int ret = fib(x - 1) + fib(x - 2);
    cache[x] = ret;
  }
  return cache[x];
}

int main() {
    int i;
    printf("fibonacci series:\n");
    for (i = 0; i < MAX; ++i) {
        printf("%d ", fib(i));
    }
    return 0;
}
```

### 内联代码

inline code `{code: 0}`

### 表格

表格无法使用自定义样式，暂时没找到解决途径

| Header 1 | Header 2 |
| --- | --- |
| Key 1 | Value 1 |
| Key 2 | Value 2 |
| Key 3 | Value 3 |

### 超链接

如果是公众号文章的超链接，是可以点击打开的，但其他链接都无法点击，所以这里使用类似于文献的底部引用。

例如：

[这是一篇公众号文章](https://mp.weixin.qq.com/s/ahpV7Poj5wHmtUP6vqy3gg)

[这是我的博客地址](http://zkqiang.cn)

[通过引号设置引用名](http://prod.zkqiang.cn/wxeditor "这是自定义的引用名")

[本项目是 Fork 自 Lyric 原项目后的二次开发，感谢他的贡献！](https://github.com/lyricat/wechat-format "原项目代码库")
