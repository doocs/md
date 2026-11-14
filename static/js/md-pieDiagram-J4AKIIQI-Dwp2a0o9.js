import{t as e}from"./md-chunk-JWPE2WC7-qo9X49S-.js";import{a as t}from"./md-mermaid.core-BHNvEHxI.js";import{i as n,m as r}from"./md-chunk-6MUBBAK2-65n98f_c.js";import{C as i,H as a,U as o,_ as s,a as c,b as l,c as u,f as d,q as f,v as p}from"./md-chunk-BG4553SI-DerPR-Cg.js";import{t as m}from"./md-chunk-X3CZISLH-Cle0QW8Q.js";import{n as h}from"./md-chunk-Y2CYZVJY-DsF7k-Jl.js";import{n as g}from"./md-mermaid-parser.core-vST0nUyi.js";import{b as _,t as v}from"./md-d3-shape-Cjytl68A.js";import{r as y}from"./md-d3-scale-CElPUUud.js";var b=d.pie,x={sections:new Map,showData:!1,config:b},S=x.sections,C=x.showData,w=structuredClone(b),T={getConfig:h(()=>structuredClone(w),`getConfig`),clear:h(()=>{S=new Map,C=x.showData,c()},`clear`),setDiagramTitle:f,getDiagramTitle:i,setAccTitle:o,getAccTitle:p,setAccDescription:a,getAccDescription:s,addSection:h(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);S.has(e)||(S.set(e,t),m.debug(`added new section: ${e}, with value: ${t}`))},`addSection`),getSections:h(()=>S,`getSections`),setShowData:h(e=>{C=e},`setShowData`),getShowData:h(()=>C,`getShowData`)},E=h((t,n)=>{e(t,n),n.setShowData(t.showData),t.sections.map(n.addSection)},`populateDb`),D={parse:h(async e=>{let t=await g(`pie`,e);m.debug(t),E(t,T)},`parse`)},O=h(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,`getStyles`),k=h(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),n=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return _().value(e=>e.value).sort(null)(n)},`createPieArcs`),A={parser:D,db:T,renderer:{draw:h((e,i,a,o)=>{m.debug(`rendering pie chart
`+e);let s=o.db,c=l(),d=n(s.getConfig(),c.pie),f=t(i),p=f.append(`g`);p.attr(`transform`,`translate(225,225)`);let{themeVariables:h}=c,[g]=r(h.pieOuterStrokeWidth);g??=2;let _=d.legendPosition,b=d.textPosition,x=d.donutHole>0&&d.donutHole<=.9?d.donutHole:0,S=v().innerRadius(x*185).outerRadius(185),C=v().innerRadius(185*b).outerRadius(185*b),w=p.append(`g`);w.append(`circle`).attr(`cx`,0).attr(`cy`,0).attr(`r`,185+g/2).attr(`class`,`pieOuterCircle`);let T=s.getSections(),E=k(T),D=[h.pie1,h.pie2,h.pie3,h.pie4,h.pie5,h.pie6,h.pie7,h.pie8,h.pie9,h.pie10,h.pie11,h.pie12],O=0;T.forEach(e=>{O+=e});let A=E.filter(e=>(e.data.value/O*100).toFixed(0)!==`0`),j=y(D).domain([...T.keys()]);w.selectAll(`mySlices`).data(A).enter().append(`path`).attr(`d`,S).attr(`fill`,e=>j(e.data.label)).attr(`class`,e=>{let t=`pieCircle`;return d.highlightSlice===`hover`?t+=` highlightedOnHover`:d.highlightSlice===e.data.label&&(t+=` highlighted`),t}),w.selectAll(`mySlices`).data(A).enter().append(`text`).text(e=>(e.data.value/O*100).toFixed(0)+`%`).attr(`transform`,e=>`translate(`+C.centroid(e)+`)`).style(`text-anchor`,`middle`).attr(`class`,`slice`);let M=p.append(`text`).text(s.getDiagramTitle()).attr(`x`,0).attr(`y`,-200).attr(`class`,`pieTitleText`),N=[...T.entries()].map(([e,t])=>({label:e,value:t})),P=p.selectAll(`.legend`).data(N).enter().append(`g`).attr(`class`,`legend`);P.append(`rect`).attr(`width`,18).attr(`height`,18).style(`fill`,e=>j(e.label)).style(`stroke`,e=>j(e.label)),P.append(`text`).attr(`x`,22).attr(`y`,14).text(e=>s.getShowData()?`${e.label} [${e.value}]`:e.label);let F=Math.max(...P.selectAll(`text`).nodes().map(e=>e?.getBoundingClientRect().width??0)),I=450,L=490,R=N.length*22;switch(_){case`center`:P.attr(`transform`,(e,t)=>{let n=22*N.length/2,r=-F/2-22,i=t*22-n;return`translate(`+r+`,`+i+`)`});break;case`top`:I+=R,P.attr(`transform`,(e,t)=>`translate(${-F/2-22}, ${t*22-185})`),w.attr(`transform`,()=>`translate(0, ${R+22})`);break;case`bottom`:I+=R,P.attr(`transform`,(e,t)=>{let n=-F/2-22,r=t*22- -207;return`translate(`+n+`,`+r+`)`});break;case`left`:L+=22+F,P.attr(`transform`,(e,t)=>{let n=22*N.length/2;return`translate(-207,`+(t*22-n)+`)`}),w.attr(`transform`,()=>`translate(${F+18+4}, 0)`);break;default:L+=22+F,P.attr(`transform`,(e,t)=>{let n=22*N.length/2;return`translate(216,`+(t*22-n)+`)`})}let z=M.node()?.getBoundingClientRect().width??0,B=225-z/2,V=225+z/2,H=Math.min(0,B),U=Math.max(L,V)-H;f.attr(`viewBox`,`${H} 0 ${U} ${I}`),u(f,I,U,d.useMaxWidth)},`draw`)},styles:O};export{A as diagram};