const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["static/js/md-formatDoc-C_tIUTCU.js","static/js/md-rolldown-runtime-Dd_uD5pT.js","static/js/md-preload-helper-DHWoSnHi.js","static/js/md-dist-Co6GKv7W.js","static/js/md-codemirror-CveyKXnv.js","static/js/md-dist-BZLmrK2s.js","static/js/md-dist-_JdCYmsK.js","static/js/md-dist-9K0s_aX-.js","static/js/md-dist-CqeJHkCL.js","static/js/md-dist-AfLSDLd9.js","static/js/md-dist-DRXxSsJI.js","static/js/md-dist-Dha7yNHa.js","static/js/md-dist-CLueNt6w.js","static/js/md-dist-Djv2VHXp.js","static/js/md-dist-FYolOnTl.js","static/js/md-browser-DF3hgwXO.js","static/js/md-marketplace-3wdZILCH.js","static/js/md-src-BLDfM4n_.js","static/js/md-extensions-CH0ILgxE.js","static/js/md-highlight-i2QVtVCd.js","static/js/md-purify.es-CaHOtzI7.js","static/js/md-decode-nKwzHfeR.js","static/js/md-configs-DFhBJpoB.js","static/js/md-fetch-B1x2Hpbf.js","static/js/md-vendor_vue-B11HoLf8.js","static/js/md-storage-BsGVinW9.js","static/js/md-v4-DDdyfk2q.js","static/js/md-translate-Bvdc8i-i.js","static/js/md-vue-i18n-DgcSxpuH.js","static/js/md-lib-DT3IzMhK.js","static/js/md-oauth-kEMWpAB8.js","static/js/md-auth-DHc3BhSq.js","static/js/md-client-DTEXUKf4.js","static/js/md-postcss-D9wFxyL6.js","static/js/md-__vite-browser-external-BqtCiL5p.js"])))=>i.map(i=>d[i]);
import{Q as e,Z as t,l as n,r,tt as i,v as a,y as o}from"./md-extensions-CH0ILgxE.js";import{t as s}from"./md-preload-helper-DHWoSnHi.js";import{a as c,d as l,f as u,r as d,u as f}from"./md-src-BLDfM4n_.js";import{F as p,I as m,L as h,R as g,Z as _,dt as v,lt as y,n as b,st as ee,v as x}from"./md-vendor_vue-B11HoLf8.js";import{f as S,p as C,u as w}from"./md-storage-BsGVinW9.js";import{i as T,r as te,u as ne}from"./md-configs-DFhBJpoB.js";import{n as re,r as E}from"./md-translate-Bvdc8i-i.js";import{n as D}from"./md-lib-DT3IzMhK.js";import{$ as ie,A as ae,B as O,C as oe,D as se,E as k,G as ce,H as le,I as ue,J as de,M as fe,N as A,O as pe,P as j,S as me,T as he,X as M,_t as ge,a as _e,bt as N,ct as P,dt as ve,et as ye,f as be,ft as xe,gt as Se,ht as F,i as I,j as Ce,k as we,lt as Te,mt as Ee,n as De,pt as Oe,t as ke,ut as Ae,vt as je,w as Me,x as Ne,xt as Pe,yt as Fe}from"./md-codemirror-CveyKXnv.js";import{D as L,a as Ie}from"./md-vendor_vueuse-BXy9GvFq.js";function R(e){let t=/[\\/:*?"<>|]/g;if(!t.test(e)&&e.length<=100)return e.trim()||`untitled`;let n=e.replace(t,`_`).trim();return(n.length>100?n.slice(0,100):n)||`untitled`}function Le(e){let t=e.split(`
`),n=t.filter(e=>e.trim()).map(e=>e.match(/(^\s+)?/)[0].length).sort((e,t)=>e-t)[0];return t.map(e=>e.slice(n)).join(`
`)}function z(e){return new Promise(t=>window.setTimeout(t,e))}var Re=2e4,B=250,V=`.mermaid-diagram, .plantuml-diagram, .infographic-diagram`;function ze(e){return e?.themeMode?{themeMode:e.themeMode}:void 0}function Be(e){for(let t of e.querySelectorAll(V))if(i(t))return!0;return!1}function H(e){if(e.querySelector(`.katex-fallback`))return!0;for(let t of e.querySelectorAll(`.katex-block, .katex-inline`))if(!t.querySelector(`svg, mjx-container`))return!0;return!1}async function U(e=Re,t){await p(),await p();let n=document.getElementById(`output`);if(!n)return!1;let i=ze(t),a=Date.now()+e;for(;Date.now()<a;){if(r(n,i),!Be(n)&&!H(n))return!0;await z(B)}return r(n,i),!Be(n)&&!H(n)}function W(n){n.querySelectorAll(V).forEach(n=>{n.querySelector(`svg, img`)||n.getAttribute(e)===t.loading&&n.remove()}),n.querySelectorAll(`.katex-pending`).forEach(e=>{e.querySelector(`svg, mjx-container`)||e.remove()})}var G=b(`editor`,()=>{let e=v(null),t=null;function n(e){t=e}function r(){t=null}function i(){t?.()}return{editor:e,registerContentFlush:n,unregisterContentFlush:r,flushContentToPostStore:i,formatContent:async()=>{if(!e.value)return;let{formatDoc:t}=await s(async()=>{let{formatDoc:e}=await import(`./md-formatDoc-C_tIUTCU.js`);return{formatDoc:e}},__vite__mapDeps([0,1,2])),n=await t(e.value.state.doc.toString());return e.value.dispatch({changes:{from:0,to:e.value.state.doc.length,insert:n}}),n},importContent:t=>{e.value&&e.value.dispatch({changes:{from:0,to:e.value.state.doc.length,insert:t}})},clearContent:()=>{e.value&&(e.value.dispatch({changes:{from:0,to:e.value.state.doc.length,insert:``}}),D.success(E(`store.editor.contentCleared`)))},getContent:()=>e.value?.state.doc.toString()??``,getSelection:()=>{if(!e.value)return``;let t=e.value.state.selection.main;return e.value.state.doc.sliceString(t.from,t.to)},replaceSelection:t=>{e.value&&e.value.dispatch(e.value.state.replaceSelection(t))},replaceText:(t,n)=>{if(!e.value||!t)return!1;let r=e.value.state.doc.toString(),i=e.value.state.selection.main.head,a=-1,o=1/0,s=0;for(;;){let e=r.indexOf(t,s);if(e===-1)break;let n=Math.abs(e-i);n<o&&(o=n,a=e),s=e+1}return a!==-1&&(e.value.dispatch({changes:{from:a,to:a+t.length,insert:n}}),e.value.focus(),!0)},insertAtCursor:t=>{if(!e.value)return;let n=e.value.state.selection.main;e.value.dispatch({changes:{from:n.from,to:n.to,insert:t},selection:{anchor:n.from+t.length}}),e.value.focus()}}});function Ve(e){let t={};for(let n of e.matchAll(/(\w[\w-]*)=(?:"([^"]*)"|'([^']*)')/g))t[n[1]]=n[2]===void 0?n[3]??``:n[2];return t}function K(e){let t=new Set;for(let n of e.matchAll(/(\w[\w-]*)=(?:"[^"]*"|'[^']*')/g))t.add(n[1]);let n=e.match(/(?:^|\s)([A-Z_][\w-]*)\s*=\s*(?:"[^"]*|'[^']*)?$/i);return n&&t.add(n[1]),t}function q(e){return e.default!==void 0&&e.default!==``?e.default:e.type===`array`?`[]`:e.type===`boolean`?`true`:e.type===`number`?`0`:e.name}function He(e,t){return t.includes(`"`)&&!t.includes(`'`)?`${e}='${t}'`:t.includes(`"`)&&t.includes(`'`)?`${e}="${t.replace(/"/g,`'`)}"`:`${e}="${t}"`}function Ue(e){let t={};for(let n of e.props)n.required&&(n.default===void 0||n.default===``)?t[n.name]=``:t[n.name]=q(n);if(e.example){let n=Ve(e.example);Object.assign(t,n)}return t}function We(e,t){return e.props.filter(e=>e.required&&!(t[e.name]??``).trim()).map(e=>e.name)}function Ge(e,t){if(t){let n=[];for(let r of e.props){let e=t[r.name],i=e===void 0?``:e;i===``&&!r.required||n.push(He(r.name,i===``?q(r):i))}return`<${e.name}${n.length?` ${n.join(` `)}`:``} />`}if(e.example)return e.example;let n=e.props.map(e=>He(e.name,q(e))).join(` `);return`<${e.name}${n?` ${n}`:``} />`}var Ke=b(`customComponent`,()=>{let e=w.reactive(S(`custom_components`),[]),t=x(()=>l),n=x(()=>{let t=new Map(l.map(e=>[e.name,e]));for(let n of e.value)t.set(n.name,n);return[...t.values()]}),r=x(()=>{let t=u();for(let n of e.value)t[n.name]=n;return t});function i(t){let n=Date.now(),r={id:C(),name:t.name,description:t.description,template:t.template,props:t.props,createdAt:n,updatedAt:n};return e.value.push(r),D.success(E(`store.component.created`,{name:t.name})),r}function a(t,n){let r=e.value.findIndex(e=>e.id===t);return r===-1?(D.error(E(`store.component.notFound`)),!1):(e.value[r]={...e.value[r],...n,updatedAt:Date.now()},D.success(E(`store.component.updated`)),!0)}function o(t){let n=e.value.findIndex(e=>e.id===t);if(n===-1)return D.error(E(`store.component.notFound`)),!1;let r=e.value[n].name;return e.value.splice(n,1),D.success(E(`store.component.deleted`,{name:r})),!0}function s(t){return e.value.find(e=>e.id===t)}function c(e,t){return Ge(e,t)}return{userComponents:e,builtInComponents:t,allComponents:n,registry:r,createComponent:i,updateComponent:a,deleteComponent:o,getComponentById:s,buildSnippet:c}});function qe(e){return`mp:${e}`}function Je(e){return e.startsWith(`mp:`)&&e.length>3}var Ye={"zh-CN":`/* 全局变量 */
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
`};function Xe(e=`zh-CN`){return Ye[e]??Ye[`zh-CN`]}var Ze=[Oe(),Ee(),k(),de(),Ae(),ve(),N.allowMultipleSelections.of(!0),ie(),ye(ce,{fallback:!0}),le(),A(),fe(),ge(),Te(),xe(),me(),Ne(),F.of([...j,...he,...oe,...se,...M,...ue,...Me,{key:`Tab`,run:Ce},pe])];function J(e,{prefix:t,suffix:n,check:r,afterInsertCursorOffset:i=0}){let a=e.state.selection.main,o=e.state.doc.sliceString(a.from,a.to),s=r?.(o)??!1,c;if(s)c=o.slice(t.length,o.length-n.length),e.dispatch(e.state.replaceSelection(c));else if(c=`${t}${o}${n}`,e.dispatch(e.state.replaceSelection(c)),i!==0){let t=e.state.selection.main.head+i;e.dispatch({selection:{anchor:t}})}}function Y(e,t){let n=e.state.selection.ranges,r=[],i=`${`#`.repeat(t)} `;if(n.forEach(t=>{let n=e.state.doc.lineAt(t.from),a=e.state.doc.lineAt(t.to);for(let t=n.number;t<=a.number;t++){let n=e.state.doc.line(t),a=e.state.doc.sliceString(n.from,n.to).replace(/^#{1,6}\s+/,``).trimStart(),o=i+a;r.push({from:n.from,to:n.to,insert:o})}}),r.length>0){let t=e.state.doc.lineAt(n[0].from).from+i.length;e.dispatch({changes:r,selection:{anchor:t}})}}function Qe(e){J(e,{prefix:`**`,suffix:`**`,check:e=>e.startsWith(`**`)&&e.endsWith(`**`),afterInsertCursorOffset:-2})}function $e(e){J(e,{prefix:`*`,suffix:`*`,check:e=>e.startsWith(`*`)&&e.endsWith(`*`),afterInsertCursorOffset:-1})}function et(e){J(e,{prefix:`~~`,suffix:`~~`,check:e=>e.startsWith(`~~`)&&e.endsWith(`~~`),afterInsertCursorOffset:-2})}function tt(e){J(e,{prefix:`[`,suffix:`]()`,check:e=>e.startsWith(`[`)&&e.endsWith(`]()`),afterInsertCursorOffset:-1})}function nt(e){J(e,{prefix:"`",suffix:"`",check:e=>e.startsWith("`")&&e.endsWith("`"),afterInsertCursorOffset:-1})}function rt(e,t){let n=e.state.selection.main,r=e.state.doc.sliceString(n.from,n.to),i=r.match(/^\s*<span\s+style="color:\s*([^"\s][^"]*)"\s*>([\s\S]*)<\/span>\s*$/i);if(i){let r=`<span style="color: ${t}">${i[2]}</span>`;e.dispatch({changes:{from:n.from,to:n.to,insert:r},selection:{anchor:n.from,head:n.from+r.length}})}else{let i=`<span style="color: ${t}">${r}</span>`;e.dispatch({changes:{from:n.from,to:n.to,insert:i},selection:{anchor:n.from,head:n.from+i.length}})}}function it(e){let t=e.state.selection.main,n=e.state.doc.sliceString(t.from,t.to).split(`
`),r=n.every(e=>e.trim().startsWith(`- `))?n.map(e=>e.replace(/^- +/,``)).join(`
`):n.map(e=>`- ${e}`).join(`
`);e.dispatch(e.state.replaceSelection(r))}function at(e){let t=e.state.selection.main,n=e.state.doc.sliceString(t.from,t.to).split(`
`),r=n.every(e=>/^\d+\.\s/.test(e.trim()))?n.map(e=>e.replace(/^\d+\.\s+/,``)).join(`
`):n.map((e,t)=>`${t+1}. ${e}`).join(`
`);e.dispatch(e.state.replaceSelection(r))}function ot(e){return ae(e)}function st(e){return we(e)}var ct=[O.of({name:`C`,extensions:[`c`,`h`],load:()=>s(()=>import(`./md-dist-Co6GKv7W.js`).then(e=>e.cpp()),__vite__mapDeps([3,4,1]))}),O.of({name:`C++`,alias:[`cpp`],extensions:[`cpp`,`cc`,`cxx`,`hpp`,`hh`],load:()=>s(()=>import(`./md-dist-Co6GKv7W.js`).then(e=>e.cpp()),__vite__mapDeps([3,4,1]))}),O.of({name:`CSS`,extensions:[`css`],load:()=>s(()=>import(`./md-codemirror-CveyKXnv.js`).then(e=>e.m).then(e=>e.css()),__vite__mapDeps([4,1]))}),O.of({name:`Go`,extensions:[`go`],load:()=>s(()=>import(`./md-dist-BZLmrK2s.js`).then(e=>e.go()),__vite__mapDeps([5,4,1]))}),O.of({name:`HTML`,alias:[`xhtml`],extensions:[`html`,`htm`],load:()=>s(()=>import(`./md-dist-_JdCYmsK.js`).then(e=>e.html()),__vite__mapDeps([6,4,1]))}),O.of({name:`Java`,extensions:[`java`],load:()=>s(()=>import(`./md-dist-9K0s_aX-.js`).then(e=>e.java()),__vite__mapDeps([7,4,1]))}),O.of({name:`JavaScript`,alias:[`js`,`javascript`,`nodejs`],extensions:[`js`,`mjs`,`cjs`],load:()=>s(()=>import(`./md-codemirror-CveyKXnv.js`).then(e=>e.o).then(e=>e.javascript()),__vite__mapDeps([4,1]))}),O.of({name:`JSON`,alias:[`json5`],extensions:[`json`],load:()=>s(()=>import(`./md-dist-CqeJHkCL.js`).then(e=>e.json()),__vite__mapDeps([8,4,1]))}),O.of({name:`JSX`,extensions:[`jsx`],load:()=>s(()=>import(`./md-codemirror-CveyKXnv.js`).then(e=>e.o).then(e=>e.javascript({jsx:!0})),__vite__mapDeps([4,1]))}),O.of({name:`Markdown`,alias:[`md`],extensions:[`md`,`markdown`],load:()=>s(()=>import(`./md-codemirror-CveyKXnv.js`).then(e=>e.r).then(e=>e.markdown()),__vite__mapDeps([4,1]))}),O.of({name:`PHP`,extensions:[`php`,`php3`,`php4`,`php5`,`php7`,`phtml`],load:()=>s(()=>import(`./md-dist-AfLSDLd9.js`).then(e=>e.php()),__vite__mapDeps([9,4,1,6]))}),O.of({name:`Python`,alias:[`py`],extensions:[`py`,`pyw`],load:()=>s(()=>import(`./md-dist-DRXxSsJI.js`).then(e=>e.python()),__vite__mapDeps([10,4,1]))}),O.of({name:`Rust`,alias:[`rs`],extensions:[`rs`],load:()=>s(()=>import(`./md-dist-Dha7yNHa.js`).then(e=>e.rust()),__vite__mapDeps([11,4,1]))}),O.of({name:`SQL`,extensions:[`sql`],load:()=>s(()=>import(`./md-dist-CLueNt6w.js`).then(e=>e.sql()),__vite__mapDeps([12,4,1]))}),O.of({name:`TSX`,extensions:[`tsx`],load:()=>s(()=>import(`./md-codemirror-CveyKXnv.js`).then(e=>e.o).then(e=>e.javascript({jsx:!0,typescript:!0})),__vite__mapDeps([4,1]))}),O.of({name:`TypeScript`,alias:[`ts`],extensions:[`ts`,`mts`,`cts`],load:()=>s(()=>import(`./md-codemirror-CveyKXnv.js`).then(e=>e.o).then(e=>e.javascript({typescript:!0})),__vite__mapDeps([4,1]))}),O.of({name:`XML`,alias:[`rss`,`wsdl`,`xsd`],extensions:[`xml`,`xsl`,`xsd`],load:()=>s(()=>import(`./md-dist-Djv2VHXp.js`).then(e=>e.xml()),__vite__mapDeps([13,4,1]))}),O.of({name:`YAML`,alias:[`yml`],extensions:[`yaml`,`yml`],load:()=>s(()=>import(`./md-dist-FYolOnTl.js`).then(e=>e.yaml()),__vite__mapDeps([14,4,1]))})];async function lt(e){let t=e.state.doc.toString(),{formatDoc:n}=await s(async()=>{let{formatDoc:e}=await import(`./md-formatDoc-C_tIUTCU.js`);return{formatDoc:e}},__vite__mapDeps([0,1,2])),r=await n(t,`markdown`);e.dispatch({changes:{from:0,to:e.state.doc.length,insert:r}})}function ut(e){let t=e.state.changeByRange(e=>({changes:{from:e.from,to:e.to,insert:`  `},range:Fe.range(e.from+2,e.from+2)}));return e.dispatch(t),!0}function dt(e){let{onSearch:t,onReplace:n,onGoToLine:r}=e||{};return F.of([{key:`Tab`,run:ut},{key:`Mod-z`,run:ot},{key:`Mod-y`,run:st},{key:`Mod-b`,run:e=>(Qe(e),!0)},{key:`Mod-i`,run:e=>($e(e),!0)},{key:`Mod-d`,run:e=>(et(e),!0)},{key:`Mod-k`,run:e=>(tt(e),!0)},{key:`Mod-e`,run:e=>(nt(e),!0)},{key:`Mod-1`,run:e=>(Y(e,1),!0)},{key:`Mod-2`,run:e=>(Y(e,2),!0)},{key:`Mod-3`,run:e=>(Y(e,3),!0)},{key:`Mod-4`,run:e=>(Y(e,4),!0)},{key:`Mod-5`,run:e=>(Y(e,5),!0)},{key:`Mod-6`,run:e=>(Y(e,6),!0)},{key:`Mod-u`,run:e=>(it(e),!0)},{key:`Mod-o`,run:e=>(at(e),!0)},...t?[{key:`Mod-f`,run:e=>(t(e),!0)}]:[],...n?[{key:`Mod-h`,run:e=>(n(e),!0)}]:[],{key:`Shift-Alt-f`,run:e=>(lt(e),!0)},...r?[{key:`Mod-g`,run:e=>(r(e),!0)}]:[{key:`Mod-g`,run:()=>!0}]])}function ft(e){let{placeholder:t,withoutHistory:n}=e||{};return[...n?[]:[k()],me(),A(),Ne(),I({base:_e,codeLanguages:ct,addKeymap:!0}),Pe.high(dt(e)),de(),F.of([...he,...se,...j,...M]),P.lineWrapping,N.allowMultipleSelections.of(!0),...t?[Se(t)]:[]]}var pt=P.theme({".cm-gutterElement":{display:`flex`,justifyContent:`right`,alignItems:`center`},"&.cm-editor .cm-gutters":{backgroundColor:`transparent !important`,borderRight:`none !important`,padding:`0 !important`},".cm-foldGutter":{width:`10px !important`,overflow:`hidden`},".cm-foldGutter .cm-gutterElement":{padding:`0 !important`,width:`10px !important`,minWidth:`unset !important`},".cm-foldGutter .cm-gutterElement span":{opacity:`0`,transition:`opacity 0.15s ease`},"&.cm-editor .cm-gutters:hover .cm-foldGutter .cm-gutterElement span":{opacity:`1`}});function mt(){return[ke,pt]}function ht(){return[De,pt]}function gt(e){return e?ht():mt()}async function _t(e){let t=e.state.doc.toString(),{formatDoc:n}=await s(async()=>{let{formatDoc:e}=await import(`./md-formatDoc-C_tIUTCU.js`);return{formatDoc:e}},__vite__mapDeps([0,1,2])),r=await n(t,`css`);e.dispatch({changes:{from:0,to:e.state.doc.length,insert:r}})}function vt(){return[Ze,be(),P.lineWrapping,F.of([{key:`Shift-Alt-f`,run:e=>(_t(e),!0)}])]}function yt(){return Xe(re())}var bt=b(`cssEditor`,()=>{let e=Ie(),t=v(null),n=v(null),r=w.reactive(S(`css_content_config`),{active:``,tabs:[]});m(()=>{let e=new Date;if(r.value.tabs.length===0){let t=C();r.value.tabs=[{id:t,title:E(`store.cssEditor.schemeDefault`),name:E(`store.cssEditor.schemeDefault`),content:yt(),createDatetime:e,updateDatetime:e}],r.value.active=t;return}if(r.value.tabs=r.value.tabs.map((t,n)=>({...t,id:t.id??C(),createDatetime:t.createDatetime??new Date(e.getTime()+n),updateDatetime:t.updateDatetime??new Date(e.getTime()+n)})),!r.value.tabs.find(e=>e.id===r.value.active)){let e=r.value.tabs.find(e=>e.name===r.value.active);r.value.active=e?.id??r.value.tabs[0].id}});let i=()=>{let e=r.value.tabs.find(e=>e.id===r.value.active);if(!e){if(r.value.tabs.length===0){let e=C(),t=new Date;return r.value.tabs=[{id:e,title:E(`store.cssEditor.schemeDefault`),name:E(`store.cssEditor.schemeDefault`),content:yt(),createDatetime:t,updateDatetime:t}],r.value.active=e,r.value.tabs[0]}return r.value.active=r.value.tabs[0].id,r.value.tabs[0]}return e},a=()=>i().content,o=e=>{t.value&&t.value.dispatch({changes:{from:0,to:t.value.state.doc.length,insert:e}})},c=null;return _(e,()=>{t.value&&n.value&&t.value.dispatch({effects:n.value.reconfigure(gt(e.value))})}),{cssEditor:t,cssContentConfig:r,isSelectMode:x(()=>r.value.isSelectMode??!1),selectedIds:x(()=>r.value.selectedIds??[]),getCurrentTab:i,getCurrentTabContent:a,setCssEditorValue:o,setOnTabChangedCallback:e=>{c=e},tabChanged:e=>{r.value.active=e;let t=r.value.tabs.find(t=>t.id===e);t&&(o(t.content),c&&c(t.content))},renameTab:e=>{let t=i();t.title=e,t.name=e},addCssContentTab:(e,t)=>{let n=t??yt(),i=new Date;r.value.tabs.push({id:C(),name:e,title:e,content:n,createDatetime:i,updateDatetime:i});let a=r.value.tabs[r.value.tabs.length-1];r.value.active=a.id,o(n),c&&c(n)},resetCssConfig:()=>{let e=yt(),n=C();r.value={active:n,tabs:[{id:n,title:E(`store.cssEditor.schemeDefaultSpaced`),name:E(`store.cssEditor.schemeDefaultSpaced`),content:e,createDatetime:new Date,updateDatetime:new Date}]},t.value&&t.value.dispatch({changes:{from:0,to:t.value.state.doc.length,insert:e}})},initCssEditor:r=>{let a=document.querySelector(`#cssEditor`);if(!a)return;a.value=i().content;let o=document.createElement(`div`);o.className=`w-full h-full`,a.parentNode?.replaceChild(o,a),n.value=new je;let s=N.create({doc:i().content,extensions:[vt(),n.value.of(gt(e.value)),P.updateListener.of(e=>{if(e.docChanged){let t=e.state.doc.toString(),n=i();n.content=t,n.updateDatetime=new Date,r(t)}})]});t.value=ee(new P({state:s,parent:o}))},scrollToHeading:e=>{if(!t.value)return;let n=t.value.state.doc.toString(),r=RegExp(`^${e}\\s*\\{`,`m`),i=n.match(r);if(i&&i.index!==void 0){let e=i.index,r=0,a=e,o=!1;for(let t=e;t<n.length;t++)if(n[t]===`{`)r++,o=!0;else if(n[t]===`}`&&(r--,o&&r===0)){a=t+1;break}t.value.dispatch({selection:{anchor:e,head:a},scrollIntoView:!0}),t.value.focus()}},toggleSelectMode:()=>{r.value.isSelectMode=!(r.value.isSelectMode??!1),r.value.isSelectMode||(r.value.selectedIds=[])},toggleSelectTab:e=>{let t=r.value.selectedIds??[];t.indexOf(e)===-1?r.value.selectedIds=[...t,e]:r.value.selectedIds=t.filter(t=>t!==e)},selectAllTabs:()=>{r.value.selectedIds=r.value.tabs.map(e=>e.id)},clearSelection:()=>{r.value.selectedIds=[]},batchDeleteTabs:()=>{let e=r.value.selectedIds??[];if(e.length===0)return;if(e.length>=r.value.tabs.length){D.warning(E(`store.cssEditor.keepAtLeastOne`));return}let t=r.value.tabs.filter(t=>!e.includes(t.id));e.includes(r.value.active)&&(r.value.active=t[0].id,o(t[0].content),c&&c(t[0].content)),r.value.tabs=t,r.value.selectedIds=[],r.value.isSelectMode=!1,D.success(E(`store.cssEditor.batchDeleted`,{count:e.length}))},batchExportTabs:async()=>{let e=r.value.selectedIds??[];if(e.length!==0){if(e.length===1){let t=r.value.tabs.find(t=>t.id===e[0]);t&&d(`data:text/css;charset=utf-8,${encodeURIComponent(t.content)}`,`${R(t.title)}.css`)}else{let{strToU8:t,zip:n}=await s(async()=>{let{strToU8:e,zip:t}=await import(`./md-browser-DF3hgwXO.js`).then(e=>e.t);return{strToU8:e,zip:t}},__vite__mapDeps([15,1])),i={};e.forEach(e=>{let n=r.value.tabs.find(t=>t.id===e);n&&(i[`${R(n.title)}.css`]=t(n.content))});let a=await new Promise((e,t)=>n(i,(n,r)=>n?t(n):e(r))),o=URL.createObjectURL(new Blob([a],{type:`application/zip`}));d(o,`css-schemes.zip`),URL.revokeObjectURL(o)}r.value.selectedIds=[],r.value.isSelectMode=!1,D.success(E(`store.cssEditor.batchExported`,{count:e.length}))}},exportSingleTab:e=>{let t=r.value.tabs.find(t=>t.id===e);t&&(d(`data:text/css;charset=utf-8,${encodeURIComponent(t.content)}`,`${R(t.title)}.css`),D.success(E(`store.cssEditor.singleExported`,{name:t.title})))}}}),xt=b(`theme`,()=>{let e=w.reactive(S(`theme`),T.theme),t=w.reactive(S(`themeSettings`),{}),n=x(()=>t.value[e.value]??te()),r=x({get:()=>n.value.primaryColor,set:e=>{f(`primaryColor`,e)}}),i=x({get:()=>n.value.fontFamily,set:e=>{f(`fontFamily`,e)}}),a=x({get:()=>n.value.fontSize,set:e=>{f(`fontSize`,e)}}),o=x({get:()=>n.value.codeBlockTheme,set:e=>{f(`codeBlockTheme`,e)}}),l=x({get:()=>n.value.headingStyles,set:e=>{f(`headingStyles`,e)}}),u=x({get:()=>n.value.isShowLineNumber,set:e=>{f(`isShowLineNumber`,e)}}),d=x({get:()=>n.value.isMacCodeBlock,set:e=>{f(`isMacCodeBlock`,e)}});function f(n,r){let i=e.value,a=t.value[i]??te();t.value={...t.value,[i]:{...a,[n]:r}}}let p=w.reactive(`isCiteStatus`,T.isCiteStatus),m=w.reactive(`isCountStatus`,T.isCountStatus),h=w.reactive(S(`use_indent`),!1),g=w.reactive(S(`use_justify`),!1),_=w.reactive(`legend`,T.legend),v=w.reactive(`previewWidth`,ne[0].value);return{theme:e,themeSettings:t,fontFamily:i,fontSize:a,fontSizeNumber:x(()=>Number(a.value.replace(`px`,``))),primaryColor:r,codeBlockTheme:o,legend:_,isMacCodeBlock:d,isShowLineNumber:u,isCiteStatus:p,isCountStatus:m,isUseIndent:h,isUseJustify:g,previewWidth:v,headingStyles:l,toggleMacCodeBlock:L(d),toggleShowLineNumber:L(u),toggleCiteStatus:L(p),toggleCountStatus:L(m),toggleUseIndent:L(h),toggleUseJustify:L(g),resetStyle:()=>{t.value={...t.value,[e.value]:te()},p.value=T.isCiteStatus,m.value=T.isCountStatus,_.value=T.legend,h.value=!1,g.value=!1},updateCodeTheme:()=>{let e=o.value,t=document.querySelector(`#hljs`);if(t){if(t.getAttribute(`href`)===e)return;t.setAttribute(`href`,e)}else{let t=document.createElement(`link`);t.setAttribute(`type`,`text/css`),t.setAttribute(`rel`,`stylesheet`),t.setAttribute(`href`,e),t.setAttribute(`id`,`hljs`),document.head.appendChild(t)}},applyCurrentTheme:async()=>{try{let t=bt().getCurrentTabContent(),n;if(Je(e.value)){let{useMarketplaceStore:t}=await s(async()=>{let{useMarketplaceStore:e}=await import(`./md-marketplace-3wdZILCH.js`).then(e=>e.t);return{useMarketplaceStore:e}},__vite__mapDeps([16,1,17,18,2,19,20,15,21,22,23,24,25,26,27,28,29,30,31]));n=t().getInstalledThemeCss(e.value)}await c({themeName:e.value,themeCSS:n,customCSS:t,variables:{primaryColor:r.value,fontFamily:i.value,fontSize:a.value,isUseIndent:h.value,isUseJustify:g.value,headingStyles:l.value}})}catch(e){console.error(`[applyCurrentTheme] 主题应用失败:`,e)}},setHeadingStyle:(e,t)=>{let n=l.value;l.value={...n,[e]:t==="default"?void 0:t}},getHeadingStyle:e=>l.value[e]||`default`}}),St=b(`render`,()=>{let e=v(``),t=y({chars:0,words:0,minutes:0}),n=v([]),r=null,i=``,s=``,c=e=>(r=f(e||{}),i=``,s=``,r),l=()=>r,u=()=>({mermaidLoading:E(`store.diagram.mermaidLoading`),mermaidError:E(`store.diagram.mermaidError`),plantumlLoading:E(`store.diagram.plantumlLoading`),plantumlError:E(`store.diagram.plantumlError`),infographicLoading:E(`store.diagram.infographicLoading`),infographicError:E(`store.diagram.infographicError`)}),d=()=>({summary:E(`store.count.summary`,{words:`{words}`,minutes:`{minutes}`})}),p=()=>({footnoteTitle:E(`store.render.footnoteTitle`),unknownComponent:E(`store.render.unknownComponent`),katexLoading:E(`store.render.katexLoading`)});function m(e){return Object.keys(e.registry).sort().map(t=>{let n=e.registry[t];return[t,n.updatedAt??0,n.template,JSON.stringify(n.props??[])].join(``)}).join(``)}function h(e,t,n){return[e,t.isCiteStatus?`1`:`0`,t.legend,t.isCountStatus?`1`:`0`,t.isMacCodeBlock?`1`:`0`,t.isShowLineNumber?`1`:`0`,m(n),E(`store.count.summary`,{words:`{words}`,minutes:`{minutes}`}),E(`store.render.footnoteTitle`),E(`store.render.unknownComponent`),E(`store.render.katexLoading`),E(`store.diagram.mermaidLoading`)].join(``)}let g=e=>{let t=r.getHeadings();n.value=t.map((e,t)=>({url:`#${t}`,title:e.text,level:e.level}));let i=0;return e.replace(/data-heading="true"/g,()=>`data-heading="true" id="${i++}"`)};return{output:e,readingTime:t,titleList:n,initRendererInstance:c,getRenderer:l,render:(n,c)=>{if(!r)throw Error(`Renderer not initialized. Call initRendererInstance first.`);let l=xt(),f=ir(),m=Ke(),_=c?.themeMode??(f.isDark?`dark`:`light`),v=h(_,l,m);if(!c?.force&&n===s&&v===i)return e.value;r.reset({citeStatus:l.isCiteStatus,legend:l.legend,countStatus:l.isCountStatus,isMacCodeBlock:l.isMacCodeBlock,isShowLineNumber:l.isShowLineNumber,themeMode:_,components:m.registry,diagramMessages:u(),countMessages:d(),renderMessages:p()});let{html:y,readingTime:b}=o(n,r);return t.chars=n.length,t.words=b.words,t.minutes=Math.ceil(b.minutes),e.value=g(a(y,b,r)),s=n,i=v,e.value}}});function Ct(e){let t=e??document.getElementById(`output`);if(!t)return;let n=t.getElementsByTagName(`img`);Array.from(n).forEach(e=>{let t=e.getAttribute(`width`),n=e.getAttribute(`height`);t&&(e.removeAttribute(`width`),e.style.width=/^\d+$/.test(t)?`${t}px`:t),n&&(e.removeAttribute(`height`),e.style.height=/^\d+$/.test(n)?`${n}px`:n)})}function wt(e){let t=document.createElement(`div`);return t.innerHTML=e,t.querySelectorAll(`li > ul, li > ol`).forEach(e=>{e.parentElement?.insertAdjacentElement(`afterend`,e)}),t.innerHTML}function Tt(){let e=document.createElement(`p`);return e.style.fontSize=`0`,e.style.lineHeight=`0`,e.style.margin=`0`,e.innerHTML=`&nbsp;`,e}var Et=`:root {
  --foreground: 0 0% 3.9%;
  --blockquote-background: #f7f7f7;
}`;async function Dt(){let e=document.querySelector(`#hljs`);if(!e)return``;try{return`<style>${await(await fetch(e.href)).text()}</style>`}catch(e){return console.warn(`Failed to fetch highlight.js styles:`,e),``}}function Ot(e,t){let n=e;return n=n.replace(/#output\s*\{/g,`${t} {`),n=n.replace(/#output\s+/g,`${t} `),n=n.replace(/^#output\s*/gm,`${t} `),n}function kt(e){let t=e;return t=t.replace(/#output\s*\{/g,`body {`),t=t.replace(/#output\s+/g,``),t=t.replace(/^#output\s*/gm,``),t}function At(){let e=document.querySelector(`#md-theme`);return!e||!e.textContent?(console.warn(`[getThemeStyles] theme styles not found`),``):`<style>${kt(e.textContent)}</style>`}async function jt(){let e=document.querySelector(`#md-theme`);if(!e?.textContent)return console.warn(`[getShareExportStyles] theme styles not found`),``;let t=[`<style>${Et}</style>`,`<style>${Ot(e.textContent,`.share-content`)}</style>`],n=await Dt();return n&&t.push(n),t.join(``)}async function Mt(){return[At(),await Dt()].filter(Boolean).join(``)}var Nt=`http://www.w3.org/2000/svg`;function Pt(e){return e?e.match(/#([^)'"]+)/)?.[1]??null:null}function Ft(e){let t=new Map;return Array.from(e.querySelectorAll(`*`)).forEach(e=>{if(e.localName!==`marker`)return;let n=e.getAttribute(`id`);if(!n)return;let r=Array.from(e.querySelectorAll(`*`)).filter(e=>[`path`,`polygon`,`polyline`,`line`].includes(e.localName));r.length!==0&&t.set(n,{paths:r,refX:Number.parseFloat(e.getAttribute(`refX`)??`0`),refY:Number.parseFloat(e.getAttribute(`refY`)??`0`),orient:e.getAttribute(`orient`)??`auto`,markerUnits:e.getAttribute(`markerUnits`)??`strokeWidth`,markerWidth:Number.parseFloat(e.getAttribute(`markerWidth`)??`3`),markerHeight:Number.parseFloat(e.getAttribute(`markerHeight`)??`3`)})}),t}function It(e){return e.paths.map(e=>e.cloneNode(!0))}function Lt(e,t){if(e===`auto`||e===`auto-start-reverse`)return e===`auto-start-reverse`?t+Math.PI:t;let n=Number.parseFloat(e);return Number.isFinite(n)?n*Math.PI/180:t}function Rt(e){let t=e.getAttribute(`stroke-width`);if(t)return Number.parseFloat(t)||1.5;let n=(e.getAttribute(`style`)??``).match(/stroke-width:\s*([\d.]+)/);return n?Number.parseFloat(n[1]):1.5}function zt(e){return e.getAttribute(`stroke`)??e.getAttribute(`fill`)??`currentColor`}function Bt(e,t,n,r,i){let a=Math.max(6,i*4),o=t.x,s=t.y,c=o-a*Math.cos(n-Math.PI/6),l=s-a*Math.sin(n-Math.PI/6),u=o-a*Math.cos(n+Math.PI/6),d=s-a*Math.sin(n+Math.PI/6),f=document.createElementNS(Nt,`polygon`);f.setAttribute(`points`,`${o},${s} ${c},${l} ${u},${d}`),f.setAttribute(`fill`,r),f.setAttribute(`stroke`,`none`),e.parentElement?.insertBefore(f,e.nextSibling)}function Vt(e,t,n,r,i,a){let o=Lt(t.orient,r),s=t.markerUnits===`userSpaceOnUse`?1:Math.max(i,1),c=document.createElementNS(Nt,`g`);c.setAttribute(`transform`,`translate(${n.x}, ${n.y}) rotate(${o*180/Math.PI}) scale(${s}) translate(${-t.refX}, ${-t.refY})`);let l=It(t);if(l.length===0){Bt(e,n,r,a,i);return}l.forEach(e=>{(!e.getAttribute(`fill`)||e.getAttribute(`fill`)===`context-fill`)&&e.setAttribute(`fill`,a),(!e.getAttribute(`stroke`)||e.getAttribute(`stroke`)===`context-stroke`)&&e.setAttribute(`stroke`,a),c.appendChild(e)}),e.appendChild(c)}function Ht(e,t){let n=e.getAttribute(`x1`),r=e.getAttribute(`y1`),i=e.getAttribute(`x2`),a=e.getAttribute(`y2`);if(n==null||r==null||i==null||a==null)return null;let o=Number.parseFloat(n),s=Number.parseFloat(r),c=Number.parseFloat(i),l=Number.parseFloat(a),u={x:t?o:c,y:t?s:l},d=Math.atan2(l-s,c-o);return{point:u,angle:t?d+Math.PI:d}}function Ut(e,t){let n=e;if(typeof n.getTotalLength!=`function`)return null;let r=n.getTotalLength();if(r<=0)return null;let i=Math.min(5,r/2),a=t?n.getPointAtLength(0):n.getPointAtLength(r),o=t?n.getPointAtLength(Math.min(r,i)):n.getPointAtLength(Math.max(0,r-i)),s={x:a.x,y:a.y},c=Math.atan2(s.y-o.y,s.x-o.x);return{point:s,angle:t?c+Math.PI:c}}function Wt(e,t){return e.localName===`path`?Ut(e,t):e.localName===`line`?Ht(e,t):null}function Gt(e,t,n){let r=Pt(t.getAttribute(`marker-end`)??t.getAttribute(`markerEnd`)),i=Pt(t.getAttribute(`marker-start`)??t.getAttribute(`markerStart`));if(!r&&!i)return;let a=Rt(t),o=zt(t),s=(r,i)=>{if(!r)return;let s=Wt(t,i);if(!s)return;let c=n.get(r);if(c){Vt(e,c,s.point,s.angle,a,o);return}Bt(t,s.point,s.angle,o,a)};s(i,!0),s(r,!1),t.removeAttribute(`marker-end`),t.removeAttribute(`marker-start`),t.removeAttribute(`markerEnd`),t.removeAttribute(`markerStart`),t.removeAttribute(`marker-mid`),t.removeAttribute(`markerMid`)}function Kt(e){let t=e.querySelector(`defs`),n=t?Ft(t):new Map;e.querySelectorAll(`path, line, polyline`).forEach(t=>{Gt(e,t,n)})}function qt(e){e.querySelectorAll(`*[class], path, line, polyline, polygon, rect, circle, ellipse, text`).forEach(e=>{if(!(e instanceof SVGElement))return;let t=window.getComputedStyle(e);t.fill&&t.fill!==`none`&&!e.hasAttribute(`fill`)&&e.setAttribute(`fill`,t.fill),t.stroke&&t.stroke!==`none`&&!e.hasAttribute(`stroke`)&&e.setAttribute(`stroke`,t.stroke),t.strokeWidth&&!e.hasAttribute(`stroke-width`)&&e.setAttribute(`stroke-width`,t.strokeWidth),t.opacity&&t.opacity!==`1`&&!e.hasAttribute(`opacity`)&&e.setAttribute(`opacity`,t.opacity)})}function Jt(e){if(!e)return null;let t=e.trim().split(/[\s,]+/).map(Number);return t.length!==4||t.some(e=>!Number.isFinite(e))?null:{x:t[0],y:t[1],width:t[2],height:t[3]}}function Yt(e){if(!e||e.endsWith(`%`))return null;let t=Number.parseFloat(e);return Number.isFinite(t)&&t>0?t:null}function Xt(e){return e.closest(`.plantuml-diagram`)!=null||e.hasAttribute(`data-diagram-type`)}function Zt(e){return e.closest(`.katex-inline, .katex-block, mjx-container`)!=null}function Qt(e){let t=e.trim().toLowerCase();if(!t||t===`none`||t===`currentcolor`||t===`transparent`||t.startsWith(`url(`))return null;if(t===`black`)return[0,0,0];if(t===`white`)return[255,255,255];let n=t.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(n){let e=n[1];return e.length===3?[Number.parseInt(e[0]+e[0],16),Number.parseInt(e[1]+e[1],16),Number.parseInt(e[2]+e[2],16)]:[Number.parseInt(e.slice(0,2),16),Number.parseInt(e.slice(2,4),16),Number.parseInt(e.slice(4,6),16)]}let r=t.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);return r?[Math.min(255,Number.parseFloat(r[1])),Math.min(255,Number.parseFloat(r[2])),Math.min(255,Number.parseFloat(r[3]))]:null}function $t([e,t,n]){let r=e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4};return .2126*r(e)+.7152*r(t)+.0722*r(n)}function en([e,t,n]){return Math.max(e,t,n)-Math.min(e,t,n)<=24}function tn(e){let t=Qt(e);return!t||!en(t)?!1:$t(t)<.35}function nn(e){return e&&(e.trim().toLowerCase()===`currentcolor`||tn(e))?`currentColor`:null}function rn(e){for(let t of[`fill`,`stroke`]){let n=nn(e.getAttribute(t));n&&e.setAttribute(t,n)}let t=e.getAttribute(`style`);if(!t)return;let n=!1,r=t.split(`;`).map(e=>e.trim()).filter(Boolean).map(e=>{let t=e.indexOf(`:`);if(t===-1)return e;let r=e.slice(0,t).trim().toLowerCase();if(r!==`fill`&&r!==`stroke`)return e;let i=nn(e.slice(t+1).trim());return i?(n=!0,`${r}: ${i}`):e}).join(`; `);n&&e.setAttribute(`style`,`${r};`)}function an(e){e.querySelectorAll(`.katex-inline, .katex-block`).forEach(e=>{e.style.removeProperty(`color`)}),e.querySelectorAll(`.katex-inline svg, .katex-block svg, mjx-container svg`).forEach(e=>{e.style.removeProperty(`color`);let t=e.getAttribute(`fill`);(!t||t===`currentColor`||tn(t))&&e.setAttribute(`fill`,`currentColor`),e.querySelectorAll(`path, rect, use, g`).forEach(rn)})}function on(e){rn(e),e.querySelectorAll(`*`).forEach(rn)}function sn(e){let t=e.getAttribute(`fill-opacity`);if(t!==null&&Number.parseFloat(t)===0)return!0;let n=e.getAttribute(`opacity`);return n!==null&&Number.parseFloat(n)===0}function cn(e){if(typeof SVGGraphicsElement>`u`)return!1;let t=1/0,n=1/0,r=-1/0,i=-1/0,a=!1;if(e.querySelectorAll(`path, line, rect, circle, ellipse, polygon, polyline, text, image, use`).forEach(e=>{if(!(!(e instanceof SVGGraphicsElement)||sn(e)))try{let o=e.getBBox();if(o.width<=0&&o.height<=0)return;a=!0,t=Math.min(t,o.x),n=Math.min(n,o.y),r=Math.max(r,o.x+o.width),i=Math.max(i,o.y+o.height)}catch{}}),!a)try{let o=e.getBBox();o.width>0&&o.height>0&&(t=o.x,n=o.y,r=o.x+o.width,i=o.y+o.height,a=!0)}catch{}if(!a)return!1;t-=2,n-=2;let o=Math.max(1,r+2-t),s=Math.max(1,i+2-n);return e.setAttribute(`viewBox`,`${t} ${n} ${o} ${s}`),!0}function ln(e,t){let n=new Set(t.map(e=>e.split(`:`)[0]?.trim()).filter(Boolean)),r=(e.getAttribute(`style`)??``).split(`;`).map(e=>e.trim()).filter(Boolean).filter(e=>{let t=e.split(`:`)[0]?.trim();return t&&!n.has(t)});e.setAttribute(`style`,`${[...r,...t].join(`; `)};`)}function un(e,t,n,r=`inline`){if(r===`scroll`){ln(e,[`display: block`,`vertical-align: top`,`width: 100%`,`height: ${n}px`,`max-width: none`]);return}ln(e,[`display: block`,`vertical-align: top`,`width: 100%`,`max-width: ${t}px`,`height: auto`])}function dn(e){let t=Jt(e.getAttribute(`viewBox`));if(t&&t.width>0&&t.height>0)return{width:Math.max(1,Math.round(t.width)),height:Math.max(1,Math.round(t.height))};let n=Yt(e.getAttribute(`width`)),r=Yt(e.getAttribute(`height`));if(n&&r)return{width:n,height:r};let i=e.getBoundingClientRect(),a=n??t?.width??(i.width>0?i.width:677),o=r??t?.height??(i.height>0?i.height:a*.75);if(t&&t.width>0&&t.height>0){let e=t.height/t.width;Math.abs(o/a-e)>.01&&(o=a*e)}return{width:Math.max(1,Math.round(a)),height:Math.max(1,Math.round(o))}}function fn(e){let{width:t,height:n}=dn(e);return e.hasAttribute(`xmlns`)||e.setAttribute(`xmlns`,Nt),e.setAttribute(`width`,String(t)),e.setAttribute(`height`,String(n)),e.setAttribute(`preserveAspectRatio`,`xMidYMid meet`),{width:t,height:n}}function pn(e){e.setAttribute(`style`,`box-sizing: border-box; width: 100%; margin: 0; padding: 0; line-height: 0; font-size: 0;`)}function mn(e){let t=Number.parseFloat(e.getAttribute(`width`)??`0`),n=Number.parseFloat(e.getAttribute(`height`)??`0`);if(t<=677)return;let r=e.parentNode;if(!r)return;let i=document.createElement(`section`);i.setAttribute(`style`,`box-sizing: border-box; width: 100%; margin: 0; padding: 0; line-height: 0; font-size: 0;`);let a=document.createElement(`section`);a.setAttribute(`style`,`overflow-x: scroll; overflow-y: hidden; -webkit-overflow-scrolling: touch; white-space: nowrap; width: 100%; font-size: 0; line-height: 0;${n>0?` height: ${n}px;`:``}`);let o=document.createElement(`section`);o.setAttribute(`style`,`display: inline-block; width: ${t}px;${n>0?` height: ${n}px;`:``} vertical-align: top; line-height: 0; font-size: 0;`);let s=document.createElement(`p`);s.setAttribute(`style`,`font-size: 14px; color: #999; text-align: center; margin-top: 5px; margin-bottom: 0; white-space: normal;`),s.textContent=`<<< 左右滑动看更多 >>>`,un(e,t,n,`scroll`),r.insertBefore(i,e),o.appendChild(e),a.appendChild(o),i.appendChild(a),i.appendChild(s)}function hn(e){let t=e.getBoundingClientRect(),n=Jt(e.getAttribute(`viewBox`)),r=Yt(e.getAttribute(`width`)),i=Yt(e.getAttribute(`height`)),a=t.width>0?t.width:r??n?.width??677,o=t.height>0?t.height:i??n?.height??a*.75;if(n&&n.width>0&&n.height>0){let e=n.height/n.width;t.width<=0&&!r?(a=n.width,o=n.height):Math.abs(o/a-e)>.01&&(o=a*e)}return a>677&&(o=677/a*o,a=677),{width:Math.max(1,Math.round(a)),height:Math.max(1,Math.round(o))}}function gn(e){let{width:t,height:n}=hn(e);e.hasAttribute(`xmlns`)||e.setAttribute(`xmlns`,Nt),e.setAttribute(`width`,String(t)),e.setAttribute(`height`,String(n))}function _n(e){e.querySelectorAll(`[clip-path], [clipPath]`).forEach(e=>{e.removeAttribute(`clip-path`),e.removeAttribute(`clipPath`)}),e.querySelectorAll(`style`).forEach(e=>e.remove()),e.querySelectorAll(`defs`).forEach(e=>e.remove()),e.querySelectorAll(`*`).forEach(e=>{e.removeAttribute(`id`),e.removeAttribute(`class`)}),e.removeAttribute(`id`),e.removeAttribute(`class`)}function vn(e,t){let n=t?.plantuml??Xt(e);if(Kt(e),qt(e),on(e),n){cn(e);let t=fn(e);t.width<=677&&un(e,t.width,t.height)}else gn(e);_n(e)}function yn(e){let t=Array.from(e.querySelectorAll(`svg`));if(t.length===0)return;let n=document.createElement(`div`);n.style.cssText=`position:fixed;left:-99999px;top:0;visibility:hidden;pointer-events:none;width:677px;`,document.body.appendChild(n);try{for(let e of t){let t=e;if(Zt(t))continue;let r=t.parentElement,i=t.nextSibling,a=Xt(t);if(n.appendChild(t),vn(t,{plantuml:a}),r&&r.insertBefore(t,i),a){let e=t.closest(`.plantuml-diagram`);e&&pn(e),mn(t)}}}finally{n.remove()}}async function bn(e){let{default:t}=await s(async()=>{let{default:e}=await import(`./md-client-DTEXUKf4.js`);return{default:e}},__vite__mapDeps([32,1,21,33,34]));return t(e,{inlinePseudoElements:!0,preserveImportant:!0,resolveCSSVariables:!1})}async function xn(e){let t=document.getElementById(`output`);if(!t)return{html:``,plainText:``,hasPendingAsyncContent:!1};let n=St(),r=G(),i=ir(),a=r.getContent(),o=`light`,s=i.isDark;s&&n.render(a,{themeMode:o,force:!0});let c=await U(void 0,{themeMode:o});try{let n=t.cloneNode(!0);W(n);let r=await Mt();r&&(n.innerHTML=r+n.innerHTML),n.innerHTML=wt(await bn(n.innerHTML)),n.querySelectorAll(`a[href^="#"]`).forEach(e=>e.removeAttribute(`href`)),n.innerHTML=n.innerHTML.replace(/([^-])top:(.*?)em/g,`$1transform: translateY($2em)`).replace(/hsl\(var\(--foreground\)\)/g,`#3f3f3f`).replace(/var\(--blockquote-background\)/g,`#f7f7f7`).replace(/var\(--md-primary-color\)/g,e).replace(/--md-primary-color:.+?;/g,``).replace(/--md-font-family:.+?;/g,``).replace(/--md-font-size:.+?;/g,``).replace(/<span class="nodeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g,`<span class="nodeLabel"$1>$2</span>`).replace(/<span class="edgeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g,`<span class="edgeLabel"$1>$2</span>`),Ct(n);let i=Tt(),a=Tt();return n.insertBefore(i,n.firstChild),n.appendChild(a),n.querySelectorAll(`.nodeLabel`).forEach(e=>{let t=e.parentElement;if(!t)return;let n=t.getAttribute(`xmlns`),r=t.getAttribute(`style`);if(!n||!r)return;let i=document.createElement(`section`);i.setAttribute(`xmlns`,n),i.setAttribute(`style`,r),i.innerHTML=t.innerHTML;let a=t.parentElement;a&&(a.innerHTML=``,a.appendChild(i))}),n.innerHTML=n.innerHTML.replace(/<tspan([^>]*)>/g,`<tspan$1 style="fill: currentColor !important; color: currentColor !important; stroke: none !important;">`),n.querySelectorAll(`.infographic-diagram`).forEach(e=>{e.querySelectorAll(`text`).forEach(e=>{let t=e.getAttribute(`dominant-baseline`),n={alphabetic:``,central:`0.35em`,middle:`0.35em`,hanging:`-0.55em`,ideographic:`0.18em`,"text-before-edge":`-0.85em`,"text-after-edge":`0.15em`};if(t){e.removeAttribute(`dominant-baseline`);let r=n[t];r&&e.setAttribute(`dy`,r)}})}),yn(n),an(n),{html:n.innerHTML,plainText:n.textContent||``,hasPendingAsyncContent:!c}}finally{s&&n.render(a,{themeMode:`dark`,force:!0})}}var X=`[data-png-export-host]`,Sn=`png-export-root`;function Z(e,t){for(let[n,r]of Object.entries(t))e.style.setProperty(n,r,`important`)}function Cn(e){let t=e.getAttribute(`style`)??``;return/overflow(?:-x)?:\s*(?:auto|scroll)/.test(t)}function wn(e){Z(e,{width:`100%`,maxWidth:`100%`,tableLayout:`fixed`}),e.querySelectorAll(`th, td`).forEach(e=>{Z(e,{wordBreak:`break-word`,whiteSpace:`normal`,overflowWrap:`anywhere`})})}function Tn(e){e.querySelectorAll(`.code-scroll`).forEach(e=>{Z(e,{overflow:`visible`}),e.querySelectorAll(`div`).forEach(e=>{Z(e,{whiteSpace:`pre-wrap`,wordBreak:`break-all`,minWidth:`auto`,maxWidth:`100%`})})}),e.querySelectorAll(`pre.code__pre, .hljs.code__pre`).forEach(e=>{Z(e,{overflow:`visible`})}),e.querySelectorAll(`pre.code__pre > code, .hljs.code__pre > code`).forEach(e=>{Z(e,{overflow:`visible`,whiteSpace:`pre-wrap`,wordBreak:`break-all`,minWidth:`auto`,maxWidth:`100%`})}),e.querySelectorAll(`pre section, code section`).forEach(e=>{Z(e,{overflow:`visible`})})}function En(e){e.querySelectorAll(`table.preview-table`).forEach(e=>{let t=e.parentElement;t?.tagName===`SECTION`&&Z(t,{overflow:`visible`,maxWidth:`100%`}),wn(e)}),e.querySelectorAll(`section`).forEach(e=>{!Cn(e)||!e.querySelector(`table`)||(Z(e,{overflow:`visible`}),e.querySelectorAll(`table`).forEach(wn))}),Tn(e)}function Dn(e,t){return e.split(`
`).map(e=>{let n=e.trimStart();if(!n||n.startsWith(`/*`))return e;let r=n.match(/^([^{]+)\{/);if(!r)return e;let i=r[1].trim(),a=i.split(`,`).map(e=>`${t} ${e.trim()}`).join(`, `);return e.replace(i,a)}).join(`
`)}function On(e){let t=`${X} .${Sn}`,n=e;return n=n.replace(/#output\s*\{/g,`${t} {`),n=n.replace(/#output\s+/g,`${t} `),n=n.replace(/^#output\s*/gm,`${t} `),n}var kn=`
  section:has(> table.preview-table) { overflow: visible !important; }
  table.preview-table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; }
  table.preview-table th, table.preview-table td { word-break: break-word !important; white-space: normal !important; overflow-wrap: anywhere !important; }
  section[style*="overflow-x: auto"], section[style*="overflow: auto"] { overflow: visible !important; }
  section[style*="overflow-x: auto"] table, section[style*="overflow: auto"] table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; }
  section[style*="overflow-x: auto"] th, section[style*="overflow-x: auto"] td, section[style*="overflow: auto"] th, section[style*="overflow: auto"] td { word-break: break-word !important; white-space: normal !important; overflow-wrap: anywhere !important; }
  pre.code__pre, .hljs.code__pre, pre.code__pre > code, .hljs.code__pre > code, .code-scroll, pre section, code section { overflow: visible !important; }
  pre.code__pre > code, .code-scroll, .code-scroll > div { white-space: pre-wrap !important; word-break: break-all !important; min-width: auto !important; max-width: 100% !important; }
`,An=kn.trim();function jn(e){return Dn(kn,e).trim()}function Mn(){return document.documentElement.classList.contains(`dark`)&&document.getElementById(`output-wrapper`)?.classList.contains(`output_night`)?`#191919`:`#fff`}var Nn=`
  ${X} .preview {
    position: relative;
    margin: 0 auto;
    padding: 20px;
    font-size: 14px;
    box-sizing: border-box;
    word-wrap: break-word;
  }

  ${X} .preview table {
    margin-bottom: 10px;
    border-collapse: collapse;
    display: table;
    min-width: 100%;
  }
`;async function Pn(){let e=document.querySelector(`#md-theme`);if(!e?.textContent)return``;let t=document.documentElement.classList.contains(`dark`),n=[`<style>${t?`${X} { --foreground: 0 0% 98%; --blockquote-background: #212121; }`:`${X} { --foreground: 0 0% 3.9%; --blockquote-background: #f7f7f7; }`}</style>`,`<style>${Nn}</style>`,`<style>${On(e.textContent)}</style>`,`<style>${jn(X)}</style>`],r=document.querySelector(`#hljs`);if(r)try{let e=await(await fetch(r.href)).text();n.push(`<style>@scope (${X}) { ${e} }</style>`)}catch{}return t&&document.getElementById(`output-wrapper`)?.classList.contains(`output_night`)&&n.push(`<style>${X} .output_night .preview { background-color: #191919; }</style>`),n.join(``)}function Fn(e){let t=document.querySelector(`#output`);if(!t)return``;let n=t.cloneNode(!0);return n.querySelectorAll(`.diagram-download-bar`).forEach(e=>e.remove()),r(n,e?.themeMode?{themeMode:e.themeMode}:void 0),e?.staticLayout&&En(n),n.innerHTML}async function In(e=`untitled`){await U();let t=Fn({staticLayout:!0}),n=await Mt(),r=`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${R(e)}</title>
  <style>${Et}</style>
  ${n}
  <style>${An}</style>
</head>
<body>
  <div style="width: 750px; margin: auto; padding: 20px;">
    ${t}
  </div>
</body>
</html>`;d(r,`${R(e)}.html`,`text/html`)}async function Ln(e,t=`untitled`){let r=R(t),i=await n(e);d(i,`${r}.html`,`text/html`)}var Q={showPageNumbers:!0,pageNumberFormat:`nOfM`,pageNumberPosition:`bottomRight`,showTitleHeader:!0,showSiteFooter:!0,margins:`default`},Rn=new Set([`nOfM`,`n`]),zn=new Set([`bottomLeft`,`bottomCenter`,`bottomRight`]),Bn=new Set([`compact`,`default`,`comfortable`]),Vn={compact:`1cm`,default:`1.5cm 1cm 2cm 1cm`,comfortable:`2cm 1.5cm 2.5cm 1.5cm`},Hn=`0.5cm`,Un=`https://md.doocs.org`;function Wn(e=window.location){return e.protocol===`http:`||e.protocol===`https:`?e.origin:Un}function Gn(e){return e.replace(/\\/g,`\\\\`).replace(/"/g,`\\"`)}var Kn={bottomLeft:`@bottom-left`,bottomCenter:`@bottom-center`,bottomRight:`@bottom-right`},qn=[`@bottom-left`,`@bottom-center`,`@bottom-right`],Jn=[`@top-left-corner`,`@top-left`,`@top-center`,`@top-right`,`@top-right-corner`,`@bottom-left-corner`,`@bottom-left`,`@bottom-center`,`@bottom-right`,`@bottom-right-corner`,`@left-top`,`@left-middle`,`@left-bottom`,`@right-top`,`@right-middle`,`@right-bottom`];function Yn(e){let t=Vn[e].trim().split(/\s+/);return t.length===1?{top:t[0],right:t[0],bottom:t[0],left:t[0]}:t.length===2?{top:t[0],right:t[1],bottom:t[0],left:t[1]}:t.length===3?{top:t[0],right:t[1],bottom:t[2],left:t[1]}:{top:t[0],right:t[1],bottom:t[2],left:t[3]}}function Xn({top:e,right:t,bottom:n,left:r}){return e===t&&t===n&&n===r?e:e===n&&t===r?`${e} ${t}`:`${e} ${t} ${n} ${r}`}function Zn(e,t,n=``){return`
      ${e} {
        content: ${t};${n}
      }`}function Qn(e,t){return Zn(e,`""`,t?`
        width: 0;
        max-width: 0;
        padding: 0;
        margin: 0;
        overflow: hidden;`:``)}function $n(e){for(let t of qn)if(t!==e)return t;return null}function $(e){let t=e??{};return{showPageNumbers:typeof t.showPageNumbers==`boolean`?t.showPageNumbers:Q.showPageNumbers,pageNumberFormat:Rn.has(t.pageNumberFormat)?t.pageNumberFormat:Q.pageNumberFormat,pageNumberPosition:zn.has(t.pageNumberPosition)?t.pageNumberPosition:Q.pageNumberPosition,showTitleHeader:typeof t.showTitleHeader==`boolean`?t.showTitleHeader:Q.showTitleHeader,showSiteFooter:typeof t.showSiteFooter==`boolean`?t.showSiteFooter:Q.showSiteFooter,margins:Bn.has(t.margins)?t.margins:Q.margins}}function er(e,t,n=Wn()){let r=$(e),i=R(t),a=Gn(n),o=Yn(r.margins),s=r.showPageNumbers?Kn[r.pageNumberPosition]:null,c=r.showSiteFooter?$n(s):null,l=r.showTitleHeader,u=!!(s||c),d=o.left,f={top:l?o.top:d,right:o.right,bottom:u?o.bottom:d,left:o.left},p=new Map;if(r.showTitleHeader&&p.set(`@top-center`,Zn(`@top-center`,`"${i}"`,`
        font-size: 12px;
        color: #666;
        vertical-align: bottom;
        padding-bottom: ${Hn};`)),c&&p.set(c,Zn(c,`"${a}"`,`
        font-size: 10px;
        color: #999;
        vertical-align: top;
        padding-top: ${Hn};
        white-space: nowrap;`)),r.showPageNumbers&&s){let e=r.pageNumberFormat===`n`?E(`store.pdf.pageFooterN`):E(`store.pdf.pageFooter`);p.set(s,Zn(s,`"${e}"`,`
        font-size: 10px;
        color: #999;
        vertical-align: top;
        padding-top: ${Hn};
        white-space: nowrap;`))}let m=Jn.map(e=>p.get(e)||Qn(e,qn.includes(e)&&!!(c||s)));return`
    @page {
      margin: ${Xn(f)};${m.join(``)}
    }

    html, body {
      margin: 0;
    }`}async function tr(e=`untitled`,t){await U();let n=Fn({staticLayout:!0}),r=await Mt(),i=`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${R(e)}</title>
  <style>${Et}</style>
  ${r}
  <style>${An}</style>
  <style>
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    ${er($(t),e,Wn())}
  </style>
</head>
<body>
  <div style="width: 100%; max-width: 750px; margin: auto;">
    ${n}
  </div>
</body>
</html>`,a=new Blob([i],{type:`text/html`}),o=URL.createObjectURL(a),s=document.createElement(`iframe`);s.style.cssText=`position:fixed;width:0;height:0;top:-9999px;left:-9999px;border:none;`,s.src=o,document.body.appendChild(s);let c=()=>{URL.revokeObjectURL(o),s.parentNode&&document.body.removeChild(s)};s.onload=()=>{s.contentWindow?.focus(),s.contentWindow?.print(),setTimeout(c,500)},s.onerror=()=>{c()},setTimeout(c,5e3)}async function nr(e){let t=document.getElementById(`output`);if(!t)return null;let n=document.documentElement.classList.contains(`dark`)&&document.getElementById(`output-wrapper`)?.classList.contains(`output_night`),r=e===`mobile`?`375px`:`750px`,i=document.createElement(`div`);i.setAttribute(`data-png-export-host`,``),i.style.cssText=`position:fixed;left:-99999px;top:0;z-index:-1;visibility:visible;pointer-events:none;`,i.innerHTML=await Pn();let a=document.createElement(`div`);a.className=n?`output_night`:``,a.style.width=r;let o=document.createElement(`div`);o.className=`preview border-x shadow-xl mx-auto`,o.style.width=r,o.style.margin=`0`;let s=t.cloneNode(!0);return s.removeAttribute(`id`),s.classList.add(Sn),s.style.width=`100%`,s.querySelectorAll(`.diagram-download-bar`).forEach(e=>e.remove()),W(s),En(s),o.appendChild(s),a.appendChild(o),i.appendChild(a),document.body.appendChild(i),{el:o,cleanup:()=>i.remove()}}async function rr(e=`untitled`,t){await U();let n=await nr(t.previewDevice);if(n)try{await z(100);let{toPng:t}=await s(async()=>{let{toPng:e}=await import(`./md-es-BOAyukm3.js`);return{toPng:e}},[]),r=await t(n.el,{backgroundColor:Mn(),skipFonts:!0,pixelRatio:Math.max(window.devicePixelRatio||1,2),style:{margin:`0`}});d(r,`${R(e)}.png`,`image/png`)}finally{n.cleanup()}}var ir=b(`ui`,()=>{let e=Ie(),t=L(e),n=w.reactive(`showAIToolbox`,!0),r=L(n),i=w.reactive(`hasShownAIToolboxHint`,!1),a=w.reactive(S(`is_open_right_slider`),!1),o=w.reactive(S(`is_open_post_slider`),!1),s=w.reactive(S(`is_open_folder_panel`),!1),c=w.reactive(`isMobile`,!1),l=w.reactive(`viewMode`,`split`);function u(e){l.value=e}let d=w.reactive(`previewDevice`,`mobile`);function f(e){d.value=e}function p(){d.value=d.value===`desktop`?`mobile`:`desktop`}let m=w.reactive(S(`enableImageReupload`),!1),_=L(m),y=w.reactive(S(`enableScrollSync`),!0),b=L(y),ee=w.reactive(S(`copyMode`),`txt`),x=w.reactive(`isShowCssEditor`,!1),C=L(x),T=v(!1);function te(){T.value=!0}function ne(){T.value=!1}let re=v(!1),E=L(re),D=v(!1),ie=v(``),ae=v(!0),O=v(null);function oe(e={}){ie.value=e.value??``,ae.value=e.displayMode??!0,O.value=e.sourceRaw??null,D.value=!0}function se(){D.value=!1,ie.value=``,ae.value=!0,O.value=null}let k=v(!1),ce=L(k),le=v(null),ue=v(!1),de=L(ue),fe=v(null),A=v(!1),pe=L(A),j=v(!1),me=L(j),he=v(!1),M=v(`theme`),ge=v(`discover`);function _e(e){e?.tab,M.value=`theme`,ge.value=e?.view??`discover`,he.value=!0}let N=v(!1),P=L(N),ve=v(!1),ye=L(ve),be=v(!1),xe=v(`create`);function Se(e){xe.value=e?.tab??`create`,be.value=!0}let F=v(!1),I=w.reactive(`pdfExportOptions`,{...Q});function Ce(){I.value=$(I.value),F.value=!0}let we=v(!1),Te=L(we),Ee=v(!1),De=L(Ee),Oe=v(!1),ke=L(Oe),Ae=v(!1),je=L(Ae),Me=v(!1),Ne=L(Me),Pe=v(!1),Fe=L(Pe),R=v(!1),Le=L(R),z=v(null);function Re(e){z.value=e,j.value=!0}let B=v(!1),V=v(!1);function ze(e){B.value=e??!B.value}function Be(e){V.value=e??!V.value}let H=v(null);function U(e=``,t=!1){H.value={word:e,showReplace:t}}function W(){H.value=null}let G=v(0);function Ve(){G.value++}let K=!1;function q(){let e=c.value;c.value=window.innerWidth<=768,!e&&c.value&&l.value===`split`?(l.value=`edit`,K=!0):e&&!c.value&&K&&(l.value=`split`,K=!1)}return g(()=>{q(),window.addEventListener(`resize`,q)}),h(()=>{window.removeEventListener(`resize`,q)}),{isDark:e,showAIToolbox:n,hasShownAIToolboxHint:i,isOpenRightSlider:a,isOpenPostSlider:o,isMobile:c,viewMode:l,previewDevice:d,isOpenFolderPanel:s,enableImageReupload:m,enableScrollSync:y,copyMode:ee,isShowCssEditor:x,toggleShowCssEditor:C,isShowTableEditDialog:T,openTableEditDialog:te,closeTableEditDialog:ne,isShowUploadImgDialog:re,toggleShowUploadImgDialog:E,isShowFormulaEditorDialog:D,formulaEditorValue:ie,formulaEditorDisplayMode:ae,formulaEditorSourceRaw:O,openFormulaEditor:oe,closeFormulaEditor:se,isShowImportMdDialog:k,toggleShowImportMdDialog:ce,importMdOpenUrl:le,isShowLocalImageUpload:ue,toggleShowLocalImageUpload:de,localImageUploadData:fe,isShowTemplateDialog:A,toggleShowTemplateDialog:pe,isShowComponentDialog:j,toggleShowComponentDialog:me,isShowMarketplaceDialog:he,marketplaceDialogTab:M,marketplaceDialogView:ge,openMarketplaceDialog:_e,isShowSyncDialog:N,toggleShowSyncDialog:P,isShowAccountDialog:ve,toggleShowAccountDialog:ye,isShowShareDialog:be,shareDialogInitialTab:xe,openShareDialog:Se,isShowPdfExportDialog:F,openPdfExportDialog:Ce,pdfExportOptions:I,isShowAboutDialog:we,toggleShowAboutDialog:Te,isShowFundDialog:Ee,toggleShowFundDialog:De,isShowMarkdownHelpDialog:Oe,toggleShowMarkdownHelpDialog:ke,isShowEditorStateDialog:Ae,toggleShowEditorStateDialog:je,isShowPreferencesDialog:Me,toggleShowPreferencesDialog:Ne,isShowKeyboardShortcutsDialog:Pe,toggleShowKeyboardShortcutsDialog:Fe,isShowCommandPalette:R,toggleShowCommandPalette:Le,componentDialogTarget:z,openComponentDialogWithTarget:Re,aiDialogVisible:B,toggleAIDialog:ze,aiImageDialogVisible:V,toggleAIImageDialog:Be,searchTabRequest:H,openSearchTab:U,clearSearchTabRequest:W,goToLineRequest:G,requestGoToLine:Ve,toggleDark:t,toggleAIToolbox:r,toggleImageReupload:_,toggleScrollSync:b,setViewMode:u,setPreviewDevice:f,togglePreviewDevice:p}});export{Je as A,z as B,at as C,ot as D,st as E,Ue as F,R as H,We as I,G as L,Ke as M,K as N,Ze as O,Ge as P,W as R,tt as S,it as T,Le as V,Y as _,Wn as a,rt as b,Fn as c,Ot as d,St as f,ft as g,gt as h,$ as i,qe as j,Xe as k,xn as l,bt as m,rr as n,In as o,xt as p,tr as r,Ln as s,ir as t,jt as u,Qe as v,et as w,$e as x,nt as y,U as z};