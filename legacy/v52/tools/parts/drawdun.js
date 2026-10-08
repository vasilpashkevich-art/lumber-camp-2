/* ================= ОТРИСОВКА: склепы, портал, подземелье ================= */
function drawCrypt(c,now){
  const x=c.x,y=c.y,sealed=(S.crypts[c.id]||0)>S.day;
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x+3,y+14,36,12,0,0,7);ctx.fill();
  ctx.fillStyle='#55525a';ctx.fillRect(x-30,y-18,60,32);
  ctx.fillStyle='#6a6770';ctx.beginPath();ctx.moveTo(x-34,y-18);ctx.lineTo(x,y-40);ctx.lineTo(x+34,y-18);ctx.fill();
  ctx.fillStyle='#45424a';for(let i=0;i<3;i++)ctx.fillRect(x-30,y-10+i*8,60,1.5);
  ctx.fillStyle=sealed?'#2a2830':'#0e0c12';ctx.beginPath();ctx.moveTo(x-11,y+14);ctx.lineTo(x-11,y-4);ctx.quadraticCurveTo(x,y-14,x+11,y-4);ctx.lineTo(x+11,y+14);ctx.fill();
  if(!sealed){const g=0.4+0.3*Math.sin(now/300+x);ctx.fillStyle=`rgba(180,120,230,${g})`;ctx.beginPath();ctx.arc(x,y+4,6,0,7);ctx.fill()}
  else{ctx.strokeStyle='#8a8478';ctx.lineWidth=2;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(x+i*6,y-6);ctx.lineTo(x+i*6,y+14);ctx.stroke()}}
  ctx.fillStyle='#d8cfb8';ctx.fillRect(x-2,y-36,4,10);ctx.fillRect(x-6,y-32,12,3);
  if(Math.abs(P.x-x)<320&&dist(P.x,P.y,x,y)<320){ctx.font='600 11px Rubik, sans-serif';ctx.textAlign='center';ctx.fillStyle='#c08ae8';ctx.fillText(sealed?`Склеп · запечатан до ${S.crypts[c.id]}-го дня`:'Склеп · нужен ключ',x,y-48)}
}
function drawPortal(p,now){
  const t=now/1000;
  for(let i=3;i>0;i--){ctx.fillStyle=`rgba(${120+i*30},20,${40+i*20},${0.18*i})`;ctx.beginPath();ctx.ellipse(p.x,p.y,34+i*10+Math.sin(t*2+i)*3,48+i*12,0,0,7);ctx.fill()}
  ctx.strokeStyle='#ff6a5a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(p.x,p.y,30,44,0,0,7);ctx.stroke();
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(t*1.5);ctx.strokeStyle='rgba(255,180,160,.6)';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.rotate(2.09);ctx.beginPath();ctx.arc(0,0,18,0,2);ctx.stroke()}ctx.restore();
  ctx.font='700 13px Rubik, sans-serif';ctx.textAlign='center';ctx.fillStyle='#ff8a7a';ctx.fillText('Портал Мора',p.x,p.y-62);
}
function drawDungeon(now){
  const D2=DG,open=dunRects();
  const rect=(r,fill)=>{ctx.fillStyle=fill;ctx.fillRect(r.x,r.y,r.w,r.h)};
  // стены вокруг
  for(const r of D2.rooms)rect({x:r.x-18,y:r.y-18,w:r.w+36,h:r.h+36},'#1a1820');
  for(const c of D2.cors)rect({x:c.x,y:c.y-14,w:c.w,h:c.h+28},'#1a1820');
  for(const r of D2.rooms){rect(r,'#2c2a30');ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;for(let gx=r.x;gx<r.x+r.w;gx+=40){ctx.beginPath();ctx.moveTo(gx,r.y);ctx.lineTo(gx,r.y+r.h);ctx.stroke()}for(let gy=r.y;gy<r.y+r.h;gy+=40){ctx.beginPath();ctx.moveTo(r.x,gy);ctx.lineTo(r.x+r.w,gy);ctx.stroke()}
    ctx.fillStyle='rgba(220,210,190,.18)';for(let k=0;k<5;k++){const bx=r.x+((k*137+r.i*61)%r.w),by=r.y+((k*89+r.i*47)%r.h);ctx.fillRect(bx,by,7,2.5)}
    for(const [tx,ty] of [[r.x+30,r.y+30],[r.x+r.w-30,r.y+30]]){ctx.fillStyle='#4a3424';ctx.fillRect(tx-2,ty-2,4,10);drawFire(tx,ty-2,0.35,now)}}
  for(const c of D2.cors){rect(c,'#29272d');
    if(!D2.rooms[c.i].cleared){ctx.fillStyle='#3a3530';ctx.fillRect(c.x+c.w/2-8,c.y,16,c.h);ctx.strokeStyle='#8a8478';ctx.lineWidth=3;for(let k=0;k<6;k++){const yy=c.y+12+k*(c.h-24)/5;ctx.beginPath();ctx.moveTo(c.x+c.w/2-14,yy);ctx.lineTo(c.x+c.w/2+14,yy);ctx.stroke()}}}
  // ловушки
  for(const t of D2.traps){if(!D2.rooms[t.room].spawned)continue;const armed=t.t>1.8,warn=t.t>1.3;
    ctx.fillStyle=armed?'#7a2a24':warn?'#5a3a2a':'#3a3634';ctx.fillRect(t.x-18,t.y-18,36,36);
    ctx.fillStyle=armed?'#d8d2c0':'#5a5650';for(let i=0;i<3;i++)for(let j=0;j<3;j++){const px=t.x-12+i*12,py=t.y-12+j*12;ctx.beginPath();ctx.moveTo(px-3,py+3);ctx.lineTo(px,py-(armed?8:2));ctx.lineTo(px+3,py+3);ctx.fill()}}
  // вход/выход
  const e=D2.entry;ctx.fillStyle='rgba(159,195,214,.25)';ctx.beginPath();ctx.ellipse(e.x,e.y,22,32,0,0,7);ctx.fill();ctx.strokeStyle='#9fc3d6';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y,22,32,0,0,7);ctx.stroke();
  ctx.font='600 11px Rubik, sans-serif';ctx.textAlign='center';ctx.fillStyle='#9fc3d6';ctx.fillText('Выход',e.x,e.y-40);
  if(D2.chest){const c=D2.chest;ctx.fillStyle='#6b4a2c';ctx.fillRect(c.x-20,c.y-12,40,26);ctx.fillStyle=c.open?'#3a2a1c':'#8a6240';ctx.fillRect(c.x-20,c.y-(c.open?26:20),40,10);ctx.fillStyle='#f4c766';ctx.fillRect(c.x-20,c.y-4,40,3);ctx.fillRect(c.x-3,c.y-8,6,8);
    if(!c.open){const g=0.3+0.2*Math.sin(now/200);ctx.fillStyle=`rgba(244,199,102,${g})`;ctx.beginPath();ctx.arc(c.x,c.y,36,0,7);ctx.fill()}}
  if(D2.exit){const x=D2.exit.x,y=D2.exit.y;ctx.fillStyle='rgba(134,168,92,.3)';ctx.beginPath();ctx.ellipse(x,y,24,34,0,0,7);ctx.fill();ctx.strokeStyle='#86a85c';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,24,34,0,0,7);ctx.stroke();ctx.fillStyle='#86a85c';ctx.fillText('Наружу',x,y-42)}
  // подпись зала
  const cur=roomAt(P.x,P.y);if(cur){ctx.font='600 13px Rubik, sans-serif';ctx.fillStyle='rgba(236,230,211,.5)';ctx.fillText(`Зал ${cur.i+1} из ${D2.rooms.length}${cur.last?' · хранитель':''}`,cur.x+cur.w/2,cur.y+26)}
}
