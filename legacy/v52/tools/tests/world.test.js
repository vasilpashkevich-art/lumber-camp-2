// Мир-материк: размеры по переселениям, зоны, биомы, всё на суше, перенос старого сохранения
require('./harness.js');boot();frames(2);const g=G_;
const out=[];let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
for(const ng of [0,1,2]){
  g.S.meta.ng=ng;g.buildWorld();g.applyState();
  const W=g.WG,land=W.area.slice(1).reduce((a,b)=>a+b,0);
  const zonesOk=[1,2,3,4,5,6,7].every(z=>W.area[z]>200000);
  const onLand=a=>a.every(o=>!g.isSea(o.x,o.y));
  ok(zonesOk,'all zones present ng'+ng);ok(onLand(g.trees()),'trees on land');ok(onLand(g.pois()),'pois on land');ok(onLand(g.lairs()),'lairs on land');ok(onLand(g.mounds()),'mounds on land');
  ok(g.isSea(5,5)&&!g.isSea(g.CX,g.CY),'corners sea, camp land');
  ok(g.zombies().every(z=>!g.isSea(z.x,z.y)),'zombies on land');
  out.push(`мир ${ng+1}: суша ${(land/1e6).toFixed(1)} млн, биомы [${W.sides.map(s=>s.id).join(',')}], деревьев ${g.trees().length}, логов ${g.lairs().length}, снег-босс ${g.lairs().some(l=>l.zone===9)}`);
  if(ng===0)globalThis.L0=land;else out.push(`  площадь ×${(land/globalThis.L0).toFixed(2)} от мира 1`);
}
console.log(out.join('\n'));
// перенос: старое сохранение v11 с позицией в старом мире → герой в лагере
const st=g.migrate({v:11,seed:4242,p:{x:2600,y:1900,hp:5},meta:{ng:0,relics:{},wins:0,relicPend:0}});g.S=st;g.buildWorld();g.applyState();
ok(Math.abs(g.P.x-g.CX)<1&&g.S.worldV===12,'migrated player to camp');
// море непроходимо
g.P.x=g.CX;g.P.y=g.CY+40;g.S.p.hp=999;let x=g.CX;while(!g.isSea(x,g.CY+40))x+=20;g.P.x=x-30;g.P.y=g.CY+40;g.keys.add('KeyD');frames(60);g.keys.delete('KeyD');
ok(!g.isSea(g.P.x,g.P.y),'player cannot enter sea');
console.log(bad?'FAILED '+bad:'world ok');
