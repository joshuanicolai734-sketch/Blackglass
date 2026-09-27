// Blackglass teaser: a ~24 s motion piece for blackglass.co.nz, rendered vertical (1080×1920) and
// landscape (1920×1080). Every frame is a pure function of time: seek(t) positions the DOM layers and draws
// the WebGL light field, so renders are exact and repeatable. Sound design: teaser-sound.py (synced to BEATS).
import { C, P, base, bezierSrc, screens } from "./lib.mjs";

export const DURATION = 24;
// Sound design hits (seconds), shared with teaser-sound.py.
export const BEATS = { line: 0.3, rim: 1.3, glint: 3.15, dive: 5.2, land: 6.2, words: [7.0, 8.4, 9.8, 11.2], head: 12.6, collapse: 16.6, impact: 18.6, lock: 19.2, end: 20.2 };

const shader = `precision highp float;uniform vec2 r;uniform float t,inten,flash,streak;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1)),f.x),f.y);}
void main(){vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
float w=n(p*1.3+vec2(t*.05,-t*.035))*.5+n(p*2.7-vec2(t*.03))*.25;
float dg=(p.x+p.y)*.7071+w*.25;
vec2 k=vec2(.34,.28);float key=exp(-dot(p-k,p-k)*1.6);
float b1=smoothstep(.5,0.,abs(fract(dg*.55-t*.06)-.5)*2.);
float b2=smoothstep(.5,0.,abs(fract(dg*1.3+.3-t*.04)-.5)*2.);
float l=key*.45+key*(b1*b1*.6+b2*b2*.25)+b1*.05;
float a=atan(p.y,p.x),d=length(p);
float st=pow(n(vec2(a*26.,d*3.-t*9.)),7.)*smoothstep(.08,.9,d)*streak;
vec3 c=vec3(.0627,.0667,.0745)+inten*(l*vec3(.15,.158,.17)+key*b1*b1*b1*vec3(.02,.028,0.))+st*vec3(.55,.58,.6);
c+=flash*exp(-d*d*14.)*vec3(.42,.46,.34);
c+=(fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))-.5)/255.;
gl_FragColor=vec4(c,1.);}`;

const words = [
  { w: "PLAN.", cap: "See the whole week", src: screens.plan, pos: "top" },
  { w: "TRAIN.", cap: "Resume where you left off", src: screens.today, pos: "top" },
  { w: "LEARN.", cap: "Every lift, phase by phase", src: screens.move, pos: "center 45%" },
  { w: "FUEL.", cap: "Calories and protein beside your training", src: screens.today, pos: "center 88%" },
];

function teaserHtml(W, H) {
  const V = H > W, S = Math.min(W, H) / 1080;
  const M = Math.round((V ? 460 : 400) * S); // mark size
  const paneW = Math.round((V ? 460 : 360) * S), paneH = Math.round(paneW * 1.62);
  const panes = [...words.map((x) => ({ src: x.src, pos: x.pos })), { src: screens.plan, pos: "center 30%" }, { src: screens.move, pos: "top" }];
  const slab = Array.from({ length: 14 }, (_, i) => `<svg class="sl" viewBox="0 0 88 88" style="transform:translateZ(${-(i + 1) * 2.2 * S}px)"><path fill="rgb(${150 - i * 8},${152 - i * 8},${148 - i * 8})" fill-rule="evenodd" d="${P.rim}"/></svg>`).join("");
  const css = `
  #gl{position:absolute;inset:0;width:${W}px;height:${H}px}
  #line{position:absolute;inset:0;overflow:visible}
  #mw{position:absolute;left:${W / 2 - M / 2}px;top:${H / 2 - M / 2}px;width:${M}px;height:${M}px;perspective:${1600 * S}px}
  #slab{position:absolute;inset:0;transform-style:preserve-3d}
  #slab svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
  #field{position:absolute;inset:0;perspective:${1500 * S}px;perspective-origin:50% 50%;opacity:0}
  #cam{position:absolute;left:${W / 2}px;top:${H / 2}px;transform-style:preserve-3d}
  .fp{position:absolute;left:${-paneW / 2}px;top:${-paneH / 2}px;width:${paneW}px;height:${paneH}px;backface-visibility:hidden}
  .fp .pane{width:100%!important;height:100%!important;--cut:${Math.round(28 * S)}px}
  .spec{position:absolute;inset:9px;pointer-events:none;background:linear-gradient(135deg,transparent 40%,rgba(244,245,239,.22) 50%,transparent 60%);background-size:300% 300%;mix-blend-mode:screen}
  .word{position:absolute;font-weight:800;letter-spacing:-.05em;line-height:.86;font-size:${(V ? 250 : 230) * S}px;white-space:nowrap}
  .cap{position:absolute;font:500 ${28 * S}px/1.3 "Geist Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:${C.text3};display:flex;gap:${16 * S}px;align-items:center}
  .cap::before{content:"";width:${16 * S}px;height:${16 * S}px;background:linear-gradient(135deg,${C.volt} 0 50%,transparent 50%)}
  #head{position:absolute;opacity:0}
  #head .hl{display:block;overflow:hidden}
  #head .hl span{display:block;font-weight:800;letter-spacing:-.05em;line-height:.9;font-size:${(V ? 170 : 150) * S}px}
  #lock,#end{position:absolute;inset:0;opacity:0}
  .mono{font-family:"Geist Mono",monospace;font-weight:500;letter-spacing:.16em;text-transform:uppercase}`;

  const markSvg = `<svg id="mk" viewBox="0 0 88 88" style="overflow:visible">
    <defs><mask id="rm" maskUnits="userSpaceOnUse" x="-10" y="-10" width="108" height="108">
      <path class="rs" d="M10.361 13.189 20.05 3.5H67.95L84.5 20.05V67.95L74.811 77.639" fill="none" stroke="#fff" stroke-width="12" stroke-dasharray="147" stroke-dashoffset="147"/>
      <path class="rs" d="M13.189 10.361 3.5 20.05V67.95L20.05 84.5H67.95L77.639 74.811" fill="none" stroke="#fff" stroke-width="12" stroke-dasharray="147" stroke-dashoffset="147"/></mask>
      <clipPath id="fc"><path id="fw" d="M-400 400 400-400H-400Z"/></clipPath><clipPath id="oc"><path d="${P.pane}"/></clipPath>
      <linearGradient id="lg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="8" y2="8"><stop offset="0" stop-color="#F4F5EF" stop-opacity="0"/><stop offset=".5" stop-color="#F4F5EF" stop-opacity=".42"/><stop offset="1" stop-color="#F4F5EF" stop-opacity="0"/></linearGradient>
      <filter id="bl" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="3.2"/></filter></defs>
    <path id="pn" fill="${C.pane}" opacity="0" d="${P.pane}"/><path id="fa" clip-path="url(#fc)" fill="${C.facet}" d="${P.facet}"/>
    <path id="gl1" fill="${C.volt}" opacity="0" d="${P.glint}"/><path id="gb" fill="${C.volt}" opacity="0" filter="url(#bl)" d="${P.glint}"/>
    <g clip-path="url(#oc)"><path id="sw" fill="url(#lg)" d="M-100 100 100-100h16L-84 100Z"/></g>
    <path mask="url(#rm)" fill="${C.bone}" fill-rule="evenodd" d="${P.rim}"/></svg>`;

  const wordLayout = V
    ? { wx: 72 * S, wy: 250 * S, cx: 76 * S, cy: 250 * S + 250 * S * .92 + 30 * S }
    : { wx: 120 * S, wy: H / 2 - 170 * S, cx: 124 * S, cy: H / 2 + 60 * S };
  const body = `<canvas id="gl" width="${W}" height="${H}"></canvas>
  <svg id="line" width="${W}" height="${H}"><path id="ln" d="M${W / 2 - H} ${H / 2 + H}L${W / 2 + H} ${H / 2 - H}" stroke="${C.bone}" stroke-width="${3 * S}" fill="none" stroke-dasharray="${H * 2.83}" stroke-dashoffset="${H * 2.83}"/>
    <path id="lng" d="M${W / 2 - H} ${H / 2 + H}L${W / 2 + H} ${H / 2 - H}" stroke="${C.bone}" stroke-width="${14 * S}" fill="none" opacity=".25" style="filter:blur(${10 * S}px)" stroke-dasharray="${H * 2.83}" stroke-dashoffset="${H * 2.83}"/></svg>
  <div id="field"><div id="cam">${panes.map((p, i) => `<div class="fp" id="fp${i}"><div class="pane" style="width:${paneW}px;height:${paneH}px"><div class="pane-in"><img src="${p.src}" style="object-position:${p.pos}"/></div></div><div class="spec"></div></div>`).join("")}</div></div>
  <div id="mw"><div id="slab">${slab}${markSvg}</div></div>
  ${words.map((x, i) => `<div class="word" id="w${i}" style="left:${wordLayout.wx}px;top:${wordLayout.wy}px;opacity:0${i === 3 ? `;color:${C.volt}` : ""}">${x.w}</div>
    <div class="cap" id="c${i}" style="left:${wordLayout.cx}px;top:${wordLayout.cy}px;opacity:0">${x.cap}</div>`).join("")}
  <div id="head" style="${V ? `left:${72 * S}px;top:${230 * S}px` : `left:${120 * S}px;top:${H / 2 - 230 * S}px`}"><span class="hl"><span>Know what</span></span><span class="hl"><span>today asks</span></span><span class="hl"><span>of you.</span></span></div>
  <div id="lock">${V
    ? `<svg viewBox="0 0 88 88" style="position:absolute;left:${W / 2 - 150 * S}px;top:${H / 2 - 330 * S}px;width:${300 * S}px;height:${300 * S}px"><path fill="${C.pane}" d="${P.pane}"/><path fill="${C.facet}" d="${P.facet}"/><path fill="${C.volt}" d="${P.glint}"/><path fill="${C.bone}" fill-rule="evenodd" d="${P.rim}"/></svg>
       <div id="wmw" style="position:absolute;left:${W * .14}px;top:${H / 2 + 20 * S}px;width:${W * .72}px"><svg viewBox="118 24 409.593 40" style="width:100%"><path fill="${C.bone}" d="${P.wordmark}"/></svg></div>`
    : `<svg viewBox="0 0 88 88" style="position:absolute;left:${W / 2 - 620 * S}px;top:${H / 2 - 170 * S}px;width:${240 * S}px;height:${240 * S}px"><path fill="${C.pane}" d="${P.pane}"/><path fill="${C.facet}" d="${P.facet}"/><path fill="${C.volt}" d="${P.glint}"/><path fill="${C.bone}" fill-rule="evenodd" d="${P.rim}"/></svg>
       <div id="wmw" style="position:absolute;left:${W / 2 - 330 * S}px;top:${H / 2 - 110 * S}px;width:${950 * S}px"><svg viewBox="118 24 409.593 40" style="width:100%"><path fill="${C.bone}" d="${P.wordmark}"/></svg></div>`}</div>
  <div id="end">
    <p id="e1" style="position:absolute;left:0;right:0;top:${V ? H / 2 + 200 * S : H / 2 + 120 * S}px;text-align:center;font-weight:800;letter-spacing:-.045em;font-size:${(V ? 104 : 88) * S}px">Train with intent.</p>
    <p id="e2" class="mono" style="position:absolute;left:0;right:0;top:${V ? H / 2 + 360 * S : H / 2 + 250 * S}px;text-align:center;font-size:${(V ? 40 : 34) * S}px;color:${C.bone}">blackglass.co.nz</p>
    <p id="e3" class="mono" style="position:absolute;left:0;right:0;top:${V ? H / 2 + 440 * S : H / 2 + 316 * S}px;text-align:center;font-size:${(V ? 24 : 21) * S}px;color:${C.text3}">Android app in development · Join the preview list</p></div>`;

  const seek = `
  const W=${W},H=${H},S=${S},M=${M},V=${V},PW=${paneW};
  if(!window.G){const c=document.getElementById('gl'),g=c.getContext('webgl',{preserveDrawingBuffer:true,antialias:false});
    const sh=(ty,src)=>{const s=g.createShader(ty);g.shaderSource(s,src);g.compileShader(s);return s;};
    const pr=g.createProgram();g.attachShader(pr,sh(g.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));g.attachShader(pr,sh(g.FRAGMENT_SHADER,${JSON.stringify(shader)}));g.linkProgram(pr);g.useProgram(pr);
    g.bindBuffer(g.ARRAY_BUFFER,g.createBuffer());g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),g.STATIC_DRAW);
    const l=g.getAttribLocation(pr,'p');g.enableVertexAttribArray(l);g.vertexAttribPointer(l,2,g.FLOAT,false,0,0);
    window.G={g,u:n=>g.getUniformLocation(pr,n)};}
  const g=G.g;const fl=Math.exp(-Math.pow((t-3.15)/.12,2))*.9+Math.exp(-Math.pow((t-18.6)/.14,2))*1.0;
  const dive=k(t,5.2,6.2);const streak=Math.sin(Math.PI*k(t,5.0,6.8))*1.0+Math.sin(Math.PI*k(t,16.4,18.8))*.8;
  g.uniform2f(G.u('r'),W,H);g.uniform1f(G.u('t'),t);g.uniform1f(G.u('inten'),eIO(k(t,.2,2.4))*(1-.35*k(t,19.5,21)));g.uniform1f(G.u('flash'),fl);g.uniform1f(G.u('streak'),streak);g.drawArrays(g.TRIANGLES,0,3);

  // 1. A single line of light along the 45° axis, which folds into the rim.
  const lnIn=eIO(k(t,.3,1.4)),lnOut=k(t,1.3,2.1),L=H*2.83;
  ['ln','lng'].forEach(id=>{const e=$('#'+id);e.setAttribute('stroke-dashoffset',L*(1-lnIn));e.style.opacity=(id==='lng'?.25:1)*(1-eIO(lnOut));});
  document.querySelectorAll('.rs').forEach(e=>e.setAttribute('stroke-dashoffset',147*(1-eIO(k(t,1.3,2.3)))));
  $('#pn').setAttribute('opacity',eIO(k(t,2.1,2.5)));
  const f=14.55+30.45*eOut(k(t,2.3,2.8));$('#fw').setAttribute('transform','translate('+f+' '+f+')');
  const s=-8+96*eIO(k(t,2.85,3.45));$('#sw').setAttribute('transform','translate('+s+' '+s+')');
  $('#gl1').setAttribute('opacity',t>=3.15?1:0);$('#gb').setAttribute('opacity',t>=3.15?.7*Math.exp(-(t-3.15)*6):0);
  // 2. The glass as a solid slab, turning in light, then the camera dives through it.
  const rot=k(t,2.9,5.2),ry=-24+30*eIO(rot)-6*eIO(k(t,4.6,5.2))*0,rx=14-18*eIO(rot);
  const r0=t<5.2?1:1-eIO(k(t,5.2,5.6));
  const thick=eOut(k(t,2.6,3.6))*(1-k(t,5.0,5.4));
  document.querySelectorAll('.sl').forEach((e,i)=>{e.style.opacity=thick*(t<2.3?0:1);});
  const sc=(1+.06*eIO(rot))*(1+70*eIn(dive));
  $('#slab').style.transform='rotateX('+(rx*r0)+'deg) rotateY('+(ry*r0)+'deg) scale('+sc+')';
  $('#mw').style.opacity=t<1.2?0:(t>6.3?0:1);
  // The world inside the pane: seen through the inner octagon while diving.
  const u=M/88*sc,cx=W/2,cy=H/2,oct=[[7,22.101],[22.101,7],[65.899,7],[81,22.101],[81,65.899],[65.899,81],[22.101,81],[7,65.899]];
  const fld=$('#field');fld.style.opacity=t<5.2?0:1;
  fld.style.clipPath=t<6.2?'polygon('+oct.map(([x,y])=>(cx+(x-44)*u)+'px '+(cy+(y-44)*u)+'px').join(',')+')':'none';
  // 3. Camera through the field of screens.
  const base=V?[[-.28,-.2,-600],[.3,-.05,-900],[-.22,.25,-1200],[.26,.3,-700],[0,-.36,-1500],[.05,.1,-1900]]:[[-.3,-.18,-600],[.3,-.1,-900],[-.1,.26,-1200],[.2,.28,-700],[-.02,-.3,-1500],[.4,.2,-1900]];
  const camZ=-2200*(1-eOut(k(t,5.2,7.2)))+ 300*k(t,7.2,16.6);
  const wi=[7.0,8.4,9.8,11.2].findIndex((a,i)=>t>=a&&t<a+1.4);
  const focusAmt=i=>{const a=7.0+i*1.4;return eOut(k(t,a,a+.5))*(1-eIO(k(t,a+1.15,a+1.45)));};
  const coll=eIn(k(t,16.6,18.5));
  const headA=k(t,12.6,16.6);
  document.querySelectorAll('.fp').forEach((e,i)=>{const b=base[i];
    let x=b[0]*W,y=b[1]*H,z=b[2]*S+camZ*S,ry=(b[0]>0?-18:18),o=1;
    if(i<4){const fa=focusAmt(i);const fx=V?0:W*.2,fy=V?H*.12:0,fz=0;x+=(fx-x)*fa;y+=(fy-y)*fa;z+=(fz-z)*fa;ry*=1-fa;}
    if(wi>=0&&i!==wi)o=.28+.72*(1-Math.max(...[0,1,2,3].map(focusAmt)));
    if(headA>0){const hp=eIO(k(t,12.6,13.6));const tx=V?(i-2.5)*PW*.62:(i-2.5)*PW*.55+W*.25,ty=V?H*.26:H*.1;x+=(tx-x)*hp;y+=(ty-y)*hp;z+=(-500*S-z)*hp;ry+=(-28-ry)*hp;o=.55+.45*(1-hp)+.0;}
    x*=1-coll;y*=1-coll;z=z*(1-coll)-400*S*coll;o*=1-k(t,17.8,18.5);
    e.style.transform='translate3d('+x+'px,'+y+'px,'+z+'px) rotateY('+ry+'deg) rotateZ('+(b[0]*6)+'deg) scale('+(1-.6*coll)+')';e.style.opacity=t<5.2?0:o;
    const sp=((t*.35+i*.23)%1.6)/1.6;e.querySelector('.spec').style.backgroundPosition=(120-140*sp)+'% '+(120-140*sp)+'%';});
  // 4. Kinetic words, each cut on the 45° facet.
  [0,1,2,3].forEach(i=>{const a=7.0+i*1.4,p=eOut(k(t,a,a+.35)),q=k(t,a+1.2,a+1.4);const w=$('#w'+i),c=$('#c'+i);
    w.style.opacity=t>=a&&t<a+1.4?1:0;w.style.clipPath='polygon(0 0,'+(260*p)+'% 0,0 '+(260*p)+'%)';w.style.transform='translate('+(-40*S*(1-p))+'px,0) skewX('+(-6*q)+'deg)';
    c.style.opacity=(t>=a+.2&&t<a+1.35)?eOut(k(t,a+.2,a+.55)):0;});
  // 5. The promise.
  const hd=$('#head');hd.style.opacity=t>=12.6&&t<16.8?1-k(t,16.3,16.7):0;
  hd.querySelectorAll('.hl span').forEach((e,i)=>{const p=eOut(k(t,12.9+i*.18,13.7+i*.18));e.style.transform='translateY('+(110*(1-p))+'%)';});
  // 6. Everything collapses back into the mark; the lockup resolves.
  const lk=$('#lock');lk.style.opacity=t<18.5?0:1-k(t,23.4,24);
  lk.firstElementChild.style.transform='scale('+(0.6+.4*eOut(k(t,18.5,19.2)))+')';lk.firstElementChild.style.transformOrigin='center';
  $('#wmw').style.clipPath='inset(0 '+(100-100*eOut(k(t,19.2,19.9)))+'% 0 0)';
  const en=$('#end');en.style.opacity=1-k(t,23.4,24);
  [['#e1',20.2],['#e2',20.6],['#e3',21.0]].forEach(([s,a])=>{const p=eOut(k(t,a,a+.6));$(s).style.opacity=p;$(s).style.transform='translateY('+(24*S*(1-p))+'px)';});`;

  return base({ w: W, h: H, bg: "flat", css, body }).replace("</body>", `<script>${bezierSrc}\nconst $=s=>document.querySelector(s);\nwindow.seek=function(t){${seek}};</script></body>`);
}

export const teasers = [
  { id: "teaser-vertical", out: "social/exports/video/blackglass-teaser-1080x1920.mp4", w: 1080, h: 1920, duration: DURATION, audio: "social/.build/teaser-sound.wav", html: teaserHtml(1080, 1920) },
  { id: "teaser-landscape", out: "social/exports/video/blackglass-teaser-1920x1080.mp4", w: 1920, h: 1080, duration: DURATION, audio: "social/.build/teaser-sound.wav", html: teaserHtml(1920, 1080) },
];
