import{b as e,p as t}from"./md-storage-DRuCxkuY.js";var n={"zh-CN":`# 探索 Markdown 的奇妙世界

欢迎来到 Markdown 的奇妙世界！无论你是写作爱好者、开发者、博主，还是想要简单记录点什么的人，Markdown 都能成为你新的好伙伴。它不仅让写作变得简单明了，还能轻松地将内容转化为漂亮的网页格式。今天，我们将全面探讨 Markdown 的基础和进阶语法，让你在这个过程中充分享受写作的乐趣！

Markdown 是一种轻量级标记语言，用于格式化纯文本。它以简单、直观的语法而著称，可以快速地生成 HTML。Markdown 是写作与代码的完美结合，既简单又强大。

## Markdown 基础语法

### 1. 标题：让你的内容层次分明

用 \`#\` 号来创建标题。标题从 \`#\` 开始，\`#\` 的数量表示标题的级别。

\`\`\`markdown
# 一级标题

## 二级标题

### 三级标题

#### 四级标题
\`\`\`

以上代码将渲染出一组层次分明的标题，使你的内容井井有条。

### 2. 段落与换行：自然流畅

Markdown 中的段落就是一行接一行的文本。要创建新段落，只需在两行文本之间空一行。

### 3. 字体样式：强调你的文字

- **粗体**：用两个星号或下划线包裹文字，如 \`**粗体**\` 或 \`__粗体__\`。
- _斜体_：用一个星号或下划线包裹文字，如 \`*斜体*\` 或 \`_斜体_\`。
- ~~删除线~~：用两个波浪线包裹文字，如 \`~~删除线~~\`。
- ==高亮==：用两个等号包裹文字，如 \`==高亮==\`。
- ++下划线++：用两个加号包裹文字，如 \`++下划线++\`。
- ~波浪线~：用一个波浪线包裹文字，如 \`~波浪线~\`。

这些简单的标记可以让你的内容更有层次感和重点突出。

### 4. 列表：整洁有序

- **无序列表**：用 \`-\`、\`*\` 或 \`+\` 加空格开始一行。
- **有序列表**：使用数字加点号（\`1.\`、\`2.\`）开始一行。

在列表中嵌套其他内容？只需缩进即可实现嵌套效果。

- 无序列表项 1
  1. 嵌套有序列表项 1
  2. 嵌套有序列表项 2
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2

### 5. 链接与图片：丰富内容

- **链接**：用方括号和圆括号创建链接 \`[显示文本](链接地址)\`。
- **图片**：和链接类似，只需在前面加上 \`!\`，如 \`![描述文本](图片链接)\`。

[访问 Doocs](https://github.com/doocs)

![doocs](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/logo-2.png)

轻松实现富媒体内容展示！

> 因微信公众号平台不支持除公众号内容以外的链接，故其他平台的链接，会呈现链接样式但无法点击跳转。

> 对于这些链接请注意明文书写，或点击左上角「格式->微信外链接转底部引用」开启引用，这样就可以在底部观察到链接指向。

另外，使用 \`<![alt](url),![alt](url)>\` 语法可以创建横屏滑动幻灯片，支持微信公众号平台。建议使用相似尺寸的图片以获得最佳显示效果。

### 6. 引用：引用名言或引人深思的句子

使用 \`>\` 来创建引用，只需在文本前面加上它。多层引用？在前一层 \`>\` 后再加一个就行。

> 这是一个引用
>
> > 这是一个嵌套引用

这让你的引用更加富有层次感。

### 7. 代码块：展示你的代码

- **行内代码**：用反引号包裹，如 \`code\`。
- **代码块**：用三个反引号包裹，并指定语言，如：

\`\`\`js
console.log(\`Hello, Doocs!\`)
\`\`\`

语法高亮让你的代码更易读。

### 8. 分割线：分割内容

用三个或更多的 \`-\`、\`*\` 或 \`_\` 来创建分割线。

---

为你的内容添加视觉分隔。

### 9. 表格：清晰展示数据

Markdown 支持简单的表格，用 \`|\` 和 \`-\` 分隔单元格和表头。

| 项目人员                                    | 邮箱                   | 微信号       |
| ------------------------------------------- | ---------------------- | ------------ |
| [yanglbme](https://github.com/yanglbme)     | contact@yanglibin.info | YLB0109      |
| [YangFong](https://github.com/YangFong)     | yangfong2022@gmail.com | yq2419731931 |

这样的表格让数据展示更为清爽！

> 手动编写标记太麻烦？我们提供了便捷方式。左上方点击「编辑->插入表格」，即可快速实现表格渲染。

### 10. 目录：自动生成文档导航

在文档中单独一行写入 \`[TOC]\`，即可根据文档标题自动生成层级目录，方便读者快速跳转。

\`\`\`markdown
[TOC]
\`\`\`

> 一级标题（\`#\`）不会出现在目录中，目录锚点根据标题在文档中的位置自动生成。

## Markdown 进阶技巧

### 1. LaTeX 公式：完美展示数学表达式

Markdown 允许嵌入 LaTeX 语法展示数学公式：

- **行内公式**：用 \`$\` 包裹公式，如 $E = mc^2$。
- **块级公式**：用 \`$$\` 包裹公式，如：

$$
\\begin{aligned}
d_{i, j} &\\leftarrow d_{i, j} + 1 \\\\
d_{i, y + 1} &\\leftarrow d_{i, y + 1} - 1 \\\\
d_{x + 1, j} &\\leftarrow d_{x + 1, j} - 1 \\\\
d_{x + 1, y + 1} &\\leftarrow d_{x + 1, y + 1} + 1
\\end{aligned}
$$

现在还支持 **LaTeX 标准格式**：

- **行内公式**：用 \`\\(...\\)\` 包裹公式，如 \\(x^2 + y^2 = z^2\\)。
- **块级公式**：用 \`\\[...\\]\` 包裹公式，如：

\\[
\\int\\_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\]

混合使用示例：传统格式 $a + b = c$ 和 LaTeX 格式 \\(d + e = f\\) 可以在同一段落中共存。

1. 列表内块公式 1

$$
\\chi^2 = \\sum \\frac{(O - E)^2}{E}
$$

2. 列表内块公式 2

$$
\\chi^2 = \\sum \\frac{(|O - E| - 0.5)^2}{E}
$$

这是展示复杂数学表达的利器！

> [!TIP]
> 预览区域的 LaTeX 公式支持点击编辑，点击后弹出公式编辑器，内置常用公式库，可快速完成公式修改。

### 2. Mermaid 流程图：可视化流程

Mermaid 是强大的可视化工具，可以在 Markdown 中创建流程图、时序图等。

\`\`\`mermaid
graph LR
  A[GraphCommand] --> B[update]
  A --> C[goto]
  A --> D[send]

  B --> B1[更新状态]
  C --> C1[流程控制]
  D --> D1[消息传递]
\`\`\`

\`\`\`mermaid
graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;
\`\`\`

\`\`\`mermaid
pie
  title Key elements in Product X
  "Calcium" : 42.96
  "Potassium" : 50.05
  "Magnesium" : 10.01
  "Iron" : 5
\`\`\`

\`\`\`mermaid
pie
  title 为什么总是宅在家里？
  "喜欢宅" : 45
  "天气太热" : 70
  "穷" : 500
  "没人约" : 95
\`\`\`

这种方式不仅能直观展示流程，还能提升文档的专业性。

> 更多用法，参见：[Mermaid User Guide](https://mermaid.js.org/intro/getting-started.html)。

### 3. PlantUML 流程图：可视化流程

PlantUML 是强大的可视化工具，可以在 Markdown 中创建流程图、时序图等。

\`\`\`plantuml
@startuml
participant Participant as Foo
actor       Actor       as Foo1
boundary    Boundary    as Foo2
control     Control     as Foo3
entity      Entity      as Foo4
database    Database    as Foo5
collections Collections as Foo6
queue       Queue       as Foo7
Foo -> Foo1 : To actor
Foo -> Foo2 : To boundary
Foo -> Foo3 : To control
Foo -> Foo4 : To entity
Foo -> Foo5 : To database
Foo -> Foo6 : To collections
Foo -> Foo7: To queue
@enduml
\`\`\`

> 更多用法，参见：[PlantUML 主页](https://plantuml.com/zh/)。

### 4. Infographic 信息图：可视化数据

新一代信息图可视化引擎，让文字信息栩栩如生！

\`\`\`infographic
infographic list-row-horizontal-icon-arrow
data
  title 客户增长引擎
  desc 多渠道触达与复购提升
  items
    - label 线索获取
      value 18.6
      desc 渠道投放与内容获客
      icon rocket-launch
    - label 转化提效
      value 12.4
      desc 线索评分与自动跟进
      icon progress-check
    - label 复购提升
      value 9.8
      desc 会员体系与权益运营
      icon account-sync
    - label 口碑传播
      value 6.2
      desc 社群激励与推荐裂变
      icon account-group
\`\`\`

> 更多用法，参见：[AntV Infographic Gallery](https://infographic.antv.vision/gallery)。

### 5. Ruby 注音：注音标注

支持两种格式：

\`\`\`md
1. [文字]{注音}
2. [文字]^(注音)
\`\`\`

渲染效果如下：

[你好]{nǐ hǎo} [世界]{shì jiè}

支持四种分隔符： \`・\`（中点）、\`．\` (全角句点)、\`。\` (中文句号)、\`-\` (英文减号)

示例：

\`\`\`md
[你好世界]{nǐ・hǎo・shì・jiè}
[小夜時雨]^(さ・よ・しぐれ)
\`\`\`

[你好世界]{nǐ・hǎo・shì・jiè}
[小夜時雨]^(さ・よ・しぐれ)

当字符串数量与分隔符数量不匹配时，会自动匹配到最合适的分隔符。

\`\`\`md
[小夜時雨]{さ・よ・しぐれ}
[小夜時雨]{さ・よ}
[小夜]{さ・よ・しぐれ}
[小夜時雨]{さ・よ・しぐれ・extra}
\`\`\`

[小夜時雨]{さ・よ・しぐれ}
[小夜時雨]{さ・よ}
[小夜]{さ・よ・しぐれ}
[小夜時雨]{さ・よ・しぐれ・extra}

### 6. 警告块与环境：突出重点内容

使用 \`> [!类型]\` 或 \`::: 类型 ... :::\` 语法即可创建带样式的警告块。类型后还能跟一个**自定义标题**，正文支持完整的 Markdown 与公式。

常用的提示类型：

> [!NOTE]
> 提醒读者即使在快速浏览时也应留意的信息。

> [!TIP]
> 帮助读者更顺利完成操作的小技巧。

> [!IMPORTANT] 上线前必读
> 类型后可以跟自定义标题，覆盖默认标题。

> [!WARNING]
> 需要立即引起注意的关键内容。

也可以使用 \`:::\` 容器语法，效果相同：

::: tip
这是一个使用容器语法的提示框。
:::

还内置了定理、引理、定义等**学术环境**，正文可直接书写公式：

::: theorem 勾股定理
在直角三角形中，斜边的平方等于两条直角边的平方和：$a^2 + b^2 = c^2$。
:::

::: definition
若对任意 $\\varepsilon > 0$，存在 $\\delta > 0$，使得 $0 < |x - a| < \\delta$ 时有 $|f(x) - L| < \\varepsilon$，则称 $\\lim_{x \\to a} f(x) = L$。
:::

::: proof
由上述定义直接可得，证毕。
:::

类型名称可以是**任意文字**（包括中文），未匹配到内置样式时会使用统一的默认样式，并以名称作为标题：

::: 推论
任意名称都会渲染成一个带标题的方框。
:::

## 结语

Markdown 是一种简单、强大且易于掌握的标记语言，通过学习基础和进阶语法，你可以快速创作内容并有效传达信息。无论是技术文档、个人博客还是项目说明，Markdown 都是你的得力助手。希望这篇内容能够带你全面了解 Markdown 的潜力，让你的写作更加丰富多彩！

现在，拿起 Markdown 编辑器，开始创作吧！探索 Markdown 的世界，你会发现它远比想象中更精彩！

### 推荐阅读

- [阿里又一个 20k+ stars 开源项目诞生，恭喜 fastjson！](https://mp.weixin.qq.com/s/RNKDCK2KoyeuMeEs6GUrow)
- [刷掉 90% 候选人的互联网大厂海量数据面试题（附题解 + 方法总结）](https://mp.weixin.qq.com/s/rjGqxUvrEqJNlo09GrT1Dw)
- [好用！期待已久的文本块功能究竟如何在 Java 13 中发挥作用？](https://mp.weixin.qq.com/s/kalGv5T8AZGxTnLHr2wDsA)
- [2019 GitHub 开源贡献排行榜新鲜出炉！微软谷歌领头，阿里跻身前 12！](https://mp.weixin.qq.com/s/_q812aGD1b9QvZ2WFI0Qgw)

---

<center>
    <img src="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/1648303220922-7e14aefa-816e-44c1-8604-ade709ca1c69.png" alt="qr code" style="width: 100px;">
</center>
`,"zh-TW":`# 探索 Markdown 的奇妙世界

歡迎來到 Markdown 的奇妙世界！無論你是寫作愛好者、開發者、部落客，還是想要簡單記錄點什麼的人，Markdown 都能成為你新的好夥伴。它不僅讓寫作變得簡單明瞭，還能輕鬆地將內容轉化為漂亮的網頁格式。今天，我們將全面探討 Markdown 的基礎和進階語法，讓你在這個過程中充分享受寫作的樂趣！

Markdown 是一種輕量級標記語言，用於格式化純文字。它以簡單、直觀的語法而著稱，可以快速地產生 HTML。Markdown 是寫作與程式碼的完美結合，既簡單又強大。

## Markdown 基礎語法

### 1. 標題：讓你的內容層次分明

用 \`#\` 號來建立標題。標題從 \`#\` 開始，\`#\` 的數量表示標題的級別。

\`\`\`markdown
# 一級標題

## 二級標題

### 三級標題

#### 四級標題
\`\`\`

以上程式碼將渲染出一組層次分明的標題，使你的內容井井有條。

### 2. 段落與換行：自然流暢

Markdown 中的段落就是一行接一行的文字。要建立新段落，只需在兩行文字之間空一行。

### 3. 字體樣式：強調你的文字

- **粗體**：用兩個星號或底線包裹文字，如 \`**粗體**\` 或 \`__粗體__\`。
- _斜體_：用一個星號或底線包裹文字，如 \`*斜體*\` 或 \`_斜體_\`。
- ~~刪除線~~：用兩個波浪線包裹文字，如 \`~~刪除線~~\`。
- ==醒目提示==：用兩個等號包裹文字，如 \`==醒目提示==\`。
- ++底線++：用兩個加號包裹文字，如 \`++底線++\`。
- ~波浪線~：用一個波浪線包裹文字，如 \`~波浪線~\`。

這些簡單的標記可以讓你的內容更有層次感和重點突出。

### 4. 列表：整潔有序

- **無序列表**：用 \`-\`、\`*\` 或 \`+\` 加空格開始一行。
- **有序列表**：使用數字加點號（\`1.\`、\`2.\`）開始一行。

在列表中巢狀其他內容？只需縮排即可實現巢狀效果。

- 無序列表項 1
  1. 巢狀有序列表項 1
  2. 巢狀有序列表項 2
- 無序列表項 2

1. 有序列表項 1
2. 有序列表項 2

### 5. 連結與圖片：豐富內容

- **連結**：用方括號和圓括號建立連結 \`[顯示文字](連結位址)\`。
- **圖片**：和連結類似，只需在前面加上 \`!\`，如 \`![描述文字](圖片連結)\`。

[造訪 Doocs](https://github.com/doocs)

![doocs](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/logo-2.png)

輕鬆實現富媒體內容展示！

> 因微信公眾號平台不支援除公眾號內容以外的連結，故其他平台的連結，會呈現連結樣式但無法點擊跳轉。

> 對於這些連結請注意明文繕寫，或點擊左上角「格式->微信外連結轉底部引用」開啟引用，這樣就可以在底部觀察到連結指向。

另外，使用 \`<![alt](url),![alt](url)>\` 語法可以建立橫屏滑動投影片，支援微信公眾號平台。建議使用相似尺寸的圖片以獲得最佳顯示效果。

### 6. 引用：引用名言或引人深思的句子

使用 \`>\` 來建立引用，只需在文字前面加上它。多層引用？在前一層 \`>\` 後再加一個就行。

> 這是一個引用
>
> > 這是一個巢狀引用

這讓你的引用更加富有層次感。

### 7. 程式碼區塊：展示你的程式碼

- **行內程式碼**：用反引號包裹，如 \`code\`。
- **程式碼區塊**：用三個反引號包裹，並指定語言，如：

\`\`\`js
console.log(\`Hello, Doocs!\`)
\`\`\`

語法醒目提示讓你的程式碼更易讀。

### 8. 分隔線：分割內容

用三個或更多的 \`-\`、\`*\` 或 \`_\` 來建立分隔線。

---

為你的內容添加視覺分隔。

### 9. 表格：清晰展示資料

Markdown 支援簡單的表格，用 \`|\` 和 \`-\` 分隔儲存格和表頭。

| 專案人員                                    | 信箱                   | 微信號       |
| ------------------------------------------- | ---------------------- | ------------ |
| [yanglbme](https://github.com/yanglbme)     | contact@yanglibin.info | YLB0109      |
| [YangFong](https://github.com/YangFong)     | yangfong2022@gmail.com | yq2419731931 |

這樣的表格讓資料展示更為清爽！

> 手動編寫標記太麻煩？我們提供了便捷方式。左上方點擊「編輯->插入表格」，即可快速實現表格渲染。

### 10. 目錄：自動產生文件導覽

在文件中單獨一行寫入 \`[TOC]\`，即可根據文件標題自動產生層級目錄，方便讀者快速跳轉。

\`\`\`markdown
[TOC]
\`\`\`

> 一級標題（\`#\`）不會出現在目錄中，目錄錨點根據標題在文件中的位置自動產生。

## Markdown 進階技巧

### 1. LaTeX 公式：完美展示數學運算式

Markdown 允許嵌入 LaTeX 語法展示數學公式：

- **行內公式**：用 \`$\` 包裹公式，如 $E = mc^2$。
- **塊級公式**：用 \`$$\` 包裹公式，如：

$$
\\begin{aligned}
d_{i, j} &\\leftarrow d_{i, j} + 1 \\\\
d_{i, y + 1} &\\leftarrow d_{i, y + 1} - 1 \\\\
d_{x + 1, j} &\\leftarrow d_{x + 1, j} - 1 \\\\
d_{x + 1, y + 1} &\\leftarrow d_{x + 1, y + 1} + 1
\\end{aligned}
$$

現在還支援 **LaTeX 標準格式**：

- **行內公式**：用 \`\\(...\\)\` 包裹公式，如 \\(x^2 + y^2 = z^2\\)。
- **塊級公式**：用 \`\\[...\\]\` 包裹公式，如：

\\[
\\int\\_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\]

混合使用示例：傳統格式 $a + b = c$ 和 LaTeX 格式 \\(d + e = f\\) 可以在同一段落中共存。

1. 列表內塊公式 1

$$
\\chi^2 = \\sum \\frac{(O - E)^2}{E}
$$

2. 列表內塊公式 2

$$
\\chi^2 = \\sum \\frac{(|O - E| - 0.5)^2}{E}
$$

這是展示複雜數學表達的利器！

> [!TIP]
> 預覽區域的 LaTeX 公式支援點擊編輯，點擊後彈出公式編輯器，內建常用公式庫，可快速完成公式修改。

### 2. Mermaid 流程圖：視覺化流程

Mermaid 是強大的視覺化工具，可以在 Markdown 中建立流程圖、時序圖等。

\`\`\`mermaid
graph LR
  A[GraphCommand] --> B[update]
  A --> C[goto]
  A --> D[send]

  B --> B1[更新狀態]
  C --> C1[流程控制]
  D --> D1[訊息傳遞]
\`\`\`

\`\`\`mermaid
graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;
\`\`\`

\`\`\`mermaid
pie
  title Key elements in Product X
  "Calcium" : 42.96
  "Potassium" : 50.05
  "Magnesium" : 10.01
  "Iron" : 5
\`\`\`

\`\`\`mermaid
pie
  title 為什麼總是宅在家裡？
  "喜歡宅" : 45
  "天氣太熱" : 70
  "窮" : 500
  "沒人約" : 95
\`\`\`

這種方式不僅能直觀展示流程，還能提升文件的專業性。

> 更多用法，參見：[Mermaid User Guide](https://mermaid.js.org/intro/getting-started.html)。

### 3. PlantUML 流程圖：視覺化流程

PlantUML 是強大的視覺化工具，可以在 Markdown 中建立流程圖、時序圖等。

\`\`\`plantuml
@startuml
participant Participant as Foo
actor       Actor       as Foo1
boundary    Boundary    as Foo2
control     Control     as Foo3
entity      Entity      as Foo4
database    Database    as Foo5
collections Collections as Foo6
queue       Queue       as Foo7
Foo -> Foo1 : To actor
Foo -> Foo2 : To boundary
Foo -> Foo3 : To control
Foo -> Foo4 : To entity
Foo -> Foo5 : To database
Foo -> Foo6 : To collections
Foo -> Foo7: To queue
@enduml
\`\`\`

> 更多用法，參見：[PlantUML 主頁](https://plantuml.com/zh/)。

### 4. Infographic 資訊圖：視覺化資料

新一代資訊圖視覺化引擎，讓文字資訊栩栩如生！

\`\`\`infographic
infographic list-row-horizontal-icon-arrow
data
  title 客戶增長引擎
  desc 多通路觸達與回購提升
  items
    - label 線索獲取
      value 18.6
      desc 通路投放與內容獲客
      icon rocket-launch
    - label 轉化提效
      value 12.4
      desc 線索評分與自動跟進
      icon progress-check
    - label 回購提升
      value 9.8
      desc 會員體系與權益運營
      icon account-sync
    - label 口碑傳播
      value 6.2
      desc 社群激勵與推薦裂變
      icon account-group
\`\`\`

> 更多用法，參見：[AntV Infographic Gallery](https://infographic.antv.vision/gallery)。

### 5. Ruby 注音：注音標註

支援兩種格式：

\`\`\`md
1. [文字]{注音}
2. [文字]^(注音)
\`\`\`

渲染效果如下：

[你好]{nǐ hǎo} [世界]{shì jiè}

支援四種分隔符： \`・\`（中點）、\`．\` (全形句點)、\`。\` (中文句號)、\`-\` (英文減號)

示例：

\`\`\`md
[你好世界]{nǐ・hǎo・shì・jiè}
[小夜時雨]^(さ・よ・しぐれ)
\`\`\`

[你好世界]{nǐ・hǎo・shì・jiè}
[小夜時雨]^(さ・よ・しぐれ)

當字串數量與分隔符數量不相符時，會自動匹配到最適合的分隔符。

\`\`\`md
[小夜時雨]{さ・よ・しぐれ}
[小夜時雨]{さ・よ}
[小夜]{さ・よ・しぐれ}
[小夜時雨]{さ・よ・しぐれ・extra}
\`\`\`

[小夜時雨]{さ・よ・しぐれ}
[小夜時雨]{さ・よ}
[小夜]{さ・よ・しぐれ}
[小夜時雨]{さ・よ・しぐれ・extra}

### 6. 警告區塊與環境：突出重點內容

使用 \`> [!類型]\` 或 \`::: 類型 ... :::\` 語法即可建立帶樣式的警告區塊。類型後還能跟一個**自訂標題**，正文支援完整的 Markdown 與公式。

常用的提示類型：

> [!NOTE]
> 提醒讀者即使在快速瀏覽時也應留意的資訊。

> [!TIP]
> 幫助讀者更順利完成操作的小技巧。

> [!IMPORTANT] 上線前必讀
> 類型後可以跟自訂標題，覆蓋預設標題。

> [!WARNING]
> 需要立即引起注意的關鍵內容。

也可以使用 \`:::\` 容器語法，效果相同：

::: tip
這是一個使用容器語法的提示框。
:::

還內建了定理、引理、定義等**學術環境**，正文可直接書寫公式：

::: theorem 勾股定理
在直角三角形中，斜邊的平方等於兩條直角邊的平方和：$a^2 + b^2 = c^2$。
:::

::: definition
若對任意 $\\varepsilon > 0$，存在 $\\delta > 0$，使得 $0 < |x - a| < \\delta$ 時有 $|f(x) - L| < \\varepsilon$，則稱 $\\lim_{x \\to a} f(x) = L$。
:::

::: proof
由上述定義直接可得，證畢。
:::

類型名稱可以是**任意文字**（包括中文），未匹配到內建樣式時會使用統一的預設樣式，並以名稱作為標題：

::: 推論
任意名稱都會渲染成一個帶標題的方框。
:::

## 結語

Markdown 是一種簡單、強大且易於掌握的標記語言，透過學習基礎和進階語法，你可以快速創作內容並有效傳達資訊。無論是技術文件、個人部落格還是專案說明，Markdown 都是你的得力助手。希望這篇內容能夠帶你全面了解 Markdown 的潛力，讓你的寫作更加豐富多彩！

現在，拿起 Markdown 編輯器，開始創作吧！探索 Markdown 的世界，你會發現它遠比想像中更精彩！

### 推薦閱讀

- [阿里又一個 20k+ stars 開源專案誕生，恭喜 fastjson！](https://mp.weixin.qq.com/s/RNKDCK2KoyeuMeEs6GUrow)
- [刷掉 90% 候選人的互聯網大廠海量資料面試題（附題解 + 方法總結）](https://mp.weixin.qq.com/s/rjGqxUvrEqJNlo09GrT1Dw)
- [好用！期待已久的文字區塊功能究竟如何在 Java 13 中發揮作用？](https://mp.weixin.qq.com/s/kalGv5T8AZGxTnLHr2wDsA)
- [2019 GitHub 開源貢獻排行榜新鮮出爐！微軟谷歌領頭，阿里躋身前 12！](https://mp.weixin.qq.com/s/_q812aGD1b9QvZ2WFI0Qgw)

---

<center>
    <img src="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/1648303220922-7e14aefa-816e-44c1-8604-ade709ca1c69.png" alt="qr code" style="width: 100px;">
</center>
`,"en-US":`# Explore the Wonderful World of Markdown

Welcome to the wonderful world of Markdown! Whether you are a writer, developer, blogger, or someone who simply wants to jot things down, Markdown can be your new companion. It makes writing simple and clear, and turns plain text into beautiful web pages with ease. Today we will walk through Markdown basics and advanced syntax so you can enjoy writing along the way.

Markdown is a lightweight markup language for formatting plain text. Known for its simple, intuitive syntax, it can generate HTML quickly. Markdown is the perfect blend of writing and code — simple yet powerful.

## Markdown Basics

### 1. Headings: Structure your content

Create headings with \`#\`. The number of \`#\` characters indicates the heading level.

\`\`\`markdown
# Heading 1

## Heading 2

### Heading 3

#### Heading 4
\`\`\`

The snippet above renders a clear hierarchy that keeps your content organized.

### 2. Paragraphs and line breaks: Natural flow

In Markdown, paragraphs are consecutive lines of text. To start a new paragraph, leave a blank line between two blocks of text.

### 3. Text styles: Emphasize your words

- **Bold**: Wrap text with two asterisks or underscores, e.g. \`**bold**\` or \`__bold__\`.
- _Italic_: Wrap text with one asterisk or underscore, e.g. \`*italic*\` or \`_italic_\`.
- ~~Strikethrough~~: Wrap text with two tildes, e.g. \`~~strikethrough~~\`.
- ==Highlight==: Wrap text with two equals signs, e.g. \`==highlight==\`.
- ++Underline++: Wrap text with two plus signs, e.g. \`++underline++\`.
- ~Wavy underline~: Wrap text with one tilde, e.g. \`~wavy~\`.

These simple marks add hierarchy and emphasis to your writing.

### 4. Lists: Clean and ordered

- **Unordered list**: Start a line with \`-\`, \`*\`, or \`+\` followed by a space.
- **Ordered list**: Start a line with a number and a period (\`1.\`, \`2.\`).

Need nested content? Indent to nest items.

- Unordered item 1
  1. Nested ordered item 1
  2. Nested ordered item 2
- Unordered item 2

1. Ordered item 1
2. Ordered item 2

### 5. Links and images: Enrich your content

- **Link**: Use brackets and parentheses — \`[display text](url)\`.
- **Image**: Same as a link, but prefix with \`!\`, e.g. \`![alt text](image url)\`.

[Visit Doocs](https://github.com/doocs)

![doocs](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/logo-2.png)

Rich media, made simple!

> WeChat Official Accounts only allow links to other official-account content. External links may look like links but cannot be opened.

> Write such URLs in plain text, or enable **Format → Convert external WeChat links to footnotes** so readers can see the destinations at the bottom.

You can also create a horizontal image slider with \`<![alt](url),![alt](url)>\`, which works on WeChat Official Accounts. Use similarly sized images for the best result.

### 6. Blockquotes: Quotes and thoughtful lines

Create a quote with \`>\`. For nested quotes, add another \`>\` on the next level.

> This is a quote
>
> > This is a nested quote

Nested quotes give your citations more depth.

### 7. Code blocks: Show your code

- **Inline code**: Wrap with backticks, e.g. \`code\`.
- **Code block**: Wrap with three backticks and specify a language, e.g.:

\`\`\`js
console.log(\`Hello, Doocs!\`)
\`\`\`

Syntax highlighting makes code easier to read.

### 8. Horizontal rules: Separate sections

Create a rule with three or more \`-\`, \`*\`, or \`_\` characters.

---

Add visual separation to your content.

### 9. Tables: Present data clearly

Markdown supports simple tables with \`|\` and \`-\` to separate cells and headers.

| Contributor                                 | Email                  | WeChat ID    |
| ------------------------------------------- | ---------------------- | ------------ |
| [yanglbme](https://github.com/yanglbme)     | contact@yanglibin.info | YLB0109      |
| [YangFong](https://github.com/YangFong)     | yangfong2022@gmail.com | yq2419731931 |

Tables keep data neat and readable!

> Tired of writing table markup by hand? Use **Edit → Insert table** in the top-left menu for a quick insert.

### 10. Table of contents: Auto-generated navigation

Put \`[TOC]\` on its own line to generate a hierarchical table of contents from your headings.

\`\`\`markdown
[TOC]
\`\`\`

> Level-1 headings (\`#\`) are excluded. Anchor links are generated from each heading’s position in the document.

## Advanced Markdown

### 1. LaTeX formulas: Math done right

Markdown can embed LaTeX math:

- **Inline**: Wrap with \`$\`, e.g. $E = mc^2$.
- **Block**: Wrap with \`$$\`, e.g.:

$$
\\begin{aligned}
d_{i, j} &\\leftarrow d_{i, j} + 1 \\\\
d_{i, y + 1} &\\leftarrow d_{i, y + 1} - 1 \\\\
d_{x + 1, j} &\\leftarrow d_{x + 1, j} - 1 \\\\
d_{x + 1, y + 1} &\\leftarrow d_{x + 1, y + 1} + 1
\\end{aligned}
$$

Standard LaTeX delimiters are also supported:

- **Inline**: \`\\(...\\)\`, e.g. \\(x^2 + y^2 = z^2\\).
- **Block**: \`\\[...\\]\`, e.g.:

\\[
\\int\\_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\]

You can mix styles in one paragraph: classic $a + b = c$ and LaTeX \\(d + e = f\\).

1. Block formula inside a list 1

$$
\\chi^2 = \\sum \\frac{(O - E)^2}{E}
$$

2. Block formula inside a list 2

$$
\\chi^2 = \\sum \\frac{(|O - E| - 0.5)^2}{E}
$$

Perfect for complex math!

> [!TIP]
> Click a LaTeX formula in the preview to open the formula editor, complete with a built-in formula library for quick edits.

### 2. Mermaid diagrams: Visualize flows

Mermaid lets you create flowcharts, sequence diagrams, and more inside Markdown.

\`\`\`mermaid
graph LR
  A[GraphCommand] --> B[update]
  A --> C[goto]
  A --> D[send]

  B --> B1[Update state]
  C --> C1[Flow control]
  D --> D1[Send message]
\`\`\`

\`\`\`mermaid
graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;
\`\`\`

\`\`\`mermaid
pie
  title Key elements in Product X
  "Calcium" : 42.96
  "Potassium" : 50.05
  "Magnesium" : 10.01
  "Iron" : 5
\`\`\`

\`\`\`mermaid
pie
  title Why stay home all day?
  "Love staying in" : 45
  "Too hot outside" : 70
  "Broke" : 500
  "No plans" : 95
\`\`\`

Diagrams make processes clear and documents more professional.

> Learn more: [Mermaid User Guide](https://mermaid.js.org/intro/getting-started.html).

### 3. PlantUML diagrams: Visualize flows

PlantUML is another powerful tool for flowcharts, sequence diagrams, and more in Markdown.

\`\`\`plantuml
@startuml
participant Participant as Foo
actor       Actor       as Foo1
boundary    Boundary    as Foo2
control     Control     as Foo3
entity      Entity      as Foo4
database    Database    as Foo5
collections Collections as Foo6
queue       Queue       as Foo7
Foo -> Foo1 : To actor
Foo -> Foo2 : To boundary
Foo -> Foo3 : To control
Foo -> Foo4 : To entity
Foo -> Foo5 : To database
Foo -> Foo6 : To collections
Foo -> Foo7: To queue
@enduml
\`\`\`

> Learn more: [PlantUML homepage](https://plantuml.com/).

### 4. Infographic: Visualize data

A next-generation infographic engine that brings text to life!

\`\`\`infographic
infographic list-row-horizontal-icon-arrow
data
  title Customer growth engine
  desc Multi-channel reach and repurchase
  items
    - label Lead acquisition
      value 18.6
      desc Ads and content acquisition
      icon rocket-launch
    - label Conversion lift
      value 12.4
      desc Lead scoring and follow-ups
      icon progress-check
    - label Repurchase
      value 9.8
      desc Membership and benefits
      icon account-sync
    - label Word of mouth
      value 6.2
      desc Community incentives and referrals
      icon account-group
\`\`\`

> Learn more: [AntV Infographic Gallery](https://infographic.antv.vision/gallery).

### 5. Ruby annotations: Phonetic markup

Two formats are supported:

\`\`\`md
1. [text]{reading}
2. [text]^(reading)
\`\`\`

Rendered examples:

[你好]{nǐ hǎo} [世界]{shì jiè}

Supported separators: \`・\` (middle dot), \`．\` (full-width period), \`。\` (CJK period), \`-\` (hyphen)

Examples:

\`\`\`md
[你好世界]{nǐ・hǎo・shì・jiè}
[小夜時雨]^(さ・よ・しぐれ)
\`\`\`

[你好世界]{nǐ・hǎo・shì・jiè}
[小夜時雨]^(さ・よ・しぐれ)

When the number of syllables and separators does not match, the closest fit is chosen automatically.

\`\`\`md
[小夜時雨]{さ・よ・しぐれ}
[小夜時雨]{さ・よ}
[小夜]{さ・よ・しぐれ}
[小夜時雨]{さ・よ・しぐれ・extra}
\`\`\`

[小夜時雨]{さ・よ・しぐれ}
[小夜時雨]{さ・よ}
[小夜]{さ・よ・しぐれ}
[小夜時雨]{さ・よ・しぐれ・extra}

### 6. Callouts and environments: Highlight key points

Use \`> [!type]\` or \`::: type ... :::\` to create styled callouts. You can add a **custom title** after the type; the body supports full Markdown and math.

Common callout types:

> [!NOTE]
> Information readers should notice even when skimming.

> [!TIP]
> Helpful tips that make a task easier.

> [!IMPORTANT] Read before ship
> A custom title after the type overrides the default.

> [!WARNING]
> Critical content that needs immediate attention.

Container syntax works the same way:

::: tip
This tip uses container syntax.
:::

Built-in academic environments (theorem, lemma, definition, and more) also accept formulas in the body:

::: theorem Pythagorean theorem
In a right triangle, the square of the hypotenuse equals the sum of the squares of the other two sides: $a^2 + b^2 = c^2$.
:::

::: definition
If for every $\\varepsilon > 0$ there exists $\\delta > 0$ such that $0 < |x - a| < \\delta$ implies $|f(x) - L| < \\varepsilon$, then $\\lim_{x \\to a} f(x) = L$.
:::

::: proof
Follows directly from the definition above. Q.E.D.
:::

The type name can be **any text**. Unrecognized types use a default style with the name as the title:

::: Corollary
Any name renders as a titled box.
:::

## Closing

Markdown is a simple, powerful, and easy-to-learn markup language. With the basics and advanced features above, you can create content quickly and communicate clearly — whether for technical docs, a personal blog, or project notes. We hope this guide helps you unlock Markdown’s potential and make writing more enjoyable.

Open your Markdown editor and start creating. Explore Markdown — it is more delightful than you might expect!

### Further reading

- [Another Alibaba open-source project hits 20k+ stars — congrats, fastjson!](https://mp.weixin.qq.com/s/RNKDCK2KoyeuMeEs6GUrow)
- [Internet big-tech mass-data interview questions that eliminate 90% of candidates](https://mp.weixin.qq.com/s/rjGqxUvrEqJNlo09GrT1Dw)
- [How text blocks in Java 13 actually help](https://mp.weixin.qq.com/s/kalGv5T8AZGxTnLHr2wDsA)
- [2019 GitHub contribution rankings — Microsoft & Google lead, Alibaba in the top 12](https://mp.weixin.qq.com/s/_q812aGD1b9QvZ2WFI0Qgw)

---

<center>
    <img src="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/1648303220922-7e14aefa-816e-44c1-8604-ade709ca1c69.png" alt="qr code" style="width: 100px;">
</center>
`,"ja-JP":`# Markdown の不思議な世界を探検しよう

Markdown の世界へようこそ！ライター、開発者、ブロガー、あるいはちょっとしたメモを残したい人にとって、Markdown は頼れる相棒になります。書くことがシンプルで分かりやすくなり、プレーンテキストを美しいウェブページへ簡単に変換できます。今日は基礎から応用まで Markdown の文法を一通り見て、書く楽しさを味わいましょう。

Markdown はプレーンテキストを整形するための軽量マークアップ言語です。シンプルで直感的な文法が特長で、すばやく HTML を生成できます。文章とコードの良いところをあわせ持った、簡単で強力な記法です。

## Markdown の基礎文法

### 1. 見出し：内容に階層をつける

\`#\` で見出しを作ります。\`#\` の個数が見出しレベルです。

\`\`\`markdown
# 見出し 1

## 見出し 2

### 見出し 3

#### 見出し 4
\`\`\`

上記のコードは階層のはっきりした見出しを描画し、内容を整理しやすくします。

### 2. 段落と改行：自然な流れ

Markdown の段落は連続したテキスト行です。新しい段落を始めるには、2 つのテキストブロックのあいだに空行を入れます。

### 3. 文字スタイル：言葉を強調する

- **太字**：アスタリスクまたはアンダースコア 2 つで囲む。例：\`**太字**\` または \`__太字__\`。
- _斜体_：アスタリスクまたはアンダースコア 1 つで囲む。例：\`*斜体*\` または \`_斜体_\`。
- ~~取り消し線~~：チルダ 2 つで囲む。例：\`~~取り消し線~~\`。
- ==ハイライト==：等号 2 つで囲む。例：\`==ハイライト==\`。
- ++下線++：プラス 2 つで囲む。例：\`++下線++\`。
- ~波線~：チルダ 1 つで囲む。例：\`~波線~\`。

これらの簡単なマークで、文章に階層と重点を付けられます。

### 4. リスト：すっきり整理

- **箇条書き**：行頭に \`-\`、\`*\`、または \`+\` とスペース。
- **番号付きリスト**：行頭に数字とピリオド（\`1.\`、\`2.\`）。

入れ子にするにはインデントします。

- 箇条書き 1
  1. 入れ子の番号付き 1
  2. 入れ子の番号付き 2
- 箇条書き 2

1. 番号付き 1
2. 番号付き 2

### 5. リンクと画像：内容を豊かにする

- **リンク**：角括弧と丸括弧で \`[表示テキスト](URL)\`。
- **画像**：リンクの前に \`!\` を付ける。例：\`![代替テキスト](画像URL)\`。

[Doocs を見る](https://github.com/doocs)

![doocs](https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/logo-2.png)

リッチなメディア表現も簡単です！

> 微信公式アカウントでは、他の公式アカウント以外へのリンクはクリックできない場合があります（見た目だけリンクになることがあります）。

> そのような URL は本文にそのまま書くか、左上の「書式 → 微信外リンクを脚注に変換」を有効にして、末尾でリンク先を確認できるようにしてください。

また \`<![alt](url),![alt](url)>\` 構文で横スクロールのスライドショーを作れ、微信公式アカウントでも利用できます。似たサイズの画像を使うと表示がきれいになります。

### 6. 引用：名言や考えさせられる一文

\`>\` で引用を作ります。入れ子の引用は、さらに \`>\` を重ねます。

> これは引用です
>
> > これは入れ子の引用です

引用にも階層を付けられます。

### 7. コードブロック：コードを見せる

- **インラインコード**：バッククォートで囲む。例：\`code\`。
- **コードブロック**：バッククォート 3 つで囲み、言語を指定します。例：

\`\`\`js
console.log(\`Hello, Doocs!\`)
\`\`\`

シンタックスハイライトで読みやすくなります。

### 8. 区切り線：内容を分ける

\`-\`、\`*\`、または \`_\` を 3 つ以上並べると区切り線になります。

---

視覚的な区切りを追加できます。

### 9. 表：データをわかりやすく

\`|\` と \`-\` でセルと見出しを区切るシンプルな表が使えます。

| 貢献者                                      | メール                 | WeChat ID    |
| ------------------------------------------- | ---------------------- | ------------ |
| [yanglbme](https://github.com/yanglbme)     | contact@yanglibin.info | YLB0109      |
| [YangFong](https://github.com/YangFong)     | yangfong2022@gmail.com | yq2419731931 |

表があるとデータが見やすくなります！

> 手書きのマークアップが面倒なら、左上の「編集 → 表を挿入」からすばやく挿入できます。

### 10. 目次：自動生成ナビ

文書内の独立した 1 行に \`[TOC]\` と書くと、見出しから階層目次が自動生成されます。

\`\`\`markdown
[TOC]
\`\`\`

> レベル 1 の見出し（\`#\`）は目次に含まれません。アンカーは見出しの位置から自動生成されます。

## Markdown の応用テクニック

### 1. LaTeX 数式：数学表現を美しく

Markdown には LaTeX 数式を埋め込めます。

- **インライン**：\`$\` で囲む。例：$E = mc^2$。
- **ブロック**：\`$$\` で囲む。例：

$$
\\begin{aligned}
d_{i, j} &\\leftarrow d_{i, j} + 1 \\\\
d_{i, y + 1} &\\leftarrow d_{i, y + 1} - 1 \\\\
d_{x + 1, j} &\\leftarrow d_{x + 1, j} - 1 \\\\
d_{x + 1, y + 1} &\\leftarrow d_{x + 1, y + 1} + 1
\\end{aligned}
$$

**標準 LaTeX 記法**にも対応しています。

- **インライン**：\`\\(...\\)\`。例：\\(x^2 + y^2 = z^2\\)。
- **ブロック**：\`\\[...\\]\`。例：

\\[
\\int\\_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\]

同一段落で従来形式 $a + b = c$ と LaTeX 形式 \\(d + e = f\\) を混在できます。

1. リスト内のブロック数式 1

$$
\\chi^2 = \\sum \\frac{(O - E)^2}{E}
$$

2. リスト内のブロック数式 2

$$
\\chi^2 = \\sum \\frac{(|O - E| - 0.5)^2}{E}
$$

複雑な数式表現に最適です！

> [!TIP]
> プレビュー上の LaTeX 数式をクリックすると数式エディタが開き、よく使う数式ライブラリからすばやく編集できます。

### 2. Mermaid フローチャート：流れを可視化

Mermaid は強力な可視化ツールで、Markdown 内にフローチャートやシーケンス図などを作れます。

\`\`\`mermaid
graph LR
  A[GraphCommand] --> B[update]
  A --> C[goto]
  A --> D[send]

  B --> B1[状態を更新]
  C --> C1[フロー制御]
  D --> D1[メッセージ送信]
\`\`\`

\`\`\`mermaid
graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;
\`\`\`

\`\`\`mermaid
pie
  title Key elements in Product X
  "Calcium" : 42.96
  "Potassium" : 50.05
  "Magnesium" : 10.01
  "Iron" : 5
\`\`\`

\`\`\`mermaid
pie
  title なぜいつも家にいるのか？
  "引きこもり好き" : 45
  "暑すぎる" : 70
  "お金がない" : 500
  "誘われない" : 95
\`\`\`

流れを直感的に示し、文書の専門性も高められます。

> 詳しくは：[Mermaid User Guide](https://mermaid.js.org/intro/getting-started.html)。

### 3. PlantUML フローチャート：流れを可視化

PlantUML も強力な可視化ツールで、Markdown 内にフローチャートやシーケンス図などを作れます。

\`\`\`plantuml
@startuml
participant Participant as Foo
actor       Actor       as Foo1
boundary    Boundary    as Foo2
control     Control     as Foo3
entity      Entity      as Foo4
database    Database    as Foo5
collections Collections as Foo6
queue       Queue       as Foo7
Foo -> Foo1 : To actor
Foo -> Foo2 : To boundary
Foo -> Foo3 : To control
Foo -> Foo4 : To entity
Foo -> Foo5 : To database
Foo -> Foo6 : To collections
Foo -> Foo7: To queue
@enduml
\`\`\`

> 詳しくは：[PlantUML 公式サイト](https://plantuml.com/ja/)。

### 4. Infographic：データを可視化

次世代のインフォグラフィックエンジンで、文字情報を生き生きと表現！

\`\`\`infographic
infographic list-row-horizontal-icon-arrow
data
  title 顧客成長エンジン
  desc マルチチャネル接触とリピート促進
  items
    - label リード獲得
      value 18.6
      desc 広告配信とコンテンツ集客
      icon rocket-launch
    - label 転換効率化
      value 12.4
      desc リードスコアリングと自動フォロー
      icon progress-check
    - label リピート向上
      value 9.8
      desc 会員制度と特典運営
      icon account-sync
    - label 口コミ拡散
      value 6.2
      desc コミュニティ激励と紹介
      icon account-group
\`\`\`

> 詳しくは：[AntV Infographic Gallery](https://infographic.antv.vision/gallery)。

### 5. Ruby 振り仮名：読みの注釈

2 つの形式に対応しています。

\`\`\`md
1. [文字]{読み}
2. [文字]^(読み)
\`\`\`

描画例：

[你好]{nǐ hǎo} [世界]{shì jiè}

対応する区切り文字：\`・\`（中黒）、\`．\`（全角ピリオド）、\`。\`（句点）、\`-\`（ハイフン）

例：

\`\`\`md
[你好世界]{nǐ・hǎo・shì・jiè}
[小夜時雨]^(さ・よ・しぐれ)
\`\`\`

[你好世界]{nǐ・hǎo・shì・jiè}
[小夜時雨]^(さ・よ・しぐれ)

読みの数と区切り文字の数が合わない場合は、最も近い区切りに自動調整されます。

\`\`\`md
[小夜時雨]{さ・よ・しぐれ}
[小夜時雨]{さ・よ}
[小夜]{さ・よ・しぐれ}
[小夜時雨]{さ・よ・しぐれ・extra}
\`\`\`

[小夜時雨]{さ・よ・しぐれ}
[小夜時雨]{さ・よ}
[小夜]{さ・よ・しぐれ}
[小夜時雨]{さ・よ・しぐれ・extra}

### 6. 警告ブロックと環境：要点を目立たせる

\`> [!種類]\` または \`::: 種類 ... :::\` でスタイル付きの警告ブロックを作れます。種類のあとに**カスタムタイトル**を付けられ、本文では Markdown と数式をそのまま使えます。

よく使う種類：

> [!NOTE]
> ざっと読むときでも気づいてほしい情報。

> [!TIP]
> 作業をスムーズにするヒント。

> [!IMPORTANT] リリース前必読
> 種類のあとにカスタムタイトルを付けると、既定タイトルを上書きします。

> [!WARNING]
> すぐに注意が必要な重要な内容。

\`:::\` コンテナ構文でも同じ効果が得られます。

::: tip
これはコンテナ構文のヒントボックスです。
:::

定理・補題・定義などの**学術環境**も内蔵しており、本文に数式を書けます。

::: theorem ピタゴラスの定理
直角三角形では、斜辺の二乗は他の二辺の二乗の和に等しい：$a^2 + b^2 = c^2$。
:::

::: definition
任意の $\\varepsilon > 0$ に対し、ある $\\delta > 0$ が存在し、$0 < |x - a| < \\delta$ のとき $|f(x) - L| < \\varepsilon$ ならば、$\\lim_{x \\to a} f(x) = L$ である。
:::

::: proof
上記の定義から直ちに従う。証明終わり。
:::

種類名は**任意の文字列**にできます。組み込みスタイルに一致しない場合は既定スタイルを使い、名前をタイトルにします。

::: 系
任意の名前がタイトル付きの枠として描画されます。
:::

## おわりに

Markdown はシンプルで強力、しかも学びやすいマークアップ言語です。基礎と応用を押さえれば、技術文書、個人ブログ、プロジェクト説明など、すばやく内容を作り情報を伝えられます。このガイドが Markdown の可能性を知り、書くことをもっと楽しくする一助になれば幸いです。

さあ Markdown エディタを開いて、創作を始めましょう。Markdown の世界は、想像以上に魅力的です！

### おすすめの読みもの

- [阿里巴巴のまた一つの 20k+ stars オープンソース誕生、fastjson おめでとう！](https://mp.weixin.qq.com/s/RNKDCK2KoyeuMeEs6GUrow)
- [候補者の 90% を落とすインターネット大企業の大量データ面接問題](https://mp.weixin.qq.com/s/rjGqxUvrEqJNlo09GrT1Dw)
- [便利！待ち望まれたテキストブロックは Java 13 でどう活きるか](https://mp.weixin.qq.com/s/kalGv5T8AZGxTnLHr2wDsA)
- [2019 GitHub オープンソース貢献ランキング公開！Microsoft・Google が先頭、阿里巴巴は Top 12](https://mp.weixin.qq.com/s/_q812aGD1b9QvZ2WFI0Qgw)

---

<center>
    <img src="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/1648303220922-7e14aefa-816e-44c1-8604-ade709ca1c69.png" alt="qr code" style="width: 100px;">
</center>
`};function r(r=t()){return n[r]??n[e]}export{r as t};