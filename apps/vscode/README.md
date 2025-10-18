# doocs-md VS Code Extension

为 doocs-md 提供的 VS Code 扩展，支持在编辑器内实时预览 Markdown 渲染效果。

## 功能特性

- 侧边栏Markdown预览视图
- 支持微信图文特有的样式渲染
- 可自定义字体
- 支持自定义字体大小
- 支持自定义文本主题颜色
- 支持自定义主题样式
- 显示字数统计状态
- 支持Mac风格代码块切换

## 使用方法

1. 安装扩展后，打开Markdown文件
2. 点击活动栏中的 doocs-md 的 icon 图标
3. 在侧边栏查看实时渲染效果

## 命令

- `markdown.preview`: 打开Markdown预览
- `markdown.setFontFamily`: 设置预览字体
- `markdown.toggleCountStatus`: 切换字数统计显示
- `markdown.toggleMacCodeBlock`: 切换Mac风格代码块

## 与主项目的关系

本扩展是[doocs-md](https://github.com/doocs/md)的配套工具，使用相同的渲染方式，确保预览效果与最终微信图文完全一致。

## 开发

- **Node.js ≥ 22**

```sh
# 安装依赖
npm install

# 开发模式
npm run watch

# 打包
npm run build
```
