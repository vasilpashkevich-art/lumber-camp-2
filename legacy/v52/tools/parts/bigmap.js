/* ================= БОЛЬШАЯ КАРТА ================= */
let mapOpen=false;
const BM={s:1,cx:CX,cy:CY,drag:null,el:null,cv:null,c:null,w:0,h:0};
function bmEnsure(){
  if(BM.el)return;
  BM.el=document.getElementById('bigmap');BM.cv=document.getElementById('bmCanvas');BM.c=BM.cv.getContext('2d');
  const cv=BM.cv;
  cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
    const wx=BM.cx+(mx-BM.w/2)/BM.s,wy=BM.cy+(my-BM.h/2)/BM.s;bmZoom(e.deltaY<0?1.25:0.8);
    BM.cx=wx-(mx-BM.w/2)/BM.s;BM.cy=wy-(my-BM.h/2)/BM.s;bmClamp()},{passive:false});
  cv.addEventListener('pointerdown',e=>{BM.drag={x:e.clientX,y:e.clientY,cx:BM.cx,cy:BM.cy};try{cv.setPointerCapture(e.pointerId)}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(!BM.drag)return;BM.cx=BM.drag.cx-(e.clientX-BM.drag.x)/BM.s;BM.cy=BM.drag.cy-(e.clientY-BM.drag.y)/BM.s;bmClamp()});
  const up=()=>{BM.drag=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  document.getElementById('bmClose').addEventListener('click',()=>toggleMap(false));
  document.getElementById('bmIn').addEventListener('click',()=>bmZoom(1.4));
  document.getElementById('bmOut').addEventListener('click',()=>bmZoom(1/1.4));
  document.getElementById('bmMe').addEventListener('click',()=>{const me=bmMe();BM.cx=me.x;BM.cy=me.y;BM.s=Math.max(BM.s,bmFit()*2.2);bmClamp()});
}
const bmFit=()=>Math.min(BM.w,BM.h)/W_SIZE*1.02;
function bmZoom(k){BM.s=Math.max(bmFit(),Math.min(bmFit()*8,BM.s*k));bmClamp()}
function bmClamp(){const hw=BM.w/2/BM.s,hh=BM.h/2/BM.s;BM.cx=Math.max(Math.min(hw,W_SIZE/2),Math.min(W_SIZE-Math.min(hw,W_SIZE/2),BM.cx));BM.cy=Math.max(Math.min(hh,W_SIZE/2),Math.min(W_SIZE-Math.min(hh,W_SIZE/2),BM.cy))}
const bmMe=()=>DG?{x:DG.ex,y:DG.ey}:{x:P.x,y:P.y};
function bmResize(){const r=BM.cv.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);BM.w=Math.max(200,r.width);BM.h=Math.max(200,r.height);BM.cv.width=BM.w*d;BM.cv.height=BM.h*d;BM.d=d}
function toggleMap(force){
  bmEnsure();mapOpen=force===undefined?!mapOpen:force;BM.el.hidden=!mapOpen;
  if(mapOpen){if(menuOpen)toggleMenu(false);keys.clear();actHeld=false;bmResize();BM.s=bmFit();BM.cx=CX;BM.cy=CY;bmClamp();drawBigMap(performance.now())}
}
function drawBigMap(now){
  if(!mapOpen)return;
  const c=BM.c,s=BM.s,W=BM.w,H=BM.h,X=x=>(x-BM.cx)*s+W/2,Y=y=>(y-BM.cy)*s+H/2;
  c.setTransform(BM.d,0,0,BM.d,0,0);c.fillStyle='#070a08';c.fillRect(0,0,W,H);
  // кольца
  c.save();c.beginPath();c.rect(X(0),Y(0),W_SIZE*s,W_SIZE*s);c.clip();
  for(let i=CFG.zones.length-1;i>=0;i--){const z=CFG.zones[i];c.fillStyle=zoneCleared(z)?'#25331d':z.tint;c.beginPath();c.arc(X(CX),Y(CY),z.r1*s,0,7);c.fill();c.strokeStyle='rgba(236,230,211,.18)';c.lineWidth=1;c.stroke()}
  c.fillStyle='#2c2819';c.beginPath();c.arc(X(CX),Y(CY),CFG.zones[0].r0*s,0,7);c.fill();
  // болота и скалы
  for(const p of patches){c.fillStyle=p.kind==='swamp'?'rgba(42,85,80,.85)':'rgba(119,116,107,.6)';c.beginPath();c.arc(X(p.x),Y(p.y),Math.max(2,p.r*s),0,7);c.fill()}
  // деревья и валуны
  const ts=Math.max(1,Math.min(4,s*9));
  for(const t of trees){if(!t.alive)continue;c.fillStyle=t.tier<=2?'rgba(110,150,80,.55)':t.tier<=4?'rgba(90,110,70,.5)':'rgba(120,110,100,.45)';c.fillRect(X(t.x)-ts/2,Y(t.y)-ts/2,ts,ts)}
  for(const r of rocks){if(!r.alive)continue;c.fillStyle=r.iron?'rgba(169,178,191,.8)':'rgba(190,186,175,.6)';c.fillRect(X(r.x)-ts/2,Y(r.y)-ts/2,ts,ts)}
  // логова
  for(const l of lairs){const dead=!!S.bosses[l.zone];c.setLineDash([5,4]);c.strokeStyle=dead?'rgba(134,168,92,.7)':'rgba(207,75,63,.8)';c.lineWidth=1.5;c.beginPath();c.arc(X(l.x),Y(l.y),Math.max(6,ARENA_R*s),0,7);c.stroke();c.setLineDash([]);
    if(!dead){c.fillStyle='rgba(207,75,63,.18)';c.fill()}}
  // дороги
  for(const q of pois){const f=farmOf(q);if(f&&f.road){c.strokeStyle='rgba(180,150,100,.7)';c.lineWidth=2;c.beginPath();c.moveTo(X(CX),Y(CY));c.lineTo(X(q.x),Y(q.y));c.stroke()}}
  // лагерь
  c.strokeStyle=fenceOn()?'#c9a06a':'rgba(201,160,106,.4)';c.lineWidth=2;c.beginPath();c.arc(X(CX),Y(CY),Math.max(5,CFG.fenceR*s),0,7);c.stroke();
  c.fillStyle='#e98b3d';c.beginPath();c.arc(X(CX),Y(CY),6,0,7);c.fill();
  c.restore();
  // значки и подписи
  const L=[];const lab=(x,y,t,col,sub,bold)=>L.push({x:X(x),y:Y(y),t,col,sub,bold});
  const icon=(x,y,col,sh,sz=7)=>{const sx=X(x),sy=Y(y);c.fillStyle=col;c.strokeStyle='#000';c.lineWidth=1.5;c.beginPath();
    if(sh==='sq')c.rect(sx-sz/2,sy-sz/2,sz,sz);else if(sh==='di'){c.moveTo(sx,sy-sz*0.75);c.lineTo(sx+sz*0.75,sy);c.lineTo(sx,sy+sz*0.75);c.lineTo(sx-sz*0.75,sy)}
    else if(sh==='house'){c.moveTo(sx-sz/2,sy+sz/2);c.lineTo(sx-sz/2,sy-sz*0.1);c.lineTo(sx,sy-sz*0.7);c.lineTo(sx+sz/2,sy-sz*0.1);c.lineTo(sx+sz/2,sy+sz/2)}
    else c.arc(sx,sy,sz/2,0,7);c.closePath();c.stroke();c.fill()};
  for(const z of CFG.zones){const r=(z.r0+Math.min(z.r1,2200))/2,a=-Math.PI/2;lab(CX+Math.cos(a)*r,CY+Math.sin(a)*r,z.name,zoneCleared(z)?'#9fc07a':'rgba(236,230,211,.75)',`${CFG.trees[z.tree].name} · топор ${CFG.trees[z.tree].axe}+${zoneCleared(z)?' · очищена':''}`,true)}
  lab(CX,CY+CFG.fenceR+16,'Лагерь','#e98b3d',HQ_SKINS[S.base]);
  for(const l of lairs){const dead=!!S.bosses[l.zone];icon(l.x,l.y,dead?'#86a85c':'#ff4a3a','di',11);lab(l.x,l.y+16,CFG.bosses[l.zone].name,dead?'#9fc07a':'#ff7a6a',dead?'повержен':'логово босса')}
  for(const q of pois){const f=farmOf(q);
    if(f){icon(q.x,q.y,f.broken?'#cf4b3f':'#86a85c','house',10);lab(q.x,q.y+14,'Хутор',f.broken?'#e07070':'#9fc07a',f.broken?'разрушен':`ур. ${f.lvl} · ${f.mode==='stone'?'камень':'дерево'}`)}
    else if(!S.poi[q.id]){icon(q.x,q.y,'#f4c766','house',9);lab(q.x,q.y+14,q.kind==='hut'?'Хижина':'Руины','#f4c766','можно восстановить')}}
  for(const m of mounds){if(m.dead)continue;icon(m.x,m.y,'#a06ad0','sq',8);if(s>bmFit()*1.6)lab(m.x,m.y+12,'Могильник','#c39be0')}
  for(const k of crypts){const cd=(S.crypts[k.id]||0)>S.day;icon(k.x,k.y,cd?'#5a4a6a':'#c08ae8','sq',10);lab(k.x,k.y+14,'Склеп',cd?'#8a7a9a':'#d6aef0',cd?'закрыт до следующего дня':`ключей: ${S.keys}`)}
  {const pp=portalPos();if(pp&&allCleared()&&!S.final.killed){icon(pp.x,pp.y,'#ff4a3a','ci',12+2*Math.sin(now/200));lab(pp.x,pp.y+18,'Портал Мора','#ff7a6a','финальная битва')}}
  for(const r of refugees){icon(r.x,r.y,'#9fc3d6','ci',6)}
  for(const z of zombies){if(z.boss)continue;const sx=X(z.x),sy=Y(z.y);c.fillStyle=z.wave?'#ff5a4a':'rgba(207,75,63,.55)';const zz=z.wave?3.5:2.5;c.fillRect(sx-zz/2,sy-zz/2,zz,zz)}
  for(const z of zombies){if(!z.boss)continue;icon(z.x,z.y,'#ff4a3a','ci',10)}
  // подписи без наложений
  c.textAlign='center';c.textBaseline='top';const placed=[];
  for(const l of L){const fs=l.bold?13:11;c.font=`${l.bold?600:500} ${fs}px Rubik, sans-serif`;const w=Math.max(c.measureText(l.t).width,l.sub?c.measureText(l.sub).width*0.9:0)+6,h=l.sub?fs+13:fs+2;
    const box={x:l.x-w/2,y:l.y,w,h};if(placed.some(b=>b.x<box.x+box.w&&box.x<b.x+b.w&&b.y<box.y+box.h&&box.y<b.y+b.h))continue;placed.push(box);
    if(box.x>W||box.x+w<0||box.y>H||box.y+h<0)continue;
    c.fillStyle='rgba(7,10,8,.6)';c.fillRect(box.x,box.y-1,w,h);
    c.fillStyle=l.col;c.fillText(l.t,l.x,l.y);if(l.sub){c.font=`400 ${fs-1}px Rubik, sans-serif`;c.fillStyle='rgba(236,230,211,.6)';c.fillText(l.sub,l.x,l.y+fs+1)}}
  // герой
  const me=bmMe(),px=X(me.x),py=Y(me.y),pa=DG?-Math.PI/2:P.face,pu=1+0.15*Math.sin(now/180);
  c.fillStyle='rgba(236,230,211,.18)';c.beginPath();c.arc(px,py,14*pu,0,7);c.fill();
  c.save();c.translate(px,py);c.rotate(pa);c.fillStyle='#ece6d3';c.strokeStyle='#000';c.lineWidth=1.5;c.beginPath();c.moveTo(9,0);c.lineTo(-6,-6);c.lineTo(-3,0);c.lineTo(-6,6);c.closePath();c.fill();c.stroke();c.restore();
  c.font='600 12px Rubik, sans-serif';c.fillStyle='#ece6d3';c.textBaseline='bottom';c.fillText(DG?'Вы (в склепе)':'Вы',px,py-14);
  c.textBaseline='alphabetic';
}
