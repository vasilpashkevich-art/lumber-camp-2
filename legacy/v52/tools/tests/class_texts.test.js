// Надписи под класс: за Варвара, Мага и Лучника не должно быть слов про чужое оружие.
// Собирает тексты умений, мастерства, сочетаний, реликвий, достижений, летописи, обучения, меню всех вкладок,
// подсказки, кнопки и сообщения во время игры (оружие, способности, дракон в воздухе, кузница).
const {execFileSync}=require('child_process');
if(!process.env.CLS){let bad=0;for(const c of ['warrior','mage','archer']){try{const o=execFileSync(process.execPath,[__filename],{env:{...process.env,CLS:c},encoding:'utf8'});process.stdout.write(o)}catch(e){bad++;process.stdout.write(e.stdout||String(e))}}
  console.log(bad?'FAILED '+bad:'class texts ok');process.exit(0)}
require('./harness.js');globalThis.NO_CLS=true;boot();const g=G_;const CLS=process.env.CLS;let S=g.S;S.cls=CLS;frames(2);
const T=[];const add=(src,v)=>{if(v==null)return;if(typeof v==='function')v=v(1)+' '+v(2);T.push([src,String(v)])};
// богатое состояние: всё открыто
S.lvl=30;S.bow=6;S.up.axe=8;S.forge=true;S.base=6;S.wood=1e6;S.stone=1e6;S.iron=1e4;S.shards=1e4;S.keys=5;S.p.hp=1e6;
for(const k in g.PERKS)if(g.perkAvail(k))S.perks[k]=g.PERKS[k].max;
for(const k in g.RELICS)S.meta.relics[k]=1;for(const k in g.RELIC2)S.meta.relics[k]=2;
for(const sl of ['weapon','head','armor','legs','amulet','ring'])S.eq[sl]=g.makeItem(4,3,sl);S.inv.push(g.makeItem(3,2,'weapon'));
// 1. данные
for(const k in g.PERKS)if(g.perkAvail(k)){add('умение '+k,g.perkName(k));add('умение '+k,g.perkDesc(k));add('ветка',g.brLabel(g.PERKS[k].br))}
for(const br in g.MASTERY)for(const m of g.MASTERY[br]){add('мастерство',m.name);add('мастерство',m.desc)}
for(const c of g.COMBOS){add('сочетание',c.name);add('сочетание',c.need);add('сочетание',c.desc)}
for(const k in g.RELICS){add('реликвия',g.RELICS[k].name);add('реликвия',g.RELICS[k].desc)}
for(const k in g.RELIC2){if(k==='hammer')continue;add('реликвия '+k,g.RELIC2[k].name);add('реликвия '+k,g.RELIC2[k].desc)}
if(g.PETS_&&g.PETS_[CLS]){add('спутник',g.PETS_[CLS].name);add('спутник',g.PETS_[CLS].desc)}
for(const a of g.ACH){add('достижение',a.name);add('достижение',a.d)}
for(const e of g.bestiary()){add('летопись',e.name);add('летопись',e.lore)}
for(const k in g.CRYPT_PH)for(const p of g.CRYPT_PH[k]){add('склеп',p.n);add('склеп',p.h)}
for(const st of g.TUT){add('обучение',st.say);add('обучение',st.task)}
const C=g.CLASSES[CLS];for(const k in C)if(typeof C[k]==='string')add('класс',C[k]);
add('комплект',g.SETAB[CLS].name);add('комплект',g.SETAB[CLS].d);add('комплект',g.SETS[CLS].name);
for(const k in g.UNIQUES){add('особая вещь',g.UNIQUES[k].name);add('особая вещь',g.UNIQUES[k].desc)}
for(const m of g.MERCH)add('торговец',m.t);
// 2. меню: все вкладки, характеристики героя
for(const [id] of g.TABS.concat([['shop']])){try{add('меню '+id,JSON.stringify(g.rowsFor(id)))}catch(e){add('меню '+id,'')}}
add('герой',JSON.stringify(g.heroStats()));
// 3. окно умений: много раз подряд
for(let i=0;i<40;i++){S.perkPend=1;for(const k in g.PERKS)if(g.perkAvail(k))S.perks[k]=0;try{g.rollPerks().forEach(k=>{add('окно умений',g.perkName(k)+' '+g.perkDesc(k))})}catch(e){}}
S.perkPend=0;
// 4. события в игре: сообщения и надписи над головой
globalThis.TOASTS=[];els.perks.hidden=true;
S.weapon='bow';frames(3);add('кнопка оружия',els.wpnBtn.textContent);add('подсказка',els.help&&els.help.innerHTML||(require('fs').readFileSync(require('path').resolve(__dirname,'../../index.html'),'utf8').match(/<div id="help">([\s\S]*?)<\/div>/)||[])[1]);
g.P.x=g.CX+900;g.P.y=g.CX;g.zombies().length=0;
const z=g.makeZombie(2,g.P.x+30,g.P.y,false,null);z.hp=z.max=1e5;z.speed=0;z.dmg=0;g.zombies().push(z);
for(let i=0;i<20;i++){g.P.cd=0;g.secAttack({k:'z',o:z});frames(1)}
g.useAbility();frames(30);g.SX.cd=0;for(const sl of ['head','armor','legs'])S.eq[sl]=g.makeSetItem(CLS,sl,3);g.useSetAbility();frames(30);
// дракон: в воздухе и на земле, удары по неуязвимому
const zd=g.CFG.zones.find(q=>g.CFG.bosses[q.id]&&g.CFG.bosses[q.id].skin==='dragon');
if(zd){g.zombies().length=0;const L=g.lairs().find(l=>l.zone===zd.id);g.P.x=L.x;g.P.y=L.y+60;const d=g.makeBoss(zd.id);d.x=L.x;d.y=L.y;d.engaged=true;d.speed=0;d.dmg=0;g.zombies().push(d);
  for(const fly of [true,false]){d.fly=fly;d.phT=0.01;frames(2);d.immT=0;g.hitZombie(d,1,g.P.x,g.P.y,'melee');d.immT=0;g.hitZombie(d,1,g.P.x,g.P.y,'ranged')}}
// кузница и изготовление оружия
g.zombies().length=0;g.P.x=g.CX;g.P.y=g.CX+40;frames(2);S.bow=0;g.doAct('bow');S.bow=6;try{g.doAct('temper:bow');g.doAct('temper:melee')}catch(e){}
for(const m of globalThis.TOASTS)add('сообщение',m);for(const m of globalThis.CTXT||[])add('надпись на экране',m);if(process.env.DUMP)console.log(globalThis.TOASTS.join('\n'));
// 5. проверка
const W={bow:/(^|[^а-яё])(лук|лука|луком|луку|луке)([^а-яё]|$)|тетив|колчан|(^|[^а-яё])стрел(а|ы|у|ой|ою|е|ами|ам)?([^а-яёк]|$)|наконечник/i,
  hammer:/молот/i,staff:/посох/i,fire:/огненн[а-яё]* шар/i,shot:/выстрел/i};
const FORBID={warrior:['bow','staff','fire','shot'],mage:['bow','hammer'],archer:['hammer','staff','fire']}[CLS];
// законные исключения: стрелы башен и стражи, пни-стрелки в склепе
const OK=[/Молот Громовержца/g,/Молот сам летит[^.]*/g,/Огненные стрелы/g,/Пни-стрелки/g,/[^.]*(башн|Башн|страж|Страж)[^.]*/g];
let bad=0;const seen=new Set();
for(const [src,t0] of T){let t=t0.replace(/<[^>]+>/g,' ');for(const r of OK)t=t.replace(r,'');
  for(const f of FORBID)if(W[f].test(t)){const m=t.match(W[f]),i=Math.max(0,t.search(W[f])-40),key=src+'|'+t.slice(i,i+100);if(seen.has(key))continue;seen.add(key);bad++;console.log(`FAIL [${CLS}] ${src}: …${t.slice(i,i+100)}…`)}}
console.log(`${CLS}: проверено ${T.length} текстов, ошибок ${bad}`);process.exit(bad?1:0);
