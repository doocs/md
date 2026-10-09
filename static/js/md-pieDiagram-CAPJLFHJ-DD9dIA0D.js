import{t as e}from"./md-ordinal-D4BAXFQA.js";import"./md-src-tr9KvvzG.js";import{t}from"./md-chunk-X3CZISLH-DOEMZmDS.js";import{t as n}from"./md-arc-D1Wt2YdB.js";import{t as r}from"./md-pie-HleD2pMJ.js";import{i,m as a}from"./md-chunk-3YJQHVM4-DCuVJna6.js";import{n as o}from"./md-mermaid-parser.core-BbfgBFC0.js";import{n as s}from"./md-chunk-Y2CYZVJY-DsF7k-Jl.js";import{C as c,H as l,U as u,_ as d,a as f,b as p,c as m,f as h,q as g,v as _}from"./md-chunk-VPRB5NB3-BHKRseJV.js";import{t as v}from"./md-chunk-JWPE2WC7-qo9X49S-.js";import{a as y}from"./md-mermaid.core-CYV5Heqr.js";var b=h.pie,x={sections:new Map,showData:!1,config:b},S=x.sections,C=x.showData,w=structuredClone(b),T={getConfig:s(()=>structuredClone(w),`getConfig`),clear:s(()=>{S=new Map,C=x.showData,f()},`clear`),setDiagramTitle:g,getDiagramTitle:c,setAccTitle:u,getAccTitle:_,setAccDescription:l,getAccDescription:d,addSection:s(({label:e,value:n})=>{if(n<0)throw Error(`"${e}" has invalid value: ${n}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);S.has(e)||(S.set(e,n),t.debug(`added new section: ${e}, with value: ${n}`))},`addSection`),getSections:s(()=>S,`getSections`),setShowData:s(e=>{C=e},`setShowData`),getShowData:s(()=>C,`getShowData`)},E=s((e,t)=>{v(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},`populateDb`),D={parse:s(async e=>{let n=await o(`pie`,e);t.debug(n),E(n,T)},`parse`)},O=s(e=>`
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
`,`getStyles`),k=s(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),n=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return r().value(e=>e.value).sort(null)(n)},`createPieArcs`),A={parser:D,db:T,renderer:{draw:s((r,o,s,c)=>{t.debug(`rendering pie chart
`+r);let l=c.db,u=p(),d=i(l.getConfig(),u.pie),f=y(o),h=f.append(`g`);h.attr(`transform`,`translate(225,225)`);let{themeVariables:g}=u,[_]=a(g.pieOuterStrokeWidth);_??=2;let v=d.legendPosition,b=d.textPosition,x=d.donutHole>0&&d.donutHole<=.9?d.donutHole:0,S=n().innerRadius(x*185).outerRadius(185),C=n().innerRadius(185*b).outerRadius(185*b),w=h.append(`g`);w.append(`circle`).attr(`cx`,0).attr(`cy`,0).attr(`r`,185+_/2).attr(`class`,`pieOuterCircle`);let T=l.getSections(),E=k(T),D=[g.pie1,g.pie2,g.pie3,g.pie4,g.pie5,g.pie6,g.pie7,g.pie8,g.pie9,g.pie10,g.pie11,g.pie12],O=0;T.forEach(e=>{O+=e});let A=E.filter(e=>(e.data.value/O*100).toFixed(0)!==`0`),j=e(D).domain([...T.keys()]);w.selectAll(`mySlices`).data(A).enter().append(`path`).attr(`d`,S).attr(`fill`,e=>j(e.data.label)).attr(`class`,e=>{let t=`pieCircle`;return d.highlightSlice===`hover`?t+=` highlightedOnHover`:d.highlightSlice===e.data.label&&(t+=` highlighted`),t}),w.selectAll(`mySlices`).data(A).enter().append(`text`).text(e=>(e.data.value/O*100).toFixed(0)+`%`).attr(`transform`,e=>`translate(`+C.centroid(e)+`)`).style(`text-anchor`,`middle`).attr(`class`,`slice`);let M=h.append(`text`).text(l.getDiagramTitle()).attr(`x`,0).attr(`y`,-200).attr(`class`,`pieTitleText`),N=[...T.entries()].map(([e,t])=>({label:e,value:t})),P=h.selectAll(`.legend`).data(N).enter().append(`g`).attr(`class`,`legend`);P.append(`rect`).attr(`width`,18).attr(`height`,18).style(`fill`,e=>j(e.label)).style(`stroke`,e=>j(e.label)),P.append(`text`).attr(`x`,22).attr(`y`,14).text(e=>l.getShowData()?`${e.label} [${e.value}]`:e.label);let F=Math.max(...P.selectAll(`text`).nodes().map(e=>e?.getBoundingClientRect().width??0)),I=450,L=490,R=N.length*22;switch(v){case`center`:P.attr(`transform`,(e,t)=>{let n=22*N.length/2,r=-F/2-22,i=t*22-n;return`translate(`+r+`,`+i+`)`});break;case`top`:I+=R,P.attr(`transform`,(e,t)=>`translate(${-F/2-22}, ${t*22-185})`),w.attr(`transform`,()=>`translate(0, ${R+22})`);break;case`bottom`:I+=R,P.attr(`transform`,(e,t)=>{let n=-F/2-22,r=t*22- -207;return`translate(`+n+`,`+r+`)`});break;case`left`:L+=22+F,P.attr(`transform`,(e,t)=>{let n=22*N.length/2;return`translate(-207,`+(t*22-n)+`)`}),w.attr(`transform`,()=>`translate(${F+18+4}, 0)`);break;default:L+=22+F,P.attr(`transform`,(e,t)=>{let n=22*N.length/2;return`translate(216,`+(t*22-n)+`)`})}let z=M.node()?.getBoundingClientRect().width??0,B=225-z/2,V=225+z/2,H=Math.min(0,B),U=Math.max(L,V)-H;f.attr(`viewBox`,`${H} 0 ${U} ${I}`),m(f,I,U,d.useMaxWidth)},`draw`)},styles:O};export{A as diagram};