s=open('snapshots/lumber-camp-v51.html').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)

# ===== 1. Варвар: живучесть, защита, дальность, Вихрь
rep("const maxHp  = l => Math.round(10 + 6*(l-1) + 8*pr('vit') + gear('hp') + 15*rl('heart'));",
    "// Варвар: больше здоровья, своя защита, бьёт дальше, в Вихре получает вдвое меньше урона\nconst WAR={hp:1.4,armor:15,armorCap:70,reach:55,mound:60,smashR:80,whirlDmg:0.5};\nconst isWar=()=>cls()==='warrior';\n"
    "const maxHp  = l => Math.round((10 + 6*(l-1) + 8*pr('vit') + gear('hp') + 15*rl('heart'))*(isWar()?WAR.hp:1));\n"
    "const heroArmor=()=>Math.min(isWar()?WAR.armorCap:60,gear('armor')+(isWar()?WAR.armor:0));")
rep("function damagePlayer(n){if(P.inv>0","function damagePlayer(n){if(P.ko||P.rez>0)return;if(P.inv>0")
rep("n*=1-Math.min(0.6,gear('armor')/100);","n*=1-heroArmor()/100;if(isWar()&&RX.whirl>0)n*=WAR.whirlDmg;")
rep("['Защита',`−${Math.min(60,gear('armor'))}% входящего урона`],","['Защита',`−${heroArmor()}% входящего урона${isWar()?` (Варвар: +${WAR.armor}% всегда, в Вихре урон вдвое меньше)`:''}`],")
rep("d<(bow?reach:z.r+38)","d<(bow?reach:z.r+(isWar()?WAR.reach:38))")
rep("d<(bow?reach:44)","d<(bow?reach:(isWar()?WAR.mound:44))")
rep("const R=60*(1+0.2*pr('smash'))","const R=WAR.smashR*(1+0.2*pr('smash'))")
rep("<span><em>Ветка умений</em>${C.br}</span>","${k==='warrior'?'<span><em>Живучесть</em>+40% здоровья, 15% защиты, бьёт дальше, в Вихре урон вдвое меньше</span>':''}<span><em>Ветка умений</em>${C.br}</span>")

# ===== 2. Смертельная петля: ожить с неуязвимостью 4 с; вторая гибель за ночь — без сознания до рассвета
rep("    const lw=S.bag,ls=S.bagStone;S.bag=0;S.bagStone=0;S.bagIron=0;p.hp=maxHp(S.up.hp);P.x=CX;P.y=CY+40;p.x=P.x;p.y=P.y;",
    "    const lw=S.bag,ls=S.bagStone;S.bag=0;S.bagStone=0;S.bagIron=0;p.hp=maxHp(S.up.hp);P.x=CX;P.y=CY+40;p.x=P.x;p.y=P.y;P.rez=REZ.inv;\n"
    "    if(phase().night&&S.night.active){S.night.deaths=(S.night.deaths||0)+1;if(S.night.deaths>=2){P.ko=true;toast('Вы без сознания до рассвета. Лагерь держится сам.','bad','ko')}}")
rep("  if(p.hp<=0&&S.hq<=0){gameOver();return}","  if(p.hp<=0&&S.hq<=0){gameOver();return}\n  if(P.ko&&S.hq<=0){gameOver();return}\n  P.rez=Math.max(0,(P.rez||0)-dt);")
rep("function endNight(){","const REZ={inv:4,fast:3};// неуязвимость после гибели, ускорение времени без сознания\nfunction endNight(){\n  if(P.ko){P.ko=false;P.rez=REZ.inv;S.p.hp=maxHp(S.up.hp);P.x=CX;P.y=CY+40;toast('Рассвет. Вы очнулись в ратуше.','good','ko')}")
# мертвецы не видят героя без сознания
rep("    const dP=dist(z.x,z.y,P.x,P.y), dC=dist(z.x,z.y,CX,CY);","    const dP=P.ko?1e9:dist(z.x,z.y,P.x,P.y), dC=dist(z.x,z.y,CX,CY);")
# без сознания: не ходит, не бьёт, клавиши умений не работают
rep("  if(joy){mx+=joy.dx;my+=joy.dy}","  if(joy){mx+=joy.dx;my+=joy.dy}\n  if(P.ko){mx=0;my=0}")
rep("const act=actHeld||actTap||keys.has('Space')||keys.has('KeyE');actTap=false;","const act=!P.ko&&(actHeld||actTap||keys.has('Space')||keys.has('KeyE'));actTap=false;")
rep("addEventListener('keydown',e=>{\n  if(e.target&&e.target.tagName==='TEXTAREA')return;","addEventListener('keydown',e=>{\n  if(e.target&&e.target.tagName==='TEXTAREA')return;\n  if(P.ko&&!['Escape','KeyK','KeyM','KeyB','KeyI'].includes(e.code))return;")
# время до рассвета идёт быстрее
rep("&&$('win').hidden)update(dt);","&&$('win').hidden){update(dt);if(P.ko)for(let i=1;i<REZ.fast&&P.ko;i++)update(dt)}")
# рисунок: золотое свечение после оживления; без сознания — лежит у ратуши, надпись на экране
rep("function drawPlayer(){\n  const x=P.x,y=P.y;","function drawPlayer(){\n  const x=P.x,y=P.y;\n  if(P.ko){ctx.save();ctx.globalAlpha=0.55;ctx.translate(x,y);ctx.rotate(-1.4);ctx.translate(-x,-y);drawHeroBody(ctx,x,y,cls(),false,0,1,heroSet());ctx.restore();ctx.fillStyle='rgba(236,230,211,.8)';ctx.font='700 16px Rubik, sans-serif';ctx.textAlign='center';ctx.fillText('z z z',x+10,y-30-Math.sin(performance.now()/400)*3);return}\n  if(P.rez>0){const a=0.35+0.2*Math.sin(performance.now()/120);const g=ctx.createRadialGradient(x,y-8,4,x,y-8,34);g.addColorStop(0,`rgba(244,199,102,${a})`);g.addColorStop(1,'rgba(244,199,102,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y-8,34,0,7);ctx.fill()}")
rep("  mistFog();drawCryptHud();","  mistFog();drawCryptHud();\n  if(P.ko){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='rgba(8,10,14,.45)';ctx.fillRect(0,0,VW,VH);ctx.textAlign='center';ctx.font='400 26px \"Russo One\", sans-serif';ctx.fillStyle='#000';ctx.fillText('Без сознания до рассвета',VW/2+2,VH*0.32+2);ctx.fillStyle='#ece6d3';ctx.fillText('Без сознания до рассвета',VW/2,VH*0.32);ctx.font='500 14px Rubik, sans-serif';ctx.fillStyle='#c9c2b0';ctx.fillText('Время идёт быстрее. Если ратуша падёт — лагерь падёт.',VW/2,VH*0.32+26)}")
rep("window.__G={get S(){return S},","window.__G={get S(){return S},WAR,REZ,")
open('src/lumber-camp.html','w').write(s)
print('ok')
