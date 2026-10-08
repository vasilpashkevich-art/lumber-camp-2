import re
s=open('snapshots/lumber-camp-v40.html').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)
P=lambda n:open('tools/parts/'+n).read()

# ===== 1. водоёмы и лёд =====
rep("function drawPatch(p,now){",P('water.js')+"\nfunction drawPatch(p,now){\n  if(p.kind==='swamp'||p.kind==='ice'){drawWater(p,now);return}")
rep("  buildCrypts(spots,rng2);","  buildCrypts(spots,rng2);\n  genWater(spots);")
rep("for(const p of patches){c.fillStyle=p.kind==='swamp'?'rgba(42,85,80,.85)'","for(const p of patches){c.fillStyle=p.kind==='swamp'||p.kind==='ice'?waterOf(p).mm")
rep("  if(WG.tex)mctx.drawImage(WG.tex,ox,oy,WG.W*sc,WG.W*sc);","  if(WG.tex)mctx.drawImage(WG.tex,ox,oy,WG.W*sc,WG.W*sc);\n  for(const p of patches){if(p.kind!=='swamp'&&p.kind!=='ice')continue;mctx.fillStyle=waterOf(p).mm;mctx.beginPath();mctx.arc(ox+p.x*sc,oy+p.y*sc,Math.max(1.5,p.r*sc),0,7);mctx.fill()}")
# скольжение на льду
rep("""  else if(m>0.1){P.slowT=Math.max(0,(P.slowT||0)-dt);const s=speedOf(S.up.boots)*(swamp&&!rl('boots')?0.55:1)*(P.slowT>0?0.5:1)*Math.min(1,m)/m;P.x+=mx*s*dt;P.y+=my*s*dt;P.face=Math.atan2(my,mx)}""",
"""  else{let wx=0,wy=0;if(m>0.1){P.slowT=Math.max(0,(P.slowT||0)-dt);const s=speedOf(S.up.boots)*(swamp&&!rl('boots')?0.55:1)*(P.slowT>0?0.5:1)*Math.min(1,m)/m;wx=mx*s;wy=my*s;P.face=Math.atan2(my,mx)}
    P.ice=!DG&&onIce(P.x,P.y);if(P.ice){const k=1-Math.exp(-dt*ICE.grip);P.ivx=(P.ivx||0)+(wx-(P.ivx||0))*k;P.ivy=(P.ivy||0)+(wy-(P.ivy||0))*k}else{P.ivx=wx;P.ivy=wy}
    P.x+=P.ivx*dt;P.y+=P.ivy*dt}""")
rep("const inSwamp =","const ICE={grip:1.8};// чем меньше, тем дольше скользишь\nconst inSwamp =")

rep('<span><i style="background:#2a5550;border-radius:50%"></i>Болото</span>','<span><i style="background:linear-gradient(90deg,#4f8aa0,#6a4a2a,#5ac040,#bfe4f8);border-radius:50%"></i>Водоёмы</span>')

# ===== 2. оборона =====
rep("const guardDmg  = () => 1.5 + 0.5*S.base;","const guardDmg  = () => (1.5 + 0.5*S.base)*DEF.guard.mul[guardLvl()];\n"+P('defense.js'))
rep("towers:[0,0,0,0,0,0],houses:0,","towers:[0,0,0,0,0,0],def:{moat:0,traps:0,tu:Array(20).fill(12),ball:[0,0],bowl:[0,0,0,0],guard:1,shop:0},houses:0,")
rep("  st.cls=src&&CLASSES[src.cls]?src.cls:null;","  st.cls=src&&CLASSES[src.cls]?src.cls:null;\n  st.def.guard=Math.max(1,Math.min(4,st.def.guard|0));for(const k of ['moat','traps','shop'])st.def[k]=Math.max(0,Math.min(DEF[k].max,st.def[k]|0));st.def.tu=st.def.tu.map(u=>Math.max(0,Math.min(DEF.traps.uses,u|0)));")
rep("let tx,ty,sp=z.speed*(inSwamp(z.x,z.y)?(z.skin==='croc'?1.5:0.6):1);","let tx,ty,sp=z.speed*(inSwamp(z.x,z.y)?(z.skin==='croc'?1.5:0.6):1)*zSlow(z,dC,dt);")
rep("  updateTowers(dt);\n","  updateTowers(dt);updateDefense(dt);\n")
rep("    const gp=guardPos(i);let best=null,bd=190;\n    for(const z of zombies){if(Math.abs(z.x-gp.x)>190)continue;","    const gp=guardPos(i),GR=DEF.guard.range[guardLvl()];let best=null,bd=GR;\n    for(const z of zombies){if(Math.abs(z.x-gp.x)>GR)continue;")
rep("if(best){G[i]=1.3;tracers.push({x1:gp.x,y1:gp.y-6,x2:best.x,y2:best.y,t:0.12,lvl:2})","if(best){G[i]=DEF.guard.cd[guardLvl()];tracers.push({x1:gp.x,y1:gp.y-6,x2:best.x,y2:best.y,t:0.12,lvl:1+guardLvl()})")
rep("""    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(g.x+1,g.y+6,6,3,0,0,7);ctx.fill();
    ctx.fillStyle='#4a5a6a';ctx.beginPath();ctx.arc(g.x,g.y,6,0,7);ctx.fill();
    ctx.fillStyle='#a9b0b8';ctx.beginPath();ctx.arc(g.x,g.y-2,3.5,0,7);ctx.fill();
    const a=g.a;ctx.strokeStyle='#8d6540';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(g.x+Math.cos(a)*5,g.y+Math.sin(a)*5,6,a-1.1,a+1.1);ctx.stroke();""","    drawGuardFig(g.x,g.y,g.a,guardLvl());")
rep("  if(S.fence.lvl>0)drawFence();\n  drawGuards(now);","  drawMoat(now);drawTraps();\n  if(S.fence.lvl>0)drawFence();\n  drawGuards(now);")
rep("""    drawTower(tp.x,tp.y,l,T[i],now);
  }
}""","""    drawTower(tp.x,tp.y,l,T[i],now);
  }
  drawDefense(now);
}""")
rep("drawRelicFx(now);drawAbilityFx(now);","drawRelicFx(now);drawAbilityFx(now);drawDefFx(now);")
rep("guard:`урон ${fmt1(guardDmg())} каждый, дальность 190`","guard:`${DEF.guard.names[guardLvl()]}: урон ${fmt1(guardDmg())} каждый, дальность ${DEF.guard.range[guardLvl()]}`")
rep("unlocks:{2:'Забор',3:'Башни, 2 места',4:'Дома и жители',5:'Башни, 4 места',6:'Башни, 6 мест'}","unlocks:{2:'Забор',3:'Башни, 2 места, ров, ловушки',4:'Дома и жители, стража, мастерская, баллисты',5:'Башни, 4 места, 2 огненные чаши',6:'Башни, 6 мест, 4 огненные чаши'}")
rep("""  if(t==='vil'){
    const mh=maxHouses();""",P('defmenu.js')+"""  if(t==='vil'){
    const mh=maxHouses();""")
rep("  if(k==='fence'&&S.fence.lvl<fenceMax(S.base)","  if(defAct(k,arg)){save();return}\n  if(k==='fence'&&S.fence.lvl<fenceMax(S.base)")


# ===== 3. спутники по классам =====
a=s.index("  // волк\n  const rw=rl('wolf');");b=s.index("  else RX.wolf=null;\n",a)+len("  else RX.wolf=null;\n")
s=s[:a]+"  updPet(dt);updDots(dt);\n"+s[b:]
a=s.index("  const W=RX.wolf;if(W){const bob=W.run?");b=s.index("ctx.restore();ctx.globalAlpha=1}\n",a)+len("ctx.restore();ctx.globalAlpha=1}\n")
s=s[:a]+"  drawPet(now);\n"+s[b:]
rep("function updRelics(dt){",P('pets.js')+"\nfunction updRelics(dt){")
rep("const RX={fb:[],","const RX={pfb:[],fb:[],")
rep("const relicSvg=(k,sz=32)=>`<svg viewBox=\"0 0 32 32\" width=\"${sz}\" height=\"${sz}\" aria-hidden=\"true\">${RELIC_ICO[k]||''}</svg>`;","const relicSvg=(k,sz=32)=>`<svg viewBox=\"0 0 32 32\" width=\"${sz}\" height=\"${sz}\" aria-hidden=\"true\">${(k==='wolf'&&PET_ICO[S.cls])||RELIC_ICO[k]||''}</svg>`;")
rep("const relicName=k=>(RELIC2[k]||RELICS[k]).name;","const relicName=k=>k==='wolf'?petOf().name:(RELIC2[k]||RELICS[k]).name;")
rep("const relicDesc=(k,r)=>{const R=RELIC2[k];","const relicDesc=(k,r)=>{if(k==='wolf')return petOf().desc(Math.max(1,r));const R=RELIC2[k];")
rep("<b>${R.name}</b><span>${relicDesc(k,rl(k)+1)}</span>","<b>${relicName(k)}</b><span>${relicDesc(k,rl(k)+1)}</span>")
# новый облик значка волка: острые уши назад, вытянутая морда
rep("""  wolf:'<path d="M6 8l5 4 5-2 5 2 5-4-1 9-3 5-6 6-6-6-3-5z" fill="#9fb4c8" stroke="#4c6178"/><circle cx="12.5" cy="15" r="1.4" fill="#7ec8ff"/><circle cx="19.5" cy="15" r="1.4" fill="#7ec8ff"/><path d="M14 21l2 2 2-2" stroke="#2b3a48" stroke-width="1.5" fill="none"/>',""",
"""  wolf:'<path d="M3 16c4-3 8-4 12-4l6-6 1 6 8 3c1 1 1 2 0 3l-8 2-6 3c-5 0-9-2-13-7z" fill="#9fb4c8" stroke="#4c6178"/><path d="M15 12l6-6 1 6z" fill="#7f96ab" stroke="#4c6178"/><path d="M22 18l8-1" stroke="#d6e2ec" stroke-width="1.6"/><circle cx="30" cy="16.5" r="1.1" fill="#22303c"/><rect x="20" y="13.6" width="2.4" height="1.4" fill="#7ec8ff"/>',""")


# ===== 4. облик героя =====
a=s.index("// --- тело героя по классу\nfunction drawHeroBody(");b=s.index("// --- второе оружие: атака",a)
s=s[:a]+P('herofig.js')+s[b:]
a=s.index("  const sec=S.weapon==='bow'&&S.bow>0,cl=cls();const nowT=performance.now();");b=s.index("function drawGuards(now){",a)
s=s[:a]+"""  const sec=S.weapon==='bow'&&S.bow>0,cl=cls();const nowT=performance.now();
  const cf=Math.cos(P.face);if(Math.abs(cf)>0.25||!P.dir)P.dir=cf<0?-1:1;const dir=P.dir;
  const mv=Math.hypot(P.ivx||0,P.ivy||0)>5,bob=mv?-Math.abs(Math.sin(nowT/95))*1.6:0,hx=x+dir*6,hy=y+2+bob;
  // сумка и запасное оружие за спиной
  const bx=x-dir*8,by=y-3+bob,fill=bagTotal()/bagCap(S.up.bag),back=dir>0?-Math.PI*0.72:-Math.PI*0.28;
  if(S.bow>0&&!sec){if(cl==='warrior'){ctx.save();ctx.translate(bx,by);ctx.scale(0.55,0.55);drawHammerSkin(ctx,HAM_SKINS[skinTier(HAM_SKINS,S.bow)],0,0,back,14,nowT);ctx.restore()}
    else if(cl==='mage'){ctx.save();ctx.translate(bx,by);ctx.scale(0.55,0.55);drawStaffSkin(ctx,STF_SKINS[skinTier(STF_SKINS,S.bow)],0,0,back,16,nowT);ctx.restore()}
    else{const K=bowSkin(S.bow);ctx.lineCap='round';ctx.strokeStyle=K.wood;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(bx,by,9,back+Math.PI-0.9,back+Math.PI+0.9);ctx.stroke()}}
  if(sec){ctx.save();ctx.translate(bx,by);ctx.scale(0.55,0.55);drawAxeSkin(ctx,axeSkin(S.up.axe),0,0,back,14,nowT);ctx.restore()}
  ctx.fillStyle='#5b4329';ctx.strokeStyle=HO;ctx.lineWidth=1;ctx.beginPath();ctx.arc(bx,by+4,3.5+fill*3.5,0,7);ctx.fill();ctx.stroke();
  const weapon=()=>{
    if(sec&&cl==='warrior'){const sw=P.swing>0?(1-P.swing/0.3)*2.6-1.3:-0.9,a=P.face+sw;drawHammerSkin(ctx,HAM_SKINS[skinTier(HAM_SKINS,S.bow)],hx,hy,a,20,nowT)}
    else if(sec&&cl==='mage'){drawStaffSkin(ctx,STF_SKINS[skinTier(STF_SKINS,S.bow)],hx,hy,P.face-0.25,20,nowT)}
    else if(sec&&cl!=='warrior'&&cl!=='mage'&&P.swing<=0){const a=P.face,wx=hx+Math.cos(a)*9,wy=hy+Math.sin(a)*9,pull=P.shot>0?P.shot/0.2*4:0;drawBowSkin(ctx,bowSkin(S.bow),wx,wy,a,pull,nowT,P.cd<=0.05||P.shot>0)}
    else{const sw=P.swing>0?(1-P.swing/0.18)*2.2-1.1:-0.9,a=P.face+sw;drawAxeSkin(ctx,axeSkin(S.up.axe),hx,hy,a,21,nowT)}};
  const front=Math.sin(P.face)>-0.5;
  if(!front)weapon();
  drawHeroBody(ctx,x,y+bob,cl,P.hurt>0,P.face,dir);
  if(front)weapon();
}
"""+s[b:]
rep("c2.fillStyle='#4f6e3a';c2.fillRect(0,0,120,120);c2.translate(56,66);c2.scale(2.3,2.3);","c2.fillStyle='#4f6e3a';c2.fillRect(0,0,120,120);c2.translate(58,80);c2.scale(1.9,1.9);")
rep("c2.fillStyle='rgba(0,0,0,.35)';c2.beginPath();c2.ellipse(2,11,13,5,0,0,7);c2.fill();drawHeroBody(c2,0,0,k,false,-0.4);","c2.fillStyle='rgba(0,0,0,.35)';c2.beginPath();c2.ellipse(0,12.5,12,4,0,0,7);c2.fill();drawHeroBody(c2,0,0,k,false,-0.4,1);")
rep("if(k==='warrior')drawHammerSkin(c2,HAM_SKINS[2],0,0,-0.5,18,0);if(k==='mage')drawStaffSkin(c2,STF_SKINS[2],0,0,-0.6,16,0);if(k==='archer')drawBowSkin(c2,BOW_SKINS[2],13,0,-0.4,0,0,true);","if(k==='warrior')drawHammerSkin(c2,HAM_SKINS[2],6,2,-0.9,18,0);if(k==='mage')drawStaffSkin(c2,STF_SKINS[2],6,2,-1.2,16,0);if(k==='archer')drawBowSkin(c2,BOW_SKINS[2],15,0,-0.2,0,0,true);")

# доступ для снимков
rep("get WG(){return WG}};","get WG(){return WG},patches:()=>patches,onIce,makeZombie,RX,DST};")
open('src/lumber-camp.html','w').write(s)
print('ok')
