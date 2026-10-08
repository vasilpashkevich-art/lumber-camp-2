p='src/lumber-camp.html';s=open(p).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)
rep("function drawPlayer(){",open('tools/parts/classes.js').read()+"\nfunction drawPlayer(){")
rep("const RX={cd:{},hammers:[],","const RX={fb:[],whirl:0,volley:0,cd:{},hammers:[],")
# иконки обликов
rep("    if(kind==='axe')drawAxeSkin(c,AXE_SKINS[i],8,36,-0.8,26,0);else drawBowSkin(c,BOW_SKINS[i],26,22,0,0,0,true);",
    "    if(kind==='axe')drawAxeSkin(c,AXE_SKINS[i],8,36,-0.8,26,0);else if(kind==='ham')drawHammerSkin(c,HAM_SKINS[i],8,36,-0.8,18,0);else if(kind==='stf')drawStaffSkin(c,STF_SKINS[i],6,38,-0.8,22,0);else drawBowSkin(c,BOW_SKINS[i],26,22,0,0,0,true);")
# герой
a=s[s.index("  const bow=S.weapon==='bow'&&S.bow>0&&P.swing<=0;\n  const nowT=performance.now();"):s.index("function drawGuards(now){")]
s=s.replace(a,"""  const sec=S.weapon==='bow'&&S.bow>0,cl=cls();const nowT=performance.now();
  const bow=sec&&cl!=='warrior'&&cl!=='mage'&&P.swing<=0;
  if(sec&&cl==='warrior'){const sw=P.swing>0?(1-P.swing/0.3)*2.6-1.3:-0.9,a=P.face+sw;drawHammerSkin(ctx,HAM_SKINS[skinTier(HAM_SKINS,S.bow)],x,y,a,20,nowT)}
  else if(sec&&cl==='mage'){drawStaffSkin(ctx,STF_SKINS[skinTier(STF_SKINS,S.bow)],x+Math.cos(P.face+0.6)*6,y+Math.sin(P.face+0.6)*6,P.face-0.25,20,nowT)}
  else if(bow){
    const a=P.face,bx=x+Math.cos(a)*13,by=y+Math.sin(a)*13,pull=P.shot>0?P.shot/0.2*4:0;
    drawBowSkin(ctx,bowSkin(S.bow),bx,by,a,pull,nowT,P.cd<=0.05||P.shot>0);
  }else{
    const sw=P.swing>0?(1-P.swing/0.18)*2.2-1.1:-0.9, a=P.face+sw;
    drawAxeSkin(ctx,axeSkin(S.up.axe),x,y,a,21,nowT);
  }
  drawHeroBody(ctx,x,y,cl,P.hurt>0,P.face);
  const bx=x-Math.cos(P.face)*9,by=y-Math.sin(P.face)*9;
  const fill=bagTotal()/bagCap(S.up.bag);
  ctx.fillStyle='#5b4329';ctx.beginPath();ctx.arc(bx,by,5+fill*4,0,7);ctx.fill();
  if(S.bow>0&&!sec){if(cl==='warrior'){ctx.save();ctx.translate(bx,by);ctx.scale(0.55,0.55);drawHammerSkin(ctx,HAM_SKINS[skinTier(HAM_SKINS,S.bow)],0,0,P.face+Math.PI*0.75,14,nowT);ctx.restore()}
    else if(cl==='mage'){ctx.save();ctx.translate(bx,by);ctx.scale(0.55,0.55);drawStaffSkin(ctx,STF_SKINS[skinTier(STF_SKINS,S.bow)],0,0,P.face+Math.PI*0.75,16,nowT);ctx.restore()}
    else{const K=bowSkin(S.bow);ctx.lineCap='round';ctx.strokeStyle=K.wood;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(bx,by,9,P.face+2.2,P.face+4.1);ctx.stroke()}}
  if(sec){ctx.save();ctx.translate(bx,by);ctx.scale(0.55,0.55);drawAxeSkin(ctx,axeSkin(S.up.axe),0,0,P.face+Math.PI*0.75,14,nowT);ctx.restore()}
}
""")
# атака вторым оружием
a=s[s.index("    if(S.weapon==='bow'&&S.bow>0){\n      P.cd=bowCd(S.bow)/(1+gear('spd')/100);P.shot=0.2;sfx.shoot();"):]
a=a[:a.index("    }else{P.cd=axeCd(S.up.axe)")]
s=s.replace(a,"    if(S.weapon==='bow'&&S.bow>0){secAttack(t)\n")
rep("  const bow=S.weapon==='bow'&&S.bow>0, reach=bow?bowRange(S.bow):0;","  const bow=S.weapon==='bow'&&S.bow>0&&cls()!=='warrior', reach=bow?bowRange(S.bow):0;")
rep("!t?(S.weapon==='bow'&&S.bow>0?'Стрелять':'Рубить'):(t.k==='z'||t.k==='m')?(S.weapon==='bow'&&S.bow>0?'Стрелять':'Бить')","!t?(S.weapon==='bow'&&S.bow>0&&cls()!=='warrior'?'Стрелять':'Рубить'):(t.k==='z'||t.k==='m')?(S.weapon==='bow'&&S.bow>0&&cls()!=='warrior'?'Стрелять':'Бить')")
# двойная тетива для любого второго оружия
rep("function twinShot(t,d,cr){const r=rl('twin');if(!r||t.k!=='z')return;\n  let o=null,bd=bowRange(S.bow);for(const z of zombies){if(z===t.o)continue;const dd=dist(z.x,z.y,P.x,P.y);if(dd<bd&&canHit(z,'ranged')){bd=dd;o=z}}",
    "function twinShot(t,d,cr){const r=rl('twin');if(!r||t.k!=='z')return;const mel=cls()==='warrior';\n  let o=null,bd=mel?90:bowRange(S.bow);for(const z of zombies){if(z===t.o)continue;const dd=mel?dist(z.x,z.y,t.o.x,t.o.y):dist(z.x,z.y,P.x,P.y);if(dd<bd&&canHit(z,mel?'melee':'ranged')){bd=dd;o=z}}if(mel&&!o)return;")
rep("  if(zombies.includes(tg))hitEnemy({k:'z',o:tg},d*(r>1?1:0.6),'ranged',cr)}","  if(zombies.includes(tg))hitEnemy({k:'z',o:tg},d*(r>1?1:0.6),mel?'melee':'ranged',cr)}")
rep("twin:   {name:'Двойная тетива',    max:2, desc:r=>`Лук выпускает две стрелы сразу: вторая летит в соседнего врага, урон ${r>1?100:60}%`},",
    "twin:   {name:'Двойная тетива',    max:2, desc:r=>`Второе оружие бьёт дважды: второй удар — по соседнему врагу, урон ${r>1?100:60}%`},")
rep("desc:'Топор задевает врагов рядом с целью (половина урона), каждая 4-я стрела бьёт критом'}","desc:'Топор задевает врагов рядом с целью (половина урона), каждый 4-й удар вторым оружием — крит'}")
# огненный шар в трассерах
rep("  for(const tr of tracers){\n    const k=1-tr.t/0.12,","  for(const tr of tracers){\n    if(tr.fire){const k=1-tr.t/(tr.mx||0.18),hx=tr.x1+(tr.x2-tr.x1)*k,hy=tr.y1+(tr.y2-tr.y1)*k,g=ctx.createRadialGradient(hx,hy,1,hx,hy,10);g.addColorStop(0,'rgba(255,240,160,1)');g.addColorStop(0.5,'rgba(255,140,40,.9)');g.addColorStop(1,'rgba(255,60,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(hx,hy,10,0,7);ctx.fill();continue}\n    const k=1-tr.t/0.12,")
# цикл, отрисовка, клавиши
rep("  updFx(dt);updAch(dt);updRelics(dt);","  updFx(dt);updAch(dt);updRelics(dt);updAbility(dt);")
rep("  drawRelicFx(now);\n","  drawRelicFx(now);drawAbilityFx(now);\n")
rep("  if(!menuOpen&&!mapOpen&&!S.over&&!perksOpen()&&$('win').hidden)update(dt);","  if(!S.over&&!cls()&&!clsOpen()&&!perksOpen()&&$('win').hidden)showClassPick();\n  if(!menuOpen&&!mapOpen&&!S.over&&!perksOpen()&&!clsOpen()&&$('win').hidden)update(dt);")
rep("  {const rk=RELIC_ACT.find(","  if(e.code==='KeyC'){useAbility();return}\n  {const rk=RELIC_ACT.find(")
# панель реликвий + способность
rep("  const el=document.getElementById('relicBar');if(!el)return;const own=ownedRelics();\n  const sig=own.map(k=>k+rl(k)).join(',');",
    "  const el=document.getElementById('relicBar');if(!el)return;const own=ownedRelics(),cl=cls();\n  const sig=(cl||'')+'|'+own.map(k=>k+rl(k)).join(',');")
rep("  if(sig!==relicBarSig){relicBarSig=sig;el.hidden=!own.length;","  if(sig!==relicBarSig){relicBarSig=sig;el.hidden=!own.length&&!cl;")
rep("${rl(k)>1?`<em>${rl(k)}</em>`:''}</button>`}).join('')}",
    "${rl(k)>1?`<em>${rl(k)}</em>`:''}</button>`}).join('');\n    if(cl)el.innerHTML=`<button type=\"button\" class=\"rlc act\" data-relic-use=\"_cls\" title=\"${CLASSES[cl].abil}: ${CLASSES[cl].abilD}\" style=\"border-color:${CLASSES[cl].col}\"><svg viewBox=\"0 0 32 32\" width=\"28\" height=\"28\" aria-hidden=\"true\">${ABIL_ICO[cl]}</svg><b>C</b><i data-cd=\"_cls\"></i></button>`+el.innerHTML}")
rep("  for(const k of RELIC_ACT){const i=el.querySelector(`[data-cd=\"${k}\"]`);","  if(cl){const i=el.querySelector('[data-cd=\"_cls\"]');if(i){const c2=P.abCd||0;i.style.height=(c2>0?100*c2/CLASSES[cl].cd:0)+'%';i.textContent=c2>0?Math.ceil(c2):''}}\n  for(const k of RELIC_ACT){const i=el.querySelector(`[data-cd=\"${k}\"]`);")
rep("const k=b.dataset.relicUse;if(RELIC2[k]&&RELIC2[k].act)useRelic(k);","const k=b.dataset.relicUse;if(k==='_cls'){useAbility();return}if(RELIC2[k]&&RELIC2[k].act)useRelic(k);")
# экран выбора класса
rep('<div id="relicBar" hidden></div>','<div id="relicBar" hidden></div>\n<div id="clsPick" hidden><div class="cls-wrap"><h2>Выберите класс героя</h2><p>Топор и рывок (Shift) есть у всех. Класс определяет второе оружие, способность (C) и свою ветку умений. Прокачка второго оружия сохраняется.</p><div id="clsList"></div></div></div>')
rep(".note{font-size:12px","#clsPick{position:fixed;inset:0;z-index:45;background:rgba(5,8,6,.92);display:flex;align-items:center;justify-content:center;padding:12px;overflow:auto}\n.cls-wrap{max-width:1100px;width:100%;text-align:center}.cls-wrap h2{margin:0 0 6px;font-size:26px}.cls-wrap p{margin:0 0 16px;color:var(--muted);font-size:13px}\n#clsList{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}\n.cls-card{display:flex;flex-direction:column;align-items:flex-start;gap:6px;text-align:left;background:#141a15;border:2px solid var(--cc);border-radius:14px;padding:14px;color:var(--ink);font:inherit;cursor:pointer}.cls-card:hover{background:#1b231c}\n.cls-card img{align-self:center;border-radius:10px;width:120px;height:120px}.cls-card b{font-size:22px}.cls-card small{color:var(--muted);margin-top:-6px}.cls-card span{font-size:12px;line-height:1.4}.cls-card em{display:block;font-style:normal;color:var(--muted);font-size:11px;font-weight:700}.cls-card i{align-self:stretch;margin-top:6px;text-align:center;font-style:normal;font-weight:800;background:var(--cc);color:#14110e;border-radius:8px;padding:9px}\n.note{font-size:12px")
rep("document.getElementById('relicBar').addEventListener('click',","document.getElementById('clsList').addEventListener('click',e=>{const b=e.target.closest('[data-cls]');if(!b)return;S.cls=b.dataset.cls;document.getElementById('clsPick').hidden=true;relicBarSig='';sfx.levelup();toast(`Класс: ${CLASSES[S.cls].name}. Способность «${CLASSES[S.cls].abil}» — клавиша C или кнопка вверху. ${S.bow>0?CLASSES[S.cls].weap+' уже в руках (прокачка сохранена).':'Второе оружие — в меню «Снаряжение».'}`,'good');save()});\ndocument.getElementById('relicBar').addEventListener('click',")
# состояние
rep("return {v:12,worldV:12,rested:0,cryptRuns:0,","return {v:12,worldV:12,cls:null,rested:0,cryptRuns:0,")
rep("  if(src&&ver<12)st.worldV=0;\n","  if(src&&ver<12)st.worldV=0;\n  st.cls=src&&CLASSES[src.cls]?src.cls:null;\n")
# меню снаряжения
rep("    const b=S.bow;\n    if(b===0){const c=bowCost(0);R.push({title:'Лук',lvl:'не изготовлен',desc:`Дальний бой: урон ${fmt1(bowDmg(1))}, дальность ${bowRange(1)}. Переключение между луком и топором кнопкой внизу или клавишей R.`,",
    "    const b=S.bow,SN=secName(),SK=secSkins(),KD=secKind(),mel=cls()==='warrior';\n    if(b===0){const c=bowCost(0);R.push({title:SN,lvl:'не изготовлен',desc:`${mel?'Тяжёлый удар по площади':'Дальний бой'}: урон ${fmt1(bowDmg(1)*(mel?1.5:1))}${mel?'':', дальность '+bowRange(1)}. Переключение между ним и топором кнопкой внизу или клавишей R.`,")
rep("    else if(b>=BOW_MAX)R.push({title:'Лук',lvl:`ур. ${b} · максимум`,desc:`Урон ${fmt1(bowDmg(b))}, дальность ${bowRange(b)}${skinNote(BOW_SKINS,b)}`,ico:skinIcon('bow',skinTier(BOW_SKINS,b))});",
    "    else if(b>=BOW_MAX)R.push({title:SN,lvl:`ур. ${b} · максимум`,desc:`Урон ${fmt1(bowDmg(b)*(mel?1.5:1))}${mel?'':', дальность '+bowRange(b)}${skinNote(SK,b)}`,ico:skinIcon(KD,skinTier(SK,b))});")
rep("    else{const c=bowCost(b);R.push({title:'Лук',lvl:`ур. ${b}`,desc:`Урон ${fmt1(bowDmg(b))} → ${fmt1(bowDmg(b+1))}, дальность ${bowRange(b)} → ${bowRange(b+1)}, выстрел раз в ${bowCd(b+1).toFixed(2)} с${skinNote(BOW_SKINS,b)}`,cost:c,why:gate(c),act:'bow',ico:skinIcon('bow',skinTier(BOW_SKINS,b))})}",
    "    else{const c=bowCost(b);R.push({title:SN,lvl:`ур. ${b}`,desc:`Урон ${fmt1(bowDmg(b)*(mel?1.5:1))} → ${fmt1(bowDmg(b+1)*(mel?1.5:1))}${mel?'':`, дальность ${bowRange(b)} → ${bowRange(b+1)}`}, удар раз в ${(bowCd(b+1)*(mel?1.35:1)).toFixed(2)} с${skinNote(SK,b)}`,cost:c,why:gate(c),act:'bow',ico:skinIcon(KD,skinTier(SK,b))})}")
rep("if(S.bow===1){S.weapon='bow';toast('Лук изготовлен и в руках. Переключение: кнопка внизу или R.','good')}else toast(`Лук: уровень ${S.bow}`,'good');if(S.bow>1&&BOW_SKINS.some(q=>q.from===S.bow))toast(`Новый облик лука: «${bowSkin(S.bow).name}»`,'good')}",
    "if(S.bow===1){S.weapon='bow';toast(`${secName()} изготовлен и в руках. Переключение: кнопка внизу или R.`,'good')}else toast(`${secName()}: уровень ${S.bow}`,'good');if(S.bow>1&&secSkins().some(q=>q.from===S.bow))toast(`Новый облик: «${secSkins()[skinTier(secSkins(),S.bow)].name}»`,'good')}")
rep("const wl=S.weapon==='bow'?'Лук':'Топор';","const wl=S.weapon==='bow'?secName():'Топор';")
rep("toast(S.weapon==='bow'?'В руках лук':'В руках топор','', 'wpn')","toast(S.weapon==='bow'?`В руках: ${secName().toLowerCase()}`:'В руках топор','', 'wpn')")
rep("    ['Урон луком',S.bow?","    [`Урон: ${secName().toLowerCase()}`,S.bow?")
rep("`топор раз в ${f1(axeCdv)} с${S.bow?` · лук раз в ${f1(bowCdv)} с`:''}","`топор раз в ${f1(axeCdv)} с${S.bow?` · ${secName().toLowerCase()} раз в ${f1(bowCdv)} с`:''}")
rep("  {id:'bow12',  name:'Драконий лук',      d:'Лук 12-го уровня',","  {id:'bow12',  name:'Мастер оружия',     d:'Второе оружие 12-го уровня',")
rep("  BOW_SKINS.forEach((k,i)=>al.push({n:'Лук: '+k.name,ok:M.best.bow>=k.from,ico:skinIcon('bow',i),h:`лук ур. ${k.from}`}));",
    "  secSkins().forEach((k,i)=>al.push({n:secName()+': '+k.name,ok:M.best.bow>=k.from,ico:skinIcon(secKind(),i),h:`${secName().toLowerCase()} ур. ${k.from}`}));")
# умения: имена, ветки, класс
rep("  const open=Object.keys(PERKS).filter(k=>pr(k)<PERKS[k].max);\n  const byBr={};","  const open=Object.keys(PERKS).filter(k=>pr(k)<PERKS[k].max&&perkAvail(k));\n  const byBr={};")
rep("b.innerHTML=`<small>${P_.br}</small><b>${P_.name}</b><span>${P_.desc}</span>","b.innerHTML=`<small>${brLabel(P_.br)}</small><b>${perkName(k)}</b><span>${perkDesc(k)}</span>")
rep("b.style.setProperty('--bc',BR_COL[P_.br]);","b.style.setProperty('--bc',BR_COL[brLabel(P_.br)]);")
rep("toast(`Умение: ${PERKS[k].name} (ранг ${S.perks[k]})`,'good')","toast(`Умение: ${perkName(k)} (ранг ${S.perks[k]})`,'good')")
rep("      const ks=Object.keys(PERKS).filter(k=>PERKS[k].br===br);","      const ks=Object.keys(PERKS).filter(k=>PERKS[k].br===br&&perkAvail(k));")
rep("      R.push({note:`<b style=\"color:${BR_COL[br]}\">${br}</b> · очков в ветке:","      R.push({note:`<b style=\"color:${BR_COL[brLabel(br)]}\">${brLabel(br)}</b> · очков в ветке:")
rep("      for(const k of ks)R.push({title:PERKS[k].name,lvl:`${pr(k)}/${PERKS[k].max}`,desc:PERKS[k].desc});","      for(const k of ks)R.push({title:perkName(k),lvl:`${pr(k)}/${PERKS[k].max}`,desc:perkDesc(k)});")
rep("  const crit=Math.random()<gear('crit')/100;","  const crit=Math.random()<(gear('crit')+6*pr('eagle'))/100;")
rep("n*=1-Math.min(0.6,gear('armor')/100);","n*=1-Math.min(0.6,gear('armor')/100);n*=1-0.06*pr('mshield');")
rep("const brPts=br=>Object.keys(PERKS).filter(k=>PERKS[k].br===br).reduce((s,k)=>s+pr(k),0);","const brPts=br=>Object.keys(PERKS).filter(k=>PERKS[k].br===br&&(!PERKS[k].cls||PERKS[k].cls===(S.cls||null))).reduce((s,k)=>s+pr(k),0);")
open(p,'w').write(s);print('ok')
