## [v2.0.0] - 2025-04-18

### 1. 新特性亮点

- **数学公式与 Mermaid 流程图支持**：全面支持 Markdown 基础语法、数学公式、Mermaid 图表等，提升内容表达能力。
- **自定义样式面板**：新增样式自定义面板，支持主题色和 CSS 定制，适配浅/暗模式。
- **本地内容管理**：支持一键导入导出和自动草稿保存，提升编辑效率与安全性。
- **图床支持扩展**：新增公众号与 Cloudflare R2 图床支持，灵活的上传逻辑配置。
- **插件支持**：新增浏览器扩展插件，支持 Chrome、Edge、Firefox 等主流浏览器。
- **AI 助手集成**：集成智能 AI 助手功能，支持与主流 AI 模型（如 DeekSeek、OpenAI、通义千问）进行自然语言对话，辅助内容创作、语法优化、格式转换等场景，极大提升写作效率。

### 2. 框架、镜像升级

- **Node.js 20+ 与 Vue3 + Vite**：全面升级依赖，基于 Vue3 和 Vite，显著提升性能与兼容性。
- **Docker 多架构镜像**：支持 `linux/arm64` 和 `linux/amd64` 多架构镜像。

### 3. 贡献者

@YangFong @yanglbme @honwhy @bravekingzhang @dribble-njr @lurenyang418 @chensirup @wll8 @thinkasany @arunsathiya @realskyrin @rwecho


## [v1.6.0] - 2023-12-05

### 1. 新特性亮点

- **Mac 风格代码块样式支持**：增加 Mac 风格的代码块渲染样式，提升视觉一致性与可读性。
- **LATEX 数学公式支持**：引入 LATEX 编辑与渲染能力，支持科学公式表达，适用于技术写作与学术场景。

### 2. 功能优化与修复

- **组件重构与性能优化**：对部分组件结构进行重构与优化，提升整体性能与维护性。
- **Bug 修复**：修复部分用户反馈的问题，提升使用稳定性与用户体验。

### 3. 框架与部署支持

- **Node 版本升级**：升级 Node.js 版本以增强兼容性和构建性能。
- **Docker 镜像同步推送**：更新版本已同步发布至 Docker Hub，可通过以下命令快速启动本地实例 `docker run -d -p 8080:80 doocs/md:latest`


### 4. 贡献者

@YangFong @yanglbme @bravekingzhang @DandelionCloud
