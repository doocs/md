import{Wt as e,bn as t,in as n}from"./md-vendor_floating-ui_vue-Dhl5tYCI.js";var r=`https://proxy-ai.doocs.org/v1`,i=1024,a=`default`,o=``,s=[{value:`default`,label:`内置服务`,endpoint:r,models:`Qwen/Qwen2.5-7B-Instruct,Qwen/Qwen2.5-Coder-7B-Instruct,Qwen/Qwen2-7B-Instruct,deepseek-ai/DeepSeek-R1-Distill-Qwen-7B,THUDM/GLM-Z1-9B-0414,THUDM/GLM-4-9B-0414,internlm/internlm2_5-7b-chat,qwen/qwen3-30b-a3b:free,qwen/qwen3-8b:free,qwen/qwen3-14b:free,qwen/qwen3-32b:free,qwen/qwen3-235b-a22b:free,tngtech/deepseek-r1t-chimera:free,thudm/glm-z1-9b:free,thudm/glm-z1-32b:free,thudm/glm-4-9b:free,thudm/glm-4-32b:free,microsoft/mai-ds-r1:free,arliai/qwq-32b-arliai-rpr-v1:free,nvidia/llama-3.3-nemotron-super-49b-v1:free,nvidia/llama-3.1-nemotron-ultra-253b-v1:free,meta-llama/llama-4-maverick:free,meta-llama/llama-4-scout:free,deepseek/deepseek-v3-base:free,qwen/qwen2.5-vl-3b-instruct:free,qwen/qwen2.5-vl-32b-instruct:free`.split(`,`)},{value:`deepseek`,label:`DeepSeek`,endpoint:`https://api.deepseek.com/v1`,models:[`deepseek-chat`,`deepseek-reasoner`]},{value:`openai`,label:`OpenAI`,endpoint:`https://api.openai.com/v1`,models:[`gpt-4.1`,`gpt-4.1-mini`,`gpt-4.1-nano`,`gpt-4-turbo`,`gpt-4o`,`gpt-3.5-turbo`]},{value:`qwen`,label:`通义千问`,endpoint:`https://dashscope.aliyuncs.com/compatible-mode/v1`,models:`qwen-vl-max-2025-04-02,deepseek-v3,deepseek-r1-distill-llama-70b,deepseek-r1-distill-qwen-32b,deepseek-r1-distill-qwen-14b,deepseek-r1-distill-llama-8b,deepseek-r1-distill-qwen-1.5b,deepseek-r1-distill-qwen-7b,deepseek-r1,qwen1.5-7b-chat,qwen-coder-plus-1106,qwen-coder-plus,qwen-coder-plus-latest,qwen2.5-coder-3b-instruct,qwen2.5-coder-0.5b-instruct,qwen2.5-coder-14b-instruct,qwen2.5-coder-32b-instruct,qwen-coder-turbo-0919,qwen2.5-0.5b-instruct,qwen2.5-1.5b-instruct,qwen2.5-3b-instruct,qwen2.5-7b-instruct,qwen2.5-14b-instruct,qwen2.5-32b-instruct,qwen2.5-72b-instruct,qwen2.5-coder-7b-instruct,qwen2.5-math-1.5b-instruct,qwen2.5-math-7b-instruct,qwen2.5-math-72b-instruct,qwen-turbo-0919,qwen-turbo-latest,qwen-plus-0919,qwen-plus-latest,qwen-max-0919,qwen-max-latest,qwen-coder-turbo,qwen-coder-turbo-latest,qwen-math-turbo-0919,qwen-math-turbo,qwen-math-turbo-latest,qwen-math-plus-0919,qwen-math-plus,qwen-math-plus-latest,qwen2-57b-a14b-instruct,qwen2-72b-instruct,qwen2-7b-instruct,qwen2-0.5b-instruct,qwen2-1.5b-instruct,qwen-long,qwen-vl-max,qwen-vl-plus,qwen-max-0428,qwen1.5-110b-chat,qwen-72b-chat,codeqwen1.5-7b-chat,qwen1.5-0.5b-chat,qwen-1.8b-chat,qwen-1.8b-longcontext-chat,qwen-7b-chat,qwen-14b-chat,qwen1.5-14b-chat,qwen1.5-1.8b-chat,qwen1.5-32b-chat,qwen1.5-72b-chat,qwen-max-1201,qwen-max-longcontext,qwen-max-0403,qwen-max-0107,qwen-turbo,qwen-max,qwen-plus`.split(`,`)},{value:`hunyuan`,label:`腾讯混元`,endpoint:`https://api.hunyuan.cloud.tencent.com/v1`,models:[`hunyuan-pro`,`hunyuan-vision`,`hunyuan-lite`,`hunyuan-standard`,`hunyuan-standard-32K`,`hunyuan-standard-256k`,`hunyuan-code`,`hunyuan-role`,`hunyuan-functioncall`,`hunyuan-turbo-vision`,`hunyuan-turbo`]},{value:`doubao`,label:`火山方舟`,endpoint:`https://ark.cn-beijing.volces.com/api/v3`,models:`doubao-1-5-thinking-pro-250415.doubao-1-5-thinking-pro-m-250415.deepseek-r1-250120.deepseek-r1-distill-qwen-32b-250120.deepseek-r1-distill-qwen-7b-250120.deepseek-v3-250324.deepseek-v3-241226.doubao-1-5-vision-pro-250328.doubao-1-5-vision-lite-250315.doubao-1-5-vision-pro-32k-250115.doubao-1-5-ui-tars-250328.doubao-vision-pro-32k-241028.doubao-vision-lite-32k-241015.doubao-1-5-pro-32k-250115.doubao-1-5-pro-256k-250115.doubao-1-5-lite-32k-250115.doubao-pro-4k-240515.doubao-pro-32k-241215.doubao-pro-32k-240828.doubao-pro-32k-240615.doubao-pro-256k-241115.doubao-lite-4k-character-240828.doubao-lite-32k-240828.doubao-lite-32k-character-241015.doubao-lite-128k-240828.moonshot-v1-8k.moonshot-v1-32k.moonshot-v1-128k`.split(`.`)},{value:`siliconflow`,label:`硅基流动`,endpoint:`https://api.siliconflow.cn/v1`,models:`Qwen/Qwen3-235B-A22B,Qwen/Qwen3-30B-A3B,Qwen/Qwen3-32B,Qwen/Qwen3-14B,Qwen/Qwen3-8B,THUDM/GLM-Z1-32B-0414,THUDM/GLM-4-32B-0414,THUDM/GLM-Z1-Rumination-32B-0414,THUDM/GLM-4-9B-0414,Qwen/QwQ-32B,Pro/deepseek-ai/DeepSeek-R1,Pro/deepseek-ai/DeepSeek-V3,deepseek-ai/DeepSeek-R1,deepseek-ai/DeepSeek-V3,deepseek-ai/DeepSeek-R1-Distill-Qwen-32B,deepseek-ai/DeepSeek-R1-Distill-Qwen-14B,deepseek-ai/DeepSeek-R1-Distill-Qwen-7B,Pro/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B,Pro/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B,deepseek-ai/DeepSeek-V2.5,Qwen/Qwen2.5-72B-Instruct-128K,Qwen/Qwen2.5-72B-Instruct,Qwen/Qwen2.5-32B-Instruct,Qwen/Qwen2.5-14B-Instruct,Qwen/Qwen2.5-7B-Instruct,Qwen/Qwen2.5-Coder-32B-Instruct,Qwen/Qwen2.5-Coder-7B-Instruct,Qwen/Qwen2-7B-Instruct,Qwen/QwQ-32B-Preview,TeleAI/TeleChat2,THUDM/glm-4-9b-chat,Vendor-A/Qwen/Qwen2.5-72B-Instruct,internlm/internlm2_5-7b-chat,internlm/internlm2_5-20b-chat,Pro/Qwen/Qwen2.5-7B-Instruct,Pro/Qwen/Qwen2-7B-Instruct,Pro/Qwen/Qwen2-1.5B-Instruct,Pro/THUDM/chatglm3-6b,Pro/THUDM/glm-4-9b-chat`.split(`,`)},{value:`302ai`,label:`302.AI`,endpoint:`https://api.302.ai/v1`,models:[`chatgpt-4o-latest`,`gpt-4o`,`gpt-4o-mini`,`gpt-4-turbo`,`o1-preview`,`o1-mini`,`claude-3-5-sonnet-latest`,`claude-3-5-sonnet-20241022`,`claude-3-5-haiku-20241022`,`grok-beta`]},{value:`bigmodel`,label:`智谱 AI`,endpoint:`https://open.bigmodel.cn/api/paas/v4/`,models:[`glm-4.7`,`glm-4.7-flashx`,`glm-4.6`,`glm-4.5-air`,`glm-4.5-airx`,`glm-4-long`,`glm-4.7-flash`,`glm-4-flash-250414`,`glm-4-flashx-250414`]},{value:`baichuan`,label:`百川智能`,endpoint:`https://api.baichuan-ai.com/v1`,models:[`Baichuan4`,`Baichuan3-Turbo`,`Baichuan3-Turbo-128k`,`Baichuan2-Turbo`]},{value:`lingyiwanwu`,label:`零一万物`,endpoint:`https://api.lingyiwanwu.com/v1`,models:[`yi-lightning`]},{value:`moonshot`,label:`月之暗面`,endpoint:`https://api.moonshot.cn/v1`,models:[`moonshot-v1-8k`,`moonshot-v1-32k`,`moonshot-v1-128k`]},{value:`ernie`,label:`百度千帆`,endpoint:`https://qianfan.baidubce.com/v2`,models:[`ernie-4.5-turbo-128k`,`ernie-4.5-turbo-32k`,`ernie-4.5-8k-preview`,`ernie-4.0-8k`,`ernie-4.0-8k-latest`,`ernie-4.0-8k-preview`,`ernie-4.0-turbo-128k`,`ernie-4.0-turbo-8k`,`ernie-4.0-turbo-8k-latest`,`ernie-4.0-turbo-8k-preview`,`ernie-3.5-128k`,`ernie-3.5-8k`,`ernie-3.5-8k-preview`,`ernie-speed-128k`,`ernie-speed-8k`,`ernie-speed-pro-128k`,`ernie-lite-8k`,`ernie-lite-pro-128k`,`ernie-tiny-8k`,`ernie-novel-8k`]},{value:`custom`,label:`自定义兼容 OpenAI API 的服务`,endpoint:``,models:[]}],c=[{value:`default`,label:`内置服务`,endpoint:r,models:[`Kwai-Kolors/Kolors`]},{value:`openai`,label:`OpenAI`,endpoint:`https://api.openai.com/v1`,models:[`gpt-image-1`,`dall-e-3`]},{value:`siliconflow`,label:`硅基流动`,endpoint:`https://api.siliconflow.cn/v1`,models:[`Kwai-Kolors/Kolors`,`Qwen/Qwen-Image`]},{value:`302ai`,label:`302.AI`,endpoint:`https://api.302.ai/302`,models:`302ai-flux-1-srpo,bagel-image,baidu-irag-01,dall-e-3,dall-e-2,doubao-seedream-3-0-t2i-250415,doubao-v2,doubao-v2-l,doubao-v2.1,doubao-v3,doubao-seedream-4-0-250828,flux-kontext-max,flux-kontext-pro,google-v3,google-v3-fast,google-v4-preview,gemini-2.5-flash-image,302-gemini-2.5-flash-image,gpt-image-1,hidream-i1-full,hidream-i1-dev,hidream-i1-fast,higgsfield,ideogram-v1,ideogram-v1-turbo,ideogram-v2,ideogram-v2-turbo,ideogram-v2a,ideogram-v2a-turbo,ideogram-v3-turbo,ideogram-v3-quality,ideogram-v3,kling-v1,kling-v1-5,kling-v2,luma,luma-flash,midjourney-v6,midjourney-v6-1,midjourney-v7,nijijourney-v6,minimaxi-image-01,qwen,qwen-lora,official-qwen-image,official-qwen-image-plus,wan2.2-t2i-flash,wan2.2-t2i-plus,wanx2.1-t2i-turbo,wanx2.1-t2i-plus,wanx2.0-t2i-turbo,wan2.5-t2i-preview,recraft-v3,recraft-20b,stable-v1,stable-sd2,stable-sd3-ultra,stable-sd3,stable-sd3-medium,stable-sd3-large,stable-sd3-turbo,cogview-4-250304,cogview-4`.split(`,`)},{value:`custom`,label:`自定义兼容 OpenAI API 的服务`,endpoint:``,models:[]}],l=`MD`,u=typeof navigator<`u`&&/Mac/i.test(navigator.userAgent),d=`Mod`,f=u?`⌘`:`Ctrl`,p=u?`⌥`:`Alt`,m=u?`⇧`:`Shift`,h=[{level:1,label:`标题 1`},{level:2,label:`标题 2`},{level:3,label:`标题 3`},{level:4,label:`标题 4`},{level:5,label:`标题 5`},{level:6,label:`标题 6`}],g={isDark:`深色模式`,isEditOnLeft:`左侧编辑`,isMacCodeBlock:`Mac 代码块`,isShowLineNumber:`代码块行号`,isCiteStatus:`微信外链接底部引用状态`,isCountStatus:`字数统计状态`,isUseIndent:`使用缩进`,isUseJustify:`使用两端对齐`,isOpenRightSlider:`开启右侧滑块`,isOpenPostSlider:`开启右侧发布滑块`,showAIToolbox:`AI 工具箱状态`,theme:`主题`,fontFamily:`字体`,fontSize:`字体大小`,primaryColor:`自定义主题色`,codeBlockTheme:`代码块主题`,legend:`图注格式`,fontSizeNumber:`字体大小`,currentPostId:`当前文章 ID`,currentPostIndex:`当前文章索引`,posts:`内容列表`,cssContentConfig:`自定义 CSS`,titleList:`文章标题列表`,readingTime:`阅读时间`,isShowCssEditor:`显示 CSS 编辑器`,isShowInsertFormDialog:`显示插入表单对话框`,isShowInsertMpCardDialog:`显示插入公众号名片对话框`,isShowUploadImgDialog:`显示上传图片对话框`,aiDialogVisible:`AI 对话框可见`,aiImageDialogVisible:`AI 图片生成对话框可见`},_=`/**
 * MD 基础主题样式
 * 包含所有元素的基础样式和 CSS 变量定义
 */

/* ==================== 容器样式 ==================== */
section,
#output .container {
  font-family: var(--md-font-family);
  font-size: var(--md-font-size);
  line-height: 1.75;
  text-align: left;
}

/* 确保 #output 容器应用基础样式 */
#output {
  font-family: var(--md-font-family);
  font-size: var(--md-font-size);
  line-height: 1.75;
  text-align: left;
}

/* 去除第一个元素的 margin-top */
#output section > :first-child {
  margin-top: 0 !important;
}

/*
 * 兜底重置：导出 HTML / 分享页 / VSCode 预览等脱离 Web App 的场景
 * 没有 Tailwind preflight，浏览器 UA 默认样式会冒出来（如
 * blockquote 默认左右各 40px margin、table 默认 border-collapse: separate）。
 * 这里统一重置左右（及顶部）外边距，保证导出结果与预览一致。
 * 垂直间距由主题 blockquote { margin-bottom } 控制，勿在此处 margin: 0 覆盖。
 * section 选择器用于 VSCode 预览（无 #output 容器，内容在 section.container 内）。
 */
#output blockquote,
section blockquote {
  margin-left: 0;
  margin-right: 0;
  margin-top: 0;
}

#output table,
section table {
  border-collapse: collapse;
  min-width: 100%;
}

.mermaid-diagram .nodeLabel p {
  color: unset !important;
  letter-spacing: unset !important;
}
`,v=`/**
 * MD 默认主题（经典主题）
 * 按 Alt/Option + Shift + F 可格式化
 * 如需使用主题色，请使用 var(--md-primary-color) 代替颜色值
 */

/* ==================== 一级标题 ==================== */
h1 {
  display: table;
  padding: 0 1em;
  border-bottom: 2px solid var(--md-primary-color);
  margin: 2em auto 1em;
  color: hsl(var(--foreground));
  font-size: calc(var(--md-font-size) * 1.2);
  font-weight: bold;
  text-align: center;
}

/* ==================== 二级标题 ==================== */
h2 {
  display: table;
  padding: 0 0.2em;
  margin: 4em auto 2em;
  color: #fff;
  background: var(--md-primary-color);
  font-size: calc(var(--md-font-size) * 1.2);
  font-weight: bold;
  text-align: center;
}

/* ==================== 三级标题 ==================== */
h3 {
  padding-left: 8px;
  border-left: 3px solid var(--md-primary-color);
  margin: 2em 8px 0.75em 0;
  color: hsl(var(--foreground));
  font-size: calc(var(--md-font-size) * 1.1);
  font-weight: bold;
  line-height: 1.2;
}

/* ==================== 四级标题 ==================== */
h4 {
  margin: 2em 8px 0.5em;
  color: var(--md-primary-color);
  font-size: calc(var(--md-font-size) * 1);
  font-weight: bold;
}

/* ==================== 五级标题 ==================== */
h5 {
  margin: 1.5em 8px 0.5em;
  color: var(--md-primary-color);
  font-size: calc(var(--md-font-size) * 1);
  font-weight: bold;
}

/* ==================== 六级标题 ==================== */
h6 {
  margin: 1.5em 8px 0.5em;
  font-size: calc(var(--md-font-size) * 1);
  color: var(--md-primary-color);
}

/* ==================== 段落 ==================== */
p {
  margin: 1.5em 8px;
  letter-spacing: 0.1em;
  color: hsl(var(--foreground));
}

/* ==================== 引用块 ==================== */
blockquote {
  font-style: normal;
  padding: 1em;
  border-left: 4px solid var(--md-primary-color);
  border-radius: 6px;
  color: hsl(var(--foreground));
  background: var(--blockquote-background);
  margin-bottom: 1em;
}

blockquote > p {
  display: block;
  font-size: 1em;
  letter-spacing: 0.1em;
  color: hsl(var(--foreground));
  margin: 0;
}

/* ==================== GFM 警告块 ==================== */
.alert-title-note,
.alert-title-tip,
.alert-title-info,
.alert-title-important,
.alert-title-warning,
.alert-title-caution,
.alert-title-abstract,
.alert-title-summary,
.alert-title-tldr,
.alert-title-todo,
.alert-title-success,
.alert-title-done,
.alert-title-question,
.alert-title-help,
.alert-title-faq,
.alert-title-failure,
.alert-title-fail,
.alert-title-missing,
.alert-title-danger,
.alert-title-error,
.alert-title-bug,
.alert-title-example,
.alert-title-quote,
.alert-title-cite,
.alert-title-theorem,
.alert-title-lemma,
.alert-title-corollary,
.alert-title-proposition,
.alert-title-definition,
.alert-title-axiom,
.alert-title-postulate,
.alert-title-assumption,
.alert-title-proof,
.alert-title-remark,
.alert-title-custom {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.5em;
}

.alert-title-note {
  color: #478be6;
}

.alert-title-tip {
  color: #57ab5a;
}

.alert-title-info {
  color: #93c5fd;
}

.alert-title-important {
  color: #986ee2;
}

.alert-title-warning {
  color: #c69026;
}

.alert-title-caution {
  color: #e5534b;
}

/* Obsidian-style callout colors */
.alert-title-abstract,
.alert-title-summary,
.alert-title-tldr {
  color: #00bfff;
}

.alert-title-todo {
  color: #478be6;
}

.alert-title-success,
.alert-title-done {
  color: #57ab5a;
}

.alert-title-question,
.alert-title-help,
.alert-title-faq {
  color: #c69026;
}

.alert-title-failure,
.alert-title-fail,
.alert-title-missing {
  color: #e5534b;
}

.alert-title-danger,
.alert-title-error {
  color: #e5534b;
}

.alert-title-bug {
  color: #e5534b;
}

.alert-title-example {
  color: #986ee2;
}

.alert-title-quote,
.alert-title-cite {
  color: #9ca3af;
}

/* GFM Alert SVG 图标颜色 */
.alert-icon-note {
  fill: #478be6;
}

.alert-icon-tip {
  fill: #57ab5a;
}

.alert-icon-info {
  fill: #93c5fd;
}

.alert-icon-important {
  fill: #986ee2;
}

.alert-icon-warning {
  fill: #c69026;
}

.alert-icon-caution {
  fill: #e5534b;
}

/* Obsidian-style callout icon colors */
.alert-icon-abstract,
.alert-icon-summary,
.alert-icon-tldr {
  fill: #00bfff;
}

.alert-icon-todo {
  fill: #478be6;
}

.alert-icon-success,
.alert-icon-done {
  fill: #57ab5a;
}

.alert-icon-question,
.alert-icon-help,
.alert-icon-faq {
  fill: #c69026;
}

.alert-icon-failure,
.alert-icon-fail,
.alert-icon-missing {
  fill: #e5534b;
}

.alert-icon-danger,
.alert-icon-error {
  fill: #e5534b;
}

.alert-icon-bug {
  fill: #e5534b;
}

.alert-icon-example {
  fill: #986ee2;
}

.alert-icon-quote,
.alert-icon-cite {
  fill: #9ca3af;
}

/* ==================== 学术环境（定理、引理、定义等） ==================== */
/* 标题颜色 */
.alert-title-theorem,
.alert-title-lemma,
.alert-title-corollary,
.alert-title-proposition {
  color: #986ee2;
}

.alert-title-definition {
  color: #57ab5a;
}

.alert-title-axiom,
.alert-title-postulate,
.alert-title-assumption {
  color: #478be6;
}

.alert-title-proof {
  color: #9ca3af;
}

.alert-title-remark {
  color: #c69026;
}

/* 图标颜色 */
.alert-icon-theorem,
.alert-icon-lemma,
.alert-icon-corollary,
.alert-icon-proposition {
  fill: #986ee2;
}

.alert-icon-definition {
  fill: #57ab5a;
}

.alert-icon-axiom,
.alert-icon-postulate,
.alert-icon-assumption {
  fill: #478be6;
}

.alert-icon-proof {
  fill: #9ca3af;
}

.alert-icon-remark {
  fill: #c69026;
}

/* 盒子描边：学术环境使用完整边框，更接近定理环境的视觉效果 */
.markdown-alert-theorem,
.markdown-alert-lemma,
.markdown-alert-corollary,
.markdown-alert-proposition {
  border: 1px solid rgba(152, 110, 226, 0.35);
  border-left: 4px solid #986ee2;
}

.markdown-alert-definition {
  border: 1px solid rgba(87, 171, 90, 0.35);
  border-left: 4px solid #57ab5a;
}

.markdown-alert-axiom,
.markdown-alert-postulate,
.markdown-alert-assumption {
  border: 1px solid rgba(71, 139, 230, 0.35);
  border-left: 4px solid #478be6;
}

.markdown-alert-proof {
  border: 1px solid rgba(156, 163, 175, 0.35);
  border-left: 4px solid #9ca3af;
}

.markdown-alert-remark {
  border: 1px solid rgba(198, 144, 38, 0.35);
  border-left: 4px solid #c69026;
}

/* 自定义/未知名称的兜底样式：无图标，使用主题主色 */
.alert-title-custom {
  color: var(--md-primary-color);
}

.markdown-alert-custom {
  border-left: 4px solid var(--md-primary-color);
}

/* 学术环境正文使用斜体，符合数学写作惯例 */
.markdown-alert-theorem > :not(.markdown-alert-title),
.markdown-alert-lemma > :not(.markdown-alert-title),
.markdown-alert-corollary > :not(.markdown-alert-title),
.markdown-alert-proposition > :not(.markdown-alert-title),
.markdown-alert-definition > :not(.markdown-alert-title),
.markdown-alert-axiom > :not(.markdown-alert-title),
.markdown-alert-postulate > :not(.markdown-alert-title),
.markdown-alert-assumption > :not(.markdown-alert-title) {
  font-style: italic;
}

/* ==================== 代码块 ==================== */
pre.code__pre,
.hljs.code__pre {
  font-size: 90%;
  overflow-x: auto;
  border-radius: 8px;
  padding: 0 !important;
  line-height: 1.5;
  margin: 10px 8px;
}

/* ==================== 图片 ==================== */
img {
  display: block;
  max-width: 100%;
  margin: 0.1em auto 0.5em;
  border-radius: 4px;
}

/* ==================== 列表 ==================== */
ol {
  padding-left: 1em;
  margin-left: 0;
  color: hsl(var(--foreground));
}

ul {
  list-style: circle;
  padding-left: 1em;
  margin-left: 0;
  color: hsl(var(--foreground));
}

li {
  display: block;
  margin: 0.2em 8px;
  color: hsl(var(--foreground));
}

/* ==================== 脚注 ==================== */
/* footnotes 在 buildFootnotes() 中渲染为 <p> 标签 */
p.footnotes {
  margin: 0.5em 8px;
  font-size: 80%;
  color: hsl(var(--foreground));
}

/* ==================== 图表 ==================== */
figure {
  margin: 1.5em 8px;
  color: hsl(var(--foreground));
}

figcaption,
.md-figcaption {
  text-align: center;
  color: color-mix(in srgb, hsl(var(--foreground)) 50%, transparent);
  font-size: 0.8em;
}

/* ==================== 分隔线 ==================== */
hr {
  border-style: solid;
  border-width: 2px 0 0;
  border-color: rgba(0, 0, 0, 0.1);
  -webkit-transform-origin: 0 0;
  -webkit-transform: scale(1, 0.5);
  transform-origin: 0 0;
  transform: scale(1, 0.5);
  height: 0.4em;
  margin: 1.5em 0;
}

/* ==================== 行内代码 ==================== */
.codespan {
  font-size: 90%;
  color: var(--md-primary-color);
  background: color-mix(in srgb, var(--md-primary-color) 8%, transparent);
  padding: 3px 5px;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--md-primary-color) 20%, transparent);
}

/* 代码块内的 code 标签需要特殊处理（覆盖行内 code 样式） */
pre.code__pre > code,
.hljs.code__pre > code {
  display: -webkit-box;
  padding: 0.5em 1em 1em;
  overflow-x: auto;
  text-indent: 0;
  color: inherit;
  background: none;
  white-space: nowrap;
  margin: 0;
}

/* ==================== 强调 ==================== */
em {
  font-style: italic;
  font-size: inherit;
}

/* ==================== 链接 ==================== */
a {
  color: #576b95;
  text-decoration: none;
}

/* ==================== 粗体 ==================== */
strong {
  color: var(--md-primary-color);
  font-weight: bold;
  font-size: inherit;
}

/* ==================== 表格 ==================== */
table {
  color: hsl(var(--foreground));
}

thead {
  font-weight: bold;
  color: hsl(var(--foreground));
}

th {
  border: 1px solid color-mix(in srgb, hsl(var(--foreground)) 15%, transparent);
  padding: 0.25em 0.5em;
  color: hsl(var(--foreground));
  word-break: keep-all;
  background: color-mix(in srgb, hsl(var(--foreground)) 5%, transparent);
}

td {
  border: 1px solid color-mix(in srgb, hsl(var(--foreground)) 15%, transparent);
  padding: 0.25em 0.5em;
  color: hsl(var(--foreground));
  word-break: keep-all;
}

/* ==================== KaTeX 公式 ==================== */
.katex-inline {
  max-width: 100%;
  overflow-x: auto;
}

.katex-block {
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0.5em 0;
  text-align: center;
}

.katex-pending {
  color: hsl(var(--muted-foreground, 0 0% 45%));
  font-size: 0.875em;
}

.katex-block.katex-pending {
  padding: 0.75em 0;
}

.katex-inline.katex-pending {
  opacity: 0.75;
}

/* ==================== 标记高亮 ==================== */
.markup-highlight {
  background-color: var(--md-primary-color);
  padding: 2px 4px;
  border-radius: 2px;
  color: #fff;
}

.markup-underline {
  text-decoration: underline;
  text-decoration-color: var(--md-primary-color);
}

.markup-wavyline {
  text-decoration: underline wavy;
  text-decoration-color: var(--md-primary-color);
  text-decoration-thickness: 2px;
}
`,y=`/**
 * MD 优雅主题 (@brzhang)
 * 在默认主题基础上添加优雅的视觉效果
 */

/* ==================== 标题样式 ==================== */
h1 {
  padding: 0.5em 1em;
  border-bottom: 2px solid var(--md-primary-color);
  font-size: calc(var(--md-font-size) * 1.4);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  padding: 0.3em 1em;
  border-radius: 8px;
  font-size: calc(var(--md-font-size) * 1.3);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h3 {
  padding-left: 12px;
  font-size: calc(var(--md-font-size) * 1.2);
  border-left: 4px solid var(--md-primary-color);
  border-bottom: 1px dashed var(--md-primary-color);
}

h4 {
  font-size: calc(var(--md-font-size) * 1.1);
}

h5 {
  font-size: var(--md-font-size);
}

h6 {
  font-size: var(--md-font-size);
}

/* ==================== 引用块 ==================== */
blockquote {
  font-style: italic;
  padding: 1em 1em 1em 2em;
  border-left: 4px solid var(--md-primary-color);
  border-radius: 6px;
  color: rgba(0, 0, 0, 0.6);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 1em;
}

.markdown-alert {
  font-style: italic;
}

/* ==================== 行内代码 ==================== */
.codespan {
  font-family: 'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* ==================== 代码块 ==================== */
pre.code__pre,
.hljs.code__pre {
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

pre.code__pre > code,
.hljs.code__pre > code {
  font-family: 'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace;
}

/* ==================== 图片 ==================== */
img {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

figcaption,
.md-figcaption {
  text-align: center;
  color: #888;
  font-size: 0.8em;
}

/* ==================== 列表 ==================== */
ol {
  padding-left: 1.5em;
}

ul {
  list-style: none;
  padding-left: 1.5em;
}

li {
  margin: 0.5em 8px;
}

/* ==================== 分隔线 ==================== */
hr {
  height: 1px;
  border: none;
  margin: 2em 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));
}

/* ==================== 表格 ==================== */
table {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  margin: 1em 8px;
  color: hsl(var(--foreground));
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

thead {
  color: #fff;
}

td {
  padding: 0.5em 1em;
}

/* ==================== 强调 ==================== */
em {
  font-style: italic;
  font-size: inherit;
}

/* ==================== 链接 ==================== */
a {
  color: #576b95;
  text-decoration: none;
}
`,b=`/**
 * MD 简洁主题 (@okooo5km)
 * 简洁现代的设计风格
 */

/* ==================== 标题样式 ==================== */
h1 {
  padding: 0.5em 1em;
  font-size: calc(var(--md-font-size) * 1.4);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.05);
}

h2 {
  padding: 0.3em 1.2em;
  font-size: calc(var(--md-font-size) * 1.3);
  border-radius: 8px 24px 8px 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

h3 {
  padding-left: 12px;
  font-size: calc(var(--md-font-size) * 1.2);
  border-radius: 6px;
  line-height: 2.4em;
  border-left: 4px solid var(--md-primary-color);
  border-right: 1px solid color-mix(in srgb, var(--md-primary-color) 10%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--md-primary-color) 10%, transparent);
  border-top: 1px solid color-mix(in srgb, var(--md-primary-color) 10%, transparent);
  background: color-mix(in srgb, var(--md-primary-color) 8%, transparent);
}

h4 {
  font-size: calc(var(--md-font-size) * 1.1);
  border-radius: 6px;
}

h5 {
  font-size: var(--md-font-size);
  border-radius: 6px;
}

h6 {
  font-size: var(--md-font-size);
  border-radius: 6px;
}

/* ==================== 引用块 ==================== */
blockquote {
  font-style: italic;
  padding: 1em 1em 1em 2em;
  color: rgba(0, 0, 0, 0.6);
  border-bottom: 0.2px solid rgba(0, 0, 0, 0.04);
  border-top: 0.2px solid rgba(0, 0, 0, 0.04);
  border-right: 0.2px solid rgba(0, 0, 0, 0.04);
}

/* GFM Alert 样式覆盖 */
.markdown-alert-note,
.markdown-alert-tip,
.markdown-alert-info,
.markdown-alert-important,
.markdown-alert-warning,
.markdown-alert-caution {
  font-style: italic;
}

/* ==================== 行内代码 ==================== */
.codespan {
  font-family: 'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--md-primary-color) 15%, transparent);
}

/* ==================== 代码块 ==================== */
pre.code__pre,
.hljs.code__pre {
  border: 1px solid rgba(0, 0, 0, 0.04);
}

pre.code__pre > code,
.hljs.code__pre > code {
  font-family: 'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace;
}

/* ==================== 图片 ==================== */
img {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

figcaption,
.md-figcaption {
  text-align: center;
  color: #888;
  font-size: 0.8em;
}

/* ==================== 列表 ==================== */
ol {
  padding-left: 1.5em;
}

ul {
  list-style: none;
  padding-left: 1.5em;
}

li {
  margin: 0.5em 8px;
}

/* ==================== 分隔线 ==================== */
hr {
  height: 1px;
  border: none;
  margin: 2em 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));
}

/* ==================== 强调 ==================== */
em {
  font-style: italic;
  font-size: inherit;
}

/* ==================== 链接 ==================== */
a {
  color: #576b95;
  text-decoration: none;
}
`,x=_,S={default:v,grace:y,simple:b},C={default:{label:`经典`,value:`default`,desc:``},grace:{label:`优雅`,value:`grace`,desc:`@brzhang`},simple:{label:`简洁`,value:`simple`,desc:`@okooo5km`}},w=[{label:`经典`,value:`default`,desc:``},{label:`优雅`,value:`grace`,desc:`@brzhang`},{label:`简洁`,value:`simple`,desc:`@okooo5km`}],T=[{label:`无衬线`,value:`-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif`,desc:`字体123Abc`},{label:`衬线`,value:`Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif`,desc:`字体123Abc`},{label:`等宽`,value:`Menlo, Monaco, 'Courier New', monospace`,desc:`字体123Abc`}],E=[{label:`14px`,value:`14px`,desc:`更小`},{label:`15px`,value:`15px`,desc:`稍小`},{label:`16px`,value:`16px`,desc:`推荐`},{label:`17px`,value:`17px`,desc:`稍大`},{label:`18px`,value:`18px`,desc:`更大`}],D=[{label:`经典蓝`,value:`#0F4C81`,desc:`稳重冷静`},{label:`翡翠绿`,value:`#009874`,desc:`自然平衡`},{label:`活力橘`,value:`#FA5151`,desc:`热情活力`},{label:`柠檬黄`,value:`#FECE00`,desc:`明亮温暖`},{label:`薰衣紫`,value:`#92617E`,desc:`优雅神秘`},{label:`天空蓝`,value:`#55C9EA`,desc:`清爽自由`},{label:`玫瑰金`,value:`#B76E79`,desc:`奢华现代`},{label:`橄榄绿`,value:`#556B2F`,desc:`沉稳自然`},{label:`石墨黑`,value:`#333333`,desc:`内敛极简`},{label:`雾烟灰`,value:`#A9A9A9`,desc:`柔和低调`},{label:`樱花粉`,value:`#FFB7C5`,desc:`浪漫甜美`}],O=[{label:`移动端`,value:`w-[375px]`,desc:`固定`},{label:`电脑端`,value:`w-full`,desc:`适应`}],k=`https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlightjs/11.11.1/styles/`,A=`1c-light.a11y-dark.a11y-light.agate.an-old-hope.androidstudio.arduino-light.arta.ascetic.atom-one-dark-reasonable.atom-one-dark.atom-one-light.brown-paper.codepen-embed.color-brewer.dark.default.devibeans.docco.far.felipec.foundation.github-dark-dimmed.github-dark.github.gml.googlecode.gradient-dark.gradient-light.grayscale.hybrid.idea.intellij-light.ir-black.isbl-editor-dark.isbl-editor-light.kimbie-dark.kimbie-light.lightfair.lioshi.magula.mono-blue.monokai-sublime.monokai.night-owl.nnfx-dark.nnfx-light.nord.obsidian.panda-syntax-dark.panda-syntax-light.paraiso-dark.paraiso-light.pojoaque.purebasic.qtcreator-dark.qtcreator-light.rainbow.routeros.school-book.shades-of-purple.srcery.stackoverflow-dark.stackoverflow-light.sunburst.tokyo-night-dark.tokyo-night-light.tomorrow-night-blue.tomorrow-night-bright.vs.vs2015.xcode.xt256`.split(`.`).map(e=>({label:e,value:`${k}${e}.min.css`,desc:``})),j=[{label:`一级标题`,value:`h1`,desc:``},{label:`二级标题`,value:`h2`,desc:``},{label:`三级标题`,value:`h3`,desc:``},{label:`四级标题`,value:`h4`,desc:``},{label:`五级标题`,value:`h5`,desc:``},{label:`六级标题`,value:`h6`,desc:``}],M=[{label:`默认`,value:`default`,desc:``},{label:`主题色文字`,value:`color-only`,desc:``},{label:`下边框`,value:`border-bottom`,desc:``},{label:`左边框`,value:`border-left`,desc:``},{label:`自定义`,value:`custom`,desc:``}],N={},P=[{label:`title 优先`,value:`title-alt`,desc:``},{label:`alt 优先`,value:`alt-title`,desc:``},{label:`只显示 title`,value:`title`,desc:``},{label:`只显示 alt`,value:`alt`,desc:``},{label:`文件名`,value:`filename`,desc:``},{label:`不显示`,value:`none`,desc:``}],F={isCiteStatus:!1,isMacCodeBlock:!0,isShowLineNumber:!1,isCountStatus:!1,theme:w[0].value,fontFamily:T[0].value,fontSize:E[2].value,primaryColor:D[0].value,codeBlockTheme:A[23].value,legend:P[3].value,headingStyles:N};function I(){return{primaryColor:F.primaryColor,fontFamily:F.fontFamily,fontSize:F.fontSize,codeBlockTheme:F.codeBlockTheme,headingStyles:{...F.headingStyles},isShowLineNumber:F.isShowLineNumber,isMacCodeBlock:F.isMacCodeBlock}}function L(e){return`${l}__${e}`}var R=class{async get(e){try{return localStorage.getItem(e)}catch(t){return console.error(`[Storage] Failed to get item:`,e,t),null}}async set(e,t){try{localStorage.setItem(e,t)}catch(t){throw console.error(`[Storage] Failed to set item:`,e,t),t}}async remove(e){try{localStorage.removeItem(e)}catch(t){console.error(`[Storage] Failed to remove item:`,e,t)}}async has(e){try{return localStorage.getItem(e)!==null}catch{return!1}}async clear(){try{localStorage.clear()}catch(e){console.error(`[Storage] Failed to clear storage:`,e)}}async keys(){try{return Object.keys(localStorage)}catch{return[]}}},z=new class{engine=new R;setEngine(e){this.engine=e}getEngine(){return this.engine}async get(e){return this.engine.get(e)}async set(e,t){return this.engine.set(e,t)}async getJSON(e,t){let n=await this.engine.get(e);if(!n)return t??null;try{return JSON.parse(n)}catch(n){return console.error(`[Storage] Failed to parse JSON for key:`,e,n),t??null}}async setJSON(e,t){try{let n=JSON.stringify(t);return this.engine.set(e,n)}catch(t){throw console.error(`[Storage] Failed to stringify JSON for key:`,e,t),t}}async remove(e){return this.engine.remove(e)}async has(e){return this.engine.has(e)}async clear(){return this.engine.clear()}async keys(){return this.engine.keys()}reactive(n,r){let i=typeof r==`string`,a=r;if(this.engine instanceof R)try{let e=localStorage.getItem(n);e!==null&&(a=i?e:this.parseJSON(e,r))}catch(e){console.error(`[Storage] Failed to read initial value:`,n,e)}let o=t(a);return this.engine instanceof R||(i?this.get(n).then(e=>e===null?null:e):this.getJSON(n,r)).then(e=>{e!==null&&(o.value=e)}),Promise.resolve().then(()=>{e(o,e=>{(i?this.set(n,e):this.setJSON(n,e)).catch(e=>{console.error(`[Storage] Failed to save reactive data:`,n,e)})},{deep:!0})}),o}customReactive(e,t,r){let i=t;return this.getJSON(e,t).then(e=>{let n=e??t;i=r?.get?r.get(n):n}),n((t,n)=>({get(){return t(),i},set:t=>{let a=r?.set?r.set(t):t;i=a,n(),this.setJSON(e,a).catch(t=>{console.error(`[Storage] Failed to save custom reactive data:`,e,t)})}}))}parseJSON(e,t){try{return JSON.parse(e)}catch{return console.warn(`[Storage] Failed to parse JSON, using fallback`),t}}};export{c as C,a as D,i as E,m as S,o as T,g as _,I as a,f as b,E as c,P as d,O as f,S as g,x as h,D as i,j as l,C as m,L as n,F as o,w as p,A as r,T as s,z as t,M as u,p as v,s as w,h as x,d as y};