// Постройки: лагерь на всех уровнях главного дома, руины, хутора и мир рисуются без ошибок; новые названия уровней
require('./harness.js');boot();frames(2);const g=G_;let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}else console.log('ok',m)};
const S=g.S;let err=null;
try{for(let b=1;b<=6;b++){S.base=b;S.hq=9999;S.houses=b>=4?13:0;S.forge=b>=4;S.fence.lvl=Math.max(0,(b-1)*2);S.fence.hp=b*100;S.towers=[b,b,b,b,b,b].map(x=>Math.min(6,x));S.def.ball=[b>=4?2:0,0];S.def.bowl=[b>=5?1:0,0,0,0];S.def.shop=b>=4?1:0;S.jobs.guard=b>=4?3:0;g.P.x=g.CX;g.P.y=g.CX+60;frames(3);S.clock=160;frames(2);S.clock=20}
  S.hq=0;frames(3);S.hq=9999;
  const q=g.pois()[0];S.farms[q.id]={lvl:3,store:10,storeS:5,hp:100,road:true,broken:false,pal:3,tower:2,mode:'wood'};g.P.x=q.x;g.P.y=q.y+60;frames(3);S.farms[q.id].broken=true;frames(2);
  const cr=g.crypts()[0];if(cr){g.P.x=cr.x;g.P.y=cr.y+60;frames(2)}}catch(e){err=e}
ok(!err,'всё рисуется'+(err?': '+err.stack.split('\n').slice(0,2).join(' '):''));
const st=g.migrate({v:12,seed:4242,base:6,meta:{ng:0,relics:{},wins:0,relicPend:0}});ok(st.base===6,'уровень главного дома сохраняется');
S.base=5;g.tab='camp';const rows=g.rowsFor?g.rowsFor('camp'):[];ok(JSON.stringify(rows).includes('Крепость'),'уровень 5 называется «Крепость»');
console.log(bad?'FAILED '+bad:'buildings ok');
