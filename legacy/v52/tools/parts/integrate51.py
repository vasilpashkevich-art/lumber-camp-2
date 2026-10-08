s=open('snapshots/lumber-camp-v50.html').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)
P=lambda n:open('tools/parts/'+n).read()

# ===== 1. модуль музыки и звуков, подключение к звуку игры
rep("const Snd={ctx:null,master:null,noise:null,fireGain:null,on:true};",P('audio51.js')+"\n"
    "// звук умения: только если звук включён и готов\nconst afx=n=>{if(AUD.ready&&sndReady())AUD.fx[n]()};\n"
    "// громкость: музыка, шум лагеря, звуки — запоминается в этом браузере\nconst VOL={m:0.5,a:0.6,f:0.9};try{Object.assign(VOL,JSON.parse(localStorage.getItem('lumber-camp-vol')||'{}'))}catch(e){}\n"
    "function applyVol(){if(!AUD.ready)return;AUD.music.setVol(VOL.m);AUD.setAmb(VOL.a);AUD.setFx(VOL.f)}\n"
    "function setVol(k,v){VOL[k]=v;try{localStorage.setItem('lumber-camp-vol',JSON.stringify(VOL))}catch(e){}applyVol()}\n"
    "const Snd={ctx:null,master:null,noise:null,fireGain:null,on:true};")
rep("  Snd.fireGain=c.createGain();Snd.fireGain.gain.value=0;","  Snd.fireGain=c.createGain();Snd.fireGain.gain.value=0;// старый треск костра больше не звучит: костёр и поселение — в AUD.camp")
rep("  src.connect(bp);bp.connect(lp);lp.connect(Snd.fireGain);Snd.fireGain.connect(Snd.master);src.start();\n}",
    "  src.connect(bp);bp.connect(lp);lp.connect(Snd.fireGain);Snd.fireGain.connect(Snd.master);src.start();\n  AUD.init(c,Snd.master);applyVol();\n}")
# старые звуки идут через общую громкость «Звуки»
rep("g.connect(Snd.master);","g.connect(AUD.ready?AUD.nodes().fxo:Snd.master);",3)
# музыка вне лагеря, шум поселения в лагере
rep("  const d=dist(P.x,P.y,CX,CY),v=Math.max(0,Math.min(1,1-(d-60)/420))*(0.5+S.base*0.08);\n  if(Snd.fireGain)Snd.fireGain.gain.setTargetAtTime(Snd.on?v*0.12:0,Snd.ctx.currentTime,0.3);\n  if(v>0&&Math.random()<v*dt*14)sfx.crackle(v);\n",
    "  {const d=dist(P.x,P.y,CX,CY),ph=phase();if(!DG&&d<CFG.fenceR+40)audioInCamp=true;else if(DG||d>CFG.fenceR+160)audioInCamp=false;\n"
    "   if(audioInCamp){AUD.camp.set(S.hq>0?S.base:1,!ph.night);AUD.music.play(null)}\n"
    "   else{AUD.camp.set(-1);AUD.music.play(DG?'crypt':ph.night?(S.night.blood&&S.night.active?'blood':'night'):'day')}}\n")
rep("let stepT=0,groanT=2;","let stepT=0,groanT=2,audioInCamp=true;")
rep("sfx.levelup=()=>{","sfx.levelup=()=>{if(AUD.ready&&sndReady()){AUD.fx.levelUp();return}")

# ===== 2. звуки умений и ударов
rep("RX.hammers.push({x:P.x,y:P.y,vx:Math.cos(a)*560,vy:Math.sin(a)*560,t:0.7,life:HAMMER.life,tg,back:false,hit:new Set(),rot:0,d:relDmg(r>1?3:2)});sfx.dash()}",
    "RX.hammers.push({x:P.x,y:P.y,vx:Math.cos(a)*560,vy:Math.sin(a)*560,t:0.7,life:HAMMER.life,tg,back:false,hit:new Set(),rot:0,d:relDmg(r>1?3:2)});afx('mjolnir')}")
rep("if(c==='warrior'){RX.whirl=1.2;RX.whirlT=0;sfx.dash()}","if(c==='warrior'){RX.whirl=1.2;RX.whirlT=0;afx('whirl')}")
rep("RX.fb.push({x:P.x,y:P.y,vx:Math.cos(aa)*430,vy:Math.sin(aa)*430,t:1.1,d:abilBase()*2.5,a:aa})}sfx.shoot()}","RX.fb.push({x:P.x,y:P.y,vx:Math.cos(aa)*430,vy:Math.sin(aa)*430,t:1.1,d:abilBase()*2.5,a:aa})}afx('fireVolley')}")
rep("if(c==='archer'){RX.volley=10;","if(c==='archer'){RX.volley=10;afx('arrowVolley');")
rep("gold:true});sfx.dash()}","gold:true});afx('hammerStorm')}")
rep("SX.rain={x:p.x,y:p.y,t:1.2,tick:0,d:abilBase()*0.6};sfx.shoot()}","SX.rain={x:p.x,y:p.y,t:1.2,tick:0,d:abilBase()*0.6};afx('arrowRain')}")
rep("SX.met.push({tx:p.x,ty:p.y,t:0.6,m:0.6,d:abilBase()*6});","SX.met.push({tx:p.x,ty:p.y,t:0.6,m:0.6,d:abilBase()*6});afx('fireBoulder');")
rep("P.cd=bowCd(S.bow)/(1+gear('spd')/100);P.shot=0.2;sfx.shoot();","P.cd=bowCd(S.bow)/(1+gear('spd')/100);P.shot=0.2;if(AUD.ready&&sndReady())afx(c==='mage'?'staff':'bow');else sfx.shoot();")
rep("P.cd=bowCd(S.bow)*1.35/(1+gear('spd')/100)/(1+0.1*pr('aim'));P.swing=0.3;sfx.hit();","P.cd=bowCd(S.bow)*1.35/(1+gear('spd')/100)/(1+0.1*pr('aim'));P.swing=0.3;if(AUD.ready&&sndReady())afx('hammer');else sfx.hit();")
rep("P.cd=axeCd(S.up.axe)/(1+gear('spd')/100);P.swing=0.18;sfx.hit();","P.cd=axeCd(S.up.axe)/(1+gear('spd')/100);P.swing=0.18;if(AUD.ready&&sndReady())afx('axe');else sfx.hit();")

# ===== 3. вкладка «Звук и музыка» в окне ⚙
rep("const TABS=[","const TABS=[['sound','Звук и музыка'],")
rep("cfg:{title:'Настройки',tabs:['save']}","cfg:{title:'Настройки',tabs:['sound','save']}")
rep("const lastTab={hero:'hero',camp:'camp',cfg:'save'};","const lastTab={hero:'hero',camp:'camp',cfg:'sound'};")
rep("$('cfgBtn').onclick=()=>openMenu('cfg','save');","$('cfgBtn').onclick=()=>openMenu('cfg');")
rep("if(t==='save'){R.push({title:'Звук',desc:Snd.on?'Включён · клавиша M':'Выключен · клавиша M',mode:true,act:'sound'});R.push({save:true});","if(t==='sound'){R.push({title:'Звук',desc:Snd.on?'Включён · клавиша M':'Выключен · клавиша M',mode:true,act:'sound'});R.push({raw:soundPanel()})}\n  if(t==='save'){R.push({save:true});")
rep("let resetArm=false;","""let resetArm=false;
// панель громкости и прослушки
function soundPanel(){const sl=(k,n,mx)=>`<label class="vol"><span>${n}</span><input type="range" min="0" max="${mx}" step="0.05" value="${VOL[k]}" data-vol="${k}" aria-label="${n}"></label>`;
  const b=(code,n,d)=>`<button class="snd" type="button" data-snd="${code}"><b>${n}</b>${d?`<small>${d}</small>`:''}</button>`,cl=cls();
  const own={warrior:[['f:axe','Удар топором'],['f:hammer','Удар молотом'],['f:whirl','Вихрь (C)'],['f:hammerStorm','Буря молотов (V)']],mage:[['f:axe','Удар топором'],['f:staff','Выстрел посохом'],['f:fireVolley','Огненный залп (C)'],['f:fireBoulder','Огненная глыба']],archer:[['f:axe','Удар топором'],['f:bow','Выстрел из лука'],['f:arrowVolley','Град стрел (C)'],['f:arrowRain','Дождь стрел (V)']]}[cl||'warrior'];
  return `<div class="sndp"><div class="vols">${sl('m','Музыка',1)}${sl('a','Шум лагеря',1)}${sl('f','Звуки',1.2)}</div>
  <h4>Музыка <small>играет вне лагеря; в лагере — шум поселения</small></h4><div class="sgrid">${b('m:day','Лес днём','арфа, флейта')}${b('m:night','Ночь','струнные, сердце')}${b('m:blood','Кровавая луна','барабаны')}${b('m:crypt','Склеп','хор, колокол')}${b('m:stop','Стоп','')}</div>
  <h4>Шум лагеря <small>по уровню ратуши</small></h4><div class="sgrid">${[1,2,3,4,5,6].map(l=>b('c:'+l,l+' · '+HQ_SKINS[l],'')).join('')}${b('c:stop','Стоп','')}</div>
  <div class="sgrid">${[['e:birds','Птицы'],['e:hens','Куры'],['e:rooster','Петух'],['e:chop','Рубят дрова'],['e:anvil','Кузница'],['e:voices','Голоса'],['e:bell','Колокол'],['e:cart','Телега']].map(([k,n])=>b(k,n,'')).join('')}</div>
  <h4>Умения <small>${cl?CLASSES[cl].br:'Варвар'}</small></h4><div class="sgrid">${own.map(([k,n])=>b(k,n,'')).join('')}${b('f:mjolnir','Молот Громовержца','реликвия')}${b('f:levelUp','Новый уровень','')}</div>
  <p class="note">Прослушка звучит, пока открыто это окно. После закрытия снова играет то, что подходит к месту и времени суток.</p></div>`}
function soundTry(code){sndInit();if(!AUD.ready||!sndReady()){toast('Включите звук: строка «Звук» выше или клавиша M','', 'sndoff');return}const [k,v]=code.split(':');
  if(k==='m')AUD.music.play(v==='stop'?null:v);else if(k==='c')AUD.camp.set(v==='stop'?-1:+v,true);else if(k==='e')AUD.ev[v]();else if(k==='f')AUD.fx[v]()}""")
rep("list.addEventListener('click',e=>{const b=e.target.closest('[data-act]');","list.addEventListener('click',e=>{const sb=e.target.closest('[data-snd]');if(sb){soundTry(sb.dataset.snd);return}});\nlist.addEventListener('input',e=>{const r=e.target.closest('[data-vol]');if(r)setVol(r.dataset.vol,+r.value)});\nlist.addEventListener('click',e=>{const b=e.target.closest('[data-act]');")
rep("</style>",".sndp{display:grid;gap:10px}.sndp h4{margin:6px 0 0;font-size:14px;color:var(--ink)}.sndp h4 small{color:var(--muted);font-weight:400;font-size:11px;margin-left:6px}\n.vols{display:flex;flex-wrap:wrap;gap:16px}.vol{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)}.vol input{accent-color:var(--ember);width:150px}\n.sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px}\n.snd{all:unset;cursor:pointer;display:grid;gap:2px;background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:8px 10px}.snd b{font-size:13px}.snd small{font-size:11px;color:var(--muted)}.snd:hover,.snd:focus-visible{border-color:var(--ember);outline:none}\n</style>")
rep("window.__G={get S(){return S},","window.__G={get S(){return S},AUD,soundTry,")
rep("if(!fq&&!inCamp()&&tab!=='save'&&","if(!fq&&!inCamp()&&tab!=='save'&&tab!=='sound'&&")
open('src/lumber-camp.html','w').write(s)
print('ok')
