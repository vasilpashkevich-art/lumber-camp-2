s=open('snapshots/lumber-camp-v46.html').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)
P=lambda n:open('tools/parts/'+n).read()

# ===== 1. сохранение
rep("function newState(){return {v:12,worldV:12,cls:null,rested:0,cryptRuns:0,setPity:0,meta:{ng:0,","function newState(){return {v:12,worldV:12,cls:null,rested:0,cryptRuns:0,setPity:0,tut:{step:0,taken:false},meta:{ng:0,tutDone:0,")
rep("  st.cls=src&&CLASSES[src.cls]?src.cls:null;","  st.cls=src&&CLASSES[src.cls]?src.cls:null;\n  st.tut.step=Math.max(0,st.tut.step|0);st.tut.taken=!!st.tut.taken;st.meta.tutDone=st.meta.tutDone?1:0;")
# ===== 2. окно разговора
rep('<div id="perks" hidden>','<div id="tut" hidden><div class="perk-card tut-card"><div class="tut-top"><canvas id="tutPic" width="124" height="130"></canvas><div class="tut-txt"><h3>Старец Ермолай</h3><small id="tutStep"></small><p id="tutSay"></p><p id="tutTask"></p><p id="tutRw"></p></div></div><div id="tutBtns"></div></div></div>\n<div id="perks" hidden>')
rep("#perks{position:fixed;inset:0;z-index:35;","#tut{position:fixed;inset:0;z-index:34;background:rgba(5,8,6,.55);display:flex;align-items:center;justify-content:center;padding:16px}\n.tut-card{border-top-color:#e98b3d;width:min(100%,600px)}\n.tut-top{display:flex;gap:14px;align-items:flex-start}\n#tutPic{flex:none;border:1px solid var(--line);border-radius:8px;width:124px;height:130px}\n.tut-txt{display:grid;gap:6px;min-width:0}.tut-txt small{color:var(--muted);font-size:12px}\n#tutSay{margin:0;font-size:14px;line-height:1.45;color:var(--ink)}\n#tutTask{margin:0;font-size:14px;font-weight:700;color:#e9c46a;line-height:1.45}\n#tutRw{margin:0;font-size:13px;font-weight:600;color:#9fc07a}\n#tutBtns{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}\n.tut-b{all:unset;cursor:pointer;padding:10px 18px;border-radius:8px;background:var(--panel2);border:1px solid var(--line);font-weight:700;font-size:14px;color:var(--ink)}\n.tut-b.main{background:#e98b3d;border-color:#e98b3d;color:#1a1208}\n.tut-b:hover,.tut-b:focus-visible{filter:brightness(1.12)}\n#questList li.tut-q{border-left:2px solid #e98b3d;padding-left:6px}\n#questList li.tut-q em{grid-column:1/-1;display:block;font-style:normal;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#e98b3d}\n#questList li.tut-q .tut-go{color:#9fe0a8}\n@media (max-width:520px){.tut-top{flex-direction:column;align-items:center}#tutPic{width:96px;height:100px}}\n#perks{position:fixed;inset:0;z-index:35;")
# ===== 3. код обучения
rep("function migrate(src){",P('tutorial.js')+"\nfunction migrate(src){")
# ===== 4. задания справа: пока идёт обучение — только строка обучения
rep("function fillQuests(){while(","function fillQuests(){if(tutOn())return;while(")
rep("  questT+=dt;if(questT<0.5)return;questT=0;\n","  questT+=dt;if(questT<0.5)return;questT=0;\n  if(tutOn()){renderQuests();return}\n")
rep("function renderQuests(){\n  const h=S.quests.map(","function renderQuests(){\n  const h=tutOn()?tutQuestHtml():S.quests.map(")
# ===== 5. старец в лагере, разговор
rep("  drawMoat(now);drawTraps();\n","  drawMoat(now);drawTraps();\n  if(!DG)add(ELDER.y,()=>drawElder(now));\n")
rep("  if(!DG&&merchantHere()&&near(MERCH_POS,70))","  if(!DG&&near(ELDER,50)&&!(merchantHere()&&dist(P.x,P.y,MERCH_POS.x,MERCH_POS.y)<dist(P.x,P.y,ELDER.x,ELDER.y)))return {k:'x',o:ELDER,ok:true,lbl:'Говорить',msg:'Старец Ермолай: нажмите E, пробел или «Говорить»',fn:openTut};\n  if(!DG&&merchantHere()&&near(MERCH_POS,70))")
# ===== 6. стрелка к цели, фонарь ночью
rep("  mistFog();drawCryptHud();\n","  mistFog();drawCryptHud();drawTutArrow(camX,camY,now);\n")
rep("    for(let i=0;i<towerSlots(S.base);i++)if(S.towers[i]){const tp=towerPos(i);hole(tp.x,tp.y,110)}\n","    for(let i=0;i<towerSlots(S.base);i++)if(S.towers[i]){const tp=towerPos(i);hole(tp.x,tp.y,110)}\n    if(!DG)hole(ELDER.x+21,ELDER.y-45,60);\n")
# ===== 7. пауза, пока открыт разговор
rep("if(!menuOpen&&!mapOpen&&!S.over&&!perksOpen()&&!clsOpen()&&$('win').hidden)update(dt);","if(!menuOpen&&!mapOpen&&!S.over&&!perksOpen()&&!clsOpen()&&!tutOpen()&&$('win').hidden)update(dt);")
rep("window.__G={get S(){return S},","window.__G={get S(){return S},get CX(){return CX},get CY(){return CY},TUT,tutTarget,openTut,renderTut,")
open('src/lumber-camp.html','w').write(s)
print('ok')
