// Сложность миров: враги, цены, доход и требования к зонам растут с переселением; арена 250; старые очищенные зоны остаются очищенными
require('./harness.js');boot();frames(2);const g=G_;let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok',m)};
const S=g.S,z1={zcount:10};
S.meta.ng=0;ok(g.ngMul()===1&&g.costMul()===1&&g.incMul()===1&&g.zCnt(z1)===10,'мир 1 без изменений');
S.meta.ng=1;ok(g.ngMul()===1.5&&Math.abs(g.costMul()-1.4)<1e-9&&Math.abs(g.incMul()-0.85)<1e-9&&g.zCnt(z1)===15,'мир 2: враги ×1,5, цены ×1,4, доход ×0,85, нечисти ×1,5');
S.meta.ng=2;ok(g.ngMul()===2&&Math.abs(g.costMul()-1.8)<1e-9&&g.zCnt(z1)===20,'мир 3: враги ×2, цены ×1,8, нечисти ×2');
ok(g.disc({w:100,s:10}).w===180,'цена постройки в мире 3: 100 → 180');
const zb=g.makeZombie(3,0,0,false,null);ok(Math.abs(zb.max-24*2)<1e-6,'здоровье мертвеца в мире 3 ×2');
ok(g.ARENA()===250,'арена радиусом 250');
// старое сохранение: зона была очищена при старом требовании
const st=g.migrate({v:12,seed:4242,killed:{1:10,2:5},meta:{ng:1,relics:{},wins:1,relicPend:0}});ok(st.killed[1]===15&&st.killed[2]===5&&st.zFix44===1,'очищенная зона остаётся очищенной, неочищенная — с новым требованием');
const st2=g.migrate(JSON.parse(JSON.stringify(st)));ok(st2.killed[1]===15,'повторная загрузка ничего не меняет');
console.log(bad?'FAILED '+bad:'ng ok');
