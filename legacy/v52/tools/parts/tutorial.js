// фигура старца (эскиз tools/proto/elder.html)
const ELDERFIG=(()=>{const O='#24180f';let c;
function hp(fn,fill,lw=1.1){c.beginPath();fn();if(fill){c.fillStyle=fill;c.fill()}if(lw){c.strokeStyle=O;c.lineWidth=lw;c.stroke()}}
function glow(x,y,r,col,a){const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}
// старец: смотрит вправо, origin — грудь, ноги на +12
function elder(x,y,s,mark,night,t){c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.lineCap='round';
  c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(0,13,11,3.4,0,0,7);c.fill();
  // посох с фонарём (сзади)
  c.strokeStyle=O;c.lineWidth=3;c.beginPath();c.moveTo(11,13);c.lineTo(13,-26);c.stroke();c.strokeStyle='#7a5530';c.lineWidth=1.8;c.stroke();
  hp(()=>{c.moveTo(13,-26);c.quadraticCurveTo(17,-30,14,-34);c.quadraticCurveTo(12,-30,13,-26)},'#7a5530',0.8);
  if(night)glow(16,-22,30,'255,200,90',0.55);
  c.strokeStyle=O;c.lineWidth=0.8;c.beginPath();c.moveTo(14,-29);c.lineTo(16,-26);c.stroke();hp(()=>c.roundRect(13.4,-26,5.2,7,1.2),night?'#ffd36a':'#c9a24a',0.9);hp(()=>c.rect(13,-26.6,6,1.4),'#5a4128',0.6);
  // ряса до земли
  hp(()=>{c.moveTo(-7,-5);c.quadraticCurveTo(0,-8,7,-5);c.lineTo(10,12);c.quadraticCurveTo(0,14.5,-10,12);c.closePath()},'#7a6a52');
  c.save();c.beginPath();c.moveTo(-7,-5);c.quadraticCurveTo(0,-8,7,-5);c.lineTo(10,12);c.quadraticCurveTo(0,14.5,-10,12);c.closePath();c.clip();c.fillStyle='rgba(0,0,0,.18)';c.fillRect(-11,-8,6,24);
  c.strokeStyle='#5a4c38';c.lineWidth=0.7;for(const px of [-3,3]){c.beginPath();c.moveTo(px,-4);c.lineTo(px*1.6,13);c.stroke()}c.restore();
  hp(()=>{c.moveTo(-9.5,11.6);c.quadraticCurveTo(0,14,9.5,11.6);c.lineTo(9.2,10);c.quadraticCurveTo(0,12.4,-9.2,10);c.closePath()},'#5a4c38',0.6);
  hp(()=>c.rect(-8,2.5,16,2.2),'#c9a24a',0.7);hp(()=>{c.moveTo(-1,4.7);c.lineTo(-2,10);c.lineTo(0,10);c.lineTo(1,4.7)},'#c9a24a',0.6);
  // капюшон сзади
  hp(()=>{c.moveTo(-8,-6);c.quadraticCurveTo(-11,-14,-6,-19);c.lineTo(-3,-9);c.closePath()},'#5a4c38',0.9);
  // руки: одна на посохе
  hp(()=>c.ellipse(-8,0,2.6,4.2,0.2,0,7),'#7a6a52',0.9);hp(()=>c.ellipse(8,-1,2.6,4.2,-0.4,0,7),'#7a6a52',0.9);hp(()=>c.arc(11.4,-2,2.3,0,7),'#e8c09a',0.9);
  // голова
  hp(()=>c.arc(0,-12,7.2,0,7),'#e8c09a');
  hp(()=>{c.moveTo(-6.6,-14);c.quadraticCurveTo(-7.4,-6,-4,-6);c.lineTo(-6,-15)},'#ece6df',0.8);
  hp(()=>{c.arc(-0.5,-14.5,6.8,Math.PI*1.05,Math.PI*1.95);c.quadraticCurveTo(0,-18,-6.4,-15)},'#ece6df',0.8);
  // брови, глаза, нос
  c.strokeStyle='#ece6df';c.lineWidth=1.6;c.beginPath();c.moveTo(1.2,-14.6);c.lineTo(3.6,-15.4);c.moveTo(4.6,-15.2);c.lineTo(6.8,-14.4);c.stroke();
  for(const ex of [2.4,5.6]){c.fillStyle=O;c.beginPath();c.ellipse(ex,-12.6,0.9,1.1,0,0,7);c.fill()}
  hp(()=>c.ellipse(7,-10.5,1.6,1.2,0,0,7),'#d8a888',0.6);
  // длинная борода до пояса
  hp(()=>{c.moveTo(-1.5,-10);c.quadraticCurveTo(3,-8.5,7.6,-10);c.quadraticCurveTo(8,-1,4,6);c.quadraticCurveTo(2,8,1,5);c.quadraticCurveTo(-1,-2,-1.5,-10)},'#f2eee8',0.9);
  c.strokeStyle='#d8d2c8';c.lineWidth=0.6;for(const bx of [2,4,6]){c.beginPath();c.moveTo(bx,-7);c.quadraticCurveTo(bx-0.5,-1,bx-1.5,4);c.stroke()}
  hp(()=>{c.moveTo(1.5,-9.6);c.quadraticCurveTo(4.5,-11,7,-9.6);c.quadraticCurveTo(4.5,-8.6,1.5,-9.6)},'#f2eee8',0.6);
  // знак над головой
  if(mark){const by=-30+Math.sin(t*3)*1.5,col=mark==='!'?'#f4c766':'#9fe0a8';glow(0,by,12,mark==='!'?'244,199,102':'159,224,168',0.55);
    c.font='900 15px sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle=O;c.strokeText(mark,0,by+5);c.fillStyle=col;c.fillText(mark,0,by+5)}
  c.restore()}
return (cc,x,y,s,mark,night,t)=>{c=cc;elder(x,y,s,mark,night,t||0)}})();
/* ================= ОБУЧЕНИЕ: СТАРЕЦ ЕРМОЛАЙ ================= */
// Цепочка заданий один раз на всю игру (S.meta.tutDone). Условия — по состоянию, поэтому уже сделанное засчитывается само.
const ELDER={get x(){return CX+45},get y(){return CY+48},S:1.3};
const tutNear=(arr,f)=>{let b=null,bd=1e18;for(const o of arr){if(!f(o))continue;const d=(o.x-P.x)**2+(o.y-P.y)**2;if(d<bd){bd=d;b=o}}return b};
const tutAt=(o,n)=>o?{x:o.x,y:o.y,n}:null;
const tutCamp=()=>({x:CX,y:CY+20,n:'лагерь',camp:true});
const Z1=()=>CFG.zones[0];
const TUT=[
 {say:'Здравствуй, путник. Я Ермолай, живу тут дольше, чем стоят эти деревья. Лагерю нужно дерево — сруби пять стволов и отнеси брёвна на склад.',task:'Срубить 5 деревьев',n:5,p:()=>S.stats.chopped,
  tgt:()=>tutAt(tutNear(trees,t=>t.alive&&S.up.axe>=CFG.trees[t.tier].axe),'дерево'),rw:{w:30,xp:10}},
 {say:'Тупым топором много не нарубишь. Загляни в меню построек и улучши топор.',task:'Улучшить топор до 2-го уровня',n:2,p:()=>S.up.axe,tgt:tutCamp,rw:{w:40,xp:12}},
 {say:'Без камня не построишь ни забора, ни башни. Разбей три валуна и принеси камень на склад.',task:'Разбить 3 валуна',n:3,p:()=>S.stats.mined,
  tgt:()=>tutAt(tutNear(rocks,r=>r.alive),'валун'),rw:{w:20,s:15,xp:14}},
 {say:'Ратуша у нас пока одно название. Расширь лагерь — откроются новые постройки.',task:'Улучшить ратушу до 2-го уровня',n:2,p:()=>S.base,tgt:tutCamp,rw:{w:60,s:20,xp:16}},
 {say:'Ночью из леса приходят мертвецы. Поставь вокруг лагеря забор, пока не стемнело.',task:'Построить забор',n:1,p:()=>S.fence.lvl,tgt:tutCamp,rw:{w:50,xp:18}},
 {say:'Первая ночь самая страшная. Держись поближе к лагерю и дождись рассвета.',task:'Пережить ночь',n:1,p:()=>Math.max(S.stats.nights||0,S.day>=2?1:0),tgt:()=>null,rw:{w:40,p:1,xp:20}},
 {say:'Говорят, в Берёзовой роще стоит брошенная хижина. Отыщи её — в тайнике могло что-то уцелеть. Стрелка у края экрана подскажет дорогу.',task:'Найти заброшенную хижину и открыть тайник',n:1,p:()=>Object.keys(S.poi).length,
  tgt:()=>{const q=tutNear(pois,q=>!S.poi[q.id]);return tutAt(q,q&&q.kind==='hut'?'хижина':'руины')},rw:{w:80,s:20,xp:22}},
 {say:'Пустой дом — хорошее место для хутора. Восстанови его, и он будет сам добывать дерево или камень.',task:'Восстановить хутор',n:1,p:()=>Object.keys(S.farms).length,
  tgt:()=>tutAt(tutNear(pois,q=>S.poi[q.id]&&!farmOf(q)),'хутор'),rw:{w:80,s:30,xp:24}},
 {say:'Забор мертвецов задержит, но не остановит. Построй башню — лучники будут стрелять, пока ты спишь.',task:'Построить башню',n:1,p:()=>S.towers.some(l=>l>0)?1:0,tgt:tutCamp,rw:{w:60,s:30,xp:26}},
 {say:'Одним топором от всех не отобьёшься. Попроси в лагере сделать тебе второе оружие.',task:()=>`Изготовить второе оружие: ${secName().toLowerCase()}`,n:1,p:()=>S.bow,tgt:tutCamp,rw:{w:100,xp:28}},
 {say:'Мертвецы лезут из могильников. Разрушь хотя бы один — внутри часто лежит ключ от склепа.',task:'Разрушить могильник',n:1,p:()=>Math.max(S.stats.moundsDone||0,Object.keys(S.mounds).length),
  tgt:()=>tutAt(tutNear(mounds,m=>!m.dead&&!S.mounds[m.id]),'могильник'),rw:{w:80,p:1,xp:30}},
 {say:()=>`В роще хозяйничает ${CFG.bosses[1].name}. Пока он жив, покоя не будет. Подготовься и одолей его на арене.`,task:()=>`Победить: ${CFG.bosses[1].name}`,n:1,p:()=>S.bosses[1]?1:0,
  tgt:()=>tutAt(lairs.find(l=>l.zone===1),'логово'),rw:{w:150,s:50,p:1,xp:40}},
 {say:'С боссов, из сундуков и склепов выпадают вещи. Открой снаряжение и надень что-нибудь.',task:'Надеть любую вещь',n:1,p:()=>Object.values(S.eq).some(Boolean)?1:0,tgt:()=>null,rw:{k:1,xp:30}},
 {say:'Вот тебе ключ. Под землёй, в склепе, лежат лучшие сокровища — и стерегут их лучшие мертвецы.',task:'Пройти склеп',n:1,p:()=>S.cryptRuns||0,tgt:()=>tutAt(tutNear(crypts,()=>true),'склеп'),rw:{w:150,s:60,xp:45}},
 {say:'Последнее. Очисти Берёзовую рощу целиком: перебей нечисть и разрушь все могильники. Тогда я спокойно тебя отпущу.',task:()=>`Очистить зону «${Z1().name}»`,n:1,p:()=>zoneCleared(Z1())?1:0,
  tgt:()=>{const m=tutNear(mounds,m=>m.zone===1&&!m.dead&&!S.mounds[m.id]);if(m)return tutAt(m,'могильник');if(!S.bosses[1])return tutAt(lairs.find(l=>l.zone===1),'логово');const z=tutNear(zombies,z=>z.zone===1&&!z.wave&&!z.boss);return tutAt(z,'нечисть')},rw:{w:250,s:80,p:2,k:1,xp:60}},
];
const tutF=v=>typeof v==='function'?v():v;
const tutOn=()=>!S.meta.tutDone&&S.tut.step<TUT.length;
const tutOk=st=>Math.min(st.n,st.p()|0)>=st.n;
function tutRwTxt(r){const a=[];if(r.w)a.push(`${r.w} древесины`);if(r.s)a.push(`${r.s} камня`);if(r.p)a.push(r.p===1?'зелье лечения':`${r.p} зелья лечения`);if(r.k)a.push(r.k===1?'ключ от склепа':`${r.k} ключа от склепа`);if(r.xp)a.push(`${r.xp} опыта`);return a.join(', ')}
function tutGive(r){S.wood+=r.w||0;S.stone+=r.s||0;if(r.p)S.potions=Math.min(potMax(),S.potions+r.p);S.keys+=r.k||0}
const tutWord=(n,a,b,c)=>{const m=n%100,d=n%10;return m>10&&m<20?c:d===1?a:d>=2&&d<=4?b:c};
// главная цель: что показывает стрелка
function tutTarget(){
  if(!tutOn()||DG)return null;const st=TUT[S.tut.step],ok=tutOk(st);
  const toElder={x:ELDER.x,y:ELDER.y,n:'старец Ермолай',elder:true};
  if(!S.tut.taken||ok)return dist(P.x,P.y,ELDER.x,ELDER.y)>230?toElder:null;
  const t=st.tgt();if(!t)return null;
  if(t.camp)return dist(P.x,P.y,CX,CY)>260?t:null;
  return t;
}
function tutMark(){if(!tutOn())return null;const st=TUT[S.tut.step];return tutOk(st)?'?':!S.tut.taken?'!':null}
function drawElder(now){
  const x=ELDER.x,y=ELDER.y,s=ELDER.S,night=darkness()>0.35;
  ELDERFIG(ctx,x,y-13*s,s,tutMark(),night,now/1000);
  if(dist(P.x,P.y,x,y)<170)labels.push(()=>{ctx.textAlign='center';ctx.font='700 12px Rubik, sans-serif';const ty=y-(tutMark()?72:54)*s/1.3;ctx.fillStyle='#000';ctx.fillText('Старец Ермолай',x+1,ty+1);ctx.fillStyle='#f4c766';ctx.fillText('Старец Ермолай',x,ty)});
}
// стрелка у края экрана или ромб над целью
function drawTutArrow(camX,camY,now){
  const t=tutTarget();if(!t)return;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  const sx=(t.x-camX)*zoom,sy=(t.y-camY)*zoom,blink=0.6+0.4*Math.sin(now/180);
  const x0=46,x1=VW-46,y0=76,y1=VH-(VW<700?150:110); // не заходить под кнопки
  if(sx>x0&&sx<x1&&sy>y0&&sy<y1){
    const by=sy-(t.elder?70:44)*zoom+Math.sin(now/250)*4;ctx.save();ctx.translate(sx,by);ctx.globalAlpha=blink;
    const g=ctx.createRadialGradient(0,0,1,0,0,18);g.addColorStop(0,'rgba(244,199,102,.6)');g.addColorStop(1,'rgba(244,199,102,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,18,0,7);ctx.fill();
    ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(7,0);ctx.lineTo(0,9);ctx.lineTo(-7,0);ctx.closePath();ctx.fillStyle='#f4c766';ctx.fill();ctx.strokeStyle='#24180f';ctx.lineWidth=1.6;ctx.stroke();ctx.restore();return}
  const cx=(x0+x1)/2,cy=(y0+y1)/2,a=Math.atan2(sy-cy,sx-cx),ca=Math.cos(a),sa=Math.sin(a);
  const k=Math.min(Math.abs(ca)>1e-6?((ca>0?x1:x0)-cx)/ca:1e9,Math.abs(sa)>1e-6?((sa>0?y1:y0)-cy)/sa:1e9);
  const ax=cx+ca*k,ay=cy+sa*k;
  ctx.save();ctx.translate(ax,ay);ctx.rotate(a);const g=ctx.createRadialGradient(0,0,1,0,0,26);g.addColorStop(0,`rgba(244,199,102,${0.5*blink})`);g.addColorStop(1,'rgba(244,199,102,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,26,0,7);ctx.fill();
  ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-8,-11);ctx.lineTo(-3,0);ctx.lineTo(-8,11);ctx.closePath();ctx.fillStyle='#f4c766';ctx.fill();ctx.strokeStyle='#24180f';ctx.lineWidth=1.6;ctx.stroke();ctx.restore();
  const n=Math.round(dist(P.x,P.y,t.x,t.y)/10),txt=`${t.n} · ${n} ${tutWord(n,'шаг','шага','шагов')}`;
  ctx.font='700 12px Rubik, sans-serif';const tw=ctx.measureText(txt).width;let lx=ax-Math.cos(a)*34,ly=ay-Math.sin(a)*30+4;lx=Math.max(tw/2+6,Math.min(VW-tw/2-6,lx));
  ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillText(txt,lx+1,ly+1);ctx.fillStyle='#f4c766';ctx.fillText(txt,lx,ly);
}
// строка обучения вместо обычных заданий
function tutQuestHtml(){
  const st=TUT[S.tut.step],ok=tutOk(st),p=Math.min(st.n,st.p()|0);
  let body,bar='';
  if(ok)body=`<span>${tutF(st.task)}</span><b>✓</b><small class="tut-go">Выполнено — вернитесь к старцу Ермолаю</small>`;
  else if(!S.tut.taken)body=`<span>Поговорите со старцем Ермолаем в лагере</span><small>Он стоит у ратуши, над головой «!»</small>`;
  else{body=`<span>${tutF(st.task)}</span>${st.n>1?`<b>${p}/${st.n}</b>`:''}<small>${tutRwTxt(st.rw)}</small>`;if(st.n>1)bar=`<i style="width:${100*p/st.n}%"></i>`}
  return `<li class="tut-q"><em>Обучение · ${S.tut.step+1} / ${TUT.length}</em>${body}${bar}</li>`;
}
// окно разговора
function tutPortrait(mark){const cv=$('tutPic'),c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.fillStyle='#55753c';c.fillRect(0,0,cv.width,cv.height);c.fillStyle='rgba(0,0,0,.08)';for(let i=0;i<30;i++)c.fillRect((i*977)%cv.width,(i*593)%cv.height,2,2);ELDERFIG(c,58,104,3.0,null,false,0)}
function tutBtn(txt,fn,main){const b=document.createElement('button');b.type='button';b.className='tut-b'+(main?' main':'');b.textContent=txt;b.onclick=fn;$('tutBtns').appendChild(b);return b}
function closeTut(){$('tut').hidden=true;keys.clear();actHeld=false;renderQuests()}
function openTut(){keys.clear();actHeld=false;renderTut();$('tut').hidden=false;sfx.pickup&&sfx.pickup()}
const tutOpen=()=>!$('tut').hidden;
// сдать текущий шаг и все следующие уже выполненные; возвращает, сколько шагов сдано
function tutClaim(){
  if(!tutOn())return 0;let i=S.tut.step;const R={w:0,s:0,p:0,k:0,xp:0};
  while(i<TUT.length&&tutOk(TUT[i])){for(const k in TUT[i].rw)R[k]+=TUT[i].rw[k];i++}
  const n=i-S.tut.step;if(!n)return 0;
  tutGive(R);S.tut.step=i;S.tut.taken=false;sfx.chest();toast(`Старец Ермолай: +${tutRwTxt(R)}`,'good');
  if(i>=TUT.length){S.meta.tutDone=1;fillQuests();toast('Обучение пройдено! Теперь справа появляются обычные задания','good')}
  save();renderQuests();gainXp(R.xp);return n;
}
function renderTut(){
  $('tutBtns').innerHTML='';
  if(!tutOn()){tutPortrait(null);$('tutStep').textContent='Обучение пройдено';$('tutSay').textContent='«Ты всему научился, дальше справишься сам. Загляни в задания справа — там всегда найдётся работа.»';$('tutTask').textContent='';$('tutRw').textContent='';tutBtn('Закрыть',closeTut,true);return}
  const st=TUT[S.tut.step],ok=tutOk(st);
  $('tutStep').textContent=`Шаг ${S.tut.step+1} из ${TUT.length}`;
  if(ok){ // сдать — и все следующие уже сделанные шаги разом
    let i=S.tut.step;const done=[];while(i<TUT.length&&tutOk(TUT[i])){done.push(TUT[i]);i++}
    const R={w:0,s:0,p:0,k:0,xp:0};for(const d of done)for(const k in d.rw)R[k]+=d.rw[k];
    tutPortrait('?');
    $('tutSay').textContent=done.length>1?`«Вижу, ты и без меня многое успел. Засчитываю сразу ${done.length} ${tutWord(done.length,'задание','задания','заданий')}.»`:'«Молодец, справился. Держи заслуженное.»';
    $('tutTask').innerHTML=done.map(d=>'✓ '+tutF(d.task)).join('<br>');$('tutRw').textContent='Награда: '+tutRwTxt(R);
    tutBtn('Забрать награду',()=>{tutClaim();renderTut()},true);
    return}
  tutPortrait(S.tut.taken?null:'!');
  $('tutSay').textContent='«'+tutF(st.say)+'»';
  $('tutTask').textContent='Задание: '+tutF(st.task)+(S.tut.taken&&st.n>1?` (${Math.min(st.n,st.p()|0)}/${st.n})`:'');
  $('tutRw').textContent='Награда: '+tutRwTxt(st.rw);
  if(!S.tut.taken){tutBtn('Взять задание',()=>{S.tut.taken=true;save();closeTut();toast('Новое задание: '+tutF(st.task),'good')},true);tutBtn('Позже',closeTut)}
  else tutBtn('Понятно',closeTut,true);
}
$('tut').addEventListener('click',e=>{if(e.target.id==='tut')closeTut()});
addEventListener('keydown',e=>{if(e.code==='Escape'&&tutOpen())closeTut()});
