const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["static/js/md-formatDoc-CxaqOHUh.js","static/js/md-rolldown-runtime-hePW80VL.js","static/js/md-preload-helper-DHWoSnHi.js","static/js/md-dist-CDcC_7ui.js","static/js/md-codemirror-B2b9ijeR.js","static/js/md-dist-BZpk8EJK.js","static/js/md-dist-Byf1oATn.js","static/js/md-dist-BLiqTaJ2.js","static/js/md-dist-DaAVZuTA.js","static/js/md-dist-CiDLIzqT.js","static/js/md-dist-DHsEV9Bw.js","static/js/md-dist-BUJ-fYZ3.js","static/js/md-dist-CpMGAJoz.js","static/js/md-dist-BK0drD6K.js","static/js/md-browser-C7tAaLTR.js","static/js/md-marketplace-DJ3tz7k7.js","static/js/md-storage-D_VMnT-q.js","static/js/md-translate-CrTPpMfq.js","static/js/md-vue-i18n-siXKw2sM.js","static/js/md-vendor_vue-Ddj_qEtE.js","static/js/md-v4-DDdyfk2q.js","static/js/md-lib-DtLk57BH.js","static/js/md-oauth-Cl0NuIxb.js","static/js/md-auth-DymtBW_x.js","static/js/md-extensions-DKb5nrXG.js","static/js/md-highlight-Di-PN6AM.js","static/js/md-purify.es-CYRiAeUx.js","static/js/md-renderer-DMUJWyz3.js","static/js/md-decode-nKwzHfeR.js","static/js/md-client-opt-AQ5m.js","static/js/md-postcss-_CUsAFxq.js","static/js/md-__vite-browser-external-Gk1ta6_d.js"])))=>i.map(i=>d[i]);
import{f as e,p as t,u as n}from"./md-storage-D_VMnT-q.js";import{b as r,k as i,n as a,r as o,x as s}from"./md-translate-CrTPpMfq.js";import{$ as c,I as l,L as u,R as d,dt as f,lt as p,n as m,pt as h,v as g,z as _}from"./md-vendor_vue-Ddj_qEtE.js";import{t as v}from"./md-preload-helper-DHWoSnHi.js";import{n as y}from"./md-lib-DtLk57BH.js";import{B as b,C as x,D as S,E as C,F as w,G as T,J as E,L as ee,O as te,S as ne,T as re,U as D,Y as ie,_ as O,a as ae,at as oe,b as se,ct as ce,dt as le,ft as ue,g as de,gt as fe,ht as k,i as pe,it as me,j as he,k as ge,lt as _e,mt as ve,n as ye,ot as be,pt as xe,rt as A,st as Se,t as Ce,u as we,ut as j,v as Te,w as Ee,x as M,y as De}from"./md-codemirror-B2b9ijeR.js";import{D as N,a as Oe}from"./md-vendor_vueuse-DgOGDZhu.js";import{C as ke,M as Ae,N as je,c as Me,f as P,j as Ne,p as Pe,v as Fe,w as Ie}from"./md-extensions-DKb5nrXG.js";function Le(e){let t=new Map;for(let n of e.matchAll(/--([\w-]+)\s*:\s*([^;}\n]+)/g))t.set(`--${n[1]}`,n[2].trim());return t}function Re(e){let t=Le(e),n=/var\(\s*(--[\w-]+)\s*(?:,([^()]*(?:\([^()]*\)[^()]*)*))?\)/g,r=e,i=``,a=0;for(;r!==i&&a<10;)i=r,r=r.replace(n,(e,n,r)=>{let i=t.get(n);return i===void 0?r?r.trim():`var(${n})`:i}),a++;let o=/calc\(([^()]+)\)/g;for(i=``,a=0;r!==i&&a<10;)i=r,r=r.replace(o,(e,t)=>Ve(t.trim())),a++;return r}var ze=`px|em|rem|vw|vh|vmin|vmax|%|pt|pc|cm|mm|in|ex|ch`,Be=`(-?[\\d.]+)`,F=`(-?[\\d.]+)(${ze})?`;function Ve(e){let t=e.match(RegExp(`^${F}\\s*\\*\\s*${F}$`));if(t){let[,e,n,r,i]=t;if(!n!=!i){let t=n||i;return`${He(Number.parseFloat(e)*Number.parseFloat(r))}${t}`}}let n=e.match(RegExp(`^${F}\\s*/\\s*${Be}$`));if(n){let[,e,t,,r]=n;return`${He(Number.parseFloat(e)/Number.parseFloat(r))}${t??``}`}let r=e.match(RegExp(`^${F}\\s*([+-])\\s*${F}$`));if(r){let[,e,t,n,i,a]=r;if(t===a)return`${He(n===`+`?Number.parseFloat(e)+Number.parseFloat(i):Number.parseFloat(e)-Number.parseFloat(i))}${t??``}`}return`calc(${e})`}function He(e){return Math.round(e*1e4)/1e4}var I={blockquote_note:`markdown-alert-note`,blockquote_tip:`markdown-alert-tip`,blockquote_info:`markdown-alert-info`,blockquote_important:`markdown-alert-important`,blockquote_warning:`markdown-alert-warning`,blockquote_caution:`markdown-alert-caution`,blockquote_abstract:`markdown-alert-abstract`,blockquote_summary:`markdown-alert-summary`,blockquote_tldr:`markdown-alert-tldr`,blockquote_todo:`markdown-alert-todo`,blockquote_success:`markdown-alert-success`,blockquote_done:`markdown-alert-done`,blockquote_question:`markdown-alert-question`,blockquote_help:`markdown-alert-help`,blockquote_faq:`markdown-alert-faq`,blockquote_failure:`markdown-alert-failure`,blockquote_fail:`markdown-alert-fail`,blockquote_missing:`markdown-alert-missing`,blockquote_danger:`markdown-alert-danger`,blockquote_error:`markdown-alert-error`,blockquote_bug:`markdown-alert-bug`,blockquote_example:`markdown-alert-example`,blockquote_quote:`markdown-alert-quote`,blockquote_cite:`markdown-alert-cite`,blockquote_title:`alert-title`,blockquote_title_note:`alert-title-note`,blockquote_title_tip:`alert-title-tip`,blockquote_title_info:`alert-title-info`,blockquote_title_important:`alert-title-important`,blockquote_title_warning:`alert-title-warning`,blockquote_title_caution:`alert-title-caution`,blockquote_title_abstract:`alert-title-abstract`,blockquote_title_summary:`alert-title-summary`,blockquote_title_tldr:`alert-title-tldr`,blockquote_title_todo:`alert-title-todo`,blockquote_title_success:`alert-title-success`,blockquote_title_done:`alert-title-done`,blockquote_title_question:`alert-title-question`,blockquote_title_help:`alert-title-help`,blockquote_title_faq:`alert-title-faq`,blockquote_title_failure:`alert-title-failure`,blockquote_title_fail:`alert-title-fail`,blockquote_title_missing:`alert-title-missing`,blockquote_title_danger:`alert-title-danger`,blockquote_title_error:`alert-title-error`,blockquote_title_bug:`alert-title-bug`,blockquote_title_example:`alert-title-example`,blockquote_title_quote:`alert-title-quote`,blockquote_title_cite:`alert-title-cite`,blockquote_p:`alert-content`,blockquote_p_note:`alert-content-note`,blockquote_p_tip:`alert-content-tip`,blockquote_p_info:`alert-content-info`,blockquote_p_important:`alert-content-important`,blockquote_p_warning:`alert-content-warning`,blockquote_p_caution:`alert-content-caution`,blockquote_p_abstract:`alert-content-abstract`,blockquote_p_summary:`alert-content-summary`,blockquote_p_tldr:`alert-content-tldr`,blockquote_p_todo:`alert-content-todo`,blockquote_p_success:`alert-content-success`,blockquote_p_done:`alert-content-done`,blockquote_p_question:`alert-content-question`,blockquote_p_help:`alert-content-help`,blockquote_p_faq:`alert-content-faq`,blockquote_p_failure:`alert-content-failure`,blockquote_p_fail:`alert-content-fail`,blockquote_p_missing:`alert-content-missing`,blockquote_p_danger:`alert-content-danger`,blockquote_p_error:`alert-content-error`,blockquote_p_bug:`alert-content-bug`,blockquote_p_example:`alert-content-example`,blockquote_p_quote:`alert-content-quote`,blockquote_p_cite:`alert-content-cite`,code_pre:`code-block`,codespan:`code-inline`,inline_katex:`katex-inline`,block_katex:`katex-block`,markup_highlight:`markup-highlight`,markup_underline:`markup-underline`,markup_wavyline:`markup-wavyline`,markup_superscript:`markup-superscript`,listitem:`listitem`};function L(e,t=`#output`){return e.replace(/([^{}]+)\{([^}]*)\}/g,(e,n,r)=>{let i=n.trim();return i.startsWith(`@`)||i.startsWith(`:root`)?e:`${n.split(`,`).map(e=>{let n=e.trim();if(n.startsWith(t)||!n)return n;n=n.replace(/\.md-container\b/g,`.container`);let r=n.split(/[\s>+~:[]/,1)[0].trim();return r&&I[r]&&(n=n.replace(r,`.${I[r]}`)),n.match(/^(h[1-6])(\s|$|::|[:[])/)?`${t} section ${n}`:`${t} ${n}`}).filter(Boolean).join(`,
`)} {${r}}`})}var Ue=`1.75`,We=`1`,Ge=`#576b95`,Ke=`default`;function qe(e){let t=e.blockquoteBackground&&e.blockquoteBackground!==Ke?`\n  --md-blockquote-background: ${e.blockquoteBackground};`:``;return`
:root {
  /* Theme config */
  --md-primary-color: ${e.primaryColor};
  --md-font-family: ${e.fontFamily};
  --md-font-size: ${e.fontSize};
  --md-line-height: ${e.lineHeight||Ue};
  --md-block-spacing: ${e.blockSpacing||We};
  --md-link-color: ${e.linkColor||Ge};${t}
}

/* Paragraph indent & justify */
#output p {
  ${e.isUseIndent?`text-indent: 2em;`:``}
  ${e.isUseJustify?`text-align: justify;`:``}
}
  `.trim()}function Je(e){return Ye(e.headingStyles)}function Ye(e){if(!e)return``;let t=[`h1`,`h2`,`h3`,`h4`,`h5`,`h6`],n=[];for(let r of t){let t=e[r];t&&t!=="default"&&t!==`custom`&&n.push(Xe(r,t))}return n.join(`

`)}function Xe(e,t){let n=`
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
}`;default:return``}}var Ze=`/**
 * MD base theme styles
 * Base element styles and CSS variable definitions
 */

/* ==================== Container ==================== */
section,
#output .container {
  font-family: var(--md-font-family);
  font-size: var(--md-font-size);
  line-height: var(--md-line-height);
  text-align: left;
}

#output {
  font-family: var(--md-font-family);
  font-size: var(--md-font-size);
  line-height: var(--md-line-height);
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
`,Qe=`/**
 * MD default theme (classic).
 * Format with Alt/Option + Shift + F.
 * Use var(--md-primary-color) for theme color instead of hard-coded values.
 * Vertical block margins are scaled by var(--md-block-spacing) so the theme's
 * own rhythm is preserved while the user tightens or loosens the whole page.
 */

/* ==================== H1 ==================== */
h1 {
  display: table;
  padding: 0 1em;
  border-bottom: 2px solid var(--md-primary-color);
  margin: calc(2em * var(--md-block-spacing)) auto calc(1em * var(--md-block-spacing));
  color: hsl(var(--foreground));
  font-size: calc(var(--md-font-size) * 1.2);
  font-weight: bold;
  text-align: center;
}

/* ==================== H2 ==================== */
h2 {
  display: table;
  padding: 0 0.2em;
  margin: calc(4em * var(--md-block-spacing)) auto calc(2em * var(--md-block-spacing));
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
  margin: calc(2em * var(--md-block-spacing)) 8px calc(0.75em * var(--md-block-spacing)) 0;
  color: hsl(var(--foreground));
  font-size: calc(var(--md-font-size) * 1.1);
  font-weight: bold;
  line-height: 1.2;
}

/* ==================== H4 ==================== */
h4 {
  margin: calc(2em * var(--md-block-spacing)) 8px calc(0.5em * var(--md-block-spacing));
  color: var(--md-primary-color);
  font-size: calc(var(--md-font-size) * 1);
  font-weight: bold;
}

/* ==================== H5 ==================== */
h5 {
  margin: calc(1.5em * var(--md-block-spacing)) 8px calc(0.5em * var(--md-block-spacing));
  color: var(--md-primary-color);
  font-size: calc(var(--md-font-size) * 1);
  font-weight: bold;
}

/* ==================== H6 ==================== */
h6 {
  margin: calc(1.5em * var(--md-block-spacing)) 8px calc(0.5em * var(--md-block-spacing));
  font-size: calc(var(--md-font-size) * 1);
  color: var(--md-primary-color);
}

/* ==================== Paragraph ==================== */
p {
  margin: calc(1.5em * var(--md-block-spacing)) 8px;
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
  background: var(--md-blockquote-background, var(--blockquote-background));
  margin-bottom: calc(1em * var(--md-block-spacing));
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
  margin: calc(10px * var(--md-block-spacing)) 8px;
}

/* ==================== Images ==================== */
img {
  display: block;
  max-width: 100%;
  margin: calc(0.1em * var(--md-block-spacing)) auto calc(0.5em * var(--md-block-spacing));
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
  margin: calc(0.2em * var(--md-block-spacing)) 8px;
  color: hsl(var(--foreground));
}

/* Footnotes */
/* footnotes rendered as <p> in buildFootnotes() */
p.footnotes {
  margin: calc(0.5em * var(--md-block-spacing)) 8px;
  font-size: 80%;
  color: hsl(var(--foreground));
}

/* Diagrams */
figure {
  margin: calc(1.5em * var(--md-block-spacing)) 8px;
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
  margin: calc(1.5em * var(--md-block-spacing)) 0;
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
  color: var(--md-link-color);
  text-decoration: none;
}

/* ==================== Bold ==================== */
strong {
  color: var(--md-primary-color);
  font-weight: bold;
  font-size: inherit;
}

/* ==================== Strikethrough ==================== */
.del {
  color: color-mix(in srgb, hsl(var(--foreground)) 55%, transparent);
  text-decoration: line-through;
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

/* line-height: 0 keeps the raised glyph from stretching the line box */
.markup-superscript {
  font-size: 0.75em;
  line-height: 0;
  vertical-align: super;
}
`,$e=`/**
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
  background: var(--md-blockquote-background, transparent);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: calc(1em * var(--md-block-spacing));
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
  margin: calc(0.5em * var(--md-block-spacing)) 8px;
}

/* Horizontal rules */
hr {
  height: 1px;
  border: none;
  margin: calc(2em * var(--md-block-spacing)) 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));
}

/* Tables */
table {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  margin: calc(1em * var(--md-block-spacing)) 8px;
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
  color: var(--md-link-color);
  text-decoration: none;
}
`,et=`/**
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
  background: var(--md-blockquote-background, transparent);
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
  margin: calc(0.5em * var(--md-block-spacing)) 8px;
}

/* Horizontal rules */
hr {
  height: 1px;
  border: none;
  margin: calc(2em * var(--md-block-spacing)) 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));
}

/* Emphasis */
em {
  font-style: italic;
  font-size: inherit;
}

/* Links */
a {
  color: var(--md-link-color);
  text-decoration: none;
}
`,tt=Ze,R={default:Qe,grace:$e,simple:et};function nt(e){return Object.keys(R).includes(e)}var rt=class{styleElement=null;styleId=`md-theme`;inject(e){this.styleElement||(this.styleElement=document.createElement(`style`),this.styleElement.id=this.styleId,document.head.appendChild(this.styleElement)),this.styleElement.textContent=e}remove(){this.styleElement&&=(this.styleElement.remove(),null)}isInjected(){return this.styleElement!==null}},it=null;function at(){return it||=new rt,it}function ot(e,t){if(t!=null&&t.trim())return`${R.default}\n\n${t}`;let n=R.default;if(e!=="default"&&nt(e)){let t=R[e];t&&(n=`${n}\n\n${t}`)}return n}async function st(e){let t=[qe(e.variables),tt,L(ot(e.themeName,e.themeCSS),`#output`),Je(e.variables),e.customCSS?L(e.customCSS,`#output`):``].filter(Boolean).join(`

`);t=Re(t),at().inject(t)}function z(e){let t=/[\\/:*?"<>|]/g;if(!t.test(e)&&e.length<=100)return e.trim()||`untitled`;let n=e.replace(t,`_`).trim();return(n.length>100?n.slice(0,100):n)||`untitled`}function ct(e){let t=e.split(`
`),n=t.filter(e=>e.trim()).map(e=>e.match(/(^\s+)?/)[0].length).sort((e,t)=>e-t)[0];return t.map(e=>e.slice(n)).join(`
`)}function B(e,t,n=`text/plain`){if(typeof document>`u`)throw TypeError(`downloadFile can only be used in browser environment`);let r=document.createElement(`a`);r.download=t,r.style.display=`none`;let i=null;if(e.startsWith(`data:`)||e.startsWith(`blob:`))r.href=e;else if(n===`text/html`)r.href=`data:text/html;charset=utf-8,${encodeURIComponent(e)}`;else{let t=new Blob([e],{type:n});i=URL.createObjectURL(t),r.href=i}document.body.appendChild(r),r.click(),document.body.removeChild(r),i&&URL.revokeObjectURL(i)}function lt(e){return new Promise((t,n)=>{let r=new FileReader;r.readAsDataURL(e),r.onload=()=>t(r.result.split(`,`).pop()),r.onerror=e=>n(e)})}function ut(e){return new Promise(t=>window.setTimeout(t,e))}var dt=2e4,ft=250,pt=`.mermaid-diagram, .plantuml-diagram, .infographic-diagram`;function mt(e){return e?.themeMode?{themeMode:e.themeMode}:void 0}function ht(e){for(let t of e.querySelectorAll(pt))if(je(t))return!0;return!1}function gt(e){if(e.querySelector(`.katex-fallback`))return!0;for(let t of e.querySelectorAll(`.katex-block, .katex-inline`))if(!t.querySelector(`svg, mjx-container`))return!0;return!1}async function V(e=dt,t){await l(),await l();let n=document.getElementById(`output`);if(!n)return!1;let r=mt(t),i=Date.now()+e;for(;Date.now()<i;){if(Me(n,r),!ht(n)&&!gt(n))return!0;await ut(ft)}return Me(n,r),!ht(n)&&!gt(n)}function _t(e){e.querySelectorAll(pt).forEach(e=>{e.querySelector(`svg, img`)||e.getAttribute(Ae)===Ne.loading&&e.remove()}),e.querySelectorAll(`.katex-pending`).forEach(e=>{e.querySelector(`svg, mjx-container`)||e.remove()})}var vt=m(`editor`,()=>{let e=h(null),t=null;function n(e){t=e}function r(){t=null}function i(){t?.()}return{editor:e,registerContentFlush:n,unregisterContentFlush:r,flushContentToPostStore:i,formatContent:async()=>{if(!e.value)return;let{formatDoc:t}=await v(async()=>{let{formatDoc:e}=await import(`./md-formatDoc-CxaqOHUh.js`);return{formatDoc:e}},__vite__mapDeps([0,1,2])),n=await t(e.value.state.doc.toString());return e.value.dispatch({changes:{from:0,to:e.value.state.doc.length,insert:n}}),n},importContent:t=>{e.value&&e.value.dispatch({changes:{from:0,to:e.value.state.doc.length,insert:t}})},clearContent:()=>{e.value&&(e.value.dispatch({changes:{from:0,to:e.value.state.doc.length,insert:``}}),y.success(o(`store.editor.contentCleared`)))},getContent:()=>e.value?.state.doc.toString()??``,getSelection:()=>{if(!e.value)return``;let t=e.value.state.selection.main;return e.value.state.doc.sliceString(t.from,t.to)},replaceSelection:t=>{e.value&&e.value.dispatch(e.value.state.replaceSelection(t))},replaceText:(t,n)=>{if(!e.value||!t)return!1;let r=e.value.state.doc.toString(),i=e.value.state.selection.main.head,a=-1,o=1/0,s=0;for(;;){let e=r.indexOf(t,s);if(e===-1)break;let n=Math.abs(e-i);n<o&&(o=n,a=e),s=e+1}return a!==-1&&(e.value.dispatch({changes:{from:a,to:a+t.length,insert:n}}),e.value.focus(),!0)},insertAtCursor:t=>{if(!e.value)return;let n=e.value.state.selection.main;e.value.dispatch({changes:{from:n.from,to:n.to,insert:t},selection:{anchor:n.from+t.length}}),e.value.focus()}}});function yt(e){let t={};for(let n of e.matchAll(/(\w[\w-]*)=(?:"([^"]*)"|'([^']*)')/g))t[n[1]]=n[2]===void 0?n[3]??``:n[2];return t}function bt(e){let t=new Set;for(let n of e.matchAll(/(\w[\w-]*)=(?:"[^"]*"|'[^']*')/g))t.add(n[1]);let n=e.match(/(?:^|\s)([A-Z_][\w-]*)\s*=\s*(?:"[^"]*|'[^']*)?$/i);return n&&t.add(n[1]),t}function xt(e){return e.default!==void 0&&e.default!==``?e.default:e.type===`array`?`[]`:e.type===`boolean`?`true`:e.type===`number`?`0`:e.name}function St(e,t){return t.includes(`"`)&&!t.includes(`'`)?`${e}='${t}'`:t.includes(`"`)&&t.includes(`'`)?`${e}="${t.replace(/"/g,`'`)}"`:`${e}="${t}"`}function Ct(e){let t={};for(let n of e.props)n.required&&(n.default===void 0||n.default===``)?t[n.name]=``:t[n.name]=xt(n);if(e.example){let n=yt(e.example);Object.assign(t,n)}return t}function wt(e,t){return e.props.filter(e=>e.required&&!(t[e.name]??``).trim()).map(e=>e.name)}function Tt(e,t){if(t){let n=[];for(let r of e.props){let e=t[r.name],i=e===void 0?``:e;i===``&&!r.required||n.push(St(r.name,i===``?xt(r):i))}return`<${e.name}${n.length?` ${n.join(` `)}`:``} />`}if(e.example)return e.example;let n=e.props.map(e=>St(e.name,xt(e))).join(` `);return`<${e.name}${n?` ${n}`:``} />`}var Et=m(`customComponent`,()=>{let r=n.reactive(e(`custom_components`),[]),i=g(()=>P),a=g(()=>{let e=new Map(P.map(e=>[e.name,e]));for(let t of r.value)e.set(t.name,t);return[...e.values()]}),s=g(()=>{let e=Pe();for(let t of r.value)e[t.name]=t;return e});function c(e){let n=Date.now(),i={id:t(),name:e.name,description:e.description,template:e.template,props:e.props,createdAt:n,updatedAt:n};return r.value.push(i),y.success(o(`store.component.created`,{name:e.name})),i}function l(e,t){let n=r.value.findIndex(t=>t.id===e);return n===-1?(y.error(o(`store.component.notFound`)),!1):(r.value[n]={...r.value[n],...t,updatedAt:Date.now()},y.success(o(`store.component.updated`)),!0)}function u(e){let t=r.value.findIndex(t=>t.id===e);if(t===-1)return y.error(o(`store.component.notFound`)),!1;let n=r.value[t].name;return r.value.splice(t,1),y.success(o(`store.component.deleted`,{name:n})),!0}function d(e){return r.value.find(t=>t.id===e)}function f(e,t){return Tt(e,t)}return{userComponents:r,builtInComponents:i,allComponents:a,registry:s,createComponent:c,updateComponent:l,deleteComponent:u,getComponentById:d,buildSnippet:f}});function Dt(e){return`mp:${e}`}function Ot(e){return e.startsWith(`mp:`)&&e.length>3}var kt={"zh-CN":`/* 全局变量 */
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
`};function At(e=`zh-CN`){return kt[e]??kt[`zh-CN`]}var jt=[ce(),_e(),M(),D(),oe(),be(),k.allowMultipleSelections.of(!0),E(),ie(b,{fallback:!0}),ee(),te(),S(),ue(),me(),Se(),O(),de(),j.of([...ge,...se,...Te,...ne,...T,...he,...De,{key:`Tab`,run:C},x])];function H(e,{prefix:t,suffix:n,check:r,afterInsertCursorOffset:i=0}){let a=e.state.selection.main,o=e.state.doc.sliceString(a.from,a.to),s=r?.(o)??!1,c;if(s)c=o.slice(t.length,o.length-n.length),e.dispatch(e.state.replaceSelection(c));else if(c=`${t}${o}${n}`,e.dispatch(e.state.replaceSelection(c)),i!==0){let t=e.state.selection.main.head+i;e.dispatch({selection:{anchor:t}})}}function U(e,t){let n=e.state.selection.ranges,r=[],i=`${`#`.repeat(t)} `;if(n.forEach(t=>{let n=e.state.doc.lineAt(t.from),a=e.state.doc.lineAt(t.to);for(let t=n.number;t<=a.number;t++){let n=e.state.doc.line(t),a=e.state.doc.sliceString(n.from,n.to).replace(/^#{1,6}\s+/,``).trimStart(),o=i+a;r.push({from:n.from,to:n.to,insert:o})}}),r.length>0){let t=e.state.doc.lineAt(n[0].from).from+i.length;e.dispatch({changes:r,selection:{anchor:t}})}}function Mt(e){H(e,{prefix:`**`,suffix:`**`,check:e=>e.startsWith(`**`)&&e.endsWith(`**`),afterInsertCursorOffset:-2})}function Nt(e){H(e,{prefix:`*`,suffix:`*`,check:e=>e.startsWith(`*`)&&e.endsWith(`*`),afterInsertCursorOffset:-1})}function Pt(e){H(e,{prefix:`~~`,suffix:`~~`,check:e=>e.startsWith(`~~`)&&e.endsWith(`~~`),afterInsertCursorOffset:-2})}function Ft(e){H(e,{prefix:`[`,suffix:`]()`,check:e=>e.startsWith(`[`)&&e.endsWith(`]()`),afterInsertCursorOffset:-1})}function It(e){H(e,{prefix:"`",suffix:"`",check:e=>e.startsWith("`")&&e.endsWith("`"),afterInsertCursorOffset:-1})}function Lt(e,t){let n=e.state.selection.main,r=e.state.doc.sliceString(n.from,n.to),i=r.match(/^\s*<span\s+style="color:\s*([^"\s][^"]*)"\s*>([\s\S]*)<\/span>\s*$/i);if(i){let r=`<span style="color: ${t}">${i[2]}</span>`;e.dispatch({changes:{from:n.from,to:n.to,insert:r},selection:{anchor:n.from,head:n.from+r.length}})}else{let i=`<span style="color: ${t}">${r}</span>`;e.dispatch({changes:{from:n.from,to:n.to,insert:i},selection:{anchor:n.from,head:n.from+i.length}})}}function Rt(e){let t=e.state.selection.main,n=e.state.doc.sliceString(t.from,t.to).split(`
`),r=n.every(e=>e.trim().startsWith(`- `))?n.map(e=>e.replace(/^- +/,``)).join(`
`):n.map(e=>`- ${e}`).join(`
`);e.dispatch(e.state.replaceSelection(r))}function zt(e){let t=e.state.selection.main,n=e.state.doc.sliceString(t.from,t.to).split(`
`),r=n.every(e=>/^\d+\.\s/.test(e.trim()))?n.map(e=>e.replace(/^\d+\.\s+/,``)).join(`
`):n.map((e,t)=>`${t+1}. ${e}`).join(`
`);e.dispatch(e.state.replaceSelection(r))}function Bt(e){return re(e)}function Vt(e){return Ee(e)}var Ht=[w.of({name:`C`,extensions:[`c`,`h`],load:()=>v(()=>import(`./md-dist-CDcC_7ui.js`).then(e=>e.cpp()),__vite__mapDeps([3,4,1]))}),w.of({name:`C++`,alias:[`cpp`],extensions:[`cpp`,`cc`,`cxx`,`hpp`,`hh`],load:()=>v(()=>import(`./md-dist-CDcC_7ui.js`).then(e=>e.cpp()),__vite__mapDeps([3,4,1]))}),w.of({name:`CSS`,extensions:[`css`],load:()=>v(()=>import(`./md-codemirror-B2b9ijeR.js`).then(e=>e.d).then(e=>e.css()),__vite__mapDeps([4,1]))}),w.of({name:`Go`,extensions:[`go`],load:()=>v(()=>import(`./md-dist-BZpk8EJK.js`).then(e=>e.go()),__vite__mapDeps([5,4,1]))}),w.of({name:`HTML`,alias:[`xhtml`],extensions:[`html`,`htm`],load:()=>v(()=>import(`./md-codemirror-B2b9ijeR.js`).then(e=>e.o).then(e=>e.html()),__vite__mapDeps([4,1]))}),w.of({name:`Java`,extensions:[`java`],load:()=>v(()=>import(`./md-dist-Byf1oATn.js`).then(e=>e.java()),__vite__mapDeps([6,4,1]))}),w.of({name:`JavaScript`,alias:[`js`,`javascript`,`nodejs`],extensions:[`js`,`mjs`,`cjs`],load:()=>v(()=>import(`./md-codemirror-B2b9ijeR.js`).then(e=>e.c).then(e=>e.javascript()),__vite__mapDeps([4,1]))}),w.of({name:`JSON`,alias:[`json5`],extensions:[`json`],load:()=>v(()=>import(`./md-dist-BLiqTaJ2.js`).then(e=>e.json()),__vite__mapDeps([7,4,1]))}),w.of({name:`JSX`,extensions:[`jsx`],load:()=>v(()=>import(`./md-codemirror-B2b9ijeR.js`).then(e=>e.c).then(e=>e.javascript({jsx:!0})),__vite__mapDeps([4,1]))}),w.of({name:`Markdown`,alias:[`md`],extensions:[`md`,`markdown`],load:()=>v(()=>import(`./md-codemirror-B2b9ijeR.js`).then(e=>e.r).then(e=>e.markdown()),__vite__mapDeps([4,1]))}),w.of({name:`PHP`,extensions:[`php`,`php3`,`php4`,`php5`,`php7`,`phtml`],load:()=>v(()=>import(`./md-dist-DaAVZuTA.js`).then(e=>e.php()),__vite__mapDeps([8,4,1]))}),w.of({name:`Python`,alias:[`py`],extensions:[`py`,`pyw`],load:()=>v(()=>import(`./md-dist-CiDLIzqT.js`).then(e=>e.python()),__vite__mapDeps([9,4,1]))}),w.of({name:`Rust`,alias:[`rs`],extensions:[`rs`],load:()=>v(()=>import(`./md-dist-DHsEV9Bw.js`).then(e=>e.rust()),__vite__mapDeps([10,4,1]))}),w.of({name:`SQL`,extensions:[`sql`],load:()=>v(()=>import(`./md-dist-BUJ-fYZ3.js`).then(e=>e.sql()),__vite__mapDeps([11,4,1]))}),w.of({name:`TSX`,extensions:[`tsx`],load:()=>v(()=>import(`./md-codemirror-B2b9ijeR.js`).then(e=>e.c).then(e=>e.javascript({jsx:!0,typescript:!0})),__vite__mapDeps([4,1]))}),w.of({name:`TypeScript`,alias:[`ts`],extensions:[`ts`,`mts`,`cts`],load:()=>v(()=>import(`./md-codemirror-B2b9ijeR.js`).then(e=>e.c).then(e=>e.javascript({typescript:!0})),__vite__mapDeps([4,1]))}),w.of({name:`XML`,alias:[`rss`,`wsdl`,`xsd`],extensions:[`xml`,`xsl`,`xsd`],load:()=>v(()=>import(`./md-dist-CpMGAJoz.js`).then(e=>e.xml()),__vite__mapDeps([12,4,1]))}),w.of({name:`YAML`,alias:[`yml`],extensions:[`yaml`,`yml`],load:()=>v(()=>import(`./md-dist-BK0drD6K.js`).then(e=>e.yaml()),__vite__mapDeps([13,4,1]))})];async function Ut(e){let t=e.state.doc.toString(),{formatDoc:n}=await v(async()=>{let{formatDoc:e}=await import(`./md-formatDoc-CxaqOHUh.js`);return{formatDoc:e}},__vite__mapDeps([0,1,2])),r=await n(t,`markdown`);e.dispatch({changes:{from:0,to:e.state.doc.length,insert:r}})}function Wt(e){let t=e.state.changeByRange(e=>({changes:{from:e.from,to:e.to,insert:`  `},range:ve.range(e.from+2,e.from+2)}));return e.dispatch(t),!0}function Gt(e){let{onSearch:t,onReplace:n,onGoToLine:r}=e||{};return j.of([{key:`Tab`,run:Wt},{key:`Mod-z`,run:Bt},{key:`Mod-y`,run:Vt},{key:`Mod-b`,run:e=>(Mt(e),!0)},{key:`Mod-i`,run:e=>(Nt(e),!0)},{key:`Mod-d`,run:e=>(Pt(e),!0)},{key:`Mod-k`,run:e=>(Ft(e),!0)},{key:`Mod-e`,run:e=>(It(e),!0)},{key:`Mod-1`,run:e=>(U(e,1),!0)},{key:`Mod-2`,run:e=>(U(e,2),!0)},{key:`Mod-3`,run:e=>(U(e,3),!0)},{key:`Mod-4`,run:e=>(U(e,4),!0)},{key:`Mod-5`,run:e=>(U(e,5),!0)},{key:`Mod-6`,run:e=>(U(e,6),!0)},{key:`Mod-u`,run:e=>(Rt(e),!0)},{key:`Mod-o`,run:e=>(zt(e),!0)},...t?[{key:`Mod-f`,run:e=>(t(e),!0)}]:[],...n?[{key:`Mod-h`,run:e=>(n(e),!0)}]:[],{key:`Shift-Alt-f`,run:e=>(Ut(e),!0)},...r?[{key:`Mod-g`,run:e=>(r(e),!0)}]:[{key:`Mod-g`,run:()=>!0}]])}function Kt(e){let{placeholder:t,withoutHistory:n}=e||{};return[...n?[]:[M()],O(),te(),de(),pe({base:ae,codeLanguages:Ht,addKeymap:!0}),fe.high(Gt(e)),D(),j.of([...se,...ne,...ge,...T]),A.lineWrapping,k.allowMultipleSelections.of(!0),...t?[le(t)]:[]]}var qt=A.theme({".cm-gutterElement":{display:`flex`,justifyContent:`right`,alignItems:`center`},"&.cm-editor .cm-gutters":{backgroundColor:`transparent !important`,borderRight:`none !important`,padding:`0 !important`},".cm-foldGutter":{width:`10px !important`,overflow:`hidden`},".cm-foldGutter .cm-gutterElement":{padding:`0 !important`,width:`10px !important`,minWidth:`unset !important`},".cm-foldGutter .cm-gutterElement span":{opacity:`0`,transition:`opacity 0.15s ease`},"&.cm-editor .cm-gutters:hover .cm-foldGutter .cm-gutterElement span":{opacity:`1`}});function Jt(){return[Ce,qt]}function Yt(){return[ye,qt]}function Xt(e){return e?Yt():Jt()}async function Zt(e){let t=e.state.doc.toString(),{formatDoc:n}=await v(async()=>{let{formatDoc:e}=await import(`./md-formatDoc-CxaqOHUh.js`);return{formatDoc:e}},__vite__mapDeps([0,1,2])),r=await n(t,`css`);e.dispatch({changes:{from:0,to:e.state.doc.length,insert:r}})}function Qt(){return[jt,we(),A.lineWrapping,j.of([{key:`Shift-Alt-f`,run:e=>(Zt(e),!0)}])]}function $t(){return At(a())}var en=m(`cssEditor`,()=>{let r=Oe(),i=h(null),a=h(null),s=n.reactive(e(`css_content_config`),{active:``,tabs:[]});u(()=>{let e=new Date;if(s.value.tabs.length===0){let n=t();s.value.tabs=[{id:n,title:o(`store.cssEditor.schemeDefault`),name:o(`store.cssEditor.schemeDefault`),content:$t(),createDatetime:e,updateDatetime:e}],s.value.active=n;return}if(s.value.tabs=s.value.tabs.map((n,r)=>({...n,id:n.id??t(),createDatetime:n.createDatetime??new Date(e.getTime()+r),updateDatetime:n.updateDatetime??new Date(e.getTime()+r)})),!s.value.tabs.find(e=>e.id===s.value.active)){let e=s.value.tabs.find(e=>e.name===s.value.active);s.value.active=e?.id??s.value.tabs[0].id}});let l=()=>{let e=s.value.tabs.find(e=>e.id===s.value.active);if(!e){if(s.value.tabs.length===0){let e=t(),n=new Date;return s.value.tabs=[{id:e,title:o(`store.cssEditor.schemeDefault`),name:o(`store.cssEditor.schemeDefault`),content:$t(),createDatetime:n,updateDatetime:n}],s.value.active=e,s.value.tabs[0]}return s.value.active=s.value.tabs[0].id,s.value.tabs[0]}return e},d=()=>l().content,f=e=>{i.value&&i.value.dispatch({changes:{from:0,to:i.value.state.doc.length,insert:e}})},m=null;return c(r,()=>{i.value&&a.value&&i.value.dispatch({effects:a.value.reconfigure(Xt(r.value))})}),{cssEditor:i,cssContentConfig:s,isSelectMode:g(()=>s.value.isSelectMode??!1),selectedIds:g(()=>s.value.selectedIds??[]),getCurrentTab:l,getCurrentTabContent:d,setCssEditorValue:f,setOnTabChangedCallback:e=>{m=e},tabChanged:e=>{s.value.active=e;let t=s.value.tabs.find(t=>t.id===e);t&&(f(t.content),m&&m(t.content))},renameTab:e=>{let t=l();t.title=e,t.name=e},addCssContentTab:(e,n)=>{let r=n??$t(),i=new Date;s.value.tabs.push({id:t(),name:e,title:e,content:r,createDatetime:i,updateDatetime:i});let a=s.value.tabs[s.value.tabs.length-1];s.value.active=a.id,f(r),m&&m(r)},resetCssConfig:()=>{let e=$t(),n=t();s.value={active:n,tabs:[{id:n,title:o(`store.cssEditor.schemeDefaultSpaced`),name:o(`store.cssEditor.schemeDefaultSpaced`),content:e,createDatetime:new Date,updateDatetime:new Date}]},i.value&&i.value.dispatch({changes:{from:0,to:i.value.state.doc.length,insert:e}})},initCssEditor:e=>{let t=document.querySelector(`#cssEditor`);if(!t)return;t.value=l().content;let n=document.createElement(`div`);n.className=`w-full h-full`,t.parentNode?.replaceChild(n,t),a.value=new xe;let o=k.create({doc:l().content,extensions:[Qt(),a.value.of(Xt(r.value)),A.updateListener.of(t=>{if(t.docChanged){let n=t.state.doc.toString(),r=l();r.content=n,r.updateDatetime=new Date,e(n)}})]});i.value=p(new A({state:o,parent:n}))},scrollToHeading:e=>{if(!i.value)return;let t=i.value.state.doc.toString(),n=RegExp(`^${e}\\s*\\{`,`m`),r=t.match(n);if(r&&r.index!==void 0){let e=r.index,n=0,a=e,o=!1;for(let r=e;r<t.length;r++)if(t[r]===`{`)n++,o=!0;else if(t[r]===`}`&&(n--,o&&n===0)){a=r+1;break}i.value.dispatch({selection:{anchor:e,head:a},scrollIntoView:!0}),i.value.focus()}},toggleSelectMode:()=>{s.value.isSelectMode=!(s.value.isSelectMode??!1),s.value.isSelectMode||(s.value.selectedIds=[])},toggleSelectTab:e=>{let t=s.value.selectedIds??[];t.indexOf(e)===-1?s.value.selectedIds=[...t,e]:s.value.selectedIds=t.filter(t=>t!==e)},selectAllTabs:()=>{s.value.selectedIds=s.value.tabs.map(e=>e.id)},clearSelection:()=>{s.value.selectedIds=[]},batchDeleteTabs:()=>{let e=s.value.selectedIds??[];if(e.length===0)return;if(e.length>=s.value.tabs.length){y.warning(o(`store.cssEditor.keepAtLeastOne`));return}let t=s.value.tabs.filter(t=>!e.includes(t.id));e.includes(s.value.active)&&(s.value.active=t[0].id,f(t[0].content),m&&m(t[0].content)),s.value.tabs=t,s.value.selectedIds=[],s.value.isSelectMode=!1,y.success(o(`store.cssEditor.batchDeleted`,{count:e.length}))},batchExportTabs:async()=>{let e=s.value.selectedIds??[];if(e.length!==0){if(e.length===1){let t=s.value.tabs.find(t=>t.id===e[0]);t&&B(`data:text/css;charset=utf-8,${encodeURIComponent(t.content)}`,`${z(t.title)}.css`)}else{let{strToU8:t,zip:n}=await v(async()=>{let{strToU8:e,zip:t}=await import(`./md-browser-C7tAaLTR.js`).then(e=>e.t);return{strToU8:e,zip:t}},__vite__mapDeps([14,1])),r={};e.forEach(e=>{let n=s.value.tabs.find(t=>t.id===e);n&&(r[`${z(n.title)}.css`]=t(n.content))});let i=await new Promise((e,t)=>n(r,(n,r)=>n?t(n):e(r))),a=URL.createObjectURL(new Blob([i],{type:`application/zip`}));B(a,`css-schemes.zip`),URL.revokeObjectURL(a)}s.value.selectedIds=[],s.value.isSelectMode=!1,y.success(o(`store.cssEditor.batchExported`,{count:e.length}))}},exportSingleTab:e=>{let t=s.value.tabs.find(t=>t.id===e);t&&(B(`data:text/css;charset=utf-8,${encodeURIComponent(t.content)}`,`${z(t.title)}.css`),y.success(o(`store.cssEditor.singleExported`,{name:t.title})))}}}),tn=m(`theme`,()=>{let t=n.reactive(e(`theme`),s.theme),a=n.reactive(e(`themeSettings`),{}),o=g(()=>a.value[t.value]??r()),c=g({get:()=>o.value.primaryColor,set:e=>{x(`primaryColor`,e)}}),l=g({get:()=>o.value.fontFamily,set:e=>{x(`fontFamily`,e)}}),u=g({get:()=>o.value.fontSize,set:e=>{x(`fontSize`,e)}}),d=g({get:()=>o.value.lineHeight??s.lineHeight,set:e=>{x(`lineHeight`,e)}}),f=g({get:()=>o.value.blockSpacing??s.blockSpacing,set:e=>{x(`blockSpacing`,e)}}),p=g({get:()=>o.value.linkColor??s.linkColor,set:e=>{x(`linkColor`,e)}}),m=g({get:()=>o.value.blockquoteBackground??s.blockquoteBackground,set:e=>{x(`blockquoteBackground`,e)}}),h=g({get:()=>o.value.codeBlockTheme,set:e=>{x(`codeBlockTheme`,e)}}),_=g({get:()=>o.value.headingStyles,set:e=>{x(`headingStyles`,e)}}),y=g({get:()=>o.value.isShowLineNumber,set:e=>{x(`isShowLineNumber`,e)}}),b=g({get:()=>o.value.isMacCodeBlock,set:e=>{x(`isMacCodeBlock`,e)}});function x(e,n){let i=t.value,o=a.value[i]??r();a.value={...a.value,[i]:{...o,[e]:n}}}let S=n.reactive(`isCiteStatus`,s.isCiteStatus),C=n.reactive(`isCountStatus`,s.isCountStatus),w=n.reactive(e(`use_indent`),!1),T=n.reactive(e(`use_justify`),!1),E=n.reactive(`legend`,s.legend),ee=n.reactive(`previewWidth`,i[0].value);return{theme:t,themeSettings:a,fontFamily:l,fontSize:u,fontSizeNumber:g(()=>Number(u.value.replace(`px`,``))),lineHeight:d,blockSpacing:f,linkColor:p,blockquoteBackground:m,primaryColor:c,codeBlockTheme:h,legend:E,isMacCodeBlock:b,isShowLineNumber:y,isCiteStatus:S,isCountStatus:C,isUseIndent:w,isUseJustify:T,previewWidth:ee,headingStyles:_,toggleMacCodeBlock:N(b),toggleShowLineNumber:N(y),toggleCiteStatus:N(S),toggleCountStatus:N(C),toggleUseIndent:N(w),toggleUseJustify:N(T),resetStyle:()=>{a.value={...a.value,[t.value]:r()},S.value=s.isCiteStatus,C.value=s.isCountStatus,E.value=s.legend,w.value=!1,T.value=!1},updateCodeTheme:()=>{let e=h.value,t=document.querySelector(`#hljs`);if(t){if(t.getAttribute(`href`)===e)return;t.setAttribute(`href`,e)}else{let t=document.createElement(`link`);t.setAttribute(`type`,`text/css`),t.setAttribute(`rel`,`stylesheet`),t.setAttribute(`href`,e),t.setAttribute(`id`,`hljs`),document.head.appendChild(t)}},applyCurrentTheme:async()=>{try{let e=en().getCurrentTabContent(),n;if(Ot(t.value)){let{useMarketplaceStore:e}=await v(async()=>{let{useMarketplaceStore:e}=await import(`./md-marketplace-DJ3tz7k7.js`).then(e=>e.t);return{useMarketplaceStore:e}},__vite__mapDeps([15,1,16,17,18,19,2,20,21,22,23,24,25,26,14]));n=e().getInstalledThemeCss(t.value)}await st({themeName:t.value,themeCSS:n,customCSS:e,variables:{primaryColor:c.value,fontFamily:l.value,fontSize:u.value,lineHeight:d.value,blockSpacing:f.value,linkColor:p.value,blockquoteBackground:m.value,isUseIndent:w.value,isUseJustify:T.value,headingStyles:_.value}})}catch(e){console.error(`[applyCurrentTheme] 主题应用失败:`,e)}},setHeadingStyle:(e,t)=>{let n=_.value;_.value={...n,[e]:t==="default"?void 0:t}},getHeadingStyle:e=>_.value[e]||`default`}}),nn=m(`render`,()=>{let e=h(``),t=f({chars:0,words:0,minutes:0}),n=h([]),r=null,i=``,a=``,s=null,c=null,l=()=>r,u=()=>({mermaidLoading:o(`store.diagram.mermaidLoading`),mermaidError:o(`store.diagram.mermaidError`),plantumlLoading:o(`store.diagram.plantumlLoading`),plantumlError:o(`store.diagram.plantumlError`),infographicLoading:o(`store.diagram.infographicLoading`),infographicError:o(`store.diagram.infographicError`)}),d=()=>({summary:o(`store.count.summary`,{words:`{words}`,minutes:`{minutes}`})}),p=()=>({footnoteTitle:o(`store.render.footnoteTitle`),unknownComponent:o(`store.render.unknownComponent`),katexLoading:o(`store.render.katexLoading`)});function m(e){return Object.keys(e.registry).sort().map(t=>{let n=e.registry[t];return[t,n.updatedAt??0,n.template,JSON.stringify(n.props??[])].join(``)}).join(``)}function g(e,t,n){return[e,t.isCiteStatus?`1`:`0`,t.legend,t.isCountStatus?`1`:`0`,t.isMacCodeBlock?`1`:`0`,t.isShowLineNumber?`1`:`0`,m(n),o(`store.count.summary`,{words:`{words}`,minutes:`{minutes}`}),o(`store.render.footnoteTitle`),o(`store.render.unknownComponent`),o(`store.render.katexLoading`),o(`store.diagram.mermaidLoading`)].join(``)}let _=e=>{let t=r.getHeadings();n.value=t.map((e,t)=>({url:`#${t}`,title:e.text,level:e.level}));let i=0;return e.replace(/data-heading="true"/g,()=>`data-heading="true" id="${i++}"`)},y=(n,o)=>{if(!r)return c={content:n,options:o},e.value;let s=tn(),l=Bi(),f=Et(),m=o?.themeMode??(l.isDark?`dark`:`light`),h=g(m,s,f);if(!o?.force&&n===a&&h===i)return e.value;r.reset({citeStatus:s.isCiteStatus,legend:s.legend,countStatus:s.isCountStatus,isMacCodeBlock:s.isMacCodeBlock,isShowLineNumber:s.isShowLineNumber,themeMode:m,components:f.registry,diagramMessages:u(),countMessages:d(),renderMessages:p()});let{html:v,readingTime:y}=Ie(n,r);return t.chars=n.length,t.words=y.words,t.minutes=Math.ceil(y.minutes),e.value=_(ke(v,y,r)),a=n,i=h,e.value};function b(){if(!c||!r)return;let e=c;c=null,y(e.content,e.options)}return{output:e,readingTime:t,titleList:n,initRendererInstance:async e=>(s??=v(async()=>{let{initRenderer:e}=await import(`./md-renderer-DMUJWyz3.js`).then(e=>e.t);return{initRenderer:e}},__vite__mapDeps([27,1,24,2,25,26,14,28])).then(({initRenderer:t})=>(r=t(e||{}),i=``,a=``,r)).catch(e=>{throw s=null,e}),await s,b(),r),getRenderer:l,render:y}}),rn=/^(?:serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-sans-serif|ui-serif|ui-monospace|ui-rounded|inherit|initial|unset|revert|revert-layer)$/i;function an(e){let t=e.replace(/\s*!important$/i,``).trim();return!t||/^undefined$/i.test(t)||/\bundefined\b/i.test(t)}function on(e){let t=e.replace(/["']/g,``).trim();return!t||/^var\(/i.test(e)?e:rn.test(t)?t:/\s/.test(t)||t.split(``).some(e=>e.charCodeAt(0)>127)?`'${t}'`:t}function sn(e){return e.split(/,(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/).map(e=>on(e.trim())).filter(Boolean).join(`, `)}function cn(e){return e.replace(/font-family\s*:\s*([^;}{]+)/gi,(e,t)=>`font-family: ${sn(t)}`).replace(/(?<!['"])\bOpen Sans\b(?!['"])/gi,`sans-serif`)}function ln(e){return e.replace(/&quot;/g,`"`).replace(/&#34;/g,`"`).replace(/&apos;|&#39;/g,`'`).replace(/&amp;/g,`&`)}function un(e,t){let n=e.replace(/&/g,`&amp;`);return n=t===`"`?n.replace(/"/g,`&quot;`):n.replace(/'/g,`&#39;`),n}function dn(e){return cn(e.split(`;`).map(e=>e.trim()).filter(e=>{if(!e||/^undefined$/i.test(e))return!1;let t=e.indexOf(`:`);return t!==-1&&!an(e.slice(t+1))}).join(`; `))}function fn(e){return cn(e.replace(/([a-z_-]+)\s*:\s*undefined\b\s*;?/gi,``))}function pn(e){e.querySelectorAll(`[style]`).forEach(e=>{let t=e.getAttribute(`style`);if(t==null)return;let n=dn(t);n?e.setAttribute(`style`,n):e.removeAttribute(`style`)}),e.querySelectorAll(`style`).forEach(e=>{let t=e.textContent;t&&(/\bundefined\b/i.test(t)||/font-family\s*:/i.test(t)||/\bOpen Sans\b/i.test(t))&&(e.textContent=fn(t))})}function mn(e){return e.replace(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/gi,(e,t,n)=>` style=${t}${un(dn(ln(n)),t)}${t}`).replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,(e,t,n,r)=>`${t}${fn(n)}${r}`).replace(/\sfont-family\s*=\s*(["'])([\s\S]*?)\1/gi,(e,t,n)=>` font-family=${t}${un(sn(ln(n)),t)}${t}`).replace(/(?<!['"])\bOpen Sans\b(?!['"])/gi,`sans-serif`)}function hn(e){return e.replace(/font-family\s*:[^;}{]+;?/gi,``).replace(/\sfont-family\s*=\s*(["'])[\s\S]*?\1/gi,``).replace(/(?<!['"])\bOpen Sans\b(?!['"])/gi,`sans-serif`)}function gn(e){let t=e??document.getElementById(`output`);if(!t)return;let n=t.getElementsByTagName(`img`);Array.from(n).forEach(e=>{let t=e.getAttribute(`width`),n=e.getAttribute(`height`);t&&(e.removeAttribute(`width`),e.style.width=/^\d+$/.test(t)?`${t}px`:t),n&&(e.removeAttribute(`height`),e.style.height=/^\d+$/.test(n)?`${n}px`:n)})}function _n(e){let t=document.createElement(`div`);return t.innerHTML=e,t.querySelectorAll(`li > ul, li > ol`).forEach(e=>{e.parentElement?.insertAdjacentElement(`afterend`,e)}),t.innerHTML}function vn(){let e=document.createElement(`p`);return e.style.fontSize=`0`,e.style.lineHeight=`0`,e.style.margin=`0`,e.innerHTML=`&nbsp;`,e}function yn(e){e.querySelector(`.mermaid-diagram foreignObject`)&&e.querySelectorAll(`foreignObject`).forEach(e=>{if(!e.closest(`.mermaid-diagram`))return;let t=e.querySelector(`:scope > div, :scope > span, :scope > section`);if(!t||t.localName===`section`)return;let n=document.createElement(`section`);n.setAttribute(`xmlns`,t.getAttribute(`xmlns`)||`http://www.w3.org/1999/xhtml`);let r=t.getAttribute(`style`)||``;r&&n.setAttribute(`style`,r),n.innerHTML=t.innerHTML,e.replaceChildren(n)})}var bn=`:root {
  --foreground: 0 0% 3.9%;
  --blockquote-background: #f7f7f7;
}`;async function xn(){let e=document.querySelector(`#hljs`);if(!e)return``;try{return`<style>${await(await fetch(e.href)).text()}</style>`}catch(e){return console.warn(`Failed to fetch highlight.js styles:`,e),``}}function Sn(e,t){let n=e;return n=n.replace(/#output\s*\{/g,`${t} {`),n=n.replace(/#output\s+/g,`${t} `),n=n.replace(/^#output\s*/gm,`${t} `),n}function Cn(e){let t=e;return t=t.replace(/#output\s*\{/g,`body {`),t=t.replace(/#output\s+/g,``),t=t.replace(/^#output\s*/gm,``),t}function wn(){let e=document.querySelector(`#md-theme`);return!e||!e.textContent?(console.warn(`[getThemeStyles] theme styles not found`),``):`<style>${Cn(e.textContent)}</style>`}async function Tn(){let e=document.querySelector(`#md-theme`);if(!e?.textContent)return console.warn(`[getShareExportStyles] theme styles not found`),``;let t=[`<style>${bn}</style>`,`<style>${Sn(e.textContent,`.share-content`)}</style>`],n=await xn();return n&&t.push(n),t.join(``)}async function En(){return[wn(),await xn()].filter(Boolean).join(``)}var W=`http://www.w3.org/2000/svg`;function Dn(e){return e?e.match(/#([^)'"]+)/)?.[1]??null:null}function On(e){let t=new Map;return Array.from(e.querySelectorAll(`*`)).forEach(e=>{if(e.localName!==`marker`)return;let n=e.getAttribute(`id`);if(!n)return;let r=Array.from(e.querySelectorAll(`*`)).filter(e=>[`path`,`polygon`,`polyline`,`line`].includes(e.localName));r.length!==0&&t.set(n,{paths:r,refX:Number.parseFloat(e.getAttribute(`refX`)??`0`),refY:Number.parseFloat(e.getAttribute(`refY`)??`0`),orient:e.getAttribute(`orient`)??`auto`,markerUnits:e.getAttribute(`markerUnits`)??`strokeWidth`,markerWidth:Number.parseFloat(e.getAttribute(`markerWidth`)??`3`),markerHeight:Number.parseFloat(e.getAttribute(`markerHeight`)??`3`)})}),t}function kn(e){return e.paths.map(e=>e.cloneNode(!0))}function An(e,t){if(e===`auto`||e===`auto-start-reverse`)return e===`auto-start-reverse`?t+Math.PI:t;let n=Number.parseFloat(e);return Number.isFinite(n)?n*Math.PI/180:t}function jn(e){let t=e.getAttribute(`stroke-width`);if(t)return Number.parseFloat(t)||1.5;let n=(e.getAttribute(`style`)??``).match(/stroke-width:\s*([\d.]+)/);return n?Number.parseFloat(n[1]):1.5}function Mn(e){return e.getAttribute(`stroke`)??e.getAttribute(`fill`)??`currentColor`}function Nn(e,t,n,r,i){let a=Math.max(6,i*4),o=t.x,s=t.y,c=o-a*Math.cos(n-Math.PI/6),l=s-a*Math.sin(n-Math.PI/6),u=o-a*Math.cos(n+Math.PI/6),d=s-a*Math.sin(n+Math.PI/6),f=document.createElementNS(W,`polygon`);f.setAttribute(`points`,`${o},${s} ${c},${l} ${u},${d}`),f.setAttribute(`fill`,r),f.setAttribute(`stroke`,`none`),e.parentElement?.insertBefore(f,e.nextSibling)}function Pn(e,t,n,r,i,a){let o=An(t.orient,r),s=t.markerUnits===`userSpaceOnUse`?1:Math.max(i,1),c=document.createElementNS(W,`g`);c.setAttribute(`transform`,`translate(${n.x}, ${n.y}) rotate(${o*180/Math.PI}) scale(${s}) translate(${-t.refX}, ${-t.refY})`);let l=kn(t);if(l.length===0){Nn(e,n,r,a,i);return}l.forEach(e=>{(!e.getAttribute(`fill`)||e.getAttribute(`fill`)===`context-fill`)&&e.setAttribute(`fill`,a),(!e.getAttribute(`stroke`)||e.getAttribute(`stroke`)===`context-stroke`)&&e.setAttribute(`stroke`,a),c.appendChild(e)}),e.appendChild(c)}function Fn(e,t){let n=e.getAttribute(`x1`),r=e.getAttribute(`y1`),i=e.getAttribute(`x2`),a=e.getAttribute(`y2`);if(n==null||r==null||i==null||a==null)return null;let o=Number.parseFloat(n),s=Number.parseFloat(r),c=Number.parseFloat(i),l=Number.parseFloat(a),u={x:t?o:c,y:t?s:l},d=Math.atan2(l-s,c-o);return{point:u,angle:t?d+Math.PI:d}}function In(e,t){let n=e;if(typeof n.getTotalLength!=`function`)return null;let r=n.getTotalLength();if(r<=0)return null;let i=Math.min(5,r/2),a=t?n.getPointAtLength(0):n.getPointAtLength(r),o=t?n.getPointAtLength(Math.min(r,i)):n.getPointAtLength(Math.max(0,r-i)),s={x:a.x,y:a.y},c=Math.atan2(s.y-o.y,s.x-o.x);return{point:s,angle:t?c+Math.PI:c}}function Ln(e,t){return e.localName===`path`?In(e,t):e.localName===`line`?Fn(e,t):null}function Rn(e,t,n){let r=Dn(t.getAttribute(`marker-end`)??t.getAttribute(`markerEnd`)),i=Dn(t.getAttribute(`marker-start`)??t.getAttribute(`markerStart`));if(!r&&!i)return;let a=jn(t),o=Mn(t),s=(r,i)=>{if(!r)return;let s=Ln(t,i);if(!s)return;let c=n.get(r);if(c){Pn(e,c,s.point,s.angle,a,o);return}Nn(t,s.point,s.angle,o,a)};s(i,!0),s(r,!1),t.removeAttribute(`marker-end`),t.removeAttribute(`marker-start`),t.removeAttribute(`markerEnd`),t.removeAttribute(`markerStart`),t.removeAttribute(`marker-mid`),t.removeAttribute(`markerMid`)}function zn(e){let t=e.querySelector(`defs`),n=t?On(t):new Map;e.querySelectorAll(`path, line, polyline`).forEach(t=>{Rn(e,t,n)})}function Bn(e,t){let n=typeof e.getElementById==`function`?e.getElementById(t):null;if(n)return n;try{return e.querySelector(`#${CSS.escape(t)}`)}catch{return null}}function Vn(e){return e.getAttribute(`stop-color`)||e.getAttribute(`style`)?.match(/stop-color:\s*([^;]+)/i)?.[1]?.trim()||null}function Hn(e,t){let n=tr(e),r=tr(t);return n?r?`rgb(${Math.round((n[0]+r[0])/2)}, ${Math.round((n[1]+r[1])/2)}, ${Math.round((n[2]+r[2])/2)})`:e:r?t:null}function Un(e,t){let n=Dn(t);if(!n)return null;let r=Bn(e,n);if(!r||r.localName!==`linearGradient`&&r.localName!==`radialGradient`)return null;let i=Array.from(r.querySelectorAll(`stop`)).map(Vn).filter(e=>!!e);return i.length===0?null:i.length===1?i[0]:Hn(i[0],i[i.length-1])??i[0]}function Wn(e){let t=(t,n)=>{let r=t.getAttribute(n);if(!r?.includes(`url(`))return;let i=Un(e,r);i&&t.setAttribute(n,i)};e.querySelectorAll(`*`).forEach(n=>{t(n,`fill`),t(n,`stroke`);let r=n.getAttribute(`style`);if(!r?.includes(`url(`))return;let i=r.replace(/(fill|stroke)\s*:\s*([^;]+)/gi,(t,n,r)=>{if(!r.includes(`url(`))return t;let i=Un(e,r.trim());return i?`${n}: ${i}`:t});i!==r&&n.setAttribute(`style`,i)})}function Gn(e){Array.from(e.querySelectorAll(`use`)).forEach(t=>{let n=Dn(t.getAttribute(`href`)||t.getAttribute(`xlink:href`));if(!n){t.remove();return}let r=Bn(e,n);if(!r){t.remove();return}let i=document.createElementNS(W,`g`),a=Number.parseFloat(t.getAttribute(`x`)??`0`)||0,o=Number.parseFloat(t.getAttribute(`y`)??`0`)||0,s=[];(a||o)&&s.push(`translate(${a}, ${o})`);let c=t.getAttribute(`transform`);if(c&&s.push(c),s.length&&i.setAttribute(`transform`,s.join(` `)),r.localName===`symbol`||r.localName===`svg`||r.localName===`g`)Array.from(r.childNodes).forEach(e=>{(e.nodeType!==Node.ELEMENT_NODE||e.localName!==`defs`)&&i.appendChild(e.cloneNode(!0))});else{let e=r.cloneNode(!0);e.removeAttribute(`id`),i.appendChild(e)}for(let e of[`fill`,`stroke`,`stroke-width`,`opacity`]){let n=t.getAttribute(e);n&&i.setAttribute(e,n)}t.parentNode?.replaceChild(i,t)})}var Kn=`path, line, polyline, polygon, rect, circle, ellipse, text, tspan`;function G(e){return!!e&&e.trim().toLowerCase()===`none`}function K(e){if(!e)return!1;let t=e.trim().toLowerCase();return t!==``&&t!==`none`&&!t.includes(`url(`)}function q(e,t){let n=e.getAttribute(`style`);if(!n)return;let r=new Set(t.map(e=>e.toLowerCase())),i=n.split(`;`).map(e=>e.trim()).filter(Boolean).filter(e=>{let t=e.split(`:`)[0]?.trim().toLowerCase();return!!t&&!r.has(t)}).join(`; `);i?e.setAttribute(`style`,i):e.removeAttribute(`style`)}function J(e,t){let n=e.getAttribute(`style`);return n&&n.match(RegExp(`(?:^|;)\\s*${t}\\s*:\\s*([^;]+)`,`i`))?.[1]?.trim()||null}function qn(e,t,n){let r=e.getAttribute(t),i=J(e,t);if(G(r)||G(i)){e.setAttribute(t,`none`),q(e,[t]);return}if(K(r)){q(e,[t]);return}if(K(i)){e.setAttribute(t,i),q(e,[t]);return}if(G(n)){e.setAttribute(t,`none`);return}K(n)&&e.setAttribute(t,n)}function Jn(e){let t=e.getAttribute(`style`);return t&&t.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)?.[1]?.trim()||null}function Yn(e){let t=e.getAttribute(`fill`),n=J(e,`fill`),r=Jn(e);if(G(t)||G(n)){e.setAttribute(`fill`,`none`),q(e,[`fill`]);return}if(K(t)){q(e,[`fill`]);return}if(K(n)){e.setAttribute(`fill`,n),q(e,[`fill`]);return}if(K(r)){e.setAttribute(`fill`,r);return}let i=window.getComputedStyle(e).color;K(i)&&e.setAttribute(`fill`,i)}function Xn(e){e.querySelectorAll(`foreignObject section, foreignObject span, foreignObject div, foreignObject p`).forEach(e=>{let t=e.getAttribute(`style`)??``;if(/(?:^|;)\s*color\s*:/i.test(t))return;let n=window.getComputedStyle(e).color;K(n)&&e.setAttribute(`style`,`${t}${t?`; `:``}color: ${n}`)})}function Zn(e){e.querySelectorAll(Kn).forEach(e=>{if(!(e instanceof SVGElement))return;let t=window.getComputedStyle(e),n=e.localName===`text`||e.localName===`tspan`;n?Yn(e):qn(e,`fill`,t.fill),n?!e.getAttribute(`stroke`)&&!J(e,`stroke`)&&e.setAttribute(`stroke`,`none`):qn(e,`stroke`,t.stroke),t.strokeWidth&&!e.hasAttribute(`stroke-width`)&&e.setAttribute(`stroke-width`,t.strokeWidth),t.fontSize&&n&&!e.hasAttribute(`font-size`)&&e.setAttribute(`font-size`,t.fontSize),t.opacity&&t.opacity!==`1`&&!e.hasAttribute(`opacity`)&&e.setAttribute(`opacity`,t.opacity);let r=t.getPropertyValue(`stroke-opacity`)||t.strokeOpacity,i=e.getAttribute(`stroke`);r&&r!==`1`&&!e.hasAttribute(`stroke-opacity`)&&i&&i!==`none`&&e.setAttribute(`stroke-opacity`,r)}),e.querySelectorAll(`g`).forEach(e=>{q(e,[`fill`,`stroke`]),e.removeAttribute(`fill`),e.removeAttribute(`stroke`)})}function Qn(e){if(!e)return null;let t=e.trim().split(/[\s,]+/).map(Number);return t.length!==4||t.some(e=>!Number.isFinite(e))?null:{x:t[0],y:t[1],width:t[2],height:t[3]}}function Y(e){if(!e||e.endsWith(`%`))return null;let t=Number.parseFloat(e);return Number.isFinite(t)&&t>0?t:null}function $n(e){return e.closest(`.plantuml-diagram`)!=null||e.hasAttribute(`data-diagram-type`)}function er(e){return e.closest(`.katex-inline, .katex-block, mjx-container`)!=null}function tr(e){let t=e.trim().toLowerCase();if(!t||t===`none`||t===`currentcolor`||t===`transparent`||t.startsWith(`url(`))return null;if(t===`black`)return[0,0,0];if(t===`white`)return[255,255,255];let n=t.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(n){let e=n[1];return e.length===3?[Number.parseInt(e[0]+e[0],16),Number.parseInt(e[1]+e[1],16),Number.parseInt(e[2]+e[2],16)]:[Number.parseInt(e.slice(0,2),16),Number.parseInt(e.slice(2,4),16),Number.parseInt(e.slice(4,6),16)]}let r=t.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);return r?[Math.min(255,Number.parseFloat(r[1])),Math.min(255,Number.parseFloat(r[2])),Math.min(255,Number.parseFloat(r[3]))]:null}function nr([e,t,n]){let r=e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4};return .2126*r(e)+.7152*r(t)+.0722*r(n)}function rr([e,t,n]){return Math.max(e,t,n)-Math.min(e,t,n)<=24}function ir(e){let t=tr(e);return!t||!rr(t)?!1:nr(t)<.35}function ar(e){return e&&(e.trim().toLowerCase()===`currentcolor`||ir(e))?`currentColor`:null}function or(e){for(let t of[`fill`,`stroke`]){let n=ar(e.getAttribute(t));n&&e.setAttribute(t,n)}let t=e.getAttribute(`style`);if(!t)return;let n=!1,r=t.split(`;`).map(e=>e.trim()).filter(Boolean).map(e=>{let t=e.indexOf(`:`);if(t===-1)return e;let r=e.slice(0,t).trim().toLowerCase();if(r!==`fill`&&r!==`stroke`)return e;let i=ar(e.slice(t+1).trim());return i?(n=!0,`${r}: ${i}`):e}).join(`; `);n&&e.setAttribute(`style`,`${r};`)}function sr(e){e.querySelectorAll(`.katex-inline, .katex-block`).forEach(e=>{e.style.removeProperty(`color`)}),e.querySelectorAll(`.katex-inline svg, .katex-block svg, mjx-container svg`).forEach(e=>{e.style.removeProperty(`color`);let t=e.getAttribute(`fill`);(!t||t===`currentColor`||ir(t))&&e.setAttribute(`fill`,`currentColor`),e.querySelectorAll(`path, rect, use, g`).forEach(or)})}function cr(e){return e.localName===`text`||e.localName===`tspan`||e.closest(`foreignObject`)!=null}function lr(e){cr(e)||or(e),e.querySelectorAll(`*`).forEach(e=>{cr(e)||or(e)})}function ur(e){let t=e.getAttribute(`fill-opacity`);if(t!==null&&Number.parseFloat(t)===0)return!0;let n=e.getAttribute(`opacity`);return n!==null&&Number.parseFloat(n)===0}function dr(e){if(typeof SVGGraphicsElement>`u`)return!1;let t=1/0,n=1/0,r=-1/0,i=-1/0,a=!1;if(e.querySelectorAll(`path, line, rect, circle, ellipse, polygon, polyline, text, image, use`).forEach(e=>{if(!(!(e instanceof SVGGraphicsElement)||ur(e)))try{let o=e.getBBox();if(o.width<=0&&o.height<=0)return;a=!0,t=Math.min(t,o.x),n=Math.min(n,o.y),r=Math.max(r,o.x+o.width),i=Math.max(i,o.y+o.height)}catch{}}),!a)try{let o=e.getBBox();o.width>0&&o.height>0&&(t=o.x,n=o.y,r=o.x+o.width,i=o.y+o.height,a=!0)}catch{}if(!a)return!1;t-=2,n-=2;let o=Math.max(1,r+2-t),s=Math.max(1,i+2-n);return e.setAttribute(`viewBox`,`${t} ${n} ${o} ${s}`),!0}function fr(e,t){let n=new Set(t.map(e=>e.split(`:`)[0]?.trim()).filter(Boolean)),r=(e.getAttribute(`style`)??``).split(`;`).map(e=>e.trim()).filter(Boolean).filter(e=>{let t=e.split(`:`)[0]?.trim();return t&&!n.has(t)});e.setAttribute(`style`,`${[...r,...t].join(`; `)};`)}function pr(e,t,n,r=`inline`){if(r===`scroll`){fr(e,[`display: block`,`vertical-align: top`,`width: 100%`,`height: ${n}px`,`max-width: none`]);return}fr(e,[`display: block`,`vertical-align: top`,`width: 100%`,`max-width: ${t}px`,`height: auto`])}function mr(e){let t=Qn(e.getAttribute(`viewBox`));if(t&&t.width>0&&t.height>0)return{width:Math.max(1,Math.round(t.width)),height:Math.max(1,Math.round(t.height))};let n=Y(e.getAttribute(`width`)),r=Y(e.getAttribute(`height`));if(n&&r)return{width:n,height:r};let i=e.getBoundingClientRect(),a=n??t?.width??(i.width>0?i.width:677),o=r??t?.height??(i.height>0?i.height:a*.75);if(t&&t.width>0&&t.height>0){let e=t.height/t.width;Math.abs(o/a-e)>.01&&(o=a*e)}return{width:Math.max(1,Math.round(a)),height:Math.max(1,Math.round(o))}}function hr(e){let{width:t,height:n}=mr(e);return e.hasAttribute(`xmlns`)||e.setAttribute(`xmlns`,W),e.setAttribute(`width`,String(t)),e.setAttribute(`height`,String(n)),e.setAttribute(`preserveAspectRatio`,`xMidYMid meet`),{width:t,height:n}}function gr(e){e.setAttribute(`style`,`box-sizing: border-box; width: 100%; margin: 0; padding: 0; line-height: 0; font-size: 0;`)}function _r(e){let t=Number.parseFloat(e.getAttribute(`width`)??`0`),n=Number.parseFloat(e.getAttribute(`height`)??`0`);if(t<=677)return;let r=e.parentNode;if(!r)return;let i=document.createElement(`section`);i.setAttribute(`style`,`box-sizing: border-box; width: 100%; margin: 0; padding: 0; line-height: 0; font-size: 0;`);let a=document.createElement(`section`);a.setAttribute(`style`,`overflow-x: scroll; overflow-y: hidden; -webkit-overflow-scrolling: touch; white-space: nowrap; width: 100%; font-size: 0; line-height: 0;${n>0?` height: ${n}px;`:``}`);let o=document.createElement(`section`);o.setAttribute(`style`,`display: inline-block; width: ${t}px;${n>0?` height: ${n}px;`:``} vertical-align: top; line-height: 0; font-size: 0;`);let s=document.createElement(`p`);s.setAttribute(`style`,`font-size: 14px; color: #999; text-align: center; margin-top: 5px; margin-bottom: 0; white-space: normal;`),s.textContent=`<<< 左右滑动看更多 >>>`,pr(e,t,n,`scroll`),r.insertBefore(i,e),o.appendChild(e),a.appendChild(o),i.appendChild(a),i.appendChild(s)}function vr(e){let t=(e.getAttribute(`style`)??``).match(/max-width:\s*([\d.]+)px/i);if(!t)return null;let n=Number.parseFloat(t[1]);return Number.isFinite(n)&&n>0?n:null}function yr(e){let t=Qn(e.getAttribute(`viewBox`)),n=vr(e),r=Y(e.getAttribute(`width`)),i=n??t?.width??r??677,a=t&&t.width>0?i*(t.height/t.width):Y(e.getAttribute(`height`))??i*.75;return i>677&&(a=677/i*a,i=677),{width:Math.max(1,Math.round(i)),height:Math.max(1,Math.round(a))}}function br(e){let t=yr(e);return e.hasAttribute(`xmlns`)||e.setAttribute(`xmlns`,W),e.setAttribute(`width`,String(t.width)),e.setAttribute(`height`,String(t.height)),e.setAttribute(`preserveAspectRatio`,`xMidYMid meet`),t}function xr(e){let t=e.getBoundingClientRect(),n=Qn(e.getAttribute(`viewBox`)),r=Y(e.getAttribute(`width`)),i=Y(e.getAttribute(`height`)),a=t.width>0?t.width:r??n?.width??677,o=t.height>0?t.height:i??n?.height??a*.75;if(n&&n.width>0&&n.height>0){let e=n.height/n.width;t.width<=0&&!r?(a=n.width,o=n.height):Math.abs(o/a-e)>.01&&(o=a*e)}return a>677&&(o=677/a*o,a=677),{width:Math.max(1,Math.round(a)),height:Math.max(1,Math.round(o))}}function Sr(e){let{width:t,height:n}=xr(e);e.hasAttribute(`xmlns`)||e.setAttribute(`xmlns`,W),e.setAttribute(`width`,String(t)),e.setAttribute(`height`,String(n))}var Cr=9,wr={alphabetic:``,central:`0.35em`,middle:`0.35em`,hanging:`-0.55em`,ideographic:`0.18em`,"text-before-edge":`-0.85em`,"text-after-edge":`0.15em`};function Tr(e){e.querySelectorAll(`text, tspan`).forEach(e=>{let t=e.getAttribute(`dominant-baseline`);if(!t)return;e.removeAttribute(`dominant-baseline`);let n=wr[t];if(!n||e.getAttribute(`dy`))return;let r=X(e.getAttribute(`font-size`)||window.getComputedStyle(e).fontSize||`16`)?.n??16,i=Number.parseFloat(n);Number.isFinite(i)&&e.setAttribute(`dy`,String(Math.round(r*i*10)/10))})}function Er(e,t=!1){return t||e.closest(`.mermaid-diagram`)!=null}function X(e){let t=e.trim().match(/^(-?[\d.]+)(px|pt|em|rem|%)?$/i);if(!t)return null;let n=Number.parseFloat(t[1]);return!Number.isFinite(n)||n<=0?null:{n,unit:(t[2]||``).toLowerCase()}}function Dr(e){let t=X(e);if(!t||t.unit===`%`||t.unit===`em`||t.unit===`rem`)return null;let n=Math.max(Cr,Math.round(t.n*10)/10);return t.unit?`${n}${t.unit}`:String(n)}function Or(e){return e.replace(/(^|;)\s*font-size\s*:\s*([^;]*)/gi,(e,t,n)=>{let r=Dr(n);return r?`${t} font-size: ${r}`:e})}function kr(e){let t=e.innerHTML;if(/<br\s*\/?>/i.test(t))return t.split(/<br\s*\/?>/i).map(e=>e.replace(/<[^>]+>/g,``).replace(/&nbsp;/gi,` `).trim()).filter(Boolean);let n=(e.textContent||``).replace(/\u00A0/g,` `),r=n.split(/\n/).map(e=>e.trim()).filter(Boolean);if(r.length)return r;let i=n.replace(/\s+/g,` `).trim();return i?[i]:[]}function Ar(e){if(!e)return{x:0,y:0};let t=e.match(/translate\(\s*([-\d.eE]+)(?:[\s,]+([-\d.eE]+))?\s*\)/);return t?{x:Number.parseFloat(t[1])||0,y:Number.parseFloat(t[2]||`0`)||0}:null}function jr(e,t){let n=0;for(let r of e)n+=/[\u1100-\uD7FF\uF900-\uFAFF]/.test(r)?t:t*.55;return n}function Mr(e){if(!e)return!0;let t=e.trim().toLowerCase();return t===``||t===`transparent`||t===`none`||/^rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)$/.test(t)}function Nr(e){let t=(e.getAttribute(`style`)??``).match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i)?.[1]?.trim();if(t&&!Mr(t)&&K(t))return t;try{let t=window.getComputedStyle(e).backgroundColor;if(t&&!Mr(t)&&K(t))return t}catch{}return`#e8e8e8`}function Pr(e){let t=Array.from(e.querySelectorAll(`g.edgeLabel`));if(t.length<2)return;let n=t.map(e=>{let t=Ar(e.getAttribute(`transform`))??{x:0,y:0},n=e.querySelector(`text`),r=X(n?.getAttribute(`font-size`)||`16`)?.n??16,i=e.querySelector(`rect`),a=Number.parseFloat(i?.getAttribute(`width`)??`0`)||0,o=(n?.textContent??``).replace(/\s+/g,` `).trim(),s=a>0?a:Math.max(16,jr(o,r));return{el:e,x:t.x,y:t.y,halfW:s/2}});for(let e=0;e<n.length;e++)for(let t=e+1;t<n.length;t++){let r=n[e],i=n[t],a=i.x-r.x,o=i.y-r.y,s=Math.hypot(a,o),c=r.halfW+i.halfW+8;if(s>=c)continue;let l=1,u=0;s>=1&&(Math.abs(a)>=Math.abs(o)?(l=a/s,u=0):(l=0,u=o/s));let d=(c-s)/2;Fr(r,-l*d,-u*d),Fr(i,l*d,u*d)}}function Fr(e,t,n){e.x+=t,e.y+=n;let r=e.el.getAttribute(`transform`)??``;if(/translate\(/.test(r)){e.el.setAttribute(`transform`,r.replace(/translate\(\s*([-\d.eE]+)(?:[\s,]+([-\d.eE]+))?\s*\)/,`translate(${Ir(e.x)}, ${Ir(e.y)})`));return}e.el.setAttribute(`transform`,`translate(${Ir(e.x)}, ${Ir(e.y)})${r?` ${r}`:``}`)}function Ir(e){return Math.round(e*10)/10}function Lr(e,t=!1){Er(e,t)&&(e.querySelectorAll(`foreignObject`).forEach(e=>{let t=kr(e);if(t.length===0){e.remove();return}let n=Number.parseFloat(e.getAttribute(`x`)??`0`)||0,r=Number.parseFloat(e.getAttribute(`y`)??`0`)||0,i=Number.parseFloat(e.getAttribute(`width`)??`0`)||0,a=Number.parseFloat(e.getAttribute(`height`)??`0`)||0,o=e.querySelector(`[style], section, div, span, p`)??e,s=Jn(o)||J(o,`fill`)||window.getComputedStyle(o).color||`#333333`,c=X(J(o,`font-size`)||window.getComputedStyle(o).fontSize||`16`)?.n??16,l=`${o.getAttribute(`style`)??``} ${window.getComputedStyle(o).textAlign}`,u=/center/i.test(l)&&i>0,d=e.closest(`.edgeLabel`)!=null,f=e.getAttribute(`transform`),p=document.createElementNS(W,`text`),m=u?n+i/2:n,h=r+(a>0?Math.min(c,a*.8):c*.8);p.setAttribute(`x`,String(m)),p.setAttribute(`y`,String(h)),p.setAttribute(`fill`,K(s)?s:`#333333`),p.setAttribute(`stroke`,`none`),p.setAttribute(`font-size`,String(c)),p.setAttribute(`text-anchor`,u?`middle`:`start`),t.length===1?p.textContent=t[0]:t.forEach((e,t)=>{let n=document.createElementNS(W,`tspan`);n.setAttribute(`x`,String(m)),n.setAttribute(`dy`,t===0?`0`:`1.2em`),n.setAttribute(`fill`,K(s)?s:`#333333`),n.textContent=e,p.appendChild(n)});let g=e.parentNode;if(!g){e.remove();return}let _=d&&i>0&&a>0;if(!f&&!_){g.replaceChild(p,e);return}let v=document.createElementNS(W,`g`);if(f&&v.setAttribute(`transform`,f),_){let e=document.createElementNS(W,`rect`);e.setAttribute(`x`,String(n)),e.setAttribute(`y`,String(r)),e.setAttribute(`width`,String(i)),e.setAttribute(`height`,String(a)),e.setAttribute(`fill`,Nr(o)),e.setAttribute(`stroke`,`none`),v.appendChild(e)}v.appendChild(p),g.replaceChild(v,e)}),Pr(e))}function Rr(e,t=!1){Er(e,t)&&e.querySelectorAll(`text, tspan`).forEach(e=>{let t=e.getAttribute(`font-size`);if(t){let n=Dr(t);n&&e.setAttribute(`font-size`,n);return}let n=e.getAttribute(`style`);n&&/font-size/i.test(n)&&e.setAttribute(`style`,Or(n))})}function zr(e){e.querySelectorAll(`[clip-path], [clipPath]`).forEach(e=>{e.removeAttribute(`clip-path`),e.removeAttribute(`clipPath`)}),e.querySelectorAll(`style`).forEach(e=>e.remove()),e.querySelectorAll(`defs`).forEach(e=>e.remove()),e.querySelectorAll(`linearGradient, radialGradient, filter, clipPath, mask, pattern, symbol`).forEach(e=>e.remove()),e.querySelectorAll(`*`).forEach(e=>{e.removeAttribute(`id`),e.removeAttribute(`class`)}),e.removeAttribute(`id`),e.removeAttribute(`class`)}function Br(e,t){let n=Array.from(e.querySelectorAll(`svg`));if(n.length===0)return;let r=document.createElement(`div`);r.style.cssText=`position:fixed;left:-99999px;top:0;visibility:hidden;pointer-events:none;width:677px;`,document.body.appendChild(r);try{for(let e of n){if(er(e))continue;let n=e.parentElement,i=e.nextSibling,a=Er(e),o=$n(e);r.appendChild(e),t(e,{mermaid:a,plantuml:o}),n&&n.insertBefore(e,i)}}finally{r.remove()}}function Vr(e){Br(e,(e,{mermaid:t})=>{Gn(e),Wn(e),Xn(e),Lr(e,t),Tr(e)})}function Hr(e,t){let n=t?.plantuml??$n(e),r=t?.mermaid??Er(e);if(zn(e),Gn(e),Wn(e),Xn(e),Lr(e,r),Zn(e),lr(e),Tr(e),e.setAttribute(`overflow`,`visible`),e.querySelectorAll(`[style]`).forEach(e=>{let t=e.getAttribute(`style`);t&&/overflow\s*:\s*hidden/i.test(t)&&e.setAttribute(`style`,t.replace(/overflow\s*:\s*hidden/gi,`overflow: visible`))}),n){dr(e);let t=hr(e);t.width<=677&&pr(e,t.width,t.height)}else r?(br(e),Rr(e,!0)):Sr(e);zr(e)}function Ur(e){let t=[];Br(e,(e,{mermaid:n,plantuml:r})=>{Hr(e,{plantuml:r,mermaid:n}),r&&t.push(e)});for(let e of t){let t=e.closest(`.plantuml-diagram`);t&&gr(t),_r(e)}}var Wr={inlinePseudoElements:!0,preserveImportant:!0,resolveCSSVariables:!1};async function Gr(e){let{default:t}=await v(async()=>{let{default:e}=await import(`./md-client-opt-AQ5m.js`);return{default:e}},__vite__mapDeps([29,1,28,30,31])),n=mn(e),r=[()=>t(n,Wr),()=>t(n,{...Wr,inlinePseudoElements:!1}),()=>t(hn(n),{...Wr,inlinePseudoElements:!1})];for(let e of r)try{return e()}catch(e){console.warn(`WeChat copy: juice failed, trying fallback`,e)}return n}async function Kr(e){let t=document.getElementById(`output`);if(!t)return{html:``,plainText:``,hasPendingAsyncContent:!1};let n=nn(),r=vt(),i=tn(),a=Bi(),o=r.getContent(),s=`light`,c=a.isDark;c&&n.render(o,{themeMode:s,force:!0});let l=await V(void 0,{themeMode:s});try{let n=t.cloneNode(!0);_t(n),Vr(n);let r=await En();r&&(n.innerHTML=r+n.innerHTML),pn(n),n.innerHTML=_n(await Gr(n.innerHTML)),n.querySelectorAll(`a[href^="#"]`).forEach(e=>e.removeAttribute(`href`)),n.innerHTML=n.innerHTML.replace(/([^-])top:(.*?)em/g,`$1transform: translateY($2em)`).replace(/hsl\(var\(--foreground\)\)/g,`#3f3f3f`).replace(/var\(--blockquote-background\)/g,`#f7f7f7`).replace(/var\(--md-primary-color\)/g,e).replace(/var\(--md-font-family\)/g,i.fontFamily).replace(/var\(--md-font-size\)/g,i.fontSize).replace(/var\(--md-line-height\)/g,i.lineHeight).replace(/var\(--md-block-spacing\)/g,i.blockSpacing).replace(/--md-primary-color:.+?;/g,``).replace(/--md-font-family:.+?;/g,``).replace(/--md-font-size:.+?;/g,``).replace(/--md-line-height:.+?;/g,``).replace(/--md-block-spacing:.+?;/g,``).replace(/--md-link-color:.+?;/g,``).replace(/--md-blockquote-background:.+?;/g,``).replace(/<span class="nodeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g,`<span class="nodeLabel"$1>$2</span>`).replace(/<span class="edgeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g,`<span class="edgeLabel"$1>$2</span>`),gn(n);let a=vn(),o=vn();return n.insertBefore(a,n.firstChild),n.appendChild(o),yn(n),Ur(n),sr(n),{html:n.innerHTML,plainText:n.textContent||``,hasPendingAsyncContent:!l}}finally{c&&n.render(o,{themeMode:`dark`,force:!0})}}var Z=`[data-png-export-host]`,qr=`png-export-root`;function Q(e,t){for(let[n,r]of Object.entries(t))e.style.setProperty(n,r,`important`)}function Jr(e){let t=e.getAttribute(`style`)??``;return/overflow(?:-x)?:\s*(?:auto|scroll)/.test(t)}function Yr(e){Q(e,{width:`100%`,maxWidth:`100%`,tableLayout:`fixed`}),e.querySelectorAll(`th, td`).forEach(e=>{Q(e,{wordBreak:`break-word`,whiteSpace:`normal`,overflowWrap:`anywhere`})})}function Xr(e){e.querySelectorAll(`.code-scroll`).forEach(e=>{Q(e,{overflow:`visible`}),e.querySelectorAll(`div`).forEach(e=>{Q(e,{whiteSpace:`pre-wrap`,wordBreak:`break-all`,minWidth:`auto`,maxWidth:`100%`})})}),e.querySelectorAll(`pre.code__pre, .hljs.code__pre`).forEach(e=>{Q(e,{overflow:`visible`})}),e.querySelectorAll(`pre.code__pre > code, .hljs.code__pre > code`).forEach(e=>{Q(e,{overflow:`visible`,whiteSpace:`pre-wrap`,wordBreak:`break-all`,minWidth:`auto`,maxWidth:`100%`})}),e.querySelectorAll(`pre section, code section`).forEach(e=>{Q(e,{overflow:`visible`})})}function Zr(e){e.querySelectorAll(`table.preview-table`).forEach(e=>{let t=e.parentElement;t?.tagName===`SECTION`&&Q(t,{overflow:`visible`,maxWidth:`100%`}),Yr(e)}),e.querySelectorAll(`section`).forEach(e=>{!Jr(e)||!e.querySelector(`table`)||(Q(e,{overflow:`visible`}),e.querySelectorAll(`table`).forEach(Yr))}),Xr(e)}function Qr(e,t){return e.split(`
`).map(e=>{let n=e.trimStart();if(!n||n.startsWith(`/*`))return e;let r=n.match(/^([^{]+)\{/);if(!r)return e;let i=r[1].trim(),a=i.split(`,`).map(e=>`${t} ${e.trim()}`).join(`, `);return e.replace(i,a)}).join(`
`)}function $r(e){let t=`${Z} .${qr}`,n=e;return n=n.replace(/#output\s*\{/g,`${t} {`),n=n.replace(/#output\s+/g,`${t} `),n=n.replace(/^#output\s*/gm,`${t} `),n}var ei=`
  section:has(> table.preview-table) { overflow: visible !important; }
  table.preview-table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; }
  table.preview-table th, table.preview-table td { word-break: break-word !important; white-space: normal !important; overflow-wrap: anywhere !important; }
  section[style*="overflow-x: auto"], section[style*="overflow: auto"] { overflow: visible !important; }
  section[style*="overflow-x: auto"] table, section[style*="overflow: auto"] table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; }
  section[style*="overflow-x: auto"] th, section[style*="overflow-x: auto"] td, section[style*="overflow: auto"] th, section[style*="overflow: auto"] td { word-break: break-word !important; white-space: normal !important; overflow-wrap: anywhere !important; }
  pre.code__pre, .hljs.code__pre, pre.code__pre > code, .hljs.code__pre > code, .code-scroll, pre section, code section { overflow: visible !important; }
  pre.code__pre > code, .code-scroll, .code-scroll > div { white-space: pre-wrap !important; word-break: break-all !important; min-width: auto !important; max-width: 100% !important; }
`,ti=ei.trim();function ni(e){return Qr(ei,e).trim()}function ri(){return document.documentElement.classList.contains(`dark`)&&document.getElementById(`output-wrapper`)?.classList.contains(`output_night`)?`#191919`:`#fff`}var ii=`
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
`;async function ai(){let e=document.querySelector(`#md-theme`);if(!e?.textContent)return``;let t=document.documentElement.classList.contains(`dark`),n=[`<style>${t?`${Z} { --foreground: 0 0% 98%; --blockquote-background: #212121; }`:`${Z} { --foreground: 0 0% 3.9%; --blockquote-background: #f7f7f7; }`}</style>`,`<style>${ii}</style>`,`<style>${$r(e.textContent)}</style>`,`<style>${ni(Z)}</style>`],r=document.querySelector(`#hljs`);if(r)try{let e=await(await fetch(r.href)).text();n.push(`<style>@scope (${Z}) { ${e} }</style>`)}catch{}return t&&document.getElementById(`output-wrapper`)?.classList.contains(`output_night`)&&n.push(`<style>${Z} .output_night .preview { background-color: #191919; }</style>`),n.join(``)}function oi(e){let t=document.querySelector(`#output`);if(!t)return``;let n=t.cloneNode(!0);return n.querySelectorAll(`.diagram-download-bar`).forEach(e=>e.remove()),Me(n,e?.themeMode?{themeMode:e.themeMode}:void 0),e?.staticLayout&&Zr(n),n.innerHTML}async function si(e=`untitled`){await V();let t=oi({staticLayout:!0}),n=await En();B(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${z(e)}</title>
  <style>${bn}</style>
  ${n}
  <style>${ti}</style>
</head>
<body>
  <div style="width: 750px; margin: auto; padding: 20px;">
    ${t}
  </div>
</body>
</html>`,`${z(e)}.html`,`text/html`)}async function ci(e,t=`untitled`){let n=z(t);B(await Fe(e),`${n}.html`,`text/html`)}var $={showPageNumbers:!0,pageNumberFormat:`nOfM`,pageNumberPosition:`bottomRight`,showTitleHeader:!0,showSiteFooter:!0,margins:`default`},li=new Set([`nOfM`,`n`]),ui=new Set([`bottomLeft`,`bottomCenter`,`bottomRight`]),di=new Set([`compact`,`default`,`comfortable`]),fi={compact:`1cm`,default:`1.5cm 1cm 2cm 1cm`,comfortable:`2cm 1.5cm 2.5cm 1.5cm`},pi=`0.5cm`,mi=`https://md.doocs.org`;function hi(e=window.location){return e.protocol===`http:`||e.protocol===`https:`?e.origin:mi}function gi(e){return e.replace(/\\/g,`\\\\`).replace(/"/g,`\\"`)}var _i={bottomLeft:`@bottom-left`,bottomCenter:`@bottom-center`,bottomRight:`@bottom-right`},vi=[`@bottom-left`,`@bottom-center`,`@bottom-right`],yi=[`@top-left-corner`,`@top-left`,`@top-center`,`@top-right`,`@top-right-corner`,`@bottom-left-corner`,`@bottom-left`,`@bottom-center`,`@bottom-right`,`@bottom-right-corner`,`@left-top`,`@left-middle`,`@left-bottom`,`@right-top`,`@right-middle`,`@right-bottom`];function bi(e){let t=fi[e].trim().split(/\s+/);return t.length===1?{top:t[0],right:t[0],bottom:t[0],left:t[0]}:t.length===2?{top:t[0],right:t[1],bottom:t[0],left:t[1]}:t.length===3?{top:t[0],right:t[1],bottom:t[2],left:t[1]}:{top:t[0],right:t[1],bottom:t[2],left:t[3]}}function xi({top:e,right:t,bottom:n,left:r}){return e===t&&t===n&&n===r?e:e===n&&t===r?`${e} ${t}`:`${e} ${t} ${n} ${r}`}function Si(e,t,n=``){return`
      ${e} {
        content: ${t};${n}
      }`}function Ci(e,t){return Si(e,`""`,t?`
        width: 0;
        max-width: 0;
        padding: 0;
        margin: 0;
        overflow: hidden;`:``)}function wi(e){for(let t of vi)if(t!==e)return t;return null}function Ti(e){let t=e??{};return{showPageNumbers:typeof t.showPageNumbers==`boolean`?t.showPageNumbers:$.showPageNumbers,pageNumberFormat:li.has(t.pageNumberFormat)?t.pageNumberFormat:$.pageNumberFormat,pageNumberPosition:ui.has(t.pageNumberPosition)?t.pageNumberPosition:$.pageNumberPosition,showTitleHeader:typeof t.showTitleHeader==`boolean`?t.showTitleHeader:$.showTitleHeader,showSiteFooter:typeof t.showSiteFooter==`boolean`?t.showSiteFooter:$.showSiteFooter,margins:di.has(t.margins)?t.margins:$.margins}}function Ei(e,t,n=hi()){let r=Ti(e),i=z(t),a=gi(n),s=bi(r.margins),c=r.showPageNumbers?_i[r.pageNumberPosition]:null,l=r.showSiteFooter?wi(c):null,u=r.showTitleHeader,d=!!(c||l),f=s.left,p={top:u?s.top:f,right:s.right,bottom:d?s.bottom:f,left:s.left},m=new Map;if(r.showTitleHeader&&m.set(`@top-center`,Si(`@top-center`,`"${i}"`,`
        font-size: 12px;
        color: #666;
        vertical-align: bottom;
        padding-bottom: ${pi};`)),l&&m.set(l,Si(l,`"${a}"`,`
        font-size: 10px;
        color: #999;
        vertical-align: top;
        padding-top: ${pi};
        white-space: nowrap;`)),r.showPageNumbers&&c){let e=r.pageNumberFormat===`n`?o(`store.pdf.pageFooterN`):o(`store.pdf.pageFooter`);m.set(c,Si(c,`"${e}"`,`
        font-size: 10px;
        color: #999;
        vertical-align: top;
        padding-top: ${pi};
        white-space: nowrap;`))}let h=yi.map(e=>m.get(e)||Ci(e,vi.includes(e)&&!!(l||c)));return`
    @page {
      margin: ${xi(p)};${h.join(``)}
    }

    html, body {
      margin: 0;
    }`}async function Di(e=`untitled`,t){await V();let n=oi({staticLayout:!0}),r=await En(),i=`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${z(e)}</title>
  <style>${bn}</style>
  ${r}
  <style>${ti}</style>
  <style>
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    ${Ei(Ti(t),e,hi())}
  </style>
</head>
<body>
  <div style="width: 100%; max-width: 750px; margin: auto;">
    ${n}
  </div>
</body>
</html>`,a=new Blob([i],{type:`text/html`}),o=URL.createObjectURL(a),s=document.createElement(`iframe`);s.style.cssText=`position:fixed;width:0;height:0;top:-9999px;left:-9999px;border:none;`,s.src=o,document.body.appendChild(s);let c=()=>{URL.revokeObjectURL(o),s.parentNode&&document.body.removeChild(s)};s.onload=()=>{s.contentWindow?.focus(),s.contentWindow?.print(),setTimeout(c,500)},s.onerror=()=>{c()},setTimeout(c,5e3)}async function Oi(e){let t=document.getElementById(`output`);if(!t)return null;let n=document.documentElement.classList.contains(`dark`)&&document.getElementById(`output-wrapper`)?.classList.contains(`output_night`),r=e===`mobile`?`375px`:`750px`,i=document.createElement(`div`);i.setAttribute(`data-png-export-host`,``),i.style.cssText=`position:fixed;left:-99999px;top:0;z-index:-1;visibility:visible;pointer-events:none;`,i.innerHTML=await ai();let a=document.createElement(`div`);a.className=n?`output_night`:``,a.style.width=r;let o=document.createElement(`div`);o.className=`preview border-x shadow-xl mx-auto`,o.style.width=r,o.style.margin=`0`;let s=t.cloneNode(!0);return s.removeAttribute(`id`),s.classList.add(qr),s.style.width=`100%`,s.querySelectorAll(`.diagram-download-bar`).forEach(e=>e.remove()),_t(s),Zr(s),o.appendChild(s),a.appendChild(o),i.appendChild(a),document.body.appendChild(i),{el:o,content:s,cleanup:()=>i.remove()}}function ki(){return{backgroundColor:ri(),skipFonts:!0,pixelRatio:Math.max(window.devicePixelRatio||1,2),style:{margin:`0`}}}async function Ai(e=`untitled`,t){await V();let n=await Oi(t.previewDevice);if(n)try{await ut(100);let{toPng:t}=await v(async()=>{let{toPng:e}=await import(`./md-es-DeL8xkxc.js`);return{toPng:e}},[]);B(await t(n.el,ki()),`${z(e)}.png`,`image/png`)}finally{n.cleanup()}}var ji=[2e3,4e3,6e3,8e3],Mi=4e3;function Ni(e,t){if(e.length===0)return[];let n=[],r=[],i=e[0].top;for(let a=0;a<e.length;a++)e[a].bottom-i>t&&r.length>0&&(n.push(r),r=[],i=e[a].top),r.push(a);return r.length>0&&n.push(r),n}function Pi(e){return e.map(e=>{let t=e.getBoundingClientRect();return{top:t.top,bottom:t.bottom}})}function Fi(e){let t=e;for(;t.children.length===1;){let e=t.firstElementChild;if(e.tagName!==`SECTION`&&e.tagName!==`DIV`)break;t=e}return t}function Ii(e){return Array.from(e.children).filter(e=>{let t=e.getBoundingClientRect();return t.width>0||t.height>0})}async function Li(e,t){let{zip:n}=await v(async()=>{let{zip:e}=await import(`./md-browser-C7tAaLTR.js`).then(e=>e.t);return{zip:e}},__vite__mapDeps([14,1])),r={},i=String(e.length).length;for(let n=0;n<e.length;n++){let a=String(n+1).padStart(i,`0`);r[`${t}-${a}.png`]=new Uint8Array(await e[n].arrayBuffer())}let a=await new Promise((e,t)=>n(r,(n,r)=>n?t(n):e(r))),o=URL.createObjectURL(new Blob([a],{type:`application/zip`}));try{B(o,`${t}.zip`,`application/zip`)}finally{URL.revokeObjectURL(o)}}function Ri(e,t){let n=URL.createObjectURL(e);try{B(n,`${t}.png`,`image/png`)}finally{URL.revokeObjectURL(n)}}async function zi(e=`untitled`,t){await V();let n=await Oi(t.previewDevice);if(!n)return 0;try{await ut(100);let r=Ii(Fi(n.content));if(r.length===0)return 0;let i=Ni(Pi(r),t.maxSegmentHeight),a=ki(),{toBlob:o}=await v(async()=>{let{toBlob:e}=await import(`./md-es-DeL8xkxc.js`);return{toBlob:e}},[]),s=r.map(e=>e.style.display),c=[];try{for(let e=0;e<i.length;e++){let l=new Set(i[e]);r.forEach((e,t)=>{e.style.display=l.has(t)?s[t]:`none`});let u=await o(n.el,a);u&&c.push(u),t.onProgress?.(e+1,i.length)}}finally{r.forEach((e,t)=>{e.style.display=s[t]})}if(c.length===0)return 0;let l=z(e);return c.length===1?Ri(c[0],l):await Li(c,l),c.length}finally{n.cleanup()}}var Bi=m(`ui`,()=>{let t=Oe(),r=N(t),i=n.reactive(`showAIToolbox`,!0),a=N(i),o=n.reactive(`hasShownAIToolboxHint`,!1),s=n.reactive(e(`is_open_right_slider`),!1),c=n.reactive(e(`is_open_post_slider`),!1),l=n.reactive(e(`is_open_folder_panel`),!1),u=n.reactive(`isMobile`,!1),f=n.reactive(`viewMode`,`split`);function p(e){f.value=e}let m=n.reactive(`previewDevice`,`mobile`);function g(e){m.value=e}function v(){m.value=m.value===`desktop`?`mobile`:`desktop`}let y=n.reactive(e(`enableImageReupload`),!1),b=N(y),x=n.reactive(e(`enableScrollSync`),!0),S=N(x),C=n.reactive(e(`copyMode`),`txt`),w=n.reactive(`isShowCssEditor`,!1),T=N(w),E=h(!1);function ee(){E.value=!0}function te(){E.value=!1}let ne=h(!1),re=N(ne),D=h(!1),ie=h(``),O=h(!0),ae=h(null);function oe(e={}){ie.value=e.value??``,O.value=e.displayMode??!0,ae.value=e.sourceRaw??null,D.value=!0}function se(){D.value=!1,ie.value=``,O.value=!0,ae.value=null}let ce=h(!1),le=N(ce),ue=h(null),de=h(!1),fe=N(de),k=h(null),pe=h(!1),me=N(pe),he=h(!1),ge=N(he),_e=h(!1),ve=h(`theme`),ye=h(`discover`);function be(e){e?.tab,ve.value=`theme`,ye.value=e?.view??`discover`,_e.value=!0}let xe=h(!1),A=N(xe),Se=h(!1),Ce=N(Se),we=h(!1),j=h(`create`);function Te(e){j.value=e?.tab??`create`,we.value=!0}let Ee=h(!1),M=n.reactive(`pdfExportOptions`,{...$});function De(){M.value=Ti(M.value),Ee.value=!0}let ke=h(!1),Ae=N(ke),je=h(!1),Me=N(je),P=h(!1),Ne=N(P),Pe=h(!1),Fe=N(Pe),Ie=h(!1),Le=N(Ie),Re=h(!1),ze=N(Re),Be=h(!1),F=N(Be),Ve=h(null);function He(e){Ve.value=e,he.value=!0}let I=h(!1),L=h(!1);function Ue(e){I.value=e??!I.value}function We(e){L.value=e??!L.value}let Ge=h(null);function Ke(e=``,t=!1){Ge.value={word:e,showReplace:t}}function qe(){Ge.value=null}let Je=h(0);function Ye(){Je.value++}let Xe=!1;function Ze(){let e=u.value;u.value=window.innerWidth<=768,!e&&u.value&&f.value===`split`?(f.value=`edit`,Xe=!0):e&&!u.value&&Xe&&(f.value=`split`,Xe=!1)}return _(()=>{Ze(),window.addEventListener(`resize`,Ze)}),d(()=>{window.removeEventListener(`resize`,Ze)}),{isDark:t,showAIToolbox:i,hasShownAIToolboxHint:o,isOpenRightSlider:s,isOpenPostSlider:c,isMobile:u,viewMode:f,previewDevice:m,isOpenFolderPanel:l,enableImageReupload:y,enableScrollSync:x,copyMode:C,isShowCssEditor:w,toggleShowCssEditor:T,isShowTableEditDialog:E,openTableEditDialog:ee,closeTableEditDialog:te,isShowUploadImgDialog:ne,toggleShowUploadImgDialog:re,isShowFormulaEditorDialog:D,formulaEditorValue:ie,formulaEditorDisplayMode:O,formulaEditorSourceRaw:ae,openFormulaEditor:oe,closeFormulaEditor:se,isShowImportMdDialog:ce,toggleShowImportMdDialog:le,importMdOpenUrl:ue,isShowLocalImageUpload:de,toggleShowLocalImageUpload:fe,localImageUploadData:k,isShowTemplateDialog:pe,toggleShowTemplateDialog:me,isShowComponentDialog:he,toggleShowComponentDialog:ge,isShowMarketplaceDialog:_e,marketplaceDialogTab:ve,marketplaceDialogView:ye,openMarketplaceDialog:be,isShowSyncDialog:xe,toggleShowSyncDialog:A,isShowAccountDialog:Se,toggleShowAccountDialog:Ce,isShowShareDialog:we,shareDialogInitialTab:j,openShareDialog:Te,isShowPdfExportDialog:Ee,openPdfExportDialog:De,pdfExportOptions:M,isShowAboutDialog:ke,toggleShowAboutDialog:Ae,isShowFundDialog:je,toggleShowFundDialog:Me,isShowMarkdownHelpDialog:P,toggleShowMarkdownHelpDialog:Ne,isShowEditorStateDialog:Pe,toggleShowEditorStateDialog:Fe,isShowPreferencesDialog:Ie,toggleShowPreferencesDialog:Le,isShowKeyboardShortcutsDialog:Re,toggleShowKeyboardShortcutsDialog:ze,isShowCommandPalette:Be,toggleShowCommandPalette:F,componentDialogTarget:Ve,openComponentDialogWithTarget:He,aiDialogVisible:I,toggleAIDialog:Ue,aiImageDialogVisible:L,toggleAIImageDialog:We,searchTabRequest:Ge,openSearchTab:Ke,clearSearchTabRequest:qe,goToLineRequest:Je,requestGoToLine:Ye,toggleDark:r,toggleAIToolbox:a,toggleImageReupload:b,toggleScrollSync:S,setViewMode:p,setPreviewDevice:g,togglePreviewDevice:v}});export{Bt as A,vt as B,Lt as C,Pt as D,zt as E,Et as F,lt as G,V as H,bt as I,nt as J,ct as K,Tt as L,At as M,Ot as N,Rt as O,Dt as P,Ct as R,It as S,Ft as T,ut as U,_t as V,B as W,qe as X,R as Y,L as Z,en as _,Ai as a,U as b,hi as c,oi as d,Kr as f,tn as g,nn as h,zi as i,jt as j,Vt as k,si as l,Sn as m,Mi as n,Di as o,Tn as p,z as q,ji as r,Ti as s,Bi as t,ci as u,Xt as v,Nt as w,Mt as x,Kt as y,wt as z};