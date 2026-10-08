s=open('snapshots/lumber-camp-v44.html').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)
# 1. Молот Громовержца: облетает до 4 врагов, которые гонятся за героем
rep("desc:r=>`Бросок молота вперёд: крутится, пробивает всех на пути и возвращается в руку. Урон ×${r>1?4:2.5} от удара`}",
    "desc:r=>`Молот сам летит в тех, кто за вами гонится: облетает до ${HAMMER.n} врагов, бьёт каждого и всех на пути, потом возвращается в руку. Урон ×${r>1?3:2} от удара`}")
rep("  if(k==='hammer'){const a=P.face;RX.hammers.push({x:P.x,y:P.y,vx:Math.cos(a)*560,vy:Math.sin(a)*560,t:0.7,back:false,hit:new Set(),rot:0,d:relDmg(r>1?4:2.5)});sfx.dash()}",
    "  if(k==='hammer'){const tg=hammerTargets(),a=tg.length?Math.atan2(tg[0].y-P.y,tg[0].x-P.x):P.face;RX.hammers.push({x:P.x,y:P.y,vx:Math.cos(a)*560,vy:Math.sin(a)*560,t:0.7,life:HAMMER.life,tg,back:false,hit:new Set(),rot:0,d:relDmg(r>1?3:2)});sfx.dash()}")
rep("""    if(!h.back){h.t-=dt;h.x+=h.vx*dt;h.y+=h.vy*dt;if(h.t<=0){h.back=true;h.hit.clear()}}""",
"""    h.life=(h.life??HAMMER.life)-dt;if(h.life<=0&&!h.back){h.back=true;h.hit.clear()}
    if(!h.back&&h.tg&&h.tg.length){while(h.tg.length&&!zombies.includes(h.tg[0]))h.tg.shift();
      if(!h.tg.length){h.back=true;h.hit.clear()}
      else{const z=h.tg[0],d=dist(h.x,h.y,z.x,z.y)||1;h.x+=(z.x-h.x)/d*Math.min(d,HAMMER.speed*dt);h.y+=(z.y-h.y)/d*Math.min(d,HAMMER.speed*dt);if(d<z.r+16){if(!h.hit.has(z)&&canHit(z,'ranged')){h.hit.add(z);dmgNum(z.x,z.y-z.r-4,h.d,false);burst(z.x,z.y,6,['#7ec8ff','#ffffff'],160,0.3,2);shake(1.5,0.06);hitZombie(z,h.d,h.x,h.y,'ranged')}h.tg.shift();if(!h.tg.length){h.back=true}}}}
    else if(!h.back){h.t-=dt;h.x+=h.vx*dt;h.y+=h.vy*dt;if(h.t<=0){h.back=true;h.hit.clear()}}""")
rep("function updRelics(dt){","""// цели молота: враги, которые гонятся за героем (ближние первыми); если таких нет — ближайшие рядом
const HAMMER={n:4,range:450,speed:640,life:3};
function aggroOn(z){const d=dist(z.x,z.y,P.x,P.y);if(d>HAMMER.range)return false;if(z.boss)return !!z.engaged;if(z.guard||z.wave||z.dun!=null||z.final)return true;return !!z.chasing&&!z.ret&&z.canChase!==false}
function hammerTargets(){const by=a=>a.filter(z=>canHit(z,'ranged')).sort((a,b)=>dist(a.x,a.y,P.x,P.y)-dist(b.x,b.y,P.x,P.y)).slice(0,HAMMER.n);
  const ag=by(zombies.filter(aggroOn));if(ag.length)return ag;return by(zombies.filter(z=>dist(z.x,z.y,P.x,P.y)<HAMMER.range*0.8))}
function updRelics(dt){""")
# 2. погоня мертвецов шире
rep("const LEASH = 300;","const LEASH = 450;")
rep("(pz===hz||dist(P.x,P.y,z.hx,z.hy)<220)","(pz===hz||dist(P.x,P.y,z.hx,z.hy)<330)")
rep("drawZombie,makeBoss,ZSPR,BLD,pois:()=>pois,mounds:()=>mounds,peasants:()=>peasants,lairs:()=>lairs};","drawZombie,makeBoss,ZSPR,BLD,pois:()=>pois,mounds:()=>mounds,peasants:()=>peasants,lairs:()=>lairs,useRelic,hammerTargets};")
open('src/lumber-camp.html','w').write(s)
print('ok')
