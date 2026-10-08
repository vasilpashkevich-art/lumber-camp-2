/* ================= МАТЕРИК: генерация, сетка зон, земля, биомы ================= */
// размер мира: мир 1 — базовый, мир 2 — площадь +30%, мир 3 и дальше — площадь ×2
const SIDE_BIOMES=[
  {id:'snow', name:'Снежный край',     from:4,to:7,w:0.95,col:[214,226,236],world:1,boss:9},
  {id:'marsh',name:'Болотный край',    from:2,to:4,w:0.8, col:[66,90,64],  world:2},
  {id:'shroom',name:'Грибной лес',     from:3,to:5,w:0.75,col:[78,58,92],  world:2},
  {id:'waste',name:'Красная пустошь',  from:5,to:7,w:0.85,col:[150,80,52], world:3},
  {id:'high', name:'Скалистое нагорье',from:4,to:6,w:0.8, col:[118,114,104],world:3},
  {id:'mist', name:'Туманная топь',    from:6,to:7,w:0.75,col:[70,86,90],  world:3},
];
const ZONE_COL=[[118,150,70],[40,86,64],[120,104,50],[74,60,78],[36,40,58],[108,90,76],[60,72,70]];
const ZONE_FRAC=[560,860,1160,1450,1750,2050].map(r=>r/2480);
const WG={cell:20,texK:5};
function vnoise(seed){const r=mulberry(seed),T=new Float32Array(1024);for(let i=0;i<1024;i++)T[i]=r();
  const h=(x,y)=>T[(((x*73856093)^(y*19349663))>>>0)&1023],sm=t=>t*t*(3-2*t);
  return (x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=sm(x-xi),yf=sm(y-yi),a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);return a+(b-a)*xf+(c-a)*yf+(a-b-c+d)*xf*yf}}
function angNoise(rng,harm,amp){const ph=[],am=[];for(let k=1;k<=harm;k++){ph.push(rng()*6.283);am.push((rng()*2-1)*amp/Math.pow(k,0.85))}return a=>{let s=0;for(let k=1;k<=harm;k++)s+=am[k-1]*Math.sin(k*a+ph[k-1]);return s}}
const worldNg=()=>(S&&S.meta&&S.meta.ng)||0;
function genWorld(){
  const ng=worldNg(),seed=(S.seed||4242)|0,scale=ng>=2?Math.SQRT2:ng>=1?Math.sqrt(1.3):1;
  const rng=mulberry(seed*13+7),R=2480*scale,W=Math.ceil(R*2.5/100)*100,C=W/2;
  W_SIZE=W;CX=C;CY=C;
  const coast=angNoise(rng,9,0.2),coast2=angNoise(rng,26,0.06);
  const zb=ZONE_COL.map(()=>angNoise(rng,5,0.2)),ov=ZONE_COL.map(()=>[0.12+rng()*0.14,rng()*3.14]);
  const NA=1440,coastT=new Float32Array(NA),zT=ZONE_COL.map(()=>new Float32Array(NA));
  for(let k=0;k<NA;k++){const a=k/NA*Math.PI*2-Math.PI,cr=R*(1+coast(a)+coast2(a));coastT[k]=cr;
    for(let i=0;i<6;i++){const r=cr*ZONE_FRAC[i]*(1+zb[i](a)*0.6+ov[i][0]*0.5*Math.cos(2*(a-ov[i][1])));const lo=(i?zT[i-1][k]:230*scale)+Math.max(110*scale,cr*0.07);zT[i][k]=Math.max(lo,Math.min(r,cr-(6-i)*110*scale))}
    zT[6][k]=cr}
  const tab=(T,a)=>{const f=(a+Math.PI)/(Math.PI*2)*NA,i=Math.floor(f),t=f-i;return T[((i%NA)+NA)%NA]*(1-t)+T[(((i+1)%NA)+NA)%NA]*t};
  const sides=SIDE_BIOMES.filter(b=>b.world<=ng+1).map(b=>({...b})),used=[],diag=[Math.PI/4,3*Math.PI/4,-3*Math.PI/4,-Math.PI/4];
  for(const b of sides){let a,tries=0;
    do{a=b.id==='snow'?diag[Math.floor(rng()*4)]+(rng()-0.5)*0.2:rng()*6.283-Math.PI;tries++}
    while(tries<300&&used.some(u=>Math.abs(Math.atan2(Math.sin(a-u.a),Math.cos(a-u.a)))<(u.w+b.w)/2+0.25));
    b.a=a;used.push(b);b.edge=angNoise(rng,5,0.25);b.inner=angNoise(rng,5,0.1)}
  const wn1=vnoise(seed+5),wn2=vnoise(seed+6),nE=vnoise(seed+33),WA=360*scale;
  function region(x0,y0){const dc=Math.hypot(x0-C,y0-C),kw=Math.min(1,Math.max(0,(dc-260*scale)/(500*scale)));
    const x=x0+((wn1(x0/1100,y0/1100)-0.5)*2*WA+(wn1(x0/380,y0/380)-0.5)*WA*0.35)*kw,y=y0+((wn2(x0/1100,y0/1100)-0.5)*2*WA+(wn2(x0/380,y0/380)-0.5)*WA*0.35)*kw;
    const dx=x-C,dy=y-C,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
    if(d>tab(coastT,a))return [0,-1];
    let zi=0;while(zi<6&&d>tab(zT[zi],a))zi++;
    for(let s=0;s<sides.length;s++){const b=sides[s],da=Math.abs(Math.atan2(Math.sin(a-b.a),Math.cos(a-b.a)));const ww=b.w/2*(1+b.edge(a*3)+(nE(x/520,y/520)-0.5)*0.9)*Math.min(1,0.6+0.4*d/(R*0.7));
      if(da<ww&&zi+1>=b.from&&zi+1<=b.to){const rin=b.from>1?tab(zT[b.from-2],a)*(1+b.inner(a)):0;if(d>rin)return [zi+1,s]}}
    return [zi+1,-1]}
  const cs=WG.cell,gw=Math.ceil(W/cs),N=gw*gw,zone=new Int8Array(N),side=new Int8Array(N).fill(-1);
  for(let j=0;j<gw;j++)for(let i=0;i<gw;i++){const [z,s]=region(i*cs+cs/2,j*cs+cs/2);zone[j*gw+i]=z;side[j*gw+i]=s}
  // расстояние до берега в клетках (и для суши, и для моря)
  const cd=new Uint8Array(N).fill(255),q=new Int32Array(N);let qh=0,qt=0;
  for(let k=0;k<N;k++){const i=k%gw,j=(k/gw)|0;const sea=zone[k]===0;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=gw||jj>=gw)continue;if((zone[jj*gw+ii]===0)!==sea){cd[k]=0;q[qt++]=k;break}}}
  while(qh<qt){const k=q[qh++],i=k%gw,j=(k/gw)|0;if(cd[k]>=60)continue;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=gw||jj>=gw)continue;const kk=jj*gw+ii;if(cd[kk]>cd[k]+1){cd[kk]=cd[k]+1;q[qt++]=kk}}}
  const area=new Float64Array(8),sideArea=new Float64Array(sides.length);for(let k=0;k<N;k++){area[zone[k]]+=cs*cs;if(side[k]>=0)sideArea[side[k]]+=cs*cs}
  Object.assign(WG,{ng,scale,R,W,C,gw,zone,side,cd,sides,area,sideArea,region,noise:vnoise(seed+99),noise2:vnoise(seed+77)});
}
const gIdx=(x,y)=>{const i=Math.floor(x/WG.cell),j=Math.floor(y/WG.cell);if(i<0||j<0||i>=WG.gw||j>=WG.gw)return -1;return j*WG.gw+i};
const isSea=(x,y)=>{const k=gIdx(x,y);return k<0||WG.zone[k]===0};
const sideAt=(x,y)=>{const k=gIdx(x,y);return k<0||WG.side[k]<0?null:WG.sides[WG.side[k]]};
const coastDist=(x,y)=>{const k=gIdx(x,y);return k<0?0:WG.cd[k]*WG.cell};
function toLand(x,y){let g=0;while(isSea(x,y)&&g<200){const d=dist(x,y,CX,CY)||1;x+=(CX-x)/d*30;y+=(CY-y)/d*30;g++}return {x,y}}
// случайная точка в зоне: pad — отступ от моря, noSide — не в боковом биоме, onlySide — только в этом биоме
function randInZone(zid,rf,pad=40,opt={}){const R=rf||Math.random;
  for(let g=0;g<4000;g++){const x=R()*WG.W,y=R()*WG.W,k=gIdx(x,y);if(k<0||WG.zone[k]!==zid&&!(opt.onlySide!=null))continue;
    if(opt.onlySide!=null){if(WG.side[k]!==opt.onlySide)continue}else if(opt.noSide&&WG.side[k]>=0)continue;
    if(WG.cd[k]*WG.cell<pad)continue;if(opt.minD&&dist(x,y,CX,CY)<opt.minD)continue;if(opt.ok&&!opt.ok(x,y))continue;return {x,y}}
  return null}
// --- текстура земли
function buildTerrain(){
  const K=WG.texK,tw=Math.ceil(WG.W/K),cv=document.createElement('canvas');cv.width=tw;cv.height=tw;WG.tex=cv;
  const c2=cv.getContext&&cv.getContext('2d');if(!c2||!c2.createImageData)return;
  const img=c2.createImageData(tw,tw),D=img.data,cs=WG.cell,gw=WG.gw,n1=WG.noise,n2=WG.noise2;
  const colOf=k=>{if(k<0)return [20,48,70];const z=WG.zone[k];if(!z){const t=Math.min(1,WG.cd[k]/22);return [70-52*Math.sqrt(t),130-90*Math.sqrt(t),150-88*Math.sqrt(t)]}
    let col=WG.side[k]>=0?WG.sides[WG.side[k]].col:ZONE_COL[z-1];if(WG.cd[k]<=1){const sand=WG.side[k]>=0&&WG.sides[WG.side[k]].id==='snow'?[226,234,240]:[188,170,122];col=WG.cd[k]===0?sand:[(col[0]+sand[0])/2,(col[1]+sand[1])/2,(col[2]+sand[2])/2]}return col};
  const cache=new Array(gw*gw);const cc=k=>cache[k]||(cache[k]=colOf(k));
  for(let py=0;py<tw;py++){const wy=py*K,fy=wy/cs-0.5,j0=Math.max(0,Math.min(gw-2,Math.floor(fy))),ty=Math.max(0,Math.min(1,fy-j0));
    for(let px=0;px<tw;px++){const wx=px*K,fx=wx/cs-0.5,i0=Math.max(0,Math.min(gw-2,Math.floor(fx))),tx=Math.max(0,Math.min(1,fx-i0));
      const a=cc(j0*gw+i0),b=cc(j0*gw+i0+1),c=cc((j0+1)*gw+i0),d=cc((j0+1)*gw+i0+1);
      const sh=(n1(wx/180,wy/180)-0.5)*24+(n2(wx/38,wy/38)-0.5)*12;const o=(py*tw+px)*4;
      for(let ch=0;ch<3;ch++){let v=(a[ch]*(1-tx)+b[ch]*tx)*(1-ty)+(c[ch]*(1-tx)+d[ch]*tx)*ty;D[o+ch]=v+sh}
      const dc=Math.hypot(wx-CX,wy-CY);if(dc<CFG.baseR+70){const t=Math.max(0,Math.min(1,(CFG.baseR+70-dc)/60));D[o]=D[o]*(1-t)+(52+sh*0.5)*t;D[o+1]=D[o+1]*(1-t)+(48+sh*0.5)*t;D[o+2]=D[o+2]*(1-t)+(31+sh*0.5)*t}
      D[o+3]=255}}
  c2.putImageData(img,0,0);
}
function drawTerrain(vx0,vy0,vx1,vy1){
  ctx.fillStyle='#14324a';ctx.fillRect(vx0,vy0,vx1-vx0,vy1-vy0);
  if(!WG.tex)return;const K=WG.texK,sx=Math.max(0,vx0/K),sy=Math.max(0,vy0/K),ex=Math.min(WG.tex.width,vx1/K),ey=Math.min(WG.tex.height,vy1/K);
  if(ex>sx&&ey>sy){ctx.imageSmoothingEnabled=true;ctx.drawImage(WG.tex,sx,sy,ex-sx,ey-sy,sx*K,sy*K,(ex-sx)*K,(ey-sy)*K)}
}
// --- декор по биомам
function buildDecor(rng){
  decor=[];const n=Math.round(3200*WG.scale*WG.scale);
  for(let i=0;i<n;i++){const x=rng()*WG.W,y=rng()*WG.W,k=gIdx(x,y);if(k<0||!WG.zone[k]||WG.cd[k]<1||dist(x,y,CX,CY)<CFG.fenceR+30)continue;
    const sd=WG.side[k]>=0?WG.sides[WG.side[k]].id:null;decor.push({x,y,b:sd||'z'+WG.zone[k],v:rng(),s:0.7+rng()*0.8})}
}
function drawDecor(d,now){const x=d.x,y=d.y,s=d.s,v=d.v;
  switch(d.b){
    case 'z1':if(v<0.6){ctx.strokeStyle=v<0.3?'#6f9a48':'#9cbf68';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-2*s,y-5*s);ctx.moveTo(x,y);ctx.lineTo(x+2*s,y-5*s);ctx.stroke()}else{ctx.fillStyle=['#f4e27a','#ffffff','#c9a0e0','#f2a0a0'][Math.floor(v*40)%4];ctx.beginPath();ctx.arc(x,y,1.8*s,0,7);ctx.fill()}break;
    case 'z2':ctx.fillStyle=v<0.5?'#6b4a2c':'#2f5a3a';ctx.beginPath();ctx.ellipse(x,y,2.5*s,1.6*s,v*6,0,7);ctx.fill();break;
    case 'z3':ctx.fillStyle=['#c9822e','#a8642a','#d8a040'][Math.floor(v*30)%3];ctx.beginPath();ctx.ellipse(x,y,3*s,1.8*s,v*6,0,7);ctx.fill();break;
    case 'z4':if(v<0.5){ctx.fillStyle='rgba(40,30,30,.45)';ctx.beginPath();ctx.ellipse(x,y,6*s,3.5*s,v*3,0,7);ctx.fill()}else{ctx.strokeStyle='#3c3240';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-5*s,y);ctx.lineTo(x+5*s,y-2*s);ctx.stroke()}break;
    case 'z5':ctx.strokeStyle='#26304a';ctx.lineWidth=1.2;for(let i=0;i<3;i++){const a=v*6+i*2.1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*6*s,y+Math.sin(a)*6*s);ctx.stroke()}break;
    case 'z6':ctx.fillStyle=v<0.7?'rgba(160,150,140,.5)':`rgba(255,${120+Math.sin(now/300+v*20)*50},40,.8)`;ctx.beginPath();ctx.arc(x,y,v<0.7?3.5*s:1.2,0,7);ctx.fill();break;
    case 'z7':ctx.fillStyle='#d9d2bd';ctx.fillRect(x-4*s,y,8*s,1.6*s);ctx.beginPath();ctx.arc(x-4*s,y+0.8*s,1.5*s,0,7);ctx.arc(x+4*s,y+0.8*s,1.5*s,0,7);ctx.fill();break;
    case 'snow':ctx.fillStyle=v<0.6?'rgba(255,255,255,.75)':'rgba(170,200,230,.5)';ctx.beginPath();ctx.ellipse(x,y,7*s,2.5*s,0.2,0,7);ctx.fill();break;
    case 'marsh':ctx.strokeStyle='#8a8a50';ctx.lineWidth=1.3;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x+i*3,y);ctx.lineTo(x+i*3+(v-0.5)*4,y-9*s);ctx.stroke()}break;
    case 'shroom':if(v<0.5){ctx.fillStyle=`rgba(210,160,255,${0.35+0.3*Math.sin(now/400+v*30)})`;ctx.beginPath();ctx.arc(x,y,1.6,0,7);ctx.fill()}else{ctx.fillStyle='#d8cfc0';ctx.fillRect(x-1,y,2,4);ctx.fillStyle='#b05aa0';ctx.beginPath();ctx.arc(x,y,3.2*s,Math.PI,0);ctx.fill()}break;
    case 'waste':if(v<0.6){ctx.strokeStyle='rgba(70,30,20,.5)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+8*s,y+3);ctx.lineTo(x+12*s,y-4);ctx.stroke()}else{ctx.fillStyle='#e0d8c4';ctx.fillRect(x,y,7*s,2)}break;
    case 'high':ctx.fillStyle=v<0.5?'#8f8b82':'#6e6a62';ctx.beginPath();ctx.arc(x,y,2.5*s,0,7);ctx.fill();break;
    case 'mist':ctx.fillStyle=`rgba(180,255,220,${0.25+0.25*Math.sin(now/500+v*40)})`;ctx.beginPath();ctx.arc(x+Math.sin(now/900+v*9)*4,y,2.2,0,7);ctx.fill();break;
  }
}
// --- деревья биомов (статы — от зоны, облик — от биома)
function drawBiomeTree(t,x,y,r){
  const sk=t.skin;
  if(sk==='snow'){for(const [rr,col] of [[1,'#1f4436'],[0.74,'#2c5a48'],[0.5,'#3a6e58'],[0.28,'#4f8a6e']]){ctx.fillStyle=col;ctx.beginPath();for(let i=0;i<18;i++){const a=i/18*6.283,q=i%2?rr*r*0.7:rr*r;ctx.lineTo(x+Math.cos(a)*q,y-8+Math.sin(a)*q)}ctx.fill()}
    ctx.fillStyle='rgba(250,253,255,.95)';ctx.beginPath();ctx.ellipse(x-r*0.25,y-8-r*0.3,r*0.55,r*0.32,-0.4,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(x+r*0.35,y-8+r*0.1,r*0.3,r*0.2,0.3,0,7);ctx.fill();ctx.beginPath();ctx.arc(x,y-8,r*0.14,0,7);ctx.fill();return}
  if(sk==='marsh'){ctx.fillStyle='#3e5a3a';ctx.beginPath();ctx.arc(x,y-8,r*0.95,0,7);ctx.fill();ctx.strokeStyle='#5d7a48';ctx.lineWidth=1.5;for(let i=0;i<16;i++){const a=i/16*6.283;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*0.3,y-8+Math.sin(a)*r*0.3);ctx.quadraticCurveTo(x+Math.cos(a)*r*0.9,y-8+Math.sin(a)*r*0.7,x+Math.cos(a)*r*1.05,y-3+Math.sin(a)*r*1.05);ctx.stroke()}return}
  if(sk==='shroom'){ctx.fillStyle='#d8cfc0';ctx.fillRect(x-3,y-6,6,10);const col=['#8a3a8a','#6a3aa0','#a04a6a'][Math.floor(t.seed*3)];ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-10,r,0,7);ctx.fill();ctx.fillStyle='rgba(232,160,216,.55)';ctx.beginPath();ctx.arc(x-r*0.3,y-10-r*0.3,r*0.5,0,7);ctx.fill();
    ctx.fillStyle='rgba(255,255,240,.85)';for(let i=0;i<5;i++){const a=t.seed*30+i*1.3;ctx.beginPath();ctx.arc(x+Math.cos(a)*r*0.55,y-10+Math.sin(a)*r*0.55,1.5+(i%3),0,7);ctx.fill()}return}
  if(sk==='waste'){ctx.strokeStyle='#3a2018';ctx.lineWidth=3;ctx.lineCap='round';for(let i=0;i<6;i++){const a=t.seed*20+i*1.05,l=r*(0.7+((i*37)%10)/25);ctx.beginPath();ctx.moveTo(x,y-4);ctx.lineTo(x+Math.cos(a)*l*0.5,y-4+Math.sin(a)*l*0.5);ctx.lineTo(x+Math.cos(a+0.4)*l,y-4+Math.sin(a+0.4)*l);ctx.stroke()}ctx.fillStyle='#5a2a1c';ctx.beginPath();ctx.arc(x,y-4,4,0,7);ctx.fill();return}
  if(sk==='high'){for(const [rr,col] of [[1,'#2d4a34'],[0.68,'#3b5f42'],[0.38,'#4f7a52']]){ctx.fillStyle=col;ctx.beginPath();for(let i=0;i<14;i++){const a=i/14*6.283,q=i%2?rr*r*0.65:rr*r;ctx.lineTo(x+Math.cos(a)*q,y-8+Math.sin(a)*q)}ctx.fill()}return}
  if(sk==='mist'){ctx.strokeStyle='#1e2622';ctx.lineWidth=2;for(let i=0;i<7;i++){const a=i/7*6.283;ctx.beginPath();ctx.moveTo(x,y-4);ctx.quadraticCurveTo(x+Math.cos(a)*r*0.6,y-6+Math.sin(a)*r*0.2,x+Math.cos(a)*r*0.9,y+Math.sin(a)*r*0.6);ctx.stroke()}ctx.fillStyle='#24302c';ctx.beginPath();ctx.arc(x,y-10,r*0.75,0,7);ctx.fill();ctx.fillStyle='#2f3e38';ctx.beginPath();ctx.arc(x-r*0.2,y-13,r*0.45,0,7);ctx.fill();return}
}
// --- облик мертвецов в биомах
function drawBiomeZ(z,bob){const x=z.x,y=z.y+bob,r=z.r;
  if(z.biome==='snow'){ctx.fillStyle='rgba(230,245,255,.7)';ctx.beginPath();ctx.arc(x,y,r*0.98,Math.PI+0.5,2*Math.PI-0.5);ctx.fill();ctx.fillStyle='#bfe6ff';for(const dx of [-0.45,0,0.45]){ctx.beginPath();ctx.moveTo(x+dx*r-2,y-r*0.85);ctx.lineTo(x+dx*r,y-r*1.3);ctx.lineTo(x+dx*r+2,y-r*0.85);ctx.fill()}}
  else if(z.biome==='marsh'){ctx.strokeStyle='#5d7a48';ctx.lineWidth=1.5;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x-r*0.55+i*r*0.36,y-r*0.7);ctx.lineTo(x-r*0.6+i*r*0.36,y+r*0.3);ctx.stroke()}}
  else if(z.biome==='shroom'){ctx.fillStyle='#c76fb0';ctx.beginPath();ctx.arc(x+r*0.35,y-r*0.6,r*0.42,Math.PI,0);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+r*0.3,y-r*0.75,1.4,0,7);ctx.fill()}
  else if(z.biome==='waste'){ctx.fillStyle='rgba(224,216,196,.85)';ctx.beginPath();ctx.arc(x,y,r*0.9,Math.PI+0.4,2*Math.PI-0.4);ctx.fill()}
  else if(z.biome==='mist'){ctx.fillStyle='rgba(200,215,220,.18)';ctx.beginPath();ctx.arc(x,y,r+6,0,7);ctx.fill()}
}
// --- особенности биомов: шипы спор, туман, утёсы
function updWorld(dt){
  if(DG||!WG.zone)return;const sd=sideAt(P.x,P.y);
  if(sd&&sd.id==='shroom'){for(const p of patches){if(p.kind!=='spore'||Math.abs(p.x-P.x)>p.r||dist(p.x,p.y,P.x,P.y)>p.r)continue;P.sporeT=(P.sporeT||0)+dt;if(P.sporeT>0.6){P.sporeT=0;damagePlayer(Math.max(1,maxHp(S.up.hp)*0.03));addFloat(P.x,P.y-30,'споры','#c9a0ff')}}}
}
function mistFog(){const sd=!DG&&sideAt(P.x,P.y);if(!sd||sd.id!=='mist')return;ctx.setTransform(DPR,0,0,DPR,0,0);const g=ctx.createRadialGradient(VW/2,VH/2,90,VW/2,VH/2,Math.max(VW,VH)*0.55);g.addColorStop(0,'rgba(190,205,210,0)');g.addColorStop(1,'rgba(190,205,210,.86)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH)}
// --- подписи зон и биомов на земле и на картах
function buildLabels(rng){
  WG.labels=[];const pick=(test,pref)=>{let best=null,bs=-1e9;for(let t=0;t<1500;t++){const x=rng()*WG.W,y=rng()*WG.W;if(!test(x,y))continue;let ok=0;for(const [dx,dy] of [[110,0],[-110,0],[0,60],[0,-60],[200,0],[-200,0]])if(test(x+dx*WG.scale,y+dy*WG.scale))ok++;const sc=ok*10+pref(x,y);if(sc>bs){bs=sc;best={x,y}}}return best};
  for(const z of CFG.zones){const p=pick((x,y)=>{const k=gIdx(x,y);return k>=0&&WG.zone[k]===z.id&&WG.side[k]<0},(x,y)=>-(y-CY)/WG.W*14-Math.abs(x-CX)/WG.W*6);if(p)WG.labels.push({x:p.x,y:p.y,zone:z.id,name:z.name})}
  WG.sides.forEach((s,i)=>{const p=pick((x,y)=>{const k=gIdx(x,y);return k>=0&&WG.side[k]===i},()=>0);if(p)WG.labels.push({x:p.x,y:p.y,side:s.id,name:s.name})});
}
