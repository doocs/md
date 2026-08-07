import{i as e,n as t,t as n}from"./md-rolldown-runtime-Dd_uD5pT.js";import{$ as r,A as i,B as a,C as o,D as s,E as c,F as l,G as u,H as d,I as f,J as p,K as m,L as h,M as g,N as _,O as v,P as y,Q as b,R as x,S,T as C,U as ee,V as te,W as ne,X as w,Y as re,Z as T,_ as ie,a as E,b as D,d as ae,et as O,f as k,g as A,h as oe,i as j,it as M,j as N,k as P,l as se,m as F,n as I,nt as L,o as R,p as z,q as B,r as V,rt as ce,s as le,t as H,tt as ue,u as de,v as U,w as fe,x as pe,y as me,z as he}from"./md-extensions-CH0ILgxE.js";import{t as W}from"./md-highlight-i2QVtVCd.js";import{t as G}from"./md-decode-nKwzHfeR.js";import"./md-configs-DFhBJpoB.js";import"./md-fetch-B1x2Hpbf.js";var K=[{id:`builtin-mp-profile`,name:`MpProfile`,description:`公众号名片组件，展示微信公众号名片`,builtIn:!0,props:[{name:`mpId`,description:`公众号 ID`,required:!0},{name:`nickname`,description:`公众号名称`,required:!0},{name:`headimg`,description:`公众号头像 URL`},{name:`signature`,description:`公众号简介`},{name:`serviceType`,description:`账号类型（1=公众号，2=服务号）`,default:`1`},{name:`verifyStatus`,description:`认证状态（0=无，1=个人，2=企业）`,default:`0`}],template:`<section class="mp_profile_iframe_wrp custom_select_card_wrp" nodeleaf="">
  <mp-common-profile class="mpprofile js_uneditable custom_select_card mp_profile_iframe" data-pluginname="mpprofile" data-id="{{mpId}}" data-nickname="{{nickname}}" data-headimg="{{headimg}}" data-signature="{{signature}}" data-service_type="{{serviceType}}" data-verify_status="{{verifyStatus}}"></mp-common-profile>
  <br class="ProseMirror-trailingBreak">
</section>`,example:`<MpProfile mpId="MzIxNjA5ODQ0OQ==" nickname="Doocs" headimg="https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/doocs/md/images/mp-logo.png" signature="GitHub 开源组织" serviceType="1" verifyStatus="1" />`},{id:`builtin-qrcode`,name:`QRCodeBlock`,description:`二维码组件，将 URL 渲染为可扫描的二维码图片`,builtIn:!0,props:[{name:`url`,description:`二维码内容（URL）`,required:!0},{name:`text`,description:`二维码下方提示文字`,default:`扫码访问`},{name:`size`,description:`二维码尺寸（px）`,default:`150`}],template:`<section style="text-align: center; margin: 20px auto; padding: 16px 0;">
  <img
    src="https://api.qrserver.com/v1/create-qr-code/?size={{size}}x{{size}}&data={{url}}"
    alt="QR Code"
    style="width: {{size}}px; height: {{size}}px; display: block; margin: 0 auto; border-radius: 4px;"
  />
  <p style="text-align: center; font-size: 14px; color: {{_textTertiary_}}; margin-top: 8px; margin-bottom: 0;">{{text}}</p>
</section>`,example:`<QRCodeBlock url="https://md.doocs.org" text="扫码访问" size="150" />`},{id:`builtin-author`,name:`AuthorBlock`,description:`作者信息组件，展示作者头像、名称和简介`,builtIn:!0,props:[{name:`name`,description:`作者名称`,required:!0},{name:`avatar`,description:`头像图片 URL`},{name:`bio`,description:`作者简介`}],template:`<section style="display: table; width: 100%; padding: 16px 0; margin: 16px 0; box-sizing: border-box;">
  <section style="display: table-cell; vertical-align: middle; width: 64px;">
    <img src="{{avatar}}" alt="{{name}}" style="width: 56px; height: 56px; border-radius: 50%; display: block;" />
  </section>
  <section style="display: table-cell; vertical-align: middle; padding-left: 12px;">
    <p style="margin: 0 0 4px; font-size: 15px; font-weight: bold; color: {{_textPrimary_}};">{{name}}</p>
    <p style="margin: 0; font-size: 13px; color: {{_textTertiary_}}; line-height: 1.5;">{{bio}}</p>
  </section>
</section>`,example:`<AuthorBlock name="yanglbme" avatar="https://avatars.githubusercontent.com/u/21008209?v=4" bio="Creator of Doocs" />`},{id:`builtin-tip`,name:`TipBlock`,description:`提示框组件，高亮展示小贴士或注意事项`,builtIn:!0,props:[{name:`type`,description:`类型：info、success、warning、danger`,default:`info`},{name:`title`,description:`标题（可选）`},{name:`content`,description:`提示内容`,required:!0}],template:`<section style="border-left: 4px solid {{borderColor}}; background: {{bgColor}}; padding: 12px 16px; margin: 16px 0; border-radius: 0 6px 6px 0;">
  {{#if title}}<p style="margin: 0 0 6px; font-size: 14px; font-weight: bold; color: {{textColor}};">{{title}}</p>{{/if}}
  <p style="margin: 0; font-size: 14px; color: {{textColor}}; line-height: 1.6;">{{content}}</p>
</section>`,example:`<TipBlock type="info" title="提示" content="这是一条提示信息" />`},{id:`builtin-table`,name:`TableBlock`,description:`表格组件，用 JSON 数组渲染样式化表格，支持斑马纹`,builtIn:!0,props:[{name:`headers`,description:`列标题 JSON 字符串数组`,required:!0,type:`array`},{name:`rows`,description:`数据行 JSON 二维数组`,required:!0,type:`array`},{name:`striped`,description:`斑马纹行（true/false）`,default:`true`},{name:`caption`,description:`表格标题（可选）`}],template:``,example:`<TableBlock headers='["名称","版本","状态"]' rows='[["Vue","3.x","稳定"],["Vite","8.x","稳定"],["pnpm","10.x","稳定"]]' caption="技术栈清单" />`},{id:`builtin-info-grid`,name:`InfoGrid`,description:`信息网格组件，以多列展示键值对信息`,builtIn:!0,props:[{name:`items`,description:`JSON 数组，每项含 label、value 字段`,required:!0,type:`array`},{name:`cols`,description:`列数（1-3）`,default:`2`}],template:``,example:`<InfoGrid items='[{"label":"作者","value":"yanglbme"},{"label":"版本","value":"v1.0"},{"label":"许可证","value":"MIT"},{"label":"语言","value":"TypeScript"}]' cols="2" />`},{id:`builtin-badge-group`,name:`BadgeGroup`,description:`标签组组件，展示一组彩色标签`,builtIn:!0,props:[{name:`tags`,description:`JSON 字符串数组，标签列表`,required:!0,type:`array`},{name:`color`,description:`标签主色调（hex）`,default:`#07c160`}],template:`<section style="display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0;">
{{#each tags}}<span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 13px; font-weight: 500; background: {{color}}1a; color: {{color}}; border: 1px solid {{color}}40;">{{item}}</span>{{/each}}
</section>`,example:`<BadgeGroup tags='["Vue 3","TypeScript","Vite","Tailwind CSS"]' color="#07c160" />`}];function ge(e){let t={};for(let n of e.matchAll(/(\w[\w-]*)=(?:"([^"]*)"|'([^']*)')/g))t[n[1]]=re(n[2]===void 0?n[3]??``:n[2]);return t}function _e(e){return{_bgPrimary_:`var(--md-comp-bg, #fff)`,_bgSecondary_:`var(--md-comp-bg-secondary, #f5f5f5)`,_bgStripe_:`var(--md-comp-bg-stripe, #fafafa)`,_textPrimary_:`var(--md-comp-text-primary, #333)`,_textSecondary_:`var(--md-comp-text-secondary, #666)`,_textTertiary_:`var(--md-comp-text-tertiary, #999)`,_borderDefault_:`var(--md-comp-border-default, #e0e0e0)`,_borderLight_:`var(--md-comp-border-light, #eee)`,...e}}var q={bg:`var(--md-comp-bg, #fff)`,bgSec:`var(--md-comp-bg-secondary, #f5f5f5)`,bgStripe:`var(--md-comp-bg-stripe, #fafafa)`,txtP:`var(--md-comp-text-primary, #333)`,txtS:`var(--md-comp-text-secondary, #666)`,txtT:`var(--md-comp-text-tertiary, #999)`,border:`var(--md-comp-border-default, #e0e0e0)`,borderL:`var(--md-comp-border-light, #eee)`};function ve(e){let t=[],n=[];try{t=JSON.parse(e.headers||`[]`)}catch{t=[]}try{let t=JSON.parse(e.rows||`[]`);n=Array.isArray(t)?t:[]}catch{n=[]}let r=e.striped!==`false`,i=e.caption||``,a=`padding: 8px 12px; text-align: left; font-weight: 600; font-size: 13px; color: ${q.txtS}; background: ${q.bgSec}; border-bottom: 2px solid ${q.border};`,o=`padding: 8px 12px; font-size: 13px; color: ${q.txtP}; border-bottom: 1px solid ${q.borderL};`,s=`<section style="overflow-x: auto; margin: 16px 0;">
`;if(s+=`  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
`,i&&(s+=`    <caption style="font-size: 13px; color: ${q.txtS}; margin-bottom: 8px; text-align: left; caption-side: top;">${m(i)}</caption>\n`),t.length>0){s+=`    <thead>
      <tr>
`;for(let e of t)s+=`        <th style="${a}">${m(String(e))}</th>\n`;s+=`      </tr>
    </thead>
`}s+=`    <tbody>
`;for(let e=0;e<n.length;e++){let t=Array.isArray(n[e])?n[e]:[],i=r&&e%2==1?` style="background: ${q.bgStripe};"`:``;s+=`      <tr${i}>\n`;for(let e of t)s+=`        <td style="${o}">${m(String(e))}</td>\n`;s+=`      </tr>
`}return s+=`    </tbody>
  </table>
</section>`,s}function ye(e){let t=[];try{t=JSON.parse(e.items||`[]`)}catch{t=[]}let n=Math.min(Math.max(Number(e.cols)||2,1),3),r=`${Math.floor(100/n)}%`,i=`<section style="margin: 16px 0; border: 1px solid ${q.borderL}; border-radius: 8px; overflow: hidden; background: ${q.bg};">\n`;i+=`  <section style="display: table; width: 100%; border-collapse: collapse;">
`;for(let e=0;e<t.length;e+=n){i+=`    <section style="display: table-row;">
`;for(let a=0;a<n;a++){let o=t[e+a],s=e+n<t.length?`1px solid ${q.borderL}`:`none`,c=a<n-1?`1px solid ${q.borderL}`:`none`;i+=`      <section style="display: table-cell; width: ${r}; padding: 10px 14px; border-bottom: ${s}; border-right: ${c}; vertical-align: top; box-sizing: border-box;">\n`,o&&(i+=`        <p style="margin: 0 0 2px; font-size: 11px; color: ${q.txtT}; text-transform: uppercase; letter-spacing: 0.5px;">${m(o.label||``)}</p>\n`,i+=`        <p style="margin: 0; font-size: 14px; font-weight: 500; color: ${q.txtP};">${m(o.value||``)}</p>\n`),i+=`      </section>
`}i+=`    </section>
`}return i+=`  </section>
</section>`,i}var J={TableBlock:ve,InfoGrid:ye},be={info:{borderColor:`#1890ff`,bgColor:`#e6f7ff`,textColor:`#0050b3`},success:{borderColor:`#52c41a`,bgColor:`#f6ffed`,textColor:`#135200`},warning:{borderColor:`#faad14`,bgColor:`#fffbe6`,textColor:`#874d00`},danger:{borderColor:`#ff4d4f`,bgColor:`#fff2f0`,textColor:`#a8071a`}};function xe(e){return{...be[e.type||`info`]||be.info,...e}}function Se(e,t){return e=e.replace(/\{\{#each\s+([\w-]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,(e,n,r)=>{let i;try{i=JSON.parse(t[n]||`[]`)}catch{i=[]}return Array.isArray(i)?i.map((e,n)=>{let i=r;if(i=i.replace(/\{\{@index\}\}/g,String(n)),typeof e==`object`&&e){let t=e;i=i.replace(/\{\{item\.([\w-]+)\}\}/g,(e,n)=>t[n]===void 0?``:m(String(t[n])))}else i=i.replace(/\{\{item\}\}/g,m(String(e??``)));return Se(i,t)}).join(``):``}),e=e.replace(/\{\{#if\s+([\w-]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,(e,n,r)=>{let i=r.indexOf(`{{#else}}`);return i>=0?t[n]?r.slice(0,i):r.slice(i+9):t[n]?r:``}),e=e.replace(/\{\{#unless\s+([\w-]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g,(e,n,r)=>t[n]?``:r),e=e.replace(/\{\{([\w-]+)\}\}/g,(e,n)=>n===`children`?t[n]??``:t[n]===void 0?``:m(t[n])),e}function Ce(e,t){let n={};for(let t of e.props)t.default!==void 0&&(n[t.name]=t.default);Object.assign(n,t);let r=J[e.name];if(r)return r(n);let i=_e(e.name===`TipBlock`?xe(n):n);return Se(e.template,i)}function we(e,t){return Ce(e,t??{})}var Te={};function Ee(e){Te=e}function De(){let e={};for(let t of K)e[t.name]=t;return e}var Oe=`Unknown component: {name}`;function ke(e,t){function n(){return e?e():Te}function r(e){return(t?.()?.unknownComponent||Oe).split(`{name}`).join(e)}function i(e,t){let n=e.indexOf(`
`,t);return n>=0?n:e.length}function a(e,t){return e.slice(t,i(e,t)).trim()===``}function o(e){let t=0,n=``,r=0;for(let i of e.split(`
`)){let e=i.match(/^ {0,3}([`~]{3,})/);if(n)e&&e[1][0]===n&&e[1].length>=r&&(n=``,r=0);else if(e)n=e[1][0],r=e[1].length;else if(i[0]===`<`&&i[1]>=`A`&&i[1]<=`Z`)return t;t+=i.length+1}}function s(e){function t(e,t,n){let r=`</${t}>`,a=n,o=``,s=0;for(;a<=e.length;){let t=i(e,a),n=e.slice(a,t),c=n.match(/^ {0,3}([`~]{3,})/);if(o)c&&c[1][0]===o&&c[1].length>=s&&(o=``,s=0);else if(c)o=c[1][0],s=c[1].length;else{let e=n.match(/^\s*/)?.[0].length??0;if(n.slice(e).startsWith(r)&&n.slice(e+r.length).trim()===``)return a+e}if(t===e.length)break;a=t+1}return-1}if(e[0]!==`<`||e[1]<`A`||e[1]>`Z`)return null;let n=1;for(;n<e.length&&/\w/.test(e[n]);)n++;let r=e.slice(1,n);if(!r)return null;let o=``,s=n;for(;s<e.length;){let c=e[s];if(o)c===o&&(o=``);else if(c===`"`||c===`'`)o=c;else if(c===`/`&&e[s+1]===`>`)return a(e,s+2)?{raw:e.slice(0,s+2),name:r,propsStr:e.slice(n,s).trim(),children:``}:null;else if(c===`>`){let o=i(e,s+1),c=`</${r}>`,l=e.indexOf(c,s+1);if(l>=0&&l<o){if(e.slice(l+c.length,o).trim()!==``)return null;let t=e.slice(s+1,l);return{raw:e.slice(0,l+c.length),name:r,propsStr:e.slice(n,s).trim(),children:t}}if(!a(e,s+1))return null;let u=t(e,r,o===e.length?o:o+1);if(u<0)return null;let d=e.slice(s+1,u);return{raw:e.slice(0,u+c.length),name:r,propsStr:e.slice(n,s).trim(),children:d}}s++}return null}return{extensions:[{name:`mdComponent`,level:`block`,start(e){return o(e)},tokenizer(e){let t=s(e);if(t)return{type:`mdComponent`,raw:t.raw,name:t.name,propsStr:t.propsStr,children:t.children}},renderer(e){let{name:t,propsStr:i,children:a}=e,o=n()[t];if(!o)return`<p style="color:#f00;font-size:12px;">[${r(t)}]</p>\n`;let s=ge(i);return a&&s.children===void 0&&(s.children=a),`${Ce(o,s)}\n`}}]}}function Ae(){let e=new Map;return{hooks:{preprocess(t){return e.clear(),t}},extensions:[{name:`footnoteDef`,level:`block`,start(e){return e.match(/^\[\^/)?.index},tokenizer(t){let n=t.match(/^\[\^(.*)\]:(.*)/);if(n){let[t,r,i]=n,a=e.size+1;return e.set(r,{index:a,text:i}),{type:`footnoteDef`,raw:t,fnId:r,index:a,text:i}}},renderer(t){let{index:n,text:r,fnId:i}=t,a=`
                <code>${n}.</code> 
                <span>${r}</span> 
                    <a id="fnDef-${i}" href="#fnRef-${i}" style="color: var(--md-primary-color);">\u21A9\uFE0E</a>
                <br>`;return n===1?`
            <p style="font-size: 80%;margin: 0.5em 8px;word-break:break-all;">${a}`:n===e.size?`${a}</p>`:a}},{name:`footnoteRef`,level:`inline`,start(e){return e.match(/\[\^/)?.index},tokenizer(e){let t=e.match(/^\[\^(.*?)\]/);if(t){let[e,n]=t;return{type:`footnoteRef`,raw:e,fnId:n}}},renderer(t){let{fnId:n}=t,r=e.get(n);if(!r)return t.raw;let{index:i}=r;return`<sup style="color: var(--md-primary-color);">
                    <a href="#fnDef-${n}" id="fnRef-${n}">\[${i}\]</a>
                </sup>`}}]}}function je(){return{extensions:[{name:`markup_highlight`,level:`inline`,start(e){return e.match(/==(?!=)/)?.index},tokenizer(e){let t=/^==((?:[^=]|=(?!=))+)==/.exec(e);if(t)return{type:`markup_highlight`,raw:t[0],text:t[1]}},renderer:M(e=>`<span class="markup-highlight">${e.text}</span>`)},{name:`markup_underline`,level:`inline`,start(e){return e.match(/\+\+(?!\+)/)?.index},tokenizer(e){let t=/^\+\+((?:[^+]|\+(?!\+))+)\+\+/.exec(e);if(t)return{type:`markup_underline`,raw:t[0],text:t[1]}},renderer:M(e=>`<span class="markup-underline">${e.text}</span>`)},{name:`markup_wavyline`,level:`inline`,start(e){return e.match(/~(?!~)/)?.index},tokenizer(e){let t=/^~([^~\n]+)~(?!~)/.exec(e);if(t)return{type:`markup_wavyline`,raw:t[0],text:t[1]}},renderer:M(e=>`<span class="markup-wavyline">${e.text}</span>`)}]}}function Me(){return{extensions:[{name:`ruby`,level:`inline`,start(e){return e.match(/\[/)?.index},tokenizer(e){let t=/^\[([^\]]+)\]\{([^}]+)\}/.exec(e);if(t)return{type:`ruby`,raw:t[0],text:t[1].trim(),ruby:t[2].trim(),format:`basic`};if(t=/^\[([^\]]+)\]\^\(([^)]+)\)/.exec(e),t)return{type:`ruby`,raw:t[0],text:t[1].trim(),ruby:t[2].trim(),format:`basic-hat`}},renderer:M(e=>{let{text:t,ruby:n,format:r}=e,i=/[・．。-]/g;if(i.test(n)){let e=n.split(i).filter(e=>e.trim()!==``),a=t.split(``),o=[];if(a.length>=e.length){let t=0;for(let n=0;n<e.length;n++){let i=e[n],s=a.length-t,c=e.length-n,l=1;c===1&&(l=s);let u=a.slice(t,t+l).join(``);o.push(`<ruby data-text="${u}" data-ruby="${i}" data-format="${r}">${u}<rp>(</rp><rt>${i}</rt><rp>)</rp></ruby>`),t+=l}t<a.length&&o.push(a.slice(t).join(``))}else for(let t=0;t<a.length;t++){let n=a[t],i=e[t]||``;i?o.push(`<ruby data-text="${n}" data-ruby="${i}" data-format="${r}">${n}<rp>(</rp><rt>${i}</rt><rp>)</rp></ruby>`):o.push(n)}return o.join(``)}return`<ruby data-text="${t}" data-ruby="${n}" data-format="${r}">${t}<rp>(</rp><rt>${n}</rt><rp>)</rp></ruby>`})}]}}function Ne(){return{extensions:[{name:`horizontalSlider`,level:`block`,start(e){return e.match(/^<!\[/)?.index},tokenizer(e){let t=e.match(/^<(!\[.*?\]\(.*?\)(?:,!\[.*?\]\(.*?\))*)>/);if(t)return{type:`horizontalSlider`,raw:t[0],text:t[1]}},renderer(e){let{text:t}=e,n=t.match(/!\[(.*?)\]\((.*?)\)/g)||[];return n.length===0?``:`
            <section style="box-sizing: border-box; font-size: 16px;">
              <section data-role="outer" style="font-family: 微软雅黑; font-size: 16px;">
                <section data-role="paragraph" style="margin: 0px auto; box-sizing: border-box; width: 100%;">
                  <section style="margin: 0px auto; text-align: center;">
                    <section style="display: inline-block; width: 100%;">
                      <!-- WeChat-compatible horizontal scroll image container -->
                      <section style="overflow-x: scroll; -webkit-overflow-scrolling: touch; white-space: nowrap; width: 100%; text-align: center;">
                        ${n.map(e=>{let t=e.match(/!\[(.*?)\]/)||[],n=e.match(/\]\((.*?)\)/)||[],r=t[1]||``;return{src:n[1]||``,alt:r}}).map((e,t)=>`<section style="display: inline-block; width: 100%; margin-right: 0; vertical-align: top;">
                          <img src="${e.src}" alt="${e.alt}" title="${e.alt}" style="width: 100%; height: auto; border-radius: 4px; vertical-align: top;"/>
                          <p style="margin-top: 5px; font-size: 14px; color: #666; text-align: center; white-space: normal;">${e.alt}</p>
                        </section>`).join(``)}
                      </section>
                    </section>
                  </section>
                </section>
              </section>
              <p style="font-size: 14px; color: #999; text-align: center; margin-top: 5px;"><<< 左右滑动看更多 >>></p>
            </section>
          `}}]}}function Pe(){let e=[];return{hooks:{preprocess(t){return e=[],t}},walkTokens(t){if(t.type===`heading`){let n=t.text||``,r=t.depth||1,i=e.length;e.push({text:n,depth:r,index:i})}},extensions:[{name:`toc`,level:`block`,start(e){let t=e.match(/^\s*\[TOC\]\s*$/m);return t?t.index:void 0},tokenizer(e){let t=/^\[TOC\]/.exec(e);if(t)return{type:`toc`,raw:t[0]}},renderer(){let t=e.filter(e=>e.depth!==1);if(!t.length)return``;let n=Math.min(...t.map(e=>e.depth)),r=`<nav class="markdown-toc"><ul class="toc-ul toc-level-${n} pl-4 border-l ml-2">`,i=n;t.forEach(({text:e,depth:t,index:n})=>{if(t>i)for(let e=i+1;e<=t;e++)r+=`<ul class="toc-ul toc-level-${e} pl-4 border-l ml-2">`;else if(t<i)for(let e=i;e>t;e--)r+=`</ul>`;r+=`<li class="toc-li toc-level-${t} mb-1"><a class="text-gray-700 hover:text-blue-600 underline transition-colors" href="#${n}">${e}</a></li>`,i=t});for(let e=i;e>1;e--)r+=`</ul>`;return r+=`</ul></nav>`,r}}]}}function Fe(e,t){return t.some(([t,n])=>t<=e&&e<=n)}function Ie(e){return typeof e==`string`&&Fe(e.charCodeAt(0),[[12352,12447],[19968,40959],[44032,55203],[131072,191456]])}function Le(e){return typeof e==`string`&&` 
\r	`.includes(e)}function Re(e){return typeof e==`string`&&Fe(e.charCodeAt(0),[[33,47],[58,64],[91,96],[123,126],[12288,12351],[65280,65519]])}function ze(e,t={}){let n=0,r=0,i=e.length-1,a=t.wordsPerMinute||200,o=t.wordBound||Le;for(;o(e[r]);)r++;for(;o(e[i]);)i--;let s=`${e}\n`;for(let e=r;e<=i;e++)if((Ie(s[e])||!o(s[e])&&(o(s[e+1])||Ie(s[e+1])))&&n++,Ie(s[e]))for(;e<=i&&(Re(s[e+1])||o(s[e+1]));)e++;let c=n/a,l=Math.round(c*60*1e3);return{text:`${Math.ceil(Number(c.toFixed(2)))} min read`,minutes:c,time:l,words:n}}var Y=n(((e,t)=>{function n(e){return e==null}function r(e){return typeof e==`object`&&!!e}function i(e){return Array.isArray(e)?e:n(e)?[]:[e]}function a(e,t){if(t){let n=Object.keys(t);for(let r=0,i=n.length;r<i;r+=1){let i=n[r];e[i]=t[i]}}return e}function o(e,t){let n=``;for(let r=0;r<t;r+=1)n+=e;return n}function s(e){return e===0&&1/e==-1/0}t.exports.isNothing=n,t.exports.isObject=r,t.exports.toArray=i,t.exports.repeat=o,t.exports.isNegativeZero=s,t.exports.extend=a})),X=n(((e,t)=>{function n(e,t){let n=``,r=e.reason||`(unknown reason)`;return e.mark?(e.mark.name&&(n+=`in "`+e.mark.name+`" `),n+=`(`+(e.mark.line+1)+`:`+(e.mark.column+1)+`)`,!t&&e.mark.snippet&&(n+=`

`+e.mark.snippet),r+` `+n):r}function r(e,t){Error.call(this),this.name=`YAMLException`,this.reason=e,this.mark=t,this.message=n(this,!1),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=Error().stack||``}r.prototype=Object.create(Error.prototype),r.prototype.constructor=r,r.prototype.toString=function(e){return this.name+`: `+n(this,e)},t.exports=r})),Be=n(((e,t)=>{var n=Y();function r(e,t,n,r,i){let a=``,o=``,s=Math.floor(i/2)-1;return r-t>s&&(a=` ... `,t=r-s+a.length),n-r>s&&(o=` ...`,n=r+s-o.length),{str:a+e.slice(t,n).replace(/\t/g,`→`)+o,pos:r-t+a.length}}function i(e,t){return n.repeat(` `,t-e.length)+e}function a(e,t){if(t=Object.create(t||null),!e.buffer)return null;t.maxLength||(t.maxLength=79),typeof t.indent!=`number`&&(t.indent=1),typeof t.linesBefore!=`number`&&(t.linesBefore=3),typeof t.linesAfter!=`number`&&(t.linesAfter=2);let a=/\r?\n|\r|\0/g,o=[0],s=[],c,l=-1;for(;c=a.exec(e.buffer);)s.push(c.index),o.push(c.index+c[0].length),e.position<=c.index&&l<0&&(l=o.length-2);l<0&&(l=o.length-1);let u=``,d=Math.min(e.line+t.linesAfter,s.length).toString().length,f=t.maxLength-(t.indent+d+3);for(let a=1;a<=t.linesBefore&&!(l-a<0);a++){let c=r(e.buffer,o[l-a],s[l-a],e.position-(o[l]-o[l-a]),f);u=n.repeat(` `,t.indent)+i((e.line-a+1).toString(),d)+` | `+c.str+`
`+u}let p=r(e.buffer,o[l],s[l],e.position,f);u+=n.repeat(` `,t.indent)+i((e.line+1).toString(),d)+` | `+p.str+`
`,u+=n.repeat(`-`,t.indent+d+3+p.pos)+`^
`;for(let a=1;a<=t.linesAfter&&!(l+a>=s.length);a++){let c=r(e.buffer,o[l+a],s[l+a],e.position-(o[l]-o[l+a]),f);u+=n.repeat(` `,t.indent)+i((e.line+a+1).toString(),d)+` | `+c.str+`
`}return u.replace(/\n$/,``)}t.exports=a})),Z=n(((e,t)=>{var n=X(),r=[`kind`,`multi`,`resolve`,`construct`,`instanceOf`,`predicate`,`represent`,`representName`,`defaultStyle`,`styleAliases`],i=[`scalar`,`sequence`,`mapping`];function a(e){let t={};return e!==null&&Object.keys(e).forEach(function(n){e[n].forEach(function(e){t[String(e)]=n})}),t}function o(e,t){if(t||={},Object.keys(t).forEach(function(t){if(r.indexOf(t)===-1)throw new n(`Unknown option "`+t+`" is met in definition of "`+e+`" YAML type.`)}),this.options=t,this.tag=e,this.kind=t.kind||null,this.resolve=t.resolve||function(){return!0},this.construct=t.construct||function(e){return e},this.instanceOf=t.instanceOf||null,this.predicate=t.predicate||null,this.represent=t.represent||null,this.representName=t.representName||null,this.defaultStyle=t.defaultStyle||null,this.multi=t.multi||!1,this.styleAliases=a(t.styleAliases||null),i.indexOf(this.kind)===-1)throw new n(`Unknown kind "`+this.kind+`" is specified for "`+e+`" YAML type.`)}t.exports=o})),Ve=n(((e,t)=>{var n=X(),r=Z();function i(e,t){let n=[];return e[t].forEach(function(e){let t=n.length;n.forEach(function(n,r){n.tag===e.tag&&n.kind===e.kind&&n.multi===e.multi&&(t=r)}),n[t]=e}),n}function a(){let e={scalar:{},sequence:{},mapping:{},fallback:{},multi:{scalar:[],sequence:[],mapping:[],fallback:[]}};function t(t){t.multi?(e.multi[t.kind].push(t),e.multi.fallback.push(t)):e[t.kind][t.tag]=e.fallback[t.tag]=t}for(let e=0,n=arguments.length;e<n;e+=1)arguments[e].forEach(t);return e}function o(e){return this.extend(e)}o.prototype.extend=function(e){let t=[],s=[];if(e instanceof r)s.push(e);else if(Array.isArray(e))s=s.concat(e);else if(e&&(Array.isArray(e.implicit)||Array.isArray(e.explicit)))e.implicit&&(t=t.concat(e.implicit)),e.explicit&&(s=s.concat(e.explicit));else throw new n(`Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })`);t.forEach(function(e){if(!(e instanceof r))throw new n(`Specified list of YAML types (or a single Type object) contains a non-Type object.`);if(e.loadKind&&e.loadKind!==`scalar`)throw new n(`There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.`);if(e.multi)throw new n(`There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.`)}),s.forEach(function(e){if(!(e instanceof r))throw new n(`Specified list of YAML types (or a single Type object) contains a non-Type object.`)});let c=Object.create(o.prototype);return c.implicit=(this.implicit||[]).concat(t),c.explicit=(this.explicit||[]).concat(s),c.compiledImplicit=i(c,`implicit`),c.compiledExplicit=i(c,`explicit`),c.compiledTypeMap=a(c.compiledImplicit,c.compiledExplicit),c},t.exports=o})),He=n(((e,t)=>{t.exports=new(Z())(`tag:yaml.org,2002:str`,{kind:`scalar`,construct:function(e){return e===null?``:e}})})),Ue=n(((e,t)=>{t.exports=new(Z())(`tag:yaml.org,2002:seq`,{kind:`sequence`,construct:function(e){return e===null?[]:e}})})),We=n(((e,t)=>{t.exports=new(Z())(`tag:yaml.org,2002:map`,{kind:`mapping`,construct:function(e){return e===null?{}:e}})})),Ge=n(((e,t)=>{t.exports=new(Ve())({explicit:[He(),Ue(),We()]})})),Ke=n(((e,t)=>{var n=Z();function r(e){if(e===null)return!0;let t=e.length;return t===1&&e===`~`||t===4&&(e===`null`||e===`Null`||e===`NULL`)}function i(){return null}function a(e){return e===null}t.exports=new n(`tag:yaml.org,2002:null`,{kind:`scalar`,resolve:r,construct:i,predicate:a,represent:{canonical:function(){return`~`},lowercase:function(){return`null`},uppercase:function(){return`NULL`},camelcase:function(){return`Null`},empty:function(){return``}},defaultStyle:`lowercase`})})),qe=n(((e,t)=>{var n=Z();function r(e){if(e===null)return!1;let t=e.length;return t===4&&(e===`true`||e===`True`||e===`TRUE`)||t===5&&(e===`false`||e===`False`||e===`FALSE`)}function i(e){return e===`true`||e===`True`||e===`TRUE`}function a(e){return Object.prototype.toString.call(e)===`[object Boolean]`}t.exports=new n(`tag:yaml.org,2002:bool`,{kind:`scalar`,resolve:r,construct:i,predicate:a,represent:{lowercase:function(e){return e?`true`:`false`},uppercase:function(e){return e?`TRUE`:`FALSE`},camelcase:function(e){return e?`True`:`False`}},defaultStyle:`lowercase`})})),Je=n(((e,t)=>{var n=Y(),r=Z();function i(e){return e>=48&&e<=57||e>=65&&e<=70||e>=97&&e<=102}function a(e){return e>=48&&e<=55}function o(e){return e>=48&&e<=57}function s(e){if(e===null)return!1;let t=e.length,n=0,r=!1;if(!t)return!1;let s=e[n];if((s===`-`||s===`+`)&&(s=e[++n]),s===`0`){if(n+1===t)return!0;if(s=e[++n],s===`b`){for(n++;n<t;n++){if(s=e[n],s!==`0`&&s!==`1`)return!1;r=!0}return r&&isFinite(c(e))}if(s===`x`){for(n++;n<t;n++){if(!i(e.charCodeAt(n)))return!1;r=!0}return r&&isFinite(c(e))}if(s===`o`){for(n++;n<t;n++){if(!a(e.charCodeAt(n)))return!1;r=!0}return r&&isFinite(c(e))}}for(;n<t;n++){if(!o(e.charCodeAt(n)))return!1;r=!0}return r?isFinite(c(e)):!1}function c(e){let t=e,n=1,r=t[0];if((r===`-`||r===`+`)&&(r===`-`&&(n=-1),t=t.slice(1),r=t[0]),t===`0`)return 0;if(r===`0`){if(t[1]===`b`)return n*parseInt(t.slice(2),2);if(t[1]===`x`)return n*parseInt(t.slice(2),16);if(t[1]===`o`)return n*parseInt(t.slice(2),8)}return n*parseInt(t,10)}function l(e){return c(e)}function u(e){return Object.prototype.toString.call(e)===`[object Number]`&&e%1==0&&!n.isNegativeZero(e)}t.exports=new r(`tag:yaml.org,2002:int`,{kind:`scalar`,resolve:s,construct:l,predicate:u,represent:{binary:function(e){return e>=0?`0b`+e.toString(2):`-0b`+e.toString(2).slice(1)},octal:function(e){return e>=0?`0o`+e.toString(8):`-0o`+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?`0x`+e.toString(16).toUpperCase():`-0x`+e.toString(16).toUpperCase().slice(1)}},defaultStyle:`decimal`,styleAliases:{binary:[2,`bin`],octal:[8,`oct`],decimal:[10,`dec`],hexadecimal:[16,`hex`]}})})),Ye=n(((e,t)=>{var n=Y(),r=Z(),i=RegExp(`^(?:[-+]?(?:[0-9]+)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`),a=RegExp(`^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function o(e){return e===null||!i.test(e)?!1:isFinite(parseFloat(e,10))?!0:a.test(e)}function s(e){let t=e.toLowerCase(),n=t[0]===`-`?-1:1;return`+-`.indexOf(t[0])>=0&&(t=t.slice(1)),t===`.inf`?n===1?1/0:-1/0:t===`.nan`?NaN:n*parseFloat(t,10)}var c=/^[-+]?[0-9]+e/;function l(e,t){if(isNaN(e))switch(t){case`lowercase`:return`.nan`;case`uppercase`:return`.NAN`;case`camelcase`:return`.NaN`}else if(e===1/0)switch(t){case`lowercase`:return`.inf`;case`uppercase`:return`.INF`;case`camelcase`:return`.Inf`}else if(e===-1/0)switch(t){case`lowercase`:return`-.inf`;case`uppercase`:return`-.INF`;case`camelcase`:return`-.Inf`}else if(n.isNegativeZero(e))return`-0.0`;let r=e.toString(10);return c.test(r)?r.replace(`e`,`.e`):r}function u(e){return Object.prototype.toString.call(e)===`[object Number]`&&(e%1!=0||n.isNegativeZero(e))}t.exports=new r(`tag:yaml.org,2002:float`,{kind:`scalar`,resolve:o,construct:s,predicate:u,represent:l,defaultStyle:`lowercase`})})),Xe=n(((e,t)=>{t.exports=Ge().extend({implicit:[Ke(),qe(),Je(),Ye()]})})),Ze=n(((e,t)=>{t.exports=Xe()})),Qe=n(((e,t)=>{var n=Z(),r=RegExp(`^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$`),i=RegExp(`^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$`);function a(e){return e===null?!1:r.exec(e)!==null||i.exec(e)!==null}function o(e){let t=0,n=null,a=r.exec(e);if(a===null&&(a=i.exec(e)),a===null)throw Error(`Date resolve error`);let o=+a[1],s=a[2]-1,c=+a[3];if(!a[4])return new Date(Date.UTC(o,s,c));let l=+a[4],u=+a[5],d=+a[6];if(a[7]){for(t=a[7].slice(0,3);t.length<3;)t+=`0`;t=+t}if(a[9]){let e=+a[10],t=+(a[11]||0);n=(e*60+t)*6e4,a[9]===`-`&&(n=-n)}let f=new Date(Date.UTC(o,s,c,l,u,d,t));return n&&f.setTime(f.getTime()-n),f}function s(e){return e.toISOString()}t.exports=new n(`tag:yaml.org,2002:timestamp`,{kind:`scalar`,resolve:a,construct:o,instanceOf:Date,represent:s})})),$e=n(((e,t)=>{var n=Z();function r(e){return e===`<<`||e===null}t.exports=new n(`tag:yaml.org,2002:merge`,{kind:`scalar`,resolve:r})})),et=n(((e,t)=>{var n=Z(),r=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function i(e){if(e===null)return!1;let t=0,n=e.length,i=r;for(let r=0;r<n;r++){let n=i.indexOf(e.charAt(r));if(!(n>64)){if(n<0)return!1;t+=6}}return t%8==0}function a(e){let t=e.replace(/[\r\n=]/g,``),n=t.length,i=r,a=0,o=[];for(let e=0;e<n;e++)e%4==0&&e&&(o.push(a>>16&255),o.push(a>>8&255),o.push(a&255)),a=a<<6|i.indexOf(t.charAt(e));let s=n%4*6;return s===0?(o.push(a>>16&255),o.push(a>>8&255),o.push(a&255)):s===18?(o.push(a>>10&255),o.push(a>>2&255)):s===12&&o.push(a>>4&255),new Uint8Array(o)}function o(e){let t=``,n=0,i=e.length,a=r;for(let r=0;r<i;r++)r%3==0&&r&&(t+=a[n>>18&63],t+=a[n>>12&63],t+=a[n>>6&63],t+=a[n&63]),n=(n<<8)+e[r];let o=i%3;return o===0?(t+=a[n>>18&63],t+=a[n>>12&63],t+=a[n>>6&63],t+=a[n&63]):o===2?(t+=a[n>>10&63],t+=a[n>>4&63],t+=a[n<<2&63],t+=a[64]):o===1&&(t+=a[n>>2&63],t+=a[n<<4&63],t+=a[64],t+=a[64]),t}function s(e){return Object.prototype.toString.call(e)===`[object Uint8Array]`}t.exports=new n(`tag:yaml.org,2002:binary`,{kind:`scalar`,resolve:i,construct:a,predicate:s,represent:o})})),tt=n(((e,t)=>{var n=Z(),r=Object.prototype.hasOwnProperty,i=Object.prototype.toString;function a(e){if(e===null)return!0;let t={},n=e;for(let e=0,a=n.length;e<a;e+=1){let a=n[e],o=!1;if(i.call(a)!==`[object Object]`)return!1;let s;for(s in a)if(r.call(a,s))if(!o)o=!0;else return!1;if(!o||r.call(t,s))return!1;Object.defineProperty(t,s,{value:!0})}return!0}function o(e){return e===null?[]:e}t.exports=new n(`tag:yaml.org,2002:omap`,{kind:`sequence`,resolve:a,construct:o})})),nt=n(((e,t)=>{var n=Z(),r=Object.prototype.toString;function i(e){if(e===null)return!0;let t=e,n=Array(t.length);for(let e=0,i=t.length;e<i;e+=1){let i=t[e];if(r.call(i)!==`[object Object]`)return!1;let a=Object.keys(i);if(a.length!==1)return!1;n[e]=[a[0],i[a[0]]]}return!0}function a(e){if(e===null)return[];let t=e,n=Array(t.length);for(let e=0,r=t.length;e<r;e+=1){let r=t[e],i=Object.keys(r);n[e]=[i[0],r[i[0]]]}return n}t.exports=new n(`tag:yaml.org,2002:pairs`,{kind:`sequence`,resolve:i,construct:a})})),rt=n(((e,t)=>{var n=Z(),r=Object.prototype.hasOwnProperty;function i(e){if(e===null)return!0;let t=e;for(let e in t)if(r.call(t,e)&&t[e]!==null)return!1;return!0}function a(e){return e===null?{}:e}t.exports=new n(`tag:yaml.org,2002:set`,{kind:`mapping`,resolve:i,construct:a})})),it=n(((e,t)=>{t.exports=Ze().extend({implicit:[Qe(),$e()],explicit:[et(),tt(),nt(),rt()]})})),at=n(((e,t)=>{var n=Y(),r=X(),i=Be(),a=it(),o=Object.prototype.hasOwnProperty,s=1,c=2,l=3,u=4,d=1,f=2,p=3,m=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,h=/[\x85\u2028\u2029]/,g=/[,\[\]{}]/,_=/^(?:!|!!|![0-9A-Za-z-]+!)$/,v=/^(?:!|[^,\[\]{}])(?:%[0-9a-f]{2}|[0-9a-z\-#;/?:@&=+$,_.!~*'()\[\]])*$/i;function y(e){return Object.prototype.toString.call(e)}function b(e){return e===10||e===13}function x(e){return e===9||e===32}function S(e){return e===9||e===32||e===10||e===13}function C(e){return e===44||e===91||e===93||e===123||e===125}function ee(e){if(e>=48&&e<=57)return e-48;let t=e|32;return t>=97&&t<=102?t-97+10:-1}function te(e){return e===120?2:e===117?4:e===85?8:0}function ne(e){return e>=48&&e<=57?e-48:-1}function w(e){switch(e){case 48:return`\0`;case 97:return`\x07`;case 98:return`\b`;case 116:return`	`;case 9:return`	`;case 110:return`
`;case 118:return`\v`;case 102:return`\f`;case 114:return`\r`;case 101:return`\x1B`;case 32:return` `;case 34:return`"`;case 47:return`/`;case 92:return`\\`;case 78:return``;case 95:return`\xA0`;case 76:return`\u2028`;case 80:return`\u2029`;default:return``}}function re(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function T(e,t,n){t===`__proto__`?Object.defineProperty(e,t,{configurable:!0,enumerable:!0,writable:!0,value:n}):e[t]=n}var ie=Array(256),E=Array(256);for(let e=0;e<256;e++)ie[e]=+!!w(e),E[e]=w(e);function D(e,t){this.input=e,this.filename=t.filename||null,this.schema=t.schema||a,this.onWarning=t.onWarning||null,this.legacy=t.legacy||!1,this.json=t.json||!1,this.listener=t.listener||null,this.maxDepth=typeof t.maxDepth==`number`?t.maxDepth:100,this.maxTotalMergeKeys=typeof t.maxTotalMergeKeys==`number`?t.maxTotalMergeKeys:1e4,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.depth=0,this.totalMergeKeys=0,this.firstTabInLine=-1,this.documents=[],this.anchorMapTransactions=[]}function ae(e,t){let n={name:e.filename,buffer:e.input.slice(0,-1),position:e.position,line:e.line,column:e.position-e.lineStart};return n.snippet=i(n),new r(t,n)}function O(e,t){throw ae(e,t)}function k(e,t){e.onWarning&&e.onWarning.call(null,ae(e,t))}function A(e,t,n){let r=e.anchorMapTransactions;if(r.length!==0){let n=r[r.length-1];o.call(n,t)||(n[t]={existed:o.call(e.anchorMap,t),value:e.anchorMap[t]})}e.anchorMap[t]=n}function oe(e){e.anchorMapTransactions.push(Object.create(null))}function j(e){let t=e.anchorMapTransactions.pop(),n=e.anchorMapTransactions;if(n.length===0)return;let r=n[n.length-1],i=Object.keys(t);for(let e=0,n=i.length;e<n;e+=1){let n=i[e];o.call(r,n)||(r[n]=t[n])}}function M(e){let t=e.anchorMapTransactions.pop(),n=Object.keys(t);for(let r=n.length-1;r>=0;--r){let i=t[n[r]];i.existed?e.anchorMap[n[r]]=i.value:delete e.anchorMap[n[r]]}}function N(e){return{position:e.position,line:e.line,lineStart:e.lineStart,lineIndent:e.lineIndent,firstTabInLine:e.firstTabInLine,tag:e.tag,anchor:e.anchor,kind:e.kind,result:e.result}}function P(e,t){e.position=t.position,e.line=t.line,e.lineStart=t.lineStart,e.lineIndent=t.lineIndent,e.firstTabInLine=t.firstTabInLine,e.tag=t.tag,e.anchor=t.anchor,e.kind=t.kind,e.result=t.result}var se={YAML:function(e,t,n){e.version!==null&&O(e,`duplication of %YAML directive`),n.length!==1&&O(e,`YAML directive accepts exactly one argument`);let r=/^([0-9]+)\.([0-9]+)$/.exec(n[0]);r===null&&O(e,`ill-formed argument of the YAML directive`);let i=parseInt(r[1],10),a=parseInt(r[2],10);i!==1&&O(e,`unacceptable YAML version of the document`),e.version=n[0],e.checkLineBreaks=a<2,a!==1&&a!==2&&k(e,`unsupported YAML version of the document`)},TAG:function(e,t,n){let r;n.length!==2&&O(e,`TAG directive accepts exactly two arguments`);let i=n[0];r=n[1],_.test(i)||O(e,`ill-formed tag handle (first argument) of the TAG directive`),o.call(e.tagMap,i)&&O(e,`there is a previously declared suffix for "`+i+`" tag handle`),v.test(r)||O(e,`ill-formed tag prefix (second argument) of the TAG directive`);try{r=decodeURIComponent(r)}catch{O(e,`tag prefix is malformed: `+r)}e.tagMap[i]=r}};function F(e,t,n,r){if(t<n){let i=e.input.slice(t,n);if(r)for(let t=0,n=i.length;t<n;t+=1){let n=i.charCodeAt(t);n===9||n>=32&&n<=1114111||O(e,`expected valid JSON character`)}else m.test(i)&&O(e,`the stream contains non-printable characters`);e.result+=i}}function I(e,t,r,i){n.isObject(r)||O(e,`cannot merge mappings; the provided source object is unacceptable`);let a=Object.keys(r);for(let n=0,s=a.length;n<s;n+=1){let s=a[n];e.maxTotalMergeKeys!==-1&&++e.totalMergeKeys>e.maxTotalMergeKeys&&O(e,`merge keys exceeded maxTotalMergeKeys (`+e.maxTotalMergeKeys+`)`),o.call(t,s)||(T(t,s,r[s]),i[s]=!0)}}function L(e,t,n,r,i,a,s,c,l){if(Array.isArray(i)){i=Array.prototype.slice.call(i);for(let t=0,n=i.length;t<n;t+=1)Array.isArray(i[t])&&O(e,`nested arrays are not supported inside keys`),typeof i==`object`&&y(i[t])===`[object Object]`&&(i[t]=`[object Object]`)}if(typeof i==`object`&&y(i)===`[object Object]`&&(i=`[object Object]`),i=String(i),t===null&&(t={}),r===`tag:yaml.org,2002:merge`)if(Array.isArray(a))for(let r=0,i=a.length;r<i;r+=1)I(e,t,a[r],n);else I(e,t,a,n);else!e.json&&!o.call(n,i)&&o.call(t,i)&&(e.line=s||e.line,e.lineStart=c||e.lineStart,e.position=l||e.position,O(e,`duplicated mapping key`)),T(t,i,a),delete n[i];return t}function R(e){let t=e.input.charCodeAt(e.position);t===10?e.position++:t===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):O(e,`a line break is expected`),e.line+=1,e.lineStart=e.position,e.firstTabInLine=-1}function z(e,t,n){let r=0,i=e.input.charCodeAt(e.position);for(;i!==0;){for(;x(i);)i===9&&e.firstTabInLine===-1&&(e.firstTabInLine=e.position),i=e.input.charCodeAt(++e.position);if(t&&i===35)do i=e.input.charCodeAt(++e.position);while(i!==10&&i!==13&&i!==0);if(b(i))for(R(e),i=e.input.charCodeAt(e.position),r++,e.lineIndent=0;i===32;)e.lineIndent++,i=e.input.charCodeAt(++e.position);else break}return n!==-1&&r!==0&&e.lineIndent<n&&k(e,`deficient indentation`),r}function B(e){let t=e.position,n=e.input.charCodeAt(t);return!!((n===45||n===46)&&n===e.input.charCodeAt(t+1)&&n===e.input.charCodeAt(t+2)&&(t+=3,n=e.input.charCodeAt(t),n===0||S(n)))}function V(e,t){t===1?e.result+=` `:t>1&&(e.result+=n.repeat(`
`,t-1))}function ce(e,t,n){let r,i,a,o,s,c,l=e.kind,u=e.result,d=e.input.charCodeAt(e.position);if(S(d)||C(d)||d===35||d===38||d===42||d===33||d===124||d===62||d===39||d===34||d===37||d===64||d===96)return!1;if(d===63||d===45){let t=e.input.charCodeAt(e.position+1);if(S(t)||n&&C(t))return!1}for(e.kind=`scalar`,e.result=``,r=i=e.position,a=!1;d!==0;){if(d===58){let t=e.input.charCodeAt(e.position+1);if(S(t)||n&&C(t))break}else if(d===35){if(S(e.input.charCodeAt(e.position-1)))break}else if(e.position===e.lineStart&&B(e)||n&&C(d))break;else if(b(d)){if(o=e.line,s=e.lineStart,c=e.lineIndent,z(e,!1,-1),e.lineIndent>=t){a=!0,d=e.input.charCodeAt(e.position);continue}e.position=i,e.line=o,e.lineStart=s,e.lineIndent=c;break}a&&=(F(e,r,i,!1),V(e,e.line-o),r=i=e.position,!1),x(d)||(i=e.position+1),d=e.input.charCodeAt(++e.position)}return F(e,r,i,!1),e.result?!0:(e.kind=l,e.result=u,!1)}function le(e,t){let n,r,i=e.input.charCodeAt(e.position);if(i!==39)return!1;for(e.kind=`scalar`,e.result=``,e.position++,n=r=e.position;(i=e.input.charCodeAt(e.position))!==0;)if(i===39)if(F(e,n,e.position,!0),i=e.input.charCodeAt(++e.position),i===39)n=e.position,e.position++,r=e.position;else return!0;else b(i)?(F(e,n,r,!0),V(e,z(e,!1,t)),n=r=e.position):e.position===e.lineStart&&B(e)?O(e,`unexpected end of the document within a single quoted scalar`):(e.position++,x(i)||(r=e.position));O(e,`unexpected end of the stream within a single quoted scalar`)}function H(e,t){let n,r,i,a=e.input.charCodeAt(e.position);if(a!==34)return!1;for(e.kind=`scalar`,e.result=``,e.position++,n=r=e.position;(a=e.input.charCodeAt(e.position))!==0;)if(a===34)return F(e,n,e.position,!0),e.position++,!0;else if(a===92){if(F(e,n,e.position,!0),a=e.input.charCodeAt(++e.position),b(a))z(e,!1,t);else if(a<256&&ie[a])e.result+=E[a],e.position++;else if((i=te(a))>0){let t=i,n=0;for(;t>0;t--)a=e.input.charCodeAt(++e.position),(i=ee(a))>=0?n=(n<<4)+i:O(e,`expected hexadecimal character`);e.result+=re(n),e.position++}else O(e,`unknown escape sequence`);n=r=e.position}else b(a)?(F(e,n,r,!0),V(e,z(e,!1,t)),n=r=e.position):e.position===e.lineStart&&B(e)?O(e,`unexpected end of the document within a double quoted scalar`):(e.position++,x(a)||(r=e.position));O(e,`unexpected end of the stream within a double quoted scalar`)}function ue(e,t){let n=!0,r,i,a,o=e.tag,c,l=e.anchor,u,d,f,p,m=Object.create(null),h,g,_,v=e.input.charCodeAt(e.position);if(v===91)u=93,p=!1,c=[];else if(v===123)u=125,p=!0,c={};else return!1;for(e.anchor!==null&&A(e,e.anchor,c),v=e.input.charCodeAt(++e.position);v!==0;){if(z(e,!0,t),v=e.input.charCodeAt(e.position),v===u)return e.position++,e.tag=o,e.anchor=l,e.kind=p?`mapping`:`sequence`,e.result=c,!0;n?v===44&&O(e,`expected the node content, but found ','`):O(e,`missed comma between flow collection entries`),g=h=_=null,d=f=!1,v===63&&S(e.input.charCodeAt(e.position+1))&&(d=f=!0,e.position++,z(e,!0,t)),r=e.line,i=e.lineStart,a=e.position,G(e,t,s,!1,!0),g=e.tag,h=e.result,z(e,!0,t),v=e.input.charCodeAt(e.position),(f||e.line===r)&&v===58&&(d=!0,v=e.input.charCodeAt(++e.position),z(e,!0,t),G(e,t,s,!1,!0),_=e.result),p?L(e,c,m,g,h,_,r,i,a):d?c.push(L(e,null,m,g,h,_,r,i,a)):c.push(h),z(e,!0,t),v=e.input.charCodeAt(e.position),v===44?(n=!0,v=e.input.charCodeAt(++e.position)):n=!1}O(e,`unexpected end of the stream within a flow collection`)}function de(e,t){let r,i=d,a=!1,o=!1,s=t,c=0,l=!1,u,m=e.input.charCodeAt(e.position);if(m===124)r=!1;else if(m===62)r=!0;else return!1;for(e.kind=`scalar`,e.result=``;m!==0;)if(m=e.input.charCodeAt(++e.position),m===43||m===45)d===i?i=m===43?p:f:O(e,`repeat of a chomping mode identifier`);else if((u=ne(m))>=0)u===0?O(e,`bad explicit indentation width of a block scalar; it cannot be less than one`):o?O(e,`repeat of an indentation width identifier`):(s=t+u-1,o=!0);else break;if(x(m)){do m=e.input.charCodeAt(++e.position);while(x(m));if(m===35)do m=e.input.charCodeAt(++e.position);while(!b(m)&&m!==0)}for(;m!==0;){for(R(e),e.lineIndent=0,m=e.input.charCodeAt(e.position);(!o||e.lineIndent<s)&&m===32;)e.lineIndent++,m=e.input.charCodeAt(++e.position);if(!o&&e.lineIndent>s&&(s=e.lineIndent),b(m)){c++;continue}if(!o&&s===0&&O(e,`missing indentation for block scalar`),e.lineIndent<s){i===p?e.result+=n.repeat(`
`,a?1+c:c):i===d&&a&&(e.result+=`
`);break}r?x(m)?(l=!0,e.result+=n.repeat(`
`,a?1+c:c)):l?(l=!1,e.result+=n.repeat(`
`,c+1)):c===0?a&&(e.result+=` `):e.result+=n.repeat(`
`,c):e.result+=n.repeat(`
`,a?1+c:c),a=!0,o=!0,c=0;let t=e.position;for(;!b(m)&&m!==0;)m=e.input.charCodeAt(++e.position);F(e,t,e.position,!1)}return!0}function U(e,t){let n=e.tag,r=e.anchor,i=[],a=!1;if(e.firstTabInLine!==-1)return!1;e.anchor!==null&&A(e,e.anchor,i);let o=e.input.charCodeAt(e.position);for(;o!==0&&(e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,O(e,`tab characters must not be used in indentation`)),!(o!==45||!S(e.input.charCodeAt(e.position+1))));){if(a=!0,e.position++,z(e,!0,-1)&&e.lineIndent<=t){i.push(null),o=e.input.charCodeAt(e.position);continue}let n=e.line;if(G(e,t,l,!1,!0),i.push(e.result),z(e,!0,-1),o=e.input.charCodeAt(e.position),(e.line===n||e.lineIndent>t)&&o!==0)O(e,`bad indentation of a sequence entry`);else if(e.lineIndent<t)break}return a?(e.tag=n,e.anchor=r,e.kind=`sequence`,e.result=i,!0):!1}function fe(e,t,n){let r,i,a,o,s=e.tag,l=e.anchor,d={},f=Object.create(null),p=null,m=null,h=null,g=!1,_=!1;if(e.firstTabInLine!==-1)return!1;e.anchor!==null&&A(e,e.anchor,d);let v=e.input.charCodeAt(e.position);for(;v!==0;){!g&&e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,O(e,`tab characters must not be used in indentation`));let y=e.input.charCodeAt(e.position+1),b=e.line;if((v===63||v===58)&&S(y))v===63?(g&&(L(e,d,f,p,m,null,i,a,o),p=m=h=null),_=!0,g=!0,r=!0):g?(g=!1,r=!0):O(e,`incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line`),e.position+=1,v=y;else{if(i=e.line,a=e.lineStart,o=e.position,!G(e,n,c,!1,!0))break;if(e.line===b){for(v=e.input.charCodeAt(e.position);x(v);)v=e.input.charCodeAt(++e.position);if(v===58)v=e.input.charCodeAt(++e.position),S(v)||O(e,`a whitespace character is expected after the key-value separator within a block mapping`),g&&(L(e,d,f,p,m,null,i,a,o),p=m=h=null),_=!0,g=!1,r=!1,p=e.tag,m=e.result;else if(_)O(e,`can not read an implicit mapping pair; a colon is missed`);else return e.tag=s,e.anchor=l,!0}else if(_)O(e,`can not read a block mapping entry; a multiline key may not be an implicit key`);else return e.tag=s,e.anchor=l,!0}if((e.line===b||e.lineIndent>t)&&(g&&(i=e.line,a=e.lineStart,o=e.position),G(e,t,u,!0,r)&&(g?m=e.result:h=e.result),g||(L(e,d,f,p,m,h,i,a,o),p=m=h=null),z(e,!0,-1),v=e.input.charCodeAt(e.position)),(e.line===b||e.lineIndent>t)&&v!==0)O(e,`bad indentation of a mapping entry`);else if(e.lineIndent<t)break}return g&&L(e,d,f,p,m,null,i,a,o),_&&(e.tag=s,e.anchor=l,e.kind=`mapping`,e.result=d),_}function pe(e){let t=!1,n=!1,r,i,a=e.input.charCodeAt(e.position);if(a!==33)return!1;e.tag!==null&&O(e,`duplication of a tag property`),a=e.input.charCodeAt(++e.position),a===60?(t=!0,a=e.input.charCodeAt(++e.position)):a===33?(n=!0,r=`!!`,a=e.input.charCodeAt(++e.position)):r=`!`;let s=e.position;if(t){do a=e.input.charCodeAt(++e.position);while(a!==0&&a!==62);e.position<e.length?(i=e.input.slice(s,e.position),a=e.input.charCodeAt(++e.position)):O(e,`unexpected end of the stream within a verbatim tag`)}else{for(;a!==0&&!S(a);)a===33&&(n?O(e,`tag suffix cannot contain exclamation marks`):(r=e.input.slice(s-1,e.position+1),_.test(r)||O(e,`named tag handle cannot contain such characters`),n=!0,s=e.position+1)),a=e.input.charCodeAt(++e.position);i=e.input.slice(s,e.position),g.test(i)&&O(e,`tag suffix cannot contain flow indicator characters`)}i&&!v.test(i)&&O(e,`tag name cannot contain such characters: `+i);try{i=decodeURIComponent(i)}catch{O(e,`tag name is malformed: `+i)}return t?e.tag=i:o.call(e.tagMap,r)?e.tag=e.tagMap[r]+i:r===`!`?e.tag=`!`+i:r===`!!`?e.tag=`tag:yaml.org,2002:`+i:O(e,`undeclared tag handle "`+r+`"`),!0}function me(e){let t=e.input.charCodeAt(e.position);if(t!==38)return!1;e.anchor!==null&&O(e,`duplication of an anchor property`),t=e.input.charCodeAt(++e.position);let n=e.position;for(;t!==0&&!S(t)&&!C(t);)t=e.input.charCodeAt(++e.position);return e.position===n&&O(e,`name of an anchor node must contain at least one character`),e.anchor=e.input.slice(n,e.position),!0}function he(e){let t=e.input.charCodeAt(e.position);if(t!==42)return!1;t=e.input.charCodeAt(++e.position);let n=e.position;for(;t!==0&&!S(t)&&!C(t);)t=e.input.charCodeAt(++e.position);e.position===n&&O(e,`name of an alias node must contain at least one character`);let r=e.input.slice(n,e.position);return o.call(e.anchorMap,r)||O(e,`unidentified alias "`+r+`"`),e.result=e.anchorMap[r],z(e,!0,-1),!0}function W(e,t,n,r){let i=N(e);return oe(e),P(e,t),e.tag=null,e.anchor=null,e.kind=null,e.result=null,fe(e,n,r)&&e.kind===`mapping`?(j(e),!0):(M(e),P(e,i),!1)}function G(e,t,n,r,i){let a,d,f=1,p=!1,m=!1,h=null,g,_,v;e.depth>=e.maxDepth&&O(e,`nesting exceeded maxDepth (`+e.maxDepth+`)`),e.depth+=1,e.listener!==null&&e.listener(`open`,e),e.tag=null,e.anchor=null,e.kind=null,e.result=null;let y=a=d=u===n||l===n;if(r&&z(e,!0,-1)&&(p=!0,e.lineIndent>t?f=1:e.lineIndent===t?f=0:e.lineIndent<t&&(f=-1)),f===1)for(;;){let n=e.input.charCodeAt(e.position),r=N(e);if(p&&(n===33&&e.tag!==null||n===38&&e.anchor!==null)||!pe(e)&&!me(e))break;h===null&&(h=r),z(e,!0,-1)?(p=!0,d=y,e.lineIndent>t?f=1:e.lineIndent===t?f=0:e.lineIndent<t&&(f=-1)):d=!1}if(d&&=p||i,f===1||u===n)if(_=s===n||c===n?t:t+1,v=e.position-e.lineStart,f===1)if(d&&(U(e,v)||fe(e,v,_))||ue(e,_))m=!0;else{let t=e.input.charCodeAt(e.position);h!==null&&y&&!d&&t!==124&&t!==62&&W(e,h,h.position-h.lineStart,_)||a&&de(e,_)||le(e,_)||H(e,_)?m=!0:he(e)?(m=!0,(e.tag!==null||e.anchor!==null)&&O(e,`alias node should not have any properties`)):ce(e,_,s===n)&&(m=!0,e.tag===null&&(e.tag=`?`)),e.anchor!==null&&A(e,e.anchor,e.result)}else f===0&&(m=d&&U(e,v));if(e.tag===null)e.anchor!==null&&A(e,e.anchor,e.result);else if(e.tag===`?`){e.result!==null&&e.kind!==`scalar`&&O(e,`unacceptable node kind for !<?> tag; it should be "scalar", not "`+e.kind+`"`);for(let t=0,n=e.implicitTypes.length;t<n;t+=1)if(g=e.implicitTypes[t],g.resolve(e.result)){e.result=g.construct(e.result),e.tag=g.tag,e.anchor!==null&&A(e,e.anchor,e.result);break}}else if(e.tag!==`!`){if(o.call(e.typeMap[e.kind||`fallback`],e.tag))g=e.typeMap[e.kind||`fallback`][e.tag];else{g=null;let t=e.typeMap.multi[e.kind||`fallback`];for(let n=0,r=t.length;n<r;n+=1)if(e.tag.slice(0,t[n].tag.length)===t[n].tag){g=t[n];break}}g||O(e,`unknown tag !<`+e.tag+`>`),e.result!==null&&g.kind!==e.kind&&O(e,`unacceptable node kind for !<`+e.tag+`> tag; it should be "`+g.kind+`", not "`+e.kind+`"`),g.resolve(e.result,e.tag)?(e.result=g.construct(e.result,e.tag),e.anchor!==null&&A(e,e.anchor,e.result)):O(e,`cannot resolve a node with !<`+e.tag+`> explicit tag`)}return e.listener!==null&&e.listener(`close`,e),--e.depth,e.tag!==null||e.anchor!==null||m}function K(e){let t=e.position,n=!1,r;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap=Object.create(null),e.anchorMap=Object.create(null);(r=e.input.charCodeAt(e.position))!==0&&(z(e,!0,-1),r=e.input.charCodeAt(e.position),!(e.lineIndent>0||r!==37));){n=!0,r=e.input.charCodeAt(++e.position);let t=e.position;for(;r!==0&&!S(r);)r=e.input.charCodeAt(++e.position);let i=e.input.slice(t,e.position),a=[];for(i.length<1&&O(e,`directive name must not be less than one character in length`);r!==0;){for(;x(r);)r=e.input.charCodeAt(++e.position);if(r===35){do r=e.input.charCodeAt(++e.position);while(r!==0&&!b(r));break}if(b(r))break;for(t=e.position;r!==0&&!S(r);)r=e.input.charCodeAt(++e.position);a.push(e.input.slice(t,e.position))}r!==0&&R(e),o.call(se,i)?se[i](e,i,a):k(e,`unknown document directive "`+i+`"`)}if(z(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,z(e,!0,-1)):n&&O(e,`directives end mark is expected`),G(e,e.lineIndent-1,u,!1,!0),z(e,!0,-1),e.checkLineBreaks&&h.test(e.input.slice(t,e.position))&&k(e,`non-ASCII line breaks are interpreted as content`),e.documents.push(e.result),e.position===e.lineStart&&B(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,z(e,!0,-1));return}e.position<e.length-1&&O(e,`end of the stream or a document separator is expected`)}function ge(e,t){e=String(e),t||={},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));let n=new D(e,t),r=e.indexOf(`\0`);for(r!==-1&&(n.position=r,O(n,`null byte is not allowed in input`)),n.input+=`\0`;n.input.charCodeAt(n.position)===32;)n.lineIndent+=1,n.position+=1;for(;n.position<n.length-1;)K(n);return n.documents}function _e(e,t,n){typeof t==`object`&&t&&n===void 0&&(n=t,t=null);let r=ge(e,n);if(typeof t!=`function`)return r;for(let e=0,n=r.length;e<n;e+=1)t(r[e])}function q(e,t){let n=ge(e,t);if(n.length!==0){if(n.length===1)return n[0];throw new r(`expected a single document in the stream, but found more`)}}t.exports.loadAll=_e,t.exports.load=q})),ot=n(((e,t)=>{var n=Y(),r=X(),i=it(),a=Object.prototype.toString,o=Object.prototype.hasOwnProperty,s=65279,c=9,l=10,u=13,d=32,f=33,p=34,m=35,h=37,g=38,_=39,v=42,y=44,b=45,x=58,S=61,C=62,ee=63,te=64,ne=91,w=93,re=96,T=123,ie=124,E=125,D={};D[0]=`\\0`,D[7]=`\\a`,D[8]=`\\b`,D[9]=`\\t`,D[10]=`\\n`,D[11]=`\\v`,D[12]=`\\f`,D[13]=`\\r`,D[27]=`\\e`,D[34]=`\\"`,D[92]=`\\\\`,D[133]=`\\N`,D[160]=`\\_`,D[8232]=`\\L`,D[8233]=`\\P`;var ae=[`y`,`Y`,`yes`,`Yes`,`YES`,`on`,`On`,`ON`,`n`,`N`,`no`,`No`,`NO`,`off`,`Off`,`OFF`],O=/^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;function k(e,t){if(t===null)return{};let n={},r=Object.keys(t);for(let i=0,a=r.length;i<a;i+=1){let a=r[i],s=String(t[a]);a.slice(0,2)===`!!`&&(a=`tag:yaml.org,2002:`+a.slice(2));let c=e.compiledTypeMap.fallback[a];c&&o.call(c.styleAliases,s)&&(s=c.styleAliases[s]),n[a]=s}return n}function A(e){let t,i,a=e.toString(16).toUpperCase();if(e<=255)t=`x`,i=2;else if(e<=65535)t=`u`,i=4;else if(e<=4294967295)t=`U`,i=8;else throw new r(`code point within a string may not be greater than 0xFFFFFFFF`);return`\\`+t+n.repeat(`0`,i-a.length)+a}var oe=1,j=2;function M(e){this.schema=e.schema||i,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=n.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=k(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.quotingType=e.quotingType===`"`?j:oe,this.forceQuotes=e.forceQuotes||!1,this.replacer=typeof e.replacer==`function`?e.replacer:null,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result=``,this.duplicates=[],this.usedDuplicates=null}function N(e,t){let r=n.repeat(` `,t),i=0,a=``,o=e.length;for(;i<o;){let t,n=e.indexOf(`
`,i);n===-1?(t=e.slice(i),i=o):(t=e.slice(i,n+1),i=n+1),t.length&&t!==`
`&&(a+=r),a+=t}return a}function P(e,t){return`
`+n.repeat(` `,e.indent*t)}function se(e,t){for(let n=0,r=e.implicitTypes.length;n<r;n+=1)if(e.implicitTypes[n].resolve(t))return!0;return!1}function F(e){return e===d||e===c}function I(e){return e>=32&&e<=126||e>=161&&e<=55295&&e!==8232&&e!==8233||e>=57344&&e<=65533&&e!==s||e>=65536&&e<=1114111}function L(e){return I(e)&&e!==s&&e!==u&&e!==l}function R(e,t,n){let r=L(e),i=r&&!F(e);return(n?r:r&&e!==y&&e!==ne&&e!==w&&e!==T&&e!==E)&&e!==m&&!(t===x&&!i)||L(t)&&!F(t)&&e===m||t===x&&i}function z(e){return I(e)&&e!==s&&!F(e)&&e!==b&&e!==ee&&e!==x&&e!==y&&e!==ne&&e!==w&&e!==T&&e!==E&&e!==m&&e!==g&&e!==v&&e!==f&&e!==ie&&e!==S&&e!==C&&e!==_&&e!==p&&e!==h&&e!==te&&e!==re}function B(e){return!F(e)&&e!==x}function V(e,t){let n=e.charCodeAt(t),r;return n>=55296&&n<=56319&&t+1<e.length&&(r=e.charCodeAt(t+1),r>=56320&&r<=57343)?(n-55296)*1024+r-56320+65536:n}function ce(e){return/^\n* /.test(e)}var le=1,H=2,ue=3,de=4,U=5;function fe(e,t,n,r,i,a,o,s){let c,u=0,d=null,f=!1,p=!1,m=r!==-1,h=-1,g=z(V(e,0))&&B(V(e,e.length-1));if(t||o)for(c=0;c<e.length;u>=65536?c+=2:c++){if(u=V(e,c),!I(u))return U;g&&=R(u,d,s),d=u}else{for(c=0;c<e.length;u>=65536?c+=2:c++){if(u=V(e,c),u===l)f=!0,m&&(p||=c-h-1>r&&e[h+1]!==` `,h=c);else if(!I(u))return U;g&&=R(u,d,s),d=u}p||=m&&c-h-1>r&&e[h+1]!==` `}return!f&&!p?g&&!o&&!i(e)?le:a===j?U:H:n>9&&ce(e)?U:o?a===j?U:H:p?de:ue}function pe(e,t,n,i,a){e.dump=function(){if(t.length===0)return e.quotingType===j?`""`:`''`;if(!e.noCompatMode&&(ae.indexOf(t)!==-1||O.test(t)))return e.quotingType===j?`"`+t+`"`:`'`+t+`'`;let o=e.indent*Math.max(1,n),s=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-o),c=i||e.flowLevel>-1&&n>=e.flowLevel;function l(t){return se(e,t)}switch(fe(t,c,e.indent,s,l,e.quotingType,e.forceQuotes&&!i,a)){case le:return t;case H:return`'`+t.replace(/'/g,`''`)+`'`;case ue:return`|`+me(t,e.indent)+he(N(t,o));case de:return`>`+me(t,e.indent)+he(N(W(t,s),o));case U:return`"`+K(t,s)+`"`;default:throw new r(`impossible error: invalid scalar style`)}}()}function me(e,t){let n=ce(e)?String(t):``,r=e[e.length-1]===`
`;return n+(r&&(e[e.length-2]===`
`||e===`
`)?`+`:r?``:`-`)+`
`}function he(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function W(e,t){let n=/(\n+)([^\n]*)/g,r=function(){let r=e.indexOf(`
`);return r=r===-1?e.length:r,n.lastIndex=r,G(e.slice(0,r),t)}(),i=e[0]===`
`||e[0]===` `,a,o;for(;o=n.exec(e);){let e=o[1],n=o[2];a=n[0]===` `,r+=e+(!i&&!a&&n!==``?`
`:``)+G(n,t),i=a}return r}function G(e,t){if(e===``||e[0]===` `)return e;let n=/ [^ ]/g,r,i=0,a,o=0,s=0,c=``;for(;r=n.exec(e);)s=r.index,s-i>t&&(a=o>i?o:s,c+=`
`+e.slice(i,a),i=a+1),o=s;return c+=`
`,e.length-i>t&&o>i?c+=e.slice(i,o)+`
`+e.slice(o+1):c+=e.slice(i),c.slice(1)}function K(e){let t=``,n=0;for(let r=0;r<e.length;n>=65536?r+=2:r++){n=V(e,r);let i=D[n];!i&&I(n)?(t+=e[r],n>=65536&&(t+=e[r+1])):t+=i||A(n)}return t}function ge(e,t,n){let r=``,i=e.tag;for(let i=0,a=n.length;i<a;i+=1){let a=n[i];e.replacer&&(a=e.replacer.call(n,String(i),a)),(J(e,t,a,!1,!1)||a===void 0&&J(e,t,null,!1,!1))&&(r!==``&&(r+=`,`+(e.condenseFlow?``:` `)),r+=e.dump)}e.tag=i,e.dump=`[`+r+`]`}function _e(e,t,n,r){let i=``,a=e.tag;for(let a=0,o=n.length;a<o;a+=1){let o=n[a];e.replacer&&(o=e.replacer.call(n,String(a),o)),(J(e,t+1,o,!0,!0,!1,!0)||o===void 0&&J(e,t+1,null,!0,!0,!1,!0))&&((!r||i!==``)&&(i+=P(e,t)),e.dump&&l===e.dump.charCodeAt(0)?i+=`-`:i+=`- `,i+=e.dump)}e.tag=a,e.dump=i||`[]`}function q(e,t,n){let r=``,i=e.tag,a=Object.keys(n);for(let i=0,o=a.length;i<o;i+=1){let o=``;r!==``&&(o+=`, `),e.condenseFlow&&(o+=`"`);let s=a[i],c=n[s];e.replacer&&(c=e.replacer.call(n,s,c)),J(e,t,s,!1,!1)&&(e.dump.length>1024&&(o+=`? `),o+=e.dump+(e.condenseFlow?`"`:``)+`:`+(e.condenseFlow?``:` `),J(e,t,c,!1,!1)&&(o+=e.dump,r+=o))}e.tag=i,e.dump=`{`+r+`}`}function ve(e,t,n,i){let a=``,o=e.tag,s=Object.keys(n);if(e.sortKeys===!0)s.sort();else if(typeof e.sortKeys==`function`)s.sort(e.sortKeys);else if(e.sortKeys)throw new r(`sortKeys must be a boolean or a function`);for(let r=0,o=s.length;r<o;r+=1){let o=``;(!i||a!==``)&&(o+=P(e,t));let c=s[r],u=n[c];if(e.replacer&&(u=e.replacer.call(n,c,u)),!J(e,t+1,c,!0,!0,!0))continue;let d=e.tag!==null&&e.tag!==`?`||e.dump&&e.dump.length>1024;d&&(e.dump&&l===e.dump.charCodeAt(0)?o+=`?`:o+=`? `),o+=e.dump,d&&(o+=P(e,t)),J(e,t+1,u,!0,d)&&(e.dump&&l===e.dump.charCodeAt(0)?o+=`:`:o+=`: `,o+=e.dump,a+=o)}e.tag=o,e.dump=a||`{}`}function ye(e,t,n){let i=n?e.explicitTypes:e.implicitTypes;for(let s=0,c=i.length;s<c;s+=1){let c=i[s];if((c.instanceOf||c.predicate)&&(!c.instanceOf||typeof t==`object`&&t instanceof c.instanceOf)&&(!c.predicate||c.predicate(t))){if(e.tag=n?c.multi&&c.representName?c.representName(t):c.tag:`?`,c.represent){let n=e.styleMap[c.tag]||c.defaultStyle,i;if(a.call(c.represent)===`[object Function]`)i=c.represent(t,n);else if(o.call(c.represent,n))i=c.represent[n](t,n);else throw new r(`!<`+c.tag+`> tag resolver accepts not "`+n+`" style`);e.dump=i}return!0}}return!1}function J(e,t,n,i,o,s,c){e.tag=null,e.dump=n,ye(e,n,!1)||ye(e,n,!0);let l=a.call(e.dump),u=i;i&&=e.flowLevel<0||e.flowLevel>t;let d=l===`[object Object]`||l===`[object Array]`,f,p;if(d&&(f=e.duplicates.indexOf(n),p=f!==-1),(e.tag!==null&&e.tag!==`?`||p||e.indent!==2&&t>0)&&(o=!1),p&&e.usedDuplicates[f])e.dump=`*ref_`+f;else{if(d&&p&&!e.usedDuplicates[f]&&(e.usedDuplicates[f]=!0),l===`[object Object]`)i&&Object.keys(e.dump).length!==0?(ve(e,t,e.dump,o),p&&(e.dump=`&ref_`+f+e.dump)):(q(e,t,e.dump),p&&(e.dump=`&ref_`+f+` `+e.dump));else if(l===`[object Array]`)i&&e.dump.length!==0?(e.noArrayIndent&&!c&&t>0?_e(e,t-1,e.dump,o):_e(e,t,e.dump,o),p&&(e.dump=`&ref_`+f+e.dump)):(ge(e,t,e.dump),p&&(e.dump=`&ref_`+f+` `+e.dump));else if(l===`[object String]`)e.tag!==`?`&&pe(e,e.dump,t,s,u);else if(l===`[object Undefined]`)return!1;else{if(e.skipInvalid)return!1;throw new r(`unacceptable kind of an object to dump `+l)}if(e.tag!==null&&e.tag!==`?`){let t=encodeURI(e.tag[0]===`!`?e.tag.slice(1):e.tag).replace(/!/g,`%21`);t=e.tag[0]===`!`?`!`+t:t.slice(0,18)===`tag:yaml.org,2002:`?`!!`+t.slice(18):`!<`+t+`>`,e.dump=t+` `+e.dump}}return!0}function be(e,t){let n=[],r=[];xe(e,n,r);let i=r.length;for(let e=0;e<i;e+=1)t.duplicates.push(n[r[e]]);t.usedDuplicates=Array(i)}function xe(e,t,n){if(typeof e==`object`&&e){let r=t.indexOf(e);if(r!==-1)n.indexOf(r)===-1&&n.push(r);else if(t.push(e),Array.isArray(e))for(let r=0,i=e.length;r<i;r+=1)xe(e[r],t,n);else{let r=Object.keys(e);for(let i=0,a=r.length;i<a;i+=1)xe(e[r[i]],t,n)}}}function Se(e,t){t||={};let n=new M(t);n.noRefs||be(e,n);let r=e;return n.replacer&&(r=n.replacer.call({"":r},``,r)),J(n,0,r,!0,!0)?n.dump+`
`:``}t.exports.dump=Se})),st=n(((e,t)=>{var n=at(),r=ot();function i(e,t){return function(){throw Error(`Function yaml.`+e+` is removed in js-yaml 4. Use yaml.`+t+` instead, which is now safe by default.`)}}t.exports.Type=Z(),t.exports.Schema=Ve(),t.exports.FAILSAFE_SCHEMA=Ge(),t.exports.JSON_SCHEMA=Xe(),t.exports.CORE_SCHEMA=Ze(),t.exports.DEFAULT_SCHEMA=it(),t.exports.load=n.load,t.exports.loadAll=n.loadAll,t.exports.dump=r.dump,t.exports.YAMLException=X(),t.exports.types={binary:et(),float:Ye(),map:We(),null:Ke(),pairs:nt(),set:rt(),timestamp:Qe(),bool:qe(),int:Je(),merge:$e(),omap:tt(),seq:Ue(),str:He()},t.exports.safeLoad=i(`safeLoad`,`load`),t.exports.safeLoadAll=i(`safeLoadAll`,`loadAll`),t.exports.safeDump=i(`safeDump`,`dump`)})),ct=e(n(((e,t)=>{var n=st(),r=`\\ufeff?`,i=typeof process<`u`?process.platform:``,a=`^(`+r+`(= yaml =|---)$([\\s\\S]*?)^(?:\\2|\\.\\.\\.)\\s*$`+(i===`win32`?`\\r?`:``)+`(?:\\n)?)`,o=new RegExp(a,`m`);t.exports=s,t.exports.test=u;function s(e,t){e||=``;var n={allowUnsafe:!1};t=t instanceof Object?{...n,...t}:n,t.allowUnsafe=!!t.allowUnsafe;var r=e.split(/(\r?\n)/);return r[0]&&/= yaml =|---/.test(r[0])?l(e,t.allowUnsafe):{attributes:{},body:e,bodyBegin:1}}function c(e,t){for(var n=1,r=t.indexOf(`
`),i=e.index+e[0].length;r!==-1;){if(r>=i)return n;n++,r=t.indexOf(`
`,r+1)}return n}function l(e,t){var r=o.exec(e);if(!r)return{attributes:{},body:e,bodyBegin:1};var i=n.load,a=r[r.length-1].replace(/^\s+|\s+$/g,``);return{attributes:i(a)||{},body:e.replace(r[0],``),bodyBegin:c(r,e),frontmatter:a}}function u(e){return e||=``,o.test(e)}}))(),1);Object.entries(N).forEach(([e,t])=>{W.registerLanguage(e,t)});var lt=/"/g,ut=/_/g,dt=/^h\d$/,ft=/<[^>]*>/g;function pt(e){return G(e.replace(ft,``))}var mt=/^<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/,ht=/^https?:\/\/mp\.weixin\.qq\.com/,gt=`{words} words, about {minutes} min read`,_t=`References`,vt=`
    <style>
      .preview-wrapper pre::before {
        position: absolute;
        top: 0;
        right: 0;
        color: #ccc;
        text-align: center;
        font-size: 0.8em;
        padding: 5px 10px 0;
        line-height: 15px;
        height: 15px;
        font-weight: 600;
      }
    </style>
  `;function yt(e){return e.map(([e,t,n])=>n===t?`<code style="font-size: 90%; opacity: 0.6;">[${e}]</code>: <i style="word-break: break-all">${t}</i><br/>`:`<code style="font-size: 90%; opacity: 0.6;">[${e}]</code> ${t}: <i style="word-break: break-all">${n}</i><br/>`).join(`
`)}function bt(e){try{return(e.split(`?`)[0].split(`#`)[0].split(`/`).pop()||``).replace(/\.[^.]*$/,``)}catch{return``}}function xt(e,t,n,r=``){let i=e.split(`-`);for(let e of i){if(e===`alt`&&t)return t;if(e===`title`&&n)return n;if(e===`filename`&&r){let e=bt(r);if(e)return m(e)}}return``}var St=`<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="45px" height="13px" viewBox="0 0 450 130">
    <ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)" />
    <ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)" />
    <ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)" />
  </svg>`;function Ct(e,t){let n=W.getLanguage(t),r=n?t:`plaintext`,i=e.split(`
`),a=i.map(e=>e[0]),o=i.map((e,t)=>{let n=a[t];return n===`+`||n===`-`?e.slice(1):e}),s=n?W.highlight(o.join(`
`),{language:r}).value.split(`
`):o.map(m),c=i.map((e,t)=>{let n=a[t],r=s[t]??``,i,o;return n===`+`?(i=`background:rgba(80,200,80,.18);`,o=`<span style="color:#52c41a;user-select:none;">+</span>`):n===`-`?(i=`background:rgba(255,80,80,.18);`,o=`<span style="color:#ff4d4f;user-select:none;">-</span>`):(i=``,o=`<span style="user-select:none;"> </span>`),`<span style="display:block;${i}">${o}${r}</span>`}).join(``);return`<pre class="hljs code__pre">${`<span class="mac-sign" style="padding: 10px 14px 0;">${St}</span>`}<code class="language-diff-${t}"><span class="code-block__inner" style="display:block">${c}</span></code></pre>`}function wt(e){try{let t=(0,ct.default)(e),n=t.attributes,r=t.body;return{yamlData:n,markdownContent:r,readingTime:ze(r)}}catch(t){return console.error(`Error parsing front-matter:`,t),{yamlData:{},markdownContent:e,readingTime:ze(e)}}}function Tt(e={}){let t=[],n=0,r=[],i=[],a=[],o=new de;o.setOptions({breaks:!0});function s(){return e}function c(e,t,n,r){let i=n??e,o=`${e.replace(ut,`-`)}`,s=dt.test(i);return s&&a.push({level:Number(i.slice(1)),text:pt(t)}),`<${i} class="${o}"${s?` data-heading="true"`:``}${r?` style="${r}"`:``}>${t}</${i}>`}function l(e,r){let i=t.find(([,,e])=>e===r);return i?i[0]:(t.push([++n,e,r]),n)}function u(e){t.length=0,n=0,r.length=0,i.length=0,a.length=0,d(e)}function d(t){e={...e,...t}}function f(t,n){return(e.countMessages?.summary||gt).split(`{words}`).join(String(t)).split(`{minutes}`).join(String(n))}function p(t){if(!e.countStatus||!t.words)return``;let n=Math.ceil(t.minutes);return`
      <blockquote class="md-blockquote">
        <p class="md-blockquote-p">${f(t.words,n)}</p>
      </blockquote>
    `}return o.use({renderer:{heading({tokens:e,depth:t}){let n=this.parser.parseInline(e);return c(`h${t}`,n)},paragraph({tokens:e}){let t=this.parser.parseInline(e),n=t.includes(`<figure`)&&t.includes(`<img`),r=t.trim()===``,i=/^<section class="katex-block"[\s\S]*<\/section>\s*$/.test(t.trim());return n||r||i?t:c(`p`,t)},blockquote({tokens:e}){return c(`blockquote`,this.parser.parse(e))},code({text:t,lang:n=``}){let r=n.split(` `)[0];if(r.startsWith(`diff-`))return Ct(t,r.slice(5));let i=W.getLanguage(r),a=g(t,i?r:`plaintext`,W,!!e.isShowLineNumber),o=`<span class="mac-sign" style="padding: 10px 14px 0;">${St}</span>`,s=``;return!i&&r!==`plaintext`&&(s=` data-language-pending="${r}" data-raw-code="${t.replace(lt,`&quot;`)}" data-show-line-number="${e.isShowLineNumber}"`),`<pre class="hljs code__pre">${o}${`<code class="language-${n}"${s}>${a}</code>`}</pre>`},codespan({text:e}){return c(`codespan`,m(e),`code`)},list({ordered:e,items:t,start:n=1}){r.push(e),i.push(Number(n));let a=t.map(e=>this.listitem(e)).join(``);return r.pop(),i.pop(),c(e?`ol`:`ul`,a)},listitem(e){let t=r[r.length-1],n=i[i.length-1];i[i.length-1]=n+1;let a=t?`${n}. `:`• `,o;try{o=this.parser.parseInline(e.tokens)}catch{o=this.parser.parse(e.tokens).replace(mt,`$1`)}return c(`listitem`,`${a}${o}`,`li`)},image({href:t,title:n,text:r}){let i=``,a=``,o=r,s=r.match(/\|(\d+)(?:x(\d+))?$/);s&&(o=r.replace(/\|(\d+)(?:x(\d+))?$/,``),i=s[1]?` width="${s[1]}"`:``,a=s[2]?` height="${s[2]}"`:``);let l=e.legend?xt(e.legend,o,n,t):``,u=l?c(`figcaption`,l):``;return`<figure><img src="${t}"${n?` title="${n}"`:``}${i}${a} alt="${o}"/>${u}</figure>`},link({href:t,title:n,text:r,tokens:i}){let a=this.parser.parseInline(i);if(ht.test(t))return`<a href="${t}" title="${n||r}">${a}</a>`;if(t===r)return a;if(e.citeStatus){let e=l(n||r,t);return`<a href="${t}" title="${n||r}">${a}<sup>[${e}]</sup></a>`}return`<a href="${t}" title="${n||r}">${a}</a>`},strong({tokens:e}){return c(`strong`,this.parser.parseInline(e))},em({tokens:e}){return c(`em`,this.parser.parseInline(e))},table({header:e,rows:t}){return`
        <section style="max-width: 100%; overflow: auto; -webkit-overflow-scrolling: touch">
          <table class="preview-table">
            <thead>${e.map(e=>c(`th`,this.parser.parseInline(e.tokens),void 0,`text-align: ${e.align||`left`}`)).join(``)}</thead>
            <tbody>${t.map(e=>c(`tr`,e.map(e=>this.tablecell(e)).join(``))).join(``)}</tbody>
          </table>
        </section>
      `},tablecell(e){return c(`td`,this.parser.parseInline(e.tokens),void 0,`text-align: ${e.align||`left`}`)},hr(e){let t=e.raw.trim(),n=`dash`;return t.includes(`*`)?n=`star`:t.includes(`_`)&&(n=`underscore`),`<hr class="hr hr-${n}">`}}}),o.use(ke(()=>e.components??De(),()=>e.renderMessages)),o.use(je()),o.use(Pe()),o.use(Ne()),o.use(R({})),o.use(I({nonStandard:!0,getKatexLoadingMessage:()=>e.renderMessages?.katexLoading},!0)),o.use(Ae()),o.use(h(()=>({themeMode:e.themeMode,diagramMessages:e.diagramMessages}))),o.use(H({inlineSvg:!0,getDiagramMessages:()=>e.diagramMessages,getThemeMode:()=>e.themeMode})),o.use(j(()=>({themeMode:e.themeMode,diagramMessages:e.diagramMessages}))),o.use(Me()),{buildAddition:()=>vt,buildFootnotes:()=>t.length?c(`h4`,e.renderMessages?.footnoteTitle||_t)+c(`footnotes`,yt(t),`p`):``,setOptions:d,reset:u,parseFrontMatterAndContent:wt,renderMarkdownToHtml(e){return o.parse(e)},buildReadingTime:p,createContainer(e){return c(`container`,e,`section`)},getHeadings:()=>[...a],getOpts:s}}var Et=`.dark {
  --md-comp-bg: #1e1e1e;
  --md-comp-bg-secondary: #2d2d2d;
  --md-comp-bg-stripe: #2a2a2a;
  --md-comp-text-primary: #e0e0e0;
  --md-comp-text-secondary: #b0b0b0;
  --md-comp-text-tertiary: #888;
  --md-comp-border-default: #404040;
  --md-comp-border-light: #333;
}`;function Dt(){if(typeof document>`u`||document.getElementById(`md-comp-dark`))return;let e=document.createElement(`style`);e.id=`md-comp-dark`,e.textContent=Et,document.head.appendChild(e)}function Ot(e){let t=new Map;for(let n of e.matchAll(/--([\w-]+)\s*:\s*([^;}\n]+)/g))t.set(`--${n[1]}`,n[2].trim());return t}function kt(e){let t=Ot(e),n=/var\(\s*(--[\w-]+)\s*(?:,([^()]*(?:\([^()]*\)[^()]*)*))?\)/g,r=e,i=``,a=0;for(;r!==i&&a<10;)i=r,r=r.replace(n,(e,n,r)=>{let i=t.get(n);return i===void 0?r?r.trim():`var(${n})`:i}),a++;let o=/calc\(([^()]+)\)/g;for(i=``,a=0;r!==i&&a<10;)i=r,r=r.replace(o,(e,t)=>Mt(t.trim())),a++;return r}var At=`px|em|rem|vw|vh|vmin|vmax|%|pt|pc|cm|mm|in|ex|ch`,jt=`(-?[\\d.]+)`,Q=`(-?[\\d.]+)(${At})?`;function Mt(e){let t=e.match(RegExp(`^${Q}\\s*\\*\\s*${Q}$`));if(t){let[,e,n,r,i]=t;if(!n!=!i){let t=n||i;return`${Nt(Number.parseFloat(e)*Number.parseFloat(r))}${t}`}}let n=e.match(RegExp(`^${Q}\\s*/\\s*${jt}$`));if(n){let[,e,t,,r]=n;return`${Nt(Number.parseFloat(e)/Number.parseFloat(r))}${t??``}`}let r=e.match(RegExp(`^${Q}\\s*([+-])\\s*${Q}$`));if(r){let[,e,t,n,i,a]=r;if(t===a)return`${Nt(n===`+`?Number.parseFloat(e)+Number.parseFloat(i):Number.parseFloat(e)-Number.parseFloat(i))}${t??``}`}return`calc(${e})`}function Nt(e){return Math.round(e*1e4)/1e4}var Pt={blockquote_note:`markdown-alert-note`,blockquote_tip:`markdown-alert-tip`,blockquote_info:`markdown-alert-info`,blockquote_important:`markdown-alert-important`,blockquote_warning:`markdown-alert-warning`,blockquote_caution:`markdown-alert-caution`,blockquote_abstract:`markdown-alert-abstract`,blockquote_summary:`markdown-alert-summary`,blockquote_tldr:`markdown-alert-tldr`,blockquote_todo:`markdown-alert-todo`,blockquote_success:`markdown-alert-success`,blockquote_done:`markdown-alert-done`,blockquote_question:`markdown-alert-question`,blockquote_help:`markdown-alert-help`,blockquote_faq:`markdown-alert-faq`,blockquote_failure:`markdown-alert-failure`,blockquote_fail:`markdown-alert-fail`,blockquote_missing:`markdown-alert-missing`,blockquote_danger:`markdown-alert-danger`,blockquote_error:`markdown-alert-error`,blockquote_bug:`markdown-alert-bug`,blockquote_example:`markdown-alert-example`,blockquote_quote:`markdown-alert-quote`,blockquote_cite:`markdown-alert-cite`,blockquote_title:`alert-title`,blockquote_title_note:`alert-title-note`,blockquote_title_tip:`alert-title-tip`,blockquote_title_info:`alert-title-info`,blockquote_title_important:`alert-title-important`,blockquote_title_warning:`alert-title-warning`,blockquote_title_caution:`alert-title-caution`,blockquote_title_abstract:`alert-title-abstract`,blockquote_title_summary:`alert-title-summary`,blockquote_title_tldr:`alert-title-tldr`,blockquote_title_todo:`alert-title-todo`,blockquote_title_success:`alert-title-success`,blockquote_title_done:`alert-title-done`,blockquote_title_question:`alert-title-question`,blockquote_title_help:`alert-title-help`,blockquote_title_faq:`alert-title-faq`,blockquote_title_failure:`alert-title-failure`,blockquote_title_fail:`alert-title-fail`,blockquote_title_missing:`alert-title-missing`,blockquote_title_danger:`alert-title-danger`,blockquote_title_error:`alert-title-error`,blockquote_title_bug:`alert-title-bug`,blockquote_title_example:`alert-title-example`,blockquote_title_quote:`alert-title-quote`,blockquote_title_cite:`alert-title-cite`,blockquote_p:`alert-content`,blockquote_p_note:`alert-content-note`,blockquote_p_tip:`alert-content-tip`,blockquote_p_info:`alert-content-info`,blockquote_p_important:`alert-content-important`,blockquote_p_warning:`alert-content-warning`,blockquote_p_caution:`alert-content-caution`,blockquote_p_abstract:`alert-content-abstract`,blockquote_p_summary:`alert-content-summary`,blockquote_p_tldr:`alert-content-tldr`,blockquote_p_todo:`alert-content-todo`,blockquote_p_success:`alert-content-success`,blockquote_p_done:`alert-content-done`,blockquote_p_question:`alert-content-question`,blockquote_p_help:`alert-content-help`,blockquote_p_faq:`alert-content-faq`,blockquote_p_failure:`alert-content-failure`,blockquote_p_fail:`alert-content-fail`,blockquote_p_missing:`alert-content-missing`,blockquote_p_danger:`alert-content-danger`,blockquote_p_error:`alert-content-error`,blockquote_p_bug:`alert-content-bug`,blockquote_p_example:`alert-content-example`,blockquote_p_quote:`alert-content-quote`,blockquote_p_cite:`alert-content-cite`,code_pre:`code-block`,codespan:`code-inline`,inline_katex:`katex-inline`,block_katex:`katex-block`,markup_highlight:`markup-highlight`,markup_underline:`markup-underline`,markup_wavyline:`markup-wavyline`,listitem:`listitem`};function Ft(e,t=`#output`){return e.replace(/([^{}]+)\{([^}]*)\}/g,(e,n,r)=>{let i=n.trim();return i.startsWith(`@`)||i.startsWith(`:root`)?e:`${n.split(`,`).map(e=>{let n=e.trim();if(n.startsWith(t)||!n)return n;n=n.replace(/\.md-container\b/g,`.container`);let r=n.split(/[\s>+~:[]/,1)[0].trim();return r&&Pt[r]&&(n=n.replace(r,`.${Pt[r]}`)),n.match(/^(h[1-6])(\s|$|::|[:[])/)?`${t} section ${n}`:`${t} ${n}`}).filter(Boolean).join(`,
`)} {${r}}`})}function It(e){return`
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
  `.trim()}function Lt(e){return Rt(e.headingStyles)}function Rt(e){if(!e)return``;let t=[`h1`,`h2`,`h3`,`h4`,`h5`,`h6`],n=[];for(let r of t){let t=e[r];t&&t!=="default"&&t!==`custom`&&n.push(zt(r,t))}return n.join(`

`)}function zt(e,t){let n=`
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
}`;default:return``}}var Bt=`/**
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
`,Vt=`/**
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
`,Ht=`/**
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
`,Ut=`/**
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
`,Wt=Bt,$={default:Vt,grace:Ht,simple:Ut};function Gt(e){return Object.keys($).includes(e)}var Kt=class{styleElement=null;styleId=`md-theme`;inject(e){this.styleElement||(this.styleElement=document.createElement(`style`),this.styleElement.id=this.styleId,document.head.appendChild(this.styleElement)),this.styleElement.textContent=e}remove(){this.styleElement&&=(this.styleElement.remove(),null)}isInjected(){return this.styleElement!==null}},qt=null;function Jt(){return qt||=new Kt,qt}function Yt(e,t){if(t!=null&&t.trim())return`${$.default}\n\n${t}`;let n=$.default;if(e!=="default"&&Gt(e)){let t=$[e];t&&(n=`${n}\n\n${t}`)}return n}async function Xt(e){let t=[It(e.variables),Wt,Ft(Yt(e.themeName,e.themeCSS),`#output`),Lt(e.variables),e.customCSS?Ft(e.customCSS,`#output`):``].filter(Boolean).join(`

`);t=kt(t),Jt().inject(t)}function Zt(e,t,n=`text/plain`){if(typeof document>`u`)throw TypeError(`downloadFile can only be used in browser environment`);let r=document.createElement(`a`);r.download=t,r.style.display=`none`;let i=null;if(e.startsWith(`data:`)||e.startsWith(`blob:`))r.href=e;else if(n===`text/html`)r.href=`data:text/html;charset=utf-8,${encodeURIComponent(e)}`;else{let t=new Blob([e],{type:n});i=URL.createObjectURL(t),r.href=i}document.body.appendChild(r),r.click(),document.body.removeChild(r),i&&URL.revokeObjectURL(i)}function Qt(e){return new Promise((t,n)=>{let r=new FileReader;r.readAsDataURL(e),r.onload=()=>t(r.result.split(`,`).pop()),r.onerror=e=>n(e)})}function $t(e,t,n,r){let i=It(n),a=[`/**`,` * MD 主题导出`,` * 导出时间: ${new Date().toLocaleString()}`,` * 说明: 该文件包含完整的主题样式，可直接使用`,` */`,``,i,``,t,``,e].filter(Boolean).join(`
`);return Zt(a,`${r}.css`,`text/css`),a}var en=t({BUILT_IN_COMPONENTS:()=>K,COMMON_LANGUAGES:()=>N,DEFAULT_DIAGRAM_MESSAGES:()=>w,DIAGRAM_DARK_COLORS:()=>x,DIAGRAM_LIGHT_COLORS:()=>he,LRUMap:()=>ne,MATHJAX_CDN_URL:()=>ae,MATHJAX_LOCAL_URL:()=>k,MATHJAX_READY_EVENT:()=>z,MDKatex:()=>I,MD_DIAGRAM_STATE:()=>T,MD_DIAGRAM_STATE_ATTR:()=>b,SELECTOR_MAPPING:()=>Pt,ThemeInjector:()=>Kt,applyTheme:()=>Xt,blockLatexRule:()=>pe,blockRuleMultiline:()=>S,blockRuleSingleLine:()=>o,contentHasMath:()=>fe,createSVGCache:()=>u,createSyntaxPattern:()=>E,diagramCacheThemeSuffix:()=>a,diagramStateAttr:()=>r,ensureMathJaxLoaded:()=>F,escapeHtml:()=>m,exportMergedTheme:()=>$t,findInlineKatexStart:()=>C,formatDiagramMessage:()=>O,generateCSSVariables:()=>It,generateHeadingStyles:()=>Lt,generatePureHTML:()=>se,getBuiltInRegistry:()=>De,getMermaidThemeConfig:()=>te,getThemeInjector:()=>Jt,highlightAndFormatCode:()=>g,highlightCodeBlock:()=>_,highlightPendingBlocks:()=>y,hljs:()=>W,hydratePendingInfographicDiagrams:()=>V,initComponentDarkVars:()=>Dt,initRenderer:()=>Tt,initializeMermaid:()=>f,injectPlantUmlTheme:()=>d,inlineLatexRule:()=>c,inlineRule:()=>s,inlineRuleNonStandard:()=>v,isAsyncDiagramPending:()=>ue,isMathJaxReady:()=>oe,isSvgMarkup:()=>L,loadAndRegisterLanguage:()=>l,loadMathJax:()=>A,markedAlert:()=>R,markedComponent:()=>ke,markedFootnotes:()=>Ae,markedInfographic:()=>j,markedMarkup:()=>je,markedMermaid:()=>h,markedPlantUML:()=>H,markedRuby:()=>Me,markedSlider:()=>Ne,markedToc:()=>Pe,matchBlockKatex:()=>P,modifyHtmlContent:()=>ie,postProcessHtml:()=>U,previewComponent:()=>we,processCSS:()=>kt,renderMarkdown:()=>me,resolveDiagramMessages:()=>ce,resolveDiagramThemeMode:()=>ee,resolveVariants:()=>le,sanitizeHtml:()=>D,setComponentRegistry:()=>Ee,simpleHash:()=>B,stripBreakBeforeInlineKatex:()=>i,ucfirst:()=>p,unescapeHtml:()=>re,wrapCSSWithScope:()=>Ft});export{Xt as a,Ft as c,K as d,De as f,Qt as i,Dt as l,$t as n,Gt as o,we as p,Zt as r,$ as s,en as t,Tt as u};