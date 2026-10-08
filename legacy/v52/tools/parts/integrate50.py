import re
s=open('snapshots/lumber-camp-v49.html').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)
def cut(a,b,new):
    global s
    i=s.index(a);j=s.index(b,i);s=s[:i]+new+s[j:]
P=lambda n:open('tools/parts/'+n).read()

# ===== 1. модуль рисовки и связка с игрой
# старые функции дерева и валуна заменены новыми (из look50game.js)
cut("function drawTree(t){","function drawTreeBody(t,x,y,r){","")
cut("function drawRock(r){","function drawMound(m,now){","")
rep("// нарисовать постройку в точке: x,y — основание, s — масштаб",P('look50.js')+"\n"+P('look50game.js')+"\n// нарисовать постройку в точке: x,y — основание, s — масштаб")

# ===== 2. земля: рельеф (светлые склоны, тёмные ложбины), сухие желтоватые места, без коричневого пятна у лагеря
rep("const jn=vnoise((S.seed|0)+404),JA=34;","const jn=vnoise((S.seed|0)+404),JA=34,hn=vnoise((S.seed|0)+557),HR=(x,y)=>hn(x/260,y/260)+0.5*hn(x/110+7,y/110);")
rep("      for(let ch=0;ch<3;ch++){let v=(a[ch]*(1-tx)+b[ch]*tx)*(1-ty)+(c[ch]*(1-tx)+d[ch]*tx)*ty;D[o+ch]=v+sh}",
    "      const slope=(HR(wx-6,wy-6)-HR(wx+6,wy+6))*9,dry=Math.max(0,hn(wx/420+3,wy/420)-0.45)*0.9,mul=[1+slope*0.2+dry*0.2,1+slope*0.2+dry*0.05,1+slope*0.2-dry*0.25];\n"
    "      for(let ch=0;ch<3;ch++){let v=(a[ch]*(1-tx)+b[ch]*tx)*(1-ty)+(c[ch]*(1-tx)+d[ch]*tx)*ty;D[o+ch]=(v+sh)*mul[ch]}")
rep("if(dc<CFG.baseR+30){const t=Math.max(0,Math.min(1,(CFG.baseR+30-dc)/50))*0.85;","if(dc<CFG.baseR+30){const t=Math.max(0,Math.min(1,(CFG.baseR+30-dc)/50))*0.22;")
# мелкие детали поверх земли — узор на весь экран
rep("  if(ex>sx&&ey>sy){ctx.imageSmoothingEnabled=true;ctx.drawImage(WG.tex,sx,sy,ex-sx,ey-sy,sx*K,sy*K,(ex-sx)*K,(ey-sy)*K)}\n}",
    "  if(ex>sx&&ey>sy){ctx.imageSmoothingEnabled=true;ctx.drawImage(WG.tex,sx,sy,ex-sx,ey-sy,sx*K,sy*K,(ex-sx)*K,(ey-sy)*K)}\n"
    "}")
rep("WG.tex=cv;","WG.tex=cv;WG.chunks=new Map();")
rep("  if(!WG.tex)return;const K=WG.texK,sx=Math.max(0,vx0/K),sy=Math.max(0,vy0/K),ex=Math.min(WG.tex.width,vx1/K),ey=Math.min(WG.tex.height,vy1/K);",
    "  if(!WG.tex)return;\n  if(WG.chunks){for(let j=Math.floor(vy0/CHUNK);j<=Math.floor(vy1/CHUNK);j++)for(let i=Math.floor(vx0/CHUNK);i<=Math.floor(vx1/CHUNK);i++){if(i<0||j<0||i*CHUNK>WG.W||j*CHUNK>WG.W)continue;ctx.drawImage(terrainChunk(i,j),i*CHUNK,j*CHUNK,CHUNK,CHUNK)}return}\n  const K=WG.texK,sx=Math.max(0,vx0/K),sy=Math.max(0,vy0/K),ex=Math.min(WG.tex.width,vx1/K),ey=Math.min(WG.tex.height,vy1/K);")
# трава, цветы, камушки, листья в первых трёх зонах — новые; декора больше
rep("function drawDecor(d,now){const x=d.x,y=d.y,s=d.s,v=d.v;","function drawDecor(d,now){const x=d.x,y=d.y,s=d.s,v=d.v;\n  if(d.b==='z1'||d.b==='z2'||d.b==='z3'){drawTuft(x,y,s,d.b,v);return}")
rep("decor=[];const n=Math.round(3200*WG.scale*WG.scale);","decor=[];const n=Math.round(4200*WG.scale*WG.scale);")
rep("function render(now){\n","function render(now){\n  LOOK.use(ctx);\n")

# ===== 3. залежи и пни
rep("    ctx.fillStyle='rgba(58,56,50,.75)';ctx.beginPath();ctx.ellipse(p.x,p.y,p.r,p.r*0.85,rot,0,7);ctx.fill();",
    "    if(p.kind==='rocks'&&drawDeposit(p))return;\n    ctx.fillStyle='rgba(58,56,50,.75)';ctx.beginPath();ctx.ellipse(p.x,p.y,p.r,p.r*0.85,rot,0,7);ctx.fill();")
m=re.search(r"  for\(const t of trees\)\{if\(t\.alive\|\|!vis\(t\.x,t\.y\)\)continue;[^\n]*\n",s);assert m
s=s[:m.start()]+"  for(const t of trees){if(t.alive||!vis(t.x,t.y))continue;drawStump(t)}\n"+s[m.end():]

# ===== 4. площадь, ратуша в объёме, ограда с толщиной
rep("  drawMoat(now);drawTraps();\n","  if(!DG)drawPlaza();\n  drawMoat(now);drawTraps();\n")
rep("function drawHQ(now){const b=S.base;bd(CX,CY+8,[0,1,1,1,1,0.85,0.72][b]||1,()=>BLD.HQ[b](now/1000))}",
    "function drawHQ(now){const b=S.base;bd(CX,CY+8,[0,1,1,1,1,0.85,0.72][b]||1,()=>{LOOK.use(ctx);drawHQ50(b,now/1000,darkness()>0.3)})}\nconst HQ_TOP=[0,24,34,76,104,124,156];// высота ратуши по уровням (для полоски прочности)")
rep("ctx.fillRect(CX-w/2,CY-128,w,6);ctx.fillStyle=f>0.4?'#e98b3d':'#cf4b3f';ctx.fillRect(CX-w/2,CY-128,w*f,6);\n      ctx.font='600 11px Rubik, sans-serif';ctx.textAlign='center';ctx.fillStyle='#ece6d3';ctx.fillText('Ратуша',CX,CY-133)}",
    "const by=CY-(HQ_TOP[S.base]||110)-4;ctx.fillRect(CX-w/2,by,w,6);ctx.fillStyle=f>0.4?'#e98b3d':'#cf4b3f';ctx.fillRect(CX-w/2,by,w*f,6);\n      ctx.font='600 11px Rubik, sans-serif';ctx.textAlign='center';ctx.fillStyle='#ece6d3';ctx.fillText('Ратуша',CX,by-5)}")
rep("  if(S.fence.lvl>0){const l=S.fence.lvl,ratio=S.fence.hp/fenceHp(l),sk=fenceSkin(l),R=CFG.fenceR,n=sk===2?96:72;\n    for(let i=0;i<n;i++){const am=(i+0.5)/n*6.283,py=CY+Math.sin(am)*R,broken=ratio<=0||((i*37)%100)/100>ratio+0.15;add(py+(sk>=3?1:0),()=>bd(0,0,1,()=>BLD.fenceSeg(CX,CY,R,sk,i,n,broken)))}}",
    "  if(S.fence.lvl>0){const l=S.fence.lvl,ratio=S.fence.hp/fenceHp(l),sk=fenceSkin(l),R=CFG.fenceR,n=sk>=3?56:72;\n"
    "    for(let i=0;i<n;i++){const a0=i/n*6.283,a1=(i+1)/n*6.283,am=(a0+a1)/2,py=CY+Math.sin(am)*R,broken=ratio<=0||((i*37)%100)/100>ratio+0.15;\n"
    "      add(py+(sk>=3?1:0),broken?()=>bd(0,0,1,()=>BLD.fenceSeg(CX,CY,R,sk,i,n,true)):()=>{LOOK.use(ctx);drawFenceSeg(sk,i,n)})}}")
rep("window.__G={get S(){return S},","window.__G={get S(){return S},trees:()=>trees,rocks:()=>rocks,patches2:()=>patches,LOOK,")
open('src/lumber-camp.html','w').write(s)
print('ok')
