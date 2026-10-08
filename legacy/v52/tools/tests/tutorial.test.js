// Обучение у старца Ермолая: цепочка из 15 шагов, уже сделанное засчитывается само, обычные задания скрыты до конца цепочки, один раз на всю игру
require('./harness.js');boot();frames(2);const g=G_;let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok',m)};
let S=g.S;
ok(g.TUT.length===15,'15 шагов');
ok(g.tutOn()&&S.tut.step===0&&!S.meta.tutDone,'новая игра: обучение идёт');
ok(S.quests.length===0,'обычных заданий нет, пока идёт обучение');
// старец: разговор по кнопке действия
g.P.x=g.CX+45;g.P.y=g.CX+50;let t=g.specialTarget();ok(t&&t.lbl==='Говорить','у старца кнопка «Говорить»');
t.fn();ok(!els.tut.hidden,'окно разговора открылось');const c0=S.clock;frames(10);ok(S.clock===c0,'пока идёт разговор, игра стоит');g.closeTut();frames(2);ok(S.clock!==c0,'после закрытия время пошло');
// не выполнено — сдать нельзя
ok(g.tutClaim()===0,'невыполненный шаг не сдаётся');
// стрелка: до взятия задания и рядом со старцем — нет цели; взял — цель дерево
ok(g.tutTarget()===null,'рядом со старцем стрелки нет');S.tut.taken=true;let tg=g.tutTarget();ok(tg&&tg.n==='дерево','взял задание — стрелка к дереву');
// сделанное заранее засчитывается само, несколько шагов разом
S.stats.chopped=7;S.up.axe=2;S.stats.mined=3;const w0=S.wood,st0=S.stone;
ok(g.tutClaim()===3&&S.tut.step===3&&!S.tut.taken,'засчитано сразу 3 шага');ok(S.wood===w0+90&&S.stone===st0+15,'награды сложены: '+(S.wood-w0)+'/'+(S.stone-st0));
// ушёл далеко — стрелка ведёт к старцу
g.P.x=g.CX+900;g.P.y=g.CX;tg=g.tutTarget();ok(tg&&tg.elder,'вдали от лагеря стрелка к старцу');
// задание на хижину ведёт к непройденной хижине
S.base=2;S.fence.lvl=1;S.day=2;g.P.x=g.CX+45;g.P.y=g.CX+50;ok(g.tutClaim()===3&&S.tut.step===6,'ратуша, забор, ночь');S.tut.taken=true;g.P.x=g.CX;g.P.y=g.CX;tg=g.tutTarget();ok(tg&&/хижина|руины/.test(tg.n),'стрелка к хижине: '+(tg&&tg.n));
// босс рощи
S.tut.step=11;S.tut.taken=true;tg=g.tutTarget();ok(tg&&tg.n==='логово','стрелка к логову босса');
// последний шаг: зона 1 очищена — обучение закончено, появились задания
const z1=g.CFG.zones[0];S.tut.step=14;S.tut.taken=true;S.killed[1]=9999;S.bosses[1]=true;for(const m of g.mounds())if(m.zone===1)S.mounds[m.id]=true;
ok(g.zoneCleared(z1),'роща очищена');const k0=S.keys;ok(g.tutClaim()===1,'последний шаг сдан');
ok(S.meta.tutDone===1&&!g.tutOn(),'обучение пройдено');ok(S.quests.length===3,'появились 3 обычных задания');ok(S.keys===k0+1,'ключ в награду');
// переселение: цепочка не повторяется
g.newGame(true);S=g.S;ok(!g.tutOn()&&S.quests.length===3,'после переселения обучения нет, задания есть');
// старое сохранение без обучения
const old=JSON.parse(JSON.stringify(S));delete old.tut;delete old.meta.tutDone;old.quests=[];store['lumber-camp-v1']=JSON.stringify(old);
const m=g.migrate?g.migrate(old):null;if(m){ok(m.tut.step===0&&m.meta.tutDone===0,'старое сохранение: обучение с начала, сделанное засчитается')}
console.log(bad?'FAILED '+bad:'tutorial ok');
