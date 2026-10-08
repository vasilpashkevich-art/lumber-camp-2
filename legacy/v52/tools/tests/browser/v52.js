// v52: свечение после оживления, «без сознания до рассвета», карточка Варвара при выборе класса
const {chromium}=require('playwright'),path=require('path'),OUT=process.env.SHOTS||'/tmp';
(async()=>{const b=await chromium.launch();let errs=0;const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();p.on('pageerror',e=>{errs++;console.log('ERR',e.message)});
 await p.addInitScript(()=>localStorage.setItem('lumber-camp2-save',JSON.stringify({v:12,worldV:12,cls:'warrior',seed:4242,clock:20,day:5,base:4,hq:1e4,meta:{ng:0,tutDone:1,relics:{},wins:0,relicPend:0,comp31:1,relicFix32:1}})));
 await p.goto('file://'+path.resolve(__dirname,'../../../index.html')+'#dev');await p.waitForTimeout(1200);
 const hide=()=>p.evaluate(()=>{for(const id of ['dawn','perks'])document.getElementById(id).hidden=true});
 await p.evaluate(()=>{__G.P.rez=4;__G.P.x=__G.CX;__G.P.y=__G.CY+40});await hide();await p.waitForTimeout(300);await p.screenshot({path:path.join(OUT,'v52_rez.png'),clip:{x:540,y:300,width:200,height:200}});
 await p.evaluate(()=>{__G.P.rez=0;__G.P.ko=true});await hide();await p.waitForTimeout(400);await p.screenshot({path:path.join(OUT,'v52_ko.png')});
 await p.evaluate(()=>{__G.P.ko=false;__G.S.cls=null});await p.waitForTimeout(600);await p.screenshot({path:path.join(OUT,'v52_cls.png')});
 await b.close();console.log(errs?'FAILED '+errs:'v52 ok')})();
