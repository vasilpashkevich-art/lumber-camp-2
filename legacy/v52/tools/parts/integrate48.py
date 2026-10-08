s=open('snapshots/lumber-camp-v47.html').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)

# ================= 1. НАДПИСИ ПОД КЛАСС =================
# формы названия второго оружия
rep("weap:'Молот', ","weap:'Молот',weapI:'молотом',weapA:'молот', ")
rep("weap:'Посох', ","weap:'Посох',weapI:'посохом',weapA:'посох', ")
rep("weap:'Лук',   ","weap:'Лук',weapI:'луком',weapA:'лук',   ")
rep("const secName=()=>cls()?CLASSES[cls()].weap:'Лук';",
    "const secName=()=>cls()?CLASSES[cls()].weap:'Лук';\n"
    "const secI=()=>cls()?CLASSES[cls()].weapI:'луком';// чем бить: «молотом», «посохом», «луком»\n"
    "const dragonAir=()=>cls()?CLASSES[cls()].weapA:'лук';// что достаёт летящего дракона\n"
    "const dragonGround=()=>cls()==='warrior'?'топор и молот':'топор';")
# умение «Сила»: топором и вторым оружием
rep("const PERK_DESC={aim:{","const PERK_DESC={str:{warrior:'+12% урона по нечисти топором и молотом',mage:'+12% урона по нечисти топором и посохом'},aim:{")
# реликвия «Двойная тетива» — своё имя у каждого класса
rep("twin:   {name:'Двойная тетива',    max:2,","twin:   {get name(){return ({warrior:'Двойной замах',mage:'Двойное заклятие'})[cls()]||'Двойная тетива'},max:2,")
# летопись: плевун и дракон
rep("const LORE_B={","const LORE_B={",1)
i=s.index("const LORE_B={");j=s.index("\n",i)
s=s[:j+1]+("Object.defineProperty(LORE_T,5,{enumerable:true,get(){return ({warrior:'Опасен вблизи. Бейте молотом первым и отходите рывком.',mage:'Опасен вблизи. Лучше встречать посохом издалека.'})[cls()]||'Опасен вблизи. Лучше встречать луком издалека.'}});\n"
           "Object.defineProperty(LORE_B,5,{enumerable:true,get(){return `В воздухе его достаёт только ${dragonAir()}, на земле — только ${dragonGround()}.`}});\n")+s[j+1:]
# дракон: подсказки над головой и надпись под ним
rep("addFloat(z.x,z.y-z.r-30,z.fly?'Взлетел! Бей луком':'Приземлился! Бей топором','#f4c766')",
    "addFloat(z.x,z.y-z.r-30,z.fly?`Взлетел! Бей ${secI()}`:`Приземлился! Бей ${cls()==='warrior'?'топором или молотом':'топором'}`,'#f4c766')")
rep("addFloat(z.x,z.y-z.r-20,z.fly?'неуязвим: бейте луком':'неуязвим: бейте топором','#9fc3d6')",
    "addFloat(z.x,z.y-z.r-20,z.fly?`неуязвим: бейте ${secI()}`:`неуязвим: бейте ${cls()==='warrior'?'топором или молотом':'топором'}`,'#9fc3d6')")
rep("z.fly?'в воздухе — только лук':'на земле — только топор'","z.fly?'в воздухе — только '+dragonAir():'на земле — только '+dragonGround()")
# молот Варвара достаёт летящего дракона (раньше по нему в воздухе было нечем бить)
rep("let [d,cr]=crit4(...heroHit(base*1.5));hitEnemy(t,d,'melee',cr);","let [d,cr]=crit4(...heroHit(base*1.5));hitEnemy(t,d,t.k==='z'&&t.o.fly?'ranged':'melee',cr);")
rep("if(o===t.o||dist(o.x,o.y,t.o.x,t.o.y)>R+o.r||!canHit(o,'melee'))continue;dmgNum(o.x,o.y-o.r-4,d*0.6,false);hitZombie(o,d*0.6,P.x,P.y,'melee')}",
    "const os=o.fly?'ranged':'melee';if(o===t.o||dist(o.x,o.y,t.o.x,t.o.y)>R+o.r||!canHit(o,os))continue;dmgNum(o.x,o.y-o.r-4,d*0.6,false);hitZombie(o,d*0.6,P.x,P.y,os)}")
rep("hitEnemy({k:'z',o:tg},d*(r>1?1:0.6),mel?'melee':'ranged',cr)","hitEnemy({k:'z',o:tg},d*(r>1?1:0.6),mel&&!tg.fly?'melee':'ranged',cr)")
# кузница: закалка второго оружия
rep("['bow','Железные наконечники: +20% урона луком']","['bow',({warrior:'Тяжёлый боёк: +20% урона молотом',mage:'Заряженный кристалл: +20% урона посохом'})[cls()]||'Железные наконечники: +20% урона луком']")
# подсказка внизу: своё оружие и способность
rep("function hud(){","let helpSig='';\nfunction renderHelp(){const c=cls();$('help').innerHTML=`WASD / стрелки — идти · Пробел или E (держать) — рубить, копать, бить<br>Shift — рывок · R — ${secName().toLowerCase()}/топор${c?` · C — ${CLASSES[c].abil.toLowerCase()}`:''} · B — меню лагеря · K — карта · Q — лечение · F — сила · M — звук · болото замедляет`}\nfunction hud(){\n  {const hs=cls()+'';if(hs!==helpSig){helpSig=hs;renderHelp()}}")

# значок «двойного удара» у каждого класса свой
rep("const relicSvg=(k,sz=32)=>`<svg viewBox=\"0 0 32 32\" width=\"${sz}\" height=\"${sz}\" aria-hidden=\"true\">${(k==='wolf'&&PET_ICO[S.cls])||",
    "const TWIN_ICO={warrior:'<g stroke=\"#24180f\" stroke-width=\"1\"><rect x=\"9\" y=\"13\" width=\"2.5\" height=\"15\" fill=\"#8d6540\"/><rect x=\"4\" y=\"6\" width=\"12\" height=\"7\" rx=\"1.5\" fill=\"#9ea5aa\"/><rect x=\"21\" y=\"13\" width=\"2.5\" height=\"15\" fill=\"#8d6540\"/><rect x=\"16\" y=\"6\" width=\"12\" height=\"7\" rx=\"1.5\" fill=\"#9ea5aa\"/></g>',mage:'<path d=\"M3 21q6-2 10-9\" stroke=\"#ffb347\" stroke-width=\"3\" fill=\"none\" opacity=\".6\"/><circle cx=\"14\" cy=\"10\" r=\"5\" fill=\"#ff7a2a\" stroke=\"#24180f\"/><circle cx=\"13\" cy=\"9\" r=\"2\" fill=\"#ffe08a\"/><path d=\"M10 29q6-2 10-9\" stroke=\"#ffb347\" stroke-width=\"3\" fill=\"none\" opacity=\".6\"/><circle cx=\"21\" cy=\"19\" r=\"5\" fill=\"#ff7a2a\" stroke=\"#24180f\"/><circle cx=\"20\" cy=\"18\" r=\"2\" fill=\"#ffe08a\"/>'};\nconst relicSvg=(k,sz=32)=>`<svg viewBox=\"0 0 32 32\" width=\"${sz}\" height=\"${sz}\" aria-hidden=\"true\">${(k==='wolf'&&PET_ICO[S.cls])||(k==='twin'&&TWIN_ICO[S.cls])||")

# характеристики героя: молот Варвара бьёт по площади вблизи, у мага — огненный шар
rep("const bowHit=S.bow?bowDmg(S.bow)*dm*(1+0.2*S.forgeUp.bow):0,bowCdv=S.bow?bowCd(S.bow)/spd:0;",
    "const wc=cls()==='warrior',mc=cls()==='mage',bowHit=S.bow?bowDmg(S.bow)*dm*(1+0.2*S.forgeUp.bow)*(wc?1.5:mc?0.95:1):0,bowCdv=S.bow?bowCd(S.bow)*(wc?1.35/(1+0.1*pr('aim')):1)/spd:0;")
rep("S.bow?`${f1(bowHit)} за выстрел · ${f1(bowHit*critMul/bowCdv)} в секунду · дальность ${bowRange(S.bow)}`:'лука нет'",
    "S.bow?(wc?`${f1(bowHit)} за удар по площади · ${f1(bowHit*critMul/bowCdv)} в секунду`:`${f1(bowHit)} за ${mc?'огненный шар':'выстрел'} · ${f1(bowHit*critMul/bowCdv)} в секунду · дальность ${bowRange(S.bow)}`):'ещё не изготовлен'")

# ================= 2. СКЛЕП: ПРИТВОР =================
rep("function enterCrypt(c){\n  S.keys--;S.crypts[c.id]=S.day+CRYPT_CD;\n  const d=cryptDiff(),tier=cryptTier(),n=4+(d>=15?1:0)+(d>=30?1:0);",
    "function enterCrypt(c){\n  // зал 0 — притвор: врагов нет, ключ тратится только у врат во второй зал\n  const d=cryptDiff(),tier=cryptTier(),n=1+4+(d>=15?1:0)+(d>=30?1:0);")
rep("  DG={crypt:c,zone:c.zone,tier,diff:d,theme,skin:CFG.bosses[theme].skin,rooms,cors,traps,chest:null,exit:null,",
    "  rooms[0].spawned=rooms[0].cleared=rooms[0].foyer=true;\n  DG={crypt:c,zone:c.zone,tier,diff:d,theme,skin:CFG.bosses[theme].skin,rooms,cors,traps,chest:null,exit:null,gateOpen:false,gate:{x:cors[0].x+18,y:DUN.Y},")
rep("toast(`Склеп: ${n} залов, в конце — ${CFG.bosses[theme].name}. Сложность ${d}. Снаружи время стоит.`,'');",
    "toast(`Притвор склепа: здесь безопасно. Впереди врата — ключ откроет склеп (${n-1} ${n-1<5?'зала':'залов'}, в конце — ${CFG.bosses[theme].name}, сложность ${d}), и он закроется на ${CRYPT_CD} дня. Выйти из притвора можно без потерь.`,'');")
rep("function leaveCrypt(msg){","function openCryptGate(){\n  if(!DG||DG.gateOpen)return;\n  if(S.keys<=0){toast('Нужен ключ от склепа: падает с могильников, боссов и у торговца','bad');return}\n  S.keys--;S.crypts[DG.crypt.id]=S.day+CRYPT_CD;DG.gateOpen=true;sfx.roar(0.25);shake(3,0.2);\n  toast(`Врата открыты, ключ потрачен. Склеп закроется на ${CRYPT_CD} дня. Снаружи время стоит.`,'good');save();\n}\nfunction leaveCrypt(msg){")
rep("function dunPieces(){const R=[];for(const r of DG.rooms){if(r.i===0||DG.rooms[r.i-1].cleared)R.push(...r.pieces)}for(const c of DG.cors)if(DG.rooms[c.i].cleared)R.push({x:c.x-60,y:c.y,w:c.w+120,h:c.h});return R}",
    "const gateShut=i=>i===0&&DG.gateOpen===false;// врата между притвором и первым залом\nfunction dunPieces(){const R=[];for(const r of DG.rooms){if(r.i===0||DG.rooms[r.i-1].cleared&&!gateShut(r.i-1))R.push(...r.pieces)}for(const c of DG.cors)if(DG.rooms[c.i].cleared&&!gateShut(c.i))R.push({x:c.x-60,y:c.y,w:c.w+120,h:c.h});return R}")
rep("    if(near(DG.entry,60))return {k:'x',o:DG.entry,ok:true,lbl:'Выйти',msg:'Покинуть склеп (сокровища останутся непройденными)',fn:()=>leaveCrypt('Вы покинули склеп')};",
    "    if(near(DG.entry,60))return DG.gateOpen===false?{k:'x',o:DG.entry,ok:true,lbl:'Выйти',msg:'Выйти из притвора: ключ не тратится, склеп не закроется',fn:()=>leaveCrypt('Вы вышли из притвора. Ключ при вас, склеп открыт')}:{k:'x',o:DG.entry,ok:true,lbl:'Выйти',msg:'Покинуть склеп (сокровища останутся непройденными)',fn:()=>leaveCrypt('Вы покинули склеп')};\n"
    "    if(DG.gateOpen===false&&near(DG.gate,90))return S.keys>0?{k:'x',o:DG.gate,ok:true,lbl:'Открыть',msg:`Врата склепа: потратить ключ (их ${S.keys}). Склеп закроется на ${CRYPT_CD} дня`,fn:openCryptGate}:{k:'x',o:DG.gate,ok:false,msg:'Врата склепа: нужен ключ',fn:()=>{}};")
rep("return {k:'x',o:c,ok:true,lbl:'Войти',msg:`Войти в склеп: потратить ключ (их ${S.keys}). Пройдено: ${S.cryptRuns||0}, сложность ${cryptDiff()}`",
    "return {k:'x',o:c,ok:true,lbl:'Войти',msg:`Войти в притвор склепа. Ключ (их ${S.keys}) тратится у врат. Пройдено: ${S.cryptRuns||0}, сложность ${cryptDiff()}`")
# рисунок врат и подписи залов
rep("    if(!D2.rooms[c.i].cleared){ctx.fillStyle='#3a3530';",
    "    if(gateShut(c.i)){drawCryptGate(c,now);continue}\n    if(!D2.rooms[c.i].cleared){ctx.fillStyle='#3a3530';")
rep("const cur=roomAt(P.x,P.y);if(cur&&!cur.last){ctx.font='600 13px Rubik, sans-serif';ctx.fillStyle='rgba(236,230,211,.5)';ctx.fillText(`Зал ${cur.i+1} из ${D2.rooms.length}`,cur.x+cur.w/2,cur.y+26)}",
    "const cur=roomAt(P.x,P.y);if(cur&&!cur.last){ctx.font='600 13px Rubik, sans-serif';ctx.fillStyle='rgba(236,230,211,.5)';ctx.fillText(cur.foyer?'Притвор — здесь безопасно':`Зал ${cur.i} из ${D2.rooms.length-1}`,cur.x+cur.w/2,cur.y+26)}")
rep("// экранная панель боя с боссом склепа",
    "// врата притвора: решётка с золотым замком\nfunction drawCryptGate(c,now){const x=c.x+18,y0=c.y,h=c.h;\n  ctx.fillStyle='#4a4f56';ctx.fillRect(x-14,y0-22,28,h+44);ctx.fillStyle='#2a2c30';ctx.fillRect(x-10,y0,20,h);\n  ctx.strokeStyle='#9aa0a6';ctx.lineWidth=3;for(let k=0;k<4;k++){const gx=x-8+k*5.3;ctx.beginPath();ctx.moveTo(gx,y0);ctx.lineTo(gx,y0+h);ctx.stroke()}\n  ctx.lineWidth=2.5;for(const yy of [0.25,0.75]){ctx.beginPath();ctx.moveTo(x-10,y0+h*yy);ctx.lineTo(x+10,y0+h*yy);ctx.stroke()}\n  const g=0.35+0.25*Math.sin(now/260);ctx.fillStyle=`rgba(244,199,102,${g})`;ctx.beginPath();ctx.arc(x,y0+h/2,22,0,7);ctx.fill();\n  ctx.fillStyle='#c9a24a';ctx.strokeStyle='#24180f';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x-8,y0+h/2-4,16,13,2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(x,y0+h/2-4,5,Math.PI,0);ctx.stroke();ctx.fillStyle='#24180f';ctx.fillRect(x-1,y0+h/2+1,2,5);\n  ctx.font='700 12px Rubik, sans-serif';ctx.textAlign='center';ctx.fillStyle='#f4c766';ctx.fillText('Врата склепа',x,y0-30);ctx.font='600 11px Rubik, sans-serif';ctx.fillStyle='rgba(236,230,211,.7)';ctx.fillText(S.keys>0?'откроет ключ':'нужен ключ',x,y0+h+40)}\n// экранная панель боя с боссом склепа")

# ================= 3. ДОСТУП ДЛЯ СНИМКОВ =================
rep("window.__G={get S(){return S},","window.__G={get S(){return S},openCryptGate,get floats(){return floats},showPerks,showRelics,makeItem,toggleMenu,useAbility,")
open('src/lumber-camp.html','w').write(s)
print('ok')
