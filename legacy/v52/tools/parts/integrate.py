import re
p='src/lumber-camp.html';s=open(p).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:100]);s=s.replace(a,b)
endgame=open('tools/parts/endgame.js').read()
bosses=open('tools/parts/bosses.js').read()

# ================= CONFIG =================
rep("""    1:{name:'Матка гнильцов',    ability:'summon'},
    2:{name:'Вожак бродяг',      ability:'charge'},
    3:{name:'Вурдалак-громила',  ability:'slam'},
    4:{name:'Болотная ведьма',   ability:'summon'},
    5:{name:'Лихо одноглазое',   ability:'charge'},
    6:{name:'Пепельный великан', ability:'slam'},
    7:{name:'Царь Мор',          ability:'all'},""",
"""    1:{name:'Королева слизи',     ability:'summon', skin:'slime'},
    2:{name:'Древень',            ability:'slam',   skin:'treant'},
    3:{name:'Двуглавая гидра',    ability:'slam',   skin:'hydra'},
    4:{name:'Болотный ящер',      ability:'charge', skin:'croc'},
    5:{name:'Крылатый змей',      ability:'dragon', skin:'dragon'},
    6:{name:'Пепельный голем',    ability:'slam',   skin:'golem'},
    7:{name:'Царь Мор',           ability:'all',    skin:'lich'},""")
# resources: iron & shards
IRON='<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 10.5l2.2-4.6h7.6L14 10.5z" fill="#7d8592"/><path d="M4.2 5.9h7.6l-1.1-2.2H5.3z" fill="#a9b2bf"/><path d="M2 10.5h12v2.3H2z" fill="#5a616c"/></svg>'
SHARD='<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5l4.5 5L8 14.5 3.5 6.5z" fill="#b47ae6"/><path d="M8 1.5l4.5 5H3.5z" fill="#d4a8f5"/></svg>'
KEY='<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="5" cy="8" r="3.2" fill="none" stroke="#f4c766" stroke-width="1.8"/><path d="M8 8h6.5M12 8v2.5M14 8v2" stroke="#f4c766" stroke-width="1.8" fill="none"/></svg>'
rep("const RES = {wood:{name:'Древесина', icon:","const RES = {iron:{name:'Железо', icon:'"+IRON+"'}, shard:{name:'Осколки', icon:'"+SHARD+"'}, key:{name:'Ключи от склепов', icon:'"+KEY+"'}, wood:{name:'Древесина', icon:")
rep("const disc = c => {const k=1-0.05*pr('thrift');return {w:Math.ceil(c.w*k),s:Math.ceil((c.s||0)*k)}};",
    "const disc = c => {const k=1-0.05*pr('thrift');return {w:Math.ceil((c.w||0)*k),s:Math.ceil((c.s||0)*k),i:c.i||0,sh:c.sh||0}};")
rep("const costHtml = c0 => {const c=disc(c0);return resHtml(c.w)+(c.s?' '+resHtml(c.s,'stone'):'')};",
    "const costHtml = c0 => {const c=disc(c0);return [c.w?resHtml(c.w):'',c.s?resHtml(c.s,'stone'):'',c.i?resHtml(c.i,'iron'):'',c.sh?resHtml(c.sh,'shard'):''].filter(Boolean).join(' ')||'бесплатно'};")

# perks / gear hooks in stat functions
rep("const bagCap = l => 10 + 6*(l-1) + 4*pr('pack');","const bagCap = l => 10 + 6*(l-1) + 4*pr('pack');")
rep("const speedOf= l => Math.round((150 + 15*(l-1))*(1+0.06*pr('legs')));","const speedOf= l => Math.round((150 + 15*(l-1))*(1+0.06*pr('legs'))*(1+gear('move')/100));")
rep("const maxHp  = l => 10 + 6*(l-1) + 8*pr('vit');","const maxHp  = l => Math.round(10 + 6*(l-1) + 8*pr('vit') + gear('hp') + 15*rl('heart'));")
rep("const dashCd = () => DASH.cd*(1-0.15*pr('agile'));","const dashCd = () => DASH.cd*(1-0.15*pr('agile'))*(hasUq('shadow')?0.5:1);")
rep("const woodRate  = () => S.jobs.wood*0.04*(1+bestCleared())*(1+0.1*pr('boss'));\nconst stoneRate = () => S.jobs.stone*0.025*(1+bestCleared())*(1+0.1*pr('boss'));",
    "const woodRate  = () => S.jobs.wood*0.04*(1+bestCleared())*(1+0.1*pr('boss'))*(1+0.15*rl('gather'));\nconst stoneRate = () => S.jobs.stone*0.025*(1+bestCleared())*(1+0.1*pr('boss'))*(1+0.15*rl('gather'));")
rep("const residents = () => S.houses*2;","const residents = () => S.houses*2+(S.extraRes||0);")
rep("const bagTotal = () => S.bag+S.bagStone;","const bagTotal = () => S.bag+S.bagStone+(S.bagIron||0);")

# ================= STATE =================
rep("function newState(){return {v:8,seed:randSeed(),","function newState(){return {v:9,meta:{ng:0,relics:{},wins:0,relicPend:0},inv:[],eq:{weapon:null,armor:null,amulet:null,ring:null},itemSeq:1,shards:0,iron:0,bagIron:0,keys:0,crypts:{},forge:false,forgeUp:{melee:0,bow:0},merchant:0,merchBought:0,extraRes:0,final:{killed:false},seed:randSeed(),")
rep("stats:{chopped:0,kills:0,chests:0,mined:0,bosses:0,nightKills:0,nights:0,cleanNights:0,moundsDone:0,farmsMade:0,upgrades:0}",
    "stats:{chopped:0,kills:0,chests:0,mined:0,bosses:0,nightKills:0,nights:0,cleanNights:0,moundsDone:0,farmsMade:0,upgrades:0,crypts:0}")
rep("night:{kills:0,breached:false,stolen:0,died:false,active:false,hqHit:false,blood:false,farmHit:0,farmLost:0}","night:{kills:0,breached:false,stolen:0,died:false,active:false,hqHit:false,blood:false,farmHit:0,farmLost:0,fog:false}")
rep("  if(st.weapon!=='bow'&&st.weapon!=='axe')st.weapon='axe';",
"""  if(st.weapon!=='bow'&&st.weapon!=='axe')st.weapon='axe';
  st.inv=Array.isArray(src&&src.inv)?src.inv.filter(it=>it&&SLOTS[it.slot]&&Array.isArray(it.mods)):[];
  st.crypts=(src&&src.crypts&&typeof src.crypts==='object')?{...src.crypts}:{};
  st.meta.relics={};if(src&&src.meta&&src.meta.relics)for(const k in src.meta.relics)if(RELICS[k])st.meta.relics[k]=Math.min(RELICS[k].max,src.meta.relics[k]|0);
  for(const sl in st.eq){const it=st.eq[sl];if(it&&!(SLOTS[it.slot]&&Array.isArray(it.mods)))st.eq[sl]=null}
  if(!st.itemSeq||st.itemSeq<2)st.itemSeq=1+Math.max(0,...st.inv.map(i=>i.id||0),...Object.values(st.eq).map(i=>i?i.id:0));""")
rep("function save(){try{S.lastSeen=Date.now();","function save(){try{if(DG){S.p.x=DG.ex;S.p.y=DG.ey}S.lastSeen=Date.now();")

# ================= WORLD =================
rep("""  decor=[];
  for(let i=0;i<1300;i++)decor.push({x:rng()*W_SIZE,y:rng()*W_SIZE,s:1+rng()*2.5,k:rng()});
}""","""  decor=[];
  for(let i=0;i<1300;i++)decor.push({x:rng()*W_SIZE,y:rng()*W_SIZE,s:1+rng()*2.5,k:rng()});
  // эндгейм: отдельный генератор, чтобы не сдвигать старые карты
  const rng2=mulberry(((S.seed||4242)*7+13)|0);
  for(const r of rocks){if(r.zone>=4&&rng2()<0.3){r.iron=true;r.hp=rockMax(r)}}
  const sw=patches.find(p=>p.kind==='swamp'&&p.zone===4),l4=lairs.find(l=>l.zone===4);
  if(sw&&l4){l4.x=sw.x;l4.y=sw.y}
  buildCrypts(spots,rng2);
}
const rockMax = r => CFG.rocks.hp[r.zone]*(r.iron?1.5:1);""")
rep("r.alive=true;r.hp=CFG.rocks.hp[r.zone]","r.alive=true;r.hp=rockMax(r)")
rep("  const mx=CFG.rocks.hp[r.zone];\n","  const mx=rockMax(r);\n")
rep("const mx=CFG.rocks.hp[t.zone];t.hp-=","const mx=rockMax(t);t.hp-=")
rep("      for(const t of list){if(!t.alive||t.claim||Math.abs(t.x-q.x)>R)continue;","      for(const t of list){if(!t.alive||t.claim||t.iron||Math.abs(t.x-q.x)>R)continue;")

# zombie scaling
rep("  const z={tier,x,y,hp:c.hp,max:c.hp,r:c.r,dmg:c.dmg,speed:c.speed,","  const ng=ngMul();\n  const z={tier,x,y,hp:c.hp*ng,max:c.hp*ng,r:c.r,dmg:Math.ceil(c.dmg*ng),speed:c.speed,")
rep("  if(k){z.kind=kind;z.max=z.hp=Math.max(1,c.hp*k.hp);","  if(k){z.kind=kind;z.max=z.hp=Math.max(1,c.hp*k.hp*ng);")
rep("  z.boss=zid;z.max=z.hp=c.hp*6;z.r=c.r*2;z.dmg=Math.ceil(c.dmg*1.6);z.speed=c.speed*0.72;\n  z.ab=CFG.bosses[zid].ability;",
    "  z.boss=zid;z.max=z.hp=c.hp*6*ngMul();z.r=c.r*2;z.dmg=Math.ceil(c.dmg*1.6*ngMul());z.speed=c.speed*0.72;z.skin=CFG.bosses[zid].skin;\n  z.ab=CFG.bosses[zid].ability;")

# ================= BOSS AI =================
rep("    if(z.boss){\n      const home=dist(z.x,z.y,z.hx,z.hy);","    if(z.boss||z.guard){\n      const home=dist(z.x,z.y,z.hx,z.hy);")
rep("      if(z.slam>0){z.slam-=dt;if(z.slam<=0){sfx.slam();if(dist(z.x,z.y,P.x,P.y)<95)damagePlayer(z.dmg*1.8)}continue}\n      z.abT-=dt;",
    "      if(z.slam>0){z.slam-=dt;if(z.slam<=0){sfx.slam();if(dist(z.x,z.y,P.x,P.y)<95)damagePlayer(z.dmg*1.8)}continue}\n      if(bossAbility(z,dP,dt))continue;\n      z.abT-=dt;")
rep("      const chase=dP<300&&home<420;","      const chase=z.final||z.guard?dP<700:dP<300&&home<420;")
rep("          if(n<6){for(let k=0;k<2;k++){const a=Math.random()*6.28,q=makeZombie(z.tier,z.x+Math.cos(a)*50,z.y+Math.sin(a)*50,false,null);q.owner=z;zombies.push(q)}sfx.roar(0.35)}",
    "          if(n<6){for(let k=0;k<2;k++){const a=Math.random()*6.28,q=makeZombie(z.tier,z.x+Math.cos(a)*50,z.y+Math.sin(a)*50,false,null);q.owner=z;if(z.dun!=null)q.dun=z.dun;if(z.skin==='slime'){q.skin='slimelet';q.r*=0.8}zombies.push(q)}sfx.roar(0.35)}")
rep("    let tx,ty,sp=z.speed*(inSwamp(z.x,z.y)?0.6:1);","    let tx,ty,sp=z.speed*(inSwamp(z.x,z.y)?(z.skin==='croc'?1.5:0.6):1);\n    if(z.burn>0){z.burn-=dt;z.hp-=z.burnDps*dt;if(z.hp<=0){killZombie(z);continue}}")
# non-boss AI: dungeon & caravan hunters
rep("      const aggro=z.wave?160:180;\n      if(dP<aggro){tx=P.x;ty=P.y}",
"""      const aggro=z.wave?160:z.dun!=null?700:180;
      let rf=null;if(z.hunt&&refugees.length){let bd=600;for(const r of refugees){const d=dist(z.x,z.y,r.x,r.y);if(d<bd){bd=d;rf=r}}}
      if(rf&&dP>120){tx=rf.x;ty=rf.y}
      else if(dP<aggro){tx=P.x;ty=P.y}""")

# ================= HIT / KILL / DAMAGE =================
rep("function hitEnemy(t,dmg){if(t.k==='z')hitZombie(t.o,dmg,P.x,P.y);else hitMound(t.o,dmg)}",
    "function hitEnemy(t,dmg,src,crit){if(t.k==='z'){if(crit)addFloat(t.o.x,t.o.y-t.o.r-6,'крит!','#f4c766');if(canHit(t.o,src))maybeBurn(t.o,dmg);hitZombie(t.o,dmg,P.x,P.y,src)}else hitMound(t.o,dmg)}")
rep("function hitZombie(z,dmg,fx,fy){\n  if(!zombies.includes(z))return;",
    "function hitZombie(z,dmg,fx,fy,src){\n  if(!zombies.includes(z))return;\n  if(!canHit(z,src)){if(!z.immT||performance.now()-z.immT>700){z.immT=performance.now();addFloat(z.x,z.y-z.r-20,z.fly?'неуязвим: бейте луком':'неуязвим: бейте топором','#9fc3d6')}return}")
rep("  if(!z.boss){const d=dist(z.x,z.y,fx,fy)||1;z.x+=(z.x-fx)/d*10;z.y+=(z.y-fy)/d*10}","  if(!z.boss&&!z.guard){const d=dist(z.x,z.y,fx,fy)||1;z.x+=(z.x-fx)/d*10;z.y+=(z.y-fy)/d*10}")
rep("hitZombie(foe,militiaDmg(q.zone),pe.x,pe.y)","hitZombie(foe,militiaDmg(q.zone),pe.x,pe.y,'melee')")
rep("hitZombie(best,farmTowerDmg(q.zone,f.tower)*(1+0.12*pr('eng')),tp.x,tp.y)","hitZombie(best,farmTowerDmg(q.zone,f.tower)*(1+0.12*pr('eng')),tp.x,tp.y,'ranged')")
rep("hitZombie(best,towerDmg(l)*(1+0.12*pr('eng')),tp.x,tp.y)","hitZombie(best,towerDmg(l)*(1+0.12*pr('eng')),tp.x,tp.y,'ranged')")
rep("hitZombie(best,guardDmg(),gp.x,gp.y)","hitZombie(best,guardDmg(),gp.x,gp.y,'ranged')")
rep("      P.cd=bowCd(S.bow);P.shot=0.2;sfx.shoot();","      P.cd=bowCd(S.bow)/(1+gear('spd')/100);P.shot=0.2;sfx.shoot();")
rep("      hitEnemy(t,bowDmg(S.bow)*(1+0.12*pr('str'))*atkMul());","      {const [d,cr]=heroHit(bowDmg(S.bow)*(1+0.12*pr('str'))*atkMul()*(1+0.2*S.forgeUp.bow));hitEnemy(t,d,'ranged',cr)}")
rep("    }else{P.cd=axeCd(S.up.axe);P.swing=0.18;sfx.hit();hitEnemy(t,axeDmg(S.up.axe)*(1+0.12*pr('str'))*atkMul())}",
    "    }else{P.cd=axeCd(S.up.axe)/(1+gear('spd')/100);P.swing=0.18;sfx.hit();const [d,cr]=heroHit(axeDmg(S.up.axe)*(1+0.12*pr('str'))*atkMul()*(1+0.2*S.forgeUp.melee));hitEnemy(t,d,'melee',cr)}")
rep("  }else if(t.k==='t'){P.cd=axeCd(S.up.axe);P.swing=0.18;chop(t.o,axeDmg(S.up.axe)*(1+0.15*pr('hand')))}\n  else{P.cd=pickCd(S.up.pick);P.swing=0.18;mine(t.o,pickDmg(S.up.pick)*(1+0.15*pr('hand')))}",
"""  }else{
    const gm=(1+0.15*pr('hand'))*(1+gear('gather')/100)*(1+0.15*rl('gather'));
    const fell=hasUq('felling')&&(P.fell||0)<=0;if(fell){P.fell=10;addFloat(P.x,P.y-30,'Удар Первого Лесоруба!','#f0a040')}
    if(t.k==='t'){P.cd=axeCd(S.up.axe)/(1+gear('spd')/100);P.swing=0.18;chop(t.o,fell?1e6:axeDmg(S.up.axe)*gm)}
    else{P.cd=pickCd(S.up.pick)/(1+gear('spd')/100);P.swing=0.18;mine(t.o,fell?1e6:pickDmg(S.up.pick)*gm)}
  }""")
rep("    const dbl=Math.random()<0.2*pr('luck'), add=Math.min(tt.wood*(dbl?2:1),bagCap(S.up.bag)-bagTotal());",
    "    const dbl=Math.random()<0.2*pr('luck')+gear('dbl')/100, add=Math.min(tt.wood*(dbl?2:1),bagCap(S.up.bag)-bagTotal());")
rep("    const dbl=Math.random()<0.2*pr('luck'), add=Math.min(CFG.rocks.stone[r.zone]*(dbl?2:1),bagCap(S.up.bag)-bagTotal());gainXp(0.8*r.zone);\n    S.bagStone+=add;",
    "    const dbl=Math.random()<0.2*pr('luck')+gear('dbl')/100, add=Math.min((r.iron?ironOf(r):CFG.rocks.stone[r.zone])*(dbl?2:1),bagCap(S.up.bag)-bagTotal());gainXp(0.8*r.zone*(r.iron?2:1));\n    if(r.iron)S.bagIron=(S.bagIron||0)+add;else S.bagStone+=add;")
rep("    addFloat(r.x,r.y-20,(dbl?'Двойная! ':'')+'+'+add+' камня','#c9c7bd');","    addFloat(r.x,r.y-20,(dbl?'Двойная! ':'')+'+'+add+(r.iron?' железа':' камня'),r.iron?'#a9b2bf':'#c9c7bd');")
rep("function damagePlayer(n){if(P.inv>0){addFloat(P.x,P.y-24,'уклон','#9fc3d6');return}S.p.hp-=n;",
    "function damagePlayer(n){if(P.inv>0){addFloat(P.x,P.y-24,'уклон','#9fc3d6');return}n*=1-Math.min(0.6,gear('armor')/100);S.p.hp-=n;")
# kill rewards
rep("  gainXp(z.boss?40*z.boss:1.5*z.tier*(z.kind==='ram'?1.5:1));\n  if(pr('vamp'))S.p.hp=Math.min(maxHp(S.up.hp),S.p.hp+pr('vamp'));",
"""  gainXp(z.final?500:z.boss?40*z.boss:z.guard?30*z.tier:1.5*z.tier*(z.kind==='ram'?1.5:1));
  if(pr('vamp')||gear('vamp'))S.p.hp=Math.min(maxHp(S.up.hp),S.p.hp+pr('vamp')+gear('vamp'));
  if(z.final){S.final.killed=true;S.meta.wins++;sfx.roar(0.8);drops.push({x:z.x,y:z.y,kind:'item',it:makeItem(7,3),t:600});save();setTimeout(showVictory,1500);return}
  if(z.guard){S.stats.crypts++;return}
  if(z.mimic){drops.push({x:z.x,y:z.y,kind:'item',it:makeItem(z.tier,2),t:120});toast('Мимик повержен, из него выпала ценная вещь','good');return}""")
rep("    drops.push({x:z.x+24,y:z.y+10,kind:'potion',t:120});","    drops.push({x:z.x+24,y:z.y+10,kind:'potion',t:120});\n    drops.push({x:z.x,y:z.y-30,kind:'item',it:makeItem(zid,1),t:300});S.keys++;toast('С босса выпал ключ от склепа','good');")
rep("  const r=Math.random();\n  if(r<LOOT.potion)drops.push","  const r=Math.random()/(1+gear('loot')/100);\n  if(z.dun==null&&Math.random()<0.012*(1+gear('loot')/100)){S.keys++;addFloat(z.x,z.y-30,'+ключ','#f4c766')}\n  if(r<LOOT.potion)drops.push")
rep("    m.dead=true;S.mounds[m.id]=true;sfx.crumble();S.stats.moundsDone++;gainXp(10*m.zone);","    m.dead=true;S.mounds[m.id]=true;sfx.crumble();S.stats.moundsDone++;gainXp(10*m.zone);S.keys++;toast('В могильнике нашёлся ключ от склепа','good');if(Math.random()<0.4)drops.push({x:m.x+20,y:m.y,kind:'item',it:makeItem(m.zone,0),t:180});")
# drops pickup: items, mimic, chest items, pot cap
rep("    if(d.kind==='chest'){const w=chestWood(d.tier);","    if(d.kind==='item'){pickItem(d);continue}\n    if(d.kind==='chest'&&Math.random()<0.1){d.t=0;const z=makeZombie(Math.min(7,d.tier||1),d.x,d.y,false,null);z.mimic=true;z.skin='mimic';z.max=z.hp=z.hp*4;z.r=16;z.dmg=Math.ceil(z.dmg*1.5);zombies.push(z);sfx.roar(0.4);toast('Это мимик! Сундук кусается.','bad');continue}\n    if(d.kind==='chest'){if(Math.random()<0.25)giveItem(makeItem(d.tier||1,0),d.x+20,d.y);const w=chestWood(d.tier);")
s=s.replace("if(S.potAtk<LOOT.potionMax)","if(S.potAtk<potMax())").replace("Зелий силы уже ${LOOT.potionMax}","Зелий силы уже ${potMax()}").replace("else if(S.potions<LOOT.potionMax)","else if(S.potions<potMax())").replace("Зелий лечения уже ${LOOT.potionMax}","Зелий лечения уже ${potMax()}")
# deposit iron, death in dungeon, spits color, dungeon updates
rep("      const parts=[];if(S.bag)parts.push(S.bag+' древесины');if(S.bagStone)parts.push(S.bagStone+' камня');\n      S.wood+=S.bag;S.stone+=S.bagStone;addFloat(CX,CY-30,'+'+parts.join(', '),'#e98b3d');sfx.deposit();S.bag=0;S.bagStone=0;save();",
    "      const parts=[];if(S.bag)parts.push(S.bag+' древесины');if(S.bagStone)parts.push(S.bagStone+' камня');if(S.bagIron)parts.push(S.bagIron+' железа');\n      S.wood+=S.bag;S.stone+=S.bagStone;S.iron+=S.bagIron||0;addFloat(CX,CY-30,'+'+parts.join(', '),'#e98b3d');sfx.deposit();S.bag=0;S.bagStone=0;S.bagIron=0;save();")
rep("    const lw=S.bag,ls=S.bagStone;S.bag=0;S.bagStone=0;p.hp=maxHp(S.up.hp);","    if(DG){for(let i=zombies.length-1;i>=0;i--)if(zombies[i].dun!=null)zombies.splice(i,1);DG=null;spits=[]}\n    const lw=S.bag,ls=S.bagStone;S.bag=0;S.bagStone=0;S.bagIron=0;p.hp=maxHp(S.up.hp);")
rep("  P.x=Math.max(20,Math.min(W_SIZE-20,P.x));P.y=Math.max(20,Math.min(W_SIZE-20,P.y));\n  p.x=P.x;p.y=P.y;",
    "  if(DG)updateDungeon(dt);\n  else{P.x=Math.max(20,Math.min(W_SIZE-20,P.x));P.y=Math.max(20,Math.min(W_SIZE-20,P.y))}\n  p.x=P.x;p.y=P.y;\n  P.fell=Math.max(0,(P.fell||0)-dt);updateRoots(dt);updateRefugees(dt);")
rep("if(sp.t>0&&dist(sp.x,sp.y,P.x,P.y)<14){sp.t=0;damagePlayer(sp.dmg)}","if(sp.t>0&&dist(sp.x,sp.y,P.x,P.y)<14+(sp.r||0)*0.5){sp.t=0;damagePlayer(sp.dmg)}")

# special targets (crypt, portal, dungeon)
rep("  if(best)return best;\n  const ft=farmTarget();if(ft)return ft;","  if(best)return best;\n  const xt=specialTarget();if(xt)return xt;\n  const ft=farmTarget();if(ft)return ft;")
rep("function doAction(t){\n  if(t.k==='f'){farmAction(t);return}","function doAction(t){\n  if(t.k==='f'){farmAction(t);return}\n  if(t.k==='x'){P.cd=0.5;t.fn();return}")
rep("  if(t&&(!t.ok||t.k==='f')){","  if(t&&(!t.ok||t.k==='f'||t.k==='x')){")
rep("  const lbl=t&&t.k==='f'?(t.lbl||'Рубить'):","  const lbl=t&&(t.k==='f'||t.k==='x')?(t.lbl||'Рубить'):")
rep("function findTarget(){","""function specialTarget(){
  const near=(o,r)=>o&&Math.abs(o.x-P.x)<r&&dist(o.x,o.y,P.x,P.y)<r;
  if(DG){
    if(near(DG.entry,60))return {k:'x',o:DG.entry,ok:true,lbl:'Выйти',msg:'Покинуть склеп (сокровища останутся непройденными)',fn:()=>leaveCrypt('Вы покинули склеп')};
    if(DG.chest&&!DG.chest.open&&near(DG.chest,60))return {k:'x',o:DG.chest,ok:true,lbl:'Открыть',msg:'Открыть сундук хранителя',fn:openDunChest};
    if(DG.exit&&near(DG.exit,60))return {k:'x',o:DG.exit,ok:true,lbl:'Выйти',msg:'Портал наружу',fn:()=>leaveCrypt('Склеп пройден!')};
    return null;
  }
  for(const c of crypts){
    if(!near(c,58))continue;
    const cd=S.crypts[c.id]||0;
    if(cd>S.day)return {k:'x',o:c,ok:false,msg:`Склеп запечатан до ${cd}-го дня`,fn:()=>{}};
    if(S.keys<=0)return {k:'x',o:c,ok:false,msg:'Нужен ключ от склепа: падает с могильников, боссов и у торговца',fn:()=>{}};
    return {k:'x',o:c,ok:true,lbl:'Войти',msg:`Войти в склеп (${zoneById(c.zone).name}): потратить ключ, их у вас ${S.keys}`,fn:()=>enterCrypt(c)};
  }
  const pp=portalPos();
  if(pp&&allCleared()&&!S.final.killed&&near(pp,70)&&!zombies.some(z=>z.final))return {k:'x',o:pp,ok:true,lbl:'Призвать',msg:'Портал Мора. Призвать Владыку Мора — финальная битва',fn:summonFinal};
  return null;
}
function findTarget(){""")

# ================= START/END NIGHT EVENTS =================
rep("  const blood=isBlood(S.day);\n  S.night={kills:0,breached:false,stolen:0,died:false,active:true,hqHit:false,blood};",
    "  const blood=isBlood(S.day);\n  const fog=!blood&&S.day>=4&&Math.random()<0.15;\n  S.night={kills:0,breached:false,stolen:0,died:false,active:true,hqHit:false,blood,fog};\n  const side=!blood&&S.day>=5&&Math.random()<0.25?randOf(SIDES):null;\n  if(S.merchant===S.day){S.merchant=0;toast('Торговец ушёл до темноты','')}")
rep("    const a=Math.random()*6.28,r=620+Math.random()*120;","    const a=side?side[1]+(Math.random()-0.5)*1.1:Math.random()*6.28,r=620+Math.random()*120;")
rep("  sfx.night();if(blood){","  if(fog)toast('Туманная ночь: видно хуже, награда на рассвете ×1,3','bad');\n  if(side)toast(`Нашествие с ${side[0]}! Все мертвецы идут с одной стороны.`,'bad');\n  sfx.night();if(blood){")
rep("bloodMult=N.blood?BLOOD_MULT:1;","bloodMult=(N.blood?BLOOD_MULT:1)*(N.fog?1.3:1);")
rep("  if(N.blood)rows.splice(1,0,['Кровавая луна','×1.5']);","  if(N.blood)rows.splice(1,0,['Кровавая луна','×1.5']);\n  if(N.fog)rows.splice(1,0,['Туманная ночь','×1.3']);")
rep("  S.day++;sfx.dawn();","  S.day++;sfx.dawn();\n  if(hasUq('heart')&&S.potions<potMax()){S.potions++;toast('Сердце Мора: +1 зелье лечения','good')}\n  if(S.day>=3&&S.day%3===0){S.merchant=S.day;S.merchBought=0;setTimeout(()=>toast('В лагерь пришёл торговец. Он уйдёт с наступлением ночи.','good'),1200)}\n  if(S.day>=4&&!refugees.length&&Math.random()<0.25)setTimeout(spawnCaravan,2500);")

# ================= RENDER =================
rep("  // хижины и руины\n","  // склепы и портал\n  for(const c of crypts)if(vis(c.x,c.y))drawCrypt(c,now);\n  {const pp=portalPos();if(pp&&allCleared()&&!S.final.killed&&vis(pp.x,pp.y))drawPortal(pp,now)}\n  if(DG)drawDungeon(now);\n  // хижины и руины\n")
rep("  ents.push({y:P.y,f:drawPlayer});","  for(const r of refugees)if(vis(r.x,r.y))ents.push({y:r.y,f:()=>drawRefugee(r)});\n  if(merchantHere()&&vis(CX,CY))ents.push({y:CY+56,f:()=>drawMerchant(now)});\n  ents.push({y:P.y,f:drawPlayer});")
rep("  for(const sp of spits){ctx.fillStyle='rgba(120,200,90,.35)';","  drawRoots();\n  for(const sp of spits){if(sp.col){ctx.fillStyle=sp.col;ctx.globalAlpha=0.35;ctx.beginPath();ctx.arc(sp.x-sp.vx*0.03,sp.y-sp.vy*0.03,(sp.r||5)+3,0,7);ctx.fill();ctx.globalAlpha=1;ctx.beginPath();ctx.arc(sp.x,sp.y,sp.r||5,0,7);ctx.fill();continue}ctx.fillStyle='rgba(120,200,90,.35)';")
rep("  const dk=darkness();\n  if(dk>0){","  const dk=DG?0.55:Math.min(0.9,darkness()*(S.night.fog&&S.night.active?1.2:1));\n  if(dk>0){")
rep("    hole(P.x,P.y,190);","    hole(P.x,P.y,DG?230:S.night.fog&&S.night.active?120:190);if(DG){for(const r of DG.rooms){hole(r.x+30,r.y+30,90);hole(r.x+r.w-30,r.y+30,90)}if(DG.chest)hole(DG.chest.x,DG.chest.y,120)}for(const c of crypts)hole(c.x,c.y,60);")
# drawZombie boss art
rep("  ctx.fillStyle=z.hit>0?'#f0e6d0':(z.kind?ZTYPES[z.kind].col:c.col);ctx.beginPath();ctx.arc(z.x,z.y+bob,z.r,0,7);ctx.fill();\n",
"""  if(z.burn>0){ctx.fillStyle='rgba(255,140,40,.8)';for(let k=0;k<3;k++){const t=(performance.now()/300+k*0.33+z.ph)%1;ctx.fillRect(z.x-6+k*6,z.y-z.r*0.5-t*14,3,3)}}
  if(z.boss||z.guard||z.mimic){
    drawBoss(z,bob);
    if(!z.mimic){
      ctx.font='700 13px Rubik, sans-serif';ctx.textAlign='center';const ny=z.y-z.r-(z.fly?52:18)-(z.skin==='treant'||z.skin==='lich'||z.skin==='lord'?z.r*0.6:0);
      ctx.fillStyle='#000';ctx.fillText(z.name,z.x+1,ny+1);ctx.fillStyle=z.final?'#ff8a7a':'#f2b8b0';ctx.fillText(z.name,z.x,ny);
      const w=Math.max(60,z.r*2.4);ctx.fillStyle='#000';ctx.fillRect(z.x-w/2,ny+5,w,6);ctx.fillStyle='#cf4b3f';ctx.fillRect(z.x-w/2,ny+5,w*Math.max(0,z.hp/z.max),6);
    }else if(z.hp<z.max){ctx.fillStyle='#000';ctx.fillRect(z.x-16,z.y-z.r-12,32,4);ctx.fillStyle='#cf4b3f';ctx.fillRect(z.x-16,z.y-z.r-12,32*z.hp/z.max,4)}
    return;
  }
  if(z.skin==='slimelet'){ctx.fillStyle=z.hit>0?'#f0e6d0':'rgba(110,190,80,.85)';ctx.beginPath();ctx.ellipse(z.x,z.y+bob,z.r*1.1,z.r*0.85,0,0,7);ctx.fill();ctx.fillStyle='#1d2a14';ctx.fillRect(z.x-4,z.y+bob-3,2.5,2.5);ctx.fillRect(z.x+2,z.y+bob-3,2.5,2.5);if(z.hp<z.max){ctx.fillStyle='#000';ctx.fillRect(z.x-12,z.y-z.r-8,24,3);ctx.fillStyle='#cf4b3f';ctx.fillRect(z.x-12,z.y-z.r-8,24*z.hp/z.max,3)}return}
  ctx.fillStyle=z.hit>0?'#f0e6d0':(z.kind?ZTYPES[z.kind].col:c.col);ctx.beginPath();ctx.arc(z.x,z.y+bob,z.r,0,7);ctx.fill();
""")
# remove old generic boss horns/name block
a=s.index("  if(z.boss){\n    ctx.fillStyle='#d8cfb8';")
b=s.index("    return;\n  }\n",a)+len("    return;\n  }\n")
s=s[:a]+s[b:]
# iron rock look
rep("  ctx.fillStyle=base;ctx.beginPath();\n  for(let k=0;k<7;k++)","  ctx.fillStyle=r.iron?'#4c4a4e':base;ctx.beginPath();\n  for(let k=0;k<7;k++)")
rep("  if(r.zone>=4){ctx.fillStyle=r.zone>=6?","  if(r.iron){ctx.fillStyle='#b8682e';ctx.fillRect(x-s*0.4,y-6,4,2.5);ctx.fillRect(x+s*0.1,y-2,3,2);ctx.fillStyle='#c9d0da';ctx.fillRect(x-s*0.1,y-9,2.5,2.5);ctx.fillRect(x+s*0.3,y-4,2,2)}\n  else if(r.zone>=4){ctx.fillStyle=r.zone>=6?")
# item drop drawing
rep("    const flask=d.kind==='potion'||d.kind==='potatk';","    if(d.kind==='item'){const col=RAR[d.it.rar].col;ctx.globalAlpha=0.35+0.15*Math.sin(now/200);ctx.fillStyle=col;ctx.fillRect(x-2,y-60,4,56);ctx.globalAlpha=1;const g2=ctx.createRadialGradient(x,y,1,x,y,20);g2.addColorStop(0,col);g2.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g2;ctx.globalAlpha=0.5;ctx.beginPath();ctx.arc(x,y,20,0,7);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#6b4a2c';ctx.beginPath();ctx.arc(x,y+2,7,0,7);ctx.fill();ctx.fillStyle=col;ctx.fillRect(x-5,y-6,10,4);continue}\n    const flask=d.kind==='potion'||d.kind==='potatk';")
# minimap
rep("  mctx.fillStyle='#e98b3d';mctx.beginPath();mctx.arc(120,120,4,0,7);mctx.fill();","  for(const c of crypts){mctx.fillStyle=(S.crypts[c.id]||0)>S.day?'#5a4a6a':'#c08ae8';mctx.fillRect(ox+c.x*sc-2.5,oy+c.y*sc-2.5,5,5)}\n  {const pp=portalPos();if(pp&&allCleared()&&!S.final.killed){mctx.fillStyle='#ff4a3a';mctx.beginPath();mctx.arc(ox+pp.x*sc,oy+pp.y*sc,5+Math.sin(performance.now()/200),0,7);mctx.fill()}}\n  for(const r of refugees){mctx.fillStyle='#9fc3d6';mctx.fillRect(ox+r.x*sc-2,oy+r.y*sc-2,4,4)}\n  mctx.fillStyle='#e98b3d';mctx.beginPath();mctx.arc(120,120,4,0,7);mctx.fill();")
rep("  mctx.fillStyle='#ece6d3';mctx.beginPath();mctx.arc(ox+P.x*sc,oy+P.y*sc,5,0,7);mctx.fill();","  if(!DG){mctx.fillStyle='#ece6d3';mctx.beginPath();mctx.arc(ox+P.x*sc,oy+P.y*sc,5,0,7);mctx.fill()}")

# ================= HUD =================
rep("  setHtml('bagVal',`${resHtml(S.bag)} ${resHtml(S.bagStone,'stone')} <span","  setHtml('bagVal',`${resHtml(S.bag)} ${resHtml(S.bagStone,'stone')}${S.bagIron?' '+resHtml(S.bagIron,'iron'):''} <span")
s=s.replace("setHtml('storeVal',`${resHtml(S.wood+","setHtml('storeVal',`${S.iron||S.forge?resHtml(S.iron,'iron')+' ':''}${resHtml(S.wood+",1)
rep("  setHtml('mStore',`Склад: ${resHtml(S.wood)} ${resHtml(S.stone,'stone')}`);","  setHtml('mStore',`Склад: ${resHtml(S.wood)} ${resHtml(S.stone,'stone')} ${resHtml(S.iron,'iron')} ${resHtml(S.shards,'shard')} ${resHtml(S.keys,'key')}`);")

# ================= SPEND / GATE =================
rep("function spend(c0){const c=disc(c0);if(!inCamp()||S.wood<c.w||S.stone<(c.s||0))return false;S.wood-=c.w;S.stone-=(c.s||0);",
    "function spend(c0){const c=disc(c0);if(!inCamp()||S.wood<c.w||S.stone<(c.s||0)||S.iron<c.i||S.shards<c.sh)return false;S.wood-=c.w;S.stone-=(c.s||0);S.iron-=c.i;S.shards-=c.sh;")
rep("function spendAny(c0){const c=disc(c0);if(S.wood<c.w||S.stone<(c.s||0))return false;S.wood-=c.w;S.stone-=(c.s||0);",
    "function spendAny(c0){const c=disc(c0);if(S.wood<c.w||S.stone<(c.s||0)||S.iron<c.i||S.shards<c.sh)return false;S.wood-=c.w;S.stone-=(c.s||0);S.iron-=c.i;S.shards-=c.sh;")
rep("  const nw=S.wood<c.w,ns=S.stone<(c.s||0);\n  return nw&&ns?'Не хватает древесины и камня':nw?'Не хватает древесины':ns?'Не хватает камня':'';\n}\nfunction rowsFor(t){",
    "  return lackMsg(c);\n}\nfunction lackMsg(c){\n  const m=[];if(S.wood<c.w)m.push('древесины');if(S.stone<(c.s||0))m.push('камня');if(S.iron<(c.i||0))m.push('железа');if(S.shards<(c.sh||0))m.push('осколков');\n  return m.length?'Не хватает '+m.join(', '):'';\n}\nfunction rowsFor(t){")

# ================= MENU =================
rep("const TABS=[['hero','Герой'],","const TABS=[['hero','Герой'],['items','Вещи'],")
rep("tabsEl.innerHTML=fq?'':TABS.map(","tabsEl.innerHTML=fq?'':TABS.concat(merchantHere()?[['shop','Торговец']]:[]).map(")
rep("  if(!fq&&!inCamp()&&tab!=='save'&&tab!=='vil'&&tab!=='farm'&&tab!=='hero')h+=","  if(tab==='shop'&&!merchantHere())tab='hero';\n  if(!fq&&!inCamp()&&tab!=='save'&&tab!=='vil'&&tab!=='farm'&&tab!=='hero'&&tab!=='items')h+=")
rep("  if(t==='camp'){\n","""  if(t==='items'){
    R.push({note:`${resHtml(S.shards,'shard')} осколков · ${resHtml(S.iron,'iron')} железа · ${resHtml(S.keys,'key')} ключей. Вещи надеваются где угодно. ${S.forge?(inCamp()?'Кузница рядом: можно улучшать и перековывать.':'Улучшать и перековывать можно в лагере, у кузницы.'):'Постройте кузницу во вкладке «Лагерь», чтобы улучшать вещи.'}`});
    for(const sl in SLOTS){const it=S.eq[sl];R.push(it?{itm:it,eqd:true}:{note:`<b>${SLOTS[sl]}</b>: пусто`})}
    R.push({note:`<b>Сумка вещей</b> ${S.inv.length}/${INV_MAX}`});
    for(const it of S.inv)R.push({itm:it,eqd:false});
    if(S.forge){
      R.push({note:'<b>Кузница: закалка</b>'});
      for(const [k,nm] of [['melee','Окованный топор: +20% урона в ближнем бою'],['bow','Железные наконечники: +20% урона луком']]){const l=S.forgeUp[k];
        if(l<3){const c=FORGE.temper(l);R.push({title:nm.split(':')[0],lvl:`${l}/3`,desc:nm.split(': ')[1]+' за уровень',cost:c,why:gateFor(c),act:'temper:'+k})}
        else R.push({title:nm.split(':')[0],lvl:'3/3',desc:'максимум'})}
    }
  }
  if(t==='shop'){
    R.push({note:'Торговец пробудет в лагере до наступления ночи.'});
    for(const m of MERCH){if(m.once&&S.merchBought)R.push({title:m.t,lvl:'куплено',desc:''});else{const c=C(m.c.w||0,m.c.s||0);c.i=m.c.i||0;R.push({title:m.t,lvl:'',desc:'',cost:c,why:gateFor(c),act:'buy:'+m.id})}}
  }
  if(t==='camp'){
    if(!S.forge){if(S.base>=FORGE.base){const c=FORGE.build;R.push({title:'Построить кузницу',lvl:'',desc:'Улучшение редкости вещей, перековка свойств, закалка оружия. Нужно железо с дальних колец.',cost:c,why:gateFor(c),act:'forge'})}else R.push({note:`Кузница откроется на ${FORGE.base} уровне главного дома.`})}
""")
# item row rendering
rep("    if(r.mode){h+=","""    if(r.itm){const it=r.itm,rc=RAR[it.rar],cmp=!r.eqd&&S.eq[it.slot]?` · сейчас надето: ${S.eq[it.slot].name}`:'';
      let btns=r.eqd?`<button class="buy sec" data-act="unequip:${it.slot}" type="button">Снять</button>`:`<button class="buy" data-act="equip:${it.id}" type="button">Надеть</button><button class="buy sec" data-act="salvage:${it.id}" type="button">Разобрать +${rc.sh}</button>`;
      if(S.forge&&inCamp()){if(it.rar<3){const c=FORGE.rar(it.rar);btns+=`<button class="buy" data-act="rarup:${it.id}" type="button" ${S.shards<c.sh||S.iron<c.i?'disabled':''}>Редкость ↑ ${costHtml(c)}</button>`}const c2=FORGE.reroll(it.rar);btns+=`<button class="buy sec" data-act="reroll:${it.id}" type="button" ${S.shards<c2.sh||S.iron<c2.i?'disabled':''}>Перековать ${costHtml(c2)}</button>`}
      h+=`<div class="item itm" style="--rc:${rc.col}"><div><h3>${it.name}<small>${rc.n} · ${SLOTS[it.slot]} · ур. ${it.tier}${r.eqd?' · надето':''}</small></h3><p>${modText(it)}${cmp}</p></div><div class="itm-b">${btns}</div></div>`;continue}
    if(r.mode){h+=""")
rep("  const sig=(fq?'F'+fq.id:tab)+'|'+inCamp()+'|'+JSON.stringify(rows.map(r=>[r.title,r.lvl,r.cost,r.why,r.note,r.k,r.md,r.boss,r.desc]));",
    "  const sig=(fq?'F'+fq.id:tab)+'|'+inCamp()+'|'+merchantHere()+'|'+S.shards+'|'+S.iron+'|'+JSON.stringify(rows.map(r=>[r.title,r.lvl,r.cost,r.why,r.note,r.k,r.md,r.boss,r.desc,r.itm&&r.itm.id,r.itm&&r.itm.rar,r.itm&&JSON.stringify(r.itm.mods),r.eqd]));")
# actions
rep("  if(k==='perkpick'){","""  if(k==='forge'&&!S.forge&&spend(FORGE.build)){S.forge=true;toast('Кузница построена. Вещи улучшаются во вкладке «Вещи».','good')}
  if(k==='equip'){const i=S.inv.findIndex(x=>x.id===+arg);if(i>=0){const it=S.inv.splice(i,1)[0],old=S.eq[it.slot];S.eq[it.slot]=it;if(old)S.inv.push(old);const mh=maxHp(S.up.hp);if(S.p.hp>mh)S.p.hp=mh;toast(`Надето: ${it.name}`,'good')}}
  if(k==='unequip'){const it=S.eq[arg];if(it){if(S.inv.length>=INV_MAX)toast('Сумка вещей полна','bad');else{S.eq[arg]=null;S.inv.push(it);const mh=maxHp(S.up.hp);if(S.p.hp>mh)S.p.hp=mh}}}
  if(k==='salvage'){const i=S.inv.findIndex(x=>x.id===+arg);if(i>=0){const it=S.inv.splice(i,1)[0];S.shards+=RAR[it.rar].sh;toast(`Разобрано: +${RAR[it.rar].sh} осколков`,'good')}}
  if(k==='rarup'||k==='reroll'){const it=S.inv.find(x=>x.id===+arg)||Object.values(S.eq).find(x=>x&&x.id===+arg);
    if(it&&S.forge&&inCamp()){const c=k==='rarup'?FORGE.rar(it.rar):FORGE.reroll(it.rar);
      if(c&&S.shards>=c.sh&&S.iron>=c.i&&(k==='reroll'||it.rar<3)){S.shards-=c.sh;S.iron-=c.i;
        if(k==='rarup'){it.rar++;const extra=rollMods(it.slot,it.tier,it.rar).filter(([mk])=>!it.mods.some(([q])=>q===mk));while(it.mods.length<RAR[it.rar].mods&&extra.length)it.mods.push(extra.shift());it.mods=it.mods.map(([mk,v])=>[mk,Math.max(v,modVal(mk,it.tier,it.rar))]);if(it.rar===3){it.uq=UNIQUES[it.slot].id;it.name=UNIQUES[it.slot].name}toast(`${it.name}: теперь ${RAR[it.rar].n.toLowerCase()}`,'good')}
        else{it.mods=rollMods(it.slot,it.tier,it.rar);toast(`${it.name}: свойства перекованы`,'good')}
        sfx.buy()}}}
  if(k==='temper'){const l=S.forgeUp[arg];if(S.forge&&l<3&&spend(FORGE.temper(l))){S.forgeUp[arg]++;toast('Закалка: +20% урона','good')}}
  if(k==='buy'){const m=MERCH.find(x=>x.id===arg);if(m&&merchantHere()&&!(m.once&&S.merchBought)){const c=C(m.c.w||0,m.c.s||0);c.i=m.c.i||0;if(spend(c)){if(m.give()===false){S.wood+=disc(c).w;S.stone+=disc(c).s;S.iron+=c.i}else{if(m.once)S.merchBought=1;toast(`Куплено: ${m.t.split(',')[0]}`,'good')}}}}
  if(k==='perkpick'){""")

# perks modal: relic choice
rep("document.getElementById('perkList').addEventListener('click',e=>{\n  const b=e.target.closest('[data-perk]');if(!b)return;const k=b.dataset.perk;",
"""document.getElementById('perkList').addEventListener('click',e=>{
  const rb=e.target.closest('[data-relic]');
  if(rb){const k=rb.dataset.relic;S.meta.relics[k]=rl(k)+1;S.meta.relicPend--;sfx.buy();toast(`Реликвия: ${RELICS[k].name} (ранг ${rl(k)})`,'good');
    if(k==='heart')S.p.hp+=15;if(k==='keyr')S.keys+=2;if(k==='hoard'){S.wood+=150;S.stone+=40}if(k==='flask')S.potions=Math.min(potMax(),S.potions+2);
    if(k==='fort'&&S.base<2){S.base=2;S.fence.lvl=Math.max(1,S.fence.lvl);S.fence.hp=fenceHp(S.fence.lvl);S.hq=hqMax(2)}
    if(k==='vet'){S.lvl+=2;S.perkPend+=2}
    save();document.getElementById('perks').hidden=true;
    if(S.meta.relicPend>0)setTimeout(showRelics,150);else if(S.perkPend>0)setTimeout(showPerks,150);return}
  const b=e.target.closest('[data-perk]');if(!b)return;const k=b.dataset.perk;""")

# ================= HTML/CSS =================
rep('<div id="menu" hidden>','''<div id="win" hidden><div class="over-card win-card"><h2>Лес очищен!</h2><p id="winTxt"></p><ul id="winList"></ul>
<p class="win-note">Великое переселение: новая случайная карта, враги сильнее на 25%, а вы забираете 2 реликвии — постоянные бонусы на все следующие забеги. Вещи, ресурсы и постройки остаются здесь.</p>
<div class="win-b"><button class="gbtn" id="stayBtn" type="button">Остаться на этой карте</button><button class="gbtn" id="ngBtn" type="button">Великое переселение</button></div></div></div>
<div id="menu" hidden>''')
rep("[hidden]{display:none!important}","""[hidden]{display:none!important}
#win{position:fixed;inset:0;z-index:40;background:rgba(6,8,4,.8);display:flex;align-items:center;justify-content:center;padding:16px}
.win-card{border-color:#f4c766;border-top-color:#f4c766}.win-card h2{color:#f4c766}
.win-note{font-size:12px;color:var(--muted)}.win-b{display:grid;gap:8px}
#ngBtn{background:#6a4a10;border-color:#f4c766}
.itm{border-left:3px solid var(--rc)}.itm h3{color:var(--rc)}
.itm-b{display:flex;flex-direction:column;gap:6px;align-items:stretch}
.buy.sec{background:var(--panel);color:var(--ink);border:1px solid var(--line)}
.buy .ico{vertical-align:-0.2em}""")
rep("$('overBtn').addEventListener('click',()=>{S=newState();buildWorld();applyState();fillQuests();","$('overBtn').addEventListener('click',()=>{newGame(true);")
rep("/* ================= LOOP ================= */","""$('stayBtn').addEventListener('click',()=>{$('win').hidden=true;toast('Вы остались на очищенной карте. Склепы и вещи ждут.','good')});
$('ngBtn').addEventListener('click',()=>{S.meta.ng++;S.meta.relicPend+=2;$('win').hidden=true;newGame(true);save();toast(`Великое переселение ${S.meta.ng}: новая карта, враги сильнее.`,'good');setTimeout(showRelics,400)});

/* ================= LOOP ================= */""")
rep("  if(!menuOpen&&!S.over&&!perksOpen())update(dt);","  if(!menuOpen&&!S.over&&!perksOpen()&&$('win').hidden)update(dt);")
rep("  else{applyOffline();fillQuests();renderQuests();if(S.perkPend>0)setTimeout(showPerks,400)}","  else{applyOffline();fillQuests();renderQuests();if(S.meta.relicPend>0)setTimeout(showRelics,400);else if(S.perkPend>0)setTimeout(showPerks,400)}")
rep("  zombies=[];spits=[];","  zombies=[];spits=[];DG=null;refugees=[];roots=[];")

# ================= insert blocks =================
rep("/* ================= ГЕРОЙ ================= */",endgame+"\n"+bosses+"\n/* ================= ГЕРОЙ ================= */")
open(p,'w').write(s)
print('ok')
