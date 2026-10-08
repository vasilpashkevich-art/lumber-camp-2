// --- лагерь (v43): постройки сортируются по глубине вместе с героем и мертвецами
const skladFill=()=>Math.min(1,(Math.sqrt(Math.max(0,S.wood))+Math.sqrt(Math.max(0,S.stone))*0.6)/45);
const FORGE_POS={get x(){return CX-81},get y(){return CY+135}};
function drawCamp(now){
  const t=now/1000,E=[],add=(y,f)=>E.push({y,f});
  drawMoat(now);drawTraps();
  add(CY+8,()=>{if(S.hq>0)drawHQ(now);else drawRuins(now);
    if(S.hq<hqMax(S.base)){const w=70,f=Math.max(0,S.hq)/hqMax(S.base);ctx.fillStyle='#000';ctx.fillRect(CX-w/2,CY-128,w,6);ctx.fillStyle=f>0.4?'#e98b3d':'#cf4b3f';ctx.fillRect(CX-w/2,CY-128,w*f,6);
      ctx.font='600 11px Rubik, sans-serif';ctx.textAlign='center';ctx.fillStyle='#ece6d3';ctx.fillText('Ратуша',CX,CY-133)}});
  add(CY+52,()=>bd(CX-40,CY+52,0.62,()=>BLD.sklad(skladFill(),t)));
  for(let i=0;i<S.houses;i++){const h=housePos(i);add(h.y+10,()=>bd(h.x,h.y+10,0.95,()=>BLD.house(i,t+i)));
    if(darkness()<0.5)for(let k=0;k<2;k++){const a=now/1400+i*1.7+k*3.1,rx=h.x+Math.cos(a)*26,ry=h.y+18+Math.sin(a)*6,dir=Math.sin(a)>0?-1:1;
      add(ry,()=>bd(rx,ry,0.42,()=>BLD.person({...BLD.PEASANT,tool:null,beard:k?BLD.PEASANT.beard:null,shirt:['#c9b48a','#9ab0c8','#c97a6a'][(i+k)%3]},0,0,1,dir,t)))}}
  if(S.forge)add(FORGE_POS.y+14,()=>bd(FORGE_POS.x,FORGE_POS.y+14,0.75,()=>BLD.forge(t)));
  if(S.def.shop){const x=CX+DEF.shop.x,y=CY+DEF.shop.y;add(y+14,()=>bd(x,y+14,0.75,()=>BLD.workshop(S.def.shop,t)))}
  // забор: каждый кусок на своей глубине
  if(S.fence.lvl>0){const l=S.fence.lvl,ratio=S.fence.hp/fenceHp(l),sk=fenceSkin(l),R=CFG.fenceR,n=sk===2?96:72;
    for(let i=0;i<n;i++){const am=(i+0.5)/n*6.283,py=CY+Math.sin(am)*R,broken=ratio<=0||((i*37)%100)/100>ratio+0.15;add(py+(sk>=3?1:0),()=>bd(0,0,1,()=>BLD.fenceSeg(CX,CY,R,sk,i,n,broken)))}}
  // стража
  const gl=guardLvl();for(let i=0;i<S.jobs.guard;i++){const g=guardPos(i),dir=Math.cos(g.a+Math.PI/2)<0?-1:1;add(g.y,()=>bd(g.x,g.y,0.55,()=>BLD.person(BLD.GUARD[gl],0,0,1,dir,t)))}
  // башни
  for(let i=0;i<towerSlots(S.base);i++){const tp=towerPos(i),l=S.towers[i];
    if(!l){add(tp.y-30,()=>{ctx.strokeStyle='rgba(236,230,211,.25)';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.strokeRect(tp.x-12,tp.y-12,24,24);ctx.setLineDash([])});continue}
    add(tp.y+4,()=>drawTower(tp.x,tp.y,l,T[i],now))}
  // баллисты и огненные чаши
  if(!DG){for(let i=0;i<DEF.ball.slots;i++){if(S.base<DEF.ball.base)break;const bp=ballPos(i),l=S.def.ball[i];
      if(l){const st=DST.ball[i],dir=Math.cos(st?st.a:bp.a)<0?-1:1;add(bp.y+6,()=>{bd(bp.x,bp.y+6,0.8,()=>BLD.ballista(l,t),dir);drawLvlPips(bp.x,bp.y+14,l)})}
      else add(bp.y-30,()=>{ctx.strokeStyle='rgba(236,230,211,.2)';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.strokeRect(bp.x-12,bp.y-12,24,24);ctx.setLineDash([])})}
    for(let i=0;i<DEF.bowl.slots(S.base);i++){const bp=bowlPos(i),l=S.def.bowl[i];
      if(l)add(bp.y+6,()=>{bd(bp.x,bp.y+6,0.8,()=>BLD.brazier(l,t));drawLvlPips(bp.x,bp.y+12,l)});
      else add(bp.y-30,()=>{ctx.strokeStyle='rgba(236,230,211,.2)';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(bp.x,bp.y,11,0,7);ctx.stroke();ctx.setLineDash([])})}}
  return E;
}
function drawHQ(now){const b=S.base;bd(CX,CY+8,[0,1,1,1,1,0.85,0.72][b]||1,()=>BLD.HQ[b](now/1000))}
function drawRuins(now){bd(CX,CY+8,0.9,()=>BLD.HQ.ruins(now/1000))}
function towerTop(l){return [0,24,35,46,43,52,69][l]||20}
function drawTower(x,y,l,tw,now){const ang=tw?tw.ang:-Math.PI/2,shot=tw?tw.shot/0.25:0;bd(x,y+4,0.8,()=>BLD.tower(l,now/1000,ang,shot))}
