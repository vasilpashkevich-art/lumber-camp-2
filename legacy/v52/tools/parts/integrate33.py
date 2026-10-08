p='src/lumber-camp.html';s=open(p).read()
def rep(a,b):
    global s
    assert s.count(a)==1,(s.count(a),a[:80]);s=s.replace(a,b)
rep("  keyr:  {name:'Ключник',           max:3, desc:'Старт с 2 ключами от склепов'},\n};\n",
    "  keyr:  {name:'Ключник',           max:3, desc:'Старт с 2 ключами от склепов'},\n};\n"+open('tools/parts/relics.js').read())
# state & migrate
rep("relicPend:0,comp31:0,codex:{}","relicPend:0,comp31:0,relicFix32:0,codex:{}")
rep("st.meta.relics={};if(src&&src.meta&&src.meta.relics)for(const k in src.meta.relics)if(RELICS[k])st.meta.relics[k]=Math.min(RELICS[k].max,src.meta.relics[k]|0);",
    "st.meta.relics={};if(src&&src.meta&&src.meta.relics)for(const k in src.meta.relics){const R=RELICS[k]||RELIC2[k];if(R)st.meta.relics[k]=Math.min(R.max,src.meta.relics[k]|0)}")
# offer
rep("  const open=Object.keys(RELICS).filter(k=>rl(k)<RELICS[k].max);\n  relicOffer=open.sort(()=>Math.random()-0.5).slice(0,3);",
    "  const sh=a=>a.sort(()=>Math.random()-0.5),nw=sh(Object.keys(RELIC2).filter(k=>rl(k)<RELIC2[k].max)),od=sh(Object.keys(RELICS).filter(k=>rl(k)<RELICS[k].max));\n  relicOffer=nw.slice(0,2).concat(sh(nw.slice(2).concat(od)).slice(0,3-Math.min(2,nw.length)));")
rep("  for(const k of relicOffer){const R=RELICS[k],b=document.createElement('button');b.type='button';b.className='perk';b.dataset.relic=k;b.style.setProperty('--bc','#f4c766');\n    b.innerHTML=`<small>Реликвия</small><b>${R.name}</b><span>${R.desc}</span><em>ранг ${rl(k)} → ${rl(k)+1} из ${R.max}</em>`;box.append(b)}",
    "  for(const k of relicOffer){const R=RELIC2[k]||RELICS[k],b=document.createElement('button');b.type='button';b.className='perk';b.dataset.relic=k;b.style.setProperty('--bc',RELIC2[k]?'#7ec8ff':'#f4c766');\n    b.innerHTML=`<span class=\"perk-ico\">${relicSvg(k,40)}</span><small>${RELIC2[k]?(RELIC2[k].act?'Реликвия · умение, клавиша '+RELIC2[k].kl:'Реликвия · действует сама'):'Реликвия · дар'}</small><b>${R.name}</b><span>${relicDesc(k,rl(k)+1)}</span><em>ранг ${rl(k)} → ${rl(k)+1} из ${R.max}</em>`;box.append(b)}")
rep("toast(`Реликвия: ${RELICS[k].name} (ранг ${rl(k)})`,'good');","toast(`Реликвия: ${relicName(k)} (ранг ${rl(k)})${RELIC2[k]&&RELIC2[k].act?' — клавиша '+RELIC2[k].kl+' или кнопка на панели сверху':''}`,'good');relicBarSig='';")
# update
rep("  updFx(dt);updAch(dt);","  updFx(dt);updAch(dt);updRelics(dt);")
rep("    if(z.burn>0){z.burn-=dt;z.hp-=z.burnDps*dt;if(z.hp<=0){killZombie(z);continue}}\n",
    "    if(z.burn>0){z.burn-=dt;z.hp-=z.burnDps*dt;if(z.hp<=0){killZombie(z);continue}}\n    if(z.frozen>0){z.frozen-=dt;continue}\n")
rep("const speedOf= l => Math.round((150 + 15*(l-1))*(1+0.06*pr('legs'))*(1+gear('move')/100));",
    "const speedOf= l => Math.round((150 + 15*(l-1))*(1+0.06*pr('legs'))*(1+gear('move')/100)*(1+(rl('boots')>1?0.25:rl('boots')?0.15:0)));")
rep("const s=speedOf(S.up.boots)*(swamp?0.55:1)","const s=speedOf(S.up.boots)*(swamp&&!rl('boots')?0.55:1)")
# dash charges
rep("  P.dashCd=Math.max(0,(P.dashCd||0)-dt);P.inv=Math.max(0,(P.inv||0)-dt);\n  if((keys.has('ShiftLeft')||keys.has('ShiftRight')||dashReq)&&P.dashCd<=0){\n    dashReq=false;P.dash=DASH.time;P.dashCd=dashCd();P.inv=DASH.inv;",
"""  P.inv=Math.max(0,(P.inv||0)-dt);
  {const mch=rl('boots')?2:1;if(P.dch==null)P.dch=mch;P.dch=Math.min(P.dch,mch);
   if(P.dch<mch){P.dchT=(P.dchT==null?dashCd():P.dchT)-dt;if(P.dchT<=0){P.dch++;P.dchT=dashCd()}}else P.dchT=dashCd();
   P.dashGap=Math.max(0,(P.dashGap||0)-dt);P.dashCd=P.dch>0?0:P.dchT}
  if((keys.has('ShiftLeft')||keys.has('ShiftRight')||dashReq)&&P.dch>0&&P.dashGap<=0){
    dashReq=false;P.dch--;P.dashGap=0.25;P.dash=DASH.time;P.dashCd=P.dch>0?0:P.dchT;P.inv=DASH.inv;""")
# death -> phoenix
rep("  if(p.hp<=0&&S.hq<=0){gameOver();return}","  if(p.hp<=0)phoenixSave();\n  if(p.hp<=0&&S.hq<=0){gameOver();return}")
# twin
rep("d*=2;cr=true}hitEnemy(t,d,'ranged',cr)}","d*=2;cr=true}hitEnemy(t,d,'ranged',cr);twinShot(t,d,cr)}")
# keys
rep("  if(mapOpen)return;\n","  if(mapOpen)return;\n  {const rk=RELIC_ACT.find(q=>RELIC2[q].key===e.code||(e.code==='Numpad'+RELIC2[q].kl));if(rk){if(rl(rk))useRelic(rk);return}}\n")
# draw
rep("  // плевки\n  drawRoots();","  drawRelicFx(now);\n  // плевки\n  drawRoots();")
# hud
rep("function hud(){","function hud(){\n  updRelicBar();")
rep('<div class="hud" id="clock">','<div id="relicBar" hidden></div>\n<div class="hud" id="clock">')
rep("addEventListener('beforeunload',save);","addEventListener('beforeunload',save);\ndocument.getElementById('relicBar').addEventListener('click',e=>{const b=e.target.closest('[data-relic-use]');if(!b)return;const k=b.dataset.relicUse;if(RELIC2[k]&&RELIC2[k].act)useRelic(k);else toast(`${relicName(k)}: ${relicDesc(k,rl(k))}`,'', 'rinfo')});")
# free pick for existing owners
rep("  else{applyOffline();if(saved)compensate31();else S.meta.comp31=1;",
    "  else{applyOffline();if(saved)compensate31();else S.meta.comp31=1;\n    if(!S.meta.relicFix32){S.meta.relicFix32=1;if(saved&&Object.keys(S.meta.relics).some(k=>rl(k)>0)){S.meta.relicPend++;toast('Реликвии обновлены: появились реликвии с умениями. Выберите одну в подарок','good')}save()}")
# hero tab
rep("  if(t==='hero'){\n","  if(t==='hero'){\n    {const own=ownedRelics();R.push({note:`<b>Реликвии</b> · сохраняются навсегда. Даются при Великом переселении (после победы над Владыкой Мора)${own.length?'. Умения: клавиши 1–4 или кнопки на панели вверху экрана':''}`});\n     R.push({raw:own.length?`<div class=\"cdx\">${own.map(k=>`<div class=\"cdx-c\">${relicSvg(k,34)}<div><b>${relicName(k)}</b><small>ранг ${rl(k)} из ${(RELIC2[k]||RELICS[k]).max}${RELIC2[k]&&RELIC2[k].act?' · клавиша '+RELIC2[k].kl:''}</small><p>${relicDesc(k,rl(k))}</p></div></div>`).join('')}</div>`:'<p class=\"note\">Пока нет ни одной реликвии.</p>'})}\n")
# css
rep(".note{font-size:12px","#relicBar{position:fixed;z-index:6;top:calc(78px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);display:flex;gap:6px;align-items:flex-end;pointer-events:auto}\n.rlc{position:relative;width:38px;height:38px;display:grid;place-items:center;padding:0;background:rgba(14,19,15,.82);border:1px solid var(--line);border-radius:9px;cursor:pointer;overflow:hidden}.rlc.act{width:46px;height:46px;border-color:#7ec8ff}.rlc.old{opacity:.8}.rlc:hover{border-color:var(--ember)}\n.rlc b{position:absolute;left:3px;top:1px;font-size:10px;color:#ece6d3}.rlc em{position:absolute;right:3px;bottom:1px;font-size:9px;font-style:normal;color:#f4c766}.rlc i{position:absolute;left:0;right:0;bottom:0;height:0;background:rgba(0,0,0,.6);display:grid;place-items:center;font-style:normal;font-size:13px;font-weight:700;color:#fff}\n.perk-ico{display:block;margin-bottom:2px}\n@media (max-width:700px){#relicBar{top:auto;bottom:calc(210px + env(safe-area-inset-bottom,0px));left:auto;right:10px;transform:none;flex-direction:column}}\n.note{font-size:12px")
open(p,'w').write(s);print('ok')
