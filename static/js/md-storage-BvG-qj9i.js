import{Wt as e,bn as t,in as n}from"./md-vendor_floating-ui_vue-0Szr0FYJ.js";import{t as r}from"./md-vendor_idb-CdbSE3_O.js";import{t as i}from"./md-vendor_vue-i18n-CvkaKnhL.js";import{n as a}from"./md-vendor_vue-sonner-CCWywICc.js";import{_ as o}from"./md-vendor_mermaid-eDoCZDE6.js";var s=`https://proxy-ai.doocs.org/v1`,c=1024,l=`default`,u=``,d=[{value:`default`,label:`内置服务`,endpoint:s,models:`Qwen/Qwen2.5-7B-Instruct,Qwen/Qwen2.5-Coder-7B-Instruct,Qwen/Qwen2-7B-Instruct,deepseek-ai/DeepSeek-R1-Distill-Qwen-7B,THUDM/GLM-Z1-9B-0414,THUDM/GLM-4-9B-0414,internlm/internlm2_5-7b-chat,qwen/qwen3-30b-a3b:free,qwen/qwen3-8b:free,qwen/qwen3-14b:free,qwen/qwen3-32b:free,qwen/qwen3-235b-a22b:free,tngtech/deepseek-r1t-chimera:free,thudm/glm-z1-9b:free,thudm/glm-z1-32b:free,thudm/glm-4-9b:free,thudm/glm-4-32b:free,microsoft/mai-ds-r1:free,arliai/qwq-32b-arliai-rpr-v1:free,nvidia/llama-3.3-nemotron-super-49b-v1:free,nvidia/llama-3.1-nemotron-ultra-253b-v1:free,meta-llama/llama-4-maverick:free,meta-llama/llama-4-scout:free,deepseek/deepseek-v3-base:free,qwen/qwen2.5-vl-3b-instruct:free,qwen/qwen2.5-vl-32b-instruct:free`.split(`,`)},{value:`deepseek`,label:`DeepSeek`,endpoint:`https://api.deepseek.com`,models:[`deepseek-v4-pro`,`deepseek-v4-flash`,`deepseek-chat`,`deepseek-reasoner`]},{value:`openai`,label:`OpenAI`,endpoint:`https://api.openai.com/v1`,models:[`gpt-5.5`,`gpt-5.4`,`gpt-5.4-mini`,`gpt-5.4-nano`,`gpt-5-mini`,`gpt-5-nano`,`o3`,`o3-mini`,`o4-mini`,`gpt-4.1`,`gpt-4.1-mini`,`gpt-4.1-nano`,`gpt-4o`,`gpt-4o-mini`,`gpt-4-turbo`]},{value:`google`,label:`Google Gemini`,endpoint:`https://generativelanguage.googleapis.com/v1beta/openai/`,models:[`gemini-3.5-flash`,`gemini-3.1-flash-lite`,`gemini-2.5-pro`,`gemini-2.5-flash`,`gemini-2.5-flash-lite`,`gemini-2.0-flash`]},{value:`xai`,label:`xAI Grok`,endpoint:`https://api.x.ai/v1`,models:[`grok-4`,`grok-3`,`grok-3-mini`,`grok-3-fast`,`grok-2`,`grok-2-vision-1212`]},{value:`mistral`,label:`Mistral AI`,endpoint:`https://api.mistral.ai/v1`,models:[`mistral-large-latest`,`mistral-medium-latest`,`mistral-small-latest`,`codestral-latest`,`ministral-8b-latest`,`ministral-3b-latest`,`pixtral-large-latest`]},{value:`openrouter`,label:`OpenRouter`,endpoint:`https://openrouter.ai/api/v1`,models:[`openai/gpt-5.4`,`anthropic/claude-sonnet-4-6`,`anthropic/claude-opus-4-8`,`google/gemini-2.5-pro`,`google/gemini-2.5-flash`,`deepseek/deepseek-v4-pro`,`deepseek/deepseek-v4-flash`,`meta-llama/llama-4-maverick`,`x-ai/grok-3`,`mistralai/mistral-large-latest`,`qwen/qwen3-235b-a22b`]},{value:`groq`,label:`Groq`,endpoint:`https://api.groq.com/openai/v1`,models:[`llama-3.3-70b-versatile`,`llama-3.1-8b-instant`,`openai/gpt-oss-120b`,`openai/gpt-oss-20b`,`mixtral-8x7b-32768`,`gemma2-9b-it`]},{value:`qwen`,label:`通义千问`,endpoint:`https://dashscope.aliyuncs.com/compatible-mode/v1`,models:[`qwen3-max`,`qwen3-plus`,`qwen3-flash`,`qwen-max-latest`,`qwen-plus-latest`,`qwen-turbo-latest`,`qwen-long`,`qwen-vl-max-latest`,`qwen-vl-plus-latest`,`qwen-coder-plus-latest`,`qwen-coder-turbo-latest`,`qwen2.5-72b-instruct`,`qwen2.5-32b-instruct`,`qwen2.5-14b-instruct`,`qwen2.5-7b-instruct`,`qwen2.5-coder-32b-instruct`,`qwen2.5-coder-7b-instruct`,`deepseek-v3`,`deepseek-r1`]},{value:`hunyuan`,label:`腾讯混元`,endpoint:`https://api.hunyuan.cloud.tencent.com/v1`,models:[`hunyuan-turbos-latest`,`hunyuan-t1-latest`,`hunyuan-pro`,`hunyuan-turbo`,`hunyuan-standard-256k`,`hunyuan-standard-32K`,`hunyuan-standard`,`hunyuan-lite`,`hunyuan-code`,`hunyuan-vision`,`hunyuan-role`,`hunyuan-functioncall`,`hunyuan-turbo-vision`]},{value:`doubao`,label:`火山方舟`,endpoint:`https://ark.cn-beijing.volces.com/api/v3`,models:[`doubao-seed-1-6-250615`,`doubao-seed-1-6-flash-250615`,`doubao-1-5-thinking-pro-250415`,`doubao-1-5-thinking-pro-m-250415`,`doubao-1-5-pro-256k-250115`,`doubao-1-5-pro-32k-250115`,`doubao-1-5-lite-32k-250115`,`doubao-1-5-vision-pro-250328`,`doubao-1-5-vision-lite-250315`,`deepseek-v3-250324`,`deepseek-r1-250120`,`kimi-k2-250711`]},{value:`siliconflow`,label:`硅基流动`,endpoint:`https://api.siliconflow.cn/v1`,models:[`deepseek-ai/DeepSeek-V3.2`,`deepseek-ai/DeepSeek-R1`,`deepseek-ai/DeepSeek-V3`,`Qwen/Qwen3-235B-A22B`,`Qwen/Qwen3-32B`,`Qwen/Qwen3-30B-A3B`,`Qwen/Qwen3-14B`,`Qwen/Qwen3-8B`,`THUDM/GLM-Z1-32B-0414`,`THUDM/GLM-4-32B-0414`,`THUDM/GLM-4-9B-0414`,`Qwen/QwQ-32B`,`Qwen/Qwen2.5-72B-Instruct`,`Qwen/Qwen2.5-32B-Instruct`,`Qwen/Qwen2.5-14B-Instruct`,`Qwen/Qwen2.5-7B-Instruct`,`Qwen/Qwen2.5-Coder-32B-Instruct`,`Qwen/Qwen2.5-Coder-7B-Instruct`,`Pro/deepseek-ai/DeepSeek-R1`,`Pro/deepseek-ai/DeepSeek-V3`,`internlm/internlm2_5-20b-chat`,`internlm/internlm2_5-7b-chat`]},{value:`302ai`,label:`302.AI`,endpoint:`https://api.302.ai/v1`,models:[`gpt-5.4`,`gpt-5.4-mini`,`gpt-4.1`,`gpt-4o`,`gpt-4o-mini`,`o3`,`o4-mini`,`claude-sonnet-4-6`,`claude-opus-4-8`,`claude-haiku-4-5-20251001`,`gemini-2.5-pro`,`gemini-2.5-flash`,`deepseek-v4-pro`,`deepseek-v4-flash`,`grok-3`,`grok-3-mini`]},{value:`bigmodel`,label:`智谱 AI`,endpoint:`https://open.bigmodel.cn/api/paas/v4`,models:[`glm-4.7`,`glm-4.7-flashx`,`glm-4.7-flash`,`glm-4.6`,`glm-4.5-air`,`glm-4.5-airx`,`glm-4-long`,`glm-4-flash-250414`,`glm-4-flashx-250414`]},{value:`baichuan`,label:`百川智能`,endpoint:`https://api.baichuan-ai.com/v1`,models:[`Baichuan4-Turbo`,`Baichuan4-Air`,`Baichuan4`,`Baichuan3-Turbo-128k`,`Baichuan3-Turbo`]},{value:`lingyiwanwu`,label:`零一万物`,endpoint:`https://api.lingyiwanwu.com/v1`,models:[`yi-lightning`,`yi-large`,`yi-medium`,`yi-spark`]},{value:`moonshot`,label:`月之暗面`,endpoint:`https://api.moonshot.cn/v1`,models:[`kimi-k2.7-code`,`kimi-k2.7-code-highspeed`,`kimi-k2.6`,`kimi-k2.5`,`moonshot-v1-128k-vision-preview`,`moonshot-v1-32k-vision-preview`,`moonshot-v1-8k-vision-preview`,`moonshot-v1-128k`,`moonshot-v1-32k`,`moonshot-v1-8k`]},{value:`minimax`,label:`MiniMax`,endpoint:`https://api.minimaxi.com/v1`,models:[`MiniMax-M2.5`,`MiniMax-M2.5-highspeed`,`MiniMax-M2.1`,`MiniMax-M2.1-highspeed`,`MiniMax-Text-01`,`abab6.5s-chat`,`abab6.5g-chat`,`abab6.5t-chat`]},{value:`stepfun`,label:`阶跃星辰`,endpoint:`https://api.stepfun.com/v1`,models:[`step-2-16k`,`step-2-mini`,`step-1-8k`,`step-1-flash`]},{value:`ernie`,label:`百度千帆`,endpoint:`https://qianfan.baidubce.com/v2`,models:[`ernie-4.5-turbo-128k`,`ernie-4.5-turbo-32k`,`ernie-4.5-8k-preview`,`ernie-4.0-turbo-128k`,`ernie-4.0-turbo-8k`,`ernie-4.0-8k`,`ernie-speed-pro-128k`,`ernie-speed-128k`,`ernie-lite-pro-128k`,`ernie-lite-8k`,`ernie-tiny-8k`]},{value:`custom`,label:`自定义兼容 OpenAI API 的服务`,endpoint:``,models:[]}],f=[{value:`default`,label:`内置服务`,endpoint:s,models:[`Kwai-Kolors/Kolors`]},{value:`openai`,label:`OpenAI`,endpoint:`https://api.openai.com/v1`,models:[`gpt-image-1`,`gpt-image-1-mini`,`dall-e-3`,`dall-e-2`]},{value:`google`,label:`Google Gemini`,endpoint:`https://generativelanguage.googleapis.com/v1beta/openai/`,models:[`gemini-2.5-flash-image`,`gemini-3-pro-image`,`gemini-3.1-flash-image`]},{value:`siliconflow`,label:`硅基流动`,endpoint:`https://api.siliconflow.cn/v1`,models:[`Kwai-Kolors/Kolors`,`Qwen/Qwen-Image`,`Qwen/Qwen-Image-Plus`]},{value:`302ai`,label:`302.AI`,endpoint:`https://api.302.ai/302`,models:[`gpt-image-1`,`gemini-2.5-flash-image`,`302-gemini-2.5-flash-image`,`doubao-seedream-4-0-250828`,`doubao-seedream-3-0-t2i-250415`,`flux-kontext-max`,`flux-kontext-pro`,`midjourney-v7`,`midjourney-v6-1`,`ideogram-v3`,`ideogram-v3-turbo`,`kling-v2`,`wan2.5-t2i-preview`,`official-qwen-image-plus`,`official-qwen-image`,`recraft-v3`,`stable-sd3-ultra`,`cogview-4`,`dall-e-3`,`302ai-flux-1-srpo`]},{value:`custom`,label:`自定义兼容 OpenAI API 的服务`,endpoint:``,models:[]}],p=`MD`,m=typeof navigator<`u`&&/Mac/i.test(navigator.userAgent),ee=`Mod`,te=m?`⌘`:`Ctrl`,ne=m?`⌥`:`Alt`,re=m?`⇧`:`Shift`,ie=[{level:1,label:`标题 1`},{level:2,label:`标题 2`},{level:3,label:`标题 3`},{level:4,label:`标题 4`},{level:5,label:`标题 5`},{level:6,label:`标题 6`}],ae=`/**
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
`,oe=`/**
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
`,se=`/**
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
`,ce=`/**
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
`,le=ae,ue={default:oe,grace:se,simple:ce},de=[{label:`经典`,value:`default`,desc:``},{label:`优雅`,value:`grace`,desc:`@brzhang`},{label:`简洁`,value:`simple`,desc:`@okooo5km`}],h=[{label:`无衬线`,value:`-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif`,desc:`字体123Abc`},{label:`衬线`,value:`Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif`,desc:`字体123Abc`},{label:`等宽`,value:`Menlo, Monaco, 'Courier New', monospace`,desc:`字体123Abc`}],fe=[{label:`14px`,value:`14px`,desc:`更小`},{label:`15px`,value:`15px`,desc:`稍小`},{label:`16px`,value:`16px`,desc:`推荐`},{label:`17px`,value:`17px`,desc:`稍大`},{label:`18px`,value:`18px`,desc:`更大`}],g=[{label:`经典蓝`,value:`#0F4C81`,desc:`稳重冷静`},{label:`翡翠绿`,value:`#009874`,desc:`自然平衡`},{label:`活力橘`,value:`#FA5151`,desc:`热情活力`},{label:`柠檬黄`,value:`#FECE00`,desc:`明亮温暖`},{label:`薰衣紫`,value:`#92617E`,desc:`优雅神秘`},{label:`天空蓝`,value:`#55C9EA`,desc:`清爽自由`},{label:`玫瑰金`,value:`#B76E79`,desc:`奢华现代`},{label:`橄榄绿`,value:`#556B2F`,desc:`沉稳自然`},{label:`石墨黑`,value:`#333333`,desc:`内敛极简`},{label:`雾烟灰`,value:`#A9A9A9`,desc:`柔和低调`},{label:`樱花粉`,value:`#FFB7C5`,desc:`浪漫甜美`}],pe=[{label:`移动端`,value:`w-[375px]`,desc:`固定`},{label:`电脑端`,value:`w-full`,desc:`适应`}],me=`https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlightjs/11.11.1/styles/`,he=`1c-light.a11y-dark.a11y-light.agate.an-old-hope.androidstudio.arduino-light.arta.ascetic.atom-one-dark-reasonable.atom-one-dark.atom-one-light.brown-paper.codepen-embed.color-brewer.dark.default.devibeans.docco.far.felipec.foundation.github-dark-dimmed.github-dark.github.gml.googlecode.gradient-dark.gradient-light.grayscale.hybrid.idea.intellij-light.ir-black.isbl-editor-dark.isbl-editor-light.kimbie-dark.kimbie-light.lightfair.lioshi.magula.mono-blue.monokai-sublime.monokai.night-owl.nnfx-dark.nnfx-light.nord.obsidian.panda-syntax-dark.panda-syntax-light.paraiso-dark.paraiso-light.pojoaque.purebasic.qtcreator-dark.qtcreator-light.rainbow.routeros.school-book.shades-of-purple.srcery.stackoverflow-dark.stackoverflow-light.sunburst.tokyo-night-dark.tokyo-night-light.tomorrow-night-blue.tomorrow-night-bright.vs.vs2015.xcode.xt256`.split(`.`).map(e=>({label:e,value:`${me}${e}.min.css`,desc:``})),ge=[{label:`一级标题`,value:`h1`,desc:``},{label:`二级标题`,value:`h2`,desc:``},{label:`三级标题`,value:`h3`,desc:``},{label:`四级标题`,value:`h4`,desc:``},{label:`五级标题`,value:`h5`,desc:``},{label:`六级标题`,value:`h6`,desc:``}],_e=[{label:`默认`,value:`default`,desc:``},{label:`主题色文字`,value:`color-only`,desc:``},{label:`下边框`,value:`border-bottom`,desc:``},{label:`左边框`,value:`border-left`,desc:``},{label:`自定义`,value:`custom`,desc:``}],ve={},_=[{label:`title 优先`,value:`title-alt`,desc:``},{label:`alt 优先`,value:`alt-title`,desc:``},{label:`只显示 title`,value:`title`,desc:``},{label:`只显示 alt`,value:`alt`,desc:``},{label:`文件名`,value:`filename`,desc:``},{label:`不显示`,value:`none`,desc:``}],v={isCiteStatus:!1,isMacCodeBlock:!0,isShowLineNumber:!1,isCountStatus:!1,theme:de[0].value,fontFamily:h[0].value,fontSize:fe[2].value,primaryColor:g[0].value,codeBlockTheme:he[23].value,legend:_[3].value,headingStyles:ve};function ye(){return{primaryColor:v.primaryColor,fontFamily:v.fontFamily,fontSize:v.fontSize,codeBlockTheme:v.codeBlockTheme,headingStyles:{...v.headingStyles},isShowLineNumber:v.isShowLineNumber,isMacCodeBlock:v.isMacCodeBlock}}function y(e){return`${p}__${e}`}var be=`doocs-md`,b=`documents`,x=`settings`,S=`secrets`,C=`cache`,w=`meta`,xe=y(`storage_migrated_v1`),T=y(`storage_localstorage_cleaned_v1`),Se=`${p}__`,Ce=new Set([`isCiteStatus`,`isCountStatus`,`legend`,`previewWidth`,`showAIToolbox`,`viewMode`,`previewDevice`,`locale`,`openai_type`,`openai_temperature`,`openai_max_token`,`quick_commands`,`imgHost`,`useCompression`,`isShowCssEditor`,`hasShownAIToolboxHint`,`isMobile`,`formCustomConfig`]);y(`current_post_id`),y(`sort_mode`);var E=y(`posts`),we=[`Config`],Te=[`openai_key_`,`openai_model_`,`openai_image_key_`,`openai_image_endpoint_`,`openai_image_model_`,`mpToken:`],Ee=new Set([`uploaded_image_map`,`ai_generated_images`,`ai_image_timestamps`,`ai_image_prompts`,`ai_memory_context`,`ai_conversation_list`]),De=[`ai_conversation_`];function Oe(e){return we.some(t=>e.endsWith(t))?!0:Te.some(t=>e.startsWith(t))}function D(e){return Ee.has(e)?!0:De.some(t=>e.startsWith(t))}function O(e){return Oe(e)?S:D(e)?C:x}var k=[`fonts`,`size`,`color`,`codeBlockTheme`,`headingStyles`,`isMacCodeBlock`,`isShowLineNumber`];function ke(e){return!!(e.startsWith(Se)||k.includes(e)||Ce.has(e)||Oe(e)||D(e))}var A=y(`legacy_migrated`),Ae=y(`theme`),j=y(`themeSettings`),M=y(`mp_profile_migrated`),N=null;function P(){return N||=r(be,2,{upgrade(e){if(!e.objectStoreNames.contains(b)){let t=e.createObjectStore(b,{keyPath:`id`});t.createIndex(`updateDatetime`,`updateDatetime`),t.createIndex(`parentId`,`parentId`)}e.objectStoreNames.contains(x)||e.createObjectStore(x,{keyPath:`key`}),e.objectStoreNames.contains(S)||e.createObjectStore(S,{keyPath:`key`}),e.objectStoreNames.contains(C)||e.createObjectStore(C,{keyPath:`key`}),e.objectStoreNames.contains(w)||e.createObjectStore(w,{keyPath:`key`})}}),N}async function F(e){return(await(await P()).get(w,e))?.value??null}async function I(e,t){await(await P()).put(w,{key:e,value:t})}var je=`locale`,L=`zh-CN`,Me=[`zh-CN`,`en-US`],Ne=[{value:`zh-CN`,labelKey:`locale.zhCN`},{value:`en-US`,labelKey:`locale.enUS`}],Pe={toolbar:{expand:`Expand AI toolbar`,openToolboxHint:`Click to open AI toolbox`,assistant:`AI Assistant`,assistantLabel:`Assistant`,imageGen:`AI Image Gen`,imageGenLabel:`Image`,toolbox:`AI Toolbox`,toolboxLabel:`Toolbox`},chat:{title:`AI Chat`,configParams:`Settings`,imageGen:`AI Image Gen`,newSession:`New session`,loadConversation:`Load conversation`,clearConversation:`Clear conversation`,description:`Use AI to help you write and refine content`,noSavedConversations:`No saved conversations`,noQuickCommands:`No quick commands yet. Click + to add one.`,manageCommands:`Manage commands`,greeting:`Hi, I'm your AI assistant. How can I help?`,conversationTitle:`Chat {date}`,sessionCreated:`New session created`,conversationLoaded:`Conversation loaded`,conversationDeleted:`Conversation deleted`,insertedToDoc:`Inserted into document`,sessionCleared:`Session cleared`,thinking:`Thinking…`,copyContent:`Copy content`,insertDoc:`Insert into document`,regenerate:`Regenerate`,inputPlaceholder:`Say something… (Enter to send, Shift+Enter for new line)`,quoteFullText:`Quote full text`,pause:`Pause`,send:`Send`,requestFailed:`❌ Request failed: {message}`,systemQuote:`Below is the full Markdown article. Follow it strictly for subsequent instructions:

{content}`,systemPrompt:`You are a professional Markdown editor assistant. Reply concisely in the user's language.`},image:{title:`AI Image Gen`,configParams:`Settings`,chat:`AI Chat`,clearImages:`Clear images`,description:`Generate images from text descriptions with AI`,generating:`Generating image...`,cancelGeneration:`Cancel`,previous:`Previous`,next:`Next`,generatedImageAlt:`Generated image {n}`,clickToViewLarge:`Click to view full size`,size:`Size`,prompt:`Prompt`,noPrompt:`No associated prompt`,remainingValidity:`Remaining validity`,downloadReminder:`. Please download promptly`,insert:`Insert`,download:`Download`,copy:`Copy`,regenerate:`Regenerate`,inputPlaceholder:`Describe the image you want… (Enter to generate, Shift+Enter for new line)`,cancel:`Cancel`,generate:`Generate`,preview:`Image preview`,closePreview:`Close preview`,previewLarge:`Full-size preview`,noValidData:`No valid image data received`,generateFailed:`Image generation failed: {message}`,downloadStarted:`Download started`,downloadFailed:`Download failed. Please try again.`,copyFailed:`Copy failed. Please try again.`,aiGeneratedAlt:`AI-generated image`,insertedToEditor:`Image inserted into editor`,insertFailed:`Insert failed. Please try again.`,expired:`Expired`,timeRemaining:`{minutes}m {seconds}s`,secondsRemaining:`{seconds}s`},toolbox:{title:`AI Toolbox`,configParams:`Settings`,selectAction:`Select action`,selectActionPlaceholder:`Choose an action`,originalText:`Original text`,customPrompt:`Custom prompt (optional)`,customPromptPlaceholder:`Enter prompt and press Enter`,result:`Result`,stop:`Stop`,accept:`Accept`,retry:`Retry`,process:`AI Process`,requestFailed:`Request failed`,systemPrompt:`You are a professional multilingual text assistant. Process the content according to the user's instructions. Output only the processed text with no extra information.`,satisfyRequirements:`Also satisfy the following: {requirements}.`,optimizeDefault:`Optimize the text following best practices.`,textToProcess:`Text to process:
{text}`,actions:{optimize:{label:`Optimize text`,prompt:`Please optimize the text for clarity and readability.`},summarize:{label:`Summarize`,prompt:`Please summarize the text, highlighting key points and conclusions.`},spellcheck:{label:`Fix typos`,prompt:`Please find and correct typos, punctuation, and grammar errors.`},translateZh:{label:`Translate to Chinese`,prompt:`Please translate the text into natural Chinese.`},translateEn:{label:`Translate to English`,prompt:`Please translate the text into natural, fluent English.`},expand:{label:`Expand`,prompt:`Please expand the text with richer detail while keeping the original style and intent.`},continue:{label:`Continue writing`,prompt:`Please continue writing in the same style, keeping the language coherent.`},custom:{label:`Custom`,prompt:``}}},quickCommand:{title:`Manage quick commands`,namePlaceholder:`Command name`,templatePlaceholder:`Template with {'{'}{'{'}sel{'}'}{'}'} placeholder`,nameExamplePlaceholder:`Command name (e.g. Rewrite as SEO copy)`,templateExamplePlaceholder:`Template with {'{'}{'{'}sel{'}'}{'}'}, e.g.:
Rewrite the following as an SEO-friendly title:

{'{'}{'{'}sel{'}'}{'}'}`,polish:{label:`Polish`,template:`Please polish the following:

{'{'}{'{'}sel{'}'}{'}'}`},toEn:{label:`Translate to English`,template:`Please translate the following into English:

{'{'}{'{'}sel{'}'}{'}'}`},toZh:{label:`Translate to Chinese`,template:`Please translate the following into Chinese:

{'{'}{'{'}sel{'}'}{'}'}`},summary:{label:`Summarize`,template:`Please summarize the following:

{'{'}{'{'}sel{'}'}{'}'}`},parseFailed:`Failed to parse quick commands. Restored defaults.`},services:{default:`Built-in service`,deepseek:`DeepSeek`,openai:`OpenAI`,google:`Google Gemini`,xai:`xAI Grok`,mistral:`Mistral AI`,openrouter:`OpenRouter`,groq:`Groq`,qwen:`Qwen (Tongyi)`,hunyuan:`Tencent Hunyuan`,doubao:`Volcano Ark (Doubao)`,siliconflow:`SiliconFlow`,"302ai":`302.AI`,bigmodel:`Zhipu AI`,baichuan:`Baichuan AI`,lingyiwanwu:`01.AI (Yi)`,moonshot:`Moonshot AI`,minimax:`MiniMax`,stepfun:`StepFun`,ernie:`Baidu Qianfan (ERNIE)`,custom:`Custom OpenAI-compatible service`},imageServices:{default:`Built-in service`,openai:`OpenAI`,google:`Google Gemini`,siliconflow:`SiliconFlow`,"302ai":`302.AI`,custom:`Custom OpenAI-compatible service`},config:{title:`AI Settings`,serviceType:`Service type`,apiEndpoint:`API endpoint`,apiEndpointPlaceholder:`Enter API endpoint URL`,apiKey:`API key`,modelName:`Model name`,selectModel:`Select a model`,modelPlaceholder:`Enter model name`,temperature:`Temperature`,temperatureHint:`Controls randomness: lower values are more deterministic, higher values more random.`,temperaturePlaceholder:`0 ~ 2, default 1`,maxTokens:`Max tokens`,maxTokensPlaceholder:`e.g. 1024`,saved:`✅ Settings saved`,cleared:`🗑️ AI settings cleared`,testSuccess:`✅ Test passed. /chat/completions is available`,modelNotActivated:`⚠️ Test passed, but model not activated: {model}`,testFailed:`❌ Test failed: {status} {statusText}, {errorText}`,testFailedMessage:`❌ Test failed: {message}`},imageConfig:{title:`AI Image Settings`,provider:`Provider`,apiEndpoint:`API endpoint`,model:`Model`,selectModel:`Select a model`,modelPlaceholder:`Enter model name, e.g. dall-e-3`,imageSize:`Image size`,imageQuality:`Image quality`,imageStyle:`Image style`,sizeSquare:`Square (1024x1024)`,sizeLandscape:`Landscape (1792x1024)`,sizePortrait:`Portrait (1024x1792)`,qualityStandard:`Standard`,qualityHd:`HD`,styleNatural:`Natural`,styleVivid:`Vivid`,defaultServiceTitle:`Default image service`,defaultServiceDesc:`Free to use. No API key required. Supports Kwai-Kolors/Kolors models.`,customServiceTitle:`Custom service`,customServiceDesc:`Configure any OpenAI-compatible image generation API, such as a self-hosted proxy or third-party service.`,endpointExample:`Endpoint example: https://your-api.com/v1`,saveConfig:`Save settings`,incompleteConfig:`❌ Please complete all required fields`,apiKeyRequired:`❌ Please enter API Key`,invalidEndpoint:`❌ Invalid endpoint format`,saved:`✅ Settings saved`,cleared:`🗑️ AI image settings cleared`,connectionSuccess:`✅ Connection successful`,connectionFailed:`❌ Connection failed: {message}`}},Fe={footer:{loginAccount:`Sign in`,accountWithLogin:`Account {'@'}{login}`,lineCol:`Line {line}, Col {col}`,cursorPosition:`Cursor position ({total} lines total) · Click to jump`,selectedChars:`{count} characters selected`,switchDocument:`Switch document`,searchDocuments:`Search documents...`,noMatchingDocuments:`No matching documents`,outline:`Outline`,outlineTooltip:`Document outline`,headingCount:`{count} headings`,noHeadings:`No headings`,wordCount:`Words`,charCount:`Characters`,readingTimeMinutes:`{minutes} min`,estimatedReadingTime:`Estimated reading time`,totalLines:`Total lines`,viewEdit:`Edit`,viewSplit:`Split`,viewPreview:`Preview`,mobilePreview:`Mobile preview`,desktopPreview:`Desktop preview`,disableScrollSync:`Disable scroll sync`,enableScrollSync:`Enable scroll sync`,lastModified:`Last modified`,toggleDarkMode:`Toggle dark mode`},rightSlider:{title:`Styles`,headingStyle:`Heading`,selectHeading:`Heading`,selectStyle:`Style`,styleConfig:`Actions`,codeBlockLineNumber:`Line numbers`,citeStatus:`Link → footnote`,paragraphIndent:`Indent`,paragraphJustify:`Justify`,selectCodeBlockTheme:`Code theme`},contextMenu:{textFormat:`Text Format`,resetStyle:`Reset Style`,importMd:`Import .md file`,exportMd:`Export .md file`,exportHtml:`Export .html`,exportPdf:`Export .pdf`,exportPng:`Export .png`},search:{toggleReplace:`Toggle replace`,find:`Find`,caseSensitive:`Case sensitive`,regex:`Regular expression`,findInSelection:`Find in selection`,previous:`Previous`,next:`Next`,close:`Close`,replace:`Replace`,replaceAll:`Replace all`,replacePlaceholder:`Replace (Shift+Enter for newline)`},commandPalette:{title:`Command Palette`,description:`Search and run editor commands`,searchPlaceholder:`Search commands…`,noMatch:`No matching commands`,group:{help:`Help`,view:`View`,panel:`Panels`,file:`File`,edit:`Edit`,insert:`Insert`,cloud:`Cloud`,settings:`Settings`},openPreferences:`Open preferences`,viewEdit:`View: Edit`,viewSplit:`View: Split`,viewPreview:`View: Preview`,toggleDark:`Toggle dark mode`,stylePanel:`Style panel`,formatDocument:`Format document`,insertImage:`Insert image`,insertTable:`Insert table`,insertFormula:`Insert formula`,insertComponent:`Insert component`},slash:{group:{basic:`Basic`,common:`Common`,edit:`Edit`,style:`Style`},filterMatch:`Matching "{filter}"`,theme:`Theme`,primaryColor:`Primary Color`,themeLabel:`Theme · {name}`,colorLabel:`Color · {name}`,blockquote:`Blockquote`,divider:`Divider`,codeBlock:`Code block`,formulaBlock:`Formula`},keyboard:{description:`Command palette: {shortcut}`,category:{general:`General`,edit:`Edit`,format:`Format`,navigation:`Navigation`},slashCommand:`Slash command`,closeSearchPanel:`Close search panel`,goToLine:`Go to line`,previousHeading:`Previous heading`,nextHeading:`Next heading`,outlineNavigate:`Outline panel navigation`}},Ie={locale:{label:`Language`,zhCN:`简体中文`,enUS:`English`},meta:{title:`WeChat Markdown Editor | Doocs`,description:`Wechat Markdown Editor | A minimalist Markdown editor for WeChat Official Accounts`},loader:{tagline:`Making Markdown editing simpler`,loading:`Loading editor`,timeout:`Loading is taking too long. Try refreshing the page or press F12 to check the console for errors.`},common:{tip:`Notice`,cancel:`Cancel`,confirm:`Confirm`,save:`Save`,create:`Create`,edit:`Edit`,delete:`Delete`,close:`Close`,copy:`Copy`,reset:`Reset`,clear:`Clear`,loading:`Loading...`,login:`Sign in`,logout:`Sign out`,search:`Search`,export:`Export`,import:`Import`,apply:`Apply`,done:`Done`,skip:`Skip`,retry:`Retry`,refresh:`Refresh`,unnamed:`Untitled`,unknown:`Unknown`,copied:`Copied`,copyFailed:`Copy failed. Please copy manually.`,copiedToClipboard:`Copied to clipboard`,saveSuccess:`Saved successfully`,deleteSuccess:`Deleted successfully`,operationSuccess:`Operation succeeded`,operationFailed:`Operation failed`,required:`Required`,optional:`Optional`,noData:`No data`,selectAll:`Select all`,deselectAll:`Deselect all`,selected:`Selected`,unit:`items`,yes:`Yes`,no:`No`,view:`View`,open:`Open`,insert:`Insert`,download:`Download`,upload:`Upload`,uploading:`Uploading...`,processing:`Processing...`,generating:`Generating...`,testing:`Testing...`,testConnection:`Test connection`,lightMode:`Light mode`,darkMode:`Dark mode`,account:`Account`,moreActions:`More actions`,expand:`Expand`,collapse:`Collapse`,accept:`Accept`,send:`Send`,pause:`Pause`,add:`Add`,rename:`Rename`,merge:`Merge`,history:`History`,preview:`Preview`,default:`Default`,custom:`Custom`,none:`None`,enabled:`Enabled`,disabled:`Disabled`},menu:{file:`File`,edit:`Edit`,format:`Format`,insert:`Insert`,style:`Style`,help:`Help`,localFolder:`Folder`,import:`Import`,importMarkdown:`Markdown`,export:`Export`,exportMarkdown:`Markdown`,exportHtml:`HTML`,exportHtmlNoStyle:`HTML (plain)`,exportPdf:`PDF`,exportPng:`PNG`,templateManage:`Templates`,contentManage:`Content`,cloudSync:`Sync`,sharePreview:`Share`,preferences:`Preferences`,importExportConfig:`Import/Export`,undo:`Undo`,redo:`Redo`,copy:`Copy`,copyWechat:`WeChat`,copyHtml:`HTML`,copyHtmlNoStyle:`HTML (plain)`,copyHtmlCompat:`HTML (compat)`,copyMd:`Markdown`,copySelection:`Selection`,paste:`Paste`,formatContent:`Format`,reset:`Reset`,clear:`Clear`,find:`Find`,replace:`Replace`,bold:`Bold`,italic:`Italic`,strikethrough:`Strikethrough`,link:`Link`,inlineCode:`Code`,textColor:`Color`,heading:`Heading`,headingN:`H{n}`,unorderedList:`Bullet list`,orderedList:`Numbered list`,wechatLinkToCite:`Link → cite`,wordCountTime:`Stats`,image:`Image`,formula:`Formula`,table:`Table`,component:`Component`,theme:`Theme`,font:`Font`,fontSize:`Size`,primaryColor:`Color`,codeBlockTheme:`Code theme`,legendFormat:`Caption`,customPrimaryColor:`Custom color`,customCss:`Custom CSS`,macCodeBlock:`Mac style`,commandPalette:`Commands`,keyboardShortcuts:`Shortcuts`,syntaxHelp:`Syntax`,feedback:`Feedback`,releaseHistory:`Releases`,about:`About`,fund:`Support Us`},header:{copy:`Copy`,style:`Style`},toast:{copiedMarkdown:`Markdown source copied to clipboard.`,copyFailed:`Copy failed: {message}`,processHtmlFailed:`Failed to process HTML. Please contact the developer. {message}`,asyncContentPending:`Some charts or formulas are still rendering. Unloaded content was skipped. Please try again later.`,outputAreaMissing:`Copy output area not found. Please refresh the page and try again.`,copyFailedContactDev:`Copy failed. Please contact the developer. {message}`,copiedHtml:`HTML source copied. Continue with the next step.`,copiedRendered:`Rendered content copied to clipboard. You can paste it directly into the WeChat backend.`,styleReset:`Style has been reset`,contentCleared:`Content cleared`,contentReset:`Content reset`,pasteFailed:`Paste failed. Please check clipboard permissions. {message}`,storageQuota:`Local storage is full. Some settings may not be saved.`},confirm:{tip:`Notice`,resetStyleDescription:`This will discard local custom styles. Continue?`,deleteItem:`This will delete "{name}"`,deleteTemplate:`Delete template "{name}"? This cannot be undone.`,deleteComponent:`Confirm delete`,cancelShare:`Cancel share for "{title}"?`,restoreVersion:`This will replace the current content with this version. Continue?`,deleteCssScheme:`Delete {count} selected scheme(s)?`},styleOptions:{theme:{default:{label:`Classic`,desc:``},grace:{label:`Grace`,desc:`{'@'}brzhang`},simple:{label:`Simple`,desc:`{'@'}okooo5km`}},fontFamily:{sansSerif:{label:`Sans`,desc:`Font123Abc`},serif:{label:`Serif`,desc:`Font123Abc`},monospace:{label:`Mono`,desc:`Font123Abc`}},fontSize:{smaller:`XS`,slightlySmaller:`S`,recommended:`M`,slightlyLarger:`L`,larger:`XL`},color:{classicBlue:{label:`Blue`,desc:``},emeraldGreen:{label:`Emerald`,desc:``},vividOrange:{label:`Orange`,desc:``},lemonYellow:{label:`Yellow`,desc:``},lavenderPurple:{label:`Purple`,desc:``},skyBlue:{label:`Sky`,desc:``},roseGold:{label:`Rose`,desc:``},oliveGreen:{label:`Olive`,desc:``},graphiteBlack:{label:`Black`,desc:``},mistGray:{label:`Gray`,desc:``},sakuraPink:{label:`Pink`,desc:``}},headingLevel:{h1:`H1`,h2:`H2`,h3:`H3`,h4:`H4`,h5:`H5`,h6:`H6`},headingStyle:{default:`Default`,colorOnly:`Color text`,borderBottom:`Bottom line`,borderLeft:`Left line`,custom:`Custom`},legend:{titleAlt:`title first`,altTitle:`alt first`,titleOnly:`title`,altOnly:`alt`,filename:`File`,none:`None`}}},Le={share:{title:`Share Preview`,description:`Generate a read-only link that matches the editor preview for easy sharing.`,notConfiguredTitle:`Share service not configured`,notConfiguredDescription:`This deployment has no share service configured. Contact the operator to enable it.`,loginTitle:`Sign in to share preview`,tabCreate:`Create Share`,tabManage:`My Shares`,expiresIn1Day:`Expires in 1 day`,limitPerDay:`2 per day`,expiresLabel:`Link validity`,expiresMode:{"1d":`1 day`,"7d":`7 days`,"30d":`30 days`,never:`Never expires`},passwordLabel:`Access password`,passwordMode:{public:{label:`Public link`,description:`Anyone with the link can view`},custom:{label:`Custom password`,description:`Set a 4–64 character access password`},auto:{label:`Random password`,description:`System generates an 8-character password after creation`}},customPasswordLabel:`Enter access password`,customPasswordPlaceholder:`4–64 characters`,generateLink:`Generate share link`,generating:`Generating…`,stageRendering:`Waiting for charts and formulas to render…`,stageUploading:`Uploading share snapshot…`,readyHint:`Share link is ready. Copy it or open the preview.`,linkLabel:`Share link`,accessPasswordLabel:`Access password`,copyLinkAndPassword:`Copy link and password`,customPasswordHint:`Password protection is enabled. Keep your password safe.`,expiresAt:`Expires: {date}`,previewConsistent:`Matches editor preview`,regenerate:`Reset and generate again`,manageHint:`Manage published share links. Revoking a link takes effect immediately.`,refreshList:`Refresh list`,emptyTitle:`No shares yet`,emptyDescription:`After creating a share, manage links here.`,viewCount:`{count} views`,expired:`Expired`,permanent:`Never expires`,expiresOn:`Expires {date}`,passwordProtected:`Password protected`,copyLink:`Copy link`,openPreview:`Open preview`,revokeShare:`Revoke share`,untitled:`Untitled`,proRequired:`My Shares is a Pro-only feature`,loadListFailed:`Failed to load shares: {message}`,revokeTitle:`Revoke share`,revokeDescription:`Revoke share for "{title}"? The link will stop working immediately.`,revokeSuccess:`Share revoked`,revokeFailed:`Failed to revoke share: {message}`,invalidPost:`Current post is invalid. Refresh and try again.`,linkUpdated:`Share link updated`,linkCreated:`Share link created`,createFailed:`Failed to create share link: {message}`,invalidPassword:`Password must be 4–64 characters.`,forbidden:`You cannot update this share. Refresh and try again.`,rateLimited:`Up to {limit} shares per day`,rateLimitedGeneric:`Sharing too frequently`,retryAfterHours:`. Try again in {hours} hour(s)`,retryAfterMinutes:`. Try again in {minutes} minute(s)`,retryTomorrow:`. Try again tomorrow`,copyBundle:{link:`Link: {url}`,password:`Password: {password}`}},sync:{title:`Cloud Sync`,description:`Sync posts and settings across devices. Keys and image-host credentials are not included.`,notConfiguredTitle:`Cloud sync disabled`,notConfiguredDescription:`This deployment has no sync service configured. Contact the operator to enable it.`,loginTitle:`Sign in to enable cloud sync`,lastSync:`Last sync: {time}`,neverSynced:`Never synced`,syncNow:`Sync now`,syncing:`Syncing…`,syncFailed:`Sync failed: {message}`,syncSuccess:`Sync completed`},account:{title:`Account`,loginHint:`Sign in to use cloud sync, share preview, and other cloud features.`,notConfiguredTitle:`Account service not configured`,notConfiguredDescription:`The operator must set VITE_MD_API_URL before sign-in and cloud sync work.`,loginTitle:`Sign in to your account`,githubLogin:`Sign in with GitHub`,extensionLoginUnavailable:`In-extension sign-in is unavailable. Update the extension or use the web app.`,loginFailed:`Sign-in failed. Please try again later.`,loggingIn:`Signing in…`,cloudSync:`Cloud Sync`,sharePreview:`Share Preview`},about:{title:`About`,description:`A minimalist Markdown editor for WeChat Official Accounts`,followHint:`Scan the QR code to follow Doocs on WeChat for original tech content.`,imageAlt:`Doocs Markdown Editor`},fund:{title:`Support`,description:`If you like this project, you can support us in the following ways.`,qrAlt1:`Support QR code 1`,qrAlt2:`Support QR code 2`},markdownHelp:{title:`Markdown Syntax Help`,description:`Browse supported Markdown syntax. Click an item to copy it.`,clickToCopy:`Click to copy`,tabs:{basic:`Basics`,code:`Code Blocks`,math:`Math`,diagram:`Diagrams`,other:`Other`},syntax:{basic:[{name:`Heading`,syntax:`# Heading 1
## Heading 2
### Heading 3`,tip:`Use # count for level, up to six levels`},{name:`Bold`,syntax:`**bold text**`,example:`bold text`},{name:`Italic`,syntax:`*italic text*`,example:`italic text`},{name:`Strikethrough`,syntax:`~~strikethrough~~`,example:`strikethrough`},{name:`Highlight`,syntax:`==highlighted text==`,example:`highlighted text`},{name:`Underline`,syntax:`++underline++`,example:`underline`},{name:`Inline code`,syntax:"`code`",example:`code`},{name:`Unordered list`,syntax:`- Item 1
- Item 2
  - Nested item`,tip:`Use -, *, or + followed by a space`},{name:`Ordered list`,syntax:`1. Item 1
2. Item 2`,tip:`Number followed by a period`},{name:`Link`,syntax:`[display text](url)`,example:`Doocs`,tip:`WeChat Official Accounts do not support external links`},{name:`Image`,syntax:`![alt text](image-url)`,tip:`Supports remote image URLs`},{name:`Quote`,syntax:`> quoted text
>> nested quote`},{name:`Horizontal rule`,syntax:`---`,tip:`Three or more -, *, or _`},{name:`Table`,syntax:`| Col 1 | Col 2 |
| --- | --- |
| Value 1 | Value 2 |`,tip:`Use Edit > Insert Table to create quickly`}],code:[{name:`Basic code block`,syntax:"```\ncode content\n```"},{name:`Language-specific`,syntax:'```js\nconsole.log("Hello")\n```',tip:`Supports js, ts, python, java, go, and more`}],math:[{name:`Inline formula`,syntax:`$E = mc^2$`,example:`E = mc²`},{name:`Block formula`,syntax:`$$
\\int_0^1 x^2 dx
$$`},{name:`LaTeX (inline)`,syntax:`\\(x^2 + y^2\\)`,tip:`Standard LaTeX format`},{name:`LaTeX (block)`,syntax:`\\[
\\sum_{i=1}^n x_i
\\]`}],diagram:[{name:`Mermaid flowchart`,syntax:"```mermaid\ngraph LR\n  A --> B\n```",tip:`Supports flowcharts, sequence diagrams, pie charts, and more`},{name:`PlantUML`,syntax:"```plantuml\n@startuml\nA -> B\n@enduml\n```",tip:`See plantuml.com`},{name:`Infographic`,syntax:"```infographic\ninfographic list-row\n...\n```",tip:`AntV infographic engine`}],other:[{name:`Ruby annotation`,syntax:`[text]{ruby}
[text]^(ruby)`,example:`hello`,tip:`Supports kana, pinyin, and more`},{name:`Slideshow`,syntax:`<![alt](url1),![alt](url2)>`,tip:`Horizontal swipe images, WeChat Official Accounts only`},{name:`HTML tags`,syntax:`<center>centered content</center>`,tip:`Some HTML tags are supported`}]}},postInfo:{publish:`Publish`,title:`Publish`,description:`Publish your article to multiple platforms`,extensionMissingTitle:`Extension not detected`,extensionMissingDescription:`Install the {link} browser extension`,extensionLinkText:`COSE Article Sync Assistant`,coseHint:`Powered by {githubLink}. Runs entirely locally and does not collect or store user data.`,coseGithubText:`the open-source COSE plugin on GitHub`,coseContribute:`To add platforms or improve sync accuracy, open an {issueLink} or PR.`,issueLinkText:`Issue`,cover:`Cover`,coverPlaceholder:`Auto-extract first image`,titleLabel:`Title`,titlePlaceholder:`Auto-extract first heading`,descLabel:`Summary`,descPlaceholder:`Auto-extract first paragraph`,platform:`Platforms`,selectAll:`Select all`,checking:`Checking`,coverPreview:`Cover preview`,coverPreviewAlt:`Cover preview`,categories:{media:`Media`,blog:`Blog`,cloud:`Cloud & dev`}},postTask:{title:`Submit publish task`,waiting:`Waiting to publish…`,publishing:`Publishing`,syncFailed:`Sync failed: {error}`,syncSuccess:`Sync succeeded`,viewDraft:`View draft`},preferences:{title:`Preferences`,description:`Customize language, appearance, and editor behavior.`,tab:{general:`General`,editor:`Editor`,preview:`Preview`},language:{label:`Language`,hint:`Interface language`},darkMode:{label:`Dark mode`},viewMode:{label:`View mode`},viewModeOption:{edit:`Edit`,split:`Split`,preview:`Preview`},previewDevice:{label:`Preview device`},previewDeviceOption:{desktop:`Desktop`,mobile:`Mobile`},scrollSync:{label:`Scroll sync`,hint:`Sync editor and preview scrolling`},showAIToolbox:{label:`AI toolbox`,hint:`Show floating AI tools when text is selected`},imageReupload:{label:`Image re-upload`,hint:`Re-upload images to your image host on copy`},wordCount:{label:`Word count`,hint:`Show word count and reading time at the top of the preview`}}},Re={codemirror:{contentPlaceholder:`Type "/" to insert quickly`},post:{contentManage:`Content Manager`,titleRequired:`Title cannot be empty`,addSuccess:`Content added successfully`,renameSuccess:`Content renamed successfully`,deleteSuccess:`Content deleted successfully`,restoreSuccess:`Version restored successfully`,editSuccess:`Updated successfully`,copySuffix:`Copy`,exitSelect:`Exit selection`,multiSelect:`Multi-select`,importMarkdownBatch:`Import Markdown (batch supported)`,sortBy:`Sort by`,sortNameAZ:`Filename (A-Z)`,sortNameZA:`Filename (Z-A)`,sortUpdateNewOld:`Modified (newest first)`,sortUpdateOldNew:`Modified (oldest first)`,sortCreateNewOld:`Created (newest first)`,sortCreateOldNew:`Created (oldest first)`,batchImport:`Batch import`,exportAll:`Export all`,collapseAll:`Collapse all`,expandAll:`Expand all`,regex:`Regular expression`,caseSensitive:`Case sensitive`,replaceWith:`Replace with…`,replaceOne:`Replace one`,replaceAll:`Replace all`,matchStats:`{matches} matches in {posts} posts`,noMatch:`No matching content`,emptyTitle:`No content yet`,emptyHint:`Click the + button above to create`,selectedCount:`Selected`,postUnit:`posts`,mergeMinTwo:`Select at least 2 posts to merge`,keepOnePost:`Keep at least one post`,confirmDelete:`Confirm delete`,deleteBatchConfirm:`Delete {count} selected posts?`,deletedBatch:`Deleted {count} posts`,duplicatedBatch:`Duplicated {count} posts`,exportedBatch:`Exported {count} posts`,replacedOne:`Replaced 1 occurrence`,replacedCount:`Replaced {count} occurrences`,mergeTitleRequired:`Merge title cannot be empty`,mergedAs:`Merged as "{title}"`,dragToChildError:`Cannot move content under its child`,addTitle:`Add content`,addDescription:`Enter a title`,titlePlaceholder:`Enter title…`,editTitle:`Rename content`,editDescription:`Enter a new title`,deleteRecursive:`Also delete all child content`,mergeTitle:`Merge into one`,mergeDescription:`Merge {count} selected posts in order. Name the result:`,mergePlaceholder:`Enter merged title…`,historyTitle:`History`,historyDescription:`Auto-saved every 30 seconds, up to 10 versions`,originalContent:`Original`,versionDiff:`Compare versions`,compareLabel:`Compare:`,restore:`Restore`,restoreArticleDescription:`Replace current article content with this version?`,addPost:`Add content`,saveAsTemplate:`Save as template`,applyTemplate:`Apply template`,exportMd:`Export .md`,templateFromPost:`Created from "{title}" on {date}`,menuRename:`Rename`},folder:{title:`Local Folder`,closeFolder:`Close folder`,closePanel:`Close panel`,openFolder:`Open folder`,browserUnsupported:`Your browser does not support local folder access`,browserHint:`Please use Chrome, Edge, or Opera`,noFolder:`No folder opened`,noFolderHint:`Click the button above to open a local folder`,fileLoaded:`Loaded file: {name}`,openFileFailed:`Failed to open file`},editorState:{title:`Import / Export Project Settings`,description:`Imported settings will overwrite current project settings. Proceed with caution.`,importTab:`Import settings`,exportTab:`Export settings`,selectExport:`Select settings to export`,jsonPreview:`JSON preview`,exportSelected:`Export selected`,importJson:`Import JSON config file`,selectJsonFile:`Click to select a JSON file`,jsonFormatHint:`Supported format: .json`,selectImportItems:`Select settings to import`,importFirst:`Import a JSON file first`,reimport:`Re-import`,applySelected:`Apply selected`,fullscreenPreview:`Full-screen JSON preview`,fullscreenDescription:`Complete JSON data for current settings`,copyJson:`Copy JSON`,exportSuccess:`Config exported successfully`,importFormatError:`Invalid import file format`,importNoApplicable:`No applicable project settings in import file`,importSuccess:`Config imported successfully`,parseFailed:`Failed to parse file. Check JSON format.`,applySuccess:`Settings applied. Refresh the page to see changes.`,copyRetry:`Copy failed. Please try again.`,storeLabels:{isDark:`Dark mode`,isMacCodeBlock:`Mac-style code blocks`,isShowLineNumber:`Code block line numbers`,isCiteStatus:`External link citation footer`,isCountStatus:`Word count`,isUseIndent:`Use indentation`,isUseJustify:`Justify text`,isOpenRightSlider:`Right slider open`,isOpenPostSlider:`Post slider open`,showAIToolbox:`AI toolbox`,theme:`Theme`,fontFamily:`Font family`,fontSize:`Font size`,primaryColor:`Custom theme color`,codeBlockTheme:`Code block theme`,legend:`Image caption format`,fontSizeNumber:`Font size`,currentPostId:`Current post ID`,currentPostIndex:`Current post index`,posts:`Post list`,cssContentConfig:`Custom CSS`,titleList:`Post title list`,readingTime:`Reading time`,isShowCssEditor:`Show CSS editor`,isShowInsertFormDialog:`Show insert form dialog`,isShowInsertMpCardDialog:`Show insert Official Account card dialog`,isShowUploadImgDialog:`Show upload image dialog`,aiDialogVisible:`AI dialog visible`,aiImageDialogVisible:`AI image dialog visible`}},formula:{title:`Formula Editor`,description:`LaTeX editing, live preview, and formula library.`,latexInput:`LaTeX input`,inline:`Inline`,block:`Block`,latexPlaceholder:`Enter LaTeX formula`,preview:`Preview`,library:`Formula library`,loadingEngine:`Loading math engine…`,previewEmpty:`Preview will appear here after you enter a formula`,contentRequired:`Please enter formula content`,insertSuccess:`Formula inserted`,insertFormula:`Insert formula`,groups:{basic:`Basic`,greek:`Greek`,relation:`Relations`,symbol:`Symbols`,logic:`Logic`,matrix:`Matrix`,algebra:`Algebra`,calculus:`Calculus`,statistics:`Statistics`,set:`Sets`,trigonometry:`Trigonometry`,physics:`Physics`,chemistry:`Chemistry`}},insertForm:{title:`Insert Table`,description:`Set rows and columns, fill in headers, then insert a Markdown table`,rows:`Rows`,cols:`Columns`,headerPlaceholder:`Header`},importMd:{title:`Import Markdown`,description:`Import from a URL or local files. Supports WeChat articles, blogs, and other web pages.`,localFile:`Local file`,networkUrl:`Web URL`,dropHint:`Click to select files or drag and drop here`,formatHint:`Supports .md, .markdown, .txt`,urlPlaceholder:`e.g. https://mp.weixin.qq.com/s/xxxxx`,urlHint:`Direct Markdown file URLs or automatic web page conversion`,importing:`Importing...`,poweredBy:`Powered by`,conversionService:`conversion service`,urlRequired:`Please enter a URL`,urlInvalid:`Enter a valid URL (http/https only)`,requestFailed:`Request failed: {status} {statusText}`,contentEmpty:`The URL returned empty content`,convertFailed:`Conversion failed`,convertResultEmpty:`Conversion result is empty`,importFailed:`Import failed. Check if the URL is valid.`,dropInvalid:`Drop Markdown files (.md / .markdown / .txt)`,importedOne:`Imported 1 article`,importedBatch:`Imported {count} articles`},template:{title:`Templates`,description:`Save and manage Markdown templates for quick reuse`,create:`New template`,edit:`Edit template`,nameLabel:`Template name *`,namePlaceholder:`Enter template name`,nameRequired:`Template name cannot be empty`,nameTooLong:`Template name cannot exceed 50 characters`,descLabel:`Description`,descPlaceholder:`Enter description (optional)`,contentLabel:`Template content`,contentPlaceholder:`Enter template content`,searchPlaceholder:`Search by name or description...`,newTemplate:`New template`,noMatch:`No matching templates`,empty:`No templates yet`,emptyHint:`Click "New template" to create your first template`,createdAt:`Created:`,updatedAt:`Updated:`,applyTitle:`Apply template (replace all content)`,insertTitle:`Insert template (at cursor)`,editTitle:`Edit template`,deleteTitle:`Delete template`,confirmDelete:`Confirm delete`,appliedToPost:`Applied template "{name}" to current article`,applied:`Applied template "{name}"`,inserted:`Inserted template "{name}"`},component:{title:`Components`,description:`Insert JSX-style components in Markdown, such as`,create:`New component`,edit:`Edit component`,nameLabel:`Component name`,nameHint:`(PascalCase, e.g. QRCodeBlock)`,descLabel:`Description`,descPlaceholder:`Brief description of this component`,propsLabel:`Props definition`,addProp:`Add prop`,propName:`Name`,propType:`Type`,propDesc:`Description`,propDefault:`Default`,defaultValue:`Default value`,noProps:`No props defined. Click "Add prop" when needed.`,propRefHint:`Use {'{'}{'{'}propName{'}'}{'}'} in the template to reference prop values`,htmlTemplate:`HTML template`,templateHint1:`{'{'}{'{'}propName{'}'}{'}'} — replaced with prop value (HTML-escaped)`,templateHint2:`{'{'}{'{'}#if prop{'}'}{'}'}...{'{'}{'{'}#else{'}'}{'}'}...{'{'}{'{'}/if{'}'}{'}'} — conditional block (supports else)`,templateHint3:`{'{'}{'{'}#unless prop{'}'}{'}'}...{'{'}{'{'}/unless{'}'}{'}'} — inverse conditional`,templateHint4:`{'{'}{'{'}#each arrayProp{'}'}{'}'}...{'{'}{'{'}item{'}'}{'}'}...{'{'}{'{'}item.key{'}'}{'}'}...{'{'}{'{'}/each{'}'}{'}'} — array loop`,previewLabel:`Preview (using default prop values)`,builtin:`Built-in`,custom:`Custom`,builtinBadge:`Built-in`,propCount:`{count} props`,propDocs:`Props`,propNameCol:`Name`,typeCol:`Type`,statusCol:`Status`,descCol:`Description`,defaultCol:`Default`,required:`Required`,optional:`Optional`,defaultPrefix:`Default:`,example:`Example`,savedAccounts:`Saved accounts`,noAccounts:`No saved accounts. Click "Add" to create one.`,noCustom:`No custom components. Click "New" above to create one.`,noPropsDefined:`No props defined for this component`,noContent:`(empty)`,nameRequired:`Component name cannot be empty`,nameInvalid:`Name must start with uppercase letter and contain only letters and digits (PascalCase)`,nameDuplicate:`Component name already exists`,templateRequired:`Component template cannot be empty`,exportSuccess:`Custom components exported`,importSuccess:`Imported {count} components`,importFailed:`Import failed. Check file format.`,formatError:`Invalid format`,insertSuccess:`Inserted component "{name}"`,confirmDelete:`Confirm delete`,deleteConfirm:`Delete component "{name}"?`,insertMpSuccess:`Inserted account card "{name}"`,deleteMpConfirm:`Delete account "{name}"? This cannot be undone.`,deleted:`Deleted`,builtinComponents:{MpProfile:{description:`WeChat official account card`,props:{mpId:`Account ID`,nickname:`Account name`,headimg:`Avatar image URL`,signature:`Account bio`,serviceType:`Account type (1=official, 2=service)`,verifyStatus:`Verification (0=none, 1=personal, 2=enterprise)`}},QRCodeBlock:{description:`QR code block that renders a scannable image from a URL`,props:{url:`QR code content (URL)`,text:`Caption below the QR code`,size:`QR code size (px)`},propDefaults:{text:`Scan to visit`}},AuthorBlock:{description:`Author info block with avatar, name, and bio`,props:{name:`Author name`,avatar:`Avatar image URL`,bio:`Author bio`}},TipBlock:{description:`Callout block for tips and notices`,props:{type:`Type: info | success | warning | danger`,title:`Title (optional)`,content:`Tip content`}},TableBlock:{description:`Styled table rendered from JSON arrays, with optional zebra stripes`,props:{headers:`Column headers (JSON string array)`,rows:`Data rows (JSON 2D array)`,striped:`Zebra stripes (true/false)`,caption:`Table caption (optional)`}},InfoGrid:{description:`Info grid that displays key-value pairs in columns`,props:{items:`JSON array; each item has label and value`,cols:`Column count (1–3)`}},BadgeGroup:{description:`Badge group that displays colored tags`,props:{tags:`JSON string array of tag labels`,color:`Tag accent color (hex)`}}}},mpAccount:{editTitle:`Edit account`,addTitle:`Add account`,idLabel:`ID`,idPlaceholder:`e.g. MzIxNjA5ODQ0OQ==`,idHelp:`How to get account ID?`,nameLabel:`Name`,namePlaceholder:`e.g. Doocs`,logoLabel:`Logo`,logoPlaceholder:`e.g. https://doocs.com/mp-logo.png`,descLabel:`Description`,descPlaceholder:`e.g. Official account of the open-source organization {'@'}Doocs on GitHub.`,typeLabel:`Type`,typeOfficial:`Official account`,typeService:`Service account`,verifyLabel:`Verification`,verifyNone:`None`,verifyPersonal:`Personal`,verifyEnterprise:`Enterprise`,updated:`"{name}" updated`,added:`"{name}" added`,errors:{mpIdRequired:`Account ID is required`,nameRequired:`Account name is required`,logoInvalid:`Logo must be a valid URL`}},cssEditor:{schemeNameRequired:`Scheme name cannot be empty`,editNameFailed:`Rename failed: scheme name cannot be empty`,createNameFailed:`Create failed: scheme name cannot be empty`,createSuccess:`Created successfully`,keepOneScheme:`Keep at least one scheme`,schemeDefaultName:`Scheme {index}`,deleteSchemeConfirm:`Delete this custom scheme?`,schemeNotFound:`Current scheme not found`,basedOnTheme:`Based on {theme}`,blankScheme:`Blank scheme`,basedClassic:`Based on Classic theme`,basedGrace:`Based on Grace theme`,basedSimple:`Based on Simple theme`,newTitle:`New custom CSS`,newDescription:`Enter a scheme name and choose an initial template`,schemeName:`Scheme name`,schemeNamePlaceholder:`Enter scheme name`,initialTemplate:`Initial template`,selectTemplate:`Select template`,templateHint:`Start from a built-in theme and customize from there`,editSchemeTitle:`Rename scheme`,editSchemeDescription:`Enter a new scheme name`,viewBuiltinTitle:`View built-in themes`,viewBuiltinDescription:`View and copy built-in theme CSS, or create a new scheme from them`,selectTheme:`Select theme`,selectThemePlaceholder:`Select theme`,copyAll:`Copy all`,createFromTheme:`Create from this theme`,multiSelect:`Multi-select`,cssPlaceholder:`Your custom css here.`,selectedUnit:`items`,deleteSchemeMinOne:`Keep at least one scheme`},editorPanel:{configureImgHost:`Configure {host} image host settings first`,uploadUnknownError:`Unknown image upload error`,uploadSuccess:`Image uploaded successfully`,reuploading:`⏳ Re-uploading...`,reuploadFailed:`Re-upload failed. Original link kept.`},localImage:{title:`Local images detected`,description:`This document contains local image paths. Select a folder with these images to match and upload them.`,detectedCount:`{count} local images detected`,matchedCount:`Matched {matched} / {total}`,selectFolder:`Select folder with images`,folderSelected:`Folder selected ({count} files)`,selectAtLeastOne:`Select at least one item`,notFoundInFolder:`Images not found in folder: {paths}`,uploadFailed:`Upload failed`,uploadImages:`Upload images`,reupload:`Re-upload`},customUpload:{paramDetails:`Parameter details?`,saveConfig:`Save settings`},versionDiff:{identical:`Both versions are identical`}},ze={editor:{contentCleared:`Content cleared`,contentReset:`Content reset`},post:{defaultTitle:`Content 1`},template:{created:`Template "{name}" created`,notFound:`Template not found`,updated:`Template updated`,deleted:`Template "{name}" deleted`,batchDeleted:`Deleted {count} template(s)`,allCleared:`Cleared all templates ({count} total)`,importInvalidFormat:`Import failed: invalid data format`,importNoValid:`Import failed: no valid template data`,importSuccess:`Imported {count} template(s) successfully`,importParseError:`Import failed: data parse error`},component:{created:`Component "{name}" created`,notFound:`Component not found`,updated:`Component updated`,deleted:`Component "{name}" deleted`},cssEditor:{schemeDefault:`Scheme 1`,schemeDefaultSpaced:`Scheme 1`,keepAtLeastOne:`Keep at least one scheme`,batchDeleted:`Deleted {count} scheme(s)`,batchExported:`Exported {count} scheme(s)`,singleExported:`Exported "{name}"`},folder:{apiNotSupported:`Your browser does not support the File System Access API`,permissionDenied:`Folder access permission was not granted`,opened:`Folder "{name}" opened`,openFailed:`Failed to open folder: {message}`,noFolderSelected:`No folder selected`,fileNotFound:`File not found: {path}`,notAFile:`Not a file: {path}`,readFailed:`Failed to read file: {message}`},mpAccount:{newAccount:`New account`,officialAccount:`Official Account`,serviceAccount:`Service Account`},sync:{syncing:`Syncing`,syncingHint:`Exchanging data with the cloud…`,synced:`Synced`,syncedHint:`Local content matches the cloud`,failed:`Sync failed`,failedHintDetail:`Sync failed. See details below`,retryLater:`Please try again later`,pending:`Pending sync`,pendingHint:`Local changes not yet uploaded`,syncingTooltip:`Syncing…`,syncedTooltip:`Synced`,failedTooltip:`Sync failed. Click to retry`,pendingTooltip:`Unsynced changes`,rateLimited:`Sync rate limit reached. Please try again later`},uploader:{fileReadFailed:`Failed to read file`,fileReadError:`File read error`,corsFailed:`Cross-origin request failed: the image blocks CORS and the proxy could not fetch it.`,downloadFailed:`Image download failed: {message}`,uploadFailed:`Upload failed`,defaultHostRequiresApi:`Default image host requires md-api upload service configuration`},pdf:{pageFooter:`Page " counter(page) " of " counter(pages) "`},relativeTime:{justNow:`Just now`,secondsAgo:`{seconds}s ago`,minutesAgo:`{minutes}m ago`,hoursAgo:`{hours}h ago`,daysAgo:`{days}d ago`},diagram:{downloadSvg:`Download as SVG`,downloadPng:`Download as PNG`,mermaidLoading:`Loading Mermaid…`,mermaidError:`Mermaid render failed: {detail}`,plantumlLoading:`Loading PlantUML diagram…`,plantumlError:`Failed to load PlantUML diagram`,infographicLoading:`Loading infographic…`,infographicError:`Infographic render failed: {detail}`},popup:{mustRead:`Before you start`,mpHostIntro:`To use the WeChat Official Account media library as an image host, complete the following setup:`,step1:`1. Enable developer mode for your Official Account`,viewDocs:`View docs`,step2:`2. Configure IP whitelist`,tutorial:`Tutorial`,getStarted:`Get started`},passwordInput:{toggleVisibility:`Toggle password visibility`},extension:{editorTitle:`MD WeChat Editor`},afdian:{monthly:`Monthly`,quarterly:`Quarterly`,yearly:`Yearly`}},Be={title:`Local Upload`,selectUpload:`Upload`,selectHostPlaceholder:`Select image host`,enableCompression:`Enable image compression`,autoReuploadOnPaste:`Auto-reupload pasted images`,autoReuploadMdHint:`Auto-reupload Markdown image links to the configured host`,dragOrClick:`Drag image here, or`,clickToUpload:`click to upload`,saveConfig:`Save settings`,hostSwitched:`Image host switched`,configureHostFirst:`Please configure {host} image host first`,hosts:{default:`Default`,github:`GitHub`,aliOSS:`Alibaba Cloud`,txCOS:`Tencent Cloud`,qiniu:`Qiniu`,minio:`MinIO`,s3:`S3`,mp:`WeChat Official Account`,r2:`Cloudflare R2`,upyun:`Upyun`,telegram:`Telegram`,cloudinary:`Cloudinary`,formCustom:`Custom code`},errors:{invalidFormat:`Please upload GIF/JPG/JPEG/PNG/WEBP images only`,tooLarge:`Image size cannot exceed {maxSize} MB (WeChat limit)`},labels:{githubRepo:`GitHub repository`,branch:`Branch`,cdnAccel:`CDN acceleration`,bucketRegion:`Bucket region`,customCdn:`Custom CDN domain`,storagePath:`Storage path`,storageRegion:`Storage region`,proxyDomain:`Proxy domain`,domain:`Domain`,operator:`Operator`,operatorPassword:`Operator password`,customDomain:`Custom domain`,customDomainCdn:`Custom domain / CDN`},placeholders:{githubRepo:`e.g. github.com/yanglbme/resource`,branch:`e.g. release. Optional, defaults to master`,token:`e.g. cc1d0c1426d0fd0902bd2d7184b14da61b8abc46`,accessKeyId:`e.g. LTAI4GdoocsmdoxUf13ylbaNHk`,accessKeySecret:`e.g. cc1d0c142doocs0902bd2d7md4b14da6ylbabc46`,bucket:`e.g. doocs`,ossRegion:`e.g. oss-cn-shenzhen`,cdnHost:`e.g. https://imagecdn.example.com. Optional`,storagePath:`e.g. img. Optional, defaults to root`,storagePathRoot:`e.g. img. Optional, defaults to root`,secretId:`e.g. AKIDnQp1w3DOOCSs8F5MDp9tdoocsmdUPonW3`,secretKey:`e.g. ukLmdtEJ9271f3DOocsMDsCXdS3YlbW0`,cosBucket:`e.g. doocs-3212520134`,cosRegion:`e.g. ap-guangzhou`,qiniuAccessKey:`e.g. 6DD3VaLJ_SQgOdoocsyTV_YWaDmdnL2n8EGx7kG`,qiniuSecretKey:`e.g. qgZa5qrvDOOcsmdKStD1oCjZ9nB7MDvJUs_34SIm`,qiniuBucket:`e.g. md`,qiniuDomain:`e.g. https://images.example.com`,qiniuRegion:`e.g. z2. Optional`,minioEndpoint:`e.g. play.min.io`,minioPort:`e.g. 9000. Optional; defaults to 80 (http) or 443 (https)`,minioAccessKey:`e.g. zhangsan`,minioSecretKey:`e.g. asdasdasd`,s3Endpoint:`e.g. s3.amazonaws.com. Optional`,s3Region:`e.g. us-east-1`,s3Bucket:`e.g. bucket-name`,s3AccessKeyId:`e.g. AKIAIOSFODNN7EXAMPLE`,s3AccessKeySecret:`e.g. wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`,customDomain:`e.g. https://cdn.example.com`,proxyExample:`e.g. http://proxy.example.com`,proxyOptional:`Optional`,appId:`e.g. wx6e1234567890efa3`,appSecret:`e.g. d9f1abcdef01234567890abcdef82397`,accountId:`e.g. 0030f123e55a57546f4c281c564e560`,r2AccessKey:`e.g. 358090b3a12824a6b0787gae7ad0fc72`,r2SecretKey:`e.g. c1c4dbcb0b6b785ac6633422a06dff3dac055fe74fe40xj1b5c5fcf1bf128010`,r2Domain:`e.g. https://oss.example.com`,upyunBucket:`e.g. md`,upyunOperator:`e.g. operator`,upyunDomain:`e.g. http://xxx.test.upcdn.net`,telegramToken:`e.g. 123456789:ABCdefGHIjkl-MNOPqrSTUvwxYZ`,telegramChatId:`e.g. -1001234567890`,cloudName:`e.g. demo`,apiKey:`e.g. 1234567890`,apiSecretOptional:`For signed uploads. Optional`,uploadPresetUnsigned:`Required for unsigned uploads; optional for signed`,cloudinaryFolder:`e.g. blog/image. Optional`,cloudinaryDomain:`e.g. https://cdn.example.com. Optional`},help:{githubToken:`How to get a GitHub Token?`,aliOSS:`How to use Alibaba Cloud OSS?`,txCOS:`How to use Tencent Cloud COS?`,qiniu:`How to use Qiniu Kodo?`,minio:`How to use MinIO?`,mpDevMode:`How to enable WeChat Official Account developer mode and get credentials?`,mpExtension:`How to use the WeChat image host in the browser extension?`,r2S3Api:`How to use the S3 API with Cloudflare R2?`,r2Cors:`How to configure CORS?`,upyun:`How to use Upyun?`,telegram:`How to use Telegram?`,cloudinary:`Cloudinary documentation`},validation:{githubRepoRequired:`GitHub repository is required`,githubTokenRequired:`GitHub Token is required`,accessKeyIdRequired:`AccessKey ID is required`,accessKeySecretRequired:`AccessKey Secret is required`,bucketRequired:`Bucket is required`,regionRequired:`Region is required`,secretIdRequired:`Secret ID is required`,secretKeyRequired:`Secret Key is required`,accessKeyRequired:`AccessKey is required`,accountIdRequired:`Account ID is required`,domainRequired:`Bucket domain is required`,endpointRequired:`Endpoint is required`,secretAccessKeyRequired:`Secret AccessKey is required`,botTokenRequired:`Bot Token is required`,chatIdRequired:`Chat ID is required`,proxyRequired:`Proxy domain is required`,appIdRequired:`AppID is required`,appSecretRequired:`AppSecret is required`,operatorRequired:`Operator is required`,passwordRequired:`Password is required`,cdnDomainRequired:`CDN domain is required`,cloudNameRequired:`Cloud Name is required`,apiKeyRequired:`API Key is required`,uploadPresetRequired:`Upload preset is required when apiSecret is not provided`},provider:{accessTokenFailed:`Failed to obtain access_token`,uploadNoUrl:`Upload failed: no URL returned`,uploadFailedWithDetail:`Upload failed: {detail}`,telegramSendPhotoFailed:`Telegram sendPhoto failed`,telegramGetFileFailed:`Telegram getFile failed`,cloudinaryMissingConfig:`Cloudinary config is missing cloudName / apiKey`,cloudinaryMissingPreset:`uploadPreset is required when apiSecret is not configured`,cloudinaryMissingUrl:`Cloudinary response is missing url field`}},R={...Ie,...Fe,...Le,...Re,ai:Pe,upload:Be,store:ze},Ve={toolbar:{expand:`展开 AI 工具栏`,openToolboxHint:`点击打开 AI 工具箱`,assistant:`AI 助手`,assistantLabel:`助手`,imageGen:`AI 文生图`,imageGenLabel:`文生图`,toolbox:`AI 工具箱`,toolboxLabel:`工具箱`},chat:{title:`AI 对话`,configParams:`配置参数`,imageGen:`AI 文生图`,newSession:`新建会话`,loadConversation:`加载对话`,clearConversation:`清空对话内容`,description:`使用 AI 助手帮助您编写和优化内容`,noSavedConversations:`暂无保存的对话`,noQuickCommands:`还没有任何快捷指令，点击右侧添加`,manageCommands:`管理指令`,greeting:`你好，我是 AI 助手，有什么可以帮你的？`,conversationTitle:`对话 {date}`,sessionCreated:`已创建新会话`,conversationLoaded:`对话已加载`,conversationDeleted:`对话已删除`,insertedToDoc:`已插入文档`,sessionCleared:`会话已清空`,thinking:`思考中…`,copyContent:`复制内容`,insertDoc:`插入文档`,regenerate:`重新生成`,inputPlaceholder:`说些什么… (Enter 发送，Shift+Enter 换行)`,quoteFullText:`引用全文`,pause:`暂停`,send:`发送`,requestFailed:`❌ 请求失败: {message}`,systemQuote:`下面是一篇 Markdown 文章全文，请严格以此为主完成后续指令：

{content}`,systemPrompt:`你是一个专业的 Markdown 编辑器助手，请用简洁中文回答。`},image:{title:`AI 文生图`,configParams:`配置参数`,chat:`AI 对话`,clearImages:`清空图像`,description:`使用 AI 根据文字描述生成图像`,generating:`正在生成图像...`,cancelGeneration:`取消生成`,previous:`上一张`,next:`下一张`,generatedImageAlt:`生成的图像 {n}`,clickToViewLarge:`点击查看大图`,size:`尺寸`,prompt:`提示词`,noPrompt:`无关联提示词`,remainingValidity:`剩余有效期`,downloadReminder:`，请及时下载保存`,insert:`插入`,download:`下载`,copy:`复制`,regenerate:`重新生成`,inputPlaceholder:`描述你想要生成的图像... (Enter 生成，Shift+Enter 换行)`,cancel:`取消`,generate:`生成`,preview:`图片预览`,closePreview:`关闭预览`,previewLarge:`预览大图`,noValidData:`未收到有效的图像数据`,generateFailed:`图像生成失败: {message}`,downloadStarted:`图片已开始下载`,downloadFailed:`下载失败，请重试`,copyFailed:`复制失败，请重试`,aiGeneratedAlt:`AI 生成的图像`,insertedToEditor:`图片已插入到编辑器`,insertFailed:`插入失败，请重试`,expired:`已过期`,timeRemaining:`{minutes}分{seconds}秒`,secondsRemaining:`{seconds}秒`},toolbox:{title:`AI 工具箱`,configParams:`配置参数`,selectAction:`选择操作`,selectActionPlaceholder:`请选择要执行的操作`,originalText:`原文`,customPrompt:`自定义提示词（可选）`,customPromptPlaceholder:`输入提示词后按回车`,result:`处理结果`,stop:`终止`,accept:`接受`,retry:`重试`,process:`AI 处理`,requestFailed:`请求失败`,systemPrompt:`你是一名专业的多语言文本助手，请根据用户的指令处理下列内容。在输出时，不要输出任何额外的信息，只输出处理后的文本。`,satisfyRequirements:`请同时满足以下要求：{requirements}。`,optimizeDefault:`请根据最佳实践优化文本。`,textToProcess:`待处理文本：
{text}`,actions:{optimize:{label:`优化文本`,prompt:`请优化文本，使其更通顺易读。`},summarize:{label:`文章总结`,prompt:`请对文本进行摘要，输出主要观点和结论。`},spellcheck:{label:`错别字纠正`,prompt:`请找出并纠正文本中的错别字、标点和语法错误。`},translateZh:{label:`翻译为中文`,prompt:`请将文本翻译为地道的中文。`},translateEn:{label:`翻译为英文`,prompt:`请将文本翻译为自然流畅的英文。`},expand:{label:`扩写`,prompt:`请对文本进行扩写，丰富细节、充实内容，保持原有风格和意图。`},continue:{label:`续写`,prompt:`请根据文本内容，以相同风格继续向下补充撰写，保持语言连贯。`},custom:{label:`自定义`,prompt:``}}},quickCommand:{title:`管理快捷指令`,namePlaceholder:`指令名称`,templatePlaceholder:`模板内容，支持 {'{'}{'{'}sel{'}'}{'}'} 占位`,nameExamplePlaceholder:`指令名称 (如：改写为 SEO 文案)`,templateExamplePlaceholder:`模板，可用 {'{'}{'{'}sel{'}'}{'}'} 占位，例如：
请把以下文字改写为 SEO 友好的标题：

{'{'}{'{'}sel{'}'}{'}'}`,polish:{label:`润色`,template:`请润色以下内容：

{'{'}{'{'}sel{'}'}{'}'}`},toEn:{label:`翻译成英文`,template:`请将以下内容翻译为英文：

{'{'}{'{'}sel{'}'}{'}'}`},toZh:{label:`翻译成中文`,template:`请将以下内容翻译为中文：

{'{'}{'{'}sel{'}'}{'}'}`},summary:{label:`总结`,template:`请对以下内容进行总结：

{'{'}{'{'}sel{'}'}{'}'}`},parseFailed:`解析快捷指令失败，已恢复默认值`},services:{default:`内置服务`,deepseek:`DeepSeek`,openai:`OpenAI`,google:`Google Gemini`,xai:`xAI Grok`,mistral:`Mistral AI`,openrouter:`OpenRouter`,groq:`Groq`,qwen:`通义千问`,hunyuan:`腾讯混元`,doubao:`火山方舟`,siliconflow:`硅基流动`,"302ai":`302.AI`,bigmodel:`智谱 AI`,baichuan:`百川智能`,lingyiwanwu:`零一万物`,moonshot:`月之暗面`,minimax:`MiniMax`,stepfun:`阶跃星辰`,ernie:`百度千帆`,custom:`自定义 OpenAI 兼容服务`},imageServices:{default:`内置服务`,openai:`OpenAI`,google:`Google Gemini`,siliconflow:`硅基流动`,"302ai":`302.AI`,custom:`自定义 OpenAI 兼容服务`},config:{title:`AI 配置`,serviceType:`服务类型`,apiEndpoint:`API 端点`,apiEndpointPlaceholder:`输入 API 端点 URL`,apiKey:`API 密钥`,modelName:`模型名称`,selectModel:`请选择模型`,modelPlaceholder:`输入模型名称`,temperature:`温度`,temperatureHint:`控制输出的随机性：较小值使输出更确定，较大值使其更随机。`,temperaturePlaceholder:`0 ~ 2，默认 1`,maxTokens:`最大 Token 数`,maxTokensPlaceholder:`比如 1024`,saved:`✅ 配置已保存`,cleared:`🗑️ 当前 AI 配置已清除`,testSuccess:`✅ 测试成功，/chat/completions 可用`,modelNotActivated:`⚠️ 测试成功，但当前模型未开通：{model}`,testFailed:`❌ 测试失败：{status} {statusText}，{errorText}`,testFailedMessage:`❌ 测试失败：{message}`},imageConfig:{title:`AI 图像生成配置`,provider:`服务商`,apiEndpoint:`API 端点`,model:`模型`,selectModel:`请选择模型`,modelPlaceholder:`输入模型名称，如：dall-e-3`,imageSize:`图像尺寸`,imageQuality:`图像质量`,imageStyle:`图像风格`,sizeSquare:`正方形 (1024x1024)`,sizeLandscape:`横版 (1792x1024)`,sizePortrait:`竖版 (1024x1792)`,qualityStandard:`标准`,qualityHd:`高清`,styleNatural:`自然`,styleVivid:`鲜明`,defaultServiceTitle:`默认图像服务`,defaultServiceDesc:`免费使用，无需配置 API Key，支持 Kwai-Kolors/Kolors 模型。`,customServiceTitle:`自定义服务`,customServiceDesc:`可配置任何兼容 OpenAI 图像生成 API 的服务，如自建的 API 代理或其他第三方服务。`,endpointExample:`端点格式示例：https://your-api.com/v1`,saveConfig:`保存配置`,incompleteConfig:`❌ 请检查配置项是否完整`,apiKeyRequired:`❌ 请输入 API Key`,invalidEndpoint:`❌ 端点格式有误`,saved:`✅ 配置已保存`,cleared:`🗑️ 当前 AI 图像配置已清除`,connectionSuccess:`✅ 连接成功`,connectionFailed:`❌ 连接失败：{message}`}},He={footer:{loginAccount:`登录账户`,accountWithLogin:`账户 {'@'}{login}`,lineCol:`行 {line}，列 {col}`,cursorPosition:`光标位置（共 {total} 行） · 点击跳转`,selectedChars:`已选 {count} 字符`,switchDocument:`切换文档`,searchDocuments:`搜索文档...`,noMatchingDocuments:`无匹配文档`,outline:`大纲`,outlineTooltip:`目录大纲`,headingCount:`{count} 个标题`,noHeadings:`暂无标题`,wordCount:`词数`,charCount:`字符数`,readingTimeMinutes:`{minutes} 分钟`,estimatedReadingTime:`预计阅读时间`,totalLines:`总行数`,viewEdit:`编辑`,viewSplit:`双屏`,viewPreview:`预览`,mobilePreview:`移动端预览`,desktopPreview:`桌面端预览`,disableScrollSync:`关闭同步滚动`,enableScrollSync:`开启同步滚动`,lastModified:`上次修改时间`,toggleDarkMode:`切换深色模式`},rightSlider:{title:`样式`,headingStyle:`标题`,selectHeading:`标题`,selectStyle:`样式`,styleConfig:`操作`,codeBlockLineNumber:`行号`,citeStatus:`外链转引用`,paragraphIndent:`首行缩进`,paragraphJustify:`两端对齐`,selectCodeBlockTheme:`代码主题`},contextMenu:{textFormat:`文本格式`,resetStyle:`重置样式`,importMd:`导入 .md 文档`,exportMd:`导出 .md 文档`,exportHtml:`导出 .html`,exportPdf:`导出 .pdf`,exportPng:`导出 .png`},search:{toggleReplace:`切换替换`,find:`查找`,caseSensitive:`区分大小写`,regex:`正则表达式`,findInSelection:`在选区内查找`,previous:`上一处`,next:`下一处`,close:`关闭`,replace:`替换`,replaceAll:`全部替换`,replacePlaceholder:`替换 (Shift+Enter 换行)`},commandPalette:{title:`命令面板`,description:`搜索并执行编辑器命令`,searchPlaceholder:`搜索命令…`,noMatch:`无匹配命令`,group:{help:`帮助`,view:`视图`,panel:`面板`,file:`文件`,edit:`编辑`,insert:`插入`,cloud:`云端`,settings:`设置`},openPreferences:`打开偏好设置`,viewEdit:`视图：编辑`,viewSplit:`视图：双屏`,viewPreview:`视图：预览`,toggleDark:`切换深色模式`,stylePanel:`样式面板`,formatDocument:`格式化文档`,insertImage:`插入图片`,insertTable:`插入表格`,insertFormula:`插入公式`,insertComponent:`插入组件`},slash:{group:{basic:`基础`,common:`常用`,edit:`编辑`,style:`样式`},filterMatch:`匹配「{filter}」`,theme:`主题`,primaryColor:`主题色`,themeLabel:`主题 · {name}`,colorLabel:`主题色 · {name}`,blockquote:`引用`,divider:`分割线`,codeBlock:`代码块`,formulaBlock:`公式`},keyboard:{description:`命令面板：{shortcut}`,category:{general:`通用`,edit:`编辑`,format:`格式`,navigation:`导航`},slashCommand:`斜杠命令`,closeSearchPanel:`关闭搜索面板`,goToLine:`跳转到行`,previousHeading:`上一个标题`,nextHeading:`下一个标题`,outlineNavigate:`大纲面板导航`}},Ue={locale:{label:`语言`,zhCN:`简体中文`,enUS:`English`},meta:{title:`微信 Markdown 编辑器 | Doocs`,description:`Wechat Markdown Editor | 一款高度简洁的微信 Markdown 编辑器`},loader:{tagline:`致力于让 Markdown 编辑更简单`,loading:`正在加载编辑器`,timeout:`加载时间过长，请尝试刷新页面或按 F12 查看控制台是否有异常信息`},common:{tip:`提示`,cancel:`取消`,confirm:`确定`,save:`保存`,create:`创建`,edit:`编辑`,delete:`删除`,close:`关闭`,copy:`复制`,reset:`重置`,clear:`清空`,loading:`加载中...`,login:`登录`,logout:`退出登录`,search:`搜索`,export:`导出`,import:`导入`,apply:`应用`,done:`完成`,skip:`跳过`,retry:`重试`,refresh:`刷新`,unnamed:`未命名`,unknown:`未知`,copied:`已复制`,copyFailed:`复制失败，请手动复制`,copiedToClipboard:`已复制到剪贴板`,saveSuccess:`保存成功`,deleteSuccess:`删除成功`,operationSuccess:`操作成功`,operationFailed:`操作失败`,required:`必填`,optional:`可选`,noData:`暂无数据`,selectAll:`全选`,deselectAll:`取消全选`,selected:`已选`,unit:`个`,yes:`是`,no:`否`,view:`查看`,open:`打开`,insert:`插入`,download:`下载`,upload:`上传`,uploading:`上传中...`,processing:`处理中...`,generating:`正在生成...`,testing:`测试中...`,testConnection:`测试连接`,lightMode:`浅色模式`,darkMode:`深色模式`,account:`账户`,moreActions:`更多操作`,expand:`展开`,collapse:`收起`,accept:`接受`,send:`发送`,pause:`暂停`,add:`添加`,rename:`重命名`,merge:`合并`,history:`历史记录`,preview:`预览`,default:`默认`,custom:`自定义`,none:`无`,enabled:`已启用`,disabled:`已关闭`},menu:{file:`文件`,edit:`编辑`,format:`格式`,insert:`插入`,style:`样式`,help:`帮助`,localFolder:`本地文件夹`,import:`导入`,importMarkdown:`导入 Markdown`,export:`导出`,exportMarkdown:`Markdown 文件`,exportHtml:`HTML 文件`,exportHtmlNoStyle:`HTML（纯）`,exportPdf:`PDF 文档`,exportPng:`PNG 图片`,templateManage:`模板管理`,contentManage:`内容管理`,cloudSync:`云同步`,sharePreview:`分享预览`,preferences:`偏好设置`,importExportConfig:`导入/导出配置`,undo:`撤销`,redo:`重做`,copy:`复制`,copyWechat:`公众号格式`,copyHtml:`HTML 格式`,copyHtmlNoStyle:`HTML（纯）`,copyHtmlCompat:`HTML（兼容）`,copyMd:`MD 格式`,copySelection:`选中内容`,paste:`粘贴`,formatContent:`格式化`,reset:`重置`,clear:`清空`,find:`查找`,replace:`替换`,bold:`加粗`,italic:`斜体`,strikethrough:`删除线`,link:`超链接`,inlineCode:`行内代码`,textColor:`文字颜色`,heading:`标题`,headingN:`标题 {n}`,unorderedList:`无序列表`,orderedList:`有序列表`,wechatLinkToCite:`外链转引用`,wordCountTime:`字数统计`,image:`图片`,formula:`公式`,table:`表格`,component:`组件`,theme:`主题`,font:`字体`,fontSize:`字号`,primaryColor:`主题色`,codeBlockTheme:`代码主题`,legendFormat:`图注`,customPrimaryColor:`自定义色`,customCss:`自定义 CSS`,macCodeBlock:`Mac 样式`,commandPalette:`命令面板`,keyboardShortcuts:`快捷键`,syntaxHelp:`语法帮助`,feedback:`反馈`,releaseHistory:`版本历史`,about:`关于`,fund:`赞赏`},header:{copy:`复制`,style:`样式`},toast:{copiedMarkdown:`已复制 Markdown 源码到剪贴板。`,copyFailed:`复制失败：{message}`,processHtmlFailed:`处理 HTML 失败，请联系开发者。{message}`,asyncContentPending:`部分图表或公式尚未渲染完成，已跳过未加载内容。请稍后再试。`,outputAreaMissing:`未找到复制输出区域，请刷新页面后重试。`,copyFailedContactDev:`复制失败，请联系开发者。{message}`,copiedHtml:`已复制 HTML 源码，请进行下一步操作。`,copiedRendered:`已复制渲染后的内容到剪贴板，可直接到公众号后台粘贴。`,styleReset:`样式已重置`,contentCleared:`内容已清空`,contentReset:`内容已重置`,pasteFailed:`粘贴失败，请检查浏览器剪贴板权限。{message}`,storageQuota:`本地存储空间不足，部分设置可能无法保存`},confirm:{tip:`提示`,resetStyleDescription:`此操作将丢失本地自定义样式，是否继续？`,deleteItem:`此操作将删除「{name}」`,deleteTemplate:`确定要删除模板「{name}」吗？此操作不可恢复。`,deleteComponent:`确认删除`,cancelShare:`确定取消「{title}」的分享吗？`,restoreVersion:`此操作将用该记录替换当前内容，是否继续？`,deleteCssScheme:`此操作将删除选中的 {count} 个方案，是否继续？`},styleOptions:{theme:{default:{label:`经典`,desc:``},grace:{label:`优雅`,desc:`{'@'}brzhang`},simple:{label:`简洁`,desc:`{'@'}okooo5km`}},fontFamily:{sansSerif:{label:`无衬线`,desc:`字体123Abc`},serif:{label:`衬线`,desc:`字体123Abc`},monospace:{label:`等宽`,desc:`字体123Abc`}},fontSize:{smaller:`更小`,slightlySmaller:`稍小`,recommended:`推荐`,slightlyLarger:`稍大`,larger:`更大`},color:{classicBlue:{label:`经典蓝`,desc:`稳重冷静`},emeraldGreen:{label:`翡翠绿`,desc:`自然平衡`},vividOrange:{label:`活力橘`,desc:`热情活力`},lemonYellow:{label:`柠檬黄`,desc:`明亮温暖`},lavenderPurple:{label:`薰衣紫`,desc:`优雅神秘`},skyBlue:{label:`天空蓝`,desc:`清爽自由`},roseGold:{label:`玫瑰金`,desc:`奢华现代`},oliveGreen:{label:`橄榄绿`,desc:`沉稳自然`},graphiteBlack:{label:`石墨黑`,desc:`内敛极简`},mistGray:{label:`雾烟灰`,desc:`柔和低调`},sakuraPink:{label:`樱花粉`,desc:`浪漫甜美`}},headingLevel:{h1:`H1`,h2:`H2`,h3:`H3`,h4:`H4`,h5:`H5`,h6:`H6`},headingStyle:{default:`默认`,colorOnly:`主题色`,borderBottom:`下边框`,borderLeft:`左边框`,custom:`自定义`},legend:{titleAlt:`title 优先`,altTitle:`alt 优先`,titleOnly:`仅 title`,altOnly:`仅 alt`,filename:`文件名`,none:`不显示`}}},We={share:{title:`分享预览`,description:`生成与编辑器预览一致的只读链接，便于转发给他人查看。`,notConfiguredTitle:`分享服务未配置`,notConfiguredDescription:`当前部署未配置分享服务，请联系部署方启用后再试。`,loginTitle:`登录后分享预览`,tabCreate:`生成分享`,tabManage:`我的分享`,expiresIn1Day:`1 天后过期`,limitPerDay:`2 次/天`,expiresLabel:`链接有效期`,expiresMode:{"1d":`1 天`,"7d":`7 天`,"30d":`30 天`,never:`永不过期`},passwordLabel:`访问密码`,passwordMode:{public:{label:`公开链接`,description:`任何人持链接即可查看`},custom:{label:`自定义密码`,description:`自行设置 4–64 位访问密码`},auto:{label:`随机密码`,description:`系统生成 8 位密码，生成后展示`}},customPasswordLabel:`输入访问密码`,customPasswordPlaceholder:`4–64 个字符`,generateLink:`生成分享链接`,generating:`正在生成…`,stageRendering:`正在等待图表与公式渲染…`,stageUploading:`正在上传分享快照…`,readyHint:`分享链接已就绪，可直接复制或打开预览。`,linkLabel:`分享链接`,accessPasswordLabel:`访问密码`,copyLinkAndPassword:`复制链接与密码`,customPasswordHint:`已启用密码保护，请妥善保管你设置的密码。`,expiresAt:`过期：{date}`,previewConsistent:`预览与编辑器一致`,regenerate:`重新设置并生成`,manageHint:`管理已发布的分享链接，取消后链接立即失效。`,refreshList:`刷新列表`,emptyTitle:`暂无分享记录`,emptyDescription:`生成分享后，可在此统一管理链接。`,viewCount:`{count} 次阅读`,expired:`已过期`,permanent:`永久有效`,expiresOn:`{date} 过期`,passwordProtected:`已设密码`,copyLink:`复制链接`,openPreview:`打开预览`,revokeShare:`取消分享`,untitled:`无标题`,proRequired:`我的分享为 Pro 专属功能`,loadListFailed:`加载分享列表失败：{message}`,revokeTitle:`取消分享`,revokeDescription:`确定取消「{title}」的分享吗？链接将立即失效。`,revokeSuccess:`已取消分享`,revokeFailed:`取消分享失败：{message}`,invalidPost:`当前文章无效，请刷新后重试。`,linkUpdated:`分享链接已更新`,linkCreated:`分享链接已生成`,createFailed:`生成分享链接失败：{message}`,invalidPassword:`密码长度需为 4–64 个字符。`,forbidden:`无权更新此分享，请刷新后重试。`,rateLimited:`每天最多分享 {limit} 次`,rateLimitedGeneric:`分享过于频繁`,retryAfterHours:`，请 {hours} 小时后再试`,retryAfterMinutes:`，请 {minutes} 分钟后再试`,retryTomorrow:`，请明天再试`,copyBundle:{link:`链接：{url}`,password:`密码：{password}`}},sync:{title:`云同步`,description:`多设备同步文章与设置，不含密钥与图床凭证。`,notConfiguredTitle:`云同步未启用`,notConfiguredDescription:`当前部署未配置同步服务，请联系部署方启用后再试。`,loginTitle:`登录后开启云同步`,lastSync:`上次同步：{time}`,neverSynced:`从未同步`,syncNow:`立即同步`,syncing:`同步中…`,syncFailed:`同步失败：{message}`,syncSuccess:`同步完成`},account:{title:`账户`,loginHint:`登录后可使用云同步、分享预览等云端能力。`,notConfiguredTitle:`账户服务未配置`,notConfiguredDescription:`部署方需配置 VITE_MD_API_URL 后，方可使用登录与云同步。`,loginTitle:`登录你的账户`,githubLogin:`GitHub 登录`,extensionLoginUnavailable:`当前环境不支持扩展内登录，请更新插件或改用网页版登录。`,loginFailed:`登录失败，请稍后重试。`,loggingIn:`登录中…`,cloudSync:`云同步`,sharePreview:`分享预览`},about:{title:`关于`,description:`一款高度简洁的微信 Markdown 编辑器`,followHint:`扫码关注公众号 Doocs，原创技术内容第一时间推送！`,imageAlt:`Doocs Markdown 编辑器`},fund:{title:`赞赏`,description:`若觉得项目不错，可以通过以下方式支持我们～`,qrAlt1:`赞赏二维码 1`,qrAlt2:`赞赏二维码 2`},markdownHelp:{title:`Markdown 语法帮助`,description:`查看支持的 Markdown 语法，点击语法可直接复制`,clickToCopy:`点击复制`,tabs:{basic:`基础语法`,code:`代码块`,math:`数学公式`,diagram:`图表绘制`,other:`其他语法`},syntax:{basic:[{name:`标题`,syntax:`# 一级标题
## 二级标题
### 三级标题`,tip:`# 数量表示标题级别，最多支持六级`},{name:`粗体`,syntax:`**粗体文本**`,example:`粗体文本`},{name:`斜体`,syntax:`*斜体文本*`,example:`斜体文本`},{name:`删除线`,syntax:`~~删除线~~`,example:`删除线`},{name:`高亮`,syntax:`==高亮文本==`,example:`高亮文本`},{name:`下划线`,syntax:`++下划线++`,example:`下划线`},{name:`行内代码`,syntax:"`代码`",example:`代码`},{name:`无序列表`,syntax:`- 项目 1
- 项目 2
  - 嵌套项目`,tip:`使用 -、* 或 + 加空格`},{name:`有序列表`,syntax:`1. 项目 1
2. 项目 2`,tip:`数字加点号`},{name:`链接`,syntax:`[显示文本](链接地址)`,example:`Doocs`,tip:`微信公众号不支持外链跳转`},{name:`图片`,syntax:`![描述](图片地址)`,tip:`支持网络图片地址`},{name:`引用`,syntax:`> 引用内容
>> 嵌套引用`},{name:`分割线`,syntax:`---`,tip:`三个或更多 -、* 或 _`},{name:`表格`,syntax:`| 列1 | 列2 |
| --- | --- |
| 内容1 | 内容2 |`,tip:`点击「编辑 > 插入表格」快速创建`}],code:[{name:`基本代码块`,syntax:"```\n代码内容\n```"},{name:`指定语言`,syntax:'```js\nconsole.log("Hello")\n```',tip:`支持 js、ts、python、java、go 等多种语言`}],math:[{name:`行内公式`,syntax:`$E = mc^2$`,example:`E = mc²`},{name:`块级公式`,syntax:`$$
\\int_0^1 x^2 dx
$$`},{name:`LaTeX 格式（行内）`,syntax:`\\(x^2 + y^2\\)`,tip:`LaTeX 标准格式`},{name:`LaTeX 格式（块级）`,syntax:`\\[
\\sum_{i=1}^n x_i
\\]`}],diagram:[{name:`Mermaid 流程图`,syntax:"```mermaid\ngraph LR\n  A --> B\n```",tip:`支持流程图、时序图、饼图等`},{name:`PlantUML`,syntax:"```plantuml\n@startuml\nA -> B\n@enduml\n```",tip:`详见 plantuml.com`},{name:`信息图`,syntax:"```infographic\ninfographic list-row\n...\n```",tip:`AntV 信息图引擎`}],other:[{name:`注音标注`,syntax:`[文字]{注音}
[文字]^(注音)`,example:`你好`,tip:`支持日语假名、拼音等`},{name:`幻灯片`,syntax:`<![alt](url1),![alt](url2)>`,tip:`横屏滑动图片，仅支持微信公众号`},{name:`HTML 标签`,syntax:`<center>居中内容</center>`,tip:`部分 HTML 标签可用`}]}},postInfo:{publish:`发布`,title:`发布`,description:`将文章发布到多个平台`,extensionMissingTitle:`未检测到插件`,extensionMissingDescription:`请安装 {link} 浏览器扩展`,extensionLinkText:`COSE 文章同步助手`,coseHint:`此功能由 {githubLink} 支持，完全本地运行，不收集、不存储任何用户信息。`,coseGithubText:`GitHub 开源插件 COSE`,coseContribute:`如需添加更多平台或改善同步准确度，欢迎提 {issueLink} 或 PR。`,issueLinkText:`Issue`,cover:`封面`,coverPlaceholder:`自动提取第一张图`,titleLabel:`标题`,titlePlaceholder:`自动提取第一个标题`,descLabel:`描述`,descPlaceholder:`自动提取第一个段落`,platform:`平台`,selectAll:`全选`,checking:`检测中`,coverPreview:`封面预览`,coverPreviewAlt:`封面预览`,categories:{media:`媒体`,blog:`博客`,cloud:`云与开发者`}},postTask:{title:`提交发布任务`,waiting:`等待发布..`,publishing:`发布中`,syncFailed:`同步失败，错误内容：{error}`,syncSuccess:`同步成功`,viewDraft:`查看草稿`},preferences:{title:`偏好设置`,description:`自定义语言、外观与编辑器行为。`,tab:{general:`通用`,editor:`编辑`,preview:`预览`},language:{label:`语言`,hint:`界面显示语言`},darkMode:{label:`深色模式`},viewMode:{label:`视图模式`},viewModeOption:{edit:`编辑`,split:`双屏`,preview:`预览`},previewDevice:{label:`预览设备`},previewDeviceOption:{desktop:`电脑`,mobile:`手机`},scrollSync:{label:`同步滚动`,hint:`编辑区与预览区滚动联动`},showAIToolbox:{label:`AI 工具箱`,hint:`选中文本时显示浮动 AI 工具`},imageReupload:{label:`图片转存`,hint:`复制时自动将图片转存到图床`},wordCount:{label:`字数统计`,hint:`在预览文章顶部显示字数与阅读时间`}}},Ge={codemirror:{contentPlaceholder:`输入 "/" 快速添加内容`},post:{contentManage:`内容管理`,titleRequired:`内容标题不可为空`,addSuccess:`内容新增成功`,renameSuccess:`内容重命名成功`,deleteSuccess:`内容删除成功`,restoreSuccess:`记录恢复成功`,editSuccess:`修改成功`,copySuffix:`副本`,exitSelect:`退出选择`,multiSelect:`多选操作`,importMarkdownBatch:`导入 Markdown（支持批量）`,sortBy:`排序方式`,sortNameAZ:`文件名（A-Z）`,sortNameZA:`文件名（Z-A）`,sortUpdateNewOld:`编辑时间（新→旧）`,sortUpdateOldNew:`编辑时间（旧→新）`,sortCreateNewOld:`创建时间（新→旧）`,sortCreateOldNew:`创建时间（旧→新）`,batchImport:`批量导入`,exportAll:`导出全部`,collapseAll:`全部收起`,expandAll:`全部展开`,regex:`正则表达式`,caseSensitive:`区分大小写`,replaceWith:`替换为…`,replaceOne:`替换一处`,replaceAll:`全部替换`,matchStats:`共 {matches} 处匹配，{posts} 篇内容`,noMatch:`没有匹配的内容`,emptyTitle:`暂无内容`,emptyHint:`点击上方 + 按钮创建`,selectedCount:`已选`,postUnit:`篇`,mergeMinTwo:`至少选择 2 篇才能合并`,keepOnePost:`至少保留一篇内容`,confirmDelete:`确定删除`,deleteBatchConfirm:`此操作将删除已选的 {count} 篇内容，是否继续？`,deletedBatch:`已删除 {count} 篇内容`,duplicatedBatch:`已复制 {count} 篇内容`,exportedBatch:`已导出 {count} 篇内容`,replacedOne:`已替换 1 处`,replacedCount:`已替换 {count} 处`,mergeTitleRequired:`合并标题不可为空`,mergedAs:`已合并为「{title}」`,dragToChildError:`不能将内容拖拽到其子内容下面`,addTitle:`新增内容`,addDescription:`请输入内容名称`,titlePlaceholder:`输入标题…`,editTitle:`编辑内容名称`,editDescription:`请输入新的内容名称`,deleteRecursive:`同时删除所有子内容`,mergeTitle:`合并为一篇`,mergeDescription:`将选中的 {count} 篇内容按顺序合并，请为合并结果命名`,mergePlaceholder:`输入合并后的标题…`,historyTitle:`历史记录`,historyDescription:`每隔 30 秒自动保存，最多保留 10 条`,originalContent:`原文`,versionDiff:`版本对比`,compareLabel:`对比：`,restore:`恢 复`,restoreArticleDescription:`此操作将用该记录替换当前文章内容，是否继续？`,addPost:`新增内容`,saveAsTemplate:`存储为模板`,applyTemplate:`应用模板`,exportMd:`导出 .md`,templateFromPost:`从「{title}」创建于 {date}`,menuRename:`重命名`},folder:{title:`本地文件夹`,closeFolder:`关闭文件夹`,closePanel:`关闭面板`,openFolder:`打开文件夹`,browserUnsupported:`您的浏览器不支持本地文件夹访问`,browserHint:`请使用 Chrome、Edge 或 Opera 浏览器`,noFolder:`未打开文件夹`,noFolderHint:`点击上方按钮打开本地文件夹`,fileLoaded:`已加载文件: {name}`,openFileFailed:`打开文件失败`},editorState:{title:`导入/导出项目配置`,description:`导入的配置将覆盖当前项目的配置，请谨慎操作。`,importTab:`导入配置`,exportTab:`导出配置`,selectExport:`请选择需要导出的配置`,jsonPreview:`当前 JSON 预览`,exportSelected:`导出选中配置`,importJson:`导入 JSON 配置文件`,selectJsonFile:`点击选择 JSON 文件`,jsonFormatHint:`支持格式: .json`,selectImportItems:`选择要导入的配置项`,importFirst:`请先导入 JSON 文件`,reimport:`重新导入`,applySelected:`应用选中配置`,fullscreenPreview:`JSON 全屏预览`,fullscreenDescription:`当前配置的完整 JSON 数据`,copyJson:`复制 JSON`,exportSuccess:`配置文件导出成功`,importFormatError:`导入的文件格式不正确`,importNoApplicable:`导入的文件无可应用项目配置`,importSuccess:`配置文件导入成功`,parseFailed:`文件解析失败，请检查JSON格式`,applySuccess:`配置应用成功，请刷新页面查看效果`,copyRetry:`复制失败，请重试`,storeLabels:{isDark:`深色模式`,isMacCodeBlock:`Mac 代码块`,isShowLineNumber:`代码块行号`,isCiteStatus:`微信外链接底部引用状态`,isCountStatus:`字数统计状态`,isUseIndent:`使用缩进`,isUseJustify:`使用两端对齐`,isOpenRightSlider:`开启右侧滑块`,isOpenPostSlider:`开启右侧发布滑块`,showAIToolbox:`AI 工具箱状态`,theme:`主题`,fontFamily:`字体`,fontSize:`字体大小`,primaryColor:`自定义主题色`,codeBlockTheme:`代码块主题`,legend:`图注格式`,fontSizeNumber:`字体大小`,currentPostId:`当前文章 ID`,currentPostIndex:`当前文章索引`,posts:`内容列表`,cssContentConfig:`自定义 CSS`,titleList:`文章标题列表`,readingTime:`阅读时间`,isShowCssEditor:`显示 CSS 编辑器`,isShowInsertFormDialog:`显示插入表单对话框`,isShowInsertMpCardDialog:`显示插入公众号名片对话框`,isShowUploadImgDialog:`显示上传图片对话框`,aiDialogVisible:`AI 对话框可见`,aiImageDialogVisible:`AI 图片生成对话框可见`}},formula:{title:`公式编辑器`,description:`支持 LaTeX 编辑、实时预览和公式库插入。`,latexInput:`LaTeX 输入`,inline:`行内`,block:`块级`,latexPlaceholder:`输入 LaTeX 公式`,preview:`预览`,library:`公式库`,loadingEngine:`正在加载公式引擎…`,previewEmpty:`输入公式后会在这里显示预览`,contentRequired:`请输入公式内容`,insertSuccess:`公式已插入`,insertFormula:`插入公式`,groups:{basic:`基础`,greek:`希腊`,relation:`关系`,symbol:`符号`,logic:`逻辑`,matrix:`矩阵`,algebra:`代数`,calculus:`微积分`,statistics:`统计`,set:`集合`,trigonometry:`三角`,physics:`物理`,chemistry:`化学`}},insertForm:{title:`插入表格`,description:`设置行列数并填写表头，确认后插入 Markdown 表格`,rows:`行数`,cols:`列数`,headerPlaceholder:`表头`},importMd:{title:`导入 Markdown`,description:`从网络链接或本地文件导入内容，支持公众号文章、博客等任意网页链接`,localFile:`本地文件`,networkUrl:`网络链接`,dropHint:`点击选择文件或拖拽文件到此处`,formatHint:`支持 .md、.markdown、.txt 格式`,urlPlaceholder:`如：https://mp.weixin.qq.com/s/xxxxx`,urlHint:`支持 Markdown 文件链接直接导入，或网页链接自动转换`,importing:`导入中...`,poweredBy:`基于`,conversionService:`提供转换服务`,urlRequired:`请输入链接`,urlInvalid:`请输入有效的 URL 地址（仅支持 http/https）`,requestFailed:`请求失败: {status} {statusText}`,contentEmpty:`该链接返回的内容为空`,convertFailed:`转换失败`,convertResultEmpty:`转换结果为空`,importFailed:`导入失败，请检查链接是否有效`,dropInvalid:`请拖入 Markdown 文件（.md / .markdown / .txt）`,importedOne:`已导入 1 篇文章`,importedBatch:`已批量导入 {count} 篇文章`},template:{title:`模板管理`,description:`保存和管理您的 Markdown 模板，快速复用常用内容`,create:`新建模板`,edit:`编辑模板`,nameLabel:`模板名称 *`,namePlaceholder:`请输入模板名称`,nameRequired:`模板名称不能为空`,nameTooLong:`模板名称不能超过 50 个字符`,descLabel:`模板描述`,descPlaceholder:`请输入模板描述（可选）`,contentLabel:`模板内容`,contentPlaceholder:`请输入模板内容`,searchPlaceholder:`搜索模板名称、描述...`,newTemplate:`新建模板`,noMatch:`未找到匹配的模板`,empty:`暂无模板`,emptyHint:`点击「新建模板」按钮创建您的第一个模板`,createdAt:`创建：`,updatedAt:`更新：`,applyTitle:`应用模板（替换全部内容）`,insertTitle:`插入模板（在光标处插入）`,editTitle:`编辑模板`,deleteTitle:`删除模板`,confirmDelete:`确认删除`,appliedToPost:`已应用模板「{name}」到当前文章`,applied:`已应用模板「{name}」`,inserted:`已插入模板「{name}」`},component:{title:`组件`,description:`在 Markdown 中插入 JSX 风格组件，如`,create:`新建组件`,edit:`编辑组件`,nameLabel:`组件名称`,nameHint:`（PascalCase，如 QRCodeBlock）`,descLabel:`组件描述`,descPlaceholder:`简短描述该组件的用途`,propsLabel:`Props 定义`,addProp:`添加 Prop`,propName:`名称`,propType:`类型`,propDesc:`描述`,propDefault:`默认值`,defaultValue:`默认值`,noProps:`当前组件没有 Props。需要时可点击“添加 Prop”新增。`,propRefHint:`在模板中使用 {'{'}{'{'}propName{'}'}{'}'} 引用 prop 值`,htmlTemplate:`HTML 模板`,templateHint1:`{'{'}{'{'}propName{'}'}{'}'} — 替换为 prop 值（自动 HTML 转义）`,templateHint2:`{'{'}{'{'}#if prop{'}'}{'}'}...{'{'}{'{'}#else{'}'}{'}'}...{'{'}{'{'}/if{'}'}{'}'} — 条件块（支持 else）`,templateHint3:`{'{'}{'{'}#unless prop{'}'}{'}'}...{'{'}{'{'}/unless{'}'}{'}'} — 反向条件`,templateHint4:`{'{'}{'{'}#each arrayProp{'}'}{'}'}...{'{'}{'{'}item{'}'}{'}'}...{'{'}{'{'}item.key{'}'}{'}'}...{'{'}{'{'}/each{'}'}{'}'} — 数组循环`,previewLabel:`预览（使用默认 prop 值）`,builtin:`内置组件`,custom:`自定义组件`,builtinBadge:`内置`,propCount:`{count} 个属性`,propDocs:`属性说明`,propNameCol:`属性名`,typeCol:`类型`,statusCol:`状态`,descCol:`描述`,defaultCol:`默认值`,required:`必填`,optional:`可选`,defaultPrefix:`默认：`,example:`使用示例`,savedAccounts:`已保存的公众号`,noAccounts:`暂无保存的公众号，点击「新增」添加`,noCustom:`暂无自定义组件，点击上方”新建”按钮创建`,noPropsDefined:`该组件无属性定义`,noContent:`（无内容）`,nameRequired:`组件名称不能为空`,nameInvalid:`组件名称必须以大写字母开头，只含字母和数字（PascalCase）`,nameDuplicate:`组件名称已存在，请更换名称`,templateRequired:`组件模板不能为空`,exportSuccess:`已导出自定义组件`,importSuccess:`成功导入 {count} 个组件`,importFailed:`导入失败，请确认文件格式正确`,formatError:`格式错误`,insertSuccess:`已插入组件「{name}」`,confirmDelete:`确认删除`,deleteConfirm:`确定要删除组件「{name}」吗？`,insertMpSuccess:`已插入公众号名片「{name}」`,deleteMpConfirm:`确定要删除公众号「{name}」吗？此操作不可恢复。`,deleted:`已删除`,builtinComponents:{MpProfile:{description:`公众号名片组件，展示微信公众号名片`,props:{mpId:`公众号 ID`,nickname:`公众号名称`,headimg:`公众号头像 URL`,signature:`公众号简介`,serviceType:`账号类型（1=公众号，2=服务号）`,verifyStatus:`认证状态（0=无，1=个人，2=企业）`}},QRCodeBlock:{description:`二维码组件，将 URL 渲染为可扫描的二维码图片`,props:{url:`二维码内容（URL）`,text:`二维码下方提示文字`,size:`二维码尺寸（px）`},propDefaults:{text:`扫码访问`}},AuthorBlock:{description:`作者信息组件，展示作者头像、名称和简介`,props:{name:`作者名称`,avatar:`头像图片 URL`,bio:`作者简介`}},TipBlock:{description:`提示框组件，高亮展示小贴士或注意事项`,props:{type:`类型：info | success | warning | danger`,title:`标题（可选）`,content:`提示内容`}},TableBlock:{description:`表格组件，用 JSON 数组渲染样式化表格，支持斑马纹`,props:{headers:`列标题 JSON 字符串数组`,rows:`数据行 JSON 二维数组`,striped:`斑马纹行（true/false）`,caption:`表格标题（可选）`}},InfoGrid:{description:`信息网格组件，以多列展示键值对信息`,props:{items:`JSON 数组，每项含 label、value 字段`,cols:`列数（1-3）`}},BadgeGroup:{description:`标签组组件，展示一组彩色标签`,props:{tags:`JSON 字符串数组，标签列表`,color:`标签主色调（hex）`}}}},mpAccount:{editTitle:`编辑公众号`,addTitle:`新增公众号`,idLabel:`ID`,idPlaceholder:`例：MzIxNjA5ODQ0OQ==`,idHelp:`如何获取公众号 ID？`,nameLabel:`名称`,namePlaceholder:`例：Doocs`,logoLabel:`Logo`,logoPlaceholder:`例：https://doocs.com/mp-logo.png`,descLabel:`描述`,descPlaceholder:`例：GitHub 开源组织 {'@'}Doocs 旗下唯一公众号，专注分享技术领域相关知识及行业最新资讯。`,typeLabel:`类型`,typeOfficial:`公众号`,typeService:`服务号`,verifyLabel:`认证`,verifyNone:`无`,verifyPersonal:`个人`,verifyEnterprise:`企业`,updated:`「{name}」已更新`,added:`「{name}」已添加`,errors:{mpIdRequired:`公众号 ID 不能为空`,nameRequired:`公众号名称不能为空`,logoInvalid:`公众号 Logo 必须是一个有效的 URL`}},cssEditor:{schemeNameRequired:`方案名不可为空`,editNameFailed:`编辑失败，方案名不可为空`,createNameFailed:`新建失败，方案名不可为空`,createSuccess:`新建成功`,keepOneScheme:`至少保留一个方案`,schemeDefaultName:`方案{index}`,deleteSchemeConfirm:`此操作将删除该自定义方案，是否继续？`,schemeNotFound:`未找到当前方案`,basedOnTheme:`基于{theme}主题`,blankScheme:`空白方案`,basedClassic:`基于经典主题`,basedGrace:`基于优雅主题`,basedSimple:`基于简洁主题`,newTitle:`新建自定义 CSS`,newDescription:`请输入方案名称，并选择初始模板`,schemeName:`方案名称`,schemeNamePlaceholder:`输入方案名称`,initialTemplate:`初始模板`,selectTemplate:`选择初始模板`,templateHint:`选择一个内置主题作为起点，可以在其基础上进行修改`,editSchemeTitle:`编辑方案名称`,editSchemeDescription:`请输入新的方案名称`,viewBuiltinTitle:`查看内置主题样式`,viewBuiltinDescription:`查看并复制内置主题的 CSS 代码，或基于它们创建新方案`,selectTheme:`选择主题`,selectThemePlaceholder:`选择主题`,copyAll:`复制全部`,createFromTheme:`基于此主题新建`,multiSelect:`多选`,cssPlaceholder:`Your custom css here.`,selectedUnit:`个`,deleteSchemeMinOne:`至少保留一个方案`},editorPanel:{configureImgHost:`请先配置 {host} 图床参数`,uploadUnknownError:`上传图片未知异常`,uploadSuccess:`图片上传成功`,reuploading:`⏳ 转存中...`,reuploadFailed:`图片转存失败，已保留原链接`},localImage:{title:`检测到本地图片`,description:`文档中包含本地图片路径，请选择包含这些图片的文件夹，系统将自动匹配并上传。`,detectedCount:`检测到 {count} 张本地图片`,matchedCount:`已匹配 {matched} / {total}`,selectFolder:`选择包含图片的文件夹`,folderSelected:`已选择文件夹 ({count} 个文件)`,selectAtLeastOne:`请至少勾选一项`,notFoundInFolder:`以下图片未在文件夹中找到：{paths}`,uploadFailed:`上传失败`,uploadImages:`上传图片`,reupload:`重新上传`},customUpload:{paramDetails:`参数详情？`,saveConfig:`保存配置`},versionDiff:{identical:`两个版本内容完全相同`}},Ke={editor:{contentCleared:`内容已清空`,contentReset:`内容已重置`},post:{defaultTitle:`内容1`},template:{created:`模板「{name}」创建成功`,notFound:`模板不存在`,updated:`模板已更新`,deleted:`模板「{name}」已删除`,batchDeleted:`已删除 {count} 个模板`,allCleared:`已清空所有模板（共 {count} 个）`,importInvalidFormat:`导入失败：数据格式不正确`,importNoValid:`导入失败：没有有效的模板数据`,importSuccess:`成功导入 {count} 个模板`,importParseError:`导入失败：数据解析错误`},component:{created:`组件「{name}」创建成功`,notFound:`组件不存在`,updated:`组件已更新`,deleted:`组件「{name}」已删除`},cssEditor:{schemeDefault:`方案1`,schemeDefaultSpaced:`方案 1`,keepAtLeastOne:`至少保留一个方案`,batchDeleted:`已删除 {count} 个方案`,batchExported:`已导出 {count} 个方案`,singleExported:`已导出「{name}」`},folder:{apiNotSupported:`您的浏览器不支持 File System Access API`,permissionDenied:`未授予文件夹访问权限`,opened:`文件夹「{name}」已打开`,openFailed:`打开文件夹失败: {message}`,noFolderSelected:`未选择文件夹`,fileNotFound:`文件不存在: {path}`,notAFile:`不是文件: {path}`,readFailed:`读取文件失败: {message}`},mpAccount:{newAccount:`新账号`,officialAccount:`公众号`,serviceAccount:`服务号`},sync:{syncing:`同步中`,syncingHint:`正在与云端交换数据…`,synced:`已同步`,syncedHint:`本地内容与云端一致`,failed:`同步失败`,failedHintDetail:`同步失败，请查看下方详情`,retryLater:`请稍后重试`,pending:`待同步`,pendingHint:`本地有未上传的更改`,syncingTooltip:`同步中…`,syncedTooltip:`已同步`,failedTooltip:`同步失败，点击重试`,pendingTooltip:`有未同步的更改`,rateLimited:`同步次数已达上限，请稍后再试`},uploader:{fileReadFailed:`文件读取失败`,fileReadError:`文件读取错误`,corsFailed:`跨域请求失败：目标图片禁止了跨域访问，且代理服务也无法获取。`,downloadFailed:`图片下载失败: {message}`,uploadFailed:`上传失败`,defaultHostRequiresApi:`默认图床需要配置 md-api 上传服务`},pdf:{pageFooter:`第 " counter(page) " 页，共 " counter(pages) " 页`},relativeTime:{justNow:`刚刚`,secondsAgo:`{seconds} 秒前`,minutesAgo:`{minutes} 分钟前`,hoursAgo:`{hours} 小时前`,daysAgo:`{days} 天前`},diagram:{downloadSvg:`下载为 SVG`,downloadPng:`下载为 PNG`,mermaidLoading:`正在加载 Mermaid...`,mermaidError:`Mermaid 渲染失败: {detail}`,plantumlLoading:`正在加载 PlantUML 图表...`,plantumlError:`PlantUML 图表加载失败`,infographicLoading:`正在加载 Infographic...`,infographicError:`Infographic 渲染失败: {detail}`},popup:{mustRead:`使用必读`,mpHostIntro:`如果您希望使用微信公众号素材库作为图床功能，需要进行以下配置：`,step1:`1.开启公众号开发者模式`,viewDocs:`查看文档`,step2:`2.配置IP白名单`,tutorial:`使用教程`,getStarted:`开始使用`},passwordInput:{toggleVisibility:`切换密码可见性`},extension:{editorTitle:`MD 公众号编辑器`},afdian:{monthly:`月付`,quarterly:`季付`,yearly:`年付`}},qe={title:`本地上传`,selectUpload:`选择上传`,selectHostPlaceholder:`请选择图床`,enableCompression:`开启图片压缩`,autoReuploadOnPaste:`粘贴图片时自动转存`,autoReuploadMdHint:`粘贴 Markdown 图片链接时自动转存到配置的图床`,dragOrClick:`将图片拖到此处，或`,clickToUpload:`点击上传`,saveConfig:`保存配置`,hostSwitched:`图床已切换`,configureHostFirst:`请先配置 {host} 图床参数`,hosts:{default:`默认`,github:`GitHub`,aliOSS:`阿里云`,txCOS:`腾讯云`,qiniu:`七牛云`,minio:`MinIO`,s3:`S3`,mp:`公众号图床`,r2:`Cloudflare R2`,upyun:`又拍云`,telegram:`Telegram`,cloudinary:`Cloudinary`,formCustom:`自定义代码`},errors:{invalidFormat:`请上传 GIF/JPG/JPEG/PNG/WEBP 格式的图片`,tooLarge:`由于公众号限制，图片大小不能超过 {maxSize}M`},labels:{githubRepo:`GitHub 仓库`,branch:`分支`,cdnAccel:`CDN 加速`,bucketRegion:`Bucket 所在区域`,customCdn:`自定义 CDN 域名`,storagePath:`存储路径`,storageRegion:`存储区域`,proxyDomain:`代理域名`,domain:`域名`,operator:`操作员`,operatorPassword:`操作员密码`,customDomain:`自定义域名`,customDomainCdn:`自定义域名 / CDN`},placeholders:{githubRepo:`如：github.com/yanglbme/resource`,branch:`如：release，可不填，默认 master`,token:`如：cc1d0c1426d0fd0902bd2d7184b14da61b8abc46`,accessKeyId:`如：LTAI4GdoocsmdoxUf13ylbaNHk`,accessKeySecret:`如：cc1d0c142doocs0902bd2d7md4b14da6ylbabc46`,bucket:`如：doocs`,ossRegion:`如：oss-cn-shenzhen`,cdnHost:`如：https://imagecdn.alidaodao.com，可不填`,storagePath:`如：img，可不填，默认为根目录`,storagePathRoot:`如：img，可不填，默认根目录`,secretId:`如：AKIDnQp1w3DOOCSs8F5MDp9tdoocsmdUPonW3`,secretKey:`如：ukLmdtEJ9271f3DOocsMDsCXdS3YlbW0`,cosBucket:`如：doocs-3212520134`,cosRegion:`如：ap-guangzhou`,qiniuAccessKey:`如：6DD3VaLJ_SQgOdoocsyTV_YWaDmdnL2n8EGx7kG`,qiniuSecretKey:`如：qgZa5qrvDOOcsmdKStD1oCjZ9nB7MDvJUs_34SIm`,qiniuBucket:`如：md`,qiniuDomain:`如：https://images.123ylb.cn`,qiniuRegion:`如：z2，可不填`,minioEndpoint:`如：play.min.io`,minioPort:`如：9000，可不填，http 默认为 80，https 默认为 443`,minioAccessKey:`如：zhangsan`,minioSecretKey:`如：asdasdasd`,s3Endpoint:`如：s3.amazonaws.com，可不填`,s3Region:`如：us-east-1`,s3Bucket:`如：bucket-name`,s3AccessKeyId:`如：AKIAIOSFODNN7EXAMPLE`,s3AccessKeySecret:`如：wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`,customDomain:`如：https://cdn.example.com`,proxyExample:`如：http://proxy.example.com`,proxyOptional:`可不填`,appId:`如：wx6e1234567890efa3`,appSecret:`如：d9f1abcdef01234567890abcdef82397`,accountId:`如: 0030f123e55a57546f4c281c564e560`,r2AccessKey:`如: 358090b3a12824a6b0787gae7ad0fc72`,r2SecretKey:`如: c1c4dbcb0b6b785ac6633422a06dff3dac055fe74fe40xj1b5c5fcf1bf128010`,r2Domain:`如：https://oss.example.com`,upyunBucket:`如: md`,upyunOperator:`如: operator`,upyunDomain:`如：http://xxx.test.upcdn.net`,telegramToken:`如：123456789:ABCdefGHIjkl-MNOPqrSTUvwxYZ`,telegramChatId:`如：-1001234567890`,cloudName:`如：demo`,apiKey:`如：1234567890`,apiSecretOptional:`用于签名上传，可不填`,uploadPresetUnsigned:`unsigned 时必填，signed 时可不填`,cloudinaryFolder:`如：blog/image，可不填`,cloudinaryDomain:`如：https://cdn.example.com，可不填`},help:{githubToken:`如何获取 GitHub Token？`,aliOSS:`如何使用阿里云 OSS？`,txCOS:`如何使用腾讯云 COS？`,qiniu:`如何使用七牛云 Kodo？`,minio:`如何使用 MinIO？`,mpDevMode:`如何开启公众号开发者模式并获取应用账号密钥？`,mpExtension:`如何在浏览器插件中使用公众号图床？`,r2S3Api:`如何使用 S3 API 操作 Cloudflare R2？`,r2Cors:`如何设置跨域(CORS)？`,upyun:`如何使用 又拍云？`,telegram:`如何使用 Telegram？`,cloudinary:`Cloudinary 使用文档`},validation:{githubRepoRequired:`GitHub 仓库不能为空`,githubTokenRequired:`GitHub Token 不能为空`,accessKeyIdRequired:`AccessKey ID 不能为空`,accessKeySecretRequired:`AccessKey Secret 不能为空`,bucketRequired:`Bucket 不能为空`,regionRequired:`Region 不能为空`,secretIdRequired:`Secret ID 不能为空`,secretKeyRequired:`Secret Key 不能为空`,accessKeyRequired:`AccessKey 不能为空`,accountIdRequired:`Account ID 不能为空`,domainRequired:`Bucket 对应域名不能为空`,endpointRequired:`Endpoint 不能为空`,secretAccessKeyRequired:`Secret AccessKey 不能为空`,botTokenRequired:`Bot Token 不能为空`,chatIdRequired:`Chat ID 不能为空`,proxyRequired:`代理域名不能为空`,appIdRequired:`AppID 不能为空`,appSecretRequired:`AppSecret 不能为空`,operatorRequired:`操作员 不能为空`,passwordRequired:`密码 不能为空`,cdnDomainRequired:`CDN 域名不能为空`,cloudNameRequired:`Cloud Name 不能为空`,apiKeyRequired:`API Key 不能为空`,uploadPresetRequired:`未填写 apiSecret 时必须提供上传预设名`},provider:{accessTokenFailed:`获取 access_token 失败`,uploadNoUrl:`上传失败，未获取到URL`,uploadFailedWithDetail:`上传失败: {detail}`,telegramSendPhotoFailed:`Telegram sendPhoto 失败`,telegramGetFileFailed:`Telegram getFile 失败`,cloudinaryMissingConfig:`Cloudinary 配置缺少 cloudName / apiKey`,cloudinaryMissingPreset:`未配置 apiSecret 时必须提供 uploadPreset`,cloudinaryMissingUrl:`Cloudinary 返回缺少 url 字段`}},Je={...Ue,...He,...We,...Ge,ai:Ve,upload:qe,store:Ke};function Ye(e=L){return i({legacy:!1,locale:e,fallbackLocale:L,messages:{"zh-CN":Je,"en-US":R}})}var z=null;function Xe(e){z=e}function B(){if(!z)throw Error(`i18n is not initialized`);return z}function Ze(e,t){let n=B().global.t;return n(e,t??{})}function Qe(){let e=B().global.locale;return typeof e==`string`?e:e.value}function $e(e=new Date){return e.toLocaleString(Qe())}var et=0;function V(){let e=Date.now();e-et<5e3||(et=e,a.warning(Ze(`toast.storageQuota`)))}function H(e){return e instanceof DOMException?e.name===`QuotaExceededError`||e.code===22:!1}function tt(e,t){if(typeof t==`string`)return e;try{return JSON.parse(e)}catch{return t}}var nt=class{cache=new Map;preloaded=!1;supportsSyncRead(){return this.preloaded}getSync(e){return this.cache.get(e)??null}async preload(){let e=await P();for(let t of[`settings`,`secrets`,`cache`]){let n=await e.getAll(t);for(let e of n)this.cache.set(e.key,e.value)}this.preloaded=!0}async get(e){if(this.cache.has(e))return this.cache.get(e);let t=await P(),n=O(e),r=(await t.get(n,e))?.value??null;return r!==null&&this.cache.set(e,r),r}async set(e,t){let n=await P(),r=O(e),i={key:e,value:t};await n.put(r,i),this.cache.set(e,t)}async remove(e){this.cache.delete(e);let t=await P(),n=O(e);await t.delete(n,e)}async has(e){if(this.cache.has(e))return!0;let t=await P(),n=O(e);return await t.get(n,e)!==void 0}async clear(){let e=await P();await Promise.all([e.clear(`settings`),e.clear(`secrets`),e.clear(`cache`)]);for(let e of[...this.cache.keys()])this.cache.delete(e)}async keys(){return[...this.cache.keys()]}},U=class{supportsSyncRead(){return!0}getSync(e){try{return localStorage.getItem(e)}catch{return null}}async get(e){return this.getSync(e)}async set(e,t){try{localStorage.setItem(e,t)}catch(e){throw H(e)&&V(),e}}async remove(e){localStorage.removeItem(e)}async has(e){return localStorage.getItem(e)!==null}async clear(){localStorage.clear()}async keys(){return Object.keys(localStorage)}};function rt(e,t){try{let n=JSON.parse(e),r=Object.keys(n);if(r.length<=t)return e;let i=r.slice(-t).reduce((e,t)=>(e[t]=n[t],e),{});return JSON.stringify(i)}catch{return e}}function it(e,t){try{let n=JSON.parse(e);return!Array.isArray(n)||n.length<=t?e:JSON.stringify(n.slice(-t))}catch{return e}}function at(e,t){return e===`uploaded_image_map`?rt(t,500):e===`ai_generated_images`||e===`ai_image_timestamps`||e===`ai_image_prompts`?it(t,50):t}var W=new class{engine=new U;setEngine(e){this.engine=e}getEngine(){return this.engine}getSync(e){return this.engine.getSync||this.engine instanceof U?this.engine.getSync(e):null}supportsSyncRead(){return this.engine.supportsSyncRead?.()??!1}async get(e){return this.engine.get(e)}async set(e,t){let n=D(e)?at(e,t):t;return this.engine.set(e,n)}async getJSON(e,t){let n=await this.engine.get(e);if(!n)return t??null;try{return JSON.parse(n)}catch(n){return console.error(`[Storage] Failed to parse JSON for key:`,e,n),t??null}}async setJSON(e,t){try{let n=JSON.stringify(t);return this.set(e,n)}catch(t){throw console.error(`[Storage] Failed to stringify JSON for key:`,e,t),t}}async remove(e){return this.engine.remove(e)}async has(e){return this.engine.has(e)}async clear(){return this.engine.clear()}async keys(){return this.engine.keys()}reactive(n,r){let i=typeof r==`string`,a=r;if(this.supportsSyncRead())try{let e=this.getSync(n);e!==null&&(a=i?e:this.parseJSON(e,r))}catch(e){console.error(`[Storage] Failed to read initial value:`,n,e)}else if(this.engine instanceof U)try{let e=this.engine.getSync(n);e!==null&&(a=i?e:this.parseJSON(e,r))}catch(e){console.error(`[Storage] Failed to read initial value:`,n,e)}let o=t(a);return!this.supportsSyncRead()&&!(this.engine instanceof U)&&(i?this.get(n).then(e=>e===null?null:e):this.getJSON(n,r)).then(e=>{e!==null&&(o.value=e)}),Promise.resolve().then(()=>{e(o,e=>{(i?this.set(n,e):this.setJSON(n,e)).catch(e=>{H(e)&&V(),console.error(`[Storage] Failed to save reactive data:`,n,e)})},{deep:!0})}),o}customReactive(e,t,r){let i=t;return this.getJSON(e,t).then(e=>{let n=e??t;i=r?.get?r.get(n):n}),n((t,n)=>({get(){return t(),i},set:t=>{let a=r?.set?r.set(t):t;i=a,n(),this.setJSON(e,a).catch(t=>{H(t)&&V(),console.error(`[Storage] Failed to save custom reactive data:`,e,t)})}}))}parseJSON(e,t){try{return JSON.parse(e)}catch{return console.warn(`[Storage] Failed to parse JSON, using fallback`),t}}};function G(e){return{id:e.id,title:e.title,content:e.content,history:(e.history??[]).map(({datetime:e,content:t})=>({datetime:String(e),content:String(t)})),createDatetime:new Date(e.createDatetime).toISOString(),updateDatetime:new Date(e.updateDatetime).toISOString(),parentId:e.parentId??null,collapsed:e.collapsed}}function ot(e){return{id:e.id,title:e.title,content:e.content,history:e.history??[],createDatetime:new Date(e.createDatetime),updateDatetime:new Date(e.updateDatetime),parentId:e.parentId??null,collapsed:e.collapsed}}var K=null,q=!1,st=Promise.resolve();function ct(e){q=e}function lt(){return K}function J(e){let t=st.then(e,e);return st=t.then(()=>{},()=>{}),t}async function ut(){let e=await W.get(E);if(!e)return[];try{let t=JSON.parse(e);return Array.isArray(t)?t.map((e,t)=>({...e,createDatetime:new Date(e.createDatetime??Date.now()+t),updateDatetime:new Date(e.updateDatetime??Date.now()+t),history:e.history??[]})):[]}catch{return[]}}async function Y(e){await W.setJSON(E,e),K=[...e]}async function dt(e){let t=await P(),n=await t.getAllKeys(b),r=new Set(e.map(e=>e.id)),i=t.transaction(b,`readwrite`);await Promise.all([...e.map(e=>i.store.put(G(e))),...n.filter(e=>!r.has(String(e))).map(e=>i.store.delete(e))]),await i.done,K=[...e]}async function ft(e){if(await(await P()).put(b,G(e)),K){let t=K.findIndex(t=>t.id===e.id);t===-1?K.push(e):K[t]=e}}var X={async loadAll(){return K||(q?(K=await ut(),K):(K=(await(await P()).getAll(b)).map(ot),K))},async savePost(e){return J(async()=>{try{if(q){let t=K??await this.loadAll(),n=t.findIndex(t=>t.id===e.id);n===-1?t.push(e):t[n]=e,await Y(t);return}await ft(e)}catch(e){throw H(e)&&V(),console.error(`[documentRepo] savePost failed:`,e),e}})},async saveAll(e){return J(async()=>{try{if(q){await Y(e);return}await dt(e)}catch(e){throw H(e)&&V(),console.error(`[documentRepo] saveAll failed:`,e),e}})},async deletePost(e){return J(async()=>{if(q){await Y((K??await this.loadAll()).filter(t=>t.id!==e));return}await(await P()).delete(b,e),K&&=K.filter(t=>t.id!==e)})},async clear(){return J(async()=>{if(q){await W.remove(E),K=[];return}await(await P()).clear(b),K=[]})}};function pt(e){try{localStorage.removeItem(e)}catch{}}function mt(){let e=[];try{for(let t=0;t<localStorage.length;t++){let n=localStorage.key(t);n&&e.push(n)}}catch{}return e}function Z(e){try{return localStorage.getItem(e)}catch{return null}}function ht(e){let t=new Set;if(e?.length)for(let n of e)t.add(n);else for(let e of mt())ke(e)&&t.add(e);t.add(E),t.add(y(`mp-profile`));for(let e of k)t.add(e);let n=0;for(let e of t)Z(e)!==null&&(pt(e),n++);return n>0&&console.info(`[Storage] Removed ${n} migrated localStorage entries`),n}function gt(e){try{let t=JSON.parse(e);return Array.isArray(t)?t.map((e,t)=>{let n=Date.now();return{...e,createDatetime:new Date(e.createDatetime??n+t),updateDatetime:new Date(e.updateDatetime??n+t),history:e.history??[]}}):null}catch{return null}}async function _t(e){if(Z(A)!==null||await e.get(A)!==null||!k.some(e=>Z(e)!==null))return;let t=Z(Ae)??await e.get(Ae)??v.theme,n=Z(j)??await e.get(j),r=n?tt(n,{}):{},i=ye(),a={...r[t]??i},o=Z(`fonts`);o&&(a.fontFamily=o);let s=Z(`size`);s&&(a.fontSize=s);let c=Z(`color`);c&&(a.primaryColor=c);let l=Z(`codeBlockTheme`);l&&(a.codeBlockTheme=l);let u=Z(`headingStyles`);if(u)try{a.headingStyles=JSON.parse(u)}catch{}let d=Z(`isMacCodeBlock`);d!==null&&(a.isMacCodeBlock=d===`true`);let f=Z(`isShowLineNumber`);f!==null&&(a.isShowLineNumber=f===`true`);let p={...r,[t]:a};await e.set(j,JSON.stringify(p)),await e.set(A,`1`);for(let e of k)try{localStorage.removeItem(e)}catch{}}async function vt(e){if(await e.get(M)===`1`)return;let t=y(`mp-accounts`);if(await e.get(t)!==null){await e.set(M,`1`);return}let n=Z(y(`mp-profile`));if(!n){await e.set(M,`1`);return}try{let r=JSON.parse(n);if(!r||!r.name&&!r.id){await e.set(M,`1`);return}let i=[{id:o(),mpId:r.id??``,name:r.name??``,logo:r.logo??``,desc:r.desc??``,serviceType:r.serviceType??`1`,verify:r.verify??`0`}];await e.set(t,JSON.stringify(i)),await e.set(y(`mp-current-account-id`),i[0].id)}catch{}finally{await e.set(M,`1`),pt(y(`mp-profile`))}}async function yt(e){let t=[];try{for(let e=0;e<localStorage.length;e++){let n=localStorage.key(e);n&&t.push(n)}}catch{}let n=Z(E);if(n!==null){let e=gt(n);if(e===null)return{ok:!1,keys:t};e.length&&await X.saveAll(e)}try{for(let n of t){if(n===E)continue;let t=Z(n);t!==null&&await e.set(n,at(n,t))}return{ok:!0,keys:t}}catch(e){return console.error(`[Storage] KV migration failed:`,e),{ok:!1,keys:t}}}function bt(e){try{return W.supportsSyncRead()?W.getSync(e):localStorage.getItem(e)}catch{return null}}function xt(e,t){try{return W.set(e,t),!0}catch(e){return H(e)&&V(),!1}}function St(e){try{return W.remove(e),!0}catch{return!1}}var Q=null;async function $(e){console.warn(`[Storage] ${e} — using localStorage fallback`),ct(!0),await X.loadAll()}function Ct(){return Q||(Q=(async()=>{if(typeof indexedDB>`u`){await $(`IndexedDB unavailable`);return}try{let e=new nt,t=await F(xe),n;if(t!==`1`){let t=await yt(e);if(!t.ok){console.error(`[Storage] localStorage migration failed; will retry on next launch`),await $(`Migration incomplete`);return}await I(xe,`1`),n=t.keys}await e.preload(),await _t(e),await vt(e),await F(T)!==`1`&&(ht(n),await I(T,`1`)),W.setEngine(e),await X.loadAll()}catch(e){console.error(`[Storage] IndexedDB init failed:`,e),await $(`IndexedDB init error`)}})(),Q)}export{_ as A,f as B,g as C,fe as D,h as E,ne as F,u as H,ee as I,te as L,de as M,le as N,ge as O,ue as P,ie as R,he as S,v as T,c as U,d as V,l as W,L as _,X as a,Me as b,tt as c,Ze as d,B as f,R as g,Je as h,xt as i,pe as j,_e as k,$e as l,Ye as m,bt as n,lt as o,Xe as p,St as r,W as s,Ct as t,Qe as u,Ne as v,ye as w,y as x,je as y,re as z};