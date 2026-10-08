function drawCrypt(c,now){
  const x=c.x,y=c.y;
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x+3,y+18,46,14,0,0,7);ctx.fill();
  ctx.fillStyle='#55525a';ctx.fillRect(x-38,y-22,76,40);
  ctx.fillStyle='#6a6770';ctx.beginPath();ctx.moveTo(x-44,y-22);ctx.lineTo(x,y-50);ctx.lineTo(x+44,y-22);ctx.fill();
  ctx.fillStyle='#45424a';for(let i=0;i<4;i++)ctx.fillRect(x-38,y-14+i*8,76,1.5);
  ctx.fillStyle='#0e0c12';ctx.beginPath();ctx.moveTo(x-13,y+18);ctx.lineTo(x-13,y-4);ctx.quadraticCurveTo(x,y-16,x+13,y-4);ctx.lineTo(x+13,y+18);ctx.fill();
  const g=0.4+0.3*Math.sin(now/300+x);ctx.fillStyle=`rgba(180,120,230,${g})`;ctx.beginPath();ctx.arc(x,y+5,7,0,7);ctx.fill();
  for(const s of [-1,1]){ctx.fillStyle='#4a3424';ctx.fillRect(x+s*48-2,y-6,4,12);drawFire(x+s*48,y-6,0.35,now)}
  ctx.fillStyle='#d8cfb8';ctx.fillRect(x-2,y-46,4,12);ctx.fillRect(x-7,y-41,14,3);
  if(Math.abs(P.x-x)<360&&dist(P.x,P.y,x,y)<360)labels.push(()=>{ctx.textAlign='center';ctx.font='700 13px Rubik, sans-serif';const t1='Склеп',t2=`пройдено: ${S.cryptRuns||0} · сложность ${cryptDiff()} · ключей: ${S.keys}`;
    ctx.fillStyle='rgba(14,19,15,.8)';const w=Math.max(ctx.measureText(t2).width,60)+16;ctx.fillRect(x-w/2,y-88,w,34);ctx.strokeStyle='#c08ae8';ctx.lineWidth=1;ctx.strokeRect(x-w/2,y-88,w,34);
    ctx.fillStyle='#e0c0ff';ctx.fillText(t1,x,y-74);ctx.font='500 11px Rubik, sans-serif';ctx.fillStyle='#c9c2b0';ctx.fillText(t2,x,y-60)});
}
function pathPiece(p){if(p.c){ctx.moveTo(p.x+p.r,p.y);ctx.arc(p.x,p.y,p.r,0,6.2832);return}
  if(p.o){const x=p.x-p.hw,y=p.y-p.hh,w=p.hw*2,h=p.hh*2,k=p.k;ctx.moveTo(x+k,y);ctx.lineTo(x+w-k,y);ctx.lineTo(x+w,y+k);ctx.lineTo(x+w,y+h-k);ctx.lineTo(x+w-k,y+h);ctx.lineTo(x+k,y+h);ctx.lineTo(x,y+h-k);ctx.lineTo(x,y+k);ctx.closePath();return}
  ctx.rect(p.x,p.y,p.w,p.h)}
const HALL_FLOOR={slime:'#2e3a28',treant:'#323826',hydra:'#26363a',croc:'#24302a',dragon:'#3a2622',golem:'#302c2a',lich:'#22282a',yeti:'#3c4a56'};
function drawHallTheme(r,now){const sk=DG.skin,rnd=mulberry(DG.seed+r.i),t=now/1000,cx=r.x+r.w/2,cy=DUN.Y;
  const pts=[];for(let i=0;i<40;i++){let x=0,y=0;for(let g=0;g<10;g++){x=r.x+40+rnd()*(r.w-80);y=r.y+40+rnd()*(r.h-80);if(r.pieces.some(p=>inPiece(p,x,y,20)))break}pts.push({x,y,s:rnd(),a:rnd()*6.28})}
  if(sk==='slime'){for(const p of pts.slice(0,20)){ctx.fillStyle=`rgba(110,190,80,${0.25+p.s*0.3})`;ctx.beginPath();ctx.ellipse(p.x,p.y,12+p.s*24,7+p.s*12,p.a,0,7);ctx.fill()}
    for(const p of pts.slice(20,30)){ctx.fillStyle='rgba(190,240,150,.7)';ctx.beginPath();ctx.ellipse(p.x,p.y,7,9,0,0,7);ctx.fill();ctx.strokeStyle='rgba(60,110,40,.8)';ctx.lineWidth=1;ctx.stroke()}
    for(const p of pts.slice(30,36)){ctx.fillStyle='#4f7a3a';ctx.beginPath();ctx.ellipse(p.x,p.y,14,7,p.a,0,7);ctx.fill()}}
  else if(sk==='treant'){ctx.strokeStyle='#4a3424';ctx.lineCap='round';for(let k=0;k<12;k++){const a=k/12*6.283;ctx.lineWidth=10-k%3*2;ctx.beginPath();ctx.moveTo(cx,cy);let x=cx,y=cy;for(let s=0;s<5;s++){x+=Math.cos(a+(rnd()-0.5)*0.8)*48;y+=Math.sin(a+(rnd()-0.5)*0.8)*48;ctx.lineTo(x,y)}ctx.stroke()}
    for(const p of pts.slice(0,22)){ctx.fillStyle=`rgba(90,140,60,${0.3+p.s*0.4})`;ctx.beginPath();ctx.arc(p.x,p.y,4+p.s*10,0,7);ctx.fill()}
    for(const p of pts.slice(22,30)){const g=ctx.createRadialGradient(p.x,p.y,1,p.x,p.y,14);g.addColorStop(0,`rgba(180,255,200,${0.6+0.3*Math.sin(t*2+p.a)})`);g.addColorStop(1,'rgba(180,255,200,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,14,0,7);ctx.fill()}}
  else if(sk==='hydra'||sk==='croc'){for(const p of pts.slice(0,8)){ctx.fillStyle='rgba(30,60,64,.8)';ctx.beginPath();ctx.ellipse(p.x,p.y,24+p.s*30,14+p.s*14,p.a,0,7);ctx.fill();ctx.fillStyle='rgba(120,170,160,.2)';ctx.beginPath();ctx.ellipse(p.x-8,p.y-4,12,5,0.2,0,7);ctx.fill()}
    ctx.strokeStyle='#8a8a50';ctx.lineWidth=1.5;for(const p of pts.slice(8,26)){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+(p.s-0.5)*6,p.y-12);ctx.stroke()}
    for(const p of pts.slice(26,32)){ctx.fillStyle='#e0d8c4';ctx.fillRect(p.x,p.y,12,3)}}
  else if(sk==='dragon'){ctx.fillStyle='rgba(120,20,10,.22)';r.pieces.forEach(p=>{ctx.beginPath();pathPiece(p);ctx.fill()});
    ctx.strokeStyle=`rgba(255,${120+Math.sin(t*3)*40},40,.9)`;ctx.lineWidth=3;for(const p of pts.slice(0,10)){ctx.beginPath();ctx.moveTo(p.x,p.y);let x=p.x,y=p.y;for(let s=0;s<4;s++){x+=Math.cos(p.a+s)*24;y+=Math.sin(p.a+s*0.7)*24;ctx.lineTo(x,y)}ctx.stroke()}
    for(const p of pts.slice(10,24)){ctx.fillStyle='#1a1418';ctx.beginPath();ctx.moveTo(p.x,p.y-14-p.s*10);ctx.lineTo(p.x+8,p.y+6);ctx.lineTo(p.x-8,p.y+6);ctx.fill()}
    const gp=pts[24];ctx.fillStyle='#d8b44a';ctx.beginPath();ctx.ellipse(gp.x,gp.y,40,22,0,0,7);ctx.fill();ctx.fillStyle='#f4e27a';for(let k=0;k<14;k++){ctx.beginPath();ctx.arc(gp.x-30+((k*37)%60),gp.y-10+((k*23)%20),3,0,7);ctx.fill()}}
  else if(sk==='golem'){for(const p of pts.slice(0,14)){ctx.fillStyle='#141218';ctx.beginPath();ctx.moveTo(p.x,p.y-12-p.s*10);ctx.lineTo(p.x+6,p.y+4);ctx.lineTo(p.x-6,p.y+4);ctx.fill()}
    for(const p of pts.slice(14,18)){ctx.fillStyle='#3a3632';ctx.beginPath();ctx.arc(p.x,p.y,10,0,7);ctx.fill();drawFire(p.x,p.y+2,0.4,now)}
    for(const p of pts.slice(18,36)){ctx.fillStyle=`rgba(255,${130+Math.sin(t*5+p.a*9)*60},40,${0.5+0.4*Math.sin(t*3+p.a*7)})`;ctx.fillRect(p.x,p.y,2,2)}}
  else if(sk==='lich'){for(const p of pts.slice(0,12)){ctx.fillStyle='#6a6862';if(p.s>0.5){ctx.fillRect(p.x-1.5,p.y-14,3,16);ctx.fillRect(p.x-6,p.y-10,12,3)}else{ctx.beginPath();ctx.moveTo(p.x-6,p.y+2);ctx.lineTo(p.x-6,p.y-8);ctx.quadraticCurveTo(p.x,p.y-15,p.x+6,p.y-8);ctx.lineTo(p.x+6,p.y+2);ctx.fill()}}
    for(const p of pts.slice(12,20)){ctx.fillStyle='rgba(220,210,190,.5)';ctx.fillRect(p.x-5,p.y,10,2)}
    for(const p of pts.slice(20,30)){ctx.fillStyle=`rgba(120,230,150,${0.08+0.06*Math.sin(t+p.a*4)})`;ctx.beginPath();ctx.ellipse(p.x+Math.sin(t*0.5+p.a)*10,p.y,34,12,0,0,7);ctx.fill()}}
  else if(sk==='yeti'){for(const p of pts.slice(0,14)){ctx.fillStyle='rgba(150,200,235,.65)';ctx.beginPath();ctx.moveTo(p.x,p.y-14-p.s*12);ctx.lineTo(p.x+7,p.y+4);ctx.lineTo(p.x-7,p.y+4);ctx.fill()}
    for(const p of pts.slice(14,22)){ctx.fillStyle='#f6faff';ctx.beginPath();ctx.ellipse(p.x,p.y,22,8,0.2,0,7);ctx.fill()}
    for(const p of pts.slice(22,36)){ctx.fillStyle=`rgba(255,255,255,${0.4+0.4*Math.sin(t*3+p.a*9)})`;ctx.fillRect(p.x,p.y+((t*14+p.a*50)%16),2,2)}}
}
function drawDungeon(now){
  const D2=DG;
  ctx.fillStyle='#07090a';ctx.fillRect(DUN.X-400,DUN.Y-900,(D2.rooms.at(-1).x+D2.rooms.at(-1).w+400)-(DUN.X-400),1800);
  // стены
  ctx.lineJoin='round';
  for(const r of D2.rooms){ctx.beginPath();r.pieces.forEach(pathPiece);ctx.strokeStyle='#1a1d20';ctx.lineWidth=40;ctx.stroke()}
  for(const c of D2.cors){ctx.fillStyle='#1a1d20';ctx.fillRect(c.x-10,c.y-18,c.w+20,c.h+36)}
  // полы
  for(const r of D2.rooms){ctx.save();ctx.beginPath();r.pieces.forEach(pathPiece);ctx.clip();
    ctx.fillStyle=r.last?(HALL_FLOOR[D2.skin]||'#2c2a30'):'#2c2a30';ctx.fillRect(r.x,r.y,r.w,r.h);
    ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;for(let gx=r.x;gx<r.x+r.w;gx+=40){ctx.beginPath();ctx.moveTo(gx,r.y);ctx.lineTo(gx,r.y+r.h);ctx.stroke()}for(let gy=r.y;gy<r.y+r.h;gy+=40){ctx.beginPath();ctx.moveTo(r.x,gy);ctx.lineTo(r.x+r.w,gy);ctx.stroke()}
    if(r.last)drawHallTheme(r,now);
    else{ctx.fillStyle='rgba(220,210,190,.16)';for(let k=0;k<6;k++){const bx=r.x+((k*137+r.i*61)%r.w),by=r.y+((k*89+r.i*47)%r.h);ctx.fillRect(bx,by,7,2.5)}}
    ctx.restore();
    ctx.beginPath();r.pieces.forEach(pathPiece);ctx.strokeStyle='#4a4f56';ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle='#7a7f86';ctx.lineWidth=1.5;ctx.stroke();
    for(const c of r.cols){ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.arc(c.x+4,c.y+5,c.r,0,7);ctx.fill();ctx.fillStyle='#5a5f66';ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,7);ctx.fill();ctx.fillStyle='#7a7f86';ctx.beginPath();ctx.arc(c.x-3,c.y-3,c.r*0.5,0,7);ctx.fill()}
    const tops=r.shape==='round'?[[r.x+r.w*0.2,r.y+r.h*0.14],[r.x+r.w*0.8,r.y+r.h*0.14]]:r.shape==='oct'?[[r.x+r.w*0.32,r.y+18],[r.x+r.w*0.68,r.y+18],[r.x+r.w*0.32,r.y+r.h-18],[r.x+r.w*0.68,r.y+r.h-18]]:r.shape==='cross'?[[r.x+r.w*0.4,r.y+18],[r.x+r.w*0.6,r.y+18]]:[[r.x+30,r.y+26],[r.x+r.w-30,r.y+26]];
    for(const [tx,ty] of tops){const g=ctx.createRadialGradient(tx,ty,2,tx,ty,70);g.addColorStop(0,'rgba(255,170,80,.28)');g.addColorStop(1,'rgba(255,170,80,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(tx,ty,70,0,7);ctx.fill();ctx.fillStyle='#4a3424';ctx.fillRect(tx-2,ty-2,4,10);drawFire(tx,ty-2,0.35,now)}}
  for(const c of D2.cors){ctx.fillStyle='#29272d';ctx.fillRect(c.x,c.y,c.w,c.h);
    if(!D2.rooms[c.i].cleared){ctx.fillStyle='#3a3530';ctx.fillRect(c.x+c.w/2-8,c.y,16,c.h);ctx.strokeStyle='#8a8478';ctx.lineWidth=3;for(let k=0;k<6;k++){ctx.beginPath();ctx.moveTo(c.x+c.w/2-12+k*5,c.y);ctx.lineTo(c.x+c.w/2-12+k*5,c.y+c.h);ctx.stroke()}}}
  // ловушки
  for(const t of D2.traps){if(!D2.rooms[t.room].spawned)continue;const armed=t.t>1.8,warn=t.t>1.3;
    ctx.fillStyle=armed?'#7a2a24':warn?'#5a3a2a':'#3a3634';ctx.fillRect(t.x-18,t.y-18,36,36);
    ctx.fillStyle=armed?'#d8d2c0':'#5a5650';for(let i=0;i<3;i++)for(let j=0;j<3;j++){const px=t.x-12+i*12,py=t.y-12+j*12;ctx.beginPath();ctx.moveTo(px-3,py+3);ctx.lineTo(px,py-(armed?6:2));ctx.lineTo(px+3,py+3);ctx.fill()}}
  // опасные места фаз
  for(const h of D2.hz){if(h.warn>0){const k=1-h.warn/1.1;ctx.fillStyle=`rgba(${h.col},${0.12+k*0.25})`;ctx.beginPath();ctx.arc(h.x,h.y,h.r,0,7);ctx.fill();ctx.strokeStyle=`rgba(${h.col},.9)`;ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.arc(h.x,h.y,h.r,0,7);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(h.x,h.y,h.r*k,0,7);ctx.stroke()}
    else if(h.kind==='pool'){ctx.fillStyle=`rgba(${h.col},${Math.min(0.55,h.life*0.3)})`;ctx.beginPath();ctx.ellipse(h.x,h.y,h.r,h.r*0.8,0,0,7);ctx.fill()}
    else{ctx.fillStyle=`rgba(${h.col},${h.life*2})`;ctx.beginPath();ctx.arc(h.x,h.y,h.r*(1.2-h.life),0,7);ctx.fill()}}
  // щит босса
  const B=D2.boss;if(B&&B.shield&&zombies.includes(B)){ctx.fillStyle='rgba(126,200,255,.16)';ctx.beginPath();ctx.arc(B.x,B.y,B.r+22,0,7);ctx.fill();ctx.strokeStyle='rgba(126,200,255,.85)';ctx.lineWidth=3;ctx.setLineDash([8,5]);ctx.beginPath();ctx.arc(B.x,B.y,B.r+22,performance.now()/600,performance.now()/600+6.283);ctx.stroke();ctx.setLineDash([])}
  // вход/выход
  const e=D2.entry;ctx.fillStyle='rgba(159,195,214,.25)';ctx.beginPath();ctx.ellipse(e.x,e.y,22,32,0,0,7);ctx.fill();ctx.strokeStyle='#9fc3d6';ctx.lineWidth=2;ctx.stroke();
  ctx.font='600 11px Rubik, sans-serif';ctx.textAlign='center';ctx.fillStyle='#9fc3d6';ctx.fillText('Выход',e.x,e.y-40);
  if(D2.chest){const c=D2.chest;ctx.fillStyle='#6b4a2c';ctx.fillRect(c.x-20,c.y-12,40,26);ctx.fillStyle=c.open?'#3a2a1c':'#8a6240';ctx.fillRect(c.x-20,c.y-18,40,10);ctx.fillStyle='#f4c766';ctx.fillRect(c.x-3,c.y-8,6,6);
    if(!c.open){const g=0.3+0.2*Math.sin(now/200);ctx.fillStyle=`rgba(244,199,102,${g})`;ctx.beginPath();ctx.arc(c.x,c.y,36,0,7);ctx.fill()}}
  if(D2.exit){const x=D2.exit.x,y=D2.exit.y;ctx.fillStyle='rgba(134,168,92,.3)';ctx.beginPath();ctx.ellipse(x,y,24,34,0,0,7);ctx.fill();ctx.strokeStyle='#86a85c';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,24,34,0,0,7);ctx.stroke();ctx.fillStyle='#86a85c';ctx.fillText('Наружу',x,y-42)}
  const cur=roomAt(P.x,P.y);if(cur&&!cur.last){ctx.font='600 13px Rubik, sans-serif';ctx.fillStyle='rgba(236,230,211,.5)';ctx.fillText(`Зал ${cur.i+1} из ${D2.rooms.length}`,cur.x+cur.w/2,cur.y+26)}
}
// экранная панель боя с боссом склепа
function drawCryptHud(){
  if(!DG)return;ctx.setTransform(DPR,0,0,DPR,0,0);const B=DG.boss,cx=VW/2;
  ctx.textAlign='center';
  ctx.fillStyle='rgba(14,19,15,.78)';ctx.fillRect(10,VH-34,300,24);ctx.font='600 12px Rubik, sans-serif';ctx.fillStyle='#e0c0ff';ctx.textAlign='left';ctx.fillText(`Склеп · пройдено ${S.cryptRuns||0} · сложность ${DG.diff}`,20,VH-17);ctx.textAlign='center';
  if(B&&zombies.includes(B)){const y=134,w=Math.min(420,VW-40);
    ctx.fillStyle='rgba(14,19,15,.85)';ctx.fillRect(cx-w/2-10,y,w+20,56);
    ctx.font='700 14px Rubik, sans-serif';ctx.fillStyle='#f2b8b0';ctx.fillText(B.name,cx,y+17);
    const seg=(w-8)/3,f=Math.max(0,B.hp/B.max);for(let i=0;i<3;i++){const sx=cx-w/2+i*(seg+4),part=Math.max(0,Math.min(1,(f-(2-i)/3)*3));ctx.fillStyle='#000';ctx.fillRect(sx,y+24,seg,8);ctx.fillStyle=B.shield?'#7ec8ff':'#cf4b3f';ctx.fillRect(sx,y+24,seg*part,8)}
    ctx.font='700 13px Rubik, sans-serif';ctx.fillStyle='#ffd34d';ctx.fillText(`Фаза ${B.phase} из 3: ${B.ph_.n}`,cx,y+49);
    ctx.fillStyle='rgba(14,19,15,.85)';ctx.font='13px Rubik, sans-serif';const hw=ctx.measureText(B.ph_.h).width+24;ctx.fillRect(cx-hw/2,VH-80,hw,28);ctx.fillStyle='#ece6d3';ctx.fillText(B.ph_.h,cx,VH-61)}
  if(DG.banner){const a=Math.min(1,DG.banner.t);ctx.globalAlpha=a;ctx.font='800 34px Rubik, sans-serif';ctx.lineWidth=6;ctx.strokeStyle='rgba(0,0,0,.8)';ctx.strokeText(DG.banner.text,cx,VH*0.38);ctx.fillStyle='#ffd34d';ctx.fillText(DG.banner.text,cx,VH*0.38);ctx.globalAlpha=1}
}
