p='src/lumber-camp.html';s=open(p).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)
def cut(a,b,new):
    global s
    i=s.index(a);j=s.index(b,i);s=s[:i]+new+s[j:]
cut("function buildCrypts(spots,rng2){","// ---------- СОБЫТИЯ ----------",open('tools/parts/crypt2.js').read()+"\n")
cut("function drawCrypt(c,now){","function drawPortal(p,now){",open('tools/parts/cryptdraw.js').read()+"\n")
cut("function drawDungeon(now){\n  const D2=DG,open=dunRects();","\n/* ================= МАСТЕРСТВО","")
# вход в склеп без суточной печати
rep("""    const cd=S.crypts[c.id]||0;
    if(cd>S.day)return {k:'x',o:c,ok:false,msg:`Склеп запечатан до ${cd}-го дня`,fn:()=>{}};
""","")
a=s[s.index("    return {k:'x',o:c,ok:true,lbl:'Войти',msg:`Войти в склеп ("):]
a=a[:a.index("\n")]
s=s.replace(a,"    return {k:'x',o:c,ok:true,lbl:'Войти',msg:`Войти в склеп: потратить ключ (их ${S.keys}). Пройдено: ${S.cryptRuns||0}, сложность ${cryptDiff()}`,fn:()=>enterCrypt(c)};")
# щит босса склепа
rep("  z.hp-=dmg;z.hit=0.12;burst(","  if(z.shield){if(!z.immT||performance.now()-z.immT>700){z.immT=performance.now();addFloat(z.x,z.y-z.r-20,'щит: убейте слуг','#7ec8ff')}return}\n  z.hp-=dmg;z.hit=0.12;burst(")
# время снаружи стоит
rep("  P.fell=Math.max(0,(P.fell||0)-dt);updateRoots(dt);updateRefugees(dt);","  P.fell=Math.max(0,(P.fell||0)-dt);if(!DG){updateRoots(dt);updateRefugees(dt)}")
rep("""  updateMounds(dt);
  updatePois();
  updateFarms(dt);
  updateQuests(dt);
  updateTowers(dt);
  updateGuards(dt);
  updateClock(dt);

  // --- жители
  const wr=woodRate(),sr=stoneRate();""","""  updateQuests(dt);
  if(!DG){
  updateMounds(dt);
  updatePois();
  updateFarms(dt);
  updateTowers(dt);
  updateGuards(dt);
  updateClock(dt);
  }
  // --- жители
  const wr=DG?0:woodRate(),sr=DG?0:stoneRate();""")
rep("    const z=zombies[i];\n    if(!zombies.includes(z))continue;\n","    const z=zombies[i];\n    if(!zombies.includes(z))continue;\n    if(DG&&z.dun==null)continue;\n")
# замедление от луж/льда
rep("else if(m>0.1){const s=speedOf(S.up.boots)*(swamp&&!rl('boots')?0.55:1)","else if(m>0.1){P.slowT=Math.max(0,(P.slowT||0)-dt);const s=speedOf(S.up.boots)*(swamp&&!rl('boots')?0.55:1)*(P.slowT>0?0.5:1)")
# HUD склепа
rep("  mistFog();\n","  mistFog();drawCryptHud();\n")
# состояние
rep("return {v:12,worldV:12,rested:0,","return {v:12,worldV:12,rested:0,cryptRuns:0,setPity:0,")
rep("eq:{weapon:null,armor:null,amulet:null,ring:null}","eq:{weapon:null,head:null,armor:null,legs:null,amulet:null,ring:null}")
# вещи: новые места, комплекты, уникальные
rep("const SLOTS = {weapon:'Оружие', armor:'Броня', amulet:'Амулет', ring:'Кольцо'};","const SLOTS = {weapon:'Оружие', head:'Голова', armor:'Грудь', legs:'Ноги', amulet:'Амулет', ring:'Кольцо'};")
rep("  armor: [['Кожух','m'],['Стёганка','f'],['Кольчуга','f'],['Латы','p']],","  armor: [['Кожух','m'],['Стёганка','f'],['Кольчуга','f'],['Латы','p']],\n  head:  [['Колпак','m'],['Шлем','m'],['Капюшон','m'],['Шелом','m']],\n  legs:  [['Портки','p'],['Штаны','p'],['Поножи','p'],['Наголенники','p']],")
for a,b in [("hp:    {n:'Здоровье',                pct:0, slots:['armor','amulet'],","hp:    {n:'Здоровье',                pct:0, slots:['armor','amulet','head','legs'],"),
            ("armor: {n:'Защита',                  pct:1, slots:['armor'],","armor: {n:'Защита',                  pct:1, slots:['armor','head','legs'],"),
            ("move:  {n:'Скорость бега',           pct:1, slots:['armor','ring'],","move:  {n:'Скорость бега',           pct:1, slots:['armor','ring','legs'],"),
            ("crit:  {n:'Шанс крита (×2)',         pct:1, slots:['weapon','ring'],","crit:  {n:'Шанс крита (×2)',         pct:1, slots:['weapon','ring','head'],"),
            ("loot:  {n:'Шанс добычи с мертвецов', pct:1, slots:['amulet'],","loot:  {n:'Шанс добычи с мертвецов', pct:1, slots:['amulet','head'],"),
            ("dbl:   {n:'Двойная добыча',          pct:1, slots:['amulet','ring'],","dbl:   {n:'Двойная добыча',          pct:1, slots:['amulet','ring','legs'],")]:
    rep(a,b)
rep("  ring:  {id:'flame',   name:'Кольцо Пламени',          desc:'Каждый удар поджигает врага'},","  ring:  {id:'flame',   name:'Кольцо Пламени',          desc:'Каждый удар поджигает врага'},\n  head:  {id:'berserk', name:'Шлем Берсерка',           desc:'+30% урона, пока здоровья меньше половины'},\n  legs:  {id:'stride',  name:'Поножи Скорохода',        desc:'+15% к скорости бега'},")
rep("  {n:'Легендарный', col:'#f0a040', mods:3, sh:20},\n];","  {n:'Легендарный', col:'#f0a040', mods:3, sh:20},\n  {n:'Комплект',    col:'#3ad1a0', mods:3, sh:25},\n];")
rep("function gear(k){let s=0;if(!S.eq)return 0;","function gear(k){let s=setBonus(k);if(!S.eq)return 0;")
rep("  let d=base*(1+gear('dmg')/100)*(1+0.10*rl('steel'));","  let d=base*(1+gear('dmg')/100)*(1+0.10*rl('steel'))*(hasUq('berserk')&&S.p.hp<maxHp(S.up.hp)*0.5?1.3:1);")
rep("*(1+gear('move')/100)*(1+(rl('boots')","*(1+gear('move')/100)*(hasUq('stride')?1.15:1)*(1+(rl('boots')")
# иконки
rep("const UQ_ART = {","""const HEAD_ART=c=>`<path d="M6 20c0-8 4-14 10-14s10 6 10 14z" fill="#8e959b" stroke="#4c5257"/><path d="M6 20h20v3H6z" fill="#6d747a"/><path d="M15 8h2v10h-2z" fill="${c}"/>`;
const LEGS_ART=c=>`<path d="M9 4h14l-1 24h-5l-1-14-1 14h-5z" fill="#6b5a44" stroke="#3b2a1c"/><path d="M9 4h14v4H9z" fill="${c}"/>`;
ICON_ART['Колпак']=c=>`<path d="M7 22c2-9 6-15 13-16l-4 6c4 1 7 5 9 10z" fill="#7a5634" stroke="#3b2a1c"/><path d="M6 22h20v3H6z" fill="${c}"/>`;
ICON_ART['Шлем']=HEAD_ART;ICON_ART['Шелом']=c=>HEAD_ART(c)+`<path d="M16 2l2 5h-4z" fill="${c}"/>`;
ICON_ART['Капюшон']=c=>`<path d="M5 26c0-12 4-21 11-21s11 9 11 21l-5-2-6 2-6-2z" fill="#3e4a3a" stroke="#1e2622"/><ellipse cx="16" cy="17" rx="5" ry="6" fill="#1a1d1a"/><path d="M5 26l6-2" stroke="${c}" stroke-width="2"/>`;
ICON_ART['Портки']=LEGS_ART;ICON_ART['Штаны']=LEGS_ART;ICON_ART['Поножи']=c=>LEGS_ART(c)+`<path d="M10 16h5M18 16h5" stroke="#9ea5aa" stroke-width="3"/>`;ICON_ART['Наголенники']=c=>LEGS_ART(c)+`<path d="M10 14h5v10h-5zM18 14h5v10h-5z" fill="#9ea5aa"/>`;
const SET_ART={head:c=>`<path d="M6 21c0-8 4-14 10-14s10 6 10 14z" fill="${c}" stroke="#1a1d1a"/><path d="M6 21h20v3H6z" fill="#2a2a2a"/><path d="M5 12c-3-4-2-8 0-9 1 3 2 5 4 7M27 12c3-4 2-8 0-9-1 3-2 5-4 7" fill="#e8e0cc"/><circle cx="16" cy="14" r="2" fill="#fff"/>`,
  armor:c=>`<path d="M8 6l4-2h8l4 2 4 6-4 2v14H8V14l-4-2z" fill="${c}" stroke="#1a1d1a"/><path d="M16 6v22" stroke="#1a1d1a" stroke-width="1.2"/><circle cx="16" cy="13" r="3" fill="#fff" opacity=".8"/>`,
  legs:c=>`<path d="M9 4h14l-1 24h-5l-1-14-1 14h-5z" fill="${c}" stroke="#1a1d1a"/><path d="M9 4h14v4H9z" fill="#2a2a2a"/><path d="M11 18h3M18 18h3" stroke="#fff" stroke-width="2" opacity=".7"/>`};
const UQ_ART = {
  berserk:c=>HEAD_ART('#c43a2c')+`<path d="M8 12l-4-6 7 3M24 12l4-6-7 3" fill="#e8e0cc"/>`,
  stride: c=>LEGS_ART('#7ec8ff')+`<path d="M4 14l5 2M3 19l6 1M4 24l5-1" stroke="#ece6d3" stroke-width="1.5"/>`,""")
rep("  const c=RAR[it.rar].col,art=it.uq?UQ_ART[it.uq](c):ICON_ART[iconBase(it)](c);","  const c=RAR[it.rar].col,art=it.set?SET_ART[it.slot](SETS[it.set].col):it.uq?UQ_ART[it.uq](c):ICON_ART[iconBase(it)](c);")
a=s[s.index("  if(!iconImgs[k]){const im=new Image();im.src="):]
a=a[:a.index("\n")]
s=s.replace(a,a.replace("${(it.uq?UQ_ART[it.uq]:ICON_ART[iconBase(it)])(RAR[i","${(it.set?(()=>SET_ART[it.slot](SETS[it.set].col)):it.uq?UQ_ART[it.uq]:ICON_ART[iconBase(it)])(RAR[i",1))
rep("  const k=(it.uq||iconBase(it))+'|'+it.rar;","  const k=(it.set?it.set+it.slot:it.uq||iconBase(it))+'|'+it.rar;")
# описание комплектов во вкладке «Вещи»
rep("    R.push({heroStats:true});","    R.push({heroStats:true});\n    for(const id in SETS){const own=ownedSet(id);if(!own.length&&S.cls!==id)continue;const n=setCount(id),st=SETS[id];R.push({note:`<b style=\"color:${st.col}\">${st.name}</b> · собрано ${own.length}/3, надето ${n}/3 · 2 вещи: ${st.d2}${n>=2?' ✓':''} · 3 вещи: ${st.d3}${n>=3?' ✓':''}. Выпадает в склепе (5%, гарантия через ${Math.max(0,15-(S.setPity||0))} походов)`})}")
open(p,'w').write(s);print('ok')
