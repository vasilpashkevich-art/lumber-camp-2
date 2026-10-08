// Молот Громовержца летит в тех, кто гонится за героем (до 4, в разные стороны); мертвецы гонятся дальше (450)
require('./harness.js');boot();frames(2);const g=G_;let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok',m)};
const S=g.S;S.meta.relics.hammer=1;S.p.hp=1e6;g.zombies().length=0;g.P.x=g.CX+700;g.P.y=g.CX;g.P.face=0;
const mk=(dx,dy,ch=true)=>{const z=g.makeZombie(3,g.P.x+dx,g.P.y+dy,false,null);z.hp=z.max=1e4;z.speed=0;z.dmg=0;z.chasing=ch;z.canChase=true;z.hx=z.x;z.hy=z.y;g.zombies().push(z);return z};
const A=[mk(-150,0),mk(0,150),mk(0,-150),mk(120,120)],far=mk(-600,0),calm=mk(60,0,false);
const tg=g.hammerTargets();ok(tg.length===4&&A.every(z=>tg.includes(z)),'цели: 4 гонящихся, а не стоящий рядом');
g.useRelic('hammer');for(let i=0;i<120;i++){A.forEach(z=>{z.chasing=true});frames(1)}
ok(A.every(z=>z.hp<1e4),'молот попал во всех четырёх, хотя герой смотрел в другую сторону');ok(far.hp===1e4,'дальний враг не задет');
ok(g.RX.hammers.length===0,'молот вернулся в руку');
// без гонящихся — в ближайшего рядом
g.zombies().length=0;const n=mk(-100,0,false);ok(g.hammerTargets()[0]===n,'если никто не гонится — в ближайшего');
// погоня: обычный мертвец гонится дальше, чем раньше
{S.perkPend=0;els.perks.hidden=true;els.dawn.hidden=true;g.zombies().length=0;const q=g.pois()[0];const z=g.makeZombie(2,q.x+40,q.y,false,2);z.hx=z.x;z.hy=z.y;g.zombies().push(z);const hz=g.zoneAt(z.hx,z.hy);let dir=[1,0];for(let k=0;k<16;k++){const a=k*Math.PI/8,c=[Math.cos(a),Math.sin(a)];if(Math.hypot(z.hx+c[0]*400-g.CX,z.hy+c[1]*400-g.CX)>g.CFG.fenceR+80&&g.zoneAt(z.hx+c[0]*400,z.hy+c[1]*400)===hz&&g.zoneAt(z.hx+c[0]*520,z.hy+c[1]*520)===hz){dir=c;break}}g.P.x=z.hx+dir[0]*400;g.P.y=z.hy+dir[1]*400;frames(2);ok(z.canChase!==false,'гонится в 400 от своего места');g.P.x=z.hx+dir[0]*520;g.P.y=z.hy+dir[1]*520;frames(2);ok(z.canChase===false,'в 520 — бросает погоню')}
console.log(bad?'FAILED '+bad:'hammer ok');
