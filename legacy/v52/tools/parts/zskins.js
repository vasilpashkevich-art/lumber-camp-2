/* ================= ОБЛИКИ МЕРТВЕЦОВ ================= */
const ZMAT={wood:{f:'#7a5634',d:'#4a3220',h:'#a07a4c'},iron:{f:'#8e959b',d:'#4c5257',h:'#cfd8de'},gold:{f:'#d8b44a',d:'#8a6a1c',h:'#fff0a8'},leather:{f:'#5a3d26',d:'#2e1f14',h:'#7a5634'},bone:{f:'#d9d2bd',d:'#7d7663',h:'#fffaf0'}};
// снаряжение по силе: 1 — ничего, 2 — деревянный шлем, 3 — +деревянный щит, 4 — железный шлем, 5 — железо и шипы, 6 — золотой шлем, 7 — всё золотое и аура
function zGear(z){
  const t=z.tier,k=z.kind;
  if(k==='runner')return {helm:t>=6?'gold':t>=4?'leather':t>=2?'band':null,shield:null,spikes:false,aura:t>=7};
  if(k==='spitter')return {helm:null,mask:t>=6?'gold':t>=4?'iron':t>=2?'bone':null,shield:null,spikes:t>=5,aura:t>=7};
  if(k==='ram')return {helm:t>=6?'gold':t>=4?'iron':'wood',shield:null,spikes:t>=4,aura:t>=7,horns:true};
  return {helm:t>=6?'gold':t>=4?'iron':t>=2?'wood':null,shield:t>=7?'gold':t>=5?'iron':t>=3?'wood':null,spikes:t>=5,aura:t>=7};
}
function drawZGear(z,bob,a){
  const g=zGear(z),x=z.x,y=z.y+bob,r=z.r,hit=z.hit>0;
  if(g.aura){const p=0.25+0.12*Math.sin(performance.now()/220+z.ph);ctx.strokeStyle=`rgba(120,255,170,${p})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r+5,0,7);ctx.stroke()}
  // наплечные шипы
  if(g.spikes){const m=ZMAT[g.helm==='gold'?'gold':'iron'];ctx.fillStyle=hit?'#fff':m.f;
    for(const s of [-1,1]){const sa=a+s*1.4,bx=x+Math.cos(sa)*r*0.85,by=y+Math.sin(sa)*r*0.85;ctx.beginPath();ctx.moveTo(bx+Math.cos(sa+1.4)*3,by+Math.sin(sa+1.4)*3);ctx.lineTo(bx+Math.cos(sa)*r*0.55,by+Math.sin(sa)*r*0.55);ctx.lineTo(bx+Math.cos(sa-1.4)*3,by+Math.sin(sa-1.4)*3);ctx.fill()}}
  // шлем: шапка сверху тела, глаза остаются под краем
  if(g.helm){
    if(g.helm==='band'){ctx.fillStyle=hit?'#fff':'#a8322a';ctx.fillRect(x-r*0.95,y-r*0.62,r*1.9,r*0.22);ctx.beginPath();ctx.moveTo(x+r*0.8,y-r*0.55);ctx.lineTo(x+r*1.35,y-r*0.35+Math.sin(z.ph*2)*2);ctx.lineTo(x+r*1.25,y-r*0.6);ctx.fill()}
    else{const m=ZMAT[g.helm];ctx.fillStyle=hit?'#fff':m.f;ctx.beginPath();ctx.arc(x,y,r*1.02,Math.PI+0.32,Math.PI*2-0.32);ctx.closePath();ctx.fill();
      ctx.strokeStyle=m.d;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-r*0.95,y-r*0.33);ctx.lineTo(x+r*0.95,y-r*0.33);ctx.stroke();
      ctx.strokeStyle=m.h;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,r*0.8,Math.PI+0.7,Math.PI+1.4);ctx.stroke();
      if(g.helm==='wood'){ctx.strokeStyle=m.d;ctx.lineWidth=1;for(const dx of [-0.35,0.35]){ctx.beginPath();ctx.moveTo(x+dx*r,y-r*0.35);ctx.lineTo(x+dx*r*0.8,y-r*0.92);ctx.stroke()}}
      if(g.helm==='leather'){ctx.fillStyle=m.d;ctx.beginPath();ctx.moveTo(x-r*0.3,y-r*0.95);ctx.lineTo(x,y-r*1.35);ctx.lineTo(x+r*0.3,y-r*0.95);ctx.fill()}
      if(g.helm==='iron'||g.helm==='gold'){ctx.fillStyle=m.d;ctx.fillRect(x-1.2,y-r*0.36,2.4,r*0.38);ctx.fillStyle=m.h;for(const dx of [-0.6,0,0.6])ctx.fillRect(x+dx*r-1,y-r*0.5,2,2)}
      if(g.helm==='gold'){ctx.fillStyle=hit?'#fff':'#c43a2c';ctx.beginPath();ctx.moveTo(x-r*0.18,y-r*0.98);ctx.quadraticCurveTo(x,y-r*1.6,x+r*0.18,y-r*0.98);ctx.fill();ctx.fillStyle=ZMAT.gold.h;for(const dx of [-0.55,0.55]){ctx.beginPath();ctx.moveTo(x+dx*r-2,y-r*0.85);ctx.lineTo(x+dx*r,y-r*1.15);ctx.lineTo(x+dx*r+2,y-r*0.85);ctx.fill()}}
      if(g.horns){ctx.fillStyle=hit?'#fff':'#e8e0cc';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(x+s*r*0.6,y-r*0.6);ctx.quadraticCurveTo(x+s*r*1.45,y-r*0.9,x+s*r*1.2,y-r*0.2);ctx.lineTo(x+s*r*0.95,y-r*0.45);ctx.fill()}}
    }
  }
  // маска плевуна
  if(g.mask){const m=ZMAT[g.mask];ctx.fillStyle=hit?'#fff':m.f;ctx.beginPath();ctx.moveTo(x-r*0.6,y-r*0.15);ctx.lineTo(x,y+r*0.75);ctx.lineTo(x+r*0.6,y-r*0.15);ctx.closePath();ctx.fill();ctx.strokeStyle=m.d;ctx.lineWidth=1.2;ctx.stroke();
    ctx.fillStyle='#1d2a14';ctx.beginPath();ctx.arc(x-r*0.28,y-r*0.05,r*0.14,0,7);ctx.arc(x+r*0.28,y-r*0.05,r*0.14,0,7);ctx.fill();
    if(g.mask==='gold'){ctx.fillStyle=ZMAT.gold.h;ctx.fillRect(x-1,y+r*0.2,2,r*0.4)}}
  // щит со стороны, обращённой к герою
  if(g.shield){const m=ZMAT[g.shield],sa=a+0.85,sx=x+Math.cos(sa)*r*0.95,sy=y+Math.sin(sa)*r*0.95,sr=r*0.58;
    ctx.fillStyle=hit?'#fff':m.f;ctx.beginPath();ctx.arc(sx,sy,sr,0,7);ctx.fill();
    ctx.strokeStyle=g.shield==='wood'?ZMAT.iron.d:m.d;ctx.lineWidth=g.shield==='wood'?1.5:2.2;ctx.stroke();
    if(g.shield==='wood'){ctx.strokeStyle=m.d;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sx-sr*0.85,sy-sr*0.3);ctx.lineTo(sx+sr*0.85,sy-sr*0.3);ctx.moveTo(sx-sr*0.85,sy+sr*0.3);ctx.lineTo(sx+sr*0.85,sy+sr*0.3);ctx.stroke()}
    else{ctx.strokeStyle=m.h;ctx.lineWidth=1;ctx.beginPath();ctx.arc(sx,sy,sr*0.65,0,7);ctx.stroke()}
    ctx.fillStyle=g.shield==='gold'?'#c43a2c':ZMAT[g.shield==='wood'?'iron':'gold'].f;ctx.beginPath();ctx.arc(sx,sy,sr*0.28,0,7);ctx.fill()}
}
