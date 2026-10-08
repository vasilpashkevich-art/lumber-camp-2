p='src/lumber-camp.html';s=open(p).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)
rep("const W_SIZE = 4400, CX = 2200, CY = 2200;","let W_SIZE = 4400, CX = 2200, CY = 2200;")
rep("const MERCH_POS={x:CX+92,y:CY+56};","const MERCH_POS={get x(){return CX+92},get y(){return CY+56}};")
rep("const DUN = {RW:560, RH:420, CW:190, CH:150, X:W_SIZE+900, Y:CY};","const DUN = {RW:560, RH:420, CW:190, CH:150, get X(){return W_SIZE+900}, get Y(){return CY}};")
# zoneAt via grid
rep("function zoneAt(x,y){const d=dist(x,y,CX,CY);for(const z of CFG.zones)if(d>=z.r0&&d<z.r1)return z;return null}",
    "function zoneAt(x,y){if(!WG.zone)return null;const k=gIdx(x,y);if(k<0||!WG.zone[k])return null;return CFG.zones[WG.zone[k]-1]}")
# world module before buildWorld
rep("function buildWorld(){\n  const rng=mulberry(S.seed||4242);",open('tools/parts/world.js').read()+"\nfunction buildWorld(){\n  genWorld();\n  const rng=mulberry(S.seed||4242);")
a=s[s.index("  const ringPoint=(z,pad)=>{"):s.index("  // эндгейм: отдельный генератор, чтобы не сдвигать старые карты")]
s=s.replace(a,r"""  const zp=(z,pad,opt={})=>randInZone(z.id,rng,pad+30,{...opt,ok:(x,y)=>free(x,y,pad)&&dist(x,y,CX,CY)>CFG.fenceR+pad+60&&(!opt.ok||opt.ok(x,y))});
  const oldArea=z=>Math.PI*(Math.min(z.r1,2480)**2-z.r0**2),zoneOf=(x,y)=>{const k=gIdx(x,y);return k<0?1:Math.max(1,WG.zone[k])};
  const rockCluster=(x,y,r,zid,iron)=>{patches.push({kind:'rocks',x,y,r,zone:zid,seed:rng()});spots.push({x,y,r});const n=4+Math.floor(rng()*3);
    for(let k=0;k<n;k++){const a=rng()*6.283,rr=rng()*(r-20);rocks.push({x:x+Math.cos(a)*rr,y:y+Math.sin(a)*rr,zone:zid,hp:CFG.rocks.hp[zid],alive:true,t:0,shake:0,r:11+rng()*5,seed:rng(),iron:iron&&zid>=4?rng()<0.6:undefined})}};
  for(const z of CFG.zones){
    const ar=Math.max(0.6,WG.area[z.id]/oldArea(z));
    let p=zp(z,90,{noSide:true,minD:CFG.fenceR+ARENA_R+80});
    if(p){lairs.push({zone:z.id,x:p.x,y:p.y});spots.push({x:p.x,y:p.y,r:90})}
    const nsw=z.id===1?1:2;
    for(let i=0;i<nsw;i++){const r=60+rng()*45;p=zp(z,r+10,{noSide:true});if(p){patches.push({kind:'swamp',x:p.x,y:p.y,r,zone:z.id,seed:rng()});spots.push({x:p.x,y:p.y,r})}}
    for(let i=0;i<Math.max(2,Math.round(2*ar));i++){const r=55+rng()*30;p=zp(z,r+10);if(p)rockCluster(p.x,p.y,r,z.id)}
    for(let i=0;i<z.mounds;i++){p=zp(z,45);if(p){const hp=moundHp(z.id);mounds.push({id:z.id+'-'+i,zone:z.id,x:p.x,y:p.y,hp,max:hp,cd:3+rng()*5,hit:0,dead:false,seed:rng()});spots.push({x:p.x,y:p.y,r:45})}}
    for(let i=0;i<2;i++){p=zp(z,40,{noSide:true});if(p){pois.push({id:z.id+'-'+i,zone:z.id,x:p.x,y:p.y,kind:z.id<=3?'hut':'ruins',seed:rng()});spots.push({x:p.x,y:p.y,r:40})}}
  }
  // особенности боковых биомов
  WG.sides.forEach((sd,si)=>{const ar=WG.sideArea[si]/1e6,sp=(pad,ok)=>randInZone(0,rng,pad+30,{onlySide:si,ok:(x,y)=>free(x,y,pad)&&(!ok||ok(x,y))});
    if(sd.id==='snow'){for(let i=0;i<Math.round(9*ar);i++){const r=50+rng()*45,p=sp(r);if(p){patches.push({kind:'drift',x:p.x,y:p.y,r,zone:zoneOf(p.x,p.y),seed:rng()});spots.push({x:p.x,y:p.y,r})}}
      const p=sp(110,(x,y)=>dist(x,y,CX,CY)>WG.R*0.55);if(p){lairs.push({zone:9,x:p.x,y:p.y,side:'snow'});spots.push({x:p.x,y:p.y,r:110})}}
    if(sd.id==='marsh')for(let i=0;i<Math.round(7*ar);i++){const r=50+rng()*50,p=sp(r);if(p){patches.push({kind:'swamp',x:p.x,y:p.y,r,zone:zoneOf(p.x,p.y),seed:rng()});spots.push({x:p.x,y:p.y,r})}}
    if(sd.id==='shroom')for(let i=0;i<Math.round(5*ar);i++){const r=45+rng()*35,p=sp(r);if(p){patches.push({kind:'spore',x:p.x,y:p.y,r,zone:zoneOf(p.x,p.y),seed:rng()});spots.push({x:p.x,y:p.y,r})}}
    if(sd.id==='high'){for(let i=0;i<Math.round(8*ar);i++){const r=35+rng()*40,p=sp(r);if(p){patches.push({kind:'cliff',x:p.x,y:p.y,r,zone:zoneOf(p.x,p.y),seed:rng()});spots.push({x:p.x,y:p.y,r})}}
      for(let i=0;i<Math.max(2,Math.round(3*ar));i++){const r=55+rng()*25,p=sp(r);if(p)rockCluster(p.x,p.y,r,zoneOf(p.x,p.y),true)}}
    if(sd.id==='waste')for(let i=0;i<Math.max(2,Math.round(3*ar));i++){const r=55+rng()*25,p=sp(r);if(p)rockCluster(p.x,p.y,r,zoneOf(p.x,p.y))}
    if(sd.id==='mist')for(let i=0;i<Math.round(5*ar);i++){const r=50+rng()*50,p=sp(r);if(p){patches.push({kind:'swamp',x:p.x,y:p.y,r,zone:zoneOf(p.x,p.y),seed:rng()});spots.push({x:p.x,y:p.y,r})}}
  });
  // деревья: на 10% больше, число — по площади зоны
  for(const z of CFG.zones){
    const target=Math.round(z.trees*1.1*Math.max(0.6,WG.area[z.id]/oldArea(z)));let placed=0,tries=0;
    while(placed<target&&tries<target*6){tries++;
      const p=randInZone(z.id,rng,50);if(!p)break;const x=p.x,y=p.y;
      if(dist(x,y,CX,CY)<CFG.fenceR+60)continue;
      if(!spots.every(s=>dist(s.x,s.y,x,y)>s.r+14))continue;
      if(trees.some(t=>Math.abs(t.x-x)<46&&dist(t.x,t.y,x,y)<46))continue;
      const sd=sideAt(x,y);if(sd&&((sd.id==='waste'&&rng()<0.6)||(sd.id==='high'&&rng()<0.3)))continue;
      const tt=CFG.trees[z.tree];
      trees.push({x,y,tier:z.tree,hp:tt.hp,alive:true,t:0,shake:0,r:tt.r,seed:rng(),skin:sd?sd.id:undefined});
      placed++;
    }
  }
  buildDecor(rng);buildLabels(rng);
""")
rep("  for(const r of rocks){if(r.zone>=4&&rng2()<0.3){r.iron=true;r.hp=rockMax(r)}}","  for(const r of rocks){if(r.iron===undefined&&r.zone>=4&&rng2()<0.3)r.iron=true;if(r.iron)r.hp=rockMax(r)}")
rep("  decorateArenas();\n}\nconst rockMax","  decorateArenas();\n  buildTerrain();\n}\nconst rockMax")
# crypt placement via zone grid (склеп будет переделан в следующей версии)
rep("""      const a=rng2()*6.283,outer=Math.min(z.r1,3000),r=z.r0+70+rng2()*Math.max(1,outer-z.r0-140);
      const x=CX+Math.cos(a)*r,y=CY+Math.sin(a)*r;
      if(!inBounds(x,y,100)||!free(x,y,40))continue;""","""      const p=randInZone(z.id,rng2,110,{noSide:true});if(!p)break;const x=p.x,y=p.y;
      if(!free(x,y,40))continue;""")
# zone zombies
rep("function randInRing(zn){\n  let x,y,g=0;\n  do{const a=Math.random()*Math.PI*2,r=zn.r0+40+Math.random()*(Math.min(zn.r1,3000)-zn.r0-60);x=CX+Math.cos(a)*r;y=CY+Math.sin(a)*r;g++;}while(!inBounds(x,y,60)&&g<50);\n  return {x,y};\n}",
    "function randInRing(zn){return randInZone(zn.id,Math.random,60,{minD:CFG.fenceR+120})||{x:CX+300,y:CY}}")
rep("    if(!S.bosses[zn.id])zombies.push(makeBoss(zn.id));\n  }\n}","    if(!S.bosses[zn.id])zombies.push(makeBoss(zn.id));\n  }\n  if(lairs.some(l=>l.zone===9)&&!S.bosses[9])zombies.push(makeBoss(9));\n}")
rep("  if(k){z.kind=kind;z.max=z.hp=Math.max(1,c.hp*k.hp*ng);","  if(zone&&WG.zone){const sd=sideAt(x,y);if(sd)z.biome=sd.id}\n  if(k){z.kind=kind;z.max=z.hp=Math.max(1,c.hp*k.hp*ng);")
# snow boss
rep("    7:{name:'Царь Мор',           ability:'all',    skin:'lich'},\n","    7:{name:'Царь Мор',           ability:'all',    skin:'lich'},\n    9:{name:'Ледяной великан',    ability:'slam',   skin:'yeti'},\n")
rep("  const zn=zoneById(zid),l=lairs.find(q=>q.zone===zid)||randInRing(zn),c=CFG.zombies[zn.ztier];","  const zn=zoneById(zid)||{id:zid,ztier:6},l=lairs.find(q=>q.zone===zid)||randInRing(zn),c=CFG.zombies[zn.ztier];")
rep("for(const b in CFG.bosses)E.push({key:'b'+b,name:CFG.bosses[b].name,col:CFG.zombies[zoneById(+b).ztier].col,","for(const b in CFG.bosses)E.push({key:'b'+b,name:CFG.bosses[b].name,col:b==='9'?'#cfe6f4':CFG.zombies[zoneById(+b).ztier].col,")
rep("const LORE_B={1:","const LORE_B={9:'Хозяин Снежного края. Тяжёлые удары оземь — держите дистанцию.',1:")
# player: море непроходимо, сугробы замедляют, утёсы
rep("const inSwamp = (x,y) => patches.some(p=>p.kind==='swamp'&&","const inSwamp = (x,y) => patches.some(p=>(p.kind==='swamp'||p.kind==='drift')&&")
rep("  if(P.dash>0){P.dash-=dt;P.x+=P.ddx*DASH.speed*dt;P.y+=P.ddy*DASH.speed*dt;","  const ox0=P.x,oy0=P.y;\n  if(P.dash>0){P.dash-=dt;P.x+=P.ddx*DASH.speed*dt;P.y+=P.ddy*DASH.speed*dt;")
rep("  for(const r of rocks){if(!r.alive||Math.abs(r.x-P.x)>40)continue;const d=dist(P.x,P.y,r.x,r.y),min=r.r+10;if(d<min&&d>0){P.x=r.x+(P.x-r.x)/d*min;P.y=r.y+(P.y-r.y)/d*min}}\n",
    "  for(const r of rocks){if(!r.alive||Math.abs(r.x-P.x)>40)continue;const d=dist(P.x,P.y,r.x,r.y),min=r.r+10;if(d<min&&d>0){P.x=r.x+(P.x-r.x)/d*min;P.y=r.y+(P.y-r.y)/d*min}}\n  if(!DG){for(const c of patches){if(c.kind!=='cliff'||Math.abs(c.x-P.x)>c.r+20)continue;const d=dist(P.x,P.y,c.x,c.y),min=c.r+10;if(d<min&&d>0){P.x=c.x+(P.x-c.x)/d*min;P.y=c.y+(P.y-c.y)/d*min}}\n    if(isSea(P.x,P.y)){if(!isSea(ox0,P.y))P.x=ox0;else if(!isSea(P.x,oy0))P.y=oy0;else{P.x=ox0;P.y=oy0}if(isSea(P.x,P.y)){const q=toLand(P.x,P.y);P.x=q.x;P.y=q.y}}}\n")
rep("  updateZombies(dt);","  for(const z of zombies){z.lx=z.x;z.ly=z.y}\n  updateZombies(dt);\n  if(!DG)for(const z of zombies){if(z.fly)continue;if(isSea(z.x,z.y)){z.x=z.lx;z.y=z.ly;if(isSea(z.x,z.y)){const q=toLand(z.x,z.y);z.x=q.x;z.y=q.y}}for(const c of patches){if(c.kind!=='cliff'||Math.abs(c.x-z.x)>c.r+z.r)continue;const d=dist(z.x,z.y,c.x,c.y),min=c.r+z.r*0.7;if(d<min&&d>0){z.x=c.x+(z.x-c.x)/d*min;z.y=c.y+(z.y-c.y)/d*min}}}\n  updWorld(dt);")
# leash: та же зона вместо кольца
rep("  const inBand=!hz||(pr>Math.max(CFG.fenceR+40,hz.r0-80)&&pr<hz.r1+80);","  const pz=zoneAt(P.x,P.y),inBand=!hz||(pr>CFG.fenceR+40&&(pz===hz||dist(P.x,P.y,z.hx,z.hy)<220));")
# waves & caravan on land
rep("    let x=CX+Math.cos(a)*r,y=CY+Math.sin(a)*r;x=Math.max(60,Math.min(W_SIZE-60,x));y=Math.max(60,Math.min(W_SIZE-60,y));",
    "    let x=CX+Math.cos(a)*r,y=CY+Math.sin(a)*r;x=Math.max(60,Math.min(W_SIZE-60,x));y=Math.max(60,Math.min(W_SIZE-60,y));{const q=toLand(x,y);x=q.x;y=q.y}")
rep("  const a=Math.random()*6.283,r=780+Math.random()*120,x=CX+Math.cos(a)*r,y=CY+Math.sin(a)*r;\n  refugees=[];",
    "  const a=Math.random()*6.283,r=780+Math.random()*120,q0=toLand(CX+Math.cos(a)*r,CY+Math.sin(a)*r),x=q0.x,y=q0.y;\n  refugees=[];")
# render ground
a=s[s.index("  // земля зонами\n"):s.index("  // пятна: болота и скалы")]
s=s.replace(a,"""  // земля: текстура материка + декор биомов
  drawTerrain(vx0,vy0,vx1,vy1);
  for(const d of decor){if(d.x<vx0||d.x>vx1||d.y<vy0||d.y>vy1)continue;drawDecor(d,now)}
""")
a=s[s.index("  // подписи зон\n  ctx.font='600 15px Rubik, sans-serif';ctx.textAlign='center';"):s.index("  drawCamp(now);")]
s=s.replace(a,"""  // подписи зон и биомов
  ctx.font='600 15px Rubik, sans-serif';ctx.textAlign='center';
  for(const L of (WG.labels||[])){if(!vis(L.x,L.y))continue;const z=L.zone?zoneById(L.zone):zoneById(zoneAt(L.x,L.y)?zoneAt(L.x,L.y).id:1);
    ctx.fillStyle=L.side==='snow'?'rgba(20,50,80,.45)':'rgba(236,230,211,.38)';ctx.fillText(L.zone?`${z.name} · топор ${CFG.trees[z.tree].axe}+ · кирка ${CFG.rocks.pick[z.id]}+${zoneCleared(z)?' · очищена':''}`:L.name,L.x,L.y)}

""")
# trees by biome
rep("function drawTreeBody(t,x,y,r){\n","function drawTreeBody(t,x,y,r){\n  if(t.skin){drawBiomeTree(t,x,y,r);return}\n")
# zombie biome look
rep("  if(z.skin!=='slimelet')drawZGear(z,bob,a);","  if(z.skin!=='slimelet'){if(z.biome)drawBiomeZ(z,bob);drawZGear(z,bob,a)}")
# mist fog after world, before joystick
rep("  // джойстик\n  ctx.setTransform(DPR,0,0,DPR,0,0);","  mistFog();\n  // джойстик\n  ctx.setTransform(DPR,0,0,DPR,0,0);")
# minimap
a=s[s.index("  const sc=240/(3150*2),ox=120-CX*sc,oy=120-CY*sc;"):s.index("  for(const q of pois){const f=farmOf(q);if(f&&f.road){mctx.strokeStyle")]
s=s.replace(a,"""  const sc=240/(WG.R*2.3),ox=120-CX*sc,oy=120-CY*sc;
  mctx.fillStyle='#14324a';mctx.fillRect(0,0,240,240);
  if(WG.tex)mctx.drawImage(WG.tex,ox,oy,WG.W*sc,WG.W*sc);
""")
# big map
a=s[s.index("  for(let i=CFG.zones.length-1;i>=0;i--){const z=CFG.zones[i];c.fillStyle=zoneCleared(z)?'#25331d':z.tint;"):s.index("  // болота и скалы\n")]
s=s.replace(a,"  c.fillStyle='#14324a';c.fillRect(X(0),Y(0),W_SIZE*s,W_SIZE*s);\n  if(WG.tex){c.imageSmoothingEnabled=true;c.drawImage(WG.tex,X(0),Y(0),W_SIZE*s,W_SIZE*s)}\n")
rep("  for(const p of patches){c.fillStyle=p.kind==='swamp'?'rgba(42,85,80,.85)':'rgba(119,116,107,.6)';","  for(const p of patches){c.fillStyle=p.kind==='swamp'?'rgba(42,85,80,.85)':p.kind==='drift'?'rgba(255,255,255,.7)':p.kind==='spore'?'rgba(170,230,120,.4)':p.kind==='cliff'?'rgba(80,76,70,.9)':'rgba(119,116,107,.6)';")
a=s[s.index("  for(const z of CFG.zones){const r=(z.r0+Math.min(z.r1,2200))/2,a=-Math.PI/2;lab("):]
a=a[:a.index("\n")+1]
s=s.replace(a,"  for(const L of (WG.labels||[])){if(L.zone){const z=zoneById(L.zone);lab(L.x,L.y,z.name,zoneCleared(z)?'#9fc07a':'rgba(236,230,211,.85)',`${CFG.trees[z.tree].name} · топор ${CFG.trees[z.tree].axe}+${zoneCleared(z)?' · очищена':''}`,true,0)}else lab(L.x,L.y,L.name,L.side==='snow'?'#bfe6ff':'#fff2d8','',true,1)}\n")
rep("const bmFit=()=>Math.min(BM.w,BM.h)/W_SIZE*1.02;","const bmFit=()=>Math.min(BM.w,BM.h)/(WG.R*2.35||W_SIZE);")
# migration: player to camp if position invalid
rep("  P.x=S.p.x;P.y=S.p.y;if(S.p.hp<=0)","  if(!(S.p.x>0)||isSea(S.p.x,S.p.y)||S.worldV!==12){S.p.x=CX;S.p.y=CY+40;S.waveZ=[];zombies=zombies.filter(z=>!z.wave);S.worldV=12}\n  P.x=S.p.x;P.y=S.p.y;if(S.p.hp<=0)")
rep("return {v:11,rested:0,","return {v:12,worldV:12,rested:0,")
rep("  st.v=11;\n","  st.v=12;\n")
open(p,'w').write(s);print('ok')
