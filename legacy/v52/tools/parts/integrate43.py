s=open('snapshots/lumber-camp-v42.html').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)
def cut(a,b,new,inc_b=False):
    global s
    i=s.index(a);j=s.index(b,i)
    if inc_b:j+=len(b)
    s=s[:i]+new+s[j:]
P=lambda n:open('tools/parts/'+n).read()

# облики построек
cut("function drawHQ(now){","function drawFence(){",P('bldfig.js')+"\n")
cut("function towerTop(l){","function drawArcher(",'')
cut("function drawTower(x,y,l,tw,now){","function drawTree(t){",'')
cut("function drawCamp(now){","const ARCHERS=[null,",P('campdraw.js'))
rep("const HQ_SKINS=['','Огонёк','Костёр','Стоянка','Изба','Терем','Острог'];","const HQ_SKINS=['','Огонёк','Костёр','Стоянка','Изба','Крепость','Замок'];")
# лагерь сортируется вместе с сущностями
rep("  drawCamp(now);\n","  const campE=drawCamp(now);\n")
rep("  ents.push({y:P.y,f:drawPlayer});","  ents.push({y:P.y,f:drawPlayer});for(const e of campE)ents.push(e);")
# хижины и руины с тайниками
cut("  if(q.kind==='hut'){\n    ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x-20,y-6,44,26);","function drawFarm(q,f,now){",
"""  if(q.kind==='hut')bd(x,y+14,1,()=>BLD.hut(now/1000,looted));else bd(x,y+14,1,()=>BLD.ruinsPoi(now/1000,looted));
}
""")
# хутор
cut("  if(f.broken){\n    ctx.fillStyle='#3a3530';","  if(f.pal&&!f.broken){",
"""  bd(x,y+12,1,()=>BLD.farm(f.lvl,q.kind!=='hut',now/1000,f.broken));
""")
cut("  if(f.pal&&!f.broken){","  if(f.tower&&!f.broken){",
"""  if(f.pal&&!f.broken){
    const n=28,R=50,col=['','#9a7a4a','#8d6540','#86837a'][f.pal];
    for(let i=0;i<n;i++){const a=i/n*6.283;if(Math.abs(Math.sin(a/2-Math.PI/4*3))<0.08)continue;const px=x+Math.cos(a)*R,py=y+6+Math.sin(a)*R*0.7;
      if(f.pal===1){ctx.strokeStyle='#24180f';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(x,y+6,R,R*0.7,0,a,a+6.283/n);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=3;ctx.stroke();if(i%3===0){ctx.fillStyle='#6b4f30';ctx.fillRect(px-1.2,py-7,2.4,8)}}
      else if(f.pal===2){ctx.fillStyle=i%2?'#7b5634':'#8d6540';ctx.strokeStyle='#24180f';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(px-2.6,py+1);ctx.lineTo(px-2.6,py-10);ctx.lineTo(px,py-14);ctx.lineTo(px+2.6,py-10);ctx.lineTo(px+2.6,py+1);ctx.closePath();ctx.fill();ctx.stroke()}
      else{ctx.fillStyle=i%2?'#86837a':'#77746c';ctx.strokeStyle='#24180f';ctx.lineWidth=0.8;ctx.beginPath();ctx.rect(px-3.4,py-11,6.8,12);ctx.fill();ctx.stroke();if(i%2===0){ctx.fillStyle='#949189';ctx.fillRect(px-3.4,py-14,6.8,3)}}}
  }
""")
cut("  // поленница = мини-склад\n","  // флажок восстановленного хутора\n",
"""  // поленница и камни = мини-склад
  const cap=farmCap(q.zone,f.lvl),n=Math.min(9,Math.ceil(9*f.store/cap)),ns=Math.min(6,Math.ceil(6*(f.storeS||0)/cap));
  ctx.strokeStyle='#24180f';ctx.lineWidth=0.8;
  for(let i=0;i<n;i++){const r=Math.floor(i/3),c=i%3,lx=x+28+c*7+r*3.5,ly=y+20-r*5.5;ctx.fillStyle=i%2?'#7b5634':'#8d6540';ctx.beginPath();ctx.ellipse(lx,ly,3.4,2.8,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#c9a06a';ctx.beginPath();ctx.arc(lx,ly,1.2,0,7);ctx.fill()}
  for(let i=0;i<ns;i++){const r=Math.floor(i/3),c=i%3;ctx.fillStyle=i%2?'#8b8a84':'#a3a29a';ctx.beginPath();ctx.ellipse(x-40+c*7+r*3.5,y+22-r*5,3.8,3,0,0,7);ctx.fill();ctx.stroke()}
""")
# дороги
cut("function drawRoad(q){","function drawCart(q,now){","""function drawRoad(q){
  const a=Math.atan2(q.y-CY,q.x-CX),sx=CX+Math.cos(a)*(CFG.fenceR+16),sy=CY+Math.sin(a)*(CFG.fenceR+16),L=dist(sx,sy,q.x,q.y),nx=-Math.sin(a),ny=Math.cos(a);
  ctx.lineCap='round';ctx.strokeStyle='#24180f';ctx.lineWidth=19;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(q.x,q.y);ctx.stroke();
  ctx.strokeStyle='#5a4a32';ctx.lineWidth=16;ctx.stroke();ctx.strokeStyle='#66553a';ctx.lineWidth=9;ctx.stroke();
  ctx.strokeStyle='rgba(0,0,0,.28)';ctx.lineWidth=1.6;for(const o of [-3.5,3.5]){ctx.beginPath();ctx.moveTo(sx+nx*o,sy+ny*o);ctx.lineTo(q.x+nx*o,q.y+ny*o);ctx.stroke()}
  const rnd=mulberry(Math.floor((q.seed||0.5)*1e6));ctx.strokeStyle='#24180f';ctx.lineWidth=0.6;
  for(let d=10;d<L-10;d+=14+rnd()*10){const k=d/L,o=(rnd()-0.5)*12,px=sx+(q.x-sx)*k+nx*o,py=sy+(q.y-sy)*k+ny*o;ctx.fillStyle=rnd()<0.5?'#8a867d':'#77736a';ctx.beginPath();ctx.ellipse(px,py,2.2,1.6,0,0,7);ctx.fill();ctx.stroke()}
  ctx.strokeStyle='#4a6a2a';ctx.lineWidth=1.2;for(let d=8;d<L;d+=22+rnd()*12){const k=d/L,sd=rnd()<0.5?-1:1,px=sx+(q.x-sx)*k+nx*sd*9,py=sy+(q.y-sy)*k+ny*sd*9;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-1,py-4);ctx.moveTo(px+2,py);ctx.lineTo(px+3,py-3.5);ctx.stroke()}
}
""")
cut("  ctx.save();ctx.translate(x,y);ctx.rotate(c.phase==='go'?a+Math.PI:a);","function drawPeasant(pe,now){",
"""  const hd=c.phase==='go'?a+Math.PI:a,dir=Math.cos(hd)<0?1:-1,load=c.loadS>0?true:c.load>0?false:null;
  bd(x,y+8,0.6,()=>BLD.cart(now/1000,load),dir);
}
""")
# крестьяне
cut("  const x=pe.x,y=pe.y,bob=Math.sin(now/120+pe.i)*(pe.state==='chop'?0:1);","function drawPoi(q,now){",
"""  const x=pe.x,y=pe.y,bob=Math.sin(now/120+pe.i)*(pe.state==='chop'?0:1);
  const dx=x-(pe._lx??x);pe._lx=x;if(Math.abs(dx)>0.1)pe.fd=dx<0?-1:1;
  if(pe.state==='chop'&&pe.tree){const a=Math.atan2(pe.tree.y-y,pe.tree.x-x)+(pe.swing>0.4?-0.9:0.5);
    ctx.strokeStyle='#8d6540';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*13,y+Math.sin(a)*13);ctx.stroke();ctx.fillStyle='#c9ccc4';ctx.beginPath();ctx.arc(x+Math.cos(a)*13,y+Math.sin(a)*13,2.5,0,7);ctx.fill()}
  const fight=pe.state==='fight'||pe.state==='guard',v=(pe.i||0)%3;
  bd(x,y+bob-2,0.5,()=>BLD.person({...BLD.PEASANT,tool:fight?null:BLD.PEASANT.tool,beard:v===1?null:BLD.PEASANT.beard,shirt:['#c9b48a','#9ab0c8','#c97a6a'][v]},0,0,1,pe.fd||1,now/1000));
  if(pe.carry>0){ctx.strokeStyle='#24180f';ctx.lineWidth=0.8;if(pe.res==='stone'){ctx.fillStyle='#9a998f';ctx.beginPath();ctx.ellipse(x,y+3+bob,4.5,3.6,0,0,7);ctx.fill();ctx.stroke()}else{ctx.fillStyle='#8d6540';ctx.fillRect(x-7,y+1+bob,14,4);ctx.strokeRect(x-7,y+1+bob,14,4);ctx.fillStyle='#e2b46a';ctx.fillRect(x+6,y+1+bob,2,4)}}
}
""")
# могильник
cut("  const g=ctx.createRadialGradient(x,y-6,2,x,y-6,46);g.addColorStop(0,`rgba(150,90,200,${0.25+pulse*0.2})`);","  ctx.fillStyle='#000';ctx.fillRect(x-18,y+8,36,4);",
"""  bd(x,y+6,1,()=>BLD.mound(now/1000,false));if(m.hit>0){ctx.fillStyle='rgba(255,240,220,.25)';ctx.beginPath();ctx.ellipse(x,y,30,16,0,0,7);ctx.fill()}
""")
# склеп
cut("  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x+3,y+18,46,14,0,0,7);ctx.fill();\n  ctx.fillStyle='#55525a';","  if(Math.abs(P.x-x)<360",
"""  bd(x,y+18,1.25,()=>BLD.crypt(now/1000,(S.crypts[c.id]||0)>S.day));
""")
# портал
cut("  for(let i=3;i>0;i--){ctx.fillStyle=`rgba(${120+i*30},20,","  ctx.font='700 13px Rubik, sans-serif';ctx.textAlign='center';ctx.fillStyle='#ff8a7a';ctx.fillText('Портал Мора'",
"""  bd(p.x,p.y+42,1.6,()=>BLD.portal(t));
""")
# торговец
cut("  const x=CX+92,y=CY+56;\n  ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x-24,y+4,52,12);","  ctx.font='600 11px Rubik, sans-serif';ctx.textAlign='center';ctx.fillStyle='#f4c766';ctx.fillText('Торговец'",
"""  const x=CX+92,y=CY+56;bd(x,y+12,0.8,()=>BLD.stall(now/1000));
""")
rep("ctx.fillText('Торговец',x+4,y-38+Math.sin(now/400)*2);","ctx.fillText('Торговец',x+4,y-50+Math.sin(now/400)*2);")
# доступ для снимков
rep("drawZombie,makeBoss,ZSPR};","drawZombie,makeBoss,ZSPR,BLD,pois:()=>pois,mounds:()=>mounds,peasants:()=>peasants};")
open('src/lumber-camp.html','w').write(s)
print('ok')
