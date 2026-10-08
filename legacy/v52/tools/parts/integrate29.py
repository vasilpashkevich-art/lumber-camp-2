import re
p='src/lumber-camp.html';s=open(p).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:80]);s=s.replace(a,b)
mod=open('tools/parts/progress.js').read()
rep("/* ================= ГЕРОЙ ================= */",mod+"\n/* ================= ГЕРОЙ ================= */")
# state
rep("return {v:10,meta:{ng:0,relics:{},wins:0,relicPend:0},","return {v:11,rested:0,meta:{ng:0,relics:{},wins:0,relicPend:0,codex:{},ach:{},best:{day:1,zone:1,axe:1,bow:0,base:1,fence:0,tower:0},life:{kills:0,chopped:0,mined:0}},")
rep("  st.v=10;\n","  st.meta.codex={};st.meta.ach={};if(src&&src.meta){for(const k in src.meta.codex||{})st.meta.codex[k]=+src.meta.codex[k]||0;for(const k in src.meta.ach||{})st.meta.ach[k]=+src.meta.ach[k]||1}\n  st.v=11;\n")
# xp
rep("  S.xp+=n;let up=0;","  if(restOn())n*=REST.xp;S.xp+=n;let up=0;")
rep("if(up){sfx.levelup();","if(up){sfx.levelup();burst(P.x,P.y,28,['#f4c766','#fff2c0'],170,0.8,3);")
# perks
rep("b.innerHTML=`<small>${P_.br}</small><b>${P_.name}</b><span>${P_.desc}</span><em>ранг ${pr(k)} → ${pr(k)+1} из ${P_.max}</em>`;",
    "const nm=nextMast(P_.br);b.innerHTML=`<small>${P_.br}</small><b>${P_.name}</b><span>${P_.desc}</span><em>ранг ${pr(k)} → ${pr(k)+1} из ${P_.max}</em>${nm?`<em style=\"color:var(--muted)\">мастерство «${nm.name}»: ещё ${nm.at-brPts(P_.br)}</em>`:''}`;")
rep("  S.perks[k]=pr(k)+1;S.perkPend--;","  const bp0=brPts(PERKS[k].br);S.perks[k]=pr(k)+1;S.perkPend--;checkMastery(PERKS[k].br,bp0);")
# offline
a=s.index("function applyOffline(){");b=s.index("/* ================= UPDATE")
s=s[:a]+r"""function applyOffline(){
  if(!S.lastSeen)return;
  const away=(Date.now()-S.lastSeen)/1000,sec=Math.min(offCap(),away);
  if(!(sec>=OFFLINE.min))return;
  const k=sec*offEff();
  const w=Math.floor(woodRate()*k),st=Math.floor(stoneRate()*k);
  let fw=0,fs=0,fst=0;
  for(const q of pois){const f=farmOf(q);if(!f||f.broken)continue;
    const made=farmRateEst(q,f)*k,stone=f.mode==='stone';
    if(f.road){if(stone)fst+=Math.floor(made);else fw+=Math.floor(made)}
    else{const cap=farmCap(q.zone,f.lvl),room=Math.max(0,cap-farmStored(f)),n=Math.min(room,made);if(stone)f.storeS=(f.storeS||0)+n;else f.store+=n;fs+=Math.floor(n)}}
  S.wood+=w+fw;S.stone+=st+fst;
  let rest=0;if(away>=1800){S.rested=Math.min(REST.max,(S.rested||0)+away/6);rest=S.rested}
  if(w+fw+st+fs+fst<=0&&!rest)return;
  const hrs=Math.floor(away/3600),mins=Math.floor(away%3600/60);
  const rows=[['Вас не было',hrs?`${hrs} ч ${mins} мин`:`${mins} мин`]];
  if(w)rows.push(['Лесорубы принесли','+'+w]);
  if(st)rows.push(['Каменщики принесли','+'+st+' камня']);
  if(fw)rows.push(['Вагончики с хуторов','+'+fw]);
  if(fst)rows.push(['Камень с хуторов','+'+fst]);
  if(fs)rows.push(['В поленницах хуторов','+'+fs+' (заберите)']);
  rows.push(['Работа без вас',`${Math.round(offEff()*100)}% от обычной, предел ${offCap()/3600} ч`+(away>offCap()?' (достигнут)':'')]);
  if(rest)rows.push(['Вы отдохнули',`+25% к добыче и +50% опыта, ещё ${mmss(rest)}`]);
  showDawn('Пока вас не было',rows,w+fw,true);
  save();
}

"""+s[b:]
rep("function showDawn(title,rows,total){","function showDawn(title,rows,total,stay){")
rep("dawnEl.hidden=false;clearTimeout(dawnTimer);dawnTimer=setTimeout(()=>dawnEl.hidden=true,7000);","dawnEl.hidden=false;clearTimeout(dawnTimer);if(!stay)dawnTimer=setTimeout(()=>dawnEl.hidden=true,7000);")
# update hooks
rep("  P.fell=Math.max(0,(P.fell||0)-dt);updateRoots(dt);updateRefugees(dt);",
"""  P.fell=Math.max(0,(P.fell||0)-dt);updateRoots(dt);updateRefugees(dt);
  if(S.rested>0){S.rested=Math.max(0,S.rested-dt);if(S.rested===0)toast('Бонус отдыха закончился','', 'rest')}
  if(P.rageT>0){P.rageT-=dt;if(P.rageT<=0)P.rage=0}
  updFx(dt);updAch(dt);
  if(mast('repair')&&!phase().night){const kk=0.01*dt;if(S.fence.lvl)S.fence.hp=Math.min(fenceHp(S.fence.lvl),S.fence.hp+fenceHp(S.fence.lvl)*kk);S.hq=Math.min(hqMax(S.base),S.hq+hqMax(S.base)*kk);for(const q of pois){const f=farmOf(q);if(f&&!f.broken)f.hp=Math.min(fHp(q,f),f.hp+fHp(q,f)*kk)}}""")
rep("dashReq=false;P.dash=DASH.time;P.dashCd=dashCd();P.inv=DASH.inv;","dashReq=false;P.dash=DASH.time;P.dashCd=dashCd();P.inv=DASH.inv;P.dhit=new Set();burst(P.x,P.y,8,'rgba(159,195,214,.8)',120,0.35,3);")
rep("  if(P.dash>0){P.dash-=dt;P.x+=P.ddx*DASH.speed*dt;P.y+=P.ddy*DASH.speed*dt}\n",
"""  if(P.dash>0){P.dash-=dt;P.x+=P.ddx*DASH.speed*dt;P.y+=P.ddy*DASH.speed*dt;
    if(!DG&&mast('whirl')&&P.dhit){const room=()=>bagTotal()<bagCap(S.up.bag);
      for(const t of trees){if(!t.alive||P.dhit.has(t)||Math.abs(t.x-P.x)>60)continue;if(dist(t.x,t.y,P.x,P.y)<t.r+24&&S.up.axe>=CFG.trees[t.tier].axe&&room()){P.dhit.add(t);chop(t,axeDmg(S.up.axe)*gatherMul()*3)}}
      for(const r of rocks){if(!r.alive||P.dhit.has(r)||Math.abs(r.x-P.x)>60)continue;if(dist(r.x,r.y,P.x,P.y)<r.r+24&&S.up.pick>=CFG.rocks.pick[r.zone]&&room()){P.dhit.add(r);mine(r,pickDmg(S.up.pick)*gatherMul()*3)}}}
    if(combo('shade')&&P.dhit)for(const z of zombies.slice()){if(P.dhit.has(z)||dist(z.x,z.y,P.x,P.y)>z.r+30||!canHit(z,'melee'))continue;P.dhit.add(z);const d=axeDmg(S.up.axe)*2*atkMul();dmgNum(z.x,z.y-z.r-4,d,false);hitZombie(z,d,P.x,P.y,'melee')}
  }
""")
# gather multiplier and doAction
rep("    const gm=(1+0.15*pr('hand'))*(1+gear('gather')/100)*(1+0.15*rl('gather'));\n    const fell=","    const gm=gatherMul();\n    const fell=")
rep("function doAction(t){","const gatherMul=()=>(1+0.15*pr('hand'))*(1+gear('gather')/100)*(1+0.15*rl('gather'))*(restOn()?REST.gather:1);\nfunction doAction(t){")
rep("      {const [d,cr]=heroHit(bowDmg(S.bow)*(1+0.12*pr('str'))*atkMul()*(1+0.2*S.forgeUp.bow));hitEnemy(t,d,'ranged',cr)}",
    "      {let [d,cr]=heroHit(bowDmg(S.bow)*(1+0.12*pr('str'))*atkMul()*(1+0.2*S.forgeUp.bow));if(mast('cleave')&&(P.arrowN=(P.arrowN||0)+1)%4===0&&!cr){d*=2;cr=true}hitEnemy(t,d,'ranged',cr)}")
rep("hitEnemy(t,d,'melee',cr)}\n  }else{","hitEnemy(t,d,'melee',cr)}\n    if(P.rage)P.cd/=1+0.06*P.rage;\n  }else{")
# hitEnemy
rep("function hitEnemy(t,dmg,src,crit){if(t.k==='z'){if(crit)addFloat(t.o.x,t.o.y-t.o.r-6,'крит!','#f4c766');if(canHit(t.o,src))maybeBurn(t.o,dmg);hitZombie(t.o,dmg,P.x,P.y,src)}else hitMound(t.o,dmg)}",
r"""function hitEnemy(t,dmg,src,crit){
  if(t.k!=='z'){dmgNum(t.o.x,t.o.y-30,dmg,crit);hitMound(t.o,dmg);return}
  const z=t.o;
  if(canHit(z,src)){
    if(mast('exec')){
      if(!z.boss&&!z.guard&&z.hp-dmg>0&&z.hp-dmg<z.max*0.15){dmg=z.hp+0.01;addFloat(z.x,z.y-z.r-24,'казнь','#cf4b3f');if(combo('harvest'))S.p.hp=Math.min(maxHp(S.up.hp),S.p.hp+3)}
      else if(z.boss&&z.hp<z.max*0.3)dmg*=1.25}
    maybeBurn(z,dmg);dmgNum(z.x,z.y-z.r-4,dmg,crit);
    if(crit){shake(2.5,0.1);burst(z.x,z.y,7,['#ffd34d','#fff2c0'],180,0.3,2)}
    if(src==='melee'&&mast('cleave'))for(const o of zombies.slice()){if(o!==z&&dist(o.x,o.y,z.x,z.y)<z.r+o.r+30&&canHit(o,'melee')){dmgNum(o.x,o.y-o.r-4,dmg*0.5,false);hitZombie(o,dmg*0.5,P.x,P.y,'melee')}}
  }
  hitZombie(z,dmg,P.x,P.y,src);
}
function towerHit(z,d,x,y){if(mast('fire')&&zombies.includes(z)&&canHit(z,'ranged')){z.burn=3;z.burnDps=Math.max(z.burnDps||0,d*0.3)}hitZombie(z,d,x,y,'ranged')}""")
rep("hitZombie(best,farmTowerDmg(q.zone,f.tower)*(1+0.12*pr('eng')),tp.x,tp.y,'ranged')","towerHit(best,farmTowerDmg(q.zone,f.tower)*(1+0.12*pr('eng')),tp.x,tp.y)")
rep("hitZombie(best,towerDmg(l)*(1+0.12*pr('eng')),tp.x,tp.y,'ranged')","towerHit(best,towerDmg(l)*(1+0.12*pr('eng')),tp.x,tp.y)")
# chop / mine
rep("function chop(t,dmg){\n  t.hp-=dmg;t.shake=0.15;sfx.chop();\n  if(t.hp<=0){sfx.fall();",
    "function chop(t,dmg,chain){\n  t.hp-=dmg;t.shake=0.15;if(!chain)sfx.chop();burst(t.x,t.y,4,['#c9a06a','#8d6540','#e3c48e'],110,0.45,2.5);\n  if(t.hp<=0){sfx.fall();")
rep("    addFloat(t.x,t.y-20,(dbl?'Двойная! ':'')+'+'+add+' древесины','#e9c46a');",
r"""    addFloat(t.x,t.y-20,(dbl?'Двойная! ':'')+'+'+add+' древесины','#e9c46a');
    S.meta.life.chopped++;burst(t.x,t.y-6,16,['#4f7a3a','#6d9a4a','#c9a06a','#8d6540'],180,0.7,3);shake(1.5,0.1);
    if(mast('spirit')){S.p.hp=Math.min(maxHp(S.up.hp),S.p.hp+2);if(Math.random()<0.03){drops.push({x:t.x+12,y:t.y+12,kind:'chest',tier:t.tier,t:LOOT.lifetime});addFloat(t.x,t.y-36,'тайник!','#f4c766')}}
    if(combo('wrath'))for(const z of zombies.slice())if(dist(z.x,z.y,t.x,t.y)<90&&canHit(z,'melee')){const d=axeDmg(S.up.axe)*3;dmgNum(z.x,z.y-z.r-4,d,false);hitZombie(z,d,t.x,t.y,'melee')}
    if(mast('fellchain')&&(chain||0)<3){let nb=null,nd=75;for(const o of trees){if(o===t||!o.alive||Math.abs(o.x-t.x)>75)continue;const d=dist(o.x,o.y,t.x,t.y);if(d<nd&&S.up.axe>=CFG.trees[o.tier].axe){nd=d;nb=o}}
      if(nb&&bagTotal()<bagCap(S.up.bag)){addFloat(nb.x,nb.y-30,'подсечка','#c9a06a');chop(nb,CFG.trees[nb.tier].hp*0.5,(chain||0)+1)}}""")
rep("  r.hp-=dmg;r.shake=0.15;sfx.mine();\n  if(r.hp<=0){sfx.crumble();",
    "  r.hp-=dmg;r.shake=0.15;sfx.mine();burst(r.x,r.y,4,r.iron?['#a9b2bf','#6d7a8a']:['#a9a79c','#d6d3c8'],120,0.4,2.5);\n  if(r.hp<=0){sfx.crumble();S.meta.life.mined++;burst(r.x,r.y,14,r.iron?['#a9b2bf','#6d7a8a','#d8dee6']:['#a9a79c','#d6d3c8','#77746a'],170,0.6,3.2);shake(2,0.12);")
# hitZombie / kill / damage
rep("  z.hp-=dmg;z.hit=0.12;\n","  z.hp-=dmg;z.hit=0.12;burst(z.x,z.y,3,['#2a3320','#6a1f1f'],90,0.35,2.5);\n")
rep("  zombies.splice(zombies.indexOf(z),1);S.stats.kills++;sfx.kill();",
r"""  zombies.splice(zombies.indexOf(z),1);S.stats.kills++;sfx.kill();
  codexKill(z);
  {const zc=z.kind?ZTYPES[z.kind].col:(CFG.zombies[z.tier]||{col:'#555'}).col;burst(z.x,z.y,z.boss?44:10,[zc,'#2a2a22','#7a1f1f'],z.boss?280:150,z.boss?1.1:0.55,z.boss?4.5:3)}
  if(z.boss){slowT=0.9;shake(9,0.6)}
  if(mast('rage')){P.rage=Math.min(5,(P.rage||0)+1);P.rageT=4}
  if(z.burn>0&&combo('blaze'))for(const o of zombies)if(dist(o.x,o.y,z.x,z.y)<85&&canHit(o,'ranged')){o.burn=3;o.burnDps=Math.max(o.burnDps||0,z.burnDps||1);burst(o.x,o.y,5,['#ffb347','#e05a20'],100,0.4,2.5)}""")
rep("S.p.hp-=n;P.hurt=0.2;sfx.hurt();","S.p.hp-=n;P.hurt=0.2;sfx.hurt();shake(3.5,0.18);")
# render
rep("  const camX=P.x-VW/2/zoom, camY=P.y-VH/2/zoom;\n  ctx.setTransform(DPR*zoom,0,0,DPR*zoom,-camX*DPR*zoom,-camY*DPR*zoom);\n  const vx0",
    "  const sk=shakeT>0?shakeA*Math.min(1,shakeT*6):0, camX=P.x-VW/2/zoom+(Math.random()-0.5)*2*sk, camY=P.y-VH/2/zoom+(Math.random()-0.5)*2*sk;\n  ctx.setTransform(DPR*zoom,0,0,DPR*zoom,-camX*DPR*zoom,-camY*DPR*zoom);\n  const vx0")
rep("  for(const f of floats){ctx.globalAlpha=Math.min(1,f.t*1.5);ctx.fillStyle='#000';",
    "  drawFx();\n  for(const f of floats){ctx.font=`700 ${f.sz||14}px Rubik, sans-serif`;ctx.globalAlpha=Math.min(1,f.t*1.5);ctx.fillStyle='#000';")
rep("  const dt=Math.min(0.05,(now-last)/1000);last=now;","  let dt=Math.min(0.05,(now-last)/1000);last=now;if(slowT>0&&!menuOpen){slowT-=dt;dt*=0.3}")
# HUD
rep("$('xpTxt').textContent=`${Math.floor(S.xp)}/${xpNeed(S.lvl)}`;","$('xpTxt').textContent=`${Math.floor(S.xp)}/${xpNeed(S.lvl)}`+(restOn()?` · отдых ${mmss(S.rested)}`:'')+(P.rage?` · раж ×${P.rage}`:'');")
# menu
rep("const TABS=[['hero','Герой'],","const TABS=[['hero','Герой'],['log','Летопись'],")
rep("  if(t==='save')R.push({save:true});\n  return R;",
    "  if(t==='log')return logRows();\n  if(t==='save'){R.push({save:true});R.push({title:'Тряска экрана',desc:FX.shake?'Включена: экран вздрагивает от ударов, падений деревьев и смерти боссов':'Выключена',mode:true,act:'fxshake'})}\n  return R;")
rep("    if(r.note){h+=`<p class=\"note\">${r.note}</p>`;continue}","    if(r.raw){h+=r.raw;continue}\n    if(r.note){h+=`<p class=\"note\">${r.note}</p>`;continue}")
rep("r.itm&&JSON.stringify(r.itm.mods),r.eqd]","r.itm&&JSON.stringify(r.itm.mods),r.eqd,r.raw]")
rep("tab!=='hero'&&tab!=='items')h+=","tab!=='hero'&&tab!=='items'&&tab!=='log')h+=")
rep("function doAct(a){\n","function doAct(a){\n  if(a==='fxshake'){FX.shake=!FX.shake;try{localStorage.setItem('lumber-camp-shake',FX.shake?'1':'0')}catch(e){}return}\n")
# hero tab
rep("""      R.push({note:`<b style="color:${BR_COL[br]}">${br}</b>`});
      for(const k of ks)R.push({title:PERKS[k].name,lvl:`${pr(k)}/${PERKS[k].max}`,desc:PERKS[k].desc});
    }""","""      const pts=brPts(br),nm=nextMast(br);
      R.push({note:`<b style="color:${BR_COL[br]}">${br}</b> · очков в ветке: ${pts}${nm?` · до мастерства «${nm.name}» ещё ${nm.at-pts}`:' · все мастерства открыты'}`});
      for(const k of ks)R.push({title:PERKS[k].name,lvl:`${pr(k)}/${PERKS[k].max}`,desc:PERKS[k].desc});
      for(const m of MASTERY[br])R.push({title:(pts>=m.at?'★ ':'☆ ')+m.name,lvl:pts>=m.at?'мастерство открыто':`мастерство на ${m.at} очках`,desc:m.desc});
    }
    R.push({note:'<b>Сочетания</b> · включаются сами, когда собраны оба условия'});
    for(const c of COMBOS){const ok=c.ok();R.push({title:(ok?'✦ ':'')+c.name,lvl:ok?'действует':'не собрано',desc:`${c.desc}. Нужно: ${c.need}`})}""")
# css
rep(".note{font-size:12px",".cdx{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;margin:2px 0 12px}.cdx-c{display:flex;gap:10px;align-items:flex-start;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:8px;min-width:0}.cdx-c>i{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-style:normal;color:var(--muted);background:rgba(255,255,255,.06)}.cdx-c>img{flex:none}.cdx-c>div{min-width:0;flex:1}.cdx-c b{display:block;font-size:13px}.cdx-c small{display:block;color:var(--muted);font-size:11px;line-height:1.35}.cdx-c p{margin:4px 0 0;font-size:11px;color:var(--muted);line-height:1.35}.cdx-c.unk{opacity:.55}.cdx-c.ach.done>i{color:#f4c766;background:rgba(244,199,102,.12)}.cdx-c .bar{margin-top:5px}\n.note{font-size:12px")
open(p,'w').write(s)
print('ok')
