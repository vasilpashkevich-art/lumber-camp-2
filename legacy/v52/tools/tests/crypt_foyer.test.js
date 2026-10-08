// Притвор склепа: первый зал без врагов, ключ и закрытие на 3 дня — только у врат во второй зал
require('./harness.js');boot();frames(2);const g=G_;let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok',m)};
const S=g.S;S.p.hp=1e6;S.keys=1;S.day=4;els.perks.hidden=true;
const c=g.crypts()[0];g.P.x=c.x;g.P.y=c.y;let t=g.specialTarget();ok(t&&t.lbl==='Войти'&&/притвор/.test(t.msg),'у склепа: «Войти» в притвор');
g.enterCrypt(c);frames(2);const D=g.DG,R0=D.rooms[0],C0=D.cors[0];
ok(S.keys===1&&!S.crypts[c.id],'вход в притвор: ключ цел, склеп не закрыт');
// пройти весь притвор: врагов нет
for(let k=0;k<12;k++){g.P.x=R0.x+30+k*(R0.w-60)/11;g.P.y=R0.y+R0.h/2;frames(3)}
ok(!g.zombies().some(z=>z.dun!=null),'в притворе нет врагов');
// за врата не пройти
g.P.x=C0.x+C0.w/2;g.P.y=C0.y+C0.h/2;frames(2);ok(g.P.x<=R0.x+R0.w+1,'закрытые врата не пускают дальше: '+Math.round(g.P.x-(R0.x+R0.w)));
// выход из притвора без потерь, можно зайти снова в тот же день
g.P.x=D.entry.x;g.P.y=D.entry.y;t=g.specialTarget();ok(t&&t.lbl==='Выйти'&&/ключ не тратится/.test(t.msg),'выход из притвора: '+(t&&t.msg));t.fn();
ok(!g.DG&&S.keys===1&&!S.crypts[c.id],'вышел: ключ при себе, склеп открыт');
g.P.x=c.x;g.P.y=c.y;t=g.specialTarget();ok(t&&t.ok,'можно войти снова в тот же день');t.fn();frames(2);
// врата: без ключа не открыть
S.keys=0;g.P.x=g.DG.gate.x-30;g.P.y=g.DG.gate.y;t=g.specialTarget();ok(t&&!t.ok&&/нужен ключ/.test(t.msg),'без ключа врата закрыты');
S.keys=1;t=g.specialTarget();ok(t&&t.ok&&t.lbl==='Открыть','с ключом — «Открыть»');t.fn();
ok(S.keys===0&&S.crypts[c.id]===4+3&&g.DG.gateOpen,'врата открыты: ключ потрачен, склеп закрыт до 7-го дня');
// дальше — первый настоящий зал с врагами
const R1=g.DG.rooms[1];for(let k=0;k<20;k++){g.P.x=Math.min(R1.x+120,g.P.x+30);g.P.y=g.DG.gate.y;frames(2)}
ok(R1.spawned&&g.zombies().some(z=>z.dun===1),'во втором зале появились враги');
console.log(bad?'FAILED '+bad:'crypt foyer ok');
