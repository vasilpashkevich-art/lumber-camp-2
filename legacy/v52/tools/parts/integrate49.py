s=open('snapshots/lumber-camp-v48.html').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)
def cut(a,b,new):
    global s
    i=s.index(a);j=s.index(b,i);s=s[:i]+new+s[j:]
P=lambda n:open('tools/parts/'+n).read()

# ===== 1. разметка: полоса сверху, портрет, пассивные реликвии, панель умений
BAG='<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.6 5.4V4.2a2.4 2.4 0 0 1 4.8 0v1.2" stroke="#c9a46a" stroke-width="1.4" fill="none"/><rect x="2.4" y="5.2" width="11.2" height="9" rx="2.6" fill="#6b4a2c"/><rect x="5.2" y="8.2" width="5.6" height="2.2" rx="1" fill="#e98b3d"/></svg>'
cut('<div class="hud" id="stats">','<div id="relicBar" hidden></div>',
 '<div class="hud" id="topbar">\n'
 f'  <div class="tb tb-bag"><span class="lbl">{BAG}Сумка</span><span class="val" id="bagVal"></span><div class="bar" id="bagbar"><i></i></div></div>\n'
 '  <div id="clock"><b id="dayTxt">День 1</b><span id="phaseTxt">до ночи 2:30</span><span id="streakTxt">· серия ночей 0</span></div>\n'
 '  <div class="tb tb-store"><span class="lbl">Склад</span><span class="val" id="storeVal"></span><button type="button" id="cfgBtn" title="Сохранение и звук" aria-label="Сохранение и звук">⚙</button></div>\n'
 '</div>\n'
 '<div class="hud" id="stats">\n'
 '  <button type="button" id="pfBtn" title="Персонаж (I)" aria-label="Персонаж"><canvas id="pfCv" width="136" height="136"></canvas><b class="num" id="lvlTxt">1</b></button>\n'
 '  <div class="uinfo"><div class="u-name"><b id="clsTxt">Лесоруб</b><small id="clsSub"></small></div><div class="bar hp" id="hpbar"><i></i><span class="num" id="hpTxt">10/10</span></div><div class="bar xp" id="xpbar"><i></i></div><small class="num" id="xpTxt">0/25</small></div>\n'
 '</div>\n<div id="relicPas" hidden></div>\n')
rep('<div class="hud" id="clock"><b id="dayTxt">День 1</b><span id="phaseTxt">до ночи 2:30</span><span id="streakTxt" style="display:block">Серия ночей: 0</span></div>\n','')
rep('<button class="gbtn" id="campBtn" type="button">Лагерь</button>','<button class="gbtn" id="heroBtn" type="button" title="Персонаж (I)">Персонаж</button>\n  <button class="gbtn" id="campBtn" type="button" title="Лагерь (B)">Лагерь</button>')
rep('</style>',P('hud49.css')+'</style>')
rep('.touch #sndBtn{','.touch #sndBtn,.touch #heroBtn{',3)

# ===== 2. панель: пассивные реликвии слева, умения на клавишах внизу
rep("    el.innerHTML=ord.map(k=>{const A=RELIC2[k]&&RELIC2[k].act;return `<button",
    "    const rb=k=>{const A=RELIC2[k]&&RELIC2[k].act;return `<button")
rep("${rl(k)>1?`<em>${rl(k)}</em>`:''}</button>`}).join('');",
    "${rl(k)>1?`<em>${rl(k)}</em>`:''}</button>`};\n"
    "    el.innerHTML=ord.filter(k=>RELIC2[k]&&RELIC2[k].act).map(rb).join('');\n"
    "    {const pe=document.getElementById('relicPas'),ps=ord.filter(k=>!(RELIC2[k]&&RELIC2[k].act));if(pe){pe.innerHTML=ps.map(rb).join('');pe.hidden=!ps.length}}")
i=s.index("document.getElementById('relicBar').addEventListener('click',e=>{");j=s.index("\n",i);line=s[i:j]
assert line.endswith("});")
s=s[:i]+"const relicClick=e=>{"+line[len("document.getElementById('relicBar').addEventListener('click',e=>{"):-3]+"};\n['relicBar','relicPas'].forEach(id=>document.getElementById(id).addEventListener('click',relicClick));"+s[j:]

# ===== 3. портрет, полоса, склад
rep("function hud(){\n","function hud(){\n  updPortrait();\n")
rep("$('streakTxt').textContent=`Серия ночей: ${S.streak}`+(S.bestStreak>S.streak?` · рекорд ${S.bestStreak}`:'');",
    "$('streakTxt').textContent=`· серия ночей ${S.streak}`+(S.bestStreak>S.streak?` (рекорд ${S.bestStreak})`:'');")
rep("${S.iron||S.forge?' '+resHtml(S.iron,'iron'):''}`);","${S.iron||S.forge?' '+resHtml(S.iron,'iron'):''}${S.shards?' '+resHtml(S.shards,'shard'):''}${S.keys?' '+resHtml(S.keys,'key'):''}`);")
rep("let helpSig='';","""let pfSig='';const PF_SRC=[22,62,76];// какую часть картинки героя показывать в портрете (x, y, размер)
// портрет героя слева вверху: лицо в цвете класса, имя класса и мир
function updPortrait(){
  const cl=cls(),set=heroSet(),sig=(cl||'')+'|'+set.head+set.armor+set.legs+'|'+((S.meta&&S.meta.ng)||0);if(sig===pfSig)return;pfSig=sig;
  const st=$('stats');if(st)st.style.setProperty('--cc',cl?CLASSES[cl].col:'#86a85c');
  $('clsTxt').textContent=cl?CLASSES[cl].br:'Лесоруб';$('clsSub').textContent=`${cl?CLASSES[cl].name+' · ':''}мир ${((S.meta&&S.meta.ng)||0)+1}`;
  const cv=$('pfCv'),c=cv.getContext&&cv.getContext('2d');if(!c||!c.clearRect)return;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
  const sp=heroSprite(cl,1,false,set);if(sp)c.drawImage(sp,PF_SRC[0],PF_SRC[1],PF_SRC[2],PF_SRC[2],0,0,cv.width,cv.width);
}
let helpSig='';""")
rep("· B — меню лагеря · K — карта","· B — лагерь · I — персонаж · K — карта",2)

# ===== 4. два меню: Персонаж и Лагерь, ⚙ — сохранение и звук
rep("let tab='hero', menuSig='';","""let tab='hero', menuSig='';
// какие вкладки в каком окне
const MENUS={hero:{title:'Персонаж',tabs:['hero','items','gear','log']},camp:{title:'Лагерь',tabs:['camp','def','vil','farm']},cfg:{title:'Настройки',tabs:['save']}};
let menuKind='camp';const lastTab={hero:'hero',camp:'camp',cfg:'save'};
const tabOk=t=>MENUS[menuKind].tabs.includes(t)||(t==='shop'&&menuKind==='camp'&&merchantHere());
function openMenu(kind,t){if(menuOpen&&menuKind===kind&&!menuFarm&&!t){toggleMenu(false);return}menuKind=kind;tab=t||lastTab[kind];if(!tabOk(tab))tab=MENUS[kind].tabs[0];toggleMenu(true)}""")
rep("function openShop(){if(!merchantHere())return;tab='shop';menuSig='';toggleMenu(true)}","function openShop(){if(!merchantHere())return;menuKind='camp';tab='shop';menuSig='';toggleMenu(true)}")
rep("function openMenuHere(){if(menuOpen){toggleMenu(false);return}const q=nearFarm();toggleMenu(true,q?q.id:null)}",
    "function openMenuHere(){if(menuOpen&&menuKind==='camp'){toggleMenu(false);return}const q=nearFarm();if(q){menuKind='camp';toggleMenu(true,q.id)}else{if(menuOpen)toggleMenu(false);openMenu('camp')}}\n"
    "$('heroBtn').onclick=()=>openMenu('hero');$('pfBtn').onclick=()=>openMenu('hero');$('cfgBtn').onclick=()=>openMenu('cfg','save');")
rep("tabsEl.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b){tab=b.dataset.tab;menuSig='';renderMenu()}});",
    "tabsEl.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b){tab=b.dataset.tab;if(tab!=='shop')lastTab[menuKind]=tab;menuSig='';renderMenu()}});")
rep("  const rows=fq?farmRowsHead(fq).concat(farmRows(fq)):rowsFor(tab);","  if(!fq&&!tabOk(tab))tab=MENUS[menuKind].tabs[0];\n  const rows=fq?farmRowsHead(fq).concat(farmRows(fq)):rowsFor(tab);")
rep("menuTitle.textContent=fq?farmName(fq):'Лагерь';","menuTitle.textContent=fq?farmName(fq):MENUS[menuKind].title;")
rep("tabsEl.innerHTML=fq?'':(merchantHere()?[['shop','Торговец']]:[]).concat(TABS).map(",
    "tabsEl.innerHTML=fq?'':(menuKind==='camp'&&merchantHere()?[['shop','Торговец']]:[]).concat(MENUS[menuKind].tabs.map(id=>TABS.find(q=>q[0]===id))).map(")
rep("  if(e.code==='KeyB'){openMenuHere();e.preventDefault();return}","  if(e.code==='KeyB'){openMenuHere();e.preventDefault();return}\n  if(e.code==='KeyI'){openMenu('hero');e.preventDefault();return}")
rep("if(t==='save'){R.push({save:true});","if(t==='save'){R.push({title:'Звук',desc:Snd.on?'Включён · клавиша M':'Выключен · клавиша M',mode:true,act:'sound'});R.push({save:true});")
rep("  if(a==='fxshake'){","  if(a==='sound'){setSound(!Snd.on);return}\n  if(a==='fxshake'){")
# подсказки, где теперь что
for a,b in [("Разберите лишнее во вкладке «Вещи».","Разберите лишнее в окне персонажа (I), вкладка «Вещи»."),
            ("Наденьте во вкладке «Вещи».","Наденьте в окне персонажа (I), вкладка «Вещи»."),
            ("Кузница построена. Вещи улучшаются во вкладке «Вещи».","Кузница построена. Вещи улучшаются в окне персонажа (I), вкладка «Вещи»."),
            ("'Второе оружие — в меню «Снаряжение».'","'Второе оружие — в окне персонажа (I), вкладка «Снаряжение».'"),
            ("'Тупым топором много не нарубишь. Загляни в меню построек и улучши топор.'","'Тупым топором много не нарубишь. Открой окно персонажа — клавиша I или портрет слева вверху — и во вкладке «Снаряжение» улучши топор. Улучшать можно только в лагере.'"),
            ("'Одним топором от всех не отобьёшься. Попроси в лагере сделать тебе второе оружие.'","'Одним топором от всех не отобьёшься. Второе оружие делают в лагере: окно персонажа, вкладка «Снаряжение».'"),
            ("'С боссов, из сундуков и склепов выпадают вещи. Открой снаряжение и надень что-нибудь.'","'С боссов, из сундуков и склепов выпадают вещи. Открой окно персонажа, вкладку «Вещи», и надень что-нибудь.'")]:
    rep(a,b,s.count(a) if s.count(a)>0 else 1)

# ===== 5. доступ для снимков
rep("window.__G={get S(){return S},","window.__G={get S(){return S},openMenu,get menuKind(){return menuKind},")
open('src/lumber-camp.html','w').write(s)
print('ok')
