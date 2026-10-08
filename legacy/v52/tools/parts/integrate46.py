s=open('snapshots/lumber-camp-v45.html').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)
def cut(a,b,new):
    global s
    i=s.index(a);j=s.index(b,i);s=s[:i]+new+s[j:]
P=lambda n:open('tools/parts/'+n).read()

# ===== 1. склеп раз в 3 дня
rep("function enterCrypt(c){\n  S.keys--;","function enterCrypt(c){\n  S.keys--;S.crypts[c.id]=S.day+CRYPT_CD;")
rep("    if(S.keys<=0)return {k:'x',o:c,ok:false,msg:'Нужен ключ от склепа: падает с могильников, боссов и у торговца',fn:()=>{}};",
    "    if((S.crypts[c.id]||0)>S.day){const d=S.crypts[c.id]-S.day;return {k:'x',o:c,ok:false,msg:`Склеп закрыт: откроется на ${S.crypts[c.id]}-й день (через ${d} ${d===1?'день':d<5?'дня':'дней'})`,fn:()=>{}}}\n    if(S.keys<=0)return {k:'x',o:c,ok:false,msg:'Нужен ключ от склепа: падает с могильников, боссов и у торговца',fn:()=>{}};")
rep("cd?'закрыт до следующего дня':`ключей: ${S.keys}`","cd?`откроется на ${S.crypts[k.id]}-й день`:`ключей: ${S.keys}`")
# ===== 2. из склепа всегда вещь; комплект 10%, гарантия через 6 походов
rep("  // комплект: 5% или гарантия через 15 походов, только недостающие вещи","  // всегда одна вещь (не хуже редкой)\n  drops.push({x:c.x-60,y:c.y+40,kind:'item',it:makeItem(t+1,1),t:600});\n  // комплект: 10% или гарантия через 6 походов, только недостающие вещи")
rep("if(miss.length&&(Math.random()<0.05||S.setPity>=15)){","if(miss.length&&(Math.random()<SET_DROP.chance||S.setPity>=SET_DROP.pity)){")
rep("const SETS={","const SET_DROP={chance:0.10,pity:6};// вещь комплекта из склепа: шанс и гарантия через столько походов\nconst SETS={")
rep("Выпадает в склепе (5%, гарантия через ${Math.max(0,15-(S.setPity||0))} походов)","Выпадает в склепе (10%, гарантия через ${Math.max(0,SET_DROP.pity-(S.setPity||0))} походов). Сохраняется при переселении${SETAB[id]?` · весь комплект: «${SETAB[id].name}» — ${SETAB[id].d[0].toLowerCase()+SETAB[id].d.slice(1)}${SETAB[id].act?' (клавиша V)':''}`:''}")
# ===== 3. значки и рамка вещей комплекта
rep("art=it.set?SET_ART[it.slot](SETS[it.set].col)","art=it.set?(SET_ART2[it.set]?SET_ART2[it.set][it.slot]:SET_ART[it.slot](SETS[it.set].col))")
rep("(it.set?(()=>SET_ART[it.slot](SETS[it.set].col)):","(it.set?(()=>SET_ART2[it.set]?SET_ART2[it.set][it.slot]:SET_ART[it.slot](SETS[it.set].col)):")
rep('h+=`<div class="item itm${better?\' better\':\'\'}" style="--rc:${rc.col}">','h+=`<div class="item itm${better?\' better\':\'\'}${it.set?\' setit\':\'\'}" style="--rc:${it.set?SETS[it.set].col:rc.col}">')
rep(".itm-b{display:flex;flex-direction:column;gap:6px;align-items:stretch}",".itm-b{display:flex;flex-direction:column;gap:6px;align-items:stretch}\n.itm.setit .itm-ico{position:relative;border:2px solid transparent;background:linear-gradient(#141b16,#141b16) padding-box,conic-gradient(from var(--sa,0deg),var(--rc),#f4c766,var(--rc),#fff3c0,var(--rc)) border-box;box-shadow:0 0 14px var(--rc);animation:setspin 6s linear infinite}\n@property --sa{syntax:'<angle>';inherits:false;initial-value:0deg}\n@keyframes setspin{to{--sa:360deg}}\n.itm.setit h3{text-shadow:0 0 8px var(--rc)}")
rep("    if(d.kind==='item'){const col=RAR[d.it.rar].col;","    if(d.kind==='item'){const col=d.it.set?SETS[d.it.set].col:RAR[d.it.rar].col;")
# ===== 4. облик героя в комплекте
cut("function heroFig(c,cl,x,y,s=1,dir=1){","// готовые картинки героя",P('herofig2.js')+"const SETC={warrior:'#d9784a',mage:'#8a7aff',archer:'#5fc98a'};\n")
rep("function heroSprite(cl,dir,hurt){const k=(cl||'-')+dir+(hurt?'h':'');","function heroSprite(cl,dir,hurt,set){set=set||{};const k=(cl||'-')+dir+(hurt?'h':'')+'|'+(set.head||'')+(set.armor||'')+(set.legs||'');")
rep("c.scale(Q,Q);heroFig(c,cl,20,40,1,dir);","c.scale(Q,Q);heroFig(c,cl,20,40,1,dir,set,0);")
rep("const Q=3,cv=document.createElement('canvas');cv.width=40*Q;cv.height=56*Q;","const Q=3,cv=document.createElement('canvas');cv.width=40*Q;cv.height=60*Q;")
rep("c.scale(Q,Q);heroFig(c,cl,20,40,1,dir,set,0);","c.scale(Q,Q);heroFig(c,cl,20,44,1,dir,set,0);")
rep("function drawHeroBody(c,x,y,cl,hurt,face,dir){dir=dir||(Math.cos(face)<0?-1:1);const sp=heroSprite(cl,dir,hurt);if(sp)c.drawImage(sp,x-20,y-40,40,56);else if(c.roundRect)heroFig(c,cl,x,y,1,dir)}",
    "function drawHeroBody(c,x,y,cl,hurt,face,dir,set){dir=dir||(Math.cos(face)<0?-1:1);const sp=heroSprite(cl,dir,hurt,set);if(sp)c.drawImage(sp,x-20,y-44,40,60);else if(c.roundRect)heroFig(c,cl,x,y,1,dir,set||{},0)}")
rep("  drawHeroBody(ctx,x,y+bob,cl,P.hurt>0,P.face,dir);","  drawHeroBody(ctx,x,y+bob,cl,P.hurt>0,P.face,dir,heroSet());")
# ===== 5. способности комплекта
rep("const ABIL_ICO={",P('setfx.js')+"\nconst ABIL_ICO={")
rep("  if(e.code==='KeyC'){useAbility();return}","  if(e.code==='KeyC'){useAbility();return}\n  if(e.code==='KeyV'){useSetAbility();return}")
rep("updRelics(dt);updAbility(dt);","updRelics(dt);updAbility(dt);updSetAbility(dt);")
rep("drawRelicFx(now);drawAbilityFx(now);drawDefFx(now);","drawRelicFx(now);drawAbilityFx(now);drawDefFx(now);drawSetFx(now);")
rep("  const sig=(cl||'')+'|'+own.map(k=>k+rl(k)).join(',');","  const fs=fullSet(),sig=(cl||'')+'|'+(fs||'')+'|'+own.map(k=>k+rl(k)).join(',');")
rep("    if(cl)el.innerHTML=`<button type=\"button\" class=\"rlc act\" data-relic-use=\"_cls\"",
    "    if(fs){const A=SETAB[fs];el.innerHTML=`<button type=\"button\" class=\"rlc${A.act?' act':''}\" data-relic-use=\"_set\" title=\"${A.name}: ${A.d}${A.act?'':' (срабатывает сама)'}\" style=\"border-color:${SETS[fs].col};box-shadow:0 0 10px ${SETS[fs].col}\"><svg viewBox=\"0 0 32 32\" width=\"28\" height=\"28\" aria-hidden=\"true\">${SETAB_ICO[fs]}</svg>${A.act?'<b>V</b>':''}<i data-cd=\"_set\"></i></button>`+el.innerHTML}\n    if(cl)el.innerHTML=`<button type=\"button\" class=\"rlc act\" data-relic-use=\"_cls\"")
rep("el.hidden=!own.length&&!cl;","el.hidden=!own.length&&!cl&&!fs;")
rep("  if(cl){const i=el.querySelector('[data-cd=\"_cls\"]');","  if(fs){const i=el.querySelector('[data-cd=\"_set\"]');if(i){i.style.height=(SX.cd>0?100*SX.cd/SETAB[fs].cd:0)+'%';i.textContent=SX.cd>0?Math.ceil(SX.cd):''}}\n  if(cl){const i=el.querySelector('[data-cd=\"_cls\"]');")
rep("if(k==='_cls'){useAbility();return}","if(k==='_cls'){useAbility();return}if(k==='_set'){useSetAbility();return}")
# золотой молот у способности Варвара
rep("  for(const h of RX.hammers){ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.rot);ctx.fillStyle='rgba(126,200,255,.25)';",
    "  for(const h of RX.hammers){ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.rot);ctx.fillStyle=h.gold?'rgba(255,200,90,.3)':'rgba(126,200,255,.25)';")
# ===== 6. вещи комплекта сохраняются при переселении
rep("function newGame(keepMeta){\n  const meta=keepMeta?S.meta:null;\n  S=newState();if(meta)S.meta=meta;",
    "function newGame(keepMeta){\n  const meta=keepMeta?S.meta:null,keepSet=keepMeta?[...Object.values(S.eq),...S.inv].filter(it=>it&&it.set):[];\n  S=newState();if(meta)S.meta=meta;\n  for(const it of keepSet){if(!S.eq[it.slot])S.eq[it.slot]=it;else S.inv.push(it)}S.itemSeq=1+Math.max(0,...keepSet.map(it=>it.id||0));")
rep("Вещи, ресурсы и постройки остаются здесь.","Вещи комплекта забираете с собой, остальные вещи, ресурсы и постройки остаются здесь.")
rep("lairs:()=>lairs,useRelic,hammerTargets};","lairs:()=>lairs,useRelic,hammerTargets,useSetAbility,SX,openDunChest,makeSetItem};")
rep("собрано ${own.length}/3","собрано ${new Set(own).size}/3")
open('src/lumber-camp.html','w').write(s)
print('ok')
