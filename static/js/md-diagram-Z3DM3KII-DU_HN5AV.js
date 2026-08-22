import{t as e}from"./md-chunk-X3CZISLH-BPl9t-jR.js";import{i as t}from"./md-chunk-75Z2AOVW-BBX7s6bU.js";import{n}from"./md-mermaid-parser.core-BkDGpWtk.js";import{n as r}from"./md-chunk-Y2CYZVJY-DsF7k-Jl.js";import{H as i,K as a,U as o,a as s,b as c,c as l,f as u,v as d,w as f,y as p}from"./md-chunk-DU6HZSFF-55azQaV2.js";import{t as m}from"./md-chunk-JWPE2WC7-qo9X49S-.js";import{f as h}from"./md-mermaid.core-CXG4ZAya.js";var g=u.packet,_=class{constructor(){this.packet=[],this.setAccTitle=o,this.getAccTitle=p,this.setDiagramTitle=a,this.getDiagramTitle=f,this.getAccDescription=d,this.setAccDescription=i}static{r(this,`PacketDB`)}getConfig(){let e=t({...g,...c().packet});return e.showBits&&(e.paddingY+=10),e}getPacket(){return this.packet}pushWord(e){e.length>0&&this.packet.push(e)}clear(){s(),this.packet=[]}},v=1e4,y=r((t,n)=>{m(t,n);let r=-1,i=[],a=1,{bitsPerRow:o}=n.getConfig();for(let{start:s,end:c,bits:l,label:u}of t.blocks){if(s!==void 0&&c!==void 0&&c<s)throw Error(`Packet block ${s} - ${c} is invalid. End must be greater than start.`);if(s??=r+1,s!==r+1)throw Error(`Packet block ${s} - ${c??s} is not contiguous. It should start from ${r+1}.`);if(l===0)throw Error(`Packet block ${s} is invalid. Cannot have a zero bit field.`);for(c??=s+(l??1)-1,l??=c-s+1,r=c,e.debug(`Packet block ${s} - ${r} with label ${u}`);i.length<=o+1&&n.getPacket().length<v;){let[e,t]=b({start:s,end:c,bits:l,label:u},a,o);if(i.push(e),e.end+1===a*o&&(n.pushWord(i),i=[],a++),!t)break;({start:s,end:c,bits:l,label:u}=t)}}n.pushWord(i)},`populate`),b=r((e,t,n)=>{if(e.start===void 0)throw Error(`start should have been set during first phase`);if(e.end===void 0)throw Error(`end should have been set during first phase`);if(e.start>e.end)throw Error(`Block start ${e.start} is greater than block end ${e.end}.`);if(e.end+1<=t*n)return[e,void 0];let r=t*n-1,i=t*n;return[{start:e.start,end:r,label:e.label,bits:r-e.start},{start:i,end:e.end,label:e.label,bits:e.end-i}]},`getNextFittingBlock`),x={parser:{yy:void 0},parse:r(async t=>{let r=await n(`packet`,t),i=x.parser?.yy;if(!(i instanceof _))throw Error(`parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.`);e.debug(r),y(r,i)},`parse`)},S=r((e,t,n,r)=>{let i=r.db,a=i.getConfig(),{rowHeight:o,paddingY:s,bitWidth:c,bitsPerRow:u}=a,d=i.getPacket(),f=i.getDiagramTitle(),p=o+s,m=p*(d.length+1)-(f?0:o),g=c*u+2,_=h(t);_.attr(`viewBox`,`0 0 ${g} ${m}`),l(_,m,g,a.useMaxWidth);for(let[e,t]of d.entries())C(_,t,e,a);_.append(`text`).text(f).attr(`x`,g/2).attr(`y`,m-p/2).attr(`dominant-baseline`,`middle`).attr(`text-anchor`,`middle`).attr(`class`,`packetTitle`)},`draw`),C=r((e,t,n,{rowHeight:r,paddingX:i,paddingY:a,bitWidth:o,bitsPerRow:s,showBits:c})=>{let l=e.append(`g`),u=n*(r+a)+a;for(let e of t){let t=e.start%s*o+1,n=(e.end-e.start+1)*o-i;if(l.append(`rect`).attr(`x`,t).attr(`y`,u).attr(`width`,n).attr(`height`,r).attr(`class`,`packetBlock`),l.append(`text`).attr(`x`,t+n/2).attr(`y`,u+r/2).attr(`class`,`packetLabel`).attr(`dominant-baseline`,`middle`).attr(`text-anchor`,`middle`).text(e.label),!c)continue;let a=e.end===e.start,d=u-2;l.append(`text`).attr(`x`,t+(a?n/2:0)).attr(`y`,d).attr(`class`,`packetByte start`).attr(`dominant-baseline`,`auto`).attr(`text-anchor`,a?`middle`:`start`).text(e.start),a||l.append(`text`).attr(`x`,t+n).attr(`y`,d).attr(`class`,`packetByte end`).attr(`dominant-baseline`,`auto`).attr(`text-anchor`,`end`).text(e.end)}},`drawWord`),w={draw:S},T={byteFontSize:`10px`,startByteColor:`black`,endByteColor:`black`,labelColor:`black`,labelFontSize:`12px`,titleColor:`black`,titleFontSize:`14px`,blockStrokeColor:`black`,blockStrokeWidth:`1`,blockFillColor:`#efefef`},E={parser:x,get db(){return new _},renderer:w,styles:r(({packet:e}={})=>{let n=t(T,e);return`
	.packetByte {
		font-size: ${n.byteFontSize};
	}
	.packetByte.start {
		fill: ${n.startByteColor};
	}
	.packetByte.end {
		fill: ${n.endByteColor};
	}
	.packetLabel {
		fill: ${n.labelColor};
		font-size: ${n.labelFontSize};
	}
	.packetTitle {
		fill: ${n.titleColor};
		font-size: ${n.titleFontSize};
	}
	.packetBlock {
		stroke: ${n.blockStrokeColor};
		stroke-width: ${n.blockStrokeWidth};
		fill: ${n.blockFillColor};
	}
	`},`styles`)};export{E as diagram};