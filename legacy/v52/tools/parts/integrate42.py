s=open('snapshots/lumber-camp-v41.html').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)
P=lambda n:open('tools/parts/'+n).read()

# облики мобов
rep("function drawZombie(z){",P('mobfig.js')+"\nfunction drawZombie(z){")
# новый рядовой мертвец: картинка-человечек вместо круга
a=s.index("  ctx.fillStyle=z.hit>0?'#f0e6d0':(z.kind?ZTYPES[z.kind].col:c.col);ctx.beginPath();ctx.arc(z.x,z.y+bob,z.r,0,7);ctx.fill();")
b=s.index("  if(z.sun){",a)
s=s[:a]+"""  const fd=zDir(z),sp=zSprite(z,fd,z.hit>0),zs=z.r/12;
  if(sp)ctx.drawImage(sp,z.x-32*zs,z.y+bob-34*zs,64*zs,60*zs);else if(ctx.roundRect)MOB.fig(ctx,z.kind,z.tier,z.biome,z.x,z.y+bob,zs,fd);
"""+s[b:]
# тень рисует сама фигура
rep("""  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(z.x+2,z.y+z.r*0.8,z.r*0.9,z.r*0.4,0,0,7);ctx.fill();
  if(z.burn>0)""","""  if(z.burn>0)""")
rep("if(z.sun){const t=(performance.now()/700+z.ph)%1;ctx.fillStyle=`rgba(180,175,160,${0.35*(1-t)})`;ctx.beginPath();ctx.arc(z.x+Math.sin(z.ph)*3,z.y-z.r-t*16,3+t*5,0,7);ctx.fill()}",
    "if(z.sun){const t=(performance.now()/700+z.ph)%1;ctx.fillStyle=`rgba(180,175,160,${0.35*(1-t)})`;ctx.beginPath();ctx.arc(z.x+Math.sin(z.ph)*3,z.y-z.r*1.7-t*16,3+t*5,0,7);ctx.fill()}")
rep("if(z.wave){ctx.strokeStyle='rgba(207,75,63,.6)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(z.x,z.y+bob,z.r+3,0,7);ctx.stroke()}",
    "if(z.wave){ctx.strokeStyle='rgba(207,75,63,.6)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(z.x,z.y+z.r*1.04,z.r*0.95,z.r*0.34,0,0,7);ctx.stroke()}")
rep("if(z.hp<z.max){ctx.fillStyle='#000';ctx.fillRect(z.x-14,z.y-z.r-9,28,4);ctx.fillStyle='#cf4b3f';ctx.fillRect(z.x-14,z.y-z.r-9,28*z.hp/z.max,4)}\n}",
    "if(z.hp<z.max){const hy=z.y-z.r*1.75-6;ctx.fillStyle='#000';ctx.fillRect(z.x-14,hy,28,4);ctx.fillStyle='#cf4b3f';ctx.fillRect(z.x-14,hy,28*z.hp/z.max,4)}\n}\n"
    "// куда смотрит мертвец: по движению, иначе на героя\nfunction zDir(z){const dx=z.x-(z._lx??z.x);z._lx=z.x;if(Math.abs(dx)>0.15)z.fd=dx<0?-1:1;if(!z.fd)z.fd=P.x<z.x?-1:1;return z.fd}")
# слизнячок
a=s.index("  if(z.skin==='slimelet'){ctx.fillStyle=z.hit>0?");b=s.index("\n",a)
s=s[:a]+"  if(z.skin==='slimelet'){drawBossFig(z,bob);if(z.hp<z.max){ctx.fillStyle='#000';ctx.fillRect(z.x-12,z.y-z.r-10,24,3);ctx.fillStyle='#cf4b3f';ctx.fillRect(z.x-12,z.y-z.r-10,24*z.hp/z.max,3)}return}"+s[b:]
# боссы
a=s.index("function drawBoss(z,bob){");b=s.index("/* ================= ОТРИСОВКА: склепы, портал, подземелье ================= */",a)
s=s[:a]+"""function drawBoss(z,bob){
  const x=z.x,y=z.y+bob,r=z.r;
  if(z.skin==='dragon'){const fy=z.fly?34+Math.sin(performance.now()/333)*4:0;if(z.fly){ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x,y+r*0.6,r*1.4,r*0.45,0,0,7);ctx.fill()}
    drawBossFig(z,bob-fy);ctx.font='600 11px Rubik, sans-serif';ctx.textAlign='center';ctx.fillStyle=z.fly?'#9fc3d6':'#f4c766';ctx.fillText(z.fly?'в воздухе — только лук':'на земле — только топор',x,y+r+16);return}
  drawBossFig(z,bob);
}
// босс в новом облике: смотрит на героя, вспыхивает при ударе
function drawBossFig(z,bob){
  const sk=MOB.has(z.skin)?z.skin:null,dir=P.x<z.x?-1:1,t=performance.now()/1000+(z.ph||0);
  if(!sk){const zs=z.r/12;MOB.fig(ctx,z.kind,z.tier,z.biome,z.x,z.y+bob,zs,dir);return}
  const s=bossScale(z);ctx.save();ctx.translate(z.x,z.y+bob);ctx.scale(s*dir,s);ctx.lineJoin='round';ctx.lineCap='round';
  if(z.hit>0&&'filter' in ctx)ctx.filter='brightness(1.8)';
  MOB.boss(ctx,sk,t);ctx.restore();
}

"""+s[b:]
# подпись имени босса над новой фигурой
rep("const ny=z.y-z.r-(z.fly?52:18)-(z.skin==='treant'||z.skin==='lich'||z.skin==='lord'?z.r*0.6:0);",
    "const ny=z.y-(BOSS_TOP[z.skin]||30)*bossScale(z)-(z.fly?38:0)-12;")

# доступ для снимков
rep("patches:()=>patches,onIce,makeZombie,RX,DST};","patches:()=>patches,onIce,makeZombie,RX,DST,drawZombie,makeBoss,ZSPR};")
open('src/lumber-camp.html','w').write(s)
print('ok')
