import re
s=open('snapshots/lumber-camp-v43.html').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90]);s=s.replace(a,b)

# 1. вспышка босса без тяжёлого фильтра
rep("  if(z.hit>0&&'filter' in ctx)ctx.filter='brightness(1.8)';\n  MOB.boss(ctx,sk,t);ctx.restore();",
    "  MOB.boss(ctx,sk,t);\n  if(z.hit>0){const top=BOSS_TOP[sk]||30;ctx.globalAlpha=0.38;ctx.fillStyle='#fff8e8';ctx.beginPath();ctx.ellipse(0,(18-top)/2,26,(top+18)/2,0,0,7);ctx.fill();ctx.globalAlpha=1}\n  ctx.restore();")
# 2. арена больше
rep("const ARENA_R = 170;   // радиус арены босса","const ARENA_R = 250;   // радиус арены босса")
# 3. мир дорожает с каждым переселением
rep("const ngMul = () => 1 + 0.25*((S.meta&&S.meta.ng)||0);",
"""// сложность миров после переселения: враги, цены, доход жителей и хуторов, сколько нечисти надо перебить в зоне
const NG = {enemy:0.5, cost:0.4, income:0.15, kills:0.5};
const ngN = () => (S.meta&&S.meta.ng)||0;
const ngMul = () => 1 + NG.enemy*ngN();
const costMul = () => 1 + NG.cost*ngN();
const incMul = () => Math.max(0.5, 1 - NG.income*ngN());
const zCnt = z => Math.round(z.zcount*(1+NG.kills*ngN()));""")
rep("const disc = c => {const k=1-0.05*pr('thrift');","const disc = c => {const k=(1-0.05*pr('thrift'))*costMul();")
n=s.count("(1+0.1*pr('boss'))");assert n==6,n
s=s.replace("(1+0.1*pr('boss'))","(1+0.1*pr('boss'))*incMul()")
# сколько нечисти перебить: все места, кроме самого описания зон
before=s.count('.zcount')
s=re.sub(r"\b(zn|z)\.zcount\b",r"zCnt(\1)",s)
s=s.replace("const zCnt = z => Math.round(zCnt(z)*","const zCnt = z => Math.round(z.zcount*")
assert s.count('.zcount')==1,(before,s.count('.zcount'))
# текст на экране победы
rep("враги сильнее на 25%","враги сильнее и постройки дороже")
rep("peasants:()=>peasants};","peasants:()=>peasants,lairs:()=>lairs};")
# арена не уходит в море, внутри нет валунов и чужих болот
rep("  trees=trees.filter(t=>lairs.every(l=>Math.abs(t.x-l.x)>ARENA_R*0.75||dist(t.x,t.y,l.x,l.y)>ARENA_R*0.75));\n  decorateArenas();",
"""  for(const l of lairs){const minD=CFG.fenceR+ARENA_R+80;for(let k=0;k<30;k++){let sea=0;for(let i=0;i<16;i++){const a=i/16*6.283;if(isSea(l.x+Math.cos(a)*(ARENA_R+30),l.y+Math.sin(a)*(ARENA_R+30)))sea++}
    const d=dist(l.x,l.y,CX,CY);if(!sea||d-40<minD)break;l.x+=(CX-l.x)/d*40;l.y+=(CY-l.y)/d*40}}
  const inArena=(x,y,pad)=>lairs.some(l=>Math.abs(x-l.x)<ARENA_R+pad&&dist(x,y,l.x,l.y)<ARENA_R*0.8+pad);
  rocks=rocks.filter(r=>!inArena(r.x,r.y,0));patches=patches.filter(p=>!(p.kind==='rocks'||p.kind==='cliff'||p.kind==='spore'||p.kind==='drift'||p.kind==='ice'||p.kind==='swamp')||!inArena(p.x,p.y,p.r*0.5)||lairs.some(l=>dist(p.x,p.y,l.x,l.y)<8));
  trees=trees.filter(t=>lairs.every(l=>Math.abs(t.x-l.x)>ARENA_R*0.75||dist(t.x,t.y,l.x,l.y)>ARENA_R*0.75));
  decorateArenas();""")
# старые сохранения: уже очищенные зоны остаются очищенными
rep("towers:[0,0,0,0,0,0],def:","towers:[0,0,0,0,0,0],zFix44:1,def:")
rep("  st.cls=src&&CLASSES[src.cls]?src.cls:null;","  st.cls=src&&CLASSES[src.cls]?src.cls:null;\n  if(src&&!src.zFix44){for(const z of CFG.zones){const k=st.killed[z.id]||0;if(k>=z.zcount)st.killed[z.id]=Math.max(k,Math.round(z.zcount*(1+NG.kills*((st.meta&&st.meta.ng)||0))))}}st.zFix44=1;")
open('src/lumber-camp.html','w').write(s)
print('ok')
