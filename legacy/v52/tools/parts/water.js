// --- водоёмы: у каждого края свой вид (v41)
const WATER={
  z1:{n:'лесное озерцо',  sh:'#7a9a5a',w:'#4f8aa0',dp:'rgba(30,70,100,.6)', mm:'#4f8aa0',deco:'lily'},
  z2:{n:'торфяная топь',  sh:'#4a6a3a',w:'#5a4026',dp:'rgba(40,25,10,.6)',  mm:'#6a4a2a',deco:'moss'},
  z3:{n:'заросший пруд',  sh:'#7a6a3a',w:'#3e6a3a',dp:'rgba(20,50,20,.5)',  mm:'#4a7a3a',deco:'duck'},
  z4:{n:'гнилая топь',    sh:'#3a3240',w:'#26302a',dp:'rgba(10,20,10,.7)',  mm:'#2e3c32',deco:'snag',anim:'bub',bc:'160,200,150'},
  z5:{n:'трясина',        sh:'#2a2e3a',w:'#14181e',dp:'rgba(0,0,0,.6)',     mm:'#1a1e26',deco:'none',anim:'fog'},
  z6:{n:'серный источник',sh:'#8a7a5a',w:'#c9b040',dp:'rgba(150,120,20,.5)',mm:'#c9b040',deco:'sulf',anim:'steam'},
  z7:{n:'ядовитая лужа',  sh:'#4a5a54',w:'#5ac040',dp:'rgba(40,140,30,.5)', mm:'#5ac040',deco:'bone',anim:'bub',bc:'200,255,150'},
  marsh:{n:'тина',        sh:'#4a6a44',w:'#3a5a40',dp:'rgba(20,40,20,.5)',  mm:'#3a6a48',deco:'tuss'},
  mist:{n:'чёрная вода',  sh:'#3a4a4c',w:'#141e22',dp:'rgba(0,0,0,.5)',     mm:'#22343a',deco:'none',anim:'wisp'},
  shroom:{n:'лужа спор',  sh:'#5a3a6a',w:'#7a4aa0',dp:'rgba(200,140,255,.5)',mm:'#9a5ac0',deco:'mush',anim:'spark'},
  ice:{n:'замёрзшее озеро',sh:'#f6faff',w:'#a8d4ee',dp:'rgba(80,150,200,.25)',mm:'#bfe4f8',deco:'crack',anim:'glint'}
};
const waterOf=p=>WATER[p.wt]||WATER.z1;
function assignWater(){for(const p of patches){if(p.kind==='ice'){p.wt='ice';continue}if(p.kind!=='swamp')continue;const sd=sideAt(p.x,p.y);p.wt=sd&&WATER[sd.id]?sd.id:'z'+Math.min(7,Math.max(1,p.zone||1))}}
// отдельный генератор: озёра льда в Снежном крае и лужи спор в Грибном лесу (старые карты не сдвигаются)
function genWater(spots){
  const rng=mulberry(((S.seed||4242)*11+29)|0),free=(x,y,r)=>spots.every(s=>dist(s.x,s.y,x,y)>s.r+r+20)&&lairs.every(l=>dist(l.x,l.y,x,y)>ARENA_R+r)&&dist(x,y,CX,CY)>CFG.fenceR+r+120;
  WG.sides.forEach((sd,si)=>{const n=sd.id==='snow'?Math.max(2,Math.round(3*WG.sideArea[si]/1e6)):sd.id==='shroom'?Math.max(2,Math.round(3*WG.sideArea[si]/1e6)):0;
    for(let i=0;i<n;i++){const r=sd.id==='snow'?75+rng()*45:45+rng()*30,p=randInZone(0,rng,r+30,{onlySide:si,ok:(x,y)=>free(x,y,r)});if(!p)continue;
      patches.push({kind:sd.id==='snow'?'ice':'swamp',x:p.x,y:p.y,r,zone:(()=>{const k=gIdx(p.x,p.y);return k<0?1:Math.max(1,WG.zone[k])})(),seed:rng(),gen:41});spots.push({x:p.x,y:p.y,r});
      trees=trees.filter(t=>Math.abs(t.x-p.x)>r+20||dist(t.x,t.y,p.x,p.y)>r+20);rocks=rocks.filter(o=>Math.abs(o.x-p.x)>r+20||dist(o.x,o.y,p.x,p.y)>r+20)}});
  assignWater();
}
const onIce=(x,y)=>{for(const p of patches){if(p.kind!=='ice'||Math.abs(p.x-x)>p.r)continue;const dx=(x-p.x)/p.r,dy=(y-p.y)/(p.r*0.72);if(dx*dx+dy*dy<0.8)return true}return false};
// форма: неровное пятно
function waterBlob(c,p,rx,ry){const k=14,pts=[];for(let i=0;i<k;i++){const a=i/k*6.283,q=0.84+((Math.sin(p.seed*97+i*2.3)+1)/2)*0.22;pts.push([Math.cos(a)*rx*q,Math.sin(a)*ry*q])}
  c.beginPath();pts.forEach((q,i)=>{const n=pts[(i+1)%k],mx=(q[0]+n[0])/2,my=(q[1]+n[1])/2;i?c.quadraticCurveTo(q[0],q[1],mx,my):c.moveTo(mx,my)});c.closePath()}
function waterStatic(p){
  const W=waterOf(p),r=p.r,ry=p.kind==='ice'?r*0.72:r*0.8,pad=30,sz=Math.ceil(r*2+pad*2),cv=document.createElement('canvas');cv.width=sz;cv.height=Math.ceil(ry*2+pad*2);
  const c=cv.getContext&&cv.getContext('2d');if(!c||!c.quadraticCurveTo)return null;const rng=mulberry(Math.floor(p.seed*1e6)+7);c.translate(sz/2,cv.height/2);c.lineCap='round';
  const R=r*0.92,RY=ry*0.92;
  c.save();c.translate(4,5);waterBlob(c,p,R+7,RY+6);c.fillStyle='rgba(0,0,0,.22)';c.fill();c.restore();
  waterBlob(c,p,R+7,RY+6);c.fillStyle=W.sh;c.fill();
  waterBlob(c,p,R,RY);c.fillStyle=W.w;c.fill();
  c.save();waterBlob(c,p,R,RY);c.clip();
  const g=c.createRadialGradient(0,0,2,0,0,Math.max(R,RY));g.addColorStop(0,W.dp);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(-R,-RY,R*2,RY*2);
  const rnd=(a,b)=>a+rng()*(b-a),inP=()=>{const a=rng()*6.283,q=Math.sqrt(rng())*0.8;return [Math.cos(a)*R*q,Math.sin(a)*RY*q]};
  const d=W.deco;
  if(d==='lily')for(let i=0;i<Math.round(r/14);i++){const [x,y]=inP();c.fillStyle='#5a9a3a';c.beginPath();c.arc(x,y,6,0.4,6.1);c.lineTo(x,y);c.fill();if(i%2){c.fillStyle='#fff';c.beginPath();c.arc(x+2,y-2,2.3,0,7);c.fill();c.fillStyle='#f4d35e';c.beginPath();c.arc(x+2,y-2,0.9,0,7);c.fill()}}
  if(d==='moss'){for(let i=0;i<Math.round(r/10);i++){const [x,y]=inP();c.fillStyle='rgba(106,138,58,.85)';c.beginPath();c.ellipse(x,y,rnd(5,11),4,rng()*3,0,7);c.fill()}c.strokeStyle='#8a6a3a';c.lineWidth=1;for(let i=0;i<r/4;i++){const [x,y]=inP();c.beginPath();c.moveTo(x,y);c.lineTo(x+4,y+1);c.stroke()}}
  if(d==='duck'){for(let i=0;i<r*0.7;i++){const [x,y]=inP();c.fillStyle=`rgba(140,200,80,${0.5+rng()*0.4})`;c.beginPath();c.arc(x,y,rnd(1.3,3),0,7);c.fill()}for(let i=0;i<r/10;i++){const [x,y]=inP();c.fillStyle=['#c9822e','#a8642a','#d8a040'][i%3];c.beginPath();c.ellipse(x,y,4,2.5,rng()*6,0,7);c.fill()}}
  if(d==='snag'){c.strokeStyle='#2a2028';c.lineWidth=5;for(let i=0;i<2;i++){const [x,y]=inP();c.beginPath();c.moveTo(x-20,y+6);c.lineTo(x+10,y-4);c.lineTo(x+24,y+3);c.stroke()}}
  if(d==='sulf'){c.fillStyle='rgba(255,240,150,.4)';c.beginPath();c.ellipse(-R*0.1,-RY*0.1,R*0.4,RY*0.2,0,0,7);c.fill()}
  if(d==='tuss')for(let i=0;i<Math.round(r/8);i++){const [x,y]=inP();c.fillStyle='#5d8a48';c.beginPath();c.ellipse(x,y,7,4.5,0,0,7);c.fill();c.strokeStyle='#7aa65a';c.lineWidth=1.2;c.beginPath();c.moveTo(x-2,y);c.lineTo(x-3,y-6);c.moveTo(x+2,y);c.lineTo(x+3,y-5);c.stroke()}
  if(d==='mush')for(let i=0;i<r/3;i++){const [x,y]=inP();c.fillStyle=`rgba(230,180,255,${0.35+rng()*0.4})`;c.beginPath();c.arc(x,y,1.4,0,7);c.fill()}
  if(d==='crack'){c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=1.3;for(let i=0;i<Math.round(r/18);i++){let [x,y]=inP();c.beginPath();c.moveTo(x,y);for(let k=0;k<4;k++){x+=(rng()-0.5)*40;y+=(rng()-0.5)*24;c.lineTo(x,y)}c.stroke()}c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.ellipse(-R*0.25,-RY*0.25,R*0.35,RY*0.1,-0.2,0,7);c.fill()}
  else{c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.ellipse(-R*0.3,-RY*0.35,R*0.25,RY*0.07,-0.15,0,7);c.fill()}
  c.restore();
  // берег
  const edge=()=>{const a=rng()*6.283;return [Math.cos(a)*(R+2)*rnd(0.95,1.05),Math.sin(a)*(RY+2)*rnd(0.95,1.05)]};
  if(d==='lily'||d==='tuss'){c.strokeStyle=d==='lily'?'#8a8a50':'#6d8a4a';c.lineWidth=1.6;for(let i=0;i<Math.round(r/9);i++){const [x,y]=edge();for(let k=0;k<3;k++){c.beginPath();c.moveTo(x+k*3,y);c.lineTo(x+k*3+(rng()-0.5)*5,y-9-rng()*6);c.stroke()}if(i%3===0){c.fillStyle='#6b5233';c.fillRect(x+2,y-15,3,5)}}}
  if(d==='bone')for(let i=0;i<Math.round(r/10);i++){const [x,y]=edge();c.save();c.translate(x,y);c.rotate(rng()*3);c.fillStyle='#e0d8c4';c.fillRect(-5,-1.2,10,2.6);c.beginPath();c.arc(-5,0,2.3,0,7);c.arc(5,0,2.3,0,7);c.fill();c.restore()}
  if(d==='mush')for(let i=0;i<Math.round(r/12);i++){const [x,y]=edge();c.fillStyle='#d8cfc0';c.fillRect(x-1,y,2,5);c.fillStyle='#b05aa0';c.beginPath();c.arc(x,y,5,Math.PI,0);c.fill();c.fillStyle='rgba(255,255,255,.6)';c.fillRect(x-2,y-3,1.5,1.5)}
  if(d==='sulf'){c.fillStyle='#e0d050';for(let i=0;i<r/6;i++){const [x,y]=edge();c.fillRect(x,y,3,3)}}
  if(d==='crack'){c.fillStyle='#ffffff';for(let i=0;i<r/7;i++){const [x,y]=edge();c.beginPath();c.arc(x,y,rnd(3,7),0,7);c.fill()}}
  return cv;
}
function drawWater(p,now){
  if(p._cv===undefined)p._cv=waterStatic(p);
  const W=waterOf(p),ry=p.kind==='ice'?p.r*0.72:p.r*0.8,t=now/1000;
  if(p._cv)ctx.drawImage(p._cv,p.x-p._cv.width/2,p.y-p._cv.height/2);
  else{ctx.fillStyle=W.w;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*0.9,ry*0.9,0,0,7);ctx.fill()}
  const a=W.anim,s=p.seed*50;
  if(!a){ctx.strokeStyle='rgba(220,240,240,.16)';ctx.lineWidth=1.3;for(let k=0;k<3;k++){const q=((t/2.6+k/3+p.seed)%1);ctx.globalAlpha=1-q;ctx.beginPath();ctx.ellipse(p.x+Math.cos(k*2.1+s)*p.r*0.3,p.y+Math.sin(k*2.1+s)*ry*0.3,4+q*16,2+q*8,0,0,7);ctx.stroke()}ctx.globalAlpha=1;return}
  if(a==='bub'){ctx.strokeStyle=`rgba(${W.bc},.7)`;ctx.lineWidth=1.2;for(let k=0;k<5;k++){const q=((t*0.6+k*0.37+p.seed)%1),x=p.x+Math.cos(k*1.7+s)*p.r*0.45,y=p.y+Math.sin(k*2.3+s)*ry*0.4;ctx.globalAlpha=1-q;ctx.beginPath();ctx.arc(x,y,1.5+q*4,0,7);ctx.stroke()}ctx.globalAlpha=1}
  if(a==='fog')for(let k=0;k<3;k++){const x=p.x+Math.sin(t*0.2+k*2+s)*p.r*0.3;ctx.fillStyle='rgba(180,190,210,.1)';ctx.beginPath();ctx.ellipse(x,p.y+(k-1)*ry*0.35,p.r*0.5,p.r*0.12,0,0,7);ctx.fill()}
  if(a==='steam')for(let k=0;k<4;k++){const q=((t*0.3+k/4+p.seed)%1);ctx.fillStyle=`rgba(235,235,225,${0.28*(1-q)})`;ctx.beginPath();ctx.arc(p.x+Math.cos(k*1.9+s)*p.r*0.3,p.y-q*40+Math.sin(k*2.7+s)*ry*0.25,10+q*14,0,7);ctx.fill()}
  if(a==='wisp')for(let k=0;k<4;k++){const x=p.x+Math.cos(t*0.5+k*1.6+s)*p.r*0.45,y=p.y+Math.sin(t*0.7+k*2.1+s)*ry*0.4-4,g=ctx.createRadialGradient(x,y,1,x,y,10);g.addColorStop(0,'rgba(180,255,220,.85)');g.addColorStop(1,'rgba(180,255,220,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,10,0,7);ctx.fill()}
  if(a==='spark')for(let k=0;k<8;k++){const q=0.5+0.5*Math.sin(t*2+k*1.3+s);ctx.fillStyle=`rgba(240,200,255,${0.3+0.6*q})`;ctx.fillRect(p.x+Math.cos(k*0.8+s)*p.r*0.55*((k*37%10)/10),p.y+Math.sin(k*0.8+s)*ry*0.55*((k*53%10)/10)-q*3,2,2)}
  if(a==='glint'){const q=(t*0.25+p.seed)%1,x=p.x-p.r*0.7+q*p.r*1.4;ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(x,p.y-ry*0.15,6,ry*0.5,0.5,0,7);ctx.fill()}
}
