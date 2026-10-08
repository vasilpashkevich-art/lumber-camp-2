// --- спутник-реликвия по классу (v41): воин — волк с кровотечением, маг — огненный элементаль, лучник — змея с ядом
const PETS={
  warrior:{name:'Дух волка',desc:r=>`Призрачный волк бегает рядом и кусает. Раны кровоточат: до 3 ран на мертвеце, каждая по 3 с. Урон ×${r>1?1.8:1}`},
  mage:{name:'Огненный элементаль',desc:r=>`Парит рядом, бросает огненные шары и поджигает нечисть. Урон ×${r>1?1.8:1}`},
  archer:{name:'Дух змеи',desc:r=>`Быстрая змея кусает ядом: урон со временем и замедление. Урон ×${r>1?1.8:1}`}};
const PET={wolf:{cd:0.7,dmg:0.7,bleed:0.35,stacks:3,bleedT:3,speed:300},snake:{cd:0.6,dmg:0.45,pois:0.6,poisT:4,slow:0.6,slowT:1.5,speed:380},elem:{cd:1.4,dmg:0.8,burn:0.35,range:320,speed:380}};
const petOf=()=>PETS[S.cls]||PETS.warrior;
const PET_ICO={
  mage:'<path d="M16 3c3 5 8 8 7 15-1 6-4 10-7 11-3-1-6-5-7-11-1-7 4-10 7-15z" fill="#ff5a1a" stroke="#8a1a08"/><path d="M16 11c2 3 4 5 3.5 9-.5 3-2 5-3.5 6-1.5-1-3-3-3.5-6-.5-4 1.5-6 3.5-9z" fill="#ffb347"/><ellipse cx="13.6" cy="18" rx="1.6" ry="1" fill="#3a0c04"/><ellipse cx="18.4" cy="18" rx="1.6" ry="1" fill="#3a0c04"/>',
  archer:'<path d="M5 24c4 4 9-2 12-6s7-8 11-5" stroke="#1f4a32" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M5 24c4 4 9-2 12-6s7-8 11-5" stroke="#3f9a62" stroke-width="3.6" fill="none" stroke-linecap="round"/><circle cx="12" cy="22" r="1" fill="#ffd34d"/><circle cx="18" cy="16" r="1" fill="#ffd34d"/><ellipse cx="27" cy="13" rx="4" ry="3" fill="#3f9a62" stroke="#1f4a32"/><circle cx="28" cy="12" r="0.9" fill="#ffd34d"/><path d="M31 13h2l1-1M33 13l1 1" stroke="#cf4b3f"/>'};
function updPet(dt){
  const rw=rl('wolf');if(!rw){RX.wolf=null;RX.pfb.length=0;return}
  const kind=S.cls==='mage'?'elem':S.cls==='archer'?'snake':'wolf',mul=rw>1?1.8:1;
  if(!RX.wolf||RX.wolf.kind!==kind)RX.wolf={kind,x:P.x-30,y:P.y,cd:0,face:0,run:0};
  const W=RX.wolf,K=PET[kind];W.cd-=dt;
  if(dist(W.x,W.y,P.x,P.y)>700){W.x=P.x-30;W.y=P.y}
  const src=kind==='elem'?'ranged':'melee';let foe=null,fd=kind==='elem'?K.range:300;
  for(const z of zombies){const d=dist(z.x,z.y,kind==='elem'?W.x:P.x,kind==='elem'?W.y:P.y);if(d<fd&&canHit(z,src)&&!z.shield){fd=d;foe=z}}
  if(kind==='elem'){
    // парит у плеча героя и бросает огненные шары
    const tx=P.x-Math.cos(P.face)*22+Math.cos(P.face+Math.PI/2)*20,ty=P.y-Math.sin(P.face)*22+Math.sin(P.face+Math.PI/2)*20,d=dist(W.x,W.y,tx,ty);
    W.run=d>6?1:0;if(d>1){const sp=Math.min(460,d*5);W.x+=(tx-W.x)/d*Math.min(d,sp*dt);W.y+=(ty-W.y)/d*Math.min(d,sp*dt)}
    if(foe){W.face=Math.atan2(foe.y-W.y,foe.x-W.x);if(W.cd<=0){W.cd=K.cd;const a=W.face;RX.pfb.push({x:W.x+Math.cos(a)*10,y:W.y-14,vx:Math.cos(a)*K.speed,vy:Math.sin(a)*K.speed,t:1.1,d:relDmg(mul*K.dmg)});sfx.shoot()}}
    else W.face=P.face;
  }else{
    const tx=foe?foe.x:P.x-Math.cos(P.face)*34,ty=foe?foe.y:P.y-Math.sin(P.face)*34,d=dist(W.x,W.y,tx,ty);
    W.run=0;if(d>(foe?foe.r+12:10)){const sp=foe?K.speed:Math.min(K.speed*1.4,d*4);W.x+=(tx-W.x)/d*sp*dt;W.y+=(ty-W.y)/d*sp*dt;W.face=Math.atan2(ty-W.y,tx-W.x);W.run=1}
    else if(foe&&W.cd<=0){W.cd=K.cd;const dm=relDmg(mul*K.dmg);dmgNum(foe.x,foe.y-foe.r-4,dm,false);
      if(kind==='wolf'){burst(foe.x,foe.y,5,['#9fb4c8','#ffffff','#b0201a'],120,0.3,2);foe.bleedN=Math.min(K.stacks,(foe.bleedT>0?foe.bleedN||0:0)+1);foe.bleedT=K.bleedT;foe.bleedDps=Math.max(foe.bleedDps||0,dm*K.bleed)}
      else{burst(foe.x,foe.y,5,['#5fc98a','#c8ff9a'],120,0.3,2);foe.poisT=K.poisT;foe.poisDps=Math.max(foe.poisDps||0,dm*K.pois);foe.slowT=Math.max(foe.slowT||0,K.slowT);foe.slowK=Math.min(foe.slowK||1,K.slow)}
      hitZombie(foe,dm,W.x,W.y,'melee')}
  }
  // огненные шары элементаля
  for(const f of RX.pfb){f.t-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(Math.random()<0.4)burst(f.x,f.y,1,['#ffb347','#ff6a2a'],30,0.25,2.5);
    for(const z of zombies){if(Math.abs(z.x-f.x)>z.r+10||dist(z.x,z.y,f.x,f.y)>z.r+8||!canHit(z,'ranged'))continue;f.t=0;dmgNum(z.x,z.y-z.r-4,f.d,false);if(!z.shield){z.burn=Math.max(z.burn||0,3);z.burnDps=Math.max(z.burnDps||0,f.d*PET.elem.burn)}burst(f.x,f.y,10,['#ffd34d','#ff7a2a'],160,0.4,3);hitZombie(z,f.d,f.x,f.y,'ranged');break}}
  RX.pfb=RX.pfb.filter(f=>f.t>0);
}
// кровотечение и яд: урон со временем
function updDots(dt){for(const z of zombies.slice()){let d=0;
  if(z.bleedT>0){z.bleedT-=dt;d+=(z.bleedN||1)*(z.bleedDps||0)*dt;if(z.bleedT<=0)z.bleedN=0;if(Math.random()<dt*6)parts.push({x:z.x+(Math.random()-0.5)*z.r,y:z.y-z.r*0.3,vx:0,vy:40,t:0.5,m:0.5,c:'#b0201a',s:2.5})}
  if(z.poisT>0){z.poisT-=dt;d+=(z.poisDps||0)*dt}
  if(d>0&&!z.shield&&zombies.includes(z)){z.hp-=d;if(z.hp<=0)killZombie(z)}}}
function drawPet(now){const W=RX.wolf;if(W){const bob=W.run?Math.sin(now/60)*1.5:0;
    if(W.kind==='wolf'){ctx.save();ctx.translate(W.x,W.y+bob);ctx.scale(0.72,0.72);petWolf(ctx,0,0,W.face);ctx.restore()}
    else if(W.kind==='snake'){ctx.save();ctx.translate(W.x,W.y);ctx.scale(0.72,0.72);petSnake(ctx,0,0,W.face,now/(W.run?90:260));ctx.restore()}
    else{const dir=Math.cos(W.face)<0?-1:1,fl=Math.sin(now/300)*2.5;ctx.save();ctx.translate(W.x,W.y);ctx.scale(dir,1);petElem(ctx,0,-14+fl,0.55);ctx.restore()}}
  for(const f of RX.pfb){const g=ctx.createRadialGradient(f.x,f.y,1,f.x,f.y,11);g.addColorStop(0,'rgba(255,240,160,1)');g.addColorStop(0.45,'rgba(255,140,40,.9)');g.addColorStop(1,'rgba(255,60,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(f.x,f.y,11,0,7);ctx.fill()}
  for(const z of zombies){if(z.poisT>0){ctx.strokeStyle='rgba(120,230,120,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(z.x,z.y,z.r+2,0,7);ctx.stroke()}
    if(z.bleedT>0){ctx.fillStyle='rgba(190,25,25,.85)';for(let k=0;k<(z.bleedN||1);k++){ctx.beginPath();ctx.ellipse(z.x-z.r*0.5+k*z.r*0.5,z.y-z.r-6,1.8,2.8,0,0,7);ctx.fill()}}}}
function petWolf(c,x,y,a){c.save();c.translate(x,y);c.rotate(a);c.lineJoin='round';
  c.fillStyle='rgba(126,200,255,.16)';c.beginPath();c.ellipse(2,0,32,18,0,0,7);c.fill();
  c.strokeStyle='#4c6178';c.lineWidth=1.2;
  // хвост
  c.fillStyle='#8fa6bb';c.beginPath();c.moveTo(-13,-3);c.quadraticCurveTo(-28,-9,-35,-1);c.quadraticCurveTo(-28,6,-13,3);c.closePath();c.fill();c.stroke();
  // тело
  c.fillStyle='#9fb4c8';c.beginPath();c.ellipse(-2,0,14,7.5,0,0,7);c.fill();c.stroke();
  c.fillStyle='#b9cad9';c.beginPath();c.ellipse(-3,0,8,3.4,0,0,7);c.fill();
  // голова и вытянутая морда
  c.fillStyle='#a9bdd0';c.beginPath();c.moveTo(7,-5);c.quadraticCurveTo(13,-6.5,17,-4);c.lineTo(27,-1.6);c.quadraticCurveTo(29,0,27,1.6);c.lineTo(17,4);c.quadraticCurveTo(13,6.5,7,5);c.quadraticCurveTo(5,0,7,-5);c.closePath();c.fill();c.stroke();
  c.fillStyle='#d6e2ec';c.beginPath();c.moveTo(18,-2);c.lineTo(26,-0.8);c.lineTo(26,0.8);c.lineTo(18,2);c.closePath();c.fill();
  c.fillStyle='#22303c';c.beginPath();c.arc(28,0,1.6,0,7);c.fill();
  c.fillStyle='#7ec8ff';c.fillRect(15,-3,2.2,1.4);c.fillRect(15,1.6,2.2,1.4);
  // уши: острые, прижаты назад
  for(const sd of [-1,1]){c.fillStyle='#7f96ab';c.beginPath();c.moveTo(13,sd*1.2);c.lineTo(11.5,sd*4.6);c.lineTo(1.5,sd*7.5);c.closePath();c.fill();c.stroke();c.fillStyle='#5a6f84';c.beginPath();c.moveTo(11.5,sd*2);c.lineTo(10.5,sd*4);c.lineTo(5,sd*5.6);c.closePath();c.fill()}
  c.restore()}
function petSnake(c,x,y,a,t=0){c.save();c.translate(x,y);c.rotate(a);c.lineCap='round';c.lineJoin='round';
  const N=26,pts=[];for(let i=0;i<=N;i++){const k=i/N,px=-46+k*46,py=Math.sin(k*7.5+t)*6*(1-k*0.6);pts.push([px,py])}
  const w=k=>1.6+k*5.2;
  c.fillStyle='rgba(95,201,138,.15)';c.beginPath();c.ellipse(-16,0,40,16,0,0,7);c.fill();
  for(const [col,add] of [['#1f4a32',1.4],['#3f9a62',0]]){for(let i=0;i<N;i++){const k=i/N;c.strokeStyle=col;c.lineWidth=(w(k)+add)*2;c.beginPath();c.moveTo(pts[i][0],pts[i][1]);c.lineTo(pts[i+1][0],pts[i+1][1]);c.stroke()}}
  for(let i=1;i<N-1;i++){const k=i/N;c.strokeStyle='#8fe0a8';c.lineWidth=Math.max(0.6,w(k)*0.5);c.beginPath();c.moveTo(pts[i][0],pts[i][1]+w(k)*0.45);c.lineTo(pts[i+1][0],pts[i+1][1]+w(k)*0.45);c.stroke()}
  for(let i=3;i<N-1;i+=3){const k=i/N,[px,py]=pts[i],s2=w(k)*0.75;c.fillStyle='#2a6b44';c.beginPath();c.moveTo(px-s2,py);c.lineTo(px,py-s2*0.8);c.lineTo(px+s2,py);c.lineTo(px,py+s2*0.8);c.closePath();c.fill();c.fillStyle='#ffd34d';c.beginPath();c.arc(px,py,Math.max(0.6,s2*0.22),0,7);c.fill()}
  const [hx,hy]=pts[N];c.translate(hx,hy);
  c.strokeStyle='#cf4b3f';c.lineWidth=1;c.beginPath();c.moveTo(9,0);c.lineTo(14,0);c.lineTo(17,-2);c.moveTo(14,0);c.lineTo(17,2);c.stroke();
  c.fillStyle='#3f9a62';c.strokeStyle='#1f4a32';c.lineWidth=1.3;c.beginPath();c.moveTo(-2,-5.5);c.quadraticCurveTo(6,-7,10,-2);c.quadraticCurveTo(11,0,10,2);c.quadraticCurveTo(6,7,-2,5.5);c.quadraticCurveTo(-4,0,-2,-5.5);c.closePath();c.fill();c.stroke();
  c.fillStyle='#2a6b44';c.beginPath();c.moveTo(0,-2.5);c.lineTo(6,0);c.lineTo(0,2.5);c.closePath();c.fill();
  for(const sd of [-1,1]){c.fillStyle='#ffd34d';c.beginPath();c.ellipse(4,sd*3.6,1.8,1.3,0,0,7);c.fill();c.fillStyle='#111';c.fillRect(3.7,sd*3.6-1,0.7,2)}
  c.restore()}
function petElem(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.lineCap='round';
 let g=c.createRadialGradient(0,-6,4,0,-6,42);g.addColorStop(0,'rgba(255,200,90,.55)');g.addColorStop(.5,'rgba(255,110,30,.22)');g.addColorStop(1,'rgba(255,60,20,0)');c.fillStyle=g;c.beginPath();c.arc(0,-6,42,0,7);c.fill();
 c.fillStyle='rgba(255,120,30,.35)';c.beginPath();c.ellipse(0,30,13,3.5,0,0,7);c.fill();
 const body=()=>{c.beginPath();c.moveTo(-3,25);c.quadraticCurveTo(9,16,9,6);c.quadraticCurveTo(13,-2,9,-7);c.quadraticCurveTo(12,-12,8,-17);c.quadraticCurveTo(7,-24,2,-31);c.quadraticCurveTo(1,-24,-2,-23);c.quadraticCurveTo(-2,-30,-6,-36);c.quadraticCurveTo(-5,-26,-8,-21);c.quadraticCurveTo(-10,-24,-15,-28);c.quadraticCurveTo(-10,-18,-9,-12);c.quadraticCurveTo(-13,-4,-9,4);c.quadraticCurveTo(-6,13,2,15);c.quadraticCurveTo(-4,18,-3,25);c.closePath()};
 const armR=()=>{c.beginPath();c.moveTo(7,-6);c.quadraticCurveTo(15,-9,21,-6);c.quadraticCurveTo(15,-3,8,1);c.closePath()};
 const armL=()=>{c.beginPath();c.moveTo(-7,-5);c.quadraticCurveTo(-14,-2,-20,5);c.quadraticCurveTo(-13,1,-8,2);c.closePath()};
 const layer=(k,col,stroke)=>{for(const f of [armL,armR,body]){c.save();c.translate(0,-4);c.scale(k,k);c.translate(0,4);f();if(stroke){c.strokeStyle=stroke;c.lineWidth=2.6/k;c.stroke()}c.fillStyle=col;c.fill();c.restore()}};
 c.shadowColor='rgba(255,120,30,.9)';c.shadowBlur=12;layer(1,'#ff4a14','#8a1a08');c.shadowBlur=0;
 c.save();c.translate(0,-4);c.scale(.74,.74);c.translate(0,4);body();c.fillStyle='#ff9a2a';c.fill();c.restore();
 c.save();c.translate(0,3);c.scale(.42,.5);c.translate(0,-3);body();c.fillStyle='#ffe27a';c.fill();c.restore();
 c.fillStyle='#ffe27a';c.beginPath();c.ellipse(13,-5.5,4,1.4,-.2,0,7);c.fill();
 for(const [ex,r] of [[-3.5,.35],[3.5,-.35]]){c.fillStyle='#3a0c04';c.beginPath();c.ellipse(ex,-14,2.6,1.5,r,0,7);c.fill();c.fillStyle='#fff4c0';c.beginPath();c.arc(ex+.6,-14.3,.7,0,7);c.fill()}
 c.strokeStyle='#5a1606';c.lineWidth=.9;c.beginPath();c.moveTo(-2.5,-9.5);c.quadraticCurveTo(0,-8,2.5,-9.5);c.stroke();
 const fb=c.createRadialGradient(24,-7,.5,24,-7,7);fb.addColorStop(0,'#fffbe0');fb.addColorStop(.4,'#ffc040');fb.addColorStop(1,'rgba(255,70,20,0)');c.fillStyle=fb;c.beginPath();c.arc(24,-7,7,0,7);c.fill();
 c.fillStyle='rgba(255,200,90,.9)';for(const [ex,ey,r] of [[-9,-40,1.2],[3,-42,1],[-16,-35,.9],[9,-36,1.1],[-1,-47,.8]]){c.beginPath();c.arc(ex,ey,r,0,7);c.fill()}
 c.restore()}
