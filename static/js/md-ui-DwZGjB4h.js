const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["static/js/md-formatDoc-hjNG5tR3.js","static/js/md-rolldown-runtime-hePW80VL.js","static/js/md-preload-helper-DHWoSnHi.js","static/js/md-dist-B9WZX74v.js","static/js/md-codemirror-D8Gjrnmw.js","static/js/md-dist-CW8e0PpQ.js","static/js/md-dist-DF9xM4bz.js","static/js/md-dist-BQBBQBWe.js","static/js/md-dist-CgClwWsE.js","static/js/md-dist-CsgFn8Zh.js","static/js/md-dist-BQG0K42-.js","static/js/md-dist-DlfVGKL-.js","static/js/md-dist-BvtFVr52.js","static/js/md-dist-ByhDqV-0.js","static/js/md-browser-C7tAaLTR.js","static/js/md-marketplace-Ct9mghSS.js","static/js/md-storage-DQW218oG.js","static/js/md-translate-BLRvHnvh.js","static/js/md-vue-i18n-DBf1A5UV.js","static/js/md-vendor_vue-DZd6QO7g.js","static/js/md-v4-DDdyfk2q.js","static/js/md-lib-g1zfqMwP.js","static/js/md-oauth-CmSaATTF.js","static/js/md-auth-DNtb5UXF.js","static/js/md-extensions-CeJv-wNz.js","static/js/md-highlight-Di-PN6AM.js","static/js/md-purify.es-CYRiAeUx.js","static/js/md-renderer-BSPtb1zW.js","static/js/md-decode-nKwzHfeR.js","static/js/md-client-opt-AQ5m.js","static/js/md-postcss-_CUsAFxq.js","static/js/md-__vite-browser-external-Gk1ta6_d.js"])))=>i.map(i=>d[i]);
import{f as e,p as t,u as n}from"./md-storage-DQW218oG.js";import{T as r,n as i,r as a,v as o,y as s}from"./md-translate-BLRvHnvh.js";import{F as c,I as l,L as u,R as d,Z as f,dt as p,lt as m,n as h,st as g,v as _}from"./md-vendor_vue-DZd6QO7g.js";import{t as v}from"./md-preload-helper-DHWoSnHi.js";import{n as y}from"./md-lib-g1zfqMwP.js";import{B as b,C as x,D as ee,E as te,F as S,G as ne,J as re,L as ie,O as ae,S as oe,T as se,U as C,Y as w,_ as T,a as E,at as ce,b as le,ct as ue,dt as de,ft as fe,g as D,gt as pe,ht as me,i as he,it as ge,j as _e,k as ve,lt as ye,mt as be,n as xe,ot as Se,pt as Ce,rt as O,st as we,t as Te,u as Ee,ut as k,v as De,w as Oe,x as A,y as ke}from"./md-codemirror-D8Gjrnmw.js";import{D as j,a as Ae}from"./md-vendor_vueuse-D0vzwXTw.js";import{A as je,C as Me,M as Ne,S as Pe,_ as Fe,c as Ie,d as Le,f as Re,j as ze}from"./md-extensions-CeJv-wNz.js";function Be(e){let t=new Map;for(let n of e.matchAll(/--([\w-]+)\s*:\s*([^;}\n]+)/g))t.set(`--${n[1]}`,n[2].trim());return t}function Ve(e){let t=Be(e),n=/var\(\s*(--[\w-]+)\s*(?:,([^()]*(?:\([^()]*\)[^()]*)*))?\)/g,r=e,i=``,a=0;for(;r!==i&&a<10;)i=r,r=r.replace(n,(e,n,r)=>{let i=t.get(n);return i===void 0?r?r.trim():`var(${n})`:i}),a++;let o=/calc\(([^()]+)\)/g;for(i=``,a=0;r!==i&&a<10;)i=r,r=r.replace(o,(e,t)=>We(t.trim())),a++;return r}var He=`px|em|rem|vw|vh|vmin|vmax|%|pt|pc|cm|mm|in|ex|ch`,Ue=`(-?[\\d.]+)`,M=`(-?[\\d.]+)(${He})?`;function We(e){let t=e.match(RegExp(`^${M}\\s*\\*\\s*${M}$`));if(t){let[,e,n,r,i]=t;if(!n!=!i){let t=n||i;return`${Ge(Number.parseFloat(e)*Number.parseFloat(r))}${t}`}}let n=e.match(RegExp(`^${M}\\s*/\\s*${Ue}$`));if(n){let[,e,t,,r]=n;return`${Ge(Number.parseFloat(e)/Number.parseFloat(r))}${t??``}`}let r=e.match(RegExp(`^${M}\\s*([+-])\\s*${M}$`));if(r){let[,e,t,n,i,a]=r;if(t===a)return`${Ge(n===`+`?Number.parseFloat(e)+Number.parseFloat(i):Number.parseFloat(e)-Number.parseFloat(i))}${t??``}`}return`calc(${e})`}function Ge(e){return Math.round(e*1e4)/1e4}var N={blockquote_note:`markdown-alert-note`,blockquote_tip:`markdown-alert-tip`,blockquote_info:`markdown-alert-info`,blockquote_important:`markdown-alert-important`,blockquote_warning:`markdown-alert-warning`,blockquote_caution:`markdown-alert-caution`,blockquote_abstract:`markdown-alert-abstract`,blockquote_summary:`markdown-alert-summary`,blockquote_tldr:`markdown-alert-tldr`,blockquote_todo:`markdown-alert-todo`,blockquote_success:`markdown-alert-success`,blockquote_done:`markdown-alert-done`,blockquote_question:`markdown-alert-question`,blockquote_help:`markdown-alert-help`,blockquote_faq:`markdown-alert-faq`,blockquote_failure:`markdown-alert-failure`,blockquote_fail:`markdown-alert-fail`,blockquote_missing:`markdown-alert-missing`,blockquote_danger:`markdown-alert-danger`,blockquote_error:`markdown-alert-error`,blockquote_bug:`markdown-alert-bug`,blockquote_example:`markdown-alert-example`,blockquote_quote:`markdown-alert-quote`,blockquote_cite:`markdown-alert-cite`,blockquote_title:`alert-title`,blockquote_title_note:`alert-title-note`,blockquote_title_tip:`alert-title-tip`,blockquote_title_info:`alert-title-info`,blockquote_title_important:`alert-title-important`,blockquote_title_warning:`alert-title-warning`,blockquote_title_caution:`alert-title-caution`,blockquote_title_abstract:`alert-title-abstract`,blockquote_title_summary:`alert-title-summary`,blockquote_title_tldr:`alert-title-tldr`,blockquote_title_todo:`alert-title-todo`,blockquote_title_success:`alert-title-success`,blockquote_title_done:`alert-title-done`,blockquote_title_question:`alert-title-question`,blockquote_title_help:`alert-title-help`,blockquote_title_faq:`alert-title-faq`,blockquote_title_failure:`alert-title-failure`,blockquote_title_fail:`alert-title-fail`,blockquote_title_missing:`alert-title-missing`,blockquote_title_danger:`alert-title-danger`,blockquote_title_error:`alert-title-error`,blockquote_title_bug:`alert-title-bug`,blockquote_title_example:`alert-title-example`,blockquote_title_quote:`alert-title-quote`,blockquote_title_cite:`alert-title-cite`,blockquote_p:`alert-content`,blockquote_p_note:`alert-content-note`,blockquote_p_tip:`alert-content-tip`,blockquote_p_info:`alert-content-info`,blockquote_p_important:`alert-content-important`,blockquote_p_warning:`alert-content-warning`,blockquote_p_caution:`alert-content-caution`,blockquote_p_abstract:`alert-content-abstract`,blockquote_p_summary:`alert-content-summary`,blockquote_p_tldr:`alert-content-tldr`,blockquote_p_todo:`alert-content-todo`,blockquote_p_success:`alert-content-success`,blockquote_p_done:`alert-content-done`,blockquote_p_question:`alert-content-question`,blockquote_p_help:`alert-content-help`,blockquote_p_faq:`alert-content-faq`,blockquote_p_failure:`alert-content-failure`,blockquote_p_fail:`alert-content-fail`,blockquote_p_missing:`alert-content-missing`,blockquote_p_danger:`alert-content-danger`,blockquote_p_error:`alert-content-error`,blockquote_p_bug:`alert-content-bug`,blockquote_p_example:`alert-content-example`,blockquote_p_quote:`alert-content-quote`,blockquote_p_cite:`alert-content-cite`,code_pre:`code-block`,codespan:`code-inline`,inline_katex:`katex-inline`,block_katex:`katex-block`,markup_highlight:`markup-highlight`,markup_underline:`markup-underline`,markup_wavyline:`markup-wavyline`,listitem:`listitem`};function P(e,t=`#output`){return e.replace(/([^{}]+)\{([^}]*)\}/g,(e,n,r)=>{let i=n.trim();return i.startsWith(`@`)||i.startsWith(`:root`)?e:`${n.split(`,`).map(e=>{let n=e.trim();if(n.startsWith(t)||!n)return n;n=n.replace(/\.md-container\b/g,`.container`);let r=n.split(/[\s>+~:[]/,1)[0].trim();return r&&N[r]&&(n=n.replace(r,`.${N[r]}`)),n.match(/^(h[1-6])(\s|$|::|[:[])/)?`${t} section ${n}`:`${t} ${n}`}).filter(Boolean).join(`,
`)} {${r}}`})}function Ke(e){return`
:root {
  /* Theme config */
  --md-primary-color: ${e.primaryColor};
  --md-font-family: ${e.fontFamily};
  --md-font-size: ${e.fontSize};
}

/* Paragraph indent & justify */
#output p {
  ${e.isUseIndent?`text-indent: 2em;`:``}
  ${e.isUseJustify?`text-align: justify;`:``}
}
  `.trim()}function qe(e){return F(e.headingStyles)}function F(e){if(!e)return``;let t=[`h1`,`h2`,`h3`,`h4`,`h5`,`h6`],n=[];for(let r of t){let t=e[r];t&&t!=="default"&&t!==`custom`&&n.push(Je(r,t))}return n.join(`

`)}function Je(e,t){let n=`
  display: block;
  text-align: left;
  background: transparent;`;switch(t){case`color-only`:return`#output ${e} {
  color: var(--md-primary-color);
  background: transparent;
}`;case`border-bottom`:return`#output ${e} {${n}
  padding-bottom: 0.3em;
  border-bottom: 2px solid var(--md-primary-color);
  color: var(--md-primary-color);
}`;case`border-left`:return`#output ${e} {${n}
  margin-left: 0;
  padding-left: 10px;
  border-left: 4px solid var(--md-primary-color);
  color: var(--md-primary-color);
}`;default:return``}}var Ye=`/**
 * MD base theme styles
 * Base element styles and CSS variable definitions
 */

/* ==================== Container ==================== */
section,
#output .container {
  font-family: var(--md-font-family);
  font-size: var(--md-font-size);
  line-height: 1.75;
  text-align: left;
}

#output {
  font-family: var(--md-font-family);
  font-size: var(--md-font-size);
  line-height: 1.75;
  text-align: left;
}

#output section > :first-child {
  margin-top: 0 !important;
}

/*
 * Reset for exported HTML / share pages / VSCode preview (no Tailwind preflight).
 * Browser defaults leak in (e.g. blockquote 40px side margins, table border-collapse: separate).
 * Reset horizontal (and top) margins so export matches in-app preview.
 * Vertical spacing comes from theme blockquote { margin-bottom }; do not zero all margins here.
 * section selector covers VSCode preview (no #output; content in section.container).
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
`,Xe=`/**
 * MD default theme (classic).
 * Format with Alt/Option + Shift + F.
 * Use var(--md-primary-color) for theme color instead of hard-coded values.
 */

/* ==================== H1 ==================== */
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

/* ==================== H2 ==================== */
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

/* ==================== H3 ==================== */
h3 {
  padding-left: 8px;
  border-left: 3px solid var(--md-primary-color);
  margin: 2em 8px 0.75em 0;
  color: hsl(var(--foreground));
  font-size: calc(var(--md-font-size) * 1.1);
  font-weight: bold;
  line-height: 1.2;
}

/* ==================== H4 ==================== */
h4 {
  margin: 2em 8px 0.5em;
  color: var(--md-primary-color);
  font-size: calc(var(--md-font-size) * 1);
  font-weight: bold;
}

/* ==================== H5 ==================== */
h5 {
  margin: 1.5em 8px 0.5em;
  color: var(--md-primary-color);
  font-size: calc(var(--md-font-size) * 1);
  font-weight: bold;
}

/* ==================== H6 ==================== */
h6 {
  margin: 1.5em 8px 0.5em;
  font-size: calc(var(--md-font-size) * 1);
  color: var(--md-primary-color);
}

/* ==================== Paragraph ==================== */
p {
  margin: 1.5em 8px;
  letter-spacing: 0.1em;
  color: hsl(var(--foreground));
}

/* ==================== Blockquote ==================== */
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

/* ==================== GFM alerts ==================== */
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

/* GFM alert SVG icon colors */
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

/* ==================== Academic environments (theorem, lemma, definition, …) ==================== */
/* Title colors */
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

/* Icon colors */
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

/* Full border on academic boxes (theorem-style appearance) */
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

/* Fallback for custom/unknown names: no icon, theme primary color */
.alert-title-custom {
  color: var(--md-primary-color);
}

.markdown-alert-custom {
  border-left: 4px solid var(--md-primary-color);
}

/* Italic body text in academic environments (math convention) */
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

/* ==================== Code blocks ==================== */
pre.code__pre,
.hljs.code__pre {
  font-size: 90%;
  overflow-x: auto;
  border-radius: 8px;
  padding: 0 !important;
  line-height: 1.5;
  margin: 10px 8px;
}

/* ==================== Images ==================== */
img {
  display: block;
  max-width: 100%;
  margin: 0.1em auto 0.5em;
  border-radius: 4px;
}

/* ==================== Lists ==================== */
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

/* Footnotes */
/* footnotes rendered as <p> in buildFootnotes() */
p.footnotes {
  margin: 0.5em 8px;
  font-size: 80%;
  color: hsl(var(--foreground));
}

/* Diagrams */
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

/* ==================== Horizontal rules ==================== */
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

/* Inline code */
.codespan {
  font-size: 90%;
  color: var(--md-primary-color);
  background: color-mix(in srgb, var(--md-primary-color) 8%, transparent);
  padding: 3px 5px;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--md-primary-color) 20%, transparent);
}

/* code inside pre (override inline code) */
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

/* Emphasis */
em {
  font-style: italic;
  font-size: inherit;
}

/* ==================== Links ==================== */
a {
  color: #576b95;
  text-decoration: none;
}

/* ==================== Bold ==================== */
strong {
  color: var(--md-primary-color);
  font-weight: bold;
  font-size: inherit;
}

/* ==================== Tables ==================== */
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

/* ==================== KaTeX ==================== */
.katex-inline {
  max-width: 100%;
  overflow-x: auto;
  cursor: pointer;
}

.katex-block {
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  cursor: pointer;
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

/* ==================== Markup highlight ==================== */
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
`,Ze=`/**
 * MD grace theme (@brzhang) — refinements on default
 */

/* Headings */
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

/* Blockquote */
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

/* Inline code */
.codespan {
  font-family: 'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Code blocks */
pre.code__pre,
.hljs.code__pre {
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

pre.code__pre > code,
.hljs.code__pre > code {
  font-family: 'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace;
}

/* Images */
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

/* Lists */
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

/* Horizontal rules */
hr {
  height: 1px;
  border: none;
  margin: 2em 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));
}

/* Tables */
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

/* Emphasis */
em {
  font-style: italic;
  font-size: inherit;
}

/* Links */
a {
  color: #576b95;
  text-decoration: none;
}
`,I=`/**
 * MD simple theme (@okooo5km) — minimal modern layout
 */

/* Headings */
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

/* Blockquote */
blockquote {
  font-style: italic;
  padding: 1em 1em 1em 2em;
  color: rgba(0, 0, 0, 0.6);
  border-bottom: 0.2px solid rgba(0, 0, 0, 0.04);
  border-top: 0.2px solid rgba(0, 0, 0, 0.04);
  border-right: 0.2px solid rgba(0, 0, 0, 0.04);
}

/* GFM alert overrides */
.markdown-alert-note,
.markdown-alert-tip,
.markdown-alert-info,
.markdown-alert-important,
.markdown-alert-warning,
.markdown-alert-caution {
  font-style: italic;
}

/* Inline code */
.codespan {
  font-family: 'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--md-primary-color) 15%, transparent);
}

/* Code blocks */
pre.code__pre,
.hljs.code__pre {
  border: 1px solid rgba(0, 0, 0, 0.04);
}

pre.code__pre > code,
.hljs.code__pre > code {
  font-family: 'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace;
}

/* Images */
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

/* Lists */
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

/* Horizontal rules */
hr {
  height: 1px;
  border: none;
  margin: 2em 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));
}

/* Emphasis */
em {
  font-style: italic;
  font-size: inherit;
}

/* Links */
a {
  color: #576b95;
  text-decoration: none;
}
`,L=Ye,R={default:Xe,grace:Ze,simple:I};function Qe(e){return Object.keys(R).includes(e)}var $e=class{styleElement=null;styleId=`md-theme`;inject(e){this.styleElement||(this.styleElement=document.createElement(`style`),this.styleElement.id=this.styleId,document.head.appendChild(this.styleElement)),this.styleElement.textContent=e}remove(){this.styleElement&&=(this.styleElement.remove(),null)}isInjected(){return this.styleElement!==null}},et=null;function tt(){return et||=new $e,et}function nt(e,t){if(t!=null&&t.trim())return`${R.default}\n\n${t}`;let n=R.default;if(e!=="default"&&Qe(e)){let t=R[e];t&&(n=`${n}\n\n${t}`)}return n}async function rt(e){let t=[Ke(e.variables),L,P(nt(e.themeName,e.themeCSS),`#output`),qe(e.variables),e.customCSS?P(e.customCSS,`#output`):``].filter(Boolean).join(`

`);t=Ve(t),tt().inject(t)}function z(e){let t=/[\\/:*?"<>|]/g;if(!t.test(e)&&e.length<=100)return e.trim()||`untitled`;let n=e.replace(t,`_`).trim();return(n.length>100?n.slice(0,100):n)||`untitled`}function it(e){let t=e.split(`
`),n=t.filter(e=>e.trim()).map(e=>e.match(/(^\s+)?/)[0].length).sort((e,t)=>e-t)[0];return t.map(e=>e.slice(n)).join(`
`)}function B(e,t,n=`text/plain`){if(typeof document>`u`)throw TypeError(`downloadFile can only be used in browser environment`);let r=document.createElement(`a`);r.download=t,r.style.display=`none`;let i=null;if(e.startsWith(`data:`)||e.startsWith(`blob:`))r.href=e;else if(n===`text/html`)r.href=`data:text/html;charset=utf-8,${encodeURIComponent(e)}`;else{let t=new Blob([e],{type:n});i=URL.createObjectURL(t),r.href=i}document.body.appendChild(r),r.click(),document.body.removeChild(r),i&&URL.revokeObjectURL(i)}function at(e){return new Promise((t,n)=>{let r=new FileReader;r.readAsDataURL(e),r.onload=()=>t(r.result.split(`,`).pop()),r.onerror=e=>n(e)})}function ot(e){return new Promise(t=>window.setTimeout(t,e))}var st=2e4,ct=250,lt=`.mermaid-diagram, .plantuml-diagram, .infographic-diagram`;function ut(e){return e?.themeMode?{themeMode:e.themeMode}:void 0}function dt(e){for(let t of e.querySelectorAll(lt))if(Ne(t))return!0;return!1}function ft(e){if(e.querySelector(`.katex-fallback`))return!0;for(let t of e.querySelectorAll(`.katex-block, .katex-inline`))if(!t.querySelector(`svg, mjx-container`))return!0;return!1}async function V(e=st,t){await c(),await c();let n=document.getElementById(`output`);if(!n)return!1;let r=ut(t),i=Date.now()+e;for(;Date.now()<i;){if(Ie(n,r),!dt(n)&&!ft(n))return!0;await ot(ct)}return Ie(n,r),!dt(n)&&!ft(n)}function pt(e){e.querySelectorAll(lt).forEach(e=>{e.querySelector(`svg, img`)||e.getAttribute(ze)===je.loading&&e.remove()}),e.querySelectorAll(`.katex-pending`).forEach(e=>{e.querySelector(`svg, mjx-container`)||e.remove()})}var mt=h(`editor`,()=>{let e=p(null),t=null;function n(e){t=e}function r(){t=null}function i(){t?.()}return{editor:e,registerContentFlush:n,unregisterContentFlush:r,flushContentToPostStore:i,formatContent:async()=>{if(!e.value)return;let{formatDoc:t}=await v(async()=>{let{formatDoc:e}=await import(`./md-formatDoc-hjNG5tR3.js`);return{formatDoc:e}},__vite__mapDeps([0,1,2])),n=await t(e.value.state.doc.toString());return e.value.dispatch({changes:{from:0,to:e.value.state.doc.length,insert:n}}),n},importContent:t=>{e.value&&e.value.dispatch({changes:{from:0,to:e.value.state.doc.length,insert:t}})},clearContent:()=>{e.value&&(e.value.dispatch({changes:{from:0,to:e.value.state.doc.length,insert:``}}),y.success(a(`store.editor.contentCleared`)))},getContent:()=>e.value?.state.doc.toString()??``,getSelection:()=>{if(!e.value)return``;let t=e.value.state.selection.main;return e.value.state.doc.sliceString(t.from,t.to)},replaceSelection:t=>{e.value&&e.value.dispatch(e.value.state.replaceSelection(t))},replaceText:(t,n)=>{if(!e.value||!t)return!1;let r=e.value.state.doc.toString(),i=e.value.state.selection.main.head,a=-1,o=1/0,s=0;for(;;){let e=r.indexOf(t,s);if(e===-1)break;let n=Math.abs(e-i);n<o&&(o=n,a=e),s=e+1}return a!==-1&&(e.value.dispatch({changes:{from:a,to:a+t.length,insert:n}}),e.value.focus(),!0)},insertAtCursor:t=>{if(!e.value)return;let n=e.value.state.selection.main;e.value.dispatch({changes:{from:n.from,to:n.to,insert:t},selection:{anchor:n.from+t.length}}),e.value.focus()}}});function ht(e){let t={};for(let n of e.matchAll(/(\w[\w-]*)=(?:"([^"]*)"|'([^']*)')/g))t[n[1]]=n[2]===void 0?n[3]??``:n[2];return t}function gt(e){let t=new Set;for(let n of e.matchAll(/(\w[\w-]*)=(?:"[^"]*"|'[^']*')/g))t.add(n[1]);let n=e.match(/(?:^|\s)([A-Z_][\w-]*)\s*=\s*(?:"[^"]*|'[^']*)?$/i);return n&&t.add(n[1]),t}function _t(e){return e.default!==void 0&&e.default!==``?e.default:e.type===`array`?`[]`:e.type===`boolean`?`true`:e.type===`number`?`0`:e.name}function vt(e,t){return t.includes(`"`)&&!t.includes(`'`)?`${e}='${t}'`:t.includes(`"`)&&t.includes(`'`)?`${e}="${t.replace(/"/g,`'`)}"`:`${e}="${t}"`}function yt(e){let t={};for(let n of e.props)n.required&&(n.default===void 0||n.default===``)?t[n.name]=``:t[n.name]=_t(n);if(e.example){let n=ht(e.example);Object.assign(t,n)}return t}function bt(e,t){return e.props.filter(e=>e.required&&!(t[e.name]??``).trim()).map(e=>e.name)}function xt(e,t){if(t){let n=[];for(let r of e.props){let e=t[r.name],i=e===void 0?``:e;i===``&&!r.required||n.push(vt(r.name,i===``?_t(r):i))}return`<${e.name}${n.length?` ${n.join(` `)}`:``} />`}if(e.example)return e.example;let n=e.props.map(e=>vt(e.name,_t(e))).join(` `);return`<${e.name}${n?` ${n}`:``} />`}var St=h(`customComponent`,()=>{let r=n.reactive(e(`custom_components`),[]),i=_(()=>Le),o=_(()=>{let e=new Map(Le.map(e=>[e.name,e]));for(let t of r.value)e.set(t.name,t);return[...e.values()]}),s=_(()=>{let e=Re();for(let t of r.value)e[t.name]=t;return e});function c(e){let n=Date.now(),i={id:t(),name:e.name,description:e.description,template:e.template,props:e.props,createdAt:n,updatedAt:n};return r.value.push(i),y.success(a(`store.component.created`,{name:e.name})),i}function l(e,t){let n=r.value.findIndex(t=>t.id===e);return n===-1?(y.error(a(`store.component.notFound`)),!1):(r.value[n]={...r.value[n],...t,updatedAt:Date.now()},y.success(a(`store.component.updated`)),!0)}function u(e){let t=r.value.findIndex(t=>t.id===e);if(t===-1)return y.error(a(`store.component.notFound`)),!1;let n=r.value[t].name;return r.value.splice(t,1),y.success(a(`store.component.deleted`,{name:n})),!0}function d(e){return r.value.find(t=>t.id===e)}function f(e,t){return xt(e,t)}return{userComponents:r,builtInComponents:i,allComponents:o,registry:s,createComponent:c,updateComponent:l,deleteComponent:u,getComponentById:d,buildSnippet:f}});function Ct(e){return`mp:${e}`}function wt(e){return e.startsWith(`mp:`)&&e.length>3}var Tt={"zh-CN":`/* 全局变量 */
:root {
}

/* 根容器 */
.container {
}

/* 标题 */
h1 {
}

h2 {
}

h3 {
}

h4 {
}

h5 {
}

h6 {
}

/* 段落和文本 */
p {
}

strong {
}

em {
}

/* 引用块 */
blockquote {
}

blockquote > p {
}

/* 代码 */
/* 行内代码 */
.codespan {
}

/* 代码块容器 */
pre.code__pre,
.hljs.code__pre {
}

/* 代码块内的 code */
pre.code__pre > code,
.hljs.code__pre > code {
}

/* 列表 */
ol {
}

ul {
}

li {
}

/* 表格 */
table {
}

thead {
}

th {
}

td {
}

/* 其他元素 */
img {
}

hr {
}

/* 分隔线变体：--- */
hr.hr-dash {
}

/* 分隔线变体：*** */
hr.hr-star {
}

/* 分隔线变体：___ */
hr.hr-underscore {
}

figure {
}

figcaption {
}

/* KaTeX 公式 */
.katex-inline {
}

.katex-block {
}

/* Markup 标记 */
/* 高亮 ==文本== */
.markup-highlight {
}

/* 下划线 ++文本++ */
.markup-underline {
}

/* 波浪线 ~文本~ */
.markup-wavyline {
}

/* GFM Alert 警告块 */
/* Alert 标题 */
.alert-title-note {
}

.alert-title-tip {
}

.alert-title-info {
}

.alert-title-important {
}

.alert-title-warning {
}

.alert-title-caution {
}

.alert-title-abstract {
}

.alert-title-summary {
}

.alert-title-tldr {
}

.alert-title-todo {
}

.alert-title-success {
}

.alert-title-done {
}

.alert-title-question {
}

.alert-title-help {
}

.alert-title-faq {
}

.alert-title-failure {
}

.alert-title-fail {
}

.alert-title-missing {
}

.alert-title-danger {
}

.alert-title-error {
}

.alert-title-bug {
}

.alert-title-example {
}

.alert-title-quote {
}

.alert-title-cite {
}

/* Alert SVG 图标 */
.alert-icon-note {
}

.alert-icon-tip {
}

.alert-icon-info {
}

.alert-icon-important {
}

.alert-icon-warning {
}

.alert-icon-caution {
}

/* Obsidian-style Callout SVG 图标 */
.alert-icon-abstract {
}

.alert-icon-summary {
}

.alert-icon-tldr {
}

.alert-icon-todo {
}

.alert-icon-success {
}

.alert-icon-done {
}

.alert-icon-question {
}

.alert-icon-help {
}

.alert-icon-faq {
}

.alert-icon-failure {
}

.alert-icon-fail {
}

.alert-icon-missing {
}

.alert-icon-danger {
}

.alert-icon-error {
}

.alert-icon-bug {
}

.alert-icon-example {
}

.alert-icon-quote {
}

.alert-icon-cite {
}
`,"zh-TW":`/* 全域變數 */
:root {
}

/* 根容器 */
.container {
}

/* 標題 */
h1 {
}

h2 {
}

h3 {
}

h4 {
}

h5 {
}

h6 {
}

/* 段落和文字 */
p {
}

strong {
}

em {
}

/* 引用塊 */
blockquote {
}

blockquote > p {
}

/* 程式碼 */
/* 行內程式碼 */
.codespan {
}

/* 程式碼塊容器 */
pre.code__pre,
.hljs.code__pre {
}

/* 程式碼塊內的 code */
pre.code__pre > code,
.hljs.code__pre > code {
}

/* 清單 */
ol {
}

ul {
}

li {
}

/* 表格 */
table {
}

thead {
}

th {
}

td {
}

/* 其他元素 */
img {
}

hr {
}

/* 分隔線變體：--- */
hr.hr-dash {
}

/* 分隔線變體：*** */
hr.hr-star {
}

/* 分隔線變體：___ */
hr.hr-underscore {
}

figure {
}

figcaption {
}

/* KaTeX 公式 */
.katex-inline {
}

.katex-block {
}

/* Markup 標記 */
/* 高亮 ==文字== */
.markup-highlight {
}

/* 底線 ++文字++ */
.markup-underline {
}

/* 波浪線 ~文字~ */
.markup-wavyline {
}

/* GFM Alert 警告塊 */
/* Alert 標題 */
.alert-title-note {
}

.alert-title-tip {
}

.alert-title-info {
}

.alert-title-important {
}

.alert-title-warning {
}

.alert-title-caution {
}

.alert-title-abstract {
}

.alert-title-summary {
}

.alert-title-tldr {
}

.alert-title-todo {
}

.alert-title-success {
}

.alert-title-done {
}

.alert-title-question {
}

.alert-title-help {
}

.alert-title-faq {
}

.alert-title-failure {
}

.alert-title-fail {
}

.alert-title-missing {
}

.alert-title-danger {
}

.alert-title-error {
}

.alert-title-bug {
}

.alert-title-example {
}

.alert-title-quote {
}

.alert-title-cite {
}

/* Alert SVG 圖示 */
.alert-icon-note {
}

.alert-icon-tip {
}

.alert-icon-info {
}

.alert-icon-important {
}

.alert-icon-warning {
}

.alert-icon-caution {
}

/* Obsidian-style Callout SVG 圖示 */
.alert-icon-abstract {
}

.alert-icon-summary {
}

.alert-icon-tldr {
}

.alert-icon-todo {
}

.alert-icon-success {
}

.alert-icon-done {
}

.alert-icon-question {
}

.alert-icon-help {
}

.alert-icon-faq {
}

.alert-icon-failure {
}

.alert-icon-fail {
}

.alert-icon-missing {
}

.alert-icon-danger {
}

.alert-icon-error {
}

.alert-icon-bug {
}

.alert-icon-example {
}

.alert-icon-quote {
}

.alert-icon-cite {
}
`,"en-US":`/* Global variables */
:root {
}

/* Root container */
.container {
}

/* Headings */
h1 {
}

h2 {
}

h3 {
}

h4 {
}

h5 {
}

h6 {
}

/* Paragraphs and text */
p {
}

strong {
}

em {
}

/* Blockquote */
blockquote {
}

blockquote > p {
}

/* Code */
/* Inline code */
.codespan {
}

/* Code block container */
pre.code__pre,
.hljs.code__pre {
}

/* Code inside code block */
pre.code__pre > code,
.hljs.code__pre > code {
}

/* Lists */
ol {
}

ul {
}

li {
}

/* Tables */
table {
}

thead {
}

th {
}

td {
}

/* Other elements */
img {
}

hr {
}

/* Horizontal rule variant: --- */
hr.hr-dash {
}

/* Horizontal rule variant: *** */
hr.hr-star {
}

/* Horizontal rule variant: ___ */
hr.hr-underscore {
}

figure {
}

figcaption {
}

/* KaTeX */
.katex-inline {
}

.katex-block {
}

/* Markup */
/* Highlight ==text== */
.markup-highlight {
}

/* Underline ++text++ */
.markup-underline {
}

/* Wavy underline ~text~ */
.markup-wavyline {
}

/* GFM Alert */
/* Alert titles */
.alert-title-note {
}

.alert-title-tip {
}

.alert-title-info {
}

.alert-title-important {
}

.alert-title-warning {
}

.alert-title-caution {
}

.alert-title-abstract {
}

.alert-title-summary {
}

.alert-title-tldr {
}

.alert-title-todo {
}

.alert-title-success {
}

.alert-title-done {
}

.alert-title-question {
}

.alert-title-help {
}

.alert-title-faq {
}

.alert-title-failure {
}

.alert-title-fail {
}

.alert-title-missing {
}

.alert-title-danger {
}

.alert-title-error {
}

.alert-title-bug {
}

.alert-title-example {
}

.alert-title-quote {
}

.alert-title-cite {
}

/* Alert SVG icons */
.alert-icon-note {
}

.alert-icon-tip {
}

.alert-icon-info {
}

.alert-icon-important {
}

.alert-icon-warning {
}

.alert-icon-caution {
}

/* Obsidian-style Callout SVG icons */
.alert-icon-abstract {
}

.alert-icon-summary {
}

.alert-icon-tldr {
}

.alert-icon-todo {
}

.alert-icon-success {
}

.alert-icon-done {
}

.alert-icon-question {
}

.alert-icon-help {
}

.alert-icon-faq {
}

.alert-icon-failure {
}

.alert-icon-fail {
}

.alert-icon-missing {
}

.alert-icon-danger {
}

.alert-icon-error {
}

.alert-icon-bug {
}

.alert-icon-example {
}

.alert-icon-quote {
}

.alert-icon-cite {
}
`,"ja-JP":`/* グローバル変数 */
:root {
}

/* ルートコンテナ */
.container {
}

/* 見出し */
h1 {
}

h2 {
}

h3 {
}

h4 {
}

h5 {
}

h6 {
}

/* 段落とテキスト */
p {
}

strong {
}

em {
}

/* 引用 */
blockquote {
}

blockquote > p {
}

/* コード */
/* インラインコード */
.codespan {
}

/* コードブロックコンテナ */
pre.code__pre,
.hljs.code__pre {
}

/* コードブロック内の code */
pre.code__pre > code,
.hljs.code__pre > code {
}

/* リスト */
ol {
}

ul {
}

li {
}

/* テーブル */
table {
}

thead {
}

th {
}

td {
}

/* その他の要素 */
img {
}

hr {
}

/* 区切り線バリアント：--- */
hr.hr-dash {
}

/* 区切り線バリアント：*** */
hr.hr-star {
}

/* 区切り線バリアント：___ */
hr.hr-underscore {
}

figure {
}

figcaption {
}

/* KaTeX 数式 */
.katex-inline {
}

.katex-block {
}

/* Markup */
/* ハイライト ==text== */
.markup-highlight {
}

/* 下線 ++text++ */
.markup-underline {
}

/* 波線 ~text~ */
.markup-wavyline {
}

/* GFM Alert */
/* Alert タイトル */
.alert-title-note {
}

.alert-title-tip {
}

.alert-title-info {
}

.alert-title-important {
}

.alert-title-warning {
}

.alert-title-caution {
}

.alert-title-abstract {
}

.alert-title-summary {
}

.alert-title-tldr {
}

.alert-title-todo {
}

.alert-title-success {
}

.alert-title-done {
}

.alert-title-question {
}

.alert-title-help {
}

.alert-title-faq {
}

.alert-title-failure {
}

.alert-title-fail {
}

.alert-title-missing {
}

.alert-title-danger {
}

.alert-title-error {
}

.alert-title-bug {
}

.alert-title-example {
}

.alert-title-quote {
}

.alert-title-cite {
}

/* Alert SVG アイコン */
.alert-icon-note {
}

.alert-icon-tip {
}

.alert-icon-info {
}

.alert-icon-important {
}

.alert-icon-warning {
}

.alert-icon-caution {
}

/* Obsidian-style Callout SVG アイコン */
.alert-icon-abstract {
}

.alert-icon-summary {
}

.alert-icon-tldr {
}

.alert-icon-todo {
}

.alert-icon-success {
}

.alert-icon-done {
}

.alert-icon-question {
}

.alert-icon-help {
}

.alert-icon-faq {
}

.alert-icon-failure {
}

.alert-icon-fail {
}

.alert-icon-missing {
}

.alert-icon-danger {
}

.alert-icon-error {
}

.alert-icon-bug {
}

.alert-icon-example {
}

.alert-icon-quote {
}

.alert-icon-cite {
}
`};function Et(e=`zh-CN`){return Tt[e]??Tt[`zh-CN`]}var Dt=[ue(),ye(),A(),C(),ce(),Se(),me.allowMultipleSelections.of(!0),re(),w(b,{fallback:!0}),ie(),ae(),ee(),fe(),ge(),we(),T(),D(),k.of([...ve,...le,...De,...oe,...ne,..._e,...ke,{key:`Tab`,run:te},x])];function H(e,{prefix:t,suffix:n,check:r,afterInsertCursorOffset:i=0}){let a=e.state.selection.main,o=e.state.doc.sliceString(a.from,a.to),s=r?.(o)??!1,c;if(s)c=o.slice(t.length,o.length-n.length),e.dispatch(e.state.replaceSelection(c));else if(c=`${t}${o}${n}`,e.dispatch(e.state.replaceSelection(c)),i!==0){let t=e.state.selection.main.head+i;e.dispatch({selection:{anchor:t}})}}function U(e,t){let n=e.state.selection.ranges,r=[],i=`${`#`.repeat(t)} `;if(n.forEach(t=>{let n=e.state.doc.lineAt(t.from),a=e.state.doc.lineAt(t.to);for(let t=n.number;t<=a.number;t++){let n=e.state.doc.line(t),a=e.state.doc.sliceString(n.from,n.to).replace(/^#{1,6}\s+/,``).trimStart(),o=i+a;r.push({from:n.from,to:n.to,insert:o})}}),r.length>0){let t=e.state.doc.lineAt(n[0].from).from+i.length;e.dispatch({changes:r,selection:{anchor:t}})}}function Ot(e){H(e,{prefix:`**`,suffix:`**`,check:e=>e.startsWith(`**`)&&e.endsWith(`**`),afterInsertCursorOffset:-2})}function kt(e){H(e,{prefix:`*`,suffix:`*`,check:e=>e.startsWith(`*`)&&e.endsWith(`*`),afterInsertCursorOffset:-1})}function At(e){H(e,{prefix:`~~`,suffix:`~~`,check:e=>e.startsWith(`~~`)&&e.endsWith(`~~`),afterInsertCursorOffset:-2})}function jt(e){H(e,{prefix:`[`,suffix:`]()`,check:e=>e.startsWith(`[`)&&e.endsWith(`]()`),afterInsertCursorOffset:-1})}function Mt(e){H(e,{prefix:"`",suffix:"`",check:e=>e.startsWith("`")&&e.endsWith("`"),afterInsertCursorOffset:-1})}function Nt(e,t){let n=e.state.selection.main,r=e.state.doc.sliceString(n.from,n.to),i=r.match(/^\s*<span\s+style="color:\s*([^"\s][^"]*)"\s*>([\s\S]*)<\/span>\s*$/i);if(i){let r=`<span style="color: ${t}">${i[2]}</span>`;e.dispatch({changes:{from:n.from,to:n.to,insert:r},selection:{anchor:n.from,head:n.from+r.length}})}else{let i=`<span style="color: ${t}">${r}</span>`;e.dispatch({changes:{from:n.from,to:n.to,insert:i},selection:{anchor:n.from,head:n.from+i.length}})}}function Pt(e){let t=e.state.selection.main,n=e.state.doc.sliceString(t.from,t.to).split(`
`),r=n.every(e=>e.trim().startsWith(`- `))?n.map(e=>e.replace(/^- +/,``)).join(`
`):n.map(e=>`- ${e}`).join(`
`);e.dispatch(e.state.replaceSelection(r))}function Ft(e){let t=e.state.selection.main,n=e.state.doc.sliceString(t.from,t.to).split(`
`),r=n.every(e=>/^\d+\.\s/.test(e.trim()))?n.map(e=>e.replace(/^\d+\.\s+/,``)).join(`
`):n.map((e,t)=>`${t+1}. ${e}`).join(`
`);e.dispatch(e.state.replaceSelection(r))}function It(e){return se(e)}function Lt(e){return Oe(e)}var Rt=[S.of({name:`C`,extensions:[`c`,`h`],load:()=>v(()=>import(`./md-dist-B9WZX74v.js`).then(e=>e.cpp()),__vite__mapDeps([3,4,1]))}),S.of({name:`C++`,alias:[`cpp`],extensions:[`cpp`,`cc`,`cxx`,`hpp`,`hh`],load:()=>v(()=>import(`./md-dist-B9WZX74v.js`).then(e=>e.cpp()),__vite__mapDeps([3,4,1]))}),S.of({name:`CSS`,extensions:[`css`],load:()=>v(()=>import(`./md-codemirror-D8Gjrnmw.js`).then(e=>e.d).then(e=>e.css()),__vite__mapDeps([4,1]))}),S.of({name:`Go`,extensions:[`go`],load:()=>v(()=>import(`./md-dist-CW8e0PpQ.js`).then(e=>e.go()),__vite__mapDeps([5,4,1]))}),S.of({name:`HTML`,alias:[`xhtml`],extensions:[`html`,`htm`],load:()=>v(()=>import(`./md-codemirror-D8Gjrnmw.js`).then(e=>e.o).then(e=>e.html()),__vite__mapDeps([4,1]))}),S.of({name:`Java`,extensions:[`java`],load:()=>v(()=>import(`./md-dist-DF9xM4bz.js`).then(e=>e.java()),__vite__mapDeps([6,4,1]))}),S.of({name:`JavaScript`,alias:[`js`,`javascript`,`nodejs`],extensions:[`js`,`mjs`,`cjs`],load:()=>v(()=>import(`./md-codemirror-D8Gjrnmw.js`).then(e=>e.c).then(e=>e.javascript()),__vite__mapDeps([4,1]))}),S.of({name:`JSON`,alias:[`json5`],extensions:[`json`],load:()=>v(()=>import(`./md-dist-BQBBQBWe.js`).then(e=>e.json()),__vite__mapDeps([7,4,1]))}),S.of({name:`JSX`,extensions:[`jsx`],load:()=>v(()=>import(`./md-codemirror-D8Gjrnmw.js`).then(e=>e.c).then(e=>e.javascript({jsx:!0})),__vite__mapDeps([4,1]))}),S.of({name:`Markdown`,alias:[`md`],extensions:[`md`,`markdown`],load:()=>v(()=>import(`./md-codemirror-D8Gjrnmw.js`).then(e=>e.r).then(e=>e.markdown()),__vite__mapDeps([4,1]))}),S.of({name:`PHP`,extensions:[`php`,`php3`,`php4`,`php5`,`php7`,`phtml`],load:()=>v(()=>import(`./md-dist-CgClwWsE.js`).then(e=>e.php()),__vite__mapDeps([8,4,1]))}),S.of({name:`Python`,alias:[`py`],extensions:[`py`,`pyw`],load:()=>v(()=>import(`./md-dist-CsgFn8Zh.js`).then(e=>e.python()),__vite__mapDeps([9,4,1]))}),S.of({name:`Rust`,alias:[`rs`],extensions:[`rs`],load:()=>v(()=>import(`./md-dist-BQG0K42-.js`).then(e=>e.rust()),__vite__mapDeps([10,4,1]))}),S.of({name:`SQL`,extensions:[`sql`],load:()=>v(()=>import(`./md-dist-DlfVGKL-.js`).then(e=>e.sql()),__vite__mapDeps([11,4,1]))}),S.of({name:`TSX`,extensions:[`tsx`],load:()=>v(()=>import(`./md-codemirror-D8Gjrnmw.js`).then(e=>e.c).then(e=>e.javascript({jsx:!0,typescript:!0})),__vite__mapDeps([4,1]))}),S.of({name:`TypeScript`,alias:[`ts`],extensions:[`ts`,`mts`,`cts`],load:()=>v(()=>import(`./md-codemirror-D8Gjrnmw.js`).then(e=>e.c).then(e=>e.javascript({typescript:!0})),__vite__mapDeps([4,1]))}),S.of({name:`XML`,alias:[`rss`,`wsdl`,`xsd`],extensions:[`xml`,`xsl`,`xsd`],load:()=>v(()=>import(`./md-dist-BvtFVr52.js`).then(e=>e.xml()),__vite__mapDeps([12,4,1]))}),S.of({name:`YAML`,alias:[`yml`],extensions:[`yaml`,`yml`],load:()=>v(()=>import(`./md-dist-ByhDqV-0.js`).then(e=>e.yaml()),__vite__mapDeps([13,4,1]))})];async function zt(e){let t=e.state.doc.toString(),{formatDoc:n}=await v(async()=>{let{formatDoc:e}=await import(`./md-formatDoc-hjNG5tR3.js`);return{formatDoc:e}},__vite__mapDeps([0,1,2])),r=await n(t,`markdown`);e.dispatch({changes:{from:0,to:e.state.doc.length,insert:r}})}function Bt(e){let t=e.state.changeByRange(e=>({changes:{from:e.from,to:e.to,insert:`  `},range:be.range(e.from+2,e.from+2)}));return e.dispatch(t),!0}function Vt(e){let{onSearch:t,onReplace:n,onGoToLine:r}=e||{};return k.of([{key:`Tab`,run:Bt},{key:`Mod-z`,run:It},{key:`Mod-y`,run:Lt},{key:`Mod-b`,run:e=>(Ot(e),!0)},{key:`Mod-i`,run:e=>(kt(e),!0)},{key:`Mod-d`,run:e=>(At(e),!0)},{key:`Mod-k`,run:e=>(jt(e),!0)},{key:`Mod-e`,run:e=>(Mt(e),!0)},{key:`Mod-1`,run:e=>(U(e,1),!0)},{key:`Mod-2`,run:e=>(U(e,2),!0)},{key:`Mod-3`,run:e=>(U(e,3),!0)},{key:`Mod-4`,run:e=>(U(e,4),!0)},{key:`Mod-5`,run:e=>(U(e,5),!0)},{key:`Mod-6`,run:e=>(U(e,6),!0)},{key:`Mod-u`,run:e=>(Pt(e),!0)},{key:`Mod-o`,run:e=>(Ft(e),!0)},...t?[{key:`Mod-f`,run:e=>(t(e),!0)}]:[],...n?[{key:`Mod-h`,run:e=>(n(e),!0)}]:[],{key:`Shift-Alt-f`,run:e=>(zt(e),!0)},...r?[{key:`Mod-g`,run:e=>(r(e),!0)}]:[{key:`Mod-g`,run:()=>!0}]])}function Ht(e){let{placeholder:t,withoutHistory:n}=e||{};return[...n?[]:[A()],T(),ae(),D(),he({base:E,codeLanguages:Rt,addKeymap:!0}),pe.high(Vt(e)),C(),k.of([...le,...oe,...ve,...ne]),O.lineWrapping,me.allowMultipleSelections.of(!0),...t?[de(t)]:[]]}var Ut=O.theme({".cm-gutterElement":{display:`flex`,justifyContent:`right`,alignItems:`center`},"&.cm-editor .cm-gutters":{backgroundColor:`transparent !important`,borderRight:`none !important`,padding:`0 !important`},".cm-foldGutter":{width:`10px !important`,overflow:`hidden`},".cm-foldGutter .cm-gutterElement":{padding:`0 !important`,width:`10px !important`,minWidth:`unset !important`},".cm-foldGutter .cm-gutterElement span":{opacity:`0`,transition:`opacity 0.15s ease`},"&.cm-editor .cm-gutters:hover .cm-foldGutter .cm-gutterElement span":{opacity:`1`}});function Wt(){return[Te,Ut]}function Gt(){return[xe,Ut]}function Kt(e){return e?Gt():Wt()}async function qt(e){let t=e.state.doc.toString(),{formatDoc:n}=await v(async()=>{let{formatDoc:e}=await import(`./md-formatDoc-hjNG5tR3.js`);return{formatDoc:e}},__vite__mapDeps([0,1,2])),r=await n(t,`css`);e.dispatch({changes:{from:0,to:e.state.doc.length,insert:r}})}function Jt(){return[Dt,Ee(),O.lineWrapping,k.of([{key:`Shift-Alt-f`,run:e=>(qt(e),!0)}])]}function W(){return Et(i())}var Yt=h(`cssEditor`,()=>{let r=Ae(),i=p(null),o=p(null),s=n.reactive(e(`css_content_config`),{active:``,tabs:[]});l(()=>{let e=new Date;if(s.value.tabs.length===0){let n=t();s.value.tabs=[{id:n,title:a(`store.cssEditor.schemeDefault`),name:a(`store.cssEditor.schemeDefault`),content:W(),createDatetime:e,updateDatetime:e}],s.value.active=n;return}if(s.value.tabs=s.value.tabs.map((n,r)=>({...n,id:n.id??t(),createDatetime:n.createDatetime??new Date(e.getTime()+r),updateDatetime:n.updateDatetime??new Date(e.getTime()+r)})),!s.value.tabs.find(e=>e.id===s.value.active)){let e=s.value.tabs.find(e=>e.name===s.value.active);s.value.active=e?.id??s.value.tabs[0].id}});let c=()=>{let e=s.value.tabs.find(e=>e.id===s.value.active);if(!e){if(s.value.tabs.length===0){let e=t(),n=new Date;return s.value.tabs=[{id:e,title:a(`store.cssEditor.schemeDefault`),name:a(`store.cssEditor.schemeDefault`),content:W(),createDatetime:n,updateDatetime:n}],s.value.active=e,s.value.tabs[0]}return s.value.active=s.value.tabs[0].id,s.value.tabs[0]}return e},u=()=>c().content,d=e=>{i.value&&i.value.dispatch({changes:{from:0,to:i.value.state.doc.length,insert:e}})},m=null;return f(r,()=>{i.value&&o.value&&i.value.dispatch({effects:o.value.reconfigure(Kt(r.value))})}),{cssEditor:i,cssContentConfig:s,isSelectMode:_(()=>s.value.isSelectMode??!1),selectedIds:_(()=>s.value.selectedIds??[]),getCurrentTab:c,getCurrentTabContent:u,setCssEditorValue:d,setOnTabChangedCallback:e=>{m=e},tabChanged:e=>{s.value.active=e;let t=s.value.tabs.find(t=>t.id===e);t&&(d(t.content),m&&m(t.content))},renameTab:e=>{let t=c();t.title=e,t.name=e},addCssContentTab:(e,n)=>{let r=n??W(),i=new Date;s.value.tabs.push({id:t(),name:e,title:e,content:r,createDatetime:i,updateDatetime:i});let a=s.value.tabs[s.value.tabs.length-1];s.value.active=a.id,d(r),m&&m(r)},resetCssConfig:()=>{let e=W(),n=t();s.value={active:n,tabs:[{id:n,title:a(`store.cssEditor.schemeDefaultSpaced`),name:a(`store.cssEditor.schemeDefaultSpaced`),content:e,createDatetime:new Date,updateDatetime:new Date}]},i.value&&i.value.dispatch({changes:{from:0,to:i.value.state.doc.length,insert:e}})},initCssEditor:e=>{let t=document.querySelector(`#cssEditor`);if(!t)return;t.value=c().content;let n=document.createElement(`div`);n.className=`w-full h-full`,t.parentNode?.replaceChild(n,t),o.value=new Ce;let a=me.create({doc:c().content,extensions:[Jt(),o.value.of(Kt(r.value)),O.updateListener.of(t=>{if(t.docChanged){let n=t.state.doc.toString(),r=c();r.content=n,r.updateDatetime=new Date,e(n)}})]});i.value=g(new O({state:a,parent:n}))},scrollToHeading:e=>{if(!i.value)return;let t=i.value.state.doc.toString(),n=RegExp(`^${e}\\s*\\{`,`m`),r=t.match(n);if(r&&r.index!==void 0){let e=r.index,n=0,a=e,o=!1;for(let r=e;r<t.length;r++)if(t[r]===`{`)n++,o=!0;else if(t[r]===`}`&&(n--,o&&n===0)){a=r+1;break}i.value.dispatch({selection:{anchor:e,head:a},scrollIntoView:!0}),i.value.focus()}},toggleSelectMode:()=>{s.value.isSelectMode=!(s.value.isSelectMode??!1),s.value.isSelectMode||(s.value.selectedIds=[])},toggleSelectTab:e=>{let t=s.value.selectedIds??[];t.indexOf(e)===-1?s.value.selectedIds=[...t,e]:s.value.selectedIds=t.filter(t=>t!==e)},selectAllTabs:()=>{s.value.selectedIds=s.value.tabs.map(e=>e.id)},clearSelection:()=>{s.value.selectedIds=[]},batchDeleteTabs:()=>{let e=s.value.selectedIds??[];if(e.length===0)return;if(e.length>=s.value.tabs.length){y.warning(a(`store.cssEditor.keepAtLeastOne`));return}let t=s.value.tabs.filter(t=>!e.includes(t.id));e.includes(s.value.active)&&(s.value.active=t[0].id,d(t[0].content),m&&m(t[0].content)),s.value.tabs=t,s.value.selectedIds=[],s.value.isSelectMode=!1,y.success(a(`store.cssEditor.batchDeleted`,{count:e.length}))},batchExportTabs:async()=>{let e=s.value.selectedIds??[];if(e.length!==0){if(e.length===1){let t=s.value.tabs.find(t=>t.id===e[0]);t&&B(`data:text/css;charset=utf-8,${encodeURIComponent(t.content)}`,`${z(t.title)}.css`)}else{let{strToU8:t,zip:n}=await v(async()=>{let{strToU8:e,zip:t}=await import(`./md-browser-C7tAaLTR.js`).then(e=>e.t);return{strToU8:e,zip:t}},__vite__mapDeps([14,1])),r={};e.forEach(e=>{let n=s.value.tabs.find(t=>t.id===e);n&&(r[`${z(n.title)}.css`]=t(n.content))});let i=await new Promise((e,t)=>n(r,(n,r)=>n?t(n):e(r))),a=URL.createObjectURL(new Blob([i],{type:`application/zip`}));B(a,`css-schemes.zip`),URL.revokeObjectURL(a)}s.value.selectedIds=[],s.value.isSelectMode=!1,y.success(a(`store.cssEditor.batchExported`,{count:e.length}))}},exportSingleTab:e=>{let t=s.value.tabs.find(t=>t.id===e);t&&(B(`data:text/css;charset=utf-8,${encodeURIComponent(t.content)}`,`${z(t.title)}.css`),y.success(a(`store.cssEditor.singleExported`,{name:t.title})))}}}),Xt=h(`theme`,()=>{let t=n.reactive(e(`theme`),s.theme),i=n.reactive(e(`themeSettings`),{}),a=_(()=>i.value[t.value]??o()),c=_({get:()=>a.value.primaryColor,set:e=>{h(`primaryColor`,e)}}),l=_({get:()=>a.value.fontFamily,set:e=>{h(`fontFamily`,e)}}),u=_({get:()=>a.value.fontSize,set:e=>{h(`fontSize`,e)}}),d=_({get:()=>a.value.codeBlockTheme,set:e=>{h(`codeBlockTheme`,e)}}),f=_({get:()=>a.value.headingStyles,set:e=>{h(`headingStyles`,e)}}),p=_({get:()=>a.value.isShowLineNumber,set:e=>{h(`isShowLineNumber`,e)}}),m=_({get:()=>a.value.isMacCodeBlock,set:e=>{h(`isMacCodeBlock`,e)}});function h(e,n){let r=t.value,a=i.value[r]??o();i.value={...i.value,[r]:{...a,[e]:n}}}let g=n.reactive(`isCiteStatus`,s.isCiteStatus),y=n.reactive(`isCountStatus`,s.isCountStatus),b=n.reactive(e(`use_indent`),!1),x=n.reactive(e(`use_justify`),!1),ee=n.reactive(`legend`,s.legend),te=n.reactive(`previewWidth`,r[0].value);return{theme:t,themeSettings:i,fontFamily:l,fontSize:u,fontSizeNumber:_(()=>Number(u.value.replace(`px`,``))),primaryColor:c,codeBlockTheme:d,legend:ee,isMacCodeBlock:m,isShowLineNumber:p,isCiteStatus:g,isCountStatus:y,isUseIndent:b,isUseJustify:x,previewWidth:te,headingStyles:f,toggleMacCodeBlock:j(m),toggleShowLineNumber:j(p),toggleCiteStatus:j(g),toggleCountStatus:j(y),toggleUseIndent:j(b),toggleUseJustify:j(x),resetStyle:()=>{i.value={...i.value,[t.value]:o()},g.value=s.isCiteStatus,y.value=s.isCountStatus,ee.value=s.legend,b.value=!1,x.value=!1},updateCodeTheme:()=>{let e=d.value,t=document.querySelector(`#hljs`);if(t){if(t.getAttribute(`href`)===e)return;t.setAttribute(`href`,e)}else{let t=document.createElement(`link`);t.setAttribute(`type`,`text/css`),t.setAttribute(`rel`,`stylesheet`),t.setAttribute(`href`,e),t.setAttribute(`id`,`hljs`),document.head.appendChild(t)}},applyCurrentTheme:async()=>{try{let e=Yt().getCurrentTabContent(),n;if(wt(t.value)){let{useMarketplaceStore:e}=await v(async()=>{let{useMarketplaceStore:e}=await import(`./md-marketplace-Ct9mghSS.js`).then(e=>e.t);return{useMarketplaceStore:e}},__vite__mapDeps([15,1,16,17,18,19,2,20,21,22,23,24,25,26,14]));n=e().getInstalledThemeCss(t.value)}await rt({themeName:t.value,themeCSS:n,customCSS:e,variables:{primaryColor:c.value,fontFamily:l.value,fontSize:u.value,isUseIndent:b.value,isUseJustify:x.value,headingStyles:f.value}})}catch(e){console.error(`[applyCurrentTheme] 主题应用失败:`,e)}},setHeadingStyle:(e,t)=>{let n=f.value;f.value={...n,[e]:t==="default"?void 0:t}},getHeadingStyle:e=>f.value[e]||`default`}}),Zt=h(`render`,()=>{let e=p(``),t=m({chars:0,words:0,minutes:0}),n=p([]),r=null,i=``,o=``,s=null,c=null,l=()=>r,u=()=>({mermaidLoading:a(`store.diagram.mermaidLoading`),mermaidError:a(`store.diagram.mermaidError`),plantumlLoading:a(`store.diagram.plantumlLoading`),plantumlError:a(`store.diagram.plantumlError`),infographicLoading:a(`store.diagram.infographicLoading`),infographicError:a(`store.diagram.infographicError`)}),d=()=>({summary:a(`store.count.summary`,{words:`{words}`,minutes:`{minutes}`})}),f=()=>({footnoteTitle:a(`store.render.footnoteTitle`),unknownComponent:a(`store.render.unknownComponent`),katexLoading:a(`store.render.katexLoading`)});function h(e){return Object.keys(e.registry).sort().map(t=>{let n=e.registry[t];return[t,n.updatedAt??0,n.template,JSON.stringify(n.props??[])].join(``)}).join(``)}function g(e,t,n){return[e,t.isCiteStatus?`1`:`0`,t.legend,t.isCountStatus?`1`:`0`,t.isMacCodeBlock?`1`:`0`,t.isShowLineNumber?`1`:`0`,h(n),a(`store.count.summary`,{words:`{words}`,minutes:`{minutes}`}),a(`store.render.footnoteTitle`),a(`store.render.unknownComponent`),a(`store.render.katexLoading`),a(`store.diagram.mermaidLoading`)].join(``)}let _=e=>{let t=r.getHeadings();n.value=t.map((e,t)=>({url:`#${t}`,title:e.text,level:e.level}));let i=0;return e.replace(/data-heading="true"/g,()=>`data-heading="true" id="${i++}"`)},y=(n,a)=>{if(!r)return c={content:n,options:a},e.value;let s=Xt(),l=Ei(),p=St(),m=a?.themeMode??(l.isDark?`dark`:`light`),h=g(m,s,p);if(!a?.force&&n===o&&h===i)return e.value;r.reset({citeStatus:s.isCiteStatus,legend:s.legend,countStatus:s.isCountStatus,isMacCodeBlock:s.isMacCodeBlock,isShowLineNumber:s.isShowLineNumber,themeMode:m,components:p.registry,diagramMessages:u(),countMessages:d(),renderMessages:f()});let{html:v,readingTime:y}=Me(n,r);return t.chars=n.length,t.words=y.words,t.minutes=Math.ceil(y.minutes),e.value=_(Pe(v,y,r)),o=n,i=h,e.value};function b(){if(!c||!r)return;let e=c;c=null,y(e.content,e.options)}return{output:e,readingTime:t,titleList:n,initRendererInstance:async e=>(s??=v(async()=>{let{initRenderer:e}=await import(`./md-renderer-BSPtb1zW.js`).then(e=>e.t);return{initRenderer:e}},__vite__mapDeps([27,1,24,2,25,26,14,28])).then(({initRenderer:t})=>(r=t(e||{}),i=``,o=``,r)).catch(e=>{throw s=null,e}),await s,b(),r),getRenderer:l,render:y}}),Qt=/^(?:serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-sans-serif|ui-serif|ui-monospace|ui-rounded|inherit|initial|unset|revert|revert-layer)$/i;function $t(e){let t=e.replace(/\s*!important$/i,``).trim();return!t||/^undefined$/i.test(t)||/\bundefined\b/i.test(t)}function en(e){let t=e.replace(/["']/g,``).trim();return!t||/^var\(/i.test(e)?e:Qt.test(t)?t:/\s/.test(t)||t.split(``).some(e=>e.charCodeAt(0)>127)?`'${t}'`:t}function tn(e){return e.split(/,(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/).map(e=>en(e.trim())).filter(Boolean).join(`, `)}function nn(e){return e.replace(/font-family\s*:\s*([^;}{]+)/gi,(e,t)=>`font-family: ${tn(t)}`).replace(/(?<!['"])\bOpen Sans\b(?!['"])/gi,`sans-serif`)}function rn(e){return e.replace(/&quot;/g,`"`).replace(/&#34;/g,`"`).replace(/&apos;|&#39;/g,`'`).replace(/&amp;/g,`&`)}function an(e,t){let n=e.replace(/&/g,`&amp;`);return n=t===`"`?n.replace(/"/g,`&quot;`):n.replace(/'/g,`&#39;`),n}function on(e){return nn(e.split(`;`).map(e=>e.trim()).filter(e=>{if(!e||/^undefined$/i.test(e))return!1;let t=e.indexOf(`:`);return t!==-1&&!$t(e.slice(t+1))}).join(`; `))}function sn(e){return nn(e.replace(/([a-z_-]+)\s*:\s*undefined\b\s*;?/gi,``))}function cn(e){e.querySelectorAll(`[style]`).forEach(e=>{let t=e.getAttribute(`style`);if(t==null)return;let n=on(t);n?e.setAttribute(`style`,n):e.removeAttribute(`style`)}),e.querySelectorAll(`style`).forEach(e=>{let t=e.textContent;t&&(/\bundefined\b/i.test(t)||/font-family\s*:/i.test(t)||/\bOpen Sans\b/i.test(t))&&(e.textContent=sn(t))})}function ln(e){return e.replace(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/gi,(e,t,n)=>` style=${t}${an(on(rn(n)),t)}${t}`).replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,(e,t,n,r)=>`${t}${sn(n)}${r}`).replace(/\sfont-family\s*=\s*(["'])([\s\S]*?)\1/gi,(e,t,n)=>` font-family=${t}${an(tn(rn(n)),t)}${t}`).replace(/(?<!['"])\bOpen Sans\b(?!['"])/gi,`sans-serif`)}function un(e){return e.replace(/font-family\s*:[^;}{]+;?/gi,``).replace(/\sfont-family\s*=\s*(["'])[\s\S]*?\1/gi,``).replace(/(?<!['"])\bOpen Sans\b(?!['"])/gi,`sans-serif`)}function dn(e){let t=e??document.getElementById(`output`);if(!t)return;let n=t.getElementsByTagName(`img`);Array.from(n).forEach(e=>{let t=e.getAttribute(`width`),n=e.getAttribute(`height`);t&&(e.removeAttribute(`width`),e.style.width=/^\d+$/.test(t)?`${t}px`:t),n&&(e.removeAttribute(`height`),e.style.height=/^\d+$/.test(n)?`${n}px`:n)})}function fn(e){let t=document.createElement(`div`);return t.innerHTML=e,t.querySelectorAll(`li > ul, li > ol`).forEach(e=>{e.parentElement?.insertAdjacentElement(`afterend`,e)}),t.innerHTML}function pn(){let e=document.createElement(`p`);return e.style.fontSize=`0`,e.style.lineHeight=`0`,e.style.margin=`0`,e.innerHTML=`&nbsp;`,e}function mn(e){e.querySelector(`.mermaid-diagram foreignObject`)&&e.querySelectorAll(`foreignObject`).forEach(e=>{if(!e.closest(`.mermaid-diagram`))return;let t=e.querySelector(`:scope > div, :scope > span, :scope > section`);if(!t||t.localName===`section`)return;let n=document.createElement(`section`);n.setAttribute(`xmlns`,t.getAttribute(`xmlns`)||`http://www.w3.org/1999/xhtml`);let r=t.getAttribute(`style`)||``;r&&n.setAttribute(`style`,r),n.innerHTML=t.innerHTML,e.replaceChildren(n)})}var hn=`:root {
  --foreground: 0 0% 3.9%;
  --blockquote-background: #f7f7f7;
}`;async function gn(){let e=document.querySelector(`#hljs`);if(!e)return``;try{return`<style>${await(await fetch(e.href)).text()}</style>`}catch(e){return console.warn(`Failed to fetch highlight.js styles:`,e),``}}function _n(e,t){let n=e;return n=n.replace(/#output\s*\{/g,`${t} {`),n=n.replace(/#output\s+/g,`${t} `),n=n.replace(/^#output\s*/gm,`${t} `),n}function vn(e){let t=e;return t=t.replace(/#output\s*\{/g,`body {`),t=t.replace(/#output\s+/g,``),t=t.replace(/^#output\s*/gm,``),t}function yn(){let e=document.querySelector(`#md-theme`);return!e||!e.textContent?(console.warn(`[getThemeStyles] theme styles not found`),``):`<style>${vn(e.textContent)}</style>`}async function bn(){let e=document.querySelector(`#md-theme`);if(!e?.textContent)return console.warn(`[getShareExportStyles] theme styles not found`),``;let t=[`<style>${hn}</style>`,`<style>${_n(e.textContent,`.share-content`)}</style>`],n=await gn();return n&&t.push(n),t.join(``)}async function xn(){return[yn(),await gn()].filter(Boolean).join(``)}var G=`http://www.w3.org/2000/svg`;function Sn(e){return e?e.match(/#([^)'"]+)/)?.[1]??null:null}function Cn(e){let t=new Map;return Array.from(e.querySelectorAll(`*`)).forEach(e=>{if(e.localName!==`marker`)return;let n=e.getAttribute(`id`);if(!n)return;let r=Array.from(e.querySelectorAll(`*`)).filter(e=>[`path`,`polygon`,`polyline`,`line`].includes(e.localName));r.length!==0&&t.set(n,{paths:r,refX:Number.parseFloat(e.getAttribute(`refX`)??`0`),refY:Number.parseFloat(e.getAttribute(`refY`)??`0`),orient:e.getAttribute(`orient`)??`auto`,markerUnits:e.getAttribute(`markerUnits`)??`strokeWidth`,markerWidth:Number.parseFloat(e.getAttribute(`markerWidth`)??`3`),markerHeight:Number.parseFloat(e.getAttribute(`markerHeight`)??`3`)})}),t}function wn(e){return e.paths.map(e=>e.cloneNode(!0))}function Tn(e,t){if(e===`auto`||e===`auto-start-reverse`)return e===`auto-start-reverse`?t+Math.PI:t;let n=Number.parseFloat(e);return Number.isFinite(n)?n*Math.PI/180:t}function En(e){let t=e.getAttribute(`stroke-width`);if(t)return Number.parseFloat(t)||1.5;let n=(e.getAttribute(`style`)??``).match(/stroke-width:\s*([\d.]+)/);return n?Number.parseFloat(n[1]):1.5}function Dn(e){return e.getAttribute(`stroke`)??e.getAttribute(`fill`)??`currentColor`}function On(e,t,n,r,i){let a=Math.max(6,i*4),o=t.x,s=t.y,c=o-a*Math.cos(n-Math.PI/6),l=s-a*Math.sin(n-Math.PI/6),u=o-a*Math.cos(n+Math.PI/6),d=s-a*Math.sin(n+Math.PI/6),f=document.createElementNS(G,`polygon`);f.setAttribute(`points`,`${o},${s} ${c},${l} ${u},${d}`),f.setAttribute(`fill`,r),f.setAttribute(`stroke`,`none`),e.parentElement?.insertBefore(f,e.nextSibling)}function kn(e,t,n,r,i,a){let o=Tn(t.orient,r),s=t.markerUnits===`userSpaceOnUse`?1:Math.max(i,1),c=document.createElementNS(G,`g`);c.setAttribute(`transform`,`translate(${n.x}, ${n.y}) rotate(${o*180/Math.PI}) scale(${s}) translate(${-t.refX}, ${-t.refY})`);let l=wn(t);if(l.length===0){On(e,n,r,a,i);return}l.forEach(e=>{(!e.getAttribute(`fill`)||e.getAttribute(`fill`)===`context-fill`)&&e.setAttribute(`fill`,a),(!e.getAttribute(`stroke`)||e.getAttribute(`stroke`)===`context-stroke`)&&e.setAttribute(`stroke`,a),c.appendChild(e)}),e.appendChild(c)}function An(e,t){let n=e.getAttribute(`x1`),r=e.getAttribute(`y1`),i=e.getAttribute(`x2`),a=e.getAttribute(`y2`);if(n==null||r==null||i==null||a==null)return null;let o=Number.parseFloat(n),s=Number.parseFloat(r),c=Number.parseFloat(i),l=Number.parseFloat(a),u={x:t?o:c,y:t?s:l},d=Math.atan2(l-s,c-o);return{point:u,angle:t?d+Math.PI:d}}function jn(e,t){let n=e;if(typeof n.getTotalLength!=`function`)return null;let r=n.getTotalLength();if(r<=0)return null;let i=Math.min(5,r/2),a=t?n.getPointAtLength(0):n.getPointAtLength(r),o=t?n.getPointAtLength(Math.min(r,i)):n.getPointAtLength(Math.max(0,r-i)),s={x:a.x,y:a.y},c=Math.atan2(s.y-o.y,s.x-o.x);return{point:s,angle:t?c+Math.PI:c}}function Mn(e,t){return e.localName===`path`?jn(e,t):e.localName===`line`?An(e,t):null}function Nn(e,t,n){let r=Sn(t.getAttribute(`marker-end`)??t.getAttribute(`markerEnd`)),i=Sn(t.getAttribute(`marker-start`)??t.getAttribute(`markerStart`));if(!r&&!i)return;let a=En(t),o=Dn(t),s=(r,i)=>{if(!r)return;let s=Mn(t,i);if(!s)return;let c=n.get(r);if(c){kn(e,c,s.point,s.angle,a,o);return}On(t,s.point,s.angle,o,a)};s(i,!0),s(r,!1),t.removeAttribute(`marker-end`),t.removeAttribute(`marker-start`),t.removeAttribute(`markerEnd`),t.removeAttribute(`markerStart`),t.removeAttribute(`marker-mid`),t.removeAttribute(`markerMid`)}function Pn(e){let t=e.querySelector(`defs`),n=t?Cn(t):new Map;e.querySelectorAll(`path, line, polyline`).forEach(t=>{Nn(e,t,n)})}function Fn(e,t){let n=typeof e.getElementById==`function`?e.getElementById(t):null;if(n)return n;try{return e.querySelector(`#${CSS.escape(t)}`)}catch{return null}}function In(e){return e.getAttribute(`stop-color`)||e.getAttribute(`style`)?.match(/stop-color:\s*([^;]+)/i)?.[1]?.trim()||null}function Ln(e,t){let n=Xn(e),r=Xn(t);return n?r?`rgb(${Math.round((n[0]+r[0])/2)}, ${Math.round((n[1]+r[1])/2)}, ${Math.round((n[2]+r[2])/2)})`:e:r?t:null}function Rn(e,t){let n=Sn(t);if(!n)return null;let r=Fn(e,n);if(!r||r.localName!==`linearGradient`&&r.localName!==`radialGradient`)return null;let i=Array.from(r.querySelectorAll(`stop`)).map(In).filter(e=>!!e);return i.length===0?null:i.length===1?i[0]:Ln(i[0],i[i.length-1])??i[0]}function zn(e){let t=(t,n)=>{let r=t.getAttribute(n);if(!r?.includes(`url(`))return;let i=Rn(e,r);i&&t.setAttribute(n,i)};e.querySelectorAll(`*`).forEach(n=>{t(n,`fill`),t(n,`stroke`);let r=n.getAttribute(`style`);if(!r?.includes(`url(`))return;let i=r.replace(/(fill|stroke)\s*:\s*([^;]+)/gi,(t,n,r)=>{if(!r.includes(`url(`))return t;let i=Rn(e,r.trim());return i?`${n}: ${i}`:t});i!==r&&n.setAttribute(`style`,i)})}function Bn(e){Array.from(e.querySelectorAll(`use`)).forEach(t=>{let n=Sn(t.getAttribute(`href`)||t.getAttribute(`xlink:href`));if(!n){t.remove();return}let r=Fn(e,n);if(!r){t.remove();return}let i=document.createElementNS(G,`g`),a=Number.parseFloat(t.getAttribute(`x`)??`0`)||0,o=Number.parseFloat(t.getAttribute(`y`)??`0`)||0,s=[];(a||o)&&s.push(`translate(${a}, ${o})`);let c=t.getAttribute(`transform`);if(c&&s.push(c),s.length&&i.setAttribute(`transform`,s.join(` `)),r.localName===`symbol`||r.localName===`svg`||r.localName===`g`)Array.from(r.childNodes).forEach(e=>{(e.nodeType!==Node.ELEMENT_NODE||e.localName!==`defs`)&&i.appendChild(e.cloneNode(!0))});else{let e=r.cloneNode(!0);e.removeAttribute(`id`),i.appendChild(e)}for(let e of[`fill`,`stroke`,`stroke-width`,`opacity`]){let n=t.getAttribute(e);n&&i.setAttribute(e,n)}t.parentNode?.replaceChild(i,t)})}var Vn=`path, line, polyline, polygon, rect, circle, ellipse, text, tspan`;function K(e){return!!e&&e.trim().toLowerCase()===`none`}function q(e){if(!e)return!1;let t=e.trim().toLowerCase();return t!==``&&t!==`none`&&!t.includes(`url(`)}function J(e,t){let n=e.getAttribute(`style`);if(!n)return;let r=new Set(t.map(e=>e.toLowerCase())),i=n.split(`;`).map(e=>e.trim()).filter(Boolean).filter(e=>{let t=e.split(`:`)[0]?.trim().toLowerCase();return!!t&&!r.has(t)}).join(`; `);i?e.setAttribute(`style`,i):e.removeAttribute(`style`)}function Y(e,t){let n=e.getAttribute(`style`);return n&&n.match(RegExp(`(?:^|;)\\s*${t}\\s*:\\s*([^;]+)`,`i`))?.[1]?.trim()||null}function Hn(e,t,n){let r=e.getAttribute(t),i=Y(e,t);if(K(r)||K(i)){e.setAttribute(t,`none`),J(e,[t]);return}if(q(r)){J(e,[t]);return}if(q(i)){e.setAttribute(t,i),J(e,[t]);return}if(K(n)){e.setAttribute(t,`none`);return}q(n)&&e.setAttribute(t,n)}function Un(e){let t=e.getAttribute(`style`);return t&&t.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)?.[1]?.trim()||null}function Wn(e){let t=e.getAttribute(`fill`),n=Y(e,`fill`),r=Un(e);if(K(t)||K(n)){e.setAttribute(`fill`,`none`),J(e,[`fill`]);return}if(q(t)){J(e,[`fill`]);return}if(q(n)){e.setAttribute(`fill`,n),J(e,[`fill`]);return}if(q(r)){e.setAttribute(`fill`,r);return}let i=window.getComputedStyle(e).color;q(i)&&e.setAttribute(`fill`,i)}function Gn(e){e.querySelectorAll(`foreignObject section, foreignObject span, foreignObject div, foreignObject p`).forEach(e=>{let t=e.getAttribute(`style`)??``;if(/(?:^|;)\s*color\s*:/i.test(t))return;let n=window.getComputedStyle(e).color;q(n)&&e.setAttribute(`style`,`${t}${t?`; `:``}color: ${n}`)})}function Kn(e){e.querySelectorAll(Vn).forEach(e=>{if(!(e instanceof SVGElement))return;let t=window.getComputedStyle(e),n=e.localName===`text`||e.localName===`tspan`;n?Wn(e):Hn(e,`fill`,t.fill),n?!e.getAttribute(`stroke`)&&!Y(e,`stroke`)&&e.setAttribute(`stroke`,`none`):Hn(e,`stroke`,t.stroke),t.strokeWidth&&!e.hasAttribute(`stroke-width`)&&e.setAttribute(`stroke-width`,t.strokeWidth),t.fontSize&&n&&!e.hasAttribute(`font-size`)&&e.setAttribute(`font-size`,t.fontSize),t.opacity&&t.opacity!==`1`&&!e.hasAttribute(`opacity`)&&e.setAttribute(`opacity`,t.opacity);let r=t.getPropertyValue(`stroke-opacity`)||t.strokeOpacity,i=e.getAttribute(`stroke`);r&&r!==`1`&&!e.hasAttribute(`stroke-opacity`)&&i&&i!==`none`&&e.setAttribute(`stroke-opacity`,r)}),e.querySelectorAll(`g`).forEach(e=>{J(e,[`fill`,`stroke`]),e.removeAttribute(`fill`),e.removeAttribute(`stroke`)})}function qn(e){if(!e)return null;let t=e.trim().split(/[\s,]+/).map(Number);return t.length!==4||t.some(e=>!Number.isFinite(e))?null:{x:t[0],y:t[1],width:t[2],height:t[3]}}function X(e){if(!e||e.endsWith(`%`))return null;let t=Number.parseFloat(e);return Number.isFinite(t)&&t>0?t:null}function Jn(e){return e.closest(`.plantuml-diagram`)!=null||e.hasAttribute(`data-diagram-type`)}function Yn(e){return e.closest(`.katex-inline, .katex-block, mjx-container`)!=null}function Xn(e){let t=e.trim().toLowerCase();if(!t||t===`none`||t===`currentcolor`||t===`transparent`||t.startsWith(`url(`))return null;if(t===`black`)return[0,0,0];if(t===`white`)return[255,255,255];let n=t.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(n){let e=n[1];return e.length===3?[Number.parseInt(e[0]+e[0],16),Number.parseInt(e[1]+e[1],16),Number.parseInt(e[2]+e[2],16)]:[Number.parseInt(e.slice(0,2),16),Number.parseInt(e.slice(2,4),16),Number.parseInt(e.slice(4,6),16)]}let r=t.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);return r?[Math.min(255,Number.parseFloat(r[1])),Math.min(255,Number.parseFloat(r[2])),Math.min(255,Number.parseFloat(r[3]))]:null}function Zn([e,t,n]){let r=e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4};return .2126*r(e)+.7152*r(t)+.0722*r(n)}function Qn([e,t,n]){return Math.max(e,t,n)-Math.min(e,t,n)<=24}function $n(e){let t=Xn(e);return!t||!Qn(t)?!1:Zn(t)<.35}function er(e){return e&&(e.trim().toLowerCase()===`currentcolor`||$n(e))?`currentColor`:null}function tr(e){for(let t of[`fill`,`stroke`]){let n=er(e.getAttribute(t));n&&e.setAttribute(t,n)}let t=e.getAttribute(`style`);if(!t)return;let n=!1,r=t.split(`;`).map(e=>e.trim()).filter(Boolean).map(e=>{let t=e.indexOf(`:`);if(t===-1)return e;let r=e.slice(0,t).trim().toLowerCase();if(r!==`fill`&&r!==`stroke`)return e;let i=er(e.slice(t+1).trim());return i?(n=!0,`${r}: ${i}`):e}).join(`; `);n&&e.setAttribute(`style`,`${r};`)}function nr(e){e.querySelectorAll(`.katex-inline, .katex-block`).forEach(e=>{e.style.removeProperty(`color`)}),e.querySelectorAll(`.katex-inline svg, .katex-block svg, mjx-container svg`).forEach(e=>{e.style.removeProperty(`color`);let t=e.getAttribute(`fill`);(!t||t===`currentColor`||$n(t))&&e.setAttribute(`fill`,`currentColor`),e.querySelectorAll(`path, rect, use, g`).forEach(tr)})}function rr(e){return e.localName===`text`||e.localName===`tspan`||e.closest(`foreignObject`)!=null}function ir(e){rr(e)||tr(e),e.querySelectorAll(`*`).forEach(e=>{rr(e)||tr(e)})}function ar(e){let t=e.getAttribute(`fill-opacity`);if(t!==null&&Number.parseFloat(t)===0)return!0;let n=e.getAttribute(`opacity`);return n!==null&&Number.parseFloat(n)===0}function or(e){if(typeof SVGGraphicsElement>`u`)return!1;let t=1/0,n=1/0,r=-1/0,i=-1/0,a=!1;if(e.querySelectorAll(`path, line, rect, circle, ellipse, polygon, polyline, text, image, use`).forEach(e=>{if(!(!(e instanceof SVGGraphicsElement)||ar(e)))try{let o=e.getBBox();if(o.width<=0&&o.height<=0)return;a=!0,t=Math.min(t,o.x),n=Math.min(n,o.y),r=Math.max(r,o.x+o.width),i=Math.max(i,o.y+o.height)}catch{}}),!a)try{let o=e.getBBox();o.width>0&&o.height>0&&(t=o.x,n=o.y,r=o.x+o.width,i=o.y+o.height,a=!0)}catch{}if(!a)return!1;t-=2,n-=2;let o=Math.max(1,r+2-t),s=Math.max(1,i+2-n);return e.setAttribute(`viewBox`,`${t} ${n} ${o} ${s}`),!0}function sr(e,t){let n=new Set(t.map(e=>e.split(`:`)[0]?.trim()).filter(Boolean)),r=(e.getAttribute(`style`)??``).split(`;`).map(e=>e.trim()).filter(Boolean).filter(e=>{let t=e.split(`:`)[0]?.trim();return t&&!n.has(t)});e.setAttribute(`style`,`${[...r,...t].join(`; `)};`)}function cr(e,t,n,r=`inline`){if(r===`scroll`){sr(e,[`display: block`,`vertical-align: top`,`width: 100%`,`height: ${n}px`,`max-width: none`]);return}sr(e,[`display: block`,`vertical-align: top`,`width: 100%`,`max-width: ${t}px`,`height: auto`])}function lr(e){let t=qn(e.getAttribute(`viewBox`));if(t&&t.width>0&&t.height>0)return{width:Math.max(1,Math.round(t.width)),height:Math.max(1,Math.round(t.height))};let n=X(e.getAttribute(`width`)),r=X(e.getAttribute(`height`));if(n&&r)return{width:n,height:r};let i=e.getBoundingClientRect(),a=n??t?.width??(i.width>0?i.width:677),o=r??t?.height??(i.height>0?i.height:a*.75);if(t&&t.width>0&&t.height>0){let e=t.height/t.width;Math.abs(o/a-e)>.01&&(o=a*e)}return{width:Math.max(1,Math.round(a)),height:Math.max(1,Math.round(o))}}function ur(e){let{width:t,height:n}=lr(e);return e.hasAttribute(`xmlns`)||e.setAttribute(`xmlns`,G),e.setAttribute(`width`,String(t)),e.setAttribute(`height`,String(n)),e.setAttribute(`preserveAspectRatio`,`xMidYMid meet`),{width:t,height:n}}function dr(e){e.setAttribute(`style`,`box-sizing: border-box; width: 100%; margin: 0; padding: 0; line-height: 0; font-size: 0;`)}function fr(e){let t=Number.parseFloat(e.getAttribute(`width`)??`0`),n=Number.parseFloat(e.getAttribute(`height`)??`0`);if(t<=677)return;let r=e.parentNode;if(!r)return;let i=document.createElement(`section`);i.setAttribute(`style`,`box-sizing: border-box; width: 100%; margin: 0; padding: 0; line-height: 0; font-size: 0;`);let a=document.createElement(`section`);a.setAttribute(`style`,`overflow-x: scroll; overflow-y: hidden; -webkit-overflow-scrolling: touch; white-space: nowrap; width: 100%; font-size: 0; line-height: 0;${n>0?` height: ${n}px;`:``}`);let o=document.createElement(`section`);o.setAttribute(`style`,`display: inline-block; width: ${t}px;${n>0?` height: ${n}px;`:``} vertical-align: top; line-height: 0; font-size: 0;`);let s=document.createElement(`p`);s.setAttribute(`style`,`font-size: 14px; color: #999; text-align: center; margin-top: 5px; margin-bottom: 0; white-space: normal;`),s.textContent=`<<< 左右滑动看更多 >>>`,cr(e,t,n,`scroll`),r.insertBefore(i,e),o.appendChild(e),a.appendChild(o),i.appendChild(a),i.appendChild(s)}function pr(e){let t=(e.getAttribute(`style`)??``).match(/max-width:\s*([\d.]+)px/i);if(!t)return null;let n=Number.parseFloat(t[1]);return Number.isFinite(n)&&n>0?n:null}function mr(e){let t=qn(e.getAttribute(`viewBox`)),n=pr(e),r=X(e.getAttribute(`width`)),i=n??t?.width??r??677,a=t&&t.width>0?i*(t.height/t.width):X(e.getAttribute(`height`))??i*.75;return i>677&&(a=677/i*a,i=677),{width:Math.max(1,Math.round(i)),height:Math.max(1,Math.round(a))}}function hr(e){let t=mr(e);return e.hasAttribute(`xmlns`)||e.setAttribute(`xmlns`,G),e.setAttribute(`width`,String(t.width)),e.setAttribute(`height`,String(t.height)),e.setAttribute(`preserveAspectRatio`,`xMidYMid meet`),t}function gr(e){let t=e.getBoundingClientRect(),n=qn(e.getAttribute(`viewBox`)),r=X(e.getAttribute(`width`)),i=X(e.getAttribute(`height`)),a=t.width>0?t.width:r??n?.width??677,o=t.height>0?t.height:i??n?.height??a*.75;if(n&&n.width>0&&n.height>0){let e=n.height/n.width;t.width<=0&&!r?(a=n.width,o=n.height):Math.abs(o/a-e)>.01&&(o=a*e)}return a>677&&(o=677/a*o,a=677),{width:Math.max(1,Math.round(a)),height:Math.max(1,Math.round(o))}}function _r(e){let{width:t,height:n}=gr(e);e.hasAttribute(`xmlns`)||e.setAttribute(`xmlns`,G),e.setAttribute(`width`,String(t)),e.setAttribute(`height`,String(n))}var vr=9,yr={alphabetic:``,central:`0.35em`,middle:`0.35em`,hanging:`-0.55em`,ideographic:`0.18em`,"text-before-edge":`-0.85em`,"text-after-edge":`0.15em`};function br(e){e.querySelectorAll(`text, tspan`).forEach(e=>{let t=e.getAttribute(`dominant-baseline`);if(!t)return;e.removeAttribute(`dominant-baseline`);let n=yr[t];if(!n||e.getAttribute(`dy`))return;let r=Sr(e.getAttribute(`font-size`)||window.getComputedStyle(e).fontSize||`16`)?.n??16,i=Number.parseFloat(n);Number.isFinite(i)&&e.setAttribute(`dy`,String(Math.round(r*i*10)/10))})}function xr(e,t=!1){return t||e.closest(`.mermaid-diagram`)!=null}function Sr(e){let t=e.trim().match(/^(-?[\d.]+)(px|pt|em|rem|%)?$/i);if(!t)return null;let n=Number.parseFloat(t[1]);return!Number.isFinite(n)||n<=0?null:{n,unit:(t[2]||``).toLowerCase()}}function Cr(e){let t=Sr(e);if(!t||t.unit===`%`||t.unit===`em`||t.unit===`rem`)return null;let n=Math.max(vr,Math.round(t.n*10)/10);return t.unit?`${n}${t.unit}`:String(n)}function wr(e){return e.replace(/(^|;)\s*font-size\s*:\s*([^;]*)/gi,(e,t,n)=>{let r=Cr(n);return r?`${t} font-size: ${r}`:e})}function Tr(e){let t=e.innerHTML;if(/<br\s*\/?>/i.test(t))return t.split(/<br\s*\/?>/i).map(e=>e.replace(/<[^>]+>/g,``).replace(/&nbsp;/gi,` `).trim()).filter(Boolean);let n=(e.textContent||``).replace(/\u00A0/g,` `),r=n.split(/\n/).map(e=>e.trim()).filter(Boolean);if(r.length)return r;let i=n.replace(/\s+/g,` `).trim();return i?[i]:[]}function Er(e){if(!e)return{x:0,y:0};let t=e.match(/translate\(\s*([-\d.eE]+)(?:[\s,]+([-\d.eE]+))?\s*\)/);return t?{x:Number.parseFloat(t[1])||0,y:Number.parseFloat(t[2]||`0`)||0}:null}function Dr(e,t){let n=0;for(let r of e)n+=/[\u1100-\uD7FF\uF900-\uFAFF]/.test(r)?t:t*.55;return n}function Or(e){if(!e)return!0;let t=e.trim().toLowerCase();return t===``||t===`transparent`||t===`none`||/^rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)$/.test(t)}function kr(e){let t=(e.getAttribute(`style`)??``).match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i)?.[1]?.trim();if(t&&!Or(t)&&q(t))return t;try{let t=window.getComputedStyle(e).backgroundColor;if(t&&!Or(t)&&q(t))return t}catch{}return`#e8e8e8`}function Ar(e){let t=Array.from(e.querySelectorAll(`g.edgeLabel`));if(t.length<2)return;let n=t.map(e=>{let t=Er(e.getAttribute(`transform`))??{x:0,y:0},n=e.querySelector(`text`),r=Sr(n?.getAttribute(`font-size`)||`16`)?.n??16,i=e.querySelector(`rect`),a=Number.parseFloat(i?.getAttribute(`width`)??`0`)||0,o=(n?.textContent??``).replace(/\s+/g,` `).trim(),s=a>0?a:Math.max(16,Dr(o,r));return{el:e,x:t.x,y:t.y,halfW:s/2}});for(let e=0;e<n.length;e++)for(let t=e+1;t<n.length;t++){let r=n[e],i=n[t],a=i.x-r.x,o=i.y-r.y,s=Math.hypot(a,o),c=r.halfW+i.halfW+8;if(s>=c)continue;let l=1,u=0;s>=1&&(Math.abs(a)>=Math.abs(o)?(l=a/s,u=0):(l=0,u=o/s));let d=(c-s)/2;jr(r,-l*d,-u*d),jr(i,l*d,u*d)}}function jr(e,t,n){e.x+=t,e.y+=n;let r=e.el.getAttribute(`transform`)??``;if(/translate\(/.test(r)){e.el.setAttribute(`transform`,r.replace(/translate\(\s*([-\d.eE]+)(?:[\s,]+([-\d.eE]+))?\s*\)/,`translate(${Mr(e.x)}, ${Mr(e.y)})`));return}e.el.setAttribute(`transform`,`translate(${Mr(e.x)}, ${Mr(e.y)})${r?` ${r}`:``}`)}function Mr(e){return Math.round(e*10)/10}function Nr(e,t=!1){xr(e,t)&&(e.querySelectorAll(`foreignObject`).forEach(e=>{let t=Tr(e);if(t.length===0){e.remove();return}let n=Number.parseFloat(e.getAttribute(`x`)??`0`)||0,r=Number.parseFloat(e.getAttribute(`y`)??`0`)||0,i=Number.parseFloat(e.getAttribute(`width`)??`0`)||0,a=Number.parseFloat(e.getAttribute(`height`)??`0`)||0,o=e.querySelector(`[style], section, div, span, p`)??e,s=Un(o)||Y(o,`fill`)||window.getComputedStyle(o).color||`#333333`,c=Sr(Y(o,`font-size`)||window.getComputedStyle(o).fontSize||`16`)?.n??16,l=`${o.getAttribute(`style`)??``} ${window.getComputedStyle(o).textAlign}`,u=/center/i.test(l)&&i>0,d=e.closest(`.edgeLabel`)!=null,f=e.getAttribute(`transform`),p=document.createElementNS(G,`text`),m=u?n+i/2:n,h=r+(a>0?Math.min(c,a*.8):c*.8);p.setAttribute(`x`,String(m)),p.setAttribute(`y`,String(h)),p.setAttribute(`fill`,q(s)?s:`#333333`),p.setAttribute(`stroke`,`none`),p.setAttribute(`font-size`,String(c)),p.setAttribute(`text-anchor`,u?`middle`:`start`),t.length===1?p.textContent=t[0]:t.forEach((e,t)=>{let n=document.createElementNS(G,`tspan`);n.setAttribute(`x`,String(m)),n.setAttribute(`dy`,t===0?`0`:`1.2em`),n.setAttribute(`fill`,q(s)?s:`#333333`),n.textContent=e,p.appendChild(n)});let g=e.parentNode;if(!g){e.remove();return}let _=d&&i>0&&a>0;if(!f&&!_){g.replaceChild(p,e);return}let v=document.createElementNS(G,`g`);if(f&&v.setAttribute(`transform`,f),_){let e=document.createElementNS(G,`rect`);e.setAttribute(`x`,String(n)),e.setAttribute(`y`,String(r)),e.setAttribute(`width`,String(i)),e.setAttribute(`height`,String(a)),e.setAttribute(`fill`,kr(o)),e.setAttribute(`stroke`,`none`),v.appendChild(e)}v.appendChild(p),g.replaceChild(v,e)}),Ar(e))}function Pr(e,t=!1){xr(e,t)&&e.querySelectorAll(`text, tspan`).forEach(e=>{let t=e.getAttribute(`font-size`);if(t){let n=Cr(t);n&&e.setAttribute(`font-size`,n);return}let n=e.getAttribute(`style`);n&&/font-size/i.test(n)&&e.setAttribute(`style`,wr(n))})}function Fr(e){e.querySelectorAll(`[clip-path], [clipPath]`).forEach(e=>{e.removeAttribute(`clip-path`),e.removeAttribute(`clipPath`)}),e.querySelectorAll(`style`).forEach(e=>e.remove()),e.querySelectorAll(`defs`).forEach(e=>e.remove()),e.querySelectorAll(`linearGradient, radialGradient, filter, clipPath, mask, pattern, symbol`).forEach(e=>e.remove()),e.querySelectorAll(`*`).forEach(e=>{e.removeAttribute(`id`),e.removeAttribute(`class`)}),e.removeAttribute(`id`),e.removeAttribute(`class`)}function Ir(e,t){let n=Array.from(e.querySelectorAll(`svg`));if(n.length===0)return;let r=document.createElement(`div`);r.style.cssText=`position:fixed;left:-99999px;top:0;visibility:hidden;pointer-events:none;width:677px;`,document.body.appendChild(r);try{for(let e of n){if(Yn(e))continue;let n=e.parentElement,i=e.nextSibling,a=xr(e),o=Jn(e);r.appendChild(e),t(e,{mermaid:a,plantuml:o}),n&&n.insertBefore(e,i)}}finally{r.remove()}}function Lr(e){Ir(e,(e,{mermaid:t})=>{Bn(e),zn(e),Gn(e),Nr(e,t),br(e)})}function Rr(e,t){let n=t?.plantuml??Jn(e),r=t?.mermaid??xr(e);if(Pn(e),Bn(e),zn(e),Gn(e),Nr(e,r),Kn(e),ir(e),br(e),e.setAttribute(`overflow`,`visible`),e.querySelectorAll(`[style]`).forEach(e=>{let t=e.getAttribute(`style`);t&&/overflow\s*:\s*hidden/i.test(t)&&e.setAttribute(`style`,t.replace(/overflow\s*:\s*hidden/gi,`overflow: visible`))}),n){or(e);let t=ur(e);t.width<=677&&cr(e,t.width,t.height)}else r?(hr(e),Pr(e,!0)):_r(e);Fr(e)}function zr(e){let t=[];Ir(e,(e,{mermaid:n,plantuml:r})=>{Rr(e,{plantuml:r,mermaid:n}),r&&t.push(e)});for(let e of t){let t=e.closest(`.plantuml-diagram`);t&&dr(t),fr(e)}}var Br={inlinePseudoElements:!0,preserveImportant:!0,resolveCSSVariables:!1};async function Vr(e){let{default:t}=await v(async()=>{let{default:e}=await import(`./md-client-opt-AQ5m.js`);return{default:e}},__vite__mapDeps([29,1,28,30,31])),n=ln(e),r=[()=>t(n,Br),()=>t(n,{...Br,inlinePseudoElements:!1}),()=>t(un(n),{...Br,inlinePseudoElements:!1})];for(let e of r)try{return e()}catch(e){console.warn(`WeChat copy: juice failed, trying fallback`,e)}return n}async function Hr(e){let t=document.getElementById(`output`);if(!t)return{html:``,plainText:``,hasPendingAsyncContent:!1};let n=Zt(),r=mt(),i=Xt(),a=Ei(),o=r.getContent(),s=`light`,c=a.isDark;c&&n.render(o,{themeMode:s,force:!0});let l=await V(void 0,{themeMode:s});try{let n=t.cloneNode(!0);pt(n),Lr(n);let r=await xn();r&&(n.innerHTML=r+n.innerHTML),cn(n),n.innerHTML=fn(await Vr(n.innerHTML)),n.querySelectorAll(`a[href^="#"]`).forEach(e=>e.removeAttribute(`href`)),n.innerHTML=n.innerHTML.replace(/([^-])top:(.*?)em/g,`$1transform: translateY($2em)`).replace(/hsl\(var\(--foreground\)\)/g,`#3f3f3f`).replace(/var\(--blockquote-background\)/g,`#f7f7f7`).replace(/var\(--md-primary-color\)/g,e).replace(/var\(--md-font-family\)/g,i.fontFamily).replace(/var\(--md-font-size\)/g,i.fontSize).replace(/--md-primary-color:.+?;/g,``).replace(/--md-font-family:.+?;/g,``).replace(/--md-font-size:.+?;/g,``).replace(/<span class="nodeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g,`<span class="nodeLabel"$1>$2</span>`).replace(/<span class="edgeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g,`<span class="edgeLabel"$1>$2</span>`),dn(n);let a=pn(),o=pn();return n.insertBefore(a,n.firstChild),n.appendChild(o),mn(n),zr(n),nr(n),{html:n.innerHTML,plainText:n.textContent||``,hasPendingAsyncContent:!l}}finally{c&&n.render(o,{themeMode:`dark`,force:!0})}}var Z=`[data-png-export-host]`,Ur=`png-export-root`;function Q(e,t){for(let[n,r]of Object.entries(t))e.style.setProperty(n,r,`important`)}function Wr(e){let t=e.getAttribute(`style`)??``;return/overflow(?:-x)?:\s*(?:auto|scroll)/.test(t)}function Gr(e){Q(e,{width:`100%`,maxWidth:`100%`,tableLayout:`fixed`}),e.querySelectorAll(`th, td`).forEach(e=>{Q(e,{wordBreak:`break-word`,whiteSpace:`normal`,overflowWrap:`anywhere`})})}function Kr(e){e.querySelectorAll(`.code-scroll`).forEach(e=>{Q(e,{overflow:`visible`}),e.querySelectorAll(`div`).forEach(e=>{Q(e,{whiteSpace:`pre-wrap`,wordBreak:`break-all`,minWidth:`auto`,maxWidth:`100%`})})}),e.querySelectorAll(`pre.code__pre, .hljs.code__pre`).forEach(e=>{Q(e,{overflow:`visible`})}),e.querySelectorAll(`pre.code__pre > code, .hljs.code__pre > code`).forEach(e=>{Q(e,{overflow:`visible`,whiteSpace:`pre-wrap`,wordBreak:`break-all`,minWidth:`auto`,maxWidth:`100%`})}),e.querySelectorAll(`pre section, code section`).forEach(e=>{Q(e,{overflow:`visible`})})}function qr(e){e.querySelectorAll(`table.preview-table`).forEach(e=>{let t=e.parentElement;t?.tagName===`SECTION`&&Q(t,{overflow:`visible`,maxWidth:`100%`}),Gr(e)}),e.querySelectorAll(`section`).forEach(e=>{!Wr(e)||!e.querySelector(`table`)||(Q(e,{overflow:`visible`}),e.querySelectorAll(`table`).forEach(Gr))}),Kr(e)}function Jr(e,t){return e.split(`
`).map(e=>{let n=e.trimStart();if(!n||n.startsWith(`/*`))return e;let r=n.match(/^([^{]+)\{/);if(!r)return e;let i=r[1].trim(),a=i.split(`,`).map(e=>`${t} ${e.trim()}`).join(`, `);return e.replace(i,a)}).join(`
`)}function Yr(e){let t=`${Z} .${Ur}`,n=e;return n=n.replace(/#output\s*\{/g,`${t} {`),n=n.replace(/#output\s+/g,`${t} `),n=n.replace(/^#output\s*/gm,`${t} `),n}var Xr=`
  section:has(> table.preview-table) { overflow: visible !important; }
  table.preview-table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; }
  table.preview-table th, table.preview-table td { word-break: break-word !important; white-space: normal !important; overflow-wrap: anywhere !important; }
  section[style*="overflow-x: auto"], section[style*="overflow: auto"] { overflow: visible !important; }
  section[style*="overflow-x: auto"] table, section[style*="overflow: auto"] table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; }
  section[style*="overflow-x: auto"] th, section[style*="overflow-x: auto"] td, section[style*="overflow: auto"] th, section[style*="overflow: auto"] td { word-break: break-word !important; white-space: normal !important; overflow-wrap: anywhere !important; }
  pre.code__pre, .hljs.code__pre, pre.code__pre > code, .hljs.code__pre > code, .code-scroll, pre section, code section { overflow: visible !important; }
  pre.code__pre > code, .code-scroll, .code-scroll > div { white-space: pre-wrap !important; word-break: break-all !important; min-width: auto !important; max-width: 100% !important; }
`,Zr=Xr.trim();function Qr(e){return Jr(Xr,e).trim()}function $r(){return document.documentElement.classList.contains(`dark`)&&document.getElementById(`output-wrapper`)?.classList.contains(`output_night`)?`#191919`:`#fff`}var ei=`
  ${Z} .preview {
    position: relative;
    margin: 0 auto;
    padding: 20px;
    font-size: 14px;
    box-sizing: border-box;
    word-wrap: break-word;
  }

  ${Z} .preview table {
    margin-bottom: 10px;
    border-collapse: collapse;
    display: table;
    min-width: 100%;
  }
`;async function ti(){let e=document.querySelector(`#md-theme`);if(!e?.textContent)return``;let t=document.documentElement.classList.contains(`dark`),n=[`<style>${t?`${Z} { --foreground: 0 0% 98%; --blockquote-background: #212121; }`:`${Z} { --foreground: 0 0% 3.9%; --blockquote-background: #f7f7f7; }`}</style>`,`<style>${ei}</style>`,`<style>${Yr(e.textContent)}</style>`,`<style>${Qr(Z)}</style>`],r=document.querySelector(`#hljs`);if(r)try{let e=await(await fetch(r.href)).text();n.push(`<style>@scope (${Z}) { ${e} }</style>`)}catch{}return t&&document.getElementById(`output-wrapper`)?.classList.contains(`output_night`)&&n.push(`<style>${Z} .output_night .preview { background-color: #191919; }</style>`),n.join(``)}function ni(e){let t=document.querySelector(`#output`);if(!t)return``;let n=t.cloneNode(!0);return n.querySelectorAll(`.diagram-download-bar`).forEach(e=>e.remove()),Ie(n,e?.themeMode?{themeMode:e.themeMode}:void 0),e?.staticLayout&&qr(n),n.innerHTML}async function ri(e=`untitled`){await V();let t=ni({staticLayout:!0}),n=await xn();B(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${z(e)}</title>
  <style>${hn}</style>
  ${n}
  <style>${Zr}</style>
</head>
<body>
  <div style="width: 750px; margin: auto; padding: 20px;">
    ${t}
  </div>
</body>
</html>`,`${z(e)}.html`,`text/html`)}async function ii(e,t=`untitled`){let n=z(t);B(await Fe(e),`${n}.html`,`text/html`)}var $={showPageNumbers:!0,pageNumberFormat:`nOfM`,pageNumberPosition:`bottomRight`,showTitleHeader:!0,showSiteFooter:!0,margins:`default`},ai=new Set([`nOfM`,`n`]),oi=new Set([`bottomLeft`,`bottomCenter`,`bottomRight`]),si=new Set([`compact`,`default`,`comfortable`]),ci={compact:`1cm`,default:`1.5cm 1cm 2cm 1cm`,comfortable:`2cm 1.5cm 2.5cm 1.5cm`},li=`0.5cm`,ui=`https://md.doocs.org`;function di(e=window.location){return e.protocol===`http:`||e.protocol===`https:`?e.origin:ui}function fi(e){return e.replace(/\\/g,`\\\\`).replace(/"/g,`\\"`)}var pi={bottomLeft:`@bottom-left`,bottomCenter:`@bottom-center`,bottomRight:`@bottom-right`},mi=[`@bottom-left`,`@bottom-center`,`@bottom-right`],hi=[`@top-left-corner`,`@top-left`,`@top-center`,`@top-right`,`@top-right-corner`,`@bottom-left-corner`,`@bottom-left`,`@bottom-center`,`@bottom-right`,`@bottom-right-corner`,`@left-top`,`@left-middle`,`@left-bottom`,`@right-top`,`@right-middle`,`@right-bottom`];function gi(e){let t=ci[e].trim().split(/\s+/);return t.length===1?{top:t[0],right:t[0],bottom:t[0],left:t[0]}:t.length===2?{top:t[0],right:t[1],bottom:t[0],left:t[1]}:t.length===3?{top:t[0],right:t[1],bottom:t[2],left:t[1]}:{top:t[0],right:t[1],bottom:t[2],left:t[3]}}function _i({top:e,right:t,bottom:n,left:r}){return e===t&&t===n&&n===r?e:e===n&&t===r?`${e} ${t}`:`${e} ${t} ${n} ${r}`}function vi(e,t,n=``){return`
      ${e} {
        content: ${t};${n}
      }`}function yi(e,t){return vi(e,`""`,t?`
        width: 0;
        max-width: 0;
        padding: 0;
        margin: 0;
        overflow: hidden;`:``)}function bi(e){for(let t of mi)if(t!==e)return t;return null}function xi(e){let t=e??{};return{showPageNumbers:typeof t.showPageNumbers==`boolean`?t.showPageNumbers:$.showPageNumbers,pageNumberFormat:ai.has(t.pageNumberFormat)?t.pageNumberFormat:$.pageNumberFormat,pageNumberPosition:oi.has(t.pageNumberPosition)?t.pageNumberPosition:$.pageNumberPosition,showTitleHeader:typeof t.showTitleHeader==`boolean`?t.showTitleHeader:$.showTitleHeader,showSiteFooter:typeof t.showSiteFooter==`boolean`?t.showSiteFooter:$.showSiteFooter,margins:si.has(t.margins)?t.margins:$.margins}}function Si(e,t,n=di()){let r=xi(e),i=z(t),o=fi(n),s=gi(r.margins),c=r.showPageNumbers?pi[r.pageNumberPosition]:null,l=r.showSiteFooter?bi(c):null,u=r.showTitleHeader,d=!!(c||l),f=s.left,p={top:u?s.top:f,right:s.right,bottom:d?s.bottom:f,left:s.left},m=new Map;if(r.showTitleHeader&&m.set(`@top-center`,vi(`@top-center`,`"${i}"`,`
        font-size: 12px;
        color: #666;
        vertical-align: bottom;
        padding-bottom: ${li};`)),l&&m.set(l,vi(l,`"${o}"`,`
        font-size: 10px;
        color: #999;
        vertical-align: top;
        padding-top: ${li};
        white-space: nowrap;`)),r.showPageNumbers&&c){let e=r.pageNumberFormat===`n`?a(`store.pdf.pageFooterN`):a(`store.pdf.pageFooter`);m.set(c,vi(c,`"${e}"`,`
        font-size: 10px;
        color: #999;
        vertical-align: top;
        padding-top: ${li};
        white-space: nowrap;`))}let h=hi.map(e=>m.get(e)||yi(e,mi.includes(e)&&!!(l||c)));return`
    @page {
      margin: ${_i(p)};${h.join(``)}
    }

    html, body {
      margin: 0;
    }`}async function Ci(e=`untitled`,t){await V();let n=ni({staticLayout:!0}),r=await xn(),i=`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${z(e)}</title>
  <style>${hn}</style>
  ${r}
  <style>${Zr}</style>
  <style>
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    ${Si(xi(t),e,di())}
  </style>
</head>
<body>
  <div style="width: 100%; max-width: 750px; margin: auto;">
    ${n}
  </div>
</body>
</html>`,a=new Blob([i],{type:`text/html`}),o=URL.createObjectURL(a),s=document.createElement(`iframe`);s.style.cssText=`position:fixed;width:0;height:0;top:-9999px;left:-9999px;border:none;`,s.src=o,document.body.appendChild(s);let c=()=>{URL.revokeObjectURL(o),s.parentNode&&document.body.removeChild(s)};s.onload=()=>{s.contentWindow?.focus(),s.contentWindow?.print(),setTimeout(c,500)},s.onerror=()=>{c()},setTimeout(c,5e3)}async function wi(e){let t=document.getElementById(`output`);if(!t)return null;let n=document.documentElement.classList.contains(`dark`)&&document.getElementById(`output-wrapper`)?.classList.contains(`output_night`),r=e===`mobile`?`375px`:`750px`,i=document.createElement(`div`);i.setAttribute(`data-png-export-host`,``),i.style.cssText=`position:fixed;left:-99999px;top:0;z-index:-1;visibility:visible;pointer-events:none;`,i.innerHTML=await ti();let a=document.createElement(`div`);a.className=n?`output_night`:``,a.style.width=r;let o=document.createElement(`div`);o.className=`preview border-x shadow-xl mx-auto`,o.style.width=r,o.style.margin=`0`;let s=t.cloneNode(!0);return s.removeAttribute(`id`),s.classList.add(Ur),s.style.width=`100%`,s.querySelectorAll(`.diagram-download-bar`).forEach(e=>e.remove()),pt(s),qr(s),o.appendChild(s),a.appendChild(o),i.appendChild(a),document.body.appendChild(i),{el:o,cleanup:()=>i.remove()}}async function Ti(e=`untitled`,t){await V();let n=await wi(t.previewDevice);if(n)try{await ot(100);let{toPng:t}=await v(async()=>{let{toPng:e}=await import(`./md-es-BOAyukm3.js`);return{toPng:e}},[]);B(await t(n.el,{backgroundColor:$r(),skipFonts:!0,pixelRatio:Math.max(window.devicePixelRatio||1,2),style:{margin:`0`}}),`${z(e)}.png`,`image/png`)}finally{n.cleanup()}}var Ei=h(`ui`,()=>{let t=Ae(),r=j(t),i=n.reactive(`showAIToolbox`,!0),a=j(i),o=n.reactive(`hasShownAIToolboxHint`,!1),s=n.reactive(e(`is_open_right_slider`),!1),c=n.reactive(e(`is_open_post_slider`),!1),l=n.reactive(e(`is_open_folder_panel`),!1),f=n.reactive(`isMobile`,!1),m=n.reactive(`viewMode`,`split`);function h(e){m.value=e}let g=n.reactive(`previewDevice`,`mobile`);function _(e){g.value=e}function v(){g.value=g.value===`desktop`?`mobile`:`desktop`}let y=n.reactive(e(`enableImageReupload`),!1),b=j(y),x=n.reactive(e(`enableScrollSync`),!0),ee=j(x),te=n.reactive(e(`copyMode`),`txt`),S=n.reactive(`isShowCssEditor`,!1),ne=j(S),re=p(!1);function ie(){re.value=!0}function ae(){re.value=!1}let oe=p(!1),se=j(oe),C=p(!1),w=p(``),T=p(!0),E=p(null);function ce(e={}){w.value=e.value??``,T.value=e.displayMode??!0,E.value=e.sourceRaw??null,C.value=!0}function le(){C.value=!1,w.value=``,T.value=!0,E.value=null}let ue=p(!1),de=j(ue),fe=p(null),D=p(!1),pe=j(D),me=p(null),he=p(!1),ge=j(he),_e=p(!1),ve=j(_e),ye=p(!1),be=p(`theme`),xe=p(`discover`);function Se(e){e?.tab,be.value=`theme`,xe.value=e?.view??`discover`,ye.value=!0}let Ce=p(!1),O=j(Ce),we=p(!1),Te=j(we),Ee=p(!1),k=p(`create`);function De(e){k.value=e?.tab??`create`,Ee.value=!0}let Oe=p(!1),A=n.reactive(`pdfExportOptions`,{...$});function ke(){A.value=xi(A.value),Oe.value=!0}let je=p(!1),Me=j(je),Ne=p(!1),Pe=j(Ne),Fe=p(!1),Ie=j(Fe),Le=p(!1),Re=j(Le),ze=p(!1),Be=j(ze),Ve=p(!1),He=j(Ve),Ue=p(!1),M=j(Ue),We=p(null);function Ge(e){We.value=e,_e.value=!0}let N=p(!1),P=p(!1);function Ke(e){N.value=e??!N.value}function qe(e){P.value=e??!P.value}let F=p(null);function Je(e=``,t=!1){F.value={word:e,showReplace:t}}function Ye(){F.value=null}let Xe=p(0);function Ze(){Xe.value++}let I=!1;function L(){let e=f.value;f.value=window.innerWidth<=768,!e&&f.value&&m.value===`split`?(m.value=`edit`,I=!0):e&&!f.value&&I&&(m.value=`split`,I=!1)}return d(()=>{L(),window.addEventListener(`resize`,L)}),u(()=>{window.removeEventListener(`resize`,L)}),{isDark:t,showAIToolbox:i,hasShownAIToolboxHint:o,isOpenRightSlider:s,isOpenPostSlider:c,isMobile:f,viewMode:m,previewDevice:g,isOpenFolderPanel:l,enableImageReupload:y,enableScrollSync:x,copyMode:te,isShowCssEditor:S,toggleShowCssEditor:ne,isShowTableEditDialog:re,openTableEditDialog:ie,closeTableEditDialog:ae,isShowUploadImgDialog:oe,toggleShowUploadImgDialog:se,isShowFormulaEditorDialog:C,formulaEditorValue:w,formulaEditorDisplayMode:T,formulaEditorSourceRaw:E,openFormulaEditor:ce,closeFormulaEditor:le,isShowImportMdDialog:ue,toggleShowImportMdDialog:de,importMdOpenUrl:fe,isShowLocalImageUpload:D,toggleShowLocalImageUpload:pe,localImageUploadData:me,isShowTemplateDialog:he,toggleShowTemplateDialog:ge,isShowComponentDialog:_e,toggleShowComponentDialog:ve,isShowMarketplaceDialog:ye,marketplaceDialogTab:be,marketplaceDialogView:xe,openMarketplaceDialog:Se,isShowSyncDialog:Ce,toggleShowSyncDialog:O,isShowAccountDialog:we,toggleShowAccountDialog:Te,isShowShareDialog:Ee,shareDialogInitialTab:k,openShareDialog:De,isShowPdfExportDialog:Oe,openPdfExportDialog:ke,pdfExportOptions:A,isShowAboutDialog:je,toggleShowAboutDialog:Me,isShowFundDialog:Ne,toggleShowFundDialog:Pe,isShowMarkdownHelpDialog:Fe,toggleShowMarkdownHelpDialog:Ie,isShowEditorStateDialog:Le,toggleShowEditorStateDialog:Re,isShowPreferencesDialog:ze,toggleShowPreferencesDialog:Be,isShowKeyboardShortcutsDialog:Ve,toggleShowKeyboardShortcutsDialog:He,isShowCommandPalette:Ue,toggleShowCommandPalette:M,componentDialogTarget:We,openComponentDialogWithTarget:Ge,aiDialogVisible:N,toggleAIDialog:Ke,aiImageDialogVisible:P,toggleAIImageDialog:qe,searchTabRequest:F,openSearchTab:Je,clearSearchTabRequest:Ye,goToLineRequest:Xe,requestGoToLine:Ze,toggleDark:r,toggleAIToolbox:a,toggleImageReupload:b,toggleScrollSync:ee,setViewMode:h,setPreviewDevice:_,togglePreviewDevice:v}});export{wt as A,ot as B,Ft as C,It as D,Lt as E,yt as F,Qe as G,at as H,bt as I,P as J,R as K,mt as L,St as M,gt as N,Dt as O,xt as P,pt as R,jt as S,Pt as T,it as U,B as V,z as W,U as _,di as a,Nt as b,ni as c,_n as d,Zt as f,Ht as g,Kt as h,xi as i,Ct as j,Et as k,Hr as l,Yt as m,Ti as n,ri as o,Xt as p,Ke as q,Ci as r,ii as s,Ei as t,bn as u,Ot as v,At as w,kt as x,Mt as y,V as z};