# 横屏滑动幻灯片示例

## 基本用法

使用 `<![alt](url),![alt](url)>` 语法可以创建横屏滑动幻灯片，支持微信公众号平台。

### 示例

```markdown
<![蓝1](https://shub.weiyan.tech/md2html/blue.jpg),![绿2](https://shub.weiyan.tech/md2html/green.jpg),![红3](https://shub.weiyan.tech/md2html/red.jpg)>
```

渲染效果如下：

<![蓝1](https://shub.weiyan.tech/md2html/blue.jpg),![绿2](https://shub.weiyan.tech/md2html/green.jpg),![红3](https://shub.weiyan.tech/md2html/red.jpg)>

### 说明

1. 使用 `<` 和 `>` 包裹整个幻灯片内容
2. 每张图片使用标准的Markdown图片语法 `![alt](url)`
3. 使用逗号 `,` 分隔多张图片
4. alt文本会显示为图片下方的说明文字

### 注意事项

- 确保图片链接有效
- 建议使用相似尺寸的图片以获得最佳显示效果
- 在微信公众号中，图片会自动适应屏幕宽度并支持横向滑动