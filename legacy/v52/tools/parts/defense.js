// --- оборона лагеря (v41): ров, ловушки, баллисты, огненные чаши, стража по уровням, мастерская
const DEF={
  moat: {base:3,max:3,cost:[C(300,80),C(900,250),C(2000,600)],slow:[1,0.6,0.45,0.3],w:[0,22,30,38]},
  traps:{base:3,max:3,cost:[C(200,40),C(600,150),C(1400,400)],n:[0,8,14,20],dmg:[0,10,25,50],uses:12,slow:2,cd:1.5,fix:2,ring:95},
  ball: {base:4,max:4,slots:2,cost:l=>C(Math.round(150*1.8**l),Math.round(50*1.8**l)),dmg:[0,20,40,70,110],cd:3,range:420,w:16},
  bowl: {base:5,max:3,slots:b=>b>=6?4:b>=5?2:0,cost:l=>C(Math.round(120*1.8**l),Math.round(40*1.8**l)),dps:[0,4,8,14],cd:4,range:240,r:55},
  guard:{base:4,max:4,cost:[null,null,C(300,80),C(800,250),C(1800,600)],mul:[0,1,1.6,2.4,3.5],range:[0,190,215,235,255],cd:[0,1.3,1.15,1,0.9],
    names:['','Ополченцы в коже','Стрелки','Латники','Золотая гвардия'],body:['','#5a4a3a','#3e5a3a','#4a5a6a','#5a3a7a'],helm:['','#7a5a3a','#55663a','#a9b0b8','#d8b44a']},
  shop: {base:4,max:3,cost:[C(500,200),C(1000,400),C(2000,800)],rate:[0,0.004,0.007,0.01],x:81,y:135}
};
const BALL_ANG=[0,Math.PI],BOWL_ANG=[-Math.PI/3,-2*Math.PI/3,Math.PI/3,2*Math.PI/3];
const ballPos=i=>({x:CX+Math.cos(BALL_ANG[i])*CFG.fenceR,y:CY+Math.sin(BALL_ANG[i])*CFG.fenceR,a:BALL_ANG[i]});
const bowlPos=i=>({x:CX+Math.cos(BOWL_ANG[i])*CFG.fenceR,y:CY+Math.sin(BOWL_ANG[i])*CFG.fenceR,a:BOWL_ANG[i]});
const trapPos=i=>{const n=DEF.traps.n[S.def.traps],a=i/n*6.283+0.13,r=CFG.fenceR+DEF.traps.ring+((i*37)%3)*8;return {x:CX+Math.cos(a)*r,y:CY+Math.sin(a)*r,k:i%2}};
const guardLvl=()=>Math.max(1,Math.min(4,S.def.guard|0));
const moatIn=(z,dC)=>{const l=S.def.moat;return l>0&&!z.fly&&dC>CFG.fenceR+4&&dC<CFG.fenceR+8+DEF.moat.w[l]};
// замедление мертвеца: ров, ловушка, яд спутника
function zSlow(z,dC,dt){let k=1;if(z.slowT>0){z.slowT-=dt;k*=z.slowK||0.5}else z.slowK=0;if(moatIn(z,dC))k*=DEF.moat.slow[S.def.moat];return k}
const DFX=[],DST={ball:[{cd:0,a:0},{cd:0,a:Math.PI}],bowl:[0,0,0,0].map(()=>({cd:0})),trap:[],shop:0};
function updateDefense(dt){
  if(DG)return;
  // ловушки
  const nt=DEF.traps.n[S.def.traps];
  for(let i=0;i<nt;i++){if(!(S.def.tu[i]>0))continue;const st=DST.trap[i]||(DST.trap[i]={cd:0,snap:0});st.cd-=dt;st.snap=Math.max(0,st.snap-dt);if(st.cd>0)continue;
    const tp=trapPos(i);for(const z of zombies){if(z.fly||z.boss||Math.abs(z.x-tp.x)>30||dist(z.x,z.y,tp.x,tp.y)>12+z.r*0.6)continue;
      st.cd=DEF.traps.cd;st.snap=0.35;S.def.tu[i]--;z.slowT=Math.max(z.slowT||0,DEF.traps.slow);z.slowK=Math.min(z.slowK||1,0.5);
      dmgNum(z.x,z.y-z.r-4,DEF.traps.dmg[S.def.traps],false);burst(tp.x,tp.y,6,['#cfd8de','#8a6a43','#6a1f1f'],120,0.35,2.5);hitZombie(z,DEF.traps.dmg[S.def.traps],tp.x,tp.y,'trap');
      if(S.def.tu[i]===0&&dist(tp.x,tp.y,P.x,P.y)<600)addFloat(tp.x,tp.y-14,'ловушка сломана','#c9a06a');break}}
  // баллисты: тяжёлый болт насквозь по линии
  for(let i=0;i<DEF.ball.slots;i++){const l=S.def.ball[i];if(!l||S.base<DEF.ball.base)continue;const st=DST.ball[i],bp=ballPos(i);st.cd-=dt;if(st.cd>0)continue;
    let best=null,bd=DEF.ball.range;for(const z of zombies){if(Math.abs(z.x-bp.x)>bd||!canHit(z,'ranged'))continue;const d=dist(z.x,z.y,bp.x,bp.y);if(d<bd&&d>30){bd=d;best=z}}
    if(!best)continue;st.cd=DEF.ball.cd;st.a=Math.atan2(best.y-bp.y,best.x-bp.x);const ex=bp.x+Math.cos(st.a)*DEF.ball.range,ey=bp.y+Math.sin(st.a)*DEF.ball.range;
    DFX.push({k:'bolt',x1:bp.x,y1:bp.y,x2:ex,y2:ey,t:0.3});if(dist(bp.x,bp.y,P.x,P.y)<600)sfx.tower();
    const vx=Math.cos(st.a),vy=Math.sin(st.a);
    for(const z of zombies.slice()){const rx=z.x-bp.x,ry=z.y-bp.y,along=rx*vx+ry*vy;if(along<0||along>DEF.ball.range)continue;if(Math.abs(rx*vy-ry*vx)>DEF.ball.w+z.r||!canHit(z,'ranged'))continue;
      const d=DEF.ball.dmg[l]*(1+0.12*pr('eng'));dmgNum(z.x,z.y-z.r-4,d,false);hitZombie(z,d,bp.x,bp.y,'ranged')}}
  // огненные чаши: поджигают гущу толпы
  const nb=DEF.bowl.slots(S.base);
  for(let i=0;i<nb;i++){const l=S.def.bowl[i];if(!l)continue;const st=DST.bowl[i],bp=bowlPos(i);st.cd-=dt;if(st.cd>0)continue;
    let best=null,bn=0;for(const z of zombies){if(Math.abs(z.x-bp.x)>DEF.bowl.range||dist(z.x,z.y,bp.x,bp.y)>DEF.bowl.range)continue;let n=0;for(const o of zombies)if(Math.abs(o.x-z.x)<DEF.bowl.r&&dist(o.x,o.y,z.x,z.y)<DEF.bowl.r)n++;if(n>bn){bn=n;best=z}}
    if(!best)continue;st.cd=DEF.bowl.cd;const fx=best.x,fy=best.y;DFX.push({k:'lob',x1:bp.x,y1:bp.y-10,x2:fx,y2:fy,t:0.35,m:0.35});DFX.push({k:'fire',x:fx,y:fy,t:1.4,m:1.4,d:0.35});
    for(const z of zombies){if(dist(z.x,z.y,fx,fy)>DEF.bowl.r+z.r*0.5)continue;z.burn=Math.max(z.burn||0,3);z.burnDps=Math.max(z.burnDps||0,DEF.bowl.dps[l]*ngMul())}}
  // мастерская чинит ночью
  if(S.def.shop&&phase().night){const k=DEF.shop.rate[S.def.shop]*dt;let fixed=false;
    if(S.fence.lvl&&S.fence.hp<fenceHp(S.fence.lvl)){S.fence.hp=Math.min(fenceHp(S.fence.lvl),S.fence.hp+fenceHp(S.fence.lvl)*k);fixed=true}
    if(S.hq>0&&S.hq<hqMax(S.base)){S.hq=Math.min(hqMax(S.base),S.hq+hqMax(S.base)*k);fixed=true}
    DST.shop=fixed?Math.min(1,DST.shop+dt*3):Math.max(0,DST.shop-dt)}else DST.shop=Math.max(0,DST.shop-dt);
  for(const f of DFX)f.t-=dt;for(let i=DFX.length-1;i>=0;i--)if(DFX[i].t<=0)DFX.splice(i,1);
}
// --- рисование: ров и ловушки (земля), баллисты, чаши, мастерская
function drawMoat(now){const l=S.def.moat;if(!l)return;const w=DEF.moat.w[l],R=CFG.fenceR+8+w/2;
  ctx.strokeStyle='#6b5a3a';ctx.lineWidth=w+8;ctx.beginPath();ctx.arc(CX,CY,R,0,7);ctx.stroke();
  ctx.strokeStyle='#2f5566';ctx.lineWidth=w;ctx.beginPath();ctx.arc(CX,CY,R,0,7);ctx.stroke();
  ctx.strokeStyle='rgba(20,40,55,.6)';ctx.lineWidth=w*0.45;ctx.beginPath();ctx.arc(CX,CY,R+w*0.08,0,7);ctx.stroke();
  ctx.strokeStyle='rgba(150,200,215,.35)';ctx.lineWidth=1.5;const t=now/1000;for(let k=0;k<3;k++){ctx.beginPath();const a0=t*0.15+k*2.1;ctx.arc(CX,CY,R-w*0.25+k*w*0.2,a0,a0+0.9);ctx.stroke()}
  // мостки к воротам дорог и вдоль сторон света
  for(const a of [Math.PI/2,-Math.PI/2]){const x=CX+Math.cos(a)*R,y=CY+Math.sin(a)*R;ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='#7b5b38';ctx.fillRect(-w/2-6,-11,w+12,22);ctx.strokeStyle='#5a4128';ctx.lineWidth=1.5;for(let k=-w/2-4;k<w/2+6;k+=6){ctx.beginPath();ctx.moveTo(k,-11);ctx.lineTo(k,11);ctx.stroke()}ctx.restore()}}
function drawTraps(){const n=DEF.traps.n[S.def.traps];for(let i=0;i<n;i++){const tp=trapPos(i),u=S.def.tu[i]>0,st=DST.trap[i],sn=st&&st.snap>0;
  ctx.globalAlpha=u?1:0.45;
  if(tp.k){ctx.fillStyle='#4a3a2a';ctx.beginPath();ctx.arc(tp.x,tp.y,9,0,7);ctx.fill();ctx.strokeStyle=u?'#cfd8de':'#8a8a8a';ctx.lineWidth=2;const o=sn?0.9:0.3;ctx.beginPath();ctx.arc(tp.x,tp.y,7,o,Math.PI-o);ctx.stroke();ctx.beginPath();ctx.arc(tp.x,tp.y,7,Math.PI+o,6.283-o);ctx.stroke()}
  else{ctx.fillStyle=u?'#5a4128':'#4a3a2a';for(let k=0;k<3;k++){const kx=tp.x+(k-1)*6,h=u?(sn?12:9):4;ctx.beginPath();ctx.moveTo(kx-3,tp.y+4);ctx.lineTo(kx,tp.y+4-h);ctx.lineTo(kx+3,tp.y+4);ctx.fill()}}
  ctx.globalAlpha=1}}
function drawBallista(i,now){const bp=ballPos(i),l=S.def.ball[i],st=DST.ball[i],a=st?st.a:bp.a,rec=st&&st.cd>DEF.ball.cd-0.2?3:0;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(bp.x-12,bp.y-6,28,20);ctx.save();ctx.translate(bp.x,bp.y);ctx.fillStyle=l>=3?'#5a5a5f':'#4a3424';ctx.fillRect(-13,-13,26,26);ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1.5;ctx.strokeRect(-13,-13,26,26);
  ctx.rotate(a);ctx.translate(-rec,0);ctx.strokeStyle=l>=4?'#c9a24a':'#8d6540';ctx.lineWidth=4;ctx.beginPath();ctx.arc(-4,0,16,-1.2,1.2);ctx.stroke();
  ctx.strokeStyle='#cfd8de';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-4+Math.cos(-1.2)*16,Math.sin(-1.2)*16);ctx.lineTo(-10,0);ctx.lineTo(-4+Math.cos(1.2)*16,Math.sin(1.2)*16);ctx.stroke();
  ctx.fillStyle='#9ea5aa';ctx.fillRect(-10,-1.5,28,3);ctx.fillStyle='#cfd8de';ctx.beginPath();ctx.moveTo(18,-3.5);ctx.lineTo(24,0);ctx.lineTo(18,3.5);ctx.fill();ctx.restore();
  drawLvlPips(bp.x,bp.y+18,l)}
function drawBowl(i,now){const bp=bowlPos(i),l=S.def.bowl[i],t=now/1000;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(bp.x+2,bp.y+8,13,5,0,0,7);ctx.fill();ctx.fillStyle='#3a3632';ctx.fillRect(bp.x-3,bp.y-2,6,10);ctx.fillStyle=l>=3?'#6a5a3a':'#4a4440';ctx.beginPath();ctx.ellipse(bp.x,bp.y-3,12,6,0,0,7);ctx.fill();
  const g=ctx.createRadialGradient(bp.x,bp.y-10,2,bp.x,bp.y-10,30);g.addColorStop(0,'rgba(255,170,60,.45)');g.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(bp.x,bp.y-10,30,0,7);ctx.fill();
  const f=1+0.15*Math.sin(t*9+i);ctx.fillStyle='#ff7a2a';ctx.beginPath();ctx.moveTo(bp.x-8,bp.y-4);ctx.quadraticCurveTo(bp.x-2,bp.y-22*f,bp.x+1,bp.y-26*f);ctx.quadraticCurveTo(bp.x+4,bp.y-14,bp.x+8,bp.y-4);ctx.fill();
  ctx.fillStyle='#ffe27a';ctx.beginPath();ctx.moveTo(bp.x-4,bp.y-4);ctx.quadraticCurveTo(bp.x,bp.y-14*f,bp.x+4,bp.y-4);ctx.fill();drawLvlPips(bp.x,bp.y+12,l)}
function drawLvlPips(x,y,l){for(let k=0;k<l;k++){ctx.fillStyle='#f4c766';ctx.fillRect(x-l*3+k*6,y,4,3)}}
function drawWorkshop(now){if(!S.def.shop)return;const x=CX+DEF.shop.x,y=CY+DEF.shop.y,l=S.def.shop;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x-24,y-8,52,30);ctx.fillStyle=l>=3?'#6a6a70':'#5a5a5f';ctx.fillRect(x-26,y-16,52,32);ctx.fillStyle='#3a3a40';ctx.beginPath();ctx.moveTo(x-31,y-16);ctx.lineTo(x,y-34);ctx.lineTo(x+31,y-16);ctx.fill();
  ctx.fillStyle=DST.shop>0.1?'#ffb347':'#2b2219';ctx.fillRect(x-6,y-2,12,18);ctx.fillStyle='#9ea5aa';ctx.fillRect(x+12,y+4,12,5);ctx.fillRect(x+16,y-2,4,6);
  ctx.strokeStyle='#8d6540';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-22,y+4);ctx.lineTo(x-12,y-6);ctx.stroke();ctx.fillStyle='#9ea5aa';ctx.fillRect(x-15,y-9,6,5);
  if(DST.shop>0.1){const k=Math.floor(now/180)%3;for(let i=0;i<3;i++)if(i===k){ctx.fillStyle='#ffd34d';ctx.fillRect(x+8+i*4,y-20-i*3,2,2)}}}
function drawDefense(now){if(DG)return;for(let i=0;i<DEF.ball.slots;i++){if(S.base<DEF.ball.base)break;const bp=ballPos(i);if(S.def.ball[i])drawBallista(i,now);else{ctx.strokeStyle='rgba(236,230,211,.2)';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.strokeRect(bp.x-12,bp.y-12,24,24);ctx.setLineDash([])}}
  for(let i=0;i<DEF.bowl.slots(S.base);i++){const bp=bowlPos(i);if(S.def.bowl[i])drawBowl(i,now);else{ctx.strokeStyle='rgba(236,230,211,.2)';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(bp.x,bp.y,11,0,7);ctx.stroke();ctx.setLineDash([])}}
  drawWorkshop(now)}
function drawDefFx(now){for(const f of DFX){
  if(f.k==='bolt'){const q=1-f.t/0.3,x=f.x1+(f.x2-f.x1)*Math.min(1,q*1.4),y=f.y1+(f.y2-f.y1)*Math.min(1,q*1.4);ctx.strokeStyle=`rgba(255,240,200,${f.t/0.3})`;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(f.x1,f.y1);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle='#cfd8de';ctx.beginPath();ctx.arc(x,y,3,0,7);ctx.fill()}
  if(f.k==='lob'){const q=1-f.t/f.m,x=f.x1+(f.x2-f.x1)*q,y=f.y1+(f.y2-f.y1)*q-Math.sin(q*Math.PI)*60,g=ctx.createRadialGradient(x,y,1,x,y,10);g.addColorStop(0,'#fff5c0');g.addColorStop(0.5,'rgba(255,140,40,.9)');g.addColorStop(1,'rgba(255,60,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,10,0,7);ctx.fill()}
  if(f.k==='fire'){if(f.t>f.m-f.d)continue;const a=Math.min(1,f.t/0.5),g=ctx.createRadialGradient(f.x,f.y,4,f.x,f.y,DEF.bowl.r);g.addColorStop(0,`rgba(255,180,60,${0.55*a})`);g.addColorStop(0.6,`rgba(255,100,30,${0.35*a})`);g.addColorStop(1,'rgba(255,60,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(f.x,f.y,DEF.bowl.r,0,7);ctx.fill()}}}
// --- стражники по уровням
function drawGuardFig(x,y,a,l){ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x+1,y+6,7,3,0,0,7);ctx.fill();
  ctx.fillStyle=DEF.guard.body[l];ctx.beginPath();ctx.arc(x,y,6.5,0,7);ctx.fill();if(l>=3){ctx.fillStyle=l>=4?'#d8b44a':'#8e959b';ctx.fillRect(x-6,y-1,12,2.5)}
  ctx.fillStyle=DEF.guard.helm[l];ctx.beginPath();ctx.arc(x,y-2,4.2,0,7);ctx.fill();if(l>=3){ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(x-2,y-5,1.5,2)}
  if(l>=4){ctx.fillStyle='#c43a2c';ctx.beginPath();ctx.moveTo(x-1.2,y-6);ctx.quadraticCurveTo(x+4,y-11,x+1.2,y-6);ctx.fill();ctx.fillRect(x-1,y-9,2,4)}
  ctx.strokeStyle=l>=4?'#c9a24a':'#8d6540';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x+Math.cos(a)*5,y+Math.sin(a)*5,6,a-1.1,a+1.1);ctx.stroke()}
// --- покупки во вкладке «Оборона»
function defAct(k,arg){const D=S.def,b=S.base;
  if(k==='moat'&&b>=DEF.moat.base&&D.moat<DEF.moat.max&&spend(DEF.moat.cost[D.moat])){D.moat++;toast(`Ров: уровень ${D.moat}`,'good');return true}
  if(k==='traps'&&b>=DEF.traps.base&&D.traps<DEF.traps.max&&spend(DEF.traps.cost[D.traps])){D.traps++;D.tu=D.tu.map(()=>DEF.traps.uses);toast(`Ловушки: ${DEF.traps.n[D.traps]} шт.`,'good');return true}
  if(k==='trapfix'){const n=DEF.traps.n[D.traps],miss=D.tu.slice(0,n).reduce((a,u)=>a+DEF.traps.uses-u,0);if(miss>0&&spend(C(miss*DEF.traps.fix))){D.tu=D.tu.map(()=>DEF.traps.uses);toast('Ловушки взведены','good')}return true}
  if(k==='guardup'&&b>=DEF.guard.base&&guardLvl()<DEF.guard.max&&spend(DEF.guard.cost[guardLvl()+1])){D.guard=guardLvl()+1;toast(`Стража: ${DEF.guard.names[D.guard]}`,'good');return true}
  if(k==='shop'&&b>=DEF.shop.base&&D.shop<DEF.shop.max&&spend(DEF.shop.cost[D.shop])){D.shop++;toast(D.shop===1?'Мастерская построена: ночью чинит забор и ратушу':`Мастерская: уровень ${D.shop}`,'good');return true}
  if(k==='ball'){const i=+arg,l=D.ball[i];if(b>=DEF.ball.base&&i<DEF.ball.slots&&l<DEF.ball.max&&spend(DEF.ball.cost(l))){D.ball[i]++;toast(`Баллиста ${i+1}: уровень ${D.ball[i]}`,'good')}return true}
  if(k==='bowl'){const i=+arg,l=D.bowl[i];if(i<DEF.bowl.slots(b)&&l<DEF.bowl.max&&spend(DEF.bowl.cost(l))){D.bowl[i]++;toast(`Огненная чаша ${i+1}: уровень ${D.bowl[i]}`,'good')}return true}
  return false}
