/* ================= МАСТЕРСТВО ВЕТОК И СОЧЕТАНИЯ ================= */
const MASTERY={
  'Лесоруб':[
    {at:4, id:'fellchain',name:'Подсечка',  desc:'Срубленное дерево падает на соседнее и снимает с него половину прочности'},
    {at:8, id:'spirit',   name:'Лесной дух',desc:'Каждое срубленное дерево лечит 2 здоровья, 3% шанс найти под ним тайник'},
    {at:12,id:'whirl',    name:'Вихрь',     desc:'Рывок сквозь деревья и валуны бьёт их тройным ударом'}],
  'Воин':[
    {at:4, id:'rage',     name:'Раж',        desc:'Каждое убийство: +6% скорости удара на 4 с, до 5 раз подряд'},
    {at:8, id:'cleave',   name:'Рассечение', desc:'Топор задевает врагов рядом с целью (половина урона), каждая 4-я стрела бьёт критом'},
    {at:12,id:'exec',     name:'Казнь',      desc:'Обычный мертвец, у которого осталось меньше 15% здоровья, гибнет от удара. По боссам при меньше 30% здоровья +25% урона'}],
  'Строитель':[
    {at:4, id:'watch',    name:'Сторожа',        desc:'Без вас лагерь работает до 12 часов (было 8) и на 70% (было 50%)'},
    {at:8, id:'repair',   name:'Починка',        desc:'Днём забор, ратуша и хутора сами чинятся на 1% в секунду'},
    {at:12,id:'fire',     name:'Огненные стрелы',desc:'Башни лагеря и хуторов поджигают врагов'}],
};
const brPts=br=>Object.keys(PERKS).filter(k=>PERKS[k].br===br).reduce((s,k)=>s+pr(k),0);
const mastInfo=id=>{for(const br in MASTERY)for(const m of MASTERY[br])if(m.id===id)return [br,m];return [null,null]};
const mast=id=>{const [br,m]=mastInfo(id);return !!m&&brPts(br)>=m.at};
const COMBOS=[
  {id:'wrath',  name:'Лесной гнев',   need:'Подсечка + Раж',                                 desc:'Падающее дерево бьёт мертвецов рядом тройным уроном топора', ok:()=>mast('fellchain')&&mast('rage')},
  {id:'blaze',  name:'Пожар',         need:'Огненные стрелы + поджог на оружии или Кольцо Пламени', desc:'Горящий мертвец, погибая, поджигает соседей', ok:()=>mast('fire')&&(gear('burn')>0||hasUq('flame'))},
  {id:'shade',  name:'Тень лесоруба', need:'Вихрь + Плащ Тени',                              desc:'Рывок задевает и мертвецов: двойной удар топора', ok:()=>mast('whirl')&&hasUq('shadow')},
  {id:'harvest',name:'Кровавая жатва',need:'Казнь + Кровопийца или вампиризм на вещах',       desc:'Каждая казнь лечит 3 здоровья', ok:()=>mast('exec')&&(pr('vamp')>0||gear('vamp')>0)},
];
const combo=id=>{const c=COMBOS.find(q=>q.id===id);return !!c&&c.ok()};
function nextMast(br){const p=brPts(br);return MASTERY[br].find(m=>m.at>p)}
function checkMastery(br,before){
  for(const m of MASTERY[br])if(before<m.at&&brPts(br)>=m.at){toast(`Мастерство «${m.name}»: ${m.desc}`,'good');burst(P.x,P.y,30,['#f4c766','#fff2c0'],180,0.8,3)}
}

/* ================= СОЧНОСТЬ: частицы, тряска, замедление ================= */
let parts=[],shakeA=0,shakeT=0,slowT=0;
const FX={shake:true};
try{FX.shake=localStorage.getItem('lumber-camp-shake')!=='0'}catch(e){}
function burst(x,y,n,col,spd=120,life=0.5,sz=2.5){
  for(let i=0;i<n;i++){const a=Math.random()*6.283,s=spd*(0.35+Math.random()*0.8);
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:life*(0.6+Math.random()*0.6),m:life,c:Array.isArray(col)?col[i%col.length]:col,s:sz*(0.6+Math.random()*0.8)})}
  if(parts.length>600)parts.splice(0,parts.length-600);
}
function shake(a,t=0.2){if(!FX.shake)return;shakeA=Math.max(shakeT>0?shakeA:0,a);shakeT=Math.max(shakeT,t)}
function updFx(dt){
  for(const p of parts){p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const f=Math.max(0,1-3.5*dt);p.vx*=f;p.vy*=f}
  if(parts.length)parts=parts.filter(p=>p.t>0);
  shakeT=Math.max(0,shakeT-dt);
}
function drawFx(){for(const p of parts){ctx.globalAlpha=Math.min(1,p.t/p.m*1.6);ctx.fillStyle=p.c;ctx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}ctx.globalAlpha=1}
function dmgNum(x,y,d,crit){floats.push({x:x+(Math.random()*18-9),y,text:(d<10?String(Math.round(d*10)/10):String(Math.round(d)))+(crit?'!':''),color:crit?'#ffd34d':'#f2efe6',t:0.75,sz:crit?18:12})}

/* ================= ОТДЫХ И РАБОТА БЕЗ ИГРОКА ================= */
const offCap=()=>mast('watch')?12*3600:OFFLINE.cap, offEff=()=>mast('watch')?0.7:OFFLINE.eff;
const REST={gather:1.25,xp:1.5,max:600};
const restOn=()=>(S.rested||0)>0;
const mmss=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

/* ================= ЛЕТОПИСЬ: бестиарий, достижения, альбом ================= */
const LORE_T={1:'Медленный и слабый. Хорош, чтобы набить руку.',2:'Ходят по бору группами. Не давайте себя окружить.',3:'Крепче и быстрее. Нужен топор посерьёзнее.',4:'Житель Мёртвого леса. Бьёт больно, держите зелья.',5:'Опасен вблизи. Лучше встречать луком издалека.',6:'Пепельный лес кишит ими. Без брони не соваться.',7:'Порождение Костяной пущи, слуга Царя Мора.'};
const LORE_B={1:'Плодит слизней. Сперва мелочь, потом королеву.',2:'Бьёт по земле корнями. Отходите, когда он замахивается.',3:'Две головы, удар по площади. Не стойте вплотную.',4:'Резко бросается вперёд. Уходите рывком вбок.',5:'В воздухе берёт только лук, на земле только топор.',6:'Медленный, но удар оземь сносит половину здоровья.',7:'Владеет приёмами всех своих слуг.'};
function bestiary(){
  const E=[];
  for(const t in CFG.zombies)E.push({key:'t'+t,name:CFG.zombies[t].name,col:CFG.zombies[t].col,lore:LORE_T[t],grp:'Мертвецы'});
  E.push({key:'krunner',name:'Бегун',col:ZTYPES.runner.col,lore:'Быстрый, но хрупкий. Встречайте ударом, а не спиной.',grp:'Мертвецы'});
  E.push({key:'kram',name:'Таран',col:ZTYPES.ram.col,lore:'Ломает забор втрое быстрее. Ночью убивайте первым.',grp:'Мертвецы'});
  E.push({key:'kspitter',name:'Плевун',col:ZTYPES.spitter.col,lore:'Плюётся издалека. Сокращайте расстояние рывком.',grp:'Мертвецы'});
  E.push({key:'mimic',name:'Мимик',col:'#8a6a3a',lore:'Притворяется сундуком в склепах. Внутри ценная вещь.',grp:'Склепы'});
  E.push({key:'guard',name:'Хранитель склепа',col:'#5a5f6a',lore:'Сторожит последний зал склепа.',grp:'Склепы'});
  for(const b in CFG.bosses)E.push({key:'b'+b,name:CFG.bosses[b].name,col:CFG.zombies[zoneById(+b).ztier].col,lore:LORE_B[b],grp:'Боссы',boss:true});
  E.push({key:'final',name:'Владыка Мора',col:'#2a3a34',lore:'Хозяин портала. Победа над ним завершает поход.',grp:'Боссы',boss:true});
  return E;
}
function codexKill(z){
  const M=S.meta,keys=z.final?['final']:z.boss?['b'+z.boss]:z.guard?['guard']:z.mimic?['mimic']:['t'+z.tier].concat(z.kind?['k'+z.kind]:[]);
  for(const k of keys){const was=M.codex[k]||0;M.codex[k]=was+1;if(!was){const e=bestiary().find(q=>q.key===k);if(e)toast(`Летопись: новая запись «${e.name}»`,'good','cdx'+k)}}
  M.life.kills++;
}
const ACH=[
  {id:'blood1', name:'Первая кровь',      d:'Убить первого мертвеца',            p:()=>[S.stats.kills,1],        r:{w:20}},
  {id:'chop100',name:'Лесоруб',           d:'Срубить 100 деревьев',              p:()=>[S.stats.chopped,100],    r:{w:60}},
  {id:'chop1k', name:'Гроза леса',        d:'Срубить 1000 деревьев',             p:()=>[S.stats.chopped,1000],   r:{w:400,sh:10}},
  {id:'mine100',name:'Каменотёс',         d:'Разбить 100 валунов',               p:()=>[S.stats.mined,100],      r:{s:40}},
  {id:'night1', name:'Первая ночь',       d:'Пережить ночь',                     p:()=>[S.stats.nights,1],       r:{w:30}},
  {id:'week',   name:'Неделя в лесу',     d:'Дожить до 8-го дня (после Кровавой луны)', p:()=>[S.day,8],         r:{w:150,sh:5}},
  {id:'day20',  name:'Старожил',          d:'Дожить до 20-го дня',               p:()=>[S.day,20],               r:{w:400,sh:15}},
  {id:'clean5', name:'Чистая работа',     d:'5 ночей без прорыва в лагерь',      p:()=>[S.stats.cleanNights,5],  r:{s:60}},
  {id:'kill500',name:'Охотник на нечисть',d:'Убить 500 мертвецов',               p:()=>[S.stats.kills,500],      r:{sh:15}},
  {id:'boss1',  name:'Первый босс',       d:'Победить любого босса',             p:()=>[S.stats.bosses,1],       r:{sh:5}},
  {id:'boss7',  name:'Истребитель',       d:'Победить всех семерых боссов',      p:()=>[Object.keys(S.bosses).length,7], r:{sh:40}},
  {id:'farm3',  name:'Хозяин хуторов',    d:'Восстановить 3 хутора',             p:()=>[Object.keys(S.farms).length,3],  r:{w:200}},
  {id:'crypt1', name:'Расхититель склепов',d:'Пройти склеп до хранителя',        p:()=>[S.stats.crypts,1],       r:{sh:10}},
  {id:'legend', name:'Легенда',           d:'Добыть легендарную вещь',           p:()=>[(S.inv.concat(Object.values(S.eq))).some(i=>i&&i.rar===3)?1:0,1], r:{sh:20}},
  {id:'master', name:'Мастер',            d:'Открыть третье мастерство в любой ветке', p:()=>[Math.max(...Object.keys(MASTERY).map(brPts)),12], r:{sh:20}},
  {id:'combo',  name:'Сочетание',         d:'Собрать любое сочетание',           p:()=>[COMBOS.some(c=>c.ok())?1:0,1], r:{sh:15}},
  {id:'axe20',  name:'Пламенный топор',   d:'Топор 20-го уровня',                p:()=>[S.up.axe,20],            r:{sh:15}},
  {id:'bow12',  name:'Драконий лук',      d:'Лук 12-го уровня',                  p:()=>[S.bow,12],               r:{sh:15}},
  {id:'far7',   name:'На краю света',     d:'Дойти до Костяной пущи',            p:()=>[S.meta.best.zone,7],     r:{sh:10}},
  {id:'codex',  name:'Летописец',         d:'Заполнить весь бестиарий',          p:()=>[bestiary().filter(e=>S.meta.codex[e.key]).length,bestiary().length], r:{sh:30}},
  {id:'winner', name:'Победитель Мора',   d:'Одолеть Владыку Мора',              p:()=>[S.final.killed?1:0,1],   r:{sh:50}},
];
const rwTxt=r=>[r.w?r.w+' древесины':'',r.s?r.s+' камня':'',r.sh?r.sh+' осколков':''].filter(Boolean).join(', ');
let achT=0;
function updAch(dt){
  achT+=dt;if(achT<1)return;achT=0;
  const B=S.meta.best;
  B.day=Math.max(B.day,S.day);B.axe=Math.max(B.axe,S.up.axe);B.bow=Math.max(B.bow,S.bow);B.base=Math.max(B.base,S.base);B.fence=Math.max(B.fence,S.fence.lvl);B.tower=Math.max(B.tower,...S.towers);
  if(!DG){const z=zoneAt(P.x,P.y);if(z)B.zone=Math.max(B.zone,z.id)}
  for(const a of ACH){if(S.meta.ach[a.id])continue;const [c,n]=a.p();if(c>=n){S.meta.ach[a.id]=Date.now();
    S.wood+=a.r.w||0;S.stone+=a.r.s||0;S.shards+=a.r.sh||0;sfx.levelup();burst(P.x,P.y,24,['#f4c766','#fff2c0','#e98b3d'],160,0.8,3);
    toast(`Достижение «${a.name}»: +${rwTxt(a.r)}`,'good');save();break}}
}
function logRows(){
  const R=[],M=S.meta,E=bestiary(),known=E.filter(e=>M.codex[e.key]).length,achN=ACH.filter(a=>M.ach[a.id]).length;
  R.push({note:`Летопись не сбрасывается при поражении и новом переселении. Бестиарий ${known}/${E.length} · достижений ${achN}/${ACH.length}`});
  R.push({note:'<b>Рекорды</b>'});
  R.push({raw:`<div class="stats-grid">${[['Лучший день',M.best.day],['Дальше всего',zoneById(M.best.zone).name],['Убито всего',M.life.kills],['Срублено всего',M.life.chopped],['Разбито всего',M.life.mined],['Побед над Мором',M.wins]].map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>`});
  for(const g of ['Мертвецы','Склепы','Боссы']){
    R.push({note:`<b>Бестиарий: ${g.toLowerCase()}</b>`});
    R.push({raw:`<div class="cdx">${E.filter(e=>e.grp===g).map(e=>{const n=M.codex[e.key]||0;return n
      ?`<div class="cdx-c"><i style="background:${e.col}${e.boss?';box-shadow:0 0 0 2px #cf4b3f':''}"></i><div><b>${e.name}</b><small>убито: ${n}</small><p>${e.lore}</p></div></div>`
      :`<div class="cdx-c unk"><i>?</i><div><b>???</b><small>ещё не встречен</small></div></div>`}).join('')}</div>`});
  }
  R.push({note:'<b>Достижения</b>'});
  R.push({raw:`<div class="cdx">${ACH.map(a=>{const done=M.ach[a.id],[c,n]=a.p(),pc=Math.min(100,100*c/n);
    return `<div class="cdx-c ach${done?' done':''}"><i>${done?'★':'☆'}</i><div><b>${a.name}</b><small>${a.d} · награда: ${rwTxt(a.r)}</small>${done?'':`<div class="bar"><i style="width:${pc}%"></i></div><small>${Math.min(c,n)}/${n}</small>`}</div></div>`}).join('')}</div>`});
  R.push({note:'<b>Альбом обликов</b> · открываются навсегда, как только вы их достигли'});
  const al=[];
  AXE_SKINS.forEach((k,i)=>al.push({n:'Топор: '+k.name,ok:M.best.axe>=k.from,ico:skinIcon('axe',i),h:`топор ур. ${k.from}`}));
  BOW_SKINS.forEach((k,i)=>al.push({n:'Лук: '+k.name,ok:M.best.bow>=k.from,ico:skinIcon('bow',i),h:`лук ур. ${k.from}`}));
  HQ_SKINS.forEach((n,i)=>{if(i)al.push({n:'Лагерь: '+n,ok:M.best.base>=i,h:`главный дом ур. ${i}`})});
  FENCE_SKINS.forEach((n,i)=>{if(i)al.push({n:'Забор: '+n,ok:fenceSkin(M.best.fence)>=i&&M.best.fence>0,h:`забор ур. ${i*2-1}`})});
  TOWER_SKINS.forEach((n,i)=>{if(i)al.push({n:'Башня: '+n,ok:M.best.tower>=i,h:`башня ур. ${i}`})});
  R.push({raw:`<div class="cdx">${al.map(a=>`<div class="cdx-c${a.ok?'':' unk'}">${a.ico?`<img src="${a.ico}" alt="" width="34" height="34" style="${a.ok?'':'filter:grayscale(1) brightness(.35)'}">`:`<i>${a.ok?'✓':'?'}</i>`}<div><b>${a.ok?a.n:'???'}</b><small>${a.ok?'открыт':a.h}</small></div></div>`).join('')}</div>`});
  return R;
}
