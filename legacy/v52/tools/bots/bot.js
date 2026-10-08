// Автоигрок: проходит миры за выбранный класс без отрисовки и пишет статистику.
// Запуск: node tools/bots/bot.js <класс> <зерно> <миров> <лимит дней на мир>  → JSON в tools/bots/out/
require('../tests/harness.js');
const fs=require('fs'),path=require('path');
const CLS=process.argv[2]||'warrior',SEED=+(process.argv[3]||101),WORLDS=+(process.argv[4]||3),DAYCAP=+(process.argv[5]||60);
let rs=SEED*9301+49297;Math.random=()=>{rs=(rs*16807)%2147483647;return (rs-1)/2147483646};// повторяемость прогона
globalThis.NO_CLS=true;boot();
const g=G_;let S=g.S;S.cls=CLS;S.seed=SEED;g.newGame(false);S=g.S;S.cls=CLS;
['perks','dawn','tut','win','over'].forEach(id=>document.getElementById(id));els.perks.hidden=true;els.dawn.hidden=true;
const DT=0.05,CX=()=>g.CX,CY=()=>g.CX;
globalThis.DMG={};const log={cls:CLS,seed:SEED,worlds:[],errors:[],stuck:[],events:[]};
let W=null,nightBreach=false;// статистика текущего мира
function newWorldStat(){W={ng:S.meta.ng,startDay:S.day,zoneDay:{},bossTry:{},bossTime:{},deaths:0,deathsByDay:{},campFell:0,nights:0,breaches:0,crypts:0,cryptDeaths:0,levelByDay:{},resByDay:{},buys:{},stuckN:0,finalDay:null,outcome:null,potions:0,maxLvl:0,boss:{},modeT:{}};log.worlds.push(W)}
newWorldStat();
// --- перехват сообщений игры
const seenT=new Set();
function scanToasts(){const T=globalThis.TOASTS||[];while(T.length){const m=T.shift();
  if(/Вас одолели/.test(m)){W.deaths++;W.deathsByDay[S.day]=(W.deathsByDay[S.day]||0)+1;if(mode.dg)W.cryptDeaths++;log.events.push([W.ng,S.day,'смерть',where()])}
  if(/Забор пробит/.test(m))nightBreach=true;
  if(/повержен/i.test(m)&&!seenT.has(m)){seenT.add(m);log.events.push([W.ng,S.day,m.slice(0,60)])}}}
const where=()=>mode.dg?'склеп':mode.name+(mode.zone?(' зона '+mode.zone):'');
// --- управление: клавиши движения и действия
const K=g.keys;function moveTo(x,y,stop=10){const dx=x-g.P.x,dy=y-g.P.y,d=Math.hypot(dx,dy);for(const k of ['KeyW','KeyA','KeyS','KeyD'])K.delete(k);if(d<stop)return true;
  const ax=dx/d,ay=dy/d;if(ax>0.38)K.add('KeyD');if(ax<-0.38)K.add('KeyA');if(ay>0.38)K.add('KeyS');if(ay<-0.38)K.add('KeyW');return false}
function act(on){if(on)K.add('Space');else K.delete('Space')}
function press(code){key(code,true);key(code,false)}
const d2=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// --- выбор умений и реликвий (как средний игрок: сила, здоровье, своя ветка, потом добыча и стройка)
const PERK_PRI=['str','vit','smash','flame','mshield','eagle','pierce','vamp','hand','pack','legs','agile','aim','eng','mason','thrift','boss','luck'];
function handlePopups(){
  if(S.perkPend>0){const off=g.rollPerks();if(off.length){off.sort((a,b)=>PERK_PRI.indexOf(a)-PERK_PRI.indexOf(b));const k=off[0];S.perks[k]=(S.perks[k]||0)+1}S.perkPend--;els.perks.hidden=true}
  if(S.meta.relicPend>0){g.showRelics();const off=g.relicOffer||[];const k=off[0];if(k){S.meta.relics[k]=(S.meta.relics[k]||0)+1;if(k==='keyr')S.keys+=2;if(k==='flask')S.potions+=2;if(k==='hoard'){S.wood+=150;S.stone+=40}if(k==='vet'){S.lvl+=2;S.perkPend+=2}}S.meta.relicPend--;els.perks.hidden=true}
  if(!els.tut.hidden){if(g.tutOn()){g.tutClaim();if(g.tutOn()&&!S.tut.taken)S.tut.taken=true}g.closeTut()}
  if(g.menuOpen)g.toggleMenu(false);
  els.dawn.hidden=true;els.perks.hidden=true;
}
// --- покупки в лагере: сначала нужное, потом самое дешёвое из доступного
const costOf=c=>c?(c.w||0)+(c.s||0)*2+(c.i||0)*6+(c.sh||0)*6:1e9;
function shop(){if(!g.inCamp())return;let n=0;
  for(let guard=0;guard<25;guard++){
    // вещи: надеть лучшее, разобрать лишнее
    for(const r of g.rowsFor('items'))if(r.itm&&!r.eqd){const it=r.itm,cur=S.eq[it.slot];if(!cur||(it.rar*10+it.tier)>(cur.rar*10+cur.tier)){g.doAct('equip:'+it.id)}}
    while(S.inv.length>14){const it=S.inv.sort((a,b)=>(a.rar*10+a.tier)-(b.rar*10+b.tier)).find(i=>!i.set);if(!it)break;g.doAct('salvage:'+it.id)}
    const rows=[];for(const t of ['gear','camp','def','vil'])for(const r of g.rowsFor(t))if(r.act&&r.cost&&!r.why&&!/^(reset|copy|load|sound|fxshake|job)/.test(r.act))rows.push(r);
    if(!rows.length)break;
    const need=nextZone(),axeNeed=need?g.CFG.trees[need.tree].axe:20;
    const WGT={up:{axe:3,hp:3.5,boots:1,bag:1.3,pick:1},bow:3,base:2.2,fence:1.6,tower:1.3,house:1.3,hqfix:6,repair:6,trapfix:3,fix:3,moat:0.9,traps:0.9,ball:0.9,bowl:0.9,guardup:0.9,forge:1.2,shop:0.7};
    const wt=r=>{const [k,a1]=r.act.split(':');let w=WGT[k];if(typeof w==='object')w=w[a1]||1;w=w||0.8;
      if(r.act==='up:axe'&&S.up.axe<axeNeed)w*=4;if(r.act==='bow'&&S.bow<1)w*=4;if(r.act==='base'&&S.base<2)w*=3;if(r.act==='fence'&&S.fence.lvl<1)w*=3;if(r.act==='up:pick'&&need&&S.up.pick<g.CFG.rocks.pick[need.id])w*=3;return w};
    rows.sort((a,b)=>wt(b)/costOf(b.cost)-wt(a)/costOf(a.cost));const r=rows[0];
    const w0=S.wood+S.stone;g.doAct(r.act);if(S.wood+S.stone===w0)break;W.buys[r.act.split(':')[0]]=(W.buys[r.act.split(':')[0]]||0)+1;n++}
  return n}
// --- цели
const zones=()=>g.CFG.zones;
function nextZone(){return zones().find(z=>!g.zoneCleared(z))}
const zid=(x,y)=>{const z=g.zoneAt(x,y);return z?z.id:0};
function nearest(list,f,from=g.P){let b=null,bd=1e18;for(const o of list){if(!f(o))continue;const dd=(o.x-from.x)**2+(o.y-from.y)**2;if(dd<bd){bd=dd;b=o}}return b}
const mode={name:'старт',zone:0,dg:false,t:0,target:null,bossStart:0};
let lastPos={x:0,y:0,t:0},stuckT=0,sideT=0,sideDir=0,tSim=0;
function stuckCheck(moving){if(!moving){stuckT=0;return false}if(d2(g.P,lastPos)>6){lastPos={x:g.P.x,y:g.P.y};stuckT=0;return false}stuckT+=DT;
  if(stuckT>3){stuckT=0;W.stuckN++;if(log.stuck.length<40)log.stuck.push([W.ng,S.day,Math.round(g.P.x),Math.round(g.P.y),where()]);sideT=1.2;sideDir=Math.random()*6.283;return true}return false}
function heroPower(){const st=g.heroStats();return st}
function readyFor(z){if(!z)return false;const axe=g.CFG.trees[z.tree].axe;return S.up.axe>=axe&&S.lvl>=1+(z.id-1)*3}
function bossReady(z){return S.p.hp>g.maxHp(S.up.hp)*0.8&&(S.lvl>=3+z.id*3&&S.potions>0||S.lvl>=4+z.id*3)}
function decide(){
  const ph=g.phase(),mh=g.maxHp(S.up.hp),hp=S.p.hp,cap=g.bagCap(S.up.bag),bag=S.bag+S.bagStone+(S.bagIron||0);
  if(hp<mh*0.45&&S.potions>0){press('KeyQ');W.potions++}
  if(g.DG){mode.dg=true;return crypt()}mode.dg=false;dgT=0;
  // финал
  if(g.allCleared()&&!S.final.killed){const pp=g.portalPos();const fz=g.zombies().find(z=>z.final);if(fz){mode.name='финал';return fight(fz,true)}if(pp){mode.name='портал';if(moveTo(pp.x,pp.y,40)){act(true)}return}}
  // ночь — к лагерю, бить, кто подошёл
  if(ph.night){mode.name='ночь';const c0={x:CX(),y:CY()+40};const z=nearest(g.zombies(),z=>(z.wave||z.hunt)&&d2(z,c0)<300);
    if(z&&hp<mh*0.3&&S.potions<=0){act(false);moveTo(c0.x*2-z.x,c0.y*2-z.y,1);return}
    if(z)return fight(z);act(false);moveTo(c0.x,c0.y,20);return}
  // мало здоровья — в лагерь лечиться
  if(hp<mh*0.35||(mode.name==='лечение'&&hp<mh*0.9)){mode.name='лечение';act(false);moveTo(CX(),CY()+40,20);return}
  if(bag>=cap){mode.name='сдать';act(false);moveTo(CX(),CY()+30,20);return}
  // склеп: есть ключ, открыт, герой окреп
  const cr=g.crypts()[0];if(cr&&S.keys>0&&(S.crypts[cr.id]||0)<=S.day&&S.lvl>=8&&hp>mh*0.9&&!ph.night&&ph.left>60){mode.name='к склепу';if(moveTo(cr.x,cr.y,30)){const t=g.specialTarget();if(t&&t.ok&&/склеп/.test(t.msg||'')){t.fn();W.crypts++}}return}
  const z=nextZone();mode.zone=z?z.id:0;
  // бой в зоне
  if(z&&readyFor(z)){
    const mob=nearest(g.zombies(),q=>!q.boss&&!q.wave&&q.zone===z.id&&!q.final);
    if((S.killed[z.id]||0)<g.zCnt(z)&&mob){mode.name='зачистка';return fight(mob)}
    const md=nearest(g.mounds(),m=>!m.dead&&m.zone===z.id);if(md){mode.name='могильник';if(moveTo(md.x,md.y,36))act(true);return}
    if(!S.bosses[z.id]){const L=g.lairs().find(l=>l.zone===z.id);const b=g.zombies().find(q=>q.boss===z.id);
      if(L&&b&&bossReady(z)){mode.name='босс';if(mode.target!==b){mode.target=b;mode.bossStart=tSim;W.bossTry[z.id]=(W.bossTry[z.id]||0)+1}return fight(b,true)}}
    if(mob){mode.name='зачистка';return fight(mob)}}
  // хижины по пути
  const poi=nearest(g.pois(),q=>!S.poi[q.id]&&q.zone<=(z?z.id:7)&&d2(q,g.P)<1400);if(poi){mode.name='хижина';moveTo(poi.x,poi.y,10);act(true);return}
  // добыча: камень, если надо, иначе дерево
  gather(z);
}
function gather(z){const tierMax=Math.max(...Object.keys(g.CFG.trees).map(Number).filter(t=>g.CFG.trees[t].axe<=S.up.axe));
  const wantStone=S.stone<S.wood*0.3&&S.up.pick>=1;
  S.weapon='axe';
  const rk=wantStone&&nearest(g.rocks(),r=>r.alive&&S.up.pick>=g.CFG.rocks.pick[r.zone]&&d2(r,g.P)<1500);
  const tr=nearest(g.trees2(),t=>t.alive&&t.tier<=tierMax&&t.tier>=Math.max(1,tierMax-1)&&d2(t,g.P)<1800)||nearest(g.trees2(),t=>t.alive&&t.tier<=tierMax);
  const o=rk||tr;if(!o){mode.name='бродит';moveTo(CX()+300,CY(),10);return}mode.name=rk?'камень':'рубка';
  if(moveTo(o.x,o.y+4,o.r+16))act(true);else act(d2(o,g.P)<o.r+30)}
function fight(z,big){
  if(big&&(z.charge>0||z.slam>0||z.abT<0.4)){const a=Math.atan2(z.y-g.P.y,z.x-g.P.x)+Math.PI/2;moveTo(g.P.x+Math.cos(a)*80,g.P.y+Math.sin(a)*80,1);act(true);return}
  const near=g.zombies().filter(q=>d2(q,g.P)<170).length;
  S.weapon=S.bow>0&&(CLS!=='warrior'||near>=2||big)?'bow':'axe';
  const ranged=S.weapon==='bow'&&CLS!=='warrior',reach=ranged?Math.min(280,230+S.bow*5):z.r+26,d=d2(z,g.P);
  if(d>reach)moveTo(z.x,z.y,reach*0.8);
  else if(ranged&&d<reach*0.45)moveTo(g.P.x*2-z.x,g.P.y*2-z.y,1);
  else for(const k of ['KeyW','KeyA','KeyS','KeyD'])K.delete(k);
  act(d<reach+10);
  if(near>=2||big){press('KeyC');press('KeyV');for(const k of g.ownedRelics())if(g.RELIC2[k]&&g.RELIC2[k].act&&k!=='mirror')press(g.RELIC2[k].key)}
  if(big&&S.p.hp<g.maxHp(S.up.hp)*0.25&&S.potions<=0){mode.name='отступ';mode.target=null;moveTo(CX(),CY()+40,20)}}
let dgT=0;
function crypt(){const D=g.DG;mode.name='склеп';dgT+=0.2;
  if(dgT>150){dgT=0;W.cryptStuck=(W.cryptStuck||0)+1;if(log.stuck.length<40)log.stuck.push([W.ng,S.day,Math.round(g.P.x),Math.round(g.P.y),'склеп: 150 с без выхода, комната '+(D.rooms.findIndex(r=>!r.cleared))]);g.leaveCrypt('бот вышел');return}
  if(D.gateOpen===false){if(moveTo(D.gate.x-30,D.gate.y,12)){const t=g.specialTarget();if(t&&t.fn&&t.ok)t.fn();else{const e=g.specialTarget();}}return}
  if(D.chest&&!D.chest.open){if(moveTo(D.chest.x,D.chest.y,20)){g.openDunChest()}return}
  if(D.exit){if(moveTo(D.exit.x,D.exit.y,20)){const t=g.specialTarget();if(t&&t.fn)t.fn()}return}
  const z=nearest(g.zombies(),q=>q.dun!=null);if(z)return fight(z,!!z.cboss);
  const r=D.rooms.find(r=>!r.cleared)||D.rooms.at(-1);moveTo(r.x+r.w/2,r.y+r.h/2,30)}
// --- главный цикл
const t0=Date.now();let lastDay=S.day,decT=0,errs=0,worldStart=Date.now();
function endWorld(outcome){W.outcome=outcome;W.finalDay=S.day;W.maxLvl=S.lvl;W.days=S.day-W.startDay+1;W.cls=CLS;W.relics=Object.keys(S.meta.relics).length;W.realSec=Math.round((Date.now()-worldStart)/1000)}
while(true){
  tSim+=DT;tick(DT*1000);if(process.env.PROG&&Math.floor(tSim/DT)%2000===0)console.error('t',Math.round(tSim),'сек',Math.round((Date.now()-t0)/1000),'день',S.day,'clock',Math.round(S.clock),'режим',mode.name,'DG',!!g.DG,'зомби',g.zombies().length,'тики/с');
  try{g.update(DT)}catch(e){errs++;if(log.errors.length<20)log.errors.push([W.ng,S.day,String(e.stack||e).split('\n').slice(0,3).join(' | ')])}
  if(Math.floor(tSim/DT)%10===0)flushTimers();
  scanToasts();S=g.S;W.modeT[mode.name]=(W.modeT[mode.name]||0)+DT;
  if(S.day!==lastDay){if(process.env.PROG)console.error('день',S.day,'мир',W.ng+1,'сек',Math.round((Date.now()-t0)/1000),'зомби',g.zombies().length,'режим',mode.name);W.nights++;if(nightBreach)W.breaches++;nightBreach=false;W.levelByDay[S.day]=S.lvl;W.resByDay[S.day]=[Math.round(S.wood),Math.round(S.stone),S.base,S.up.axe,S.bow,S.fence.lvl];lastDay=S.day;
    for(const z of zones())if(g.zoneCleared(z)&&W.zoneDay[z.id]==null)W.zoneDay[z.id]=S.day-W.startDay+1;
    for(const k in S.bosses)if(S.bosses[k]&&W.bossTime[k]==null)W.bossTime[k]=S.day-W.startDay+1}
  if(S.over){W.campFell++;endWorld('лагерь пал');log.events.push([W.ng,S.day,'лагерь пал']);g.newGame(true);S=g.S;S.cls=CLS;newWorldStat();els.over&&(els.over.hidden=true);lastDay=S.day;worldStart=Date.now();if(log.worlds.length>WORLDS+3)break;continue}
  if(S.final.killed){endWorld('победа');if(W.ng+1>=WORLDS)break;S.meta.ng++;S.meta.relicPend+=2;g.newGame(true);S=g.S;S.cls=CLS;els.win.hidden=true;newWorldStat();lastDay=S.day;worldStart=Date.now();continue}
  if(S.day-W.startDay+1>DAYCAP){endWorld('не успел');break}
  handlePopups();
  if(process.env.TRACE2&&!g.phase().night&&Math.floor(tSim/DT)%600===0&&S.day>=+process.env.TRACE2&&S.day<=+process.env.TRACE2+1){const z=nextZone();console.log('день',S.day,'цель',z&&z.id,'живых',g.zombies().filter(q=>!q.wave&&!q.boss&&q.zone===(z&&z.id)).length,'убито',S.killed[z&&z.id],'/',z&&g.zCnt(z),'могильников',g.mounds().filter(m=>!m.dead&&m.zone===(z&&z.id)).length,'босс жив',!S.bosses[z&&z.id],'готов',readyFor(z),bossReady(z),'ур',S.lvl,'топор',S.up.axe,'режим',mode.name,'hp',Math.round(S.p.hp))}
  if(process.env.TRACE&&g.phase().night&&Math.floor(tSim/DT)%400===0&&S.day>=+process.env.TRACE&&S.day<=+process.env.TRACE+1){const wz=g.zombies().filter(z=>z.wave);const by={};for(const z of wz){const k=z.tier+(z.kind||'');by[k]=(by[k]||0)+1}console.log('день',S.day,'волна',wz.length,JSON.stringify(by),'герой',Math.round(S.p.hp)+'/'+g.maxHp(S.up.hp),'ур',S.lvl,'топор',S.up.axe,'оружие',S.bow,'забор',S.fence.lvl,Math.round(S.fence.hp),'ратуша',Math.round(S.hq),'башни',S.towers.join(''),'зелья',S.potions,'режим',mode.name,'урон',JSON.stringify(g.heroStats().slice(1,3).map(r=>r[1])))}
  decT-=DT;if(decT<=0){decT=0.2;if(g.inCamp())shop();
    if(sideT>0){sideT-=0.2;moveTo(g.P.x+Math.cos(sideDir)*100,g.P.y+Math.sin(sideDir)*100,1)}else{try{decide()}catch(e){errs++;if(log.errors.length<20)log.errors.push(['бот',S.day,String(e.stack||e).split('\n').slice(0,2).join(' | ')])}}
    stuckCheck(['KeyW','KeyA','KeyS','KeyD'].some(k=>K.has(k)))}
  if(Date.now()-t0>1000*60*25){endWorld('время вышло');break}
}
log.realSec=Math.round((Date.now()-t0)/1000);log.dmg=globalThis.DMG;log.errCount=errs;
fs.mkdirSync(path.join(__dirname,'out'),{recursive:true});fs.writeFileSync(path.join(__dirname,'out',`${CLS}_${SEED}.json`),JSON.stringify(log));
console.log(CLS,SEED,'миров',log.worlds.length,log.worlds.map(w=>`${w.outcome}:${w.days}д ур${w.maxLvl} смертей ${w.deaths}`).join(' | '),'ошибок',errs,'сек',log.realSec);
process.exit(0);
