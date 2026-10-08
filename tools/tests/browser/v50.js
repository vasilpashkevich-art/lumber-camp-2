// v50: новая рисовка в игре — лагерь по уровням с площадью и оградой, деревья и земля по зонам, залежи, скорость
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch();let errs=0;
 const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>{errs++;console.log('ERR',e.message)});
 await p.addInitScript(()=>localStorage.setItem('lumber-camp2-save',JSON.stringify({v:12,worldV:12,cls:'warrior',seed:4242,clock:20,day:3,meta:{ng:0,tutDone:1,relics:{},wins:0,relicPend:0,comp31:1,relicFix32:1}})));
 await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1500);
 const hide=()=>p.evaluate(()=>{for(const id of ['dawn','perks'])document.getElementById(id).hidden=true;__G.S.p.hp=1e6;__G.zombies().length=0});
 // лагерь: уровни ратуши и ограды
 for(const [base,fence] of [[1,1],[3,3],[4,4],[5,6],[6,8]]){await p.evaluate(([b,f])=>{const S=__G.S;S.base=b;S.hq=1e4;S.fence.lvl=f;S.fence.hp=1e5;__G.P.x=__G.CX+60;__G.P.y=__G.CY+150},[base,fence]);await hide();await p.waitForTimeout(500);
   await p.screenshot({path:path.join(OUT,`v50_camp${base}.png`)})}
 // зоны: деревья и залежи
 const spots=await p.evaluate(()=>{const R=[];for(const z of [1,2,3,4,5,6,7]){const pt=__G.patches2().find(q=>q.kind==='rocks'&&q.zone===z);if(pt)R.push([z,pt.x,pt.y])}return R});
 for(const [z,x,y] of spots){await p.evaluate(([x,y])=>{__G.P.x=x+90;__G.P.y=y+60},[x,y]);await hide();await p.waitForTimeout(500);await p.screenshot({path:path.join(OUT,`v50_zone${z}.png`)})}
 // боковой край (снег)
 const sn=await p.evaluate(()=>{const t=__G.trees().find(t=>t.skin==='snow');return t&&[t.x,t.y]});if(sn){await p.evaluate(([x,y])=>{__G.P.x=x+40;__G.P.y=y+40},sn);await hide();await p.waitForTimeout(500);await p.screenshot({path:path.join(OUT,'v50_snow.png')})}
 // герой за деревом: крона прозрачная
 const tr=await p.evaluate(()=>{const t=__G.trees().find(t=>t.alive&&t.tier===1);__G.P.x=t.x;__G.P.y=t.y-24;return [t.x,t.y]});await hide();await p.waitForTimeout(400);await p.screenshot({path:path.join(OUT,'v50_behind.png'),clip:{x:560,y:300,width:160,height:180}});
 // скорость: кадры в секунду в лесу и в лагере 6-го уровня
 const fps=async()=>p.evaluate(()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<2000)requestAnimationFrame(f);else r(Math.round(n/2))};requestAnimationFrame(f)}));
 await p.evaluate(()=>{const t=__G.trees().find(t=>t.tier===2);__G.P.x=t.x;__G.P.y=t.y+30});await hide();console.log('кадров в лесу:',await fps());
 await p.evaluate(()=>{__G.P.x=__G.CX;__G.P.y=__G.CY+60});await hide();console.log('кадров в замке:',await fps());
 await b.close();console.log(errs?'FAILED '+errs:'v50 ok')})();
